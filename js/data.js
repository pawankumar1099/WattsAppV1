/**
 * Enhanced Data Management Module
 * Handles all data operations with support for historical data and multiple time periods
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
                percentage: 75,
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
            '24h': { labels: [], generation: [], consumption: [] },
            '7d': { labels: [], generation: [], consumption: [] },
            '30d': { labels: [], generation: [], consumption: [] }
        };

        this.householdData = {
            households: [
                {
                    id: 'house1',
                    name: 'House 1',
                    status: 'Active',
                    currentUsage: 0,
                    devices: [
                        { name: 'HVAC', power: 0, status: 'on', priority: 'high' },
                        { name: 'Water Heater', power: 0, status: 'on', priority: 'medium' },
                        { name: 'Refrigerator', power: 0.8, status: 'on', priority: 'high' },
                        { name: 'Lighting', power: 0, status: 'on', priority: 'low' }
                    ]
                },
                {
                    id: 'house2',
                    name: 'House 2',
                    status: 'Active',
                    currentUsage: 0,
                    devices: [
                        { name: 'HVAC', power: 0, status: 'on', priority: 'high' },
                        { name: 'Electric Vehicle', power: 0, status: 'off', priority: 'low' },
                        { name: 'Washer/Dryer', power: 0, status: 'off', priority: 'low' },
                        { name: 'Kitchen Appliances', power: 0, status: 'on', priority: 'medium' }
                    ]
                },
                {
                    id: 'house3',
                    name: 'House 3',
                    status: 'Active',
                    currentUsage: 0,
                    devices: [
                        { name: 'Heat Pump', power: 0, status: 'on', priority: 'high' },
                        { name: 'Pool Pump', power: 0, status: 'off', priority: 'low' },
                        { name: 'Electronics', power: 0, status: 'on', priority: 'medium' },
                        { name: 'Outdoor Lighting', power: 0, status: 'auto', priority: 'low' }
                    ]
                }
            ]
        };

        this.alertsData = [];
        this.controlsData = {
            systemControls: {
                gridConnection: true,
                autoLoadBalancing: true,
                batteryCharging: true
            },
            energyLimits: {
                maxGridImport: 10,
                batteryDischargeLimit: 20,
                loadPriority: 'normal'
            }
        };

        this.schedules = [
            {
                id: 1,
                name: 'Night Charging',
                active: true,
                time: '22:00 - 06:00',
                action: 'Charge EV',
                conditions: 'Low grid rates'
            },
            {
                id: 2,
                name: 'Peak Shaving',
                active: true,
                time: '16:00 - 20:00',
                action: 'Reduce non-essential loads',
                conditions: 'High grid rates'
            }
        ];
        
        this.initializeHistoricalData();
        this.generateAlerts();
    }

    /**
     * Initialize historical data for all time periods
     */
    initializeHistoricalData() {
        this.initializePeriodData('24h', 48, 30); // 48 points, 30 min intervals
        this.initializePeriodData('7d', 168, 60); // 168 points, 1 hour intervals  
        this.initializePeriodData('30d', 720, 60); // 720 points, 1 hour intervals
    }

    /**
     * Initialize data for a specific time period
     */
    initializePeriodData(period, points, intervalMinutes) {
        const now = new Date();
        const labels = [];
        const generation = [];
        const consumption = [];
        
        for (let i = points - 1; i >= 0; i--) {
            const time = new Date(now.getTime() - (i * intervalMinutes * 60 * 1000));
            labels.push(this.formatTimeForPeriod(time, period));
            
            // Generate realistic patterns based on time
            const hour = time.getHours();
            const day = time.getDay();
            
            // Solar generation pattern
            let solarGen = 0;
            if (hour >= 6 && hour <= 18) {
                const solarFactor = Math.sin(((hour - 6) / 12) * Math.PI);
                solarGen = solarFactor * (8 + Math.random() * 4);
            }
            
            // Wind generation (more variable)
            const windGen = 3 + Math.random() * 6;
            
            const totalGen = solarGen + windGen;
            generation.push(Math.round(totalGen * 100) / 100);
            
            // Consumption pattern (higher during peak hours and weekdays)
            let consumptionBase = 4;
            if (day >= 1 && day <= 5) { // Weekdays
                if ((hour >= 7 && hour <= 9) || (hour >= 18 && hour <= 22)) {
                    consumptionBase = 8;
                } else if (hour >= 10 && hour <= 17) {
                    consumptionBase = 6;
                }
            } else { // Weekends
                if (hour >= 10 && hour <= 22) {
                    consumptionBase = 7;
                }
            }
            
            const totalCons = consumptionBase + Math.random() * 3;
            consumption.push(Math.round(totalCons * 100) / 100);
        }
        
        this.historicalData[period] = { labels, generation, consumption };
    }

    /**
     * Format time based on period
     */
    formatTimeForPeriod(date, period) {
        switch (period) {
            case '24h':
                return date.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit',
                    hour12: false 
                });
            case '7d':
                return date.toLocaleDateString('en-US', { 
                    weekday: 'short',
                    hour: '2-digit'
                });
            case '30d':
                return date.toLocaleDateString('en-US', { 
                    month: 'short',
                    day: 'numeric'
                });
            default:
                return date.toLocaleTimeString();
        }
    }

    /**
     * Generate realistic current data
     */
    generateCurrentData() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        
        // Solar generation based on time of day
        let solar = 0;
        if (hour >= 6 && hour <= 18) {
            const solarFactor = Math.sin(((hour - 6) / 12) * Math.PI);
            solar = solarFactor * (8 + Math.random() * 4);
        }
        
        // Wind generation (more random)
        const wind = 3 + Math.random() * 6;
        
        // Update household consumption
        this.updateHouseholdConsumption(hour, day);
        
        const totalGeneration = solar + wind;
        const totalConsumption = this.getTotalHouseholdConsumption();
        
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
        const gridStatus = batteryPercentage < this.controlsData.energyLimits.batteryDischargeLimit || 
                          totalConsumption > totalGeneration + 2 ? 'ON' : 'OFF';
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
                households: Math.round(totalConsumption * 100) / 100,
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
        
        // Check for new alerts
        this.checkAlerts();
    }

    /**
     * Update household consumption based on time patterns
     */
    updateHouseholdConsumption(hour, day) {
        this.householdData.households.forEach(household => {
            let totalUsage = 0;
            
            household.devices.forEach(device => {
                if (device.status === 'on') {
                    switch (device.name) {
                        case 'HVAC':
                        case 'Heat Pump':
                            device.power = 2.5 + Math.random() * 2;
                            if (hour >= 22 || hour <= 6) device.power *= 0.7;
                            break;
                        case 'Water Heater':
                            device.power = (hour >= 6 && hour <= 8) || (hour >= 18 && hour <= 20) ? 
                                          3 + Math.random() * 1 : 0.5;
                            break;
                        case 'Electric Vehicle':
                            device.power = (hour >= 22 || hour <= 6) && device.status === 'on' ? 
                                          6 + Math.random() * 2 : 0;
                            break;
                        case 'Lighting':
                            device.power = (hour <= 7 || hour >= 18) ? 0.5 + Math.random() * 0.3 : 0.1;
                            break;
                        case 'Pool Pump':
                            device.power = hour >= 10 && hour <= 16 ? 1.5 : 0;
                            break;
                        default:
                            device.power = 0.5 + Math.random() * 1;
                    }
                } else if (device.status === 'auto') {
                    // Auto devices like outdoor lighting
                    device.power = (hour <= 7 || hour >= 18) ? 0.3 : 0;
                } else {
                    device.power = 0;
                }
                
                totalUsage += device.power;
            });
            
            household.currentUsage = Math.round(totalUsage * 100) / 100;
        });
    }

    /**
     * Get total household consumption
     */
    getTotalHouseholdConsumption() {
        return this.householdData.households.reduce((total, household) => {
            return total + household.currentUsage;
        }, 0);
    }

    /**
     * Update historical data with current values
     */
    updateHistoricalData() {
        const currentTime = this.currentData.timestamp;
        
        // Update 24h data every 30 minutes
        if (this.shouldUpdateData('24h', currentTime)) {
            this.addDataPoint('24h', currentTime);
        }
        
        // Update 7d data every hour
        if (this.shouldUpdateData('7d', currentTime)) {
            this.addDataPoint('7d', currentTime);
        }
        
        // Update 30d data every hour
        if (this.shouldUpdateData('30d', currentTime)) {
            this.addDataPoint('30d', currentTime);
        }
    }

    /**
     * Check if data should be updated for a period
     */
    shouldUpdateData(period, currentTime) {
        const data = this.historicalData[period];
        if (data.labels.length === 0) return true;
        
        const lastTime = new Date(data.labels[data.labels.length - 1]);
        const timeDiff = currentTime - lastTime;
        
        switch (period) {
            case '24h':
                return timeDiff >= 30 * 60 * 1000; // 30 minutes
            case '7d':
            case '30d':
                return timeDiff >= 60 * 60 * 1000; // 1 hour
            default:
                return false;
        }
    }

    /**
     * Add new data point to historical data
     */
    addDataPoint(period, time) {
        const data = this.historicalData[period];
        const maxPoints = period === '24h' ? 48 : period === '7d' ? 168 : 720;
        
        // Remove oldest data point if at limit
        if (data.labels.length >= maxPoints) {
            data.labels.shift();
            data.generation.shift();
            data.consumption.shift();
        }
        
        data.labels.push(this.formatTimeForPeriod(time, period));
        data.generation.push(this.currentData.generation.total);
        data.consumption.push(this.currentData.consumption.total);
    }

    /**
     * Generate alerts based on current conditions
     */
    generateAlerts() {
        this.alertsData = [
            {
                id: 1,
                type: 'warning',
                title: 'Low Battery Alert',
                message: 'Battery level is below 25%. Consider reducing non-essential loads.',
                timestamp: new Date(Date.now() - 5 * 60 * 1000),
                dismissed: false
            },
            {
                id: 2,
                type: 'info',
                title: 'Maintenance Reminder',
                message: 'Solar panel cleaning recommended. Last cleaning: 30 days ago.',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
                dismissed: false
            },
            {
                id: 3,
                type: 'critical',
                title: 'Grid Connection Lost',
                message: 'Grid connection has been lost. System running on battery power.',
                timestamp: new Date(Date.now() - 10 * 60 * 1000),
                dismissed: true
            }
        ];
    }

    /**
     * Check for new alerts based on current conditions
     */
    checkAlerts() {
        const alerts = [];
        
        // Check battery level
        if (this.currentData.battery.percentage < 20) {
            alerts.push({
                id: Date.now(),
                type: 'critical',
                title: 'Critical Battery Level',
                message: `Battery level is ${this.currentData.battery.percentage}%. Immediate action required.`,
                timestamp: new Date(),
                dismissed: false
            });
        } else if (this.currentData.battery.percentage < 30) {
            alerts.push({
                id: Date.now() + 1,
                type: 'warning',
                title: 'Low Battery Warning',
                message: `Battery level is ${this.currentData.battery.percentage}%. Consider reducing loads.`,
                timestamp: new Date(),
                dismissed: false
            });
        }
        
        // Check grid load
        if (this.currentData.grid.load > 80) {
            alerts.push({
                id: Date.now() + 2,
                type: 'warning',
                title: 'High Grid Load',
                message: `Grid load is ${this.currentData.grid.load}%. System under stress.`,
                timestamp: new Date(),
                dismissed: false
            });
        }
        
        // Add new alerts if they don't already exist
        alerts.forEach(newAlert => {
            const exists = this.alertsData.some(alert => 
                alert.title === newAlert.title && 
                Math.abs(alert.timestamp - newAlert.timestamp) < 5 * 60 * 1000
            );
            if (!exists) {
                this.alertsData.unshift(newAlert);
            }
        });
        
        // Keep only last 50 alerts
        this.alertsData = this.alertsData.slice(0, 50);
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
    getHistoricalData(period = '24h') {
        return { ...this.historicalData[period] };
    }

    /**
     * Get household data
     */
    getHouseholdData() {
        return { ...this.householdData };
    }

    /**
     * Get alerts data
     */
    getAlertsData() {
        return [...this.alertsData];
    }

    /**
     * Get controls data
     */
    getControlsData() {
        return { ...this.controlsData };
    }

    /**
     * Get schedules data
     */
    getSchedulesData() {
        return [...this.schedules];
    }

    /**
     * Update control setting
     */
    updateControlSetting(category, setting, value) {
        if (this.controlsData[category] && this.controlsData[category].hasOwnProperty(setting)) {
            this.controlsData[category][setting] = value;
            return true;
        }
        return false;
    }

    /**
     * Toggle device status
     */
    toggleDevice(householdId, deviceName) {
        const household = this.householdData.households.find(h => h.id === householdId);
        if (household) {
            const device = household.devices.find(d => d.name === deviceName);
            if (device) {
                device.status = device.status === 'on' ? 'off' : 'on';
                return true;
            }
        }
        return false;
    }

    /**
     * Dismiss alert
     */
    dismissAlert(alertId) {
        const alert = this.alertsData.find(a => a.id === alertId);
        if (alert) {
            alert.dismissed = true;
            return true;
        }
        return false;
    }

    /**
     * Clear all dismissed alerts
     */
    clearDismissedAlerts() {
        this.alertsData = this.alertsData.filter(alert => !alert.dismissed);
    }

    /**
     * Add new schedule
     */
    addSchedule(schedule) {
        const newSchedule = {
            id: Date.now(),
            ...schedule,
            active: true
        };
        this.schedules.push(newSchedule);
        return newSchedule;
    }

    /**
     * Toggle schedule
     */
    toggleSchedule(scheduleId) {
        const schedule = this.schedules.find(s => s.id === scheduleId);
        if (schedule) {
            schedule.active = !schedule.active;
            return true;
        }
        return false;
    }

    /**
     * Get report data for different periods
     */
    getReportData(period = '7d') {
        const data = this.getHistoricalData(period);
        
        // Calculate statistics
        const avgGeneration = data.generation.reduce((a, b) => a + b, 0) / data.generation.length;
        const avgConsumption = data.consumption.reduce((a, b) => a + b, 0) / data.consumption.length;
        const efficiency = avgGeneration > 0 ? (avgGeneration / avgConsumption) * 100 : 0;
        
        const peakGeneration = Math.max(...data.generation);
        const peakConsumption = Math.max(...data.consumption);
        
        return {
            period,
            data,
            statistics: {
                avgGeneration: Math.round(avgGeneration * 100) / 100,
                avgConsumption: Math.round(avgConsumption * 100) / 100,
                efficiency: Math.round(efficiency),
                peakGeneration: Math.round(peakGeneration * 100) / 100,
                peakConsumption: Math.round(peakConsumption * 100) / 100,
                totalGeneration: Math.round(data.generation.reduce((a, b) => a + b, 0) * 100) / 100,
                totalConsumption: Math.round(data.consumption.reduce((a, b) => a + b, 0) * 100) / 100
            }
        };
    }
}

// Create global instance
window.energyDataManager = new EnergyDataManager();
