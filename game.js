class EconomicGame {
    constructor() {
        this.resources = {
            gold: 100,
            wheat: 0,
            food: 10,
            wood: 0,
            stone: 0,
            iron: 0,
            coal: 0,
            fur: 0,
            processedFur: 0  // Новый ресурс - обработанная шкура
        };

        this.foodConsumption = {
            wheat: 0.5,
            wood: 0.6,
            stone: 0.7,
            iron: 0.8,
            coal: 0.9,
            hunting: -0.1  // Negative because it produces food
        };

        this.marketStats = {
            totalWheatSold: 0,
            wheatPriceMultiplier: 1
        };

        this.marketRates = {
            wheat: 0.1,   
            wood: 0.2,    
            stone: 5,   
            iron: 10,
            coal: 15,     
            fur: 0.3,        
            processedFur: 15  
        };

        this.wheatPriceThresholds = [
            { threshold: 1000, multiplier: 0.2 },
            { threshold: 5000, multiplier: 0.1 },
            { threshold: 10000, multiplier: 0.05 }
        ];

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
        
        // Market selling buttons
        document.getElementById('sellWheatBtn').addEventListener('click', () => this.sellResource('wheat'));
        document.getElementById('sellWoodBtn').addEventListener('click', () => this.sellResource('wood'));
        document.getElementById('sellStoneBtn').addEventListener('click', () => this.sellResource('stone'));
        document.getElementById('sellIronBtn').addEventListener('click', () => this.sellResource('iron'));
        document.getElementById('sellCoalBtn').addEventListener('click', () => this.sellResource('coal'));
        document.getElementById('sellFurBtn').addEventListener('click', () => this.sellRawFur());
        document.getElementById('sellProcessedFurBtn').addEventListener('click', () => this.sellProcessedFur());

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

        document.getElementById('processFurBtn').addEventListener('click', () => this.processFurManually());
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
        if (this.resources.gold >= hireCost) {
            this.resources.gold -= hireCost;
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
        if (this.labor.available > 0 && this.resources.wheat >= 0.2) {
            this.labor.available--;
            this.resources.wheat -= 0.2;
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
        if (this.labor.available > 0 && this.resources.wood >= 0.5 && this.resources.wheat >= 1) {
            this.labor.available--;
            this.resources.wood -= 0.5;
            this.resources.wheat -= 1;
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
        if (this.labor.available > 0 && this.resources.wood >= 0.3 && this.resources.stone >= 0.5) {
            const ironMineId = this.ironMines.length + 1;
            
            // Consume resources and labor
            this.resources.wood -= 0.3;
            this.resources.stone -= 0.5;
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
            this.resources.wood >= 0.4 && 
            this.resources.stone >= 0.6 && 
            this.resources.iron >= 0.2) {
            
            const coalMineId = this.coalMines.length + 1;
            
            // Consume resources and labor
            this.resources.wood -= 0.4;
            this.resources.stone -= 0.6;
            this.resources.iron -= 0.2;
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

    buyUpgrade(upgradeType, level) {
        const upgrade = this.upgrades[upgradeType];
        
        // Проверяем, можно ли купить прокачку
        if (level > upgrade.level + 1) {
            console.log('Сначала купите предыдущие уровни');
            return;
        }

        const cost = upgrade.costs[level - 1];
        
        // Проверяем достаточно ли пшена
        if (this.resources.wheat < cost) {
            console.log('Недостаточно пшена для покупки');
            return;
        }

        // Списываем пшено
        this.resources.wheat -= cost;

        // Обновляем уровень прокачки
        upgrade.level = level;

        // Применяем эффекты прокачки
        switch(level) {
            case 1:
                upgrade.foodReductionMultiplier = 0.9;  // 10% меньше еды
                break;
            case 2:
                upgrade.productionMultiplier = 1.05;  // +5% к производству
                break;
            case 3:
                upgrade.foodReductionMultiplier = 0.85;  // 15% меньше еды
                break;
            case 4:
                upgrade.productionMultiplier = 1.1;  // +10% к производству
                break;
            case 5:
                upgrade.foodReductionMultiplier = 0.8;  // 20% меньше еды
                upgrade.productionMultiplier = 1.15;  // +15% к производству
                break;
        }

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
                btn.disabled = this.resources.wheat < laborUpgrade.costs[i - 1];
            } else {
                btn.disabled = true;
            }
        }
    }

    startResourceGeneration() {
        setInterval(() => {
            const upgrade = this.upgrades.laborEfficiency;
            
            // Модифицируем потребление еды с учетом прокачек
            let totalFoodConsumption = 0;
            let totalFoodProduction = 0;

            // Охота
            this.hunters.forEach(() => {
                totalFoodProduction -= this.foodConsumption.hunting;
            });

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

            // Обновляем ресурсы с учетом прокачек
            this.resources.food += totalFoodProduction - totalFoodConsumption;

            this.generateWheatResources();
            this.generateWoodResources();
            this.generateStoneResources();
            this.generateIronResources();
            this.generateCoalResources();
            this.generateFurResources();
            this.processFur();

            this.updateDisplay();
            this.checkFoodDepletion();
            this.updateUpgradeButtonStates();
            this.updateResourceDisplay();
        }, 1000);
    }

    generateWheatResources() {
        const upgrade = this.upgrades.laborEfficiency;
        this.wheatFields.forEach(field => {
            this.resources.wheat += field.wheatPerSecond * upgrade.productionMultiplier;
        });
    }

    generateWoodResources() {
        this.woodcutters.forEach(woodcutter => {
            if (this.resources.wheat >= woodcutter.wheatCost) {
                this.resources.wheat -= woodcutter.wheatCost;
                this.resources.wood += woodcutter.woodPerSecond;
            }
        });
    }

    generateStoneResources() {
        this.stoneQuarries.forEach(quarry => {
            if (this.resources.wood >= quarry.woodCost && this.resources.wheat >= quarry.wheatCost) {
                this.resources.wood -= quarry.woodCost;
                this.resources.wheat -= quarry.wheatCost;
                this.resources.stone += quarry.stonePerSecond;
            }
        });
    }

    generateIronResources() {
        this.ironMines.forEach(mine => {
            this.resources.iron += mine.productivity;
        });
    }

    generateCoalResources() {
        this.coalMines.forEach(mine => {
            this.resources.coal += mine.productivity;
        });
    }

    generateFurResources() {
        this.hunters.forEach(hunter => {
            if (Math.random() < 0.02) {
                this.resources.fur += 1;
            }
        });
    }

    processFur() {
        console.log('processFur called');
        console.log('Fur:', this.resources.fur);
        console.log('Wood:', this.resources.wood);

        // Требуется 1 дерево для обработки 1 шкуры
        if (this.resources.fur > 0 && this.resources.wood >= 1) {
            console.log('Processing fur');
            this.resources.fur -= 1;
            this.resources.wood -= 1;
            this.resources.processedFur += 1;
            
            this.updateDisplay();
        } else {
            console.log('Cannot process fur: not enough resources');
        }
    }

    processFurManually() {
        console.log('processFurManually called');
        if (this.resources.fur > 0 && this.resources.wood >= 1) {
            this.resources.fur -= 1;
            this.resources.wood -= 1;
            this.resources.processedFur += 1;
            
            this.updateDisplay();
        }
    }

    sellResource(resourceType) {
        const amount = this.resources[resourceType];
        if (amount > 0) {
            let rate = this.marketRates[resourceType];
            let goldEarned = 0;

            if (resourceType === 'wheat') {
                // Update total wheat sold and adjust price
                this.marketStats.totalWheatSold += amount;
                this.updateWheatPrice();
                rate = this.marketRates.wheat;
            }

            goldEarned = amount * rate;
            
            // Sell all of the resource
            this.resources[resourceType] = 0;
            this.resources.gold += goldEarned;
            
            // Notification with dynamic pricing info
            let priceInfo = resourceType === 'wheat' 
                ? ` (текущий курс: ${(1/rate).toFixed(2)} пшена = 1 золото)` 
                : '';
            
            alert(`Продано ${amount.toFixed(2)} ${this.getResourceName(resourceType)} по курсу ${rate.toFixed(4)} золота за единицу. Получено ${goldEarned.toFixed(2)} золота${priceInfo}`);
            
            this.updateDisplay();
        } else {
            alert(`Нет ${this.getResourceName(resourceType)} для продажи`);
        }
    }

    sellRawFur() {
        const furToSell = Math.floor(this.resources.fur);
        if (furToSell > 0) {
            const furPrice = this.marketRates.fur;
            const goldEarned = furToSell * furPrice;
            
            this.resources.gold += goldEarned;
            this.resources.fur -= furToSell;
            
            this.updateDisplay();
        }
    }

    sellProcessedFur() {
        const processedFurToSell = Math.floor(this.resources.processedFur);
        if (processedFurToSell > 0) {
            const processedFurPrice = this.marketRates.processedFur;
            const goldEarned = processedFurToSell * processedFurPrice;
            
            this.resources.gold += goldEarned;
            this.resources.processedFur -= processedFurToSell;
            
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
            processedFur: 'обработанной шкуры'
        };
        return resourceNames[resourceType] || resourceType;
    }

    updateWheatPrice() {
        // Reset price multiplier
        this.marketRates.wheat = 0.1;  // Base rate

        // Apply price reduction based on total wheat sold
        for (let threshold of this.wheatPriceThresholds) {
            if (this.marketStats.totalWheatSold >= threshold.threshold) {
                this.marketRates.wheat *= threshold.multiplier;
            }
        }

        // Ensure the price doesn't go below a minimum threshold
        this.marketRates.wheat = Math.max(this.marketRates.wheat, 0.01);
    }

    updateDisplay() {
        // Update global stats
        document.getElementById('goldAmount').textContent = this.resources.gold.toFixed(1);
        document.getElementById('foodAmount').textContent = this.resources.food.toFixed(1);

        // Resource amounts
        document.getElementById('wheatAmount').textContent = this.resources.wheat.toFixed(1);
        document.getElementById('woodAmount').textContent = this.resources.wood.toFixed(1);
        document.getElementById('stoneAmount').textContent = this.resources.stone.toFixed(1);
        document.getElementById('ironAmount').textContent = this.resources.iron.toFixed(1);
        document.getElementById('coalAmount').textContent = this.resources.coal.toFixed(1);
        document.getElementById('furAmount').textContent = this.resources.fur.toFixed(1);
        document.getElementById('processedFurAmount').textContent = this.resources.processedFur.toFixed(1);

        // Labor display
        document.getElementById('availableLaborCount').textContent = this.labor.available;

        // Selling amounts
        document.getElementById('sellWheatAmount').textContent = this.resources.wheat.toFixed(1);
        document.getElementById('sellWoodAmount').textContent = this.resources.wood.toFixed(1);
        document.getElementById('sellStoneAmount').textContent = this.resources.stone.toFixed(1);
        document.getElementById('sellIronAmount').textContent = this.resources.iron.toFixed(1);
        document.getElementById('sellCoalAmount').textContent = this.resources.coal.toFixed(1);
        document.getElementById('sellFurAmount').textContent = this.resources.fur.toFixed(1);
        document.getElementById('sellProcessedFurAmount').textContent = this.resources.processedFur.toFixed(1);
        
        // Per-unit prices
        document.getElementById('wheatPricePerUnit').textContent = this.marketRates.wheat.toFixed(2);
        document.getElementById('woodPricePerUnit').textContent = this.marketRates.wood.toFixed(2);
        document.getElementById('stonePricePerUnit').textContent = this.marketRates.stone.toFixed(2);
        document.getElementById('ironPricePerUnit').textContent = this.marketRates.iron.toFixed(2);
        document.getElementById('coalPricePerUnit').textContent = this.marketRates.coal.toFixed(2);
        document.getElementById('furPricePerUnit').textContent = this.marketRates.fur.toFixed(2);
        document.getElementById('processedFurPricePerUnit').textContent = this.marketRates.processedFur.toFixed(2);

        // Update market rates (if these elements exist)
        const wheatRateElement = document.getElementById('wheatRateDescription');
        if (wheatRateElement) {
            const wheatPerGold = (1 / this.marketRates.wheat).toFixed(2);
            wheatRateElement.textContent = `${wheatPerGold} пшена = 1 золото`;
        }

        // Обновляем состояние кнопок прокачек
        this.updateUpgradeButtonStates();
    }

    checkFoodDepletion() {
        if (this.resources.food <= 0) {
            this.resources.food = 0;
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
    }

    updateResourceDisplay() {
        // Обновляем основные ресурсы
        const resources = [
            'gold', 'wheat', 'food', 'wood', 
            'stone', 'iron', 'coal', 'fur', 'processedFur'
        ];

        resources.forEach(resource => {
            const amountElement = document.getElementById(`${resource}Amount`);
            const changeElement = document.getElementById(`${resource}Change`);

            if (amountElement && changeElement) {
                const currentAmount = this.resources[resource];
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
        this.previousResources = {...this.resources};
    }
}

const game = new EconomicGame();
