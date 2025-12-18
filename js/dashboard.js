/**
 * Enhanced Main Dashboard Module
 * Handles UI updates, navigation, real-time data display, and chart filtering
 */

class Dashboard {
    constructor() {
        this.updateInterval = null;
        this.updateFrequency = 5000; // Update every 5 seconds
        this.currentTab = 'dashboard';
        this.isInitialized = false;
        this.currentChartPeriod = '24h';
        
        this.init();
    }

    /**
     * Initialize the dashboard
     */
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initAfterDOM());
            } else {
                this.initAfterDOM();
            }
        } catch (error) {
            console.error('Dashboard initialization error:', error);
        }
    }

    /**
     * Initialize after DOM is ready
     */
    initAfterDOM() {
        this.setupNavigation();
        this.setupEventListeners();
        this.setupChartFilters();
        this.initializeCharts();
        this.startDataUpdates();
        this.updateLastUpdatedTime();
        this.isInitialized = true;
        
        console.log('Dashboard initialized successfully');
    }

    /**
     * Setup navigation between tabs
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const tabContents = document.querySelectorAll('.tab-content');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const tabName = item.getAttribute('data-tab');
                
                // Remove active class from all nav items
                navItems.forEach(nav => nav.classList.remove('active'));
                
                // Hide all tab contents
                tabContents.forEach(content => {
                    content.style.display = 'none';
                    content.classList.remove('active');
                });
                
                // Activate clicked nav item
                item.classList.add('active');
                
                // Show corresponding tab content
                const targetTab = document.getElementById(`${tabName}-tab`);
                if (targetTab) {
                    targetTab.style.display = 'block';
                    targetTab.classList.add('active');
                }
                
                this.currentTab = tabName;
                
                // Handle tab-specific initialization
                this.handleTabSwitch(tabName);
            });
        });
    }

    /**
     * Handle tab switching logic
     */
    handleTabSwitch(tabName) {
        switch (tabName) {
            case 'dashboard':
                if (this.isInitialized) {
                    setTimeout(() => {
                        window.chartManager.handleResize();
                    }, 100);
                }
                break;
            case 'household':
                if (window.householdManager) {
                    window.householdManager.initialize();
                }
                break;
            case 'reports':
                if (window.reportsManager) {
                    window.reportsManager.initialize();
                }
                break;
            case 'alerts':
                if (window.alertsManager) {
                    window.alertsManager.initialize();
                }
                break;
            case 'control':
                if (window.controlManager) {
                    window.controlManager.initialize();
                }
                break;
            case 'settings':
                if (window.settingsManager) {
                    window.settingsManager.initialize();
                }
                break;
            case 'help':
                if (window.helpManager) {
                    window.helpManager.initialize();
                }
                break;
        }
    }

    /**
     * Setup chart filter buttons
     */
    setupChartFilters() {
        // Dashboard chart filters
        const dashboardFilters = document.querySelectorAll('#dashboard-tab .filter-btn');
        dashboardFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                const period = btn.getAttribute('data-period');
                this.updateChartPeriod('generation', period);
                
                // Update active state
                dashboardFilters.forEach(f => f.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    /**
     * Update chart period
     */
    updateChartPeriod(chartType, period) {
        this.currentChartPeriod = period;
        if (window.chartManager) {
            window.chartManager.updateChartPeriod(chartType, period);
        }
    }

    /**
     * Setup additional event listeners
     */
    setupEventListeners() {
        // Handle window visibility change to pause/resume updates
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.pauseDataUpdates();
            } else {
                this.resumeDataUpdates();
            }
        });

        // Handle page unload to cleanup
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        if (window.chartManager) {
            window.chartManager.initializeGenerationChart();
        }
    }

    /**
     * Start real-time data updates
     */
    startDataUpdates() {
        // Initial update
        this.updateDashboard();
        
        // Set up interval for regular updates
        this.updateInterval = setInterval(() => {
            this.updateDashboard();
        }, this.updateFrequency);
    }

    /**
     * Pause data updates
     */
    pauseDataUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    /**
     * Resume data updates
     */
    resumeDataUpdates() {
        if (!this.updateInterval) {
            this.startDataUpdates();
        }
    }

    /**
     * Update dashboard with latest data
     */
    async updateDashboard() {
        try {
            // Generate new data
            window.energyDataManager.generateCurrentData();
            const currentData = window.energyDataManager.getCurrentData();
            
            // Update all UI components
            this.updateEnergyFlow(currentData);
            this.updateBatteryStatus(currentData.battery);
            this.updateGridStatus(currentData.grid);
            this.updateQuickSummary(currentData.dailySummary);
            this.updateLastUpdatedTime();
            this.updateAlertBadge();
            
            // Update charts
            if (window.chartManager) {
                window.chartManager.updateAllCharts();
            }
            
        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    /**
     * Update energy flow visualization
     */
    updateEnergyFlow(data) {
        const elements = {
            solar: document.getElementById('solar-output'),
            wind: document.getElementById('wind-output'),
            storage: document.getElementById('storage-level'),
            household: document.getElementById('household-consumption')
        };

        if (elements.solar) {
            elements.solar.textContent = `${data.generation.solar} kW`;
            this.animateUpdate(elements.solar);
        }
        
        if (elements.wind) {
            elements.wind.textContent = `${data.generation.wind} kW`;
            this.animateUpdate(elements.wind);
        }
        
        if (elements.storage) {
            elements.storage.textContent = `${data.battery.percentage}%`;
            this.animateUpdate(elements.storage);
        }
        
        if (elements.household) {
            elements.household.textContent = `${data.consumption.households} kW`;
            this.animateUpdate(elements.household);
        }
    }

    /**
     * Update battery status display
     */
    updateBatteryStatus(batteryData) {
        const elements = {
            percentage: document.getElementById('battery-percentage'),
            levelBar: document.getElementById('battery-level-bar'),
            health: document.getElementById('battery-health'),
            voltage: document.getElementById('battery-voltage'),
            temp: document.getElementById('battery-temp')
        };

        if (elements.percentage) {
            elements.percentage.textContent = `${batteryData.percentage}%`;
            this.animateUpdate(elements.percentage);
        }

        if (elements.levelBar) {
            elements.levelBar.style.height = `${batteryData.percentage}%`;
            
            // Update color based on level
            elements.levelBar.className = 'battery-level';
            if (batteryData.percentage <= 20) {
                elements.levelBar.classList.add('low');
            } else if (batteryData.percentage <= 50) {
                elements.levelBar.classList.add('medium');
            }
        }

        if (elements.health) {
            elements.health.textContent = batteryData.health;
            elements.health.className = `health-${batteryData.health.toLowerCase()}`;
            this.animateUpdate(elements.health);
        }

        if (elements.voltage) {
            elements.voltage.textContent = `${batteryData.voltage}V`;
            this.animateUpdate(elements.voltage);
        }

        if (elements.temp) {
            elements.temp.textContent = `${batteryData.temperature}°C`;
            this.animateUpdate(elements.temp);
        }
    }

    /**
     * Update grid status display
     */
    updateGridStatus(gridData) {
        const elements = {
            indicator: document.getElementById('grid-status-indicator'),
            statusText: document.getElementById('grid-status-text'),
            loadBar: document.getElementById('grid-load-bar'),
            loadPercentage: document.getElementById('grid-load-percentage')
        };

        if (elements.statusText) {
            elements.statusText.textContent = gridData.status;
            this.animateUpdate(elements.statusText);
        }

        if (elements.indicator) {
            const statusLight = elements.indicator.querySelector('.status-light');
            if (statusLight) {
                statusLight.className = 'status-light';
                if (gridData.status === 'ON') {
                    statusLight.classList.add('on');
                }
            }
        }

        if (elements.loadBar) {
            elements.loadBar.style.width = `${gridData.load}%`;
        }

        if (elements.loadPercentage) {
            elements.loadPercentage.textContent = `${gridData.load}%`;
            this.animateUpdate(elements.loadPercentage);
        }
    }

    /**
     * Update quick summary section
     */
    updateQuickSummary(summaryData) {
        const elements = {
            generated: document.getElementById('total-generated'),
            consumed: document.getElementById('total-consumed'),
            efficiency: document.getElementById('efficiency-percentage')
        };

        if (elements.generated) {
            elements.generated.textContent = `${summaryData.totalGenerated} kWh`;
            this.animateUpdate(elements.generated);
        }

        if (elements.consumed) {
            elements.consumed.textContent = `${summaryData.totalConsumed} kWh`;
            this.animateUpdate(elements.consumed);
        }

        if (elements.efficiency) {
            elements.efficiency.textContent = `${summaryData.efficiency}%`;
            this.animateUpdate(elements.efficiency);
        }
    }

    /**
     * Update alert badge
     */
    updateAlertBadge() {
        const badge = document.getElementById('alert-count');
        if (badge) {
            const alerts = window.energyDataManager.getAlertsData();
            const activeAlerts = alerts.filter(alert => !alert.dismissed);
            badge.textContent = activeAlerts.length;
            badge.style.display = activeAlerts.length > 0 ? 'block' : 'none';
        }
    }

    /**
     * Update last updated timestamp
     */
    updateLastUpdatedTime() {
        const element = document.getElementById('last-updated-time');
        if (element) {
            const now = new Date();
            element.textContent = now.toLocaleTimeString();
        }
    }

    /**
     * Add animation effect to updated elements
     */
    animateUpdate(element) {
        if (element) {
            element.classList.remove('animate-update');
            // Trigger reflow
            element.offsetHeight;
            element.classList.add('animate-update');
        }
    }

    /**
     * Clean up resources
     */
    cleanup() {
        this.pauseDataUpdates();
        if (window.chartManager) {
            window.chartManager.destroyAllCharts();
        }
    }

    /**
     * Change update frequency
     */
    setUpdateFrequency(frequency) {
        this.updateFrequency = frequency;
        if (this.updateInterval) {
            this.pauseDataUpdates();
            this.resumeDataUpdates();
        }
    }

    /**
     * Manual refresh
     */
    refresh() {
        this.updateDashboard();
    }

    /**
     * Get current status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            currentTab: this.currentTab,
            updateFrequency: this.updateFrequency,
            isUpdating: !!this.updateInterval,
            currentChartPeriod: this.currentChartPeriod
        };
    }
}

// Initialize dashboard when page loads
window.addEventListener('load', () => {
    window.dashboard = new Dashboard();
});

// Export for external access
window.Dashboard = Dashboard;
