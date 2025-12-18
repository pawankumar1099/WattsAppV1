/**
 * Household Usage Management Module
 * Handles household data display, device monitoring, and usage analytics
 */

class HouseholdManager {
    constructor() {
        this.selectedHousehold = 'all';
        this.currentChartPeriod = '24h';
        this.isInitialized = false;
    }

    /**
     * Initialize the household manager
     */
    initialize() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.setupChartFilters();
        this.initializeCharts();
        this.updateDisplay();
        this.isInitialized = true;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Household selector
        const householdSelector = document.getElementById('household-selector');
        if (householdSelector) {
            householdSelector.addEventListener('change', (e) => {
                this.selectedHousehold = e.target.value;
                this.updateDisplay();
            });
        }
    }

    /**
     * Setup chart filter buttons
     */
    setupChartFilters() {
        const filterButtons = document.querySelectorAll('#household-tab .filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const period = btn.getAttribute('data-period');
                this.currentChartPeriod = period;
                this.updateUsageHistoryChart();
                
                // Update active state
                filterButtons.forEach(f => f.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        if (window.chartManager) {
            window.chartManager.initializeDeviceChart();
            window.chartManager.initializeUsageHistoryChart();
        }
    }

    /**
     * Update all household displays
     */
    updateDisplay() {
        this.updateUsageOverview();
        this.updateHouseholdCards();
        this.updateDeviceChart();
        this.updateUsageHistoryChart();
    }

    /**
     * Update usage overview statistics
     */
    updateUsageOverview() {
        const householdData = window.energyDataManager.getHouseholdData();
        const households = this.getFilteredHouseholds(householdData.households);
        
        const totalHouseholds = households.length;
        const activeDevices = this.countActiveDevices(households);
        const currentUsage = this.getTotalUsage(households);

        // Update DOM elements
        const elements = {
            totalHouseholds: document.getElementById('total-households'),
            activeDevices: document.getElementById('active-devices'),
            currentUsage: document.getElementById('current-total-usage')
        };

        if (elements.totalHouseholds) {
            elements.totalHouseholds.textContent = totalHouseholds;
        }

        if (elements.activeDevices) {
            elements.activeDevices.textContent = activeDevices;
        }

        if (elements.currentUsage) {
            elements.currentUsage.textContent = `${currentUsage} kW`;
        }
    }

    /**
     * Update household cards
     */
    updateHouseholdCards() {
        const householdCards = document.getElementById('household-cards');
        if (!householdCards) return;

        const householdData = window.energyDataManager.getHouseholdData();
        const households = this.getFilteredHouseholds(householdData.households);

        if (households.length === 0) {
            householdCards.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-home" style="font-size: 48px; color: #888; margin-bottom: 15px;"></i>
                    <h3>No households found</h3>
                    <p>No households match the selected criteria.</p>
                </div>
            `;
            return;
        }

        const cardsHTML = households.map(household => this.createHouseholdCardHTML(household)).join('');
        householdCards.innerHTML = cardsHTML;

        // Add device toggle event listeners
        householdCards.querySelectorAll('.device-toggle').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const householdId = e.target.getAttribute('data-household');
                const deviceName = e.target.getAttribute('data-device');
                this.toggleDevice(householdId, deviceName, e.target);
            });
        });
    }

    /**
     * Create HTML for household card
     */
    createHouseholdCardHTML(household) {
        const devicesList = household.devices.map(device => `
            <div class="device-item">
                <div class="device-info">
                    <span class="device-name">${device.name}</span>
                    <span class="device-power">${device.power} kW</span>
                </div>
                <button class="device-toggle ${device.status}" 
                        data-household="${household.id}" 
                        data-device="${device.name}">
                    <i class="fas ${device.status === 'on' ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                </button>
            </div>
        `).join('');

        return `
            <div class="household-card">
                <div class="household-header">
                    <h4 class="household-name">${household.name}</h4>
                    <span class="household-status ${household.status.toLowerCase()}">${household.status}</span>
                </div>
                <div class="household-usage">${household.currentUsage} kW</div>
                <div class="device-list">
                    ${devicesList}
                </div>
            </div>
        `;
    }

    /**
     * Get filtered households based on selection
     */
    getFilteredHouseholds(households) {
        if (this.selectedHousehold === 'all') {
            return households;
        }
        return households.filter(h => h.id === this.selectedHousehold);
    }

    /**
     * Count active devices
     */
    countActiveDevices(households) {
        return households.reduce((total, household) => {
            return total + household.devices.filter(device => device.status === 'on').length;
        }, 0);
    }

    /**
     * Get total usage
     */
    getTotalUsage(households) {
        const total = households.reduce((sum, household) => sum + household.currentUsage, 0);
        return Math.round(total * 100) / 100;
    }

    /**
     * Toggle device status
     */
    toggleDevice(householdId, deviceName, button) {
        const success = window.energyDataManager.toggleDevice(householdId, deviceName);
        
        if (success) {
            // Update button appearance
            const isOn = button.classList.contains('on');
            if (isOn) {
                button.classList.remove('on');
                button.classList.add('off');
                button.innerHTML = '<i class="fas fa-toggle-off"></i>';
            } else {
                button.classList.remove('off');
                button.classList.add('on');
                button.innerHTML = '<i class="fas fa-toggle-on"></i>';
            }
            
            // Update displays
            setTimeout(() => {
                this.updateDisplay();
            }, 100);
        }
    }

    /**
     * Update device breakdown chart
     */
    updateDeviceChart() {
        if (window.chartManager) {
            window.chartManager.updateDeviceChart();
        }
    }

    /**
     * Update usage history chart
     */
    updateUsageHistoryChart() {
        if (window.chartManager) {
            window.chartManager.updateUsageHistoryChart(this.currentChartPeriod);
        }
    }

    /**
     * Export household data
     */
    exportData() {
        const householdData = window.energyDataManager.getHouseholdData();
        const dataStr = JSON.stringify(householdData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `household-data-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    /**
     * Get household statistics
     */
    getStatistics() {
        const householdData = window.energyDataManager.getHouseholdData();
        const households = householdData.households;
        
        const stats = {
            totalHouseholds: households.length,
            totalDevices: households.reduce((sum, h) => sum + h.devices.length, 0),
            activeDevices: this.countActiveDevices(households),
            totalUsage: this.getTotalUsage(households),
            averageUsagePerHousehold: this.getTotalUsage(households) / households.length,
            highestUsageHousehold: households.reduce((max, h) => 
                h.currentUsage > max.currentUsage ? h : max, households[0]),
            deviceTypes: this.getDeviceTypeStats(households)
        };
        
        return stats;
    }

    /**
     * Get device type statistics
     */
    getDeviceTypeStats(households) {
        const deviceStats = {};
        
        households.forEach(household => {
            household.devices.forEach(device => {
                if (!deviceStats[device.name]) {
                    deviceStats[device.name] = {
                        count: 0,
                        totalPower: 0,
                        activeCount: 0
                    };
                }
                
                deviceStats[device.name].count++;
                deviceStats[device.name].totalPower += device.power;
                if (device.status === 'on') {
                    deviceStats[device.name].activeCount++;
                }
            });
        });
        
        return deviceStats;
    }

    /**
     * Update from external data changes
     */
    update() {
        if (this.isInitialized) {
            this.updateDisplay();
        }
    }
}

// Create global instance
window.householdManager = new HouseholdManager();
