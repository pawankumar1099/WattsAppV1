/**
 * Data Management Module
 * Handles all data operations and provides a structure for future database integration
 */

class EnergyDataManager {
    constructor() {
        this.currentData = {
            timestamp: new Date(),
            generation: {
                solar: 0,
                wind: 0,
                total: 0
            },
            consumption: {
                households: 0,
                total: 0
            },
            battery: {
                percentage: 0,
                health: 'Good',
                voltage: 0,
                temperature: 0
            },
            grid: {
                status: 'OFF',
                load: 0
            },
            dailySummary: {
                totalGenerated: 0,
                totalConsumed: 0,
                efficiency: 0
            }
        };
        
        this.historicalData = {
            labels: [],
            generation: [],
            consumption: []
        };
        
        this.initializeHistoricalData();
    }

    /**
     * Initialize historical data with dummy values for demonstration
     * In production, this would fetch from a database
     */
    initializeHistoricalData() {
        const now = new Date();
        const labels = [];
        const generation = [];
        const consumption = [];
        
        // Generate data for the last 24 hours (every 30 minutes)
        for (let i = 47; i >= 0; i--) {
            const time = new Date(now.getTime() - (i * 30 * 60 * 1000));
            labels.push(this.formatTime(time));
            
            // Simulate realistic energy patterns
            const hour = time.getHours();
            const minute = time.getMinutes();
            
            // Solar generation pattern (peaks around noon)
            let solarGen = 0;
            if (hour >= 6 && hour <= 18) {
                const solarFactor = Math.sin(((hour - 6) / 12) * Math.PI);
                solarGen = solarFactor * (8 + Math.random() * 4);
            }
            
            // Wind generation (more variable)
            const windGen = 3 + Math.random() * 6;
            
            const totalGen = solarGen + windGen;
            generation.push(totalGen);
            
            // Consumption pattern (higher during morning and evening)
            let consumptionBase = 4;
            if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 22)) {
                consumptionBase = 8;
            } else if (hour >= 10 && hour <= 17) {
                consumptionBase = 6;
            }
            
            const totalCons = consumptionBase + Math.random() * 3;
            consumption.push(totalCons);
        }
        
        this.historicalData = { labels, generation, consumption };
    }

    /**
     * Generate realistic current data
     * In production, this would fetch real-time data from sensors/APIs
     */
    generateCurrentData() {
        const now = new Date();
        const hour = now.getHours();
        
        // Solar generation based on time of day
        let solar = 0;
        if (hour >= 6 && hour <= 18) {
            const solarFactor = Math.sin(((hour - 6) / 12) * Math.PI);
            solar = solarFactor * (8 + Math.random() * 4);
        }
        
        // Wind generation (more random)
        const wind = 3 + Math.random() * 6;
        
        // Household consumption
        let households = 4;
        if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 22)) {
            households = 8 + Math.random() * 4;
        } else if (hour >= 10 && hour <= 17) {
            households = 6 + Math.random() * 2;
        }
        
        const totalGeneration = solar + wind;
        const totalConsumption = households;
        
        // Battery calculations
        const netEnergy = totalGeneration - totalConsumption;
        let batteryPercentage = this.currentData.battery.percentage;
        
        if (netEnergy > 0) {
            // Charging
            batteryPercentage = Math.min(100, batteryPercentage + (netEnergy * 0.1));
        } else if (netEnergy < 0) {
            // Discharging
            batteryPercentage = Math.max(0, batteryPercentage + (netEnergy * 0.1));
        }
        
        // Grid status based on battery and consumption
        const gridStatus = batteryPercentage < 20 || totalConsumption > totalGeneration + 2 ? 'ON' : 'OFF';
        const gridLoad = gridStatus === 'ON' ? Math.min(100, Math.abs(netEnergy) * 10) : 0;
        
        // Battery health based on usage patterns
        let batteryHealth = 'Good';
        if (batteryPercentage < 10) {
            batteryHealth = 'Critical';
        } else if (batteryPercentage < 30) {
            batteryHealth = 'Warning';
        }
        
        // Daily summary calculations
        const efficiency = totalGeneration > 0 ? Math.min(100, (totalGeneration / totalConsumption) * 100) : 0;
        
        this.currentData = {
            timestamp: now,
            generation: {
                solar: Math.round(solar * 100) / 100,
                wind: Math.round(wind * 100) / 100,
                total: Math.round(totalGeneration * 100) / 100
            },
            consumption: {
                households: Math.round(households * 100) / 100,
                total: Math.round(totalConsumption * 100) / 100
            },
            battery: {
                percentage: Math.round(batteryPercentage),
                health: batteryHealth,
                voltage: Math.round((48 + (batteryPercentage / 100) * 6) * 10) / 10,
                temperature: Math.round((25 + Math.random() * 10) * 10) / 10
            },
            grid: {
                status: gridStatus,
                load: Math.round(gridLoad)
            },
            dailySummary: {
                totalGenerated: Math.round((this.currentData.dailySummary.totalGenerated + (totalGeneration / 48)) * 100) / 100,
                totalConsumed: Math.round((this.currentData.dailySummary.totalConsumed + (totalConsumption / 48)) * 100) / 100,
                efficiency: Math.round(efficiency)
            }
        };
        
        // Update historical data
        this.updateHistoricalData();
    }

    /**
     * Update historical data with current values
     */
    updateHistoricalData() {
        const currentTime = this.formatTime(this.currentData.timestamp);
        
        // Remove oldest data point and add new one
        if (this.historicalData.labels.length >= 48) {
            this.historicalData.labels.shift();
            this.historicalData.generation.shift();
            this.historicalData.consumption.shift();
        }
        
        this.historicalData.labels.push(currentTime);
        this.historicalData.generation.push(this.currentData.generation.total);
        this.historicalData.consumption.push(this.currentData.consumption.total);
    }

    /**
     * Format time for display
     */
    formatTime(date) {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    }

    /**
     * Get current data
     */
    getCurrentData() {
        return { ...this.currentData };
    }

    /**
     * Get historical data for charts
     */
    getHistoricalData() {
        return { ...this.historicalData };
    }

    /**
     * Method for future database integration
     * This would replace generateCurrentData() in production
     */
    async fetchRealTimeData() {
        // In production, this would make API calls to fetch real data
        // For now, we simulate with generated data
        this.generateCurrentData();
        return this.getCurrentData();
    }

    /**
     * Method for future database integration
     * This would replace initializeHistoricalData() in production
     */
    async fetchHistoricalData(timeRange = '24h') {
        // In production, this would query historical data from database
        // For now, we use the generated data
        return this.getHistoricalData();
    }
}

// Create global instance
window.energyDataManager = new EnergyDataManager();
