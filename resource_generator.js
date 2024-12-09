const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ResourceGenerator {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        this.gameJsPath = path.join(__dirname, 'game.js');
        this.indexHtmlPath = path.join(__dirname, 'index.html');
    }

    prompt(question) {
        return new Promise((resolve) => {
            this.rl.question(question, (answer) => {
                resolve(answer);
            });
        });
    }

    async generateResourceConfig() {
        console.log("🚀 Помощник по добавлению нового ресурса в экономическую игру 🚀");
        
        const resourceNameInput = await this.prompt("Какой новый ресурс вы хотите создать? ");
        const resourceName = resourceNameInput.toLowerCase();
        const resourceNameCapitalized = resourceName.charAt(0).toUpperCase() + resourceName.slice(1);
        
        const resourceType = await this.prompt(`Ресурс ${resourceName} похож на:
1. Сырой ресурс (как шкурка)
2. Обрабатываемый ресурс (как пшено)
Выберите тип (1/2): `);

        const initialAmount = await this.prompt("Начальное количество ресурса: ");
        const isMarketable = await this.prompt("Можно продавать ресурс? (да/нет): ") === 'да';
        const marketRate = isMarketable ? await this.prompt("Курс обмена на золото: ") : '0';

        const requiredResources = [];
        let addMoreResources = true;
        while (addMoreResources) {
            const resourceReq = await this.prompt("Какие ресурсы нужны для создания? (например, 1 еда, 1 пшено) ");
            requiredResources.push(resourceReq);
            addMoreResources = await this.prompt("Добавить еще ресурсы? (да/нет): ") === 'да';
        }

        const resourceConfig = {
            name: resourceName,
            nameCapitalized: resourceNameCapitalized,
            type: resourceType === '1' ? 'raw' : 'processed',
            initialAmount: parseFloat(initialAmount),
            isMarketable: isMarketable,
            marketRate: parseFloat(marketRate),
            requiredResources: requiredResources
        };

        console.log("\n🎉 Конфигурация ресурса:");
        console.log(JSON.stringify(resourceConfig, null, 2));

        const confirm = await this.prompt("Всё верно? (да/нет): ");
        
        this.rl.close();

        if (confirm.toLowerCase() === 'да') {
            await this.modifyGameJs(resourceConfig);
            await this.modifyIndexHtml(resourceConfig);
            console.log("\n✅ Ресурс успешно добавлен в игру!");
        } else {
            console.log("Процесс отменен.");
        }
    }

    async modifyGameJs(config) {
        // Read the current game.js
        let gameJsContent = fs.readFileSync(this.gameJsPath, 'utf8');

        // Modify ResourceManager configuration
        const resourceConfigTemplate = `
        ${config.name}: { 
            initialAmount: ${config.initialAmount}, 
            isMarketable: ${config.isMarketable},
            marketRate: ${config.marketRate}${config.type === 'processed' ? `,
            rawVersion: '${config.name}Raw'` : ''}
        },`;
        
        // Insert resource config into resourceConfigs
        gameJsContent = gameJsContent.replace(
            /this\.resourceConfigs = {([^}]+)}/,
            (match, p1) => `this.resourceConfigs = {${p1}${resourceConfigTemplate}}`
        );

        // Add mines array to EconomicGame constructor
        gameJsContent = gameJsContent.replace(
            /this\.silverMines = \[];/,
            `this.silverMines = [];
        this.${config.name}Mines = [];`
        );

        // Add create method
        const createMethodTemplate = `
    create${config.nameCapitalized}Mine() {
        if (this.labor.available > 0 ${config.requiredResources.map(res => {
            const [amount, resourceType] = res.split(' ');
            return `&& this.resourceManager.canAfford('${resourceType}', ${amount})`;
        }).join('')}) {
            this.labor.available--;
            ${config.requiredResources.map(res => {
                const [amount, resourceType] = res.split(' ');
                return `this.resourceManager.modifyResourceAmount('${resourceType}', -${amount});`;
            }).join('\n            ')}
            
            const ${config.name}Mine = {
                id: this.${config.name}Mines.length,
                active: true,
                ${config.name}PerSecond: 0.2,
                ${config.requiredResources.map(res => {
                    const [amount, resourceType] = res.split(' ');
                    return `${resourceType}Cost: ${amount}`;
                }).join(',\n                ')}
            };
            
            this.${config.name}Mines.push(${config.name}Mine);
            this.updateDisplay();
        } else {
            alert('Недостаточно ресурсов или рабочих для создания ${config.name} шахты!');
        }
    }`;

        // Insert create method before the last method in the class
        gameJsContent = gameJsContent.replace(
            /(\n\s*\w+\(\) {[^}]+})\n\}\n*$/,
            `$1\n\n${createMethodTemplate}\n}\n`
        );

        // Add resource generation method
        const generateMethodTemplate = `
    generate${config.nameCapitalized}Resources() {
        this.${config.name}Mines.forEach(mine => {
            if (mine.active) {
                this.resourceManager.modifyResourceAmount('${config.name}', mine.${config.name}PerSecond);
            }
        });
    }`;

        // Insert generate method into generateResources method
        gameJsContent = gameJsContent.replace(
            /generateResources\(\) {([^}]+)}/,
            (match, p1) => `generateResources() {${p1}
        this.generate${config.nameCapitalized}Resources();}`
        );

        // Add event listener
        const eventListenerTemplate = `
        document.getElementById('create${config.nameCapitalized}MineBtn').addEventListener('click', 
            () => this.create${config.nameCapitalized}Mine());

        ${config.isMarketable ? `document.getElementById('sell${config.nameCapitalized}Btn').addEventListener('click', 
            () => this.sellResource('${config.name}'));` : ''}`;

        // Insert event listener into initializeEventListeners method
        gameJsContent = gameJsContent.replace(
            /initializeEventListeners\(\) {([^}]+)}/,
            (match, p1) => `initializeEventListeners() {${p1}
        ${eventListenerTemplate}}`
        );

        // Add updateDisplay method modification
        const updateDisplayTemplate = `
    document.getElementById('${config.name}Amount').textContent = 
        this.resourceManager.getResourceAmount('${config.name}').toFixed(1);

    ${config.isMarketable ? `document.getElementById('${config.name}PricePerUnit').textContent = 
        this.resourceManager.resourceConfigs['${config.name}'].marketRate.toFixed(2);` : ''}`;

        // Insert updateDisplay method modification
        gameJsContent = gameJsContent.replace(
            /updateDisplay\(\) {([^}]+)}/,
            (match, p1) => `updateDisplay() {${p1}
        ${updateDisplayTemplate}}`
        );

        // Write modified game.js
        fs.writeFileSync(this.gameJsPath, gameJsContent);
        console.log("✅ Обновлен game.js");
    }

    async modifyIndexHtml(config) {
        // Read the current index.html
        let indexHtmlContent = fs.readFileSync(this.indexHtmlPath, 'utf8');

        // Add resource block before the last div in the resource block section
        const resourceBlockTemplate = `
                <div class="resource-block">
                    <img src="${config.name}-icon.png" alt="${config.nameCapitalized}">
                    <span id="${config.name}Amount">0</span>
                    ${config.isMarketable ? `<span id="${config.name}PricePerUnit">0.00</span>
                    <button id="sell${config.nameCapitalized}Btn">Продать ${config.name}</button>` : ''}
                </div>`;

        // Add create mine button
        const createMineButtonTemplate = `
                <button id="create${config.nameCapitalized}MineBtn">Создать ${config.name} шахту</button>`;

        // Insert resource block
        indexHtmlContent = indexHtmlContent.replace(
            /(<div class="resource-block">[^]*<\/div>)\s*(<\/div>)/,
            `$1${resourceBlockTemplate}$2`
        );

        // Insert create mine button
        indexHtmlContent = indexHtmlContent.replace(
            /(<button id="createCoalMineBtn">[^]*<\/button>)\s*(<\/div>)/,
            `$1${createMineButtonTemplate}$2`
        );

        // Write modified index.html
        fs.writeFileSync(this.indexHtmlPath, indexHtmlContent);
        console.log("✅ Обновлен index.html");
    }
}

const generator = new ResourceGenerator();
generator.generateResourceConfig();
