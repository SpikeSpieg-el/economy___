class EconomicGame {
    constructor() {
        this.resourceManager = new ResourceManager();
        this.foodConsumption = {
            wheat: 0.5,
            wood: 0.6,
            stone: 0.7,
            iron: 0.8,
            coal: 0.9,
            hunting: -0.1,  // Negative because it produces food
            silver: 1,
            gold: 1
        };

        this.labor = {
            available: 1,
            waiting: 0
        };

        this.wheatFields = [];
        this.woodcutters = [];
        this.stoneQuarries = [];
        this.hunters = [];
        this.ironMines = [];
        this.coalMines = [];
        this.silverMines = [];
        this.goldMines = [];

        this.upgrades = {
            laborEfficiency: {
                level: 0,
                foodReductionMultiplier: 1,
                productionMultiplier: 1,
                costs: [20, 40, 60, 80, 100]  // Стоимость каждого уровня в пшене
            }
        };

        this.previousResources = {};

        this.initializeEventListeners();
        this.initializeUpgradeTabs();
        this.startResourceGeneration();
    }

    initializeEventListeners() {
        document.getElementById('hireLaborBtn').addEventListener('click', () => this.hireLaborForce());
        document.getElementById('createWheatFieldBtn').addEventListener('click', () => this.createWheatField());
        document.getElementById('createWoodcutterBtn').addEventListener('click', () => this.createWoodcutter());
        document.getElementById('createStoneQuarryBtn').addEventListener('click', () => this.createStoneQuarry());
        document.getElementById('createHunterBtn').addEventListener('click', () => this.createHunter());
        document.getElementById('createIronMineBtn').addEventListener('click', () => this.createIronMine());
        document.getElementById('createCoalMineBtn').addEventListener('click', () => this.createCoalMine());
        
        document.getElementById('createSilverMineBtn').addEventListener('click', () => this.createSilverMine());
        
        // Market selling buttons
        document.getElementById('sellWheatBtn').addEventListener('click', () => this.sellResource('wheat'));
        document.getElementById('sellWoodBtn').addEventListener('click', () => this.sellResource('wood'));
        document.getElementById('sellStoneBtn').addEventListener('click', () => this.sellResource('stone'));
        document.getElementById('sellIronBtn').addEventListener('click', () => this.sellResource('iron'));
        document.getElementById('sellCoalBtn').addEventListener('click', () => this.sellResource('coal'));
        document.getElementById('sellFurBtn').addEventListener('click', () => this.sellRawFur());
        document.getElementById('sellProcessedFurBtn').addEventListener('click', () => this.sellProcessedFur());

        document.getElementById('sellSilverBtn').addEventListener('click', () => this.sellResource('silver'));

        // Add production panel toggle listener
        const toggleProductionBtn = document.getElementById('toggleProductionBtn');
        const productionContent = document.getElementById('productionContent');
        
        if (toggleProductionBtn && productionContent) {
            toggleProductionBtn.addEventListener('click', () => {
                toggleProductionBtn.classList.toggle('collapsed');
                productionContent.classList.toggle('collapsed');
                
                // Update toggle icon
                const toggleIcon = toggleProductionBtn.querySelector('.toggle-icon');
                toggleIcon.textContent = productionContent.classList.contains('collapsed') ? '▶' : '▼';
            });
        }

        // Обработчики прокачек рабочей силы
        document.getElementById('buyLaborEfficiency1Btn').addEventListener('click', () => this.buyUpgrade('laborEfficiency', 1));
        document.getElementById('buyLaborEfficiency2Btn').addEventListener('click', () => this.buyUpgrade('laborEfficiency', 2));
        document.getElementById('buyLaborEfficiency3Btn').addEventListener('click', () => this.buyUpgrade('laborEfficiency', 3));
        document.getElementById('buyLaborEfficiency4Btn').addEventListener('click', () => this.buyUpgrade('laborEfficiency', 4));
        document.getElementById('buyLaborEfficiency5Btn').addEventListener('click', () => this.buyUpgrade('laborEfficiency', 5));

        document.getElementById('processFurBtn').addEventListener('click', () => this.processFur());

        document.getElementById('createGoldMineBtn').addEventListener('click', () => this.createGoldMine());
    }

    initializeUpgradeTabs() {
        const tabs = document.querySelectorAll('.tab-button');
        const contents = document.querySelectorAll('.upgrade-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Убираем активный класс со всех вкладок и контента
                tabs.forEach(t => t.classList.remove('active'));
                contents.forEach(c => c.classList.remove('active'));

                // Добавляем активный класс выбранной вкладке и контенту
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });
    }

    hireLaborForce() {
        const hireCost = 10;
        if (this.resourceManager.canAfford('gold', hireCost)) {
            this.resourceManager.modifyResourceAmount('gold', -hireCost);
            this.labor.available++;
            this.updateDisplay();
        } else {
            alert('Недостаточно золота для найма трудовой силы!');
        }
    }

    createWheatField() {
        if (this.labor.available > 0) {
            this.labor.available--;
            const field = {
                id: this.wheatFields.length,
                active: true,
                wheatPerSecond: 0.1,
                seedsPerSecond: 1
            };
            this.wheatFields.push(field);
            this.updateWheatFieldDisplay();
            this.updateDisplay();
        } else {
            alert('Недостаточно трудовой силы для создания поля!');
        }
    }

    createWoodcutter() {
        if (this.labor.available > 0 && this.resourceManager.canAfford('wheat', 0.2)) {
            this.labor.available--;
            this.resourceManager.modifyResourceAmount('wheat', -0.2);
            const woodcutter = {
                id: this.woodcutters.length,
                active: true,
                woodPerSecond: 0.1,
                wheatCost: 0.2
            };
            this.woodcutters.push(woodcutter);
            this.updateWoodcutterDisplay();
            this.updateDisplay();
        } else {
            alert('Недостаточно трудовой силы или пшена для создания лесозаготовки!');
        }
    }

    createStoneQuarry() {
        if (this.labor.available > 0 && this.resourceManager.canAfford('wood', 0.5) && this.resourceManager.canAfford('wheat', 1)) {
            this.labor.available--;
            this.resourceManager.modifyResourceAmount('wood', -0.5);
            this.resourceManager.modifyResourceAmount('wheat', -1);
            const stoneQuarry = {
                id: this.stoneQuarries.length,
                active: true,
                stonePerSecond: 0.1,
                woodCost: 0.5,
                wheatCost: 1
            };
            this.stoneQuarries.push(stoneQuarry);
            this.updateStoneQuarryDisplay();
            this.updateDisplay();
        } else {
            alert('Недостаточно трудовой силы, дерева или пшена для создания каменоломни!');
        }
    }

    createHunter() {
        if (this.labor.available > 0) {
            this.labor.available--;
            const hunter = {
                id: this.hunters.length,
                active: true,
                foodPerSecond: 0.1
            };
            this.hunters.push(hunter);
            this.updateHunterDisplay();
            this.updateDisplay();
        } else {
            alert('Недостаточно трудовой силы для найма охотника!');
        }
    }

    createIronMine() {
        // Check if there are available labor and enough resources
        if (this.labor.available > 0 && this.resourceManager.canAfford('wood', 0.3) && this.resourceManager.canAfford('stone', 0.5)) {
            const ironMineId = this.ironMines.length + 1;
            
            // Consume resources and labor
            this.resourceManager.modifyResourceAmount('wood', -0.3);
            this.resourceManager.modifyResourceAmount('stone', -0.5);
            this.labor.available--;

            // Create iron mine
            this.ironMines.push({
                id: ironMineId,
                productivity: 0.1  // 0.1 iron per second
            });

            // Update displays
            this.updateIronMineDisplay();
            this.updateDisplay();
        }
    }

    createCoalMine() {
        // Check if there are available labor and enough resources
        if (this.labor.available > 0 && 
            this.resourceManager.canAfford('wood', 0.4) && 
            this.resourceManager.canAfford('stone', 0.6) && 
            this.resourceManager.canAfford('iron', 0.2)) {
            
            const coalMineId = this.coalMines.length + 1;
            
            // Consume resources and labor
            this.resourceManager.modifyResourceAmount('wood', -0.4);
            this.resourceManager.modifyResourceAmount('stone', -0.6);
            this.resourceManager.modifyResourceAmount('iron', -0.2);
            this.labor.available--;

            // Create coal mine
            this.coalMines.push({
                id: coalMineId,
                productivity: 0.1  // 0.1 coal per second
            });
            
            // Update displays
            this.updateCoalMineDisplay();
            this.updateDisplay();
        }
    }
    createSilverMine() {
                if (this.labor.available > 0 && 
                    this.resourceManager.canAfford('wood', 0.5) && 
                    this.resourceManager.canAfford('stone', 0.3)) {
                        const silverMineId = this.silverMines.length + 1;
                        
                        this.resourceManager.modifyResourceAmount('wood', -0.5);
                        this.resourceManager.modifyResourceAmount('stone', -0.3);
                        this.labor.available--;

                        this.silverMines.push({
                            id: silverMineId,
                            productivity: 0.1  // 0.1 silver per second
                        });
                        this.updateSilverMineDisplay();
                        this.updateDisplay();
                    } else {
                        alert('Недостаточно ресурсов или рабочих для создания серебряной шахты!');
                    }
        }

    
    updateSilverMineDisplay() {
        const container = document.getElementById('silverMineContainer');
        container.innerHTML = ''; 
        this.silverMines.forEach(mine => {
            const mineElement = document.createElement('div');
            mineElement.innerHTML = `
                Серебряная шахта #${mine.id} 
                <button onclick="game.removeSilverMine(${mine.id})">Закрыть</button>
            `;
            container.appendChild(mineElement);
        });
    }
    

    updateWheatFieldDisplay() {
        const container = document.getElementById('wheatFieldsContainer');
        container.innerHTML = '';
        this.wheatFields.forEach(field => {
            const fieldElement = document.createElement('div');
            fieldElement.innerHTML = `Поле #${field.id} 
                <button onclick="game.removeWheatField(${field.id})">Убрать</button>`;
            container.appendChild(fieldElement);
        });
    }

    updateWoodcutterDisplay() {
        const container = document.getElementById('woodcutterContainer');
        container.innerHTML = '';
        this.woodcutters.forEach(woodcutter => {
            const woodcutterElement = document.createElement('div');
            woodcutterElement.innerHTML = `Лесозаготовка #${woodcutter.id} 
                <button onclick="game.removeWoodcutter(${woodcutter.id})">Убрать</button>`;
            container.appendChild(woodcutterElement);
        });
    }

    updateStoneQuarryDisplay() {
        const container = document.getElementById('stoneQuarryContainer');
        container.innerHTML = '';
        this.stoneQuarries.forEach(quarry => {
            const quarryElement = document.createElement('div');
            quarryElement.innerHTML = `Каменоломня #${quarry.id} 
                <button onclick="game.removeStoneQuarry(${quarry.id})">Убрать</button>`;
            container.appendChild(quarryElement);
        });
    }

    updateHunterDisplay() {
        const container = document.getElementById('hunterContainer');
        container.innerHTML = '';
        this.hunters.forEach(hunter => {
            const hunterElement = document.createElement('div');
            hunterElement.innerHTML = `Охотник #${hunter.id} 
                <button onclick="game.removeHunter(${hunter.id})">Убрать</button>`;
            container.appendChild(hunterElement);
        });
    }

    updateIronMineDisplay() {
        const container = document.getElementById('ironMineContainer');
        container.innerHTML = ''; // Clear existing entries

        this.ironMines.forEach(mine => {
            const mineElement = document.createElement('div');
            mineElement.innerHTML = `
                Рудник #${mine.id} 
                <button onclick="game.removeIronMine(${mine.id})">Закрыть</button>
            `;
            container.appendChild(mineElement);
        });
    }

    updateCoalMineDisplay() {
        const container = document.getElementById('coalMineContainer');
        container.innerHTML = ''; // Clear existing entries

        this.coalMines.forEach(mine => {
            const mineElement = document.createElement('div');
            mineElement.innerHTML = `
                Угольная шахта #${mine.id} 
                <button onclick="game.removeCoalMine(${mine.id})">Закрыть</button>
            `;
            container.appendChild(mineElement);
        });
    }

    removeWheatField(fieldId) {
        const fieldIndex = this.wheatFields.findIndex(f => f.id === fieldId);
        if (fieldIndex !== -1) {
            this.wheatFields.splice(fieldIndex, 1);
            this.labor.available++;
            this.updateWheatFieldDisplay();
            this.updateDisplay();
        }
    }

    removeWoodcutter(woodcutterId) {
        const woodcutterIndex = this.woodcutters.findIndex(w => w.id === woodcutterId);
        if (woodcutterIndex !== -1) {
            this.woodcutters.splice(woodcutterIndex, 1);
            this.labor.available++;
            this.updateWoodcutterDisplay();
            this.updateDisplay();
        }
    }

    removeStoneQuarry(quarryId) {
        const quarryIndex = this.stoneQuarries.findIndex(q => q.id === quarryId);
        if (quarryIndex !== -1) {
            this.stoneQuarries.splice(quarryIndex, 1);
            this.labor.available++;
            this.updateStoneQuarryDisplay();
            this.updateDisplay();
        }
    }

    removeHunter(hunterId) {
        const hunterIndex = this.hunters.findIndex(h => h.id === hunterId);
        if (hunterIndex !== -1) {
            this.hunters.splice(hunterIndex, 1);
            this.labor.available++;
            this.updateHunterDisplay();
            this.updateDisplay();
        }
    }

    removeIronMine(mineId) {
        const index = this.ironMines.findIndex(mine => mine.id === mineId);
        if (index !== -1) {
            this.ironMines.splice(index, 1);
            this.labor.available++;
            this.updateIronMineDisplay();
            this.updateDisplay();
        }
    }

    removeCoalMine(mineId) {
        const index = this.coalMines.findIndex(mine => mine.id === mineId);
        if (index !== -1) {
            this.coalMines.splice(index, 1);
            this.labor.available++;
            this.updateCoalMineDisplay();
            this.updateDisplay();
        }
    }
    removeSilverMine(mineId) {
        const index = this.silverMines.findIndex(mine => mine.id === mineId);
        if (index !== -1) {
            this.silverMines.splice(index, 1);
            this.labor.available++;
            this.updateSilverMineDisplay();
            this.updateDisplay();
        }
    }

    buyUpgrade(upgradeType, level) {
        const upgrade = this.upgrades[upgradeType];
        
        // Проверяем, можно ли купить прокачку
        if (level > upgrade.level + 1) {
            console.log('Сначала купите предыдущие уровни');
            return;
        }

        const cost = upgrade.costs[level - 1];
        
        // Проверяем достаточно ли пшена
        if (!this.resourceManager.canAfford('wheat', cost)) {
            console.log('Недостаточно пшена для покупки');
            return;
        }

        // Списываем пшено
        this.resourceManager.modifyResourceAmount('wheat', -cost);

        // Обновляем уровень прокачки
        upgrade.level = level;

        // Применяем эффекты прокачки
        switch(level) {
            case 1:
                upgrade.foodReductionMultiplier = 0.65;  // 35% меньше еды
                break;
            case 2:
                upgrade.productionMultiplier *= 1.2;  // +20% к производству
                break;
            case 3:
                upgrade.productionMultiplier *= 1.5;  // +50% к производству
                break;
            case 4:
                upgrade.productionMultiplier *= 1.45;  // +45% к производству
                break;
            case 5:
                upgrade.foodReductionMultiplier = -0.8;  // Уменьшение потребления еды до -0.8 в сек
                upgrade.productionMultiplier *= 1.25;  // +25% к производству
                break;
        }
        console.log(`Уровень: ${level}, Множитель производства: ${upgrade.productionMultiplier}`);

        // Обновляем отображение
        this.updateDisplay();
        this.updateUpgradeButtonStates();
    }

    updateUpgradeButtonStates() {
        const laborUpgrade = this.upgrades.laborEfficiency;
        
        for (let i = 1; i <= 5; i++) {
            const btn = document.getElementById(`buyLaborEfficiency${i}Btn`);
            const item = document.getElementById(`laborEfficiency${i}`);
            
            if (laborUpgrade.level >= i) {
                btn.disabled = true;
                btn.textContent = 'Куплено';
                item.classList.add('purchased');
            } else if (laborUpgrade.level === i - 1) {
                btn.disabled = !this.resourceManager.canAfford('wheat', laborUpgrade.costs[i - 1]);
            } else {
                btn.disabled = true;
            }
        }
    }

    startResourceGeneration() {
        setInterval(() => {
            const upgrade = this.upgrades.laborEfficiency;
            let totalFoodConsumption = 0;
            let totalFoodProduction = 0;

            // Пшеничные поля
            this.wheatFields.forEach(() => {
                totalFoodConsumption += this.foodConsumption.wheat * upgrade.foodReductionMultiplier;
            });

            // Аналогично для других производств
            this.woodcutters.forEach(() => {
                totalFoodConsumption += this.foodConsumption.wood * upgrade.foodReductionMultiplier;
            });

            this.stoneQuarries.forEach(() => {
                totalFoodConsumption += this.foodConsumption.stone * upgrade.foodReductionMultiplier;
            });

            this.ironMines.forEach(() => {
                totalFoodConsumption += this.foodConsumption.iron * upgrade.foodReductionMultiplier;
            });

            this.coalMines.forEach(() => {
                totalFoodConsumption += this.foodConsumption.coal * upgrade.foodReductionMultiplier;
            });

            this.silverMines.forEach(() => {
                totalFoodConsumption += this.foodConsumption.silver * upgrade.foodReductionMultiplier;
            });

            this.goldMines.forEach(() => {
                totalFoodConsumption += this.foodConsumption.gold * upgrade.foodReductionMultiplier;
            });

            console.log(`Общее потребление еды: ${totalFoodConsumption}, Множитель уменьшения еды: ${upgrade.foodReductionMultiplier}`);

            // Обновляем ресурсы с учетом прокачек
            this.resourceManager.modifyResourceAmount('food', totalFoodProduction - totalFoodConsumption);

            // Охота
            this.hunters.forEach(() => {
                totalFoodProduction -= this.foodConsumption.hunting;
            });

            // Обновляем ресурсы с учетом прокачек
            this.resourceManager.modifyResourceAmount('food', totalFoodProduction - totalFoodConsumption);

            this.generateWheatResources();
            this.generateWoodResources();
            this.generateStoneResources();
            this.generateIronResources();
            this.generateCoalResources();
            this.generateFurResources();
            this.generateSilverResources();
            this.generateGoldResources();

            this.updateDisplay();
            this.checkFoodDepletion();
            this.updateUpgradeButtonStates();
            this.updateResourceDisplay();
        }, 1000);
    }

    generateWheatResources() {
        const upgrade = this.upgrades.laborEfficiency;
        this.wheatFields.forEach(field => {
            const production = field.wheatPerSecond * upgrade.productionMultiplier;
            console.log(`Рабочий #${field.id}: Производство = ${production}`);
            this.resourceManager.modifyResourceAmount('wheat', production);
        });
    }

    generateWoodResources() {
        const upgrade = this.upgrades.laborEfficiency;
        this.woodcutters.forEach(woodcutter => {
            if (this.resourceManager.canAfford('wheat', woodcutter.wheatCost)) {
                this.resourceManager.modifyResourceAmount('wheat', -woodcutter.wheatCost);
                this.resourceManager.modifyResourceAmount('wood', woodcutter.woodPerSecond * upgrade.productionMultiplier);
            }
        });
    }

    generateStoneResources() {
        const upgrade = this.upgrades.laborEfficiency;
        this.stoneQuarries.forEach(quarry => {
            if (this.resourceManager.canAfford('wood', quarry.woodCost) && this.resourceManager.canAfford('wheat', quarry.wheatCost)) {
                this.resourceManager.modifyResourceAmount('wood', -quarry.woodCost);
                this.resourceManager.modifyResourceAmount('wheat', -quarry.wheatCost);
                this.resourceManager.modifyResourceAmount('stone', quarry.stonePerSecond * upgrade.productionMultiplier);
            }
        });
    }

    generateIronResources() {
        const upgrade = this.upgrades.laborEfficiency;
        this.ironMines.forEach(mine => {
            const production = mine.productivity * upgrade.productionMultiplier;
            this.resourceManager.modifyResourceAmount('iron', production);
        });
    }

    generateCoalResources() {
        const upgrade = this.upgrades.laborEfficiency;
        this.coalMines.forEach(mine => {
            const production = mine.productivity * upgrade.productionMultiplier;
            this.resourceManager.modifyResourceAmount('coal', production);
        });
    }

    generateFurResources() {
        this.hunters.forEach(hunter => {
            if (Math.random() < 0.02) {
                this.resourceManager.modifyResourceAmount('fur', 1);
            }
        });
    }
    generateSilverResources() {
        const upgrade = this.upgrades.laborEfficiency;
        this.silverMines.forEach(mine => {
            const production = mine.productivity * upgrade.productionMultiplier;
            this.resourceManager.modifyResourceAmount('silver', production);
        });
    }
    

    processFur() {
        if (this.resourceManager.canAfford('fur', 1) && this.resourceManager.canAfford('wood', 1)) {
            this.resourceManager.modifyResourceAmount('fur', -1);
            this.resourceManager.modifyResourceAmount('wood', -1);
            this.resourceManager.modifyResourceAmount('processedFur', 1);
            console.log('Manually processed fur');
            this.updateResourceDisplay();
        } else {
            console.log('Cannot process fur: not enough resources');
            alert('Недостаточно шкур или дерева для обработки!');
        }
    }

    sellResource(resourceName) {
        const amount = this.resourceManager.getResourceAmount(resourceName);
        if (amount > 0) {
            const goldEarned = this.resourceManager.sellResource(resourceName, amount);
            
            // Notification with dynamic pricing info
            let priceInfo = resourceName === 'wheat' 
                ? ` (текущий курс: ${(1/this.resourceManager.resourceConfigs[resourceName].marketRate).toFixed(2)} ${resourceName} = 1 золото)` 
                : '';
            
            alert(`Продано ${amount.toFixed(2)} ${resourceName} по курсу ${this.resourceManager.resourceConfigs[resourceName].marketRate.toFixed(4)} золота за единицу. Получено ${goldEarned.toFixed(2)} золота${priceInfo}`);
            
            this.updateDisplay();
        } else {
            alert(`Нет ${resourceName} для продажи`);
        }
    }

    sellRawFur() {
        const furToSell = Math.floor(this.resourceManager.getResourceAmount('fur'));
        if (furToSell > 0) {
            const furPrice = this.resourceManager.resourceConfigs['fur'].marketRate;
            const goldEarned = furToSell * furPrice;
            
            this.resourceManager.modifyResourceAmount('gold', goldEarned);
            this.resourceManager.modifyResourceAmount('fur', -furToSell);
            
            this.updateDisplay();
        }
    }

    sellProcessedFur() {
        const processedFurToSell = Math.floor(this.resourceManager.getResourceAmount('processedFur'));
        if (processedFurToSell > 0) {
            const processedFurPrice = this.resourceManager.resourceConfigs['processedFur'].marketRate;
            const goldEarned = processedFurToSell * processedFurPrice;
            
            this.resourceManager.modifyResourceAmount('gold', goldEarned);
            this.resourceManager.modifyResourceAmount('processedFur', -processedFurToSell);
            
            this.updateDisplay();
        }
    }

    sellFur() {
        return;
    }

    getResourceName(resourceType) {
        const resourceNames = {
            wheat: 'пшена',
            wood: 'дерева',
            stone: 'камня',
            iron: 'железа',
            coal: 'угля',
            fur: 'шкуры',
            processedFur: 'обработанной шкуры',
            silver: 'серебра'
        };
        return resourceNames[resourceType] || resourceType;
    }

    updateWheatPrice() {
        // Reset price multiplier
        this.resourceManager.resourceConfigs['wheat'].marketRate = 0.1;  // Base rate

        // Apply price reduction based on total wheat sold
        for (let threshold of this.resourceManager.resourceConfigs['wheat'].priceThresholds) {
            if (this.resourceManager.totalResourcesSold['wheat'] >= threshold.threshold) {
                this.resourceManager.resourceConfigs['wheat'].marketRate *= threshold.multiplier;
            }
        }

        // Ensure the price doesn't go below a minimum threshold
        this.resourceManager.resourceConfigs['wheat'].marketRate = Math.max(this.resourceManager.resourceConfigs['wheat'].marketRate, 0.01);
    }

    updateDisplay() {
        // Update global stats
        document.getElementById('goldAmount').textContent = this.resourceManager.getResourceAmount('gold').toFixed(1);
        document.getElementById('foodAmount').textContent = this.resourceManager.getResourceAmount('food').toFixed(1);

        // Resource amounts
        document.getElementById('wheatAmount').textContent = this.resourceManager.getResourceAmount('wheat').toFixed(1);
        document.getElementById('woodAmount').textContent = this.resourceManager.getResourceAmount('wood').toFixed(1);
        document.getElementById('stoneAmount').textContent = this.resourceManager.getResourceAmount('stone').toFixed(1);
        document.getElementById('ironAmount').textContent = this.resourceManager.getResourceAmount('iron').toFixed(1);
        document.getElementById('coalAmount').textContent = this.resourceManager.getResourceAmount('coal').toFixed(1);
        document.getElementById('furAmount').textContent = this.resourceManager.getResourceAmount('fur').toFixed(1);
        document.getElementById('processedFurAmount').textContent = this.resourceManager.getResourceAmount('processedFur').toFixed(1);

        document.getElementById('silverAmount').textContent = this.resourceManager.getResourceAmount('silver').toFixed(1);
        document.getElementById('sellSilverAmount').textContent = this.resourceManager.getResourceAmount('silver').toFixed(1);
        document.getElementById('silverPricePerUnit').textContent = this.resourceManager.resourceConfigs['silver'].marketRate.toFixed(2);

        // Labor display
        document.getElementById('availableLaborCount').textContent = this.labor.available;

        // Selling amounts
        document.getElementById('sellWheatAmount').textContent = this.resourceManager.getResourceAmount('wheat').toFixed(1);
        document.getElementById('sellWoodAmount').textContent = this.resourceManager.getResourceAmount('wood').toFixed(1);
        document.getElementById('sellStoneAmount').textContent = this.resourceManager.getResourceAmount('stone').toFixed(1);
        document.getElementById('sellIronAmount').textContent = this.resourceManager.getResourceAmount('iron').toFixed(1);
        document.getElementById('sellCoalAmount').textContent = this.resourceManager.getResourceAmount('coal').toFixed(1);
        document.getElementById('sellFurAmount').textContent = this.resourceManager.getResourceAmount('fur').toFixed(1);
        document.getElementById('sellProcessedFurAmount').textContent = this.resourceManager.getResourceAmount('processedFur').toFixed(1);
        
        // Per-unit prices
        document.getElementById('wheatPricePerUnit').textContent = this.resourceManager.resourceConfigs['wheat'].marketRate.toFixed(2);
        document.getElementById('woodPricePerUnit').textContent = this.resourceManager.resourceConfigs['wood'].marketRate.toFixed(2);
        document.getElementById('stonePricePerUnit').textContent = this.resourceManager.resourceConfigs['stone'].marketRate.toFixed(2);
        document.getElementById('ironPricePerUnit').textContent = this.resourceManager.resourceConfigs['iron'].marketRate.toFixed(2);
        document.getElementById('coalPricePerUnit').textContent = this.resourceManager.resourceConfigs['coal'].marketRate.toFixed(2);
        document.getElementById('furPricePerUnit').textContent = this.resourceManager.resourceConfigs['fur'].marketRate.toFixed(2);
        document.getElementById('processedFurPricePerUnit').textContent = this.resourceManager.resourceConfigs['processedFur'].marketRate.toFixed(2);

        // Update market rates (if these elements exist)
        const wheatRateElement = document.getElementById('wheatRateDescription');
        if (wheatRateElement) {
            const wheatPerGold = (1 / this.resourceManager.resourceConfigs['wheat'].marketRate).toFixed(2);
            wheatRateElement.textContent = `${wheatPerGold} пшена = 1 золото`;
        }

        // Обновляем состояние кнопок прокачек
        this.updateUpgradeButtonStates();
    }

    checkFoodDepletion() {
        if (this.resourceManager.getResourceAmount('food') <= 0) {
            this.resourceManager.modifyResourceAmount('food', 0);
            this.sendWorkersToWaiting();
        }
    }

    sendWorkersToWaiting() {
        // Wheat fields
        while (this.wheatFields.length > 0) {
            this.removeWheatField(this.wheatFields[0].id);
        }

        // Woodcutters
        while (this.woodcutters.length > 0) {
            this.removeWoodcutter(this.woodcutters[0].id);
        }

        // Stone quarries
        while (this.stoneQuarries.length > 0) {
            this.removeStoneQuarry(this.stoneQuarries[0].id);
        }

        // Iron mines
        while (this.ironMines.length > 0) {
            this.removeIronMine(this.ironMines[0].id);
        }

        // Coal mines
        while (this.coalMines.length > 0) {
            this.removeCoalMine(this.coalMines[0].id);
        }
        // Silver mines
        while (this.silverMines.length > 0) {
            this.removeSilverMine(this.silverMines[0].id);
        }
    }

    updateResourceDisplay() {
        // Обновляем основные ресурсы
        const resources = [
            'gold', 'wheat', 'food', 'wood', 
            'stone', 'iron', 'coal', 'fur', 'processedFur', 'silver'
        ];

        resources.forEach(resource => {
            const amountElement = document.getElementById(`${resource}Amount`);
            const changeElement = document.getElementById(`${resource}Change`);

            if (amountElement && changeElement) {
                const currentAmount = this.resourceManager.getResourceAmount(resource);
                const previousAmount = this.previousResources[resource] || 0;
                const change = currentAmount - previousAmount;

                amountElement.textContent = Math.floor(currentAmount);
                
                if (change !== 0) {
                    changeElement.textContent = change > 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
                    changeElement.classList.remove('positive', 'negative');
                    changeElement.classList.add(change > 0 ? 'positive' : 'negative');
                } else {
                    changeElement.textContent = '';
                }
            }
        });

        // Сохраняем текущие значения для следующего сравнения
        this.previousResources = {};
        resources.forEach(resource => {
            this.previousResources[resource] = this.resourceManager.getResourceAmount(resource);
        });
    }

    createGoldMine() {
        if (this.labor.available > 0 && 
            this.resourceManager.canAfford('food', 2) && 
            this.resourceManager.canAfford('wood', 3) && 
            this.resourceManager.canAfford('coal', 5)) {
            
            const goldMineId = this.goldMines.length + 1;
            
            // Вычитаем ресурсы
            this.resourceManager.modifyResourceAmount('food', -2);
            this.resourceManager.modifyResourceAmount('wood', -3);
            this.resourceManager.modifyResourceAmount('coal', -5);
            this.labor.available--;

            // Создаем золотую шахту
            this.goldMines.push({
                id: goldMineId,
                productivity: 0.1  // 0.1 золота в секунду
            });

            // Обновляем интерфейс
            this.updateGoldMineDisplay();
            this.updateDisplay();
        } else {
            alert('Недостаточно ресурсов или рабочих для создания золотой шахты!');
        }
    }

    updateGoldMineDisplay() {
        const container = document.getElementById('goldMineContainer');
        container.innerHTML = ''; // Очистка существующих записей

        this.goldMines.forEach(mine => {
            const mineElement = document.createElement('div');
            mineElement.innerHTML = `
                Золотая шахта #${mine.id} 
                <button onclick="game.removeGoldMine(${mine.id})">Закрыть</button>
            `;
            container.appendChild(mineElement);
        });
    }

    removeGoldMine(mineId) {
        const index = this.goldMines.findIndex(mine => mine.id === mineId);
        if (index !== -1) {
            this.goldMines.splice(index, 1);
            this.labor.available++;
            this.updateGoldMineDisplay();
            this.updateDisplay();
        }
    }

    generateGoldResources() {
        const upgrade = this.upgrades.laborEfficiency;
        this.goldMines.forEach(mine => {
            // Проверяем, достаточно ли ресурсов для работы шахты
            if (this.resourceManager.canAfford('food', 2) && this.resourceManager.canAfford('wood', 3) && this.resourceManager.canAfford('coal', 5)) {
                // Вычитаем ресурсы
                this.resourceManager.modifyResourceAmount('food', -2);
                this.resourceManager.modifyResourceAmount('wood', -3);
                this.resourceManager.modifyResourceAmount('coal', -5);
                // Добавляем золото с учётом множителя
                const production = mine.productivity * upgrade.productionMultiplier;
                this.resourceManager.modifyResourceAmount('gold', production);
            } else {
                console.log('Недостаточно ресурсов для работы золотой шахты');
            }
        });
    }
}

class ResourceManager {
    constructor() {
        // Configuration for all resources
        this.resourceConfigs = {
            gold: { 
                initialAmount: 100, 
                isMarketable: true,
                marketRate: 1 
            },
            wheat: { 
                initialAmount: 11110, 
                isMarketable: true,
                marketRate: 0.1,
                priceThresholds: [
                    { threshold: 1000, multiplier: 0.2 },
                    { threshold: 5000, multiplier: 0.1 },
                    { threshold: 10000, multiplier: 0.05 }
                ]
            },
            wood: { 
                initialAmount: 0, 
                isMarketable: true,
                marketRate: 0.2 
            },
            stone: { 
                initialAmount: 0, 
                isMarketable: true,
                marketRate: 5 
            },
            iron: { 
                initialAmount: 0, 
                isMarketable: true,
                marketRate: 10 
            },
            coal: { 
                initialAmount: 0, 
                isMarketable: true,
                marketRate: 15 
            },
            fur: { 
                initialAmount: 0, 
                isMarketable: true,
                marketRate: 0.3,
                processedVersion: 'processedFur'
            },
            processedFur: { 
                initialAmount: 0, 
                isMarketable: true,
                marketRate: 15,
                rawVersion: 'fur'
            },
            food: { 
                initialAmount: 0, 
                isMarketable: false 
            },
            silver: { 
                initialAmount: 0, 
                isMarketable: true,
                marketRate: 20 
            }
        };

        // Dynamic resources tracking
        this.resources = {};
        this.totalResourcesSold = {};
        this.resourcePriceMultipliers = {};

        this.initializeResources();
    }

    initializeResources() {
        Object.keys(this.resourceConfigs).forEach(resourceName => {
            const config = this.resourceConfigs[resourceName];
            this.resources[resourceName] = config.initialAmount;
            this.totalResourcesSold[resourceName] = 0;
            this.resourcePriceMultipliers[resourceName] = 1;
        });
    }

    addResource(resourceName, config) {
        if (!this.resourceConfigs[resourceName]) {
            this.resourceConfigs[resourceName] = config;
            this.resources[resourceName] = config.initialAmount || 0;
            this.totalResourcesSold[resourceName] = 0;
            this.resourcePriceMultipliers[resourceName] = 1;
        }
    }

    getResourceAmount(resourceName) {
        return this.resources[resourceName] || 0;
    }

    modifyResourceAmount(resourceName, amount) {
        if (this.resources.hasOwnProperty(resourceName)) {
            this.resources[resourceName] += amount;
            return true;
        }
        return false;
    }

    canAfford(resourceName, amount) {
        return this.resources[resourceName] >= amount;
    }

    sellResource(resourceName, amount) {
        const config = this.resourceConfigs[resourceName];
        if (!config || !config.isMarketable) return 0;

        if (this.resources[resourceName] >= amount) {
            const priceMultiplier = this.calculatePriceMultiplier(resourceName, amount);
            const goldEarned = amount * config.marketRate * priceMultiplier;

            this.resources[resourceName] -= amount;
            this.resources['gold'] += goldEarned;
            this.totalResourcesSold[resourceName] += amount;

            return goldEarned;
        }
        return 0;
    }

    calculatePriceMultiplier(resourceName, amount) {
        const config = this.resourceConfigs[resourceName];
        if (config.priceThresholds) {
            const totalSold = this.totalResourcesSold[resourceName];
            const thresholds = config.priceThresholds;
            
            for (let threshold of thresholds) {
                if (totalSold >= threshold.threshold) {
                    return threshold.multiplier;
                }
            }
        }
        return 1;
    }

    processResource(rawResourceName, processedResourceName) {
        const rawConfig = this.resourceConfigs[rawResourceName];
        const processedConfig = this.resourceConfigs[processedResourceName];

        if (rawConfig && processedConfig && rawConfig.processedVersion === processedResourceName) {
            // Simple 1:1 processing for now, can be made more complex
            const processAmount = Math.min(this.resources[rawResourceName], 10);
            
            this.resources[rawResourceName] -= processAmount;
            this.resources[processedResourceName] += processAmount;

            return processAmount;
        }
        return 0;
    }
}

const game = new EconomicGame();
