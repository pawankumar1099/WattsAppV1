/**
 * Reports & Analytics Management Module
 * Handles report generation, analytics display, and data export
 */

class ReportsManager {
    constructor() {
        this.currentPeriod = '7d';
        this.currentAnalyticsTab = 'daily';
        this.currentTrendsType = 'efficiency';
        this.isInitialized = false;
    }

    /**
     * Initialize the reports manager
     */
    initialize() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDisplay();
        this.isInitialized = true;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Report period selector
        const periodSelector = document.getElementById('report-period');
        if (periodSelector) {
            periodSelector.addEventListener('change', (e) => {
                this.currentPeriod = e.target.value;
                this.updateDisplay();
            });
        }

        // Export report button
        const exportBtn = document.getElementById('export-report');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportReport();
            });
        }

        // Trends chart filter buttons
        const trendFilters = document.querySelectorAll('#reports-tab .chart-filters .filter-btn');
        trendFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                const chartType = btn.getAttribute('data-chart');
                this.currentTrendsType = chartType;
                this.updateTrendsChart();
                
                // Update active state
                trendFilters.forEach(f => f.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Analytics tab buttons
        const analyticsTabBtns = document.querySelectorAll('#reports-tab .analytics-tabs .tab-btn');
        analyticsTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabType = btn.getAttribute('data-analytics');
                this.currentAnalyticsTab = tabType;
                this.updateAnalyticsContent();
                
                // Update active state
                analyticsTabBtns.forEach(f => f.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    /**
     * Initialize charts
     */
    initializeCharts() {
        if (window.chartManager) {
            window.chartManager.initializeTrendsChart();
            window.chartManager.initializePeakUsageChart();
        }
    }

    /**
     * Update display
     */
    updateDisplay() {
        this.updatePerformanceSummary();
        this.updateTrendsChart();
        this.updateAnalyticsContent();
        this.updatePeakUsageChart();
    }

    /**
     * Update performance summary cards
     */
    updatePerformanceSummary() {
        const reportData = window.energyDataManager.getReportData(this.currentPeriod);
        
        // Calculate metrics
        const efficiency = reportData.statistics.efficiency;
        const efficiencyTrend = this.calculateTrend(efficiency, 75); // Compare to baseline
        
        const costSavings = this.calculateCostSavings(reportData.statistics);
        const co2Reduced = this.calculateCO2Reduction(reportData.statistics);

        // Update DOM elements
        const elements = {
            efficiencyTrend: document.getElementById('efficiency-trend'),
            costSavings: document.getElementById('cost-savings'),
            co2Reduced: document.getElementById('co2-reduced')
        };

        if (elements.efficiencyTrend) {
            elements.efficiencyTrend.textContent = `${efficiencyTrend > 0 ? '+' : ''}${efficiencyTrend.toFixed(1)}%`;
            elements.efficiencyTrend.style.color = efficiencyTrend > 0 ? '#4caf50' : '#f44336';
        }

        if (elements.costSavings) {
            elements.costSavings.textContent = `$${costSavings.toFixed(2)}`;
        }

        if (elements.co2Reduced) {
            elements.co2Reduced.textContent = `${co2Reduced.toFixed(0)} kg`;
        }
    }

    /**
     * Calculate trend percentage
     */
    calculateTrend(current, baseline) {
        return ((current - baseline) / baseline) * 100;
    }

    /**
     * Calculate cost savings
     */
    calculateCostSavings(statistics) {
        // Simplified calculation: assume $0.12 per kWh grid rate
        const gridRate = 0.12;
        const renewableGeneration = statistics.totalGeneration;
        return renewableGeneration * gridRate;
    }

    /**
     * Calculate CO2 reduction
     */
    calculateCO2Reduction(statistics) {
        // Simplified calculation: assume 0.4 kg CO2 per kWh from grid
        const co2PerKwh = 0.4;
        const renewableGeneration = statistics.totalGeneration;
        return renewableGeneration * co2PerKwh;
    }

    /**
     * Update trends chart
     */
    updateTrendsChart() {
        if (window.chartManager) {
            window.chartManager.updateTrendsChart(this.currentPeriod, this.currentTrendsType);
        }
    }

    /**
     * Update analytics content
     */
    updateAnalyticsContent() {
        const analyticsContent = document.getElementById('analytics-content');
        if (!analyticsContent) return;

        const reportData = window.energyDataManager.getReportData(this.currentPeriod);
        
        let content = '';
        
        switch (this.currentAnalyticsTab) {
            case 'daily':
                content = this.generateDailyAnalytics(reportData);
                break;
            case 'weekly':
                content = this.generateWeeklyAnalytics(reportData);
                break;
            case 'monthly':
                content = this.generateMonthlyAnalytics(reportData);
                break;
        }

        analyticsContent.innerHTML = content;
    }

    /**
     * Generate daily analytics content
     */
    generateDailyAnalytics(reportData) {
        const stats = reportData.statistics;
        
        return `
            <div class="analytics-grid">
                <div class="analytics-item">
                    <h4>Average Daily Generation</h4>
                    <div class="analytics-value">${stats.avgGeneration} kW</div>
                    <div class="analytics-change">Peak: ${stats.peakGeneration} kW</div>
                </div>
                <div class="analytics-item">
                    <h4>Average Daily Consumption</h4>
                    <div class="analytics-value">${stats.avgConsumption} kW</div>
                    <div class="analytics-change">Peak: ${stats.peakConsumption} kW</div>
                </div>
                <div class="analytics-item">
                    <h4>Energy Balance</h4>
                    <div class="analytics-value">${(stats.totalGeneration - stats.totalConsumption).toFixed(2)} kWh</div>
                    <div class="analytics-change">${stats.totalGeneration > stats.totalConsumption ? 'Surplus' : 'Deficit'}</div>
                </div>
                <div class="analytics-item">
                    <h4>System Efficiency</h4>
                    <div class="analytics-value">${stats.efficiency}%</div>
                    <div class="analytics-change">
                        ${this.getEfficiencyRating(stats.efficiency)}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Generate weekly analytics content
     */
    generateWeeklyAnalytics(reportData) {
        const stats = reportData.statistics;
        const weeklyGen = stats.totalGeneration;
        const weeklyCons = stats.totalConsumption;
        
        return `
            <div class="analytics-grid">
                <div class="analytics-item">
                    <h4>Weekly Generation Total</h4>
                    <div class="analytics-value">${weeklyGen} kWh</div>
                    <div class="analytics-change">Avg: ${(weeklyGen / 7).toFixed(1)} kWh/day</div>
                </div>
                <div class="analytics-item">
                    <h4>Weekly Consumption Total</h4>
                    <div class="analytics-value">${weeklyCons} kWh</div>
                    <div class="analytics-change">Avg: ${(weeklyCons / 7).toFixed(1)} kWh/day</div>
                </div>
                <div class="analytics-item">
                    <h4>Self-Sufficiency Rate</h4>
                    <div class="analytics-value">${Math.min(100, (weeklyGen / weeklyCons * 100)).toFixed(1)}%</div>
                    <div class="analytics-change">
                        ${weeklyGen >= weeklyCons ? 'Fully self-sufficient' : 'Partially grid-dependent'}
                    </div>
                </div>
                <div class="analytics-item">
                    <h4>Carbon Footprint</h4>
                    <div class="analytics-value">${this.calculateCO2Reduction(stats).toFixed(0)} kg saved</div>
                    <div class="analytics-change">CO₂ reduction vs grid power</div>
                </div>
            </div>
        `;
    }

    /**
     * Generate monthly analytics content
     */
    generateMonthlyAnalytics(reportData) {
        const stats = reportData.statistics;
        const monthlyGen = stats.totalGeneration;
        const monthlyCons = stats.totalConsumption;
        const costSavings = this.calculateCostSavings(stats);
        
        return `
            <div class="analytics-grid">
                <div class="analytics-item">
                    <h4>Monthly Generation</h4>
                    <div class="analytics-value">${monthlyGen} kWh</div>
                    <div class="analytics-change">Avg: ${(monthlyGen / 30).toFixed(1)} kWh/day</div>
                </div>
                <div class="analytics-item">
                    <h4>Monthly Consumption</h4>
                    <div class="analytics-value">${monthlyCons} kWh</div>
                    <div class="analytics-change">Avg: ${(monthlyCons / 30).toFixed(1)} kWh/day</div>
                </div>
                <div class="analytics-item">
                    <h4>Estimated Savings</h4>
                    <div class="analytics-value">$${costSavings.toFixed(2)}</div>
                    <div class="analytics-change">vs. grid-only power</div>
                </div>
                <div class="analytics-item">
                    <h4>ROI Progress</h4>
                    <div class="analytics-value">12.5%</div>
                    <div class="analytics-change">Annual return on investment</div>
                </div>
            </div>
        `;
    }

    /**
     * Get efficiency rating
     */
    getEfficiencyRating(efficiency) {
        if (efficiency >= 90) return 'Excellent';
        if (efficiency >= 80) return 'Very Good';
        if (efficiency >= 70) return 'Good';
        if (efficiency >= 60) return 'Average';
        return 'Needs Improvement';
    }

    /**
     * Update peak usage chart
     */
    updatePeakUsageChart() {
        if (window.chartManager) {
            window.chartManager.updatePeakUsageChart();
        }
    }

    /**
     * Export report
     */
    exportReport() {
        const reportData = window.energyDataManager.getReportData(this.currentPeriod);
        const householdData = window.energyDataManager.getHouseholdData();
        const currentData = window.energyDataManager.getCurrentData();
        
        const report = {
            generatedAt: new Date().toISOString(),
            period: this.currentPeriod,
            summary: {
                totalGeneration: reportData.statistics.totalGeneration,
                totalConsumption: reportData.statistics.totalConsumption,
                efficiency: reportData.statistics.efficiency,
                costSavings: this.calculateCostSavings(reportData.statistics),
                co2Reduction: this.calculateCO2Reduction(reportData.statistics)
            },
            historicalData: reportData.data,
            currentStatus: {
                battery: currentData.battery,
                grid: currentData.grid,
                generation: currentData.generation,
                consumption: currentData.consumption
            },
            householdBreakdown: householdData.households.map(h => ({
                name: h.name,
                currentUsage: h.currentUsage,
                devices: h.devices.filter(d => d.power > 0)
            }))
        };

        // Create and download file
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `energy-report-${this.currentPeriod}-${new Date().toISOString().split('T')[0]}.json`;
        link.click();

        // Show success message
        this.showExportSuccess();
    }

    /**
     * Show export success message
     */
    showExportSuccess() {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'export-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            Report exported successfully!
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4caf50;
            color: white;
            padding: 15px 20px;
            border-radius: 6px;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * Get report summary
     */
    getReportSummary(period = null) {
        const reportPeriod = period || this.currentPeriod;
        const reportData = window.energyDataManager.getReportData(reportPeriod);
        
        return {
            period: reportPeriod,
            statistics: reportData.statistics,
            trends: {
                efficiency: this.calculateTrend(reportData.statistics.efficiency, 75),
                generation: reportData.statistics.totalGeneration,
                consumption: reportData.statistics.totalConsumption
            },
            financials: {
                costSavings: this.calculateCostSavings(reportData.statistics),
                co2Reduction: this.calculateCO2Reduction(reportData.statistics)
            }
        };
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
window.reportsManager = new ReportsManager();

// Add CSS for export notification animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .analytics-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 20px;
    }
    .analytics-item {
        background: #3a3a3a;
        padding: 20px;
        border-radius: 8px;
        border: 1px solid #555;
    }
    .analytics-item h4 {
        color: #fff;
        margin-bottom: 10px;
        font-size: 14px;
        font-weight: 500;
    }
    .analytics-value {
        font-size: 24px;
        font-weight: 600;
        color: #00bcd4;
        margin-bottom: 5px;
    }
    .analytics-change {
        font-size: 12px;
        color: #888;
    }
`;
document.head.appendChild(style);
