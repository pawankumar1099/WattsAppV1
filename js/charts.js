/**
 * Enhanced Chart Management Module
 * Handles all Chart.js configurations and updates with support for multiple time periods
 */

class ChartManager {
    constructor() {
        this.charts = {};
        this.chartConfigs = {};
        this.currentPeriods = {
            generation: '24h',
            household: '24h',
            trends: '7d'
        };
        this.initializeChartConfigs();
    }

    /**
     * Initialize chart configurations
     */
    initializeChartConfigs() {
        // Generation vs Consumption Chart
        this.chartConfigs.generation = {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Generation (kW)',
                        data: [],
                        borderColor: '#4caf50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Consumption (kW)',
                        data: [],
                        borderColor: '#ff7043',
                        backgroundColor: 'rgba(255, 112, 67, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: this.getBaseChartOptions()
        };

        // Device Breakdown Chart (Doughnut)
        this.chartConfigs.device = {
            type: 'doughnut',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: [
                        '#ff6384',
                        '#36a2eb',
                        '#ffce56',
                        '#4bc0c0',
                        '#9966ff',
                        '#ff9f40',
                        '#ff6384',
                        '#c9cbcf'
                    ],
                    borderWidth: 2,
                    borderColor: '#2a2a2a'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#ffffff',
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#ffffff',
                        bodyColor: '#ffffff',
                        borderColor: '#444',
                        borderWidth: 1,
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.parsed} kW`;
                            }
                        }
                    }
                }
            }
        };

        // Usage History Chart
        this.chartConfigs.usageHistory = {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Usage (kW)',
                    data: [],
                    backgroundColor: 'rgba(0, 188, 212, 0.6)',
                    borderColor: '#00bcd4',
                    borderWidth: 1
                }]
            },
            options: {
                ...this.getBaseChartOptions(),
                scales: {
                    ...this.getBaseChartOptions().scales,
                    y: {
                        ...this.getBaseChartOptions().scales.y,
                        title: {
                            display: true,
                            text: 'Usage (kW)',
                            color: '#888'
                        }
                    }
                }
            }
        };

        // Trends Chart
        this.chartConfigs.trends = {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Energy Efficiency (%)',
                    data: [],
                    borderColor: '#00bcd4',
                    backgroundColor: 'rgba(0, 188, 212, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                ...this.getBaseChartOptions(),
                scales: {
                    ...this.getBaseChartOptions().scales,
                    y: {
                        ...this.getBaseChartOptions().scales.y,
                        title: {
                            display: true,
                            text: 'Efficiency (%)',
                            color: '#888'
                        },
                        min: 0,
                        max: 100
                    }
                }
            }
        };

        // Peak Usage Chart
        this.chartConfigs.peakUsage = {
            type: 'bar',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Peak Usage (kW)',
                    data: [],
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                        'rgba(199, 199, 199, 0.6)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                        'rgba(199, 199, 199, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                ...this.getBaseChartOptions(),
                scales: {
                    ...this.getBaseChartOptions().scales,
                    y: {
                        ...this.getBaseChartOptions().scales.y,
                        title: {
                            display: true,
                            text: 'Peak Usage (kW)',
                            color: '#888'
                        }
                    }
                }
            }
        };
    }

    /**
     * Get base chart options
     */
    getBaseChartOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: '#ffffff',
                        font: { size: 12 }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#444',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Time',
                        color: '#888'
                    },
                    ticks: {
                        color: '#888',
                        maxTicksLimit: 12
                    },
                    grid: {
                        color: '#444'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Power (kW)',
                        color: '#888'
                    },
                    ticks: {
                        color: '#888',
                        beginAtZero: true
                    },
                    grid: {
                        color: '#444'
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            animation: {
                duration: 750,
                easing: 'easeInOutQuart'
            }
        };
    }

    /**
     * Initialize the generation vs consumption chart
     */
    initializeGenerationChart() {
        const ctx = document.getElementById('generationChart');
        if (!ctx) {
            console.error('Generation chart canvas element not found');
            return;
        }

        if (this.charts.generation) {
            this.charts.generation.destroy();
        }

        this.charts.generation = new Chart(ctx, this.chartConfigs.generation);
        this.updateGenerationChart();
    }

    /**
     * Initialize device breakdown chart
     */
    initializeDeviceChart() {
        const ctx = document.getElementById('deviceChart');
        if (!ctx) return;

        if (this.charts.device) {
            this.charts.device.destroy();
        }

        this.charts.device = new Chart(ctx, this.chartConfigs.device);
        this.updateDeviceChart();
    }

    /**
     * Initialize usage history chart
     */
    initializeUsageHistoryChart() {
        const ctx = document.getElementById('usageHistoryChart');
        if (!ctx) return;

        if (this.charts.usageHistory) {
            this.charts.usageHistory.destroy();
        }

        this.charts.usageHistory = new Chart(ctx, this.chartConfigs.usageHistory);
        this.updateUsageHistoryChart();
    }

    /**
     * Initialize trends chart
     */
    initializeTrendsChart() {
        const ctx = document.getElementById('trendsChart');
        if (!ctx) return;

        if (this.charts.trends) {
            this.charts.trends.destroy();
        }

        this.charts.trends = new Chart(ctx, this.chartConfigs.trends);
        this.updateTrendsChart();
    }

    /**
     * Initialize peak usage chart
     */
    initializePeakUsageChart() {
        const ctx = document.getElementById('peakUsageChart');
        if (!ctx) return;

        if (this.charts.peakUsage) {
            this.charts.peakUsage.destroy();
        }

        this.charts.peakUsage = new Chart(ctx, this.chartConfigs.peakUsage);
        this.updatePeakUsageChart();
    }

    /**
     * Update the generation chart with new data
     */
    updateGenerationChart(period = null) {
        if (!this.charts.generation) return;

        const currentPeriod = period || this.currentPeriods.generation;
        const historicalData = window.energyDataManager.getHistoricalData(currentPeriod);
        
        this.charts.generation.data.labels = historicalData.labels;
        this.charts.generation.data.datasets[0].data = historicalData.generation;
        this.charts.generation.data.datasets[1].data = historicalData.consumption;
        
        this.charts.generation.update('none');
    }

    /**
     * Update device breakdown chart
     */
    updateDeviceChart() {
        if (!this.charts.device) return;

        const householdData = window.energyDataManager.getHouseholdData();
        const deviceData = {};

        // Aggregate device usage across all households
        householdData.households.forEach(household => {
            household.devices.forEach(device => {
                if (device.power > 0) {
                    if (deviceData[device.name]) {
                        deviceData[device.name] += device.power;
                    } else {
                        deviceData[device.name] = device.power;
                    }
                }
            });
        });

        const labels = Object.keys(deviceData);
        const data = Object.values(deviceData).map(value => Math.round(value * 100) / 100);

        this.charts.device.data.labels = labels;
        this.charts.device.data.datasets[0].data = data;
        
        this.charts.device.update();
    }

    /**
     * Update usage history chart
     */
    updateUsageHistoryChart(period = null) {
        if (!this.charts.usageHistory) return;

        const currentPeriod = period || this.currentPeriods.household;
        const historicalData = window.energyDataManager.getHistoricalData(currentPeriod);
        
        this.charts.usageHistory.data.labels = historicalData.labels;
        this.charts.usageHistory.data.datasets[0].data = historicalData.consumption;
        
        this.charts.usageHistory.update();
    }

    /**
     * Update trends chart
     */
    updateTrendsChart(period = null, type = 'efficiency') {
        if (!this.charts.trends) return;

        const currentPeriod = period || this.currentPeriods.trends;
        const reportData = window.energyDataManager.getReportData(currentPeriod);
        
        let data, label, color;
        
        switch (type) {
            case 'generation':
                data = reportData.data.generation;
                label = 'Generation (kW)';
                color = '#4caf50';
                break;
            case 'consumption':
                data = reportData.data.consumption;
                label = 'Consumption (kW)';
                color = '#ff7043';
                break;
            case 'efficiency':
            default:
                // Calculate efficiency for each data point
                data = reportData.data.generation.map((gen, i) => {
                    const cons = reportData.data.consumption[i];
                    return cons > 0 ? Math.min(100, (gen / cons) * 100) : 0;
                });
                label = 'Efficiency (%)';
                color = '#00bcd4';
                break;
        }

        this.charts.trends.data.labels = reportData.data.labels;
        this.charts.trends.data.datasets[0].data = data.map(value => Math.round(value * 100) / 100);
        this.charts.trends.data.datasets[0].label = label;
        this.charts.trends.data.datasets[0].borderColor = color;
        this.charts.trends.data.datasets[0].backgroundColor = color.replace('1)', '0.1)');
        
        this.charts.trends.update();
    }

    /**
     * Update peak usage chart
     */
    updatePeakUsageChart() {
        if (!this.charts.peakUsage) return;

        // Generate realistic peak usage data for each day of week
        const peakData = [8.5, 9.2, 8.8, 9.5, 10.1, 7.2, 6.8]; // kW peaks for Mon-Sun
        
        this.charts.peakUsage.data.datasets[0].data = peakData;
        this.charts.peakUsage.update();
    }

    /**
     * Update chart period and refresh data
     */
    updateChartPeriod(chartType, period) {
        this.currentPeriods[chartType] = period;
        
        switch (chartType) {
            case 'generation':
                this.updateGenerationChart(period);
                break;
            case 'household':
                this.updateUsageHistoryChart(period);
                break;
            case 'trends':
                this.updateTrendsChart(period);
                break;
        }
    }

    /**
     * Update trends chart type
     */
    updateTrendsChartType(type) {
        this.updateTrendsChart(null, type);
    }

    /**
     * Update all charts
     */
    updateAllCharts() {
        this.updateGenerationChart();
        this.updateDeviceChart();
        this.updateUsageHistoryChart();
        this.updateTrendsChart();
        this.updatePeakUsageChart();
    }

    /**
     * Initialize all charts
     */
    initializeAllCharts() {
        this.initializeGenerationChart();
        this.initializeDeviceChart();
        this.initializeUsageHistoryChart();
        this.initializeTrendsChart();
        this.initializePeakUsageChart();
    }

    /**
     * Resize charts when window is resized
     */
    handleResize() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.resize();
            }
        });
    }

    /**
     * Destroy all charts
     */
    destroyAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart) {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    /**
     * Set chart theme
     */
    setTheme(theme = 'dark') {
        const textColor = theme === 'dark' ? '#ffffff' : '#333333';
        const gridColor = theme === 'dark' ? '#444' : '#e0e0e0';
        
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.options) {
                // Update text colors
                if (chart.options.plugins && chart.options.plugins.legend) {
                    chart.options.plugins.legend.labels.color = textColor;
                }
                
                // Update grid colors
                if (chart.options.scales) {
                    Object.values(chart.options.scales).forEach(scale => {
                        if (scale.ticks) scale.ticks.color = textColor;
                        if (scale.title) scale.title.color = textColor;
                        if (scale.grid) scale.grid.color = gridColor;
                    });
                }
                
                chart.update();
            }
        });
    }
}

// Create global instance
window.chartManager = new ChartManager();

// Handle window resize
window.addEventListener('resize', () => {
    window.chartManager.handleResize();
});
