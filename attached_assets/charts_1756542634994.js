/**
 * Chart Management Module
 * Handles all Chart.js configurations and updates
 */

class ChartManager {
    constructor() {
        this.charts = {};
        this.chartConfigs = {};
        this.initializeChartConfigs();
    }

    /**
     * Initialize chart configurations
     */
    initializeChartConfigs() {
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
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#ffffff',
                            font: {
                                size: 12
                            }
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
            }
        };
    }

    /**
     * Initialize the generation vs consumption chart
     */
    initializeGenerationChart() {
        const ctx = document.getElementById('generationChart');
        if (!ctx) {
            console.error('Chart canvas element not found');
            return;
        }

        // Destroy existing chart if it exists
        if (this.charts.generation) {
            this.charts.generation.destroy();
        }

        this.charts.generation = new Chart(ctx, this.chartConfigs.generation);
        
        // Load initial data
        this.updateGenerationChart();
    }

    /**
     * Update the generation chart with new data
     */
    updateGenerationChart() {
        if (!this.charts.generation) {
            console.error('Generation chart not initialized');
            return;
        }

        const historicalData = window.energyDataManager.getHistoricalData();
        
        this.charts.generation.data.labels = historicalData.labels;
        this.charts.generation.data.datasets[0].data = historicalData.generation;
        this.charts.generation.data.datasets[1].data = historicalData.consumption;
        
        this.charts.generation.update('none'); // No animation for real-time updates
    }

    /**
     * Update all charts with new data
     */
    updateAllCharts() {
        this.updateGenerationChart();
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
     * Destroy all charts (for cleanup)
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
     * Set chart theme (dark/light)
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
