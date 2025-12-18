/**
 * Alerts & Notifications Management Module
 * Handles alert display, filtering, and configuration
 */

class AlertsManager {
    constructor() {
        this.currentFilter = 'all';
        this.alertSettings = {
            batteryThreshold: 20,
            gridThreshold: 80,
            pushNotifications: true,
            emailAlerts: false
        };
        this.isInitialized = false;
    }

    /**
     * Initialize the alerts manager
     */
    initialize() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.loadAlertSettings();
        this.renderAlerts();
        this.isInitialized = true;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Alert filter buttons
        const filterButtons = document.querySelectorAll('#alerts-tab .filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filterType = btn.getAttribute('data-type');
                this.setFilter(filterType);
                
                // Update active state
                filterButtons.forEach(f => f.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Clear all alerts button
        const clearAllBtn = document.getElementById('clear-all-alerts');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllAlerts();
            });
        }

        // Alert settings button
        const settingsBtn = document.getElementById('alert-settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.toggleAlertSettings();
            });
        }

        // Settings controls
        this.setupSettingsControls();
    }

    /**
     * Setup settings controls
     */
    setupSettingsControls() {
        const batteryThreshold = document.getElementById('battery-threshold');
        const gridThreshold = document.getElementById('grid-threshold');
        const pushNotifications = document.getElementById('push-notifications');
        const emailAlerts = document.getElementById('email-alerts');

        if (batteryThreshold) {
            batteryThreshold.addEventListener('input', (e) => {
                this.alertSettings.batteryThreshold = parseInt(e.target.value);
                document.getElementById('battery-threshold-value').textContent = `${e.target.value}%`;
                this.saveAlertSettings();
            });
        }

        if (gridThreshold) {
            gridThreshold.addEventListener('input', (e) => {
                this.alertSettings.gridThreshold = parseInt(e.target.value);
                document.getElementById('grid-threshold-value').textContent = `${e.target.value}%`;
                this.saveAlertSettings();
            });
        }

        if (pushNotifications) {
            pushNotifications.addEventListener('change', (e) => {
                this.alertSettings.pushNotifications = e.target.checked;
                this.saveAlertSettings();
            });
        }

        if (emailAlerts) {
            emailAlerts.addEventListener('change', (e) => {
                this.alertSettings.emailAlerts = e.target.checked;
                this.saveAlertSettings();
            });
        }
    }

    /**
     * Set alert filter
     */
    setFilter(filterType) {
        this.currentFilter = filterType;
        this.renderAlerts();
    }

    /**
     * Render alerts list
     */
    renderAlerts() {
        const alertsList = document.getElementById('alerts-list');
        if (!alertsList) return;

        const alerts = window.energyDataManager.getAlertsData();
        let filteredAlerts = alerts;

        // Apply filter
        if (this.currentFilter !== 'all') {
            filteredAlerts = alerts.filter(alert => alert.type === this.currentFilter);
        }

        // Only show non-dismissed alerts
        filteredAlerts = filteredAlerts.filter(alert => !alert.dismissed);

        if (filteredAlerts.length === 0) {
            alertsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle" style="font-size: 48px; color: #4caf50; margin-bottom: 15px;"></i>
                    <h3>No active alerts</h3>
                    <p>All systems are operating normally.</p>
                </div>
            `;
            return;
        }

        const alertsHTML = filteredAlerts.map(alert => this.createAlertHTML(alert)).join('');
        alertsList.innerHTML = alertsHTML;

        // Add dismiss event listeners
        alertsList.querySelectorAll('.dismiss-alert').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const alertId = parseInt(e.target.getAttribute('data-alert-id'));
                this.dismissAlert(alertId);
            });
        });
    }

    /**
     * Create HTML for individual alert
     */
    createAlertHTML(alert) {
        const timeAgo = this.getTimeAgo(alert.timestamp);
        const iconClass = this.getAlertIcon(alert.type);

        return `
            <div class="alert-item ${alert.type}">
                <div class="alert-icon">
                    <i class="fas ${iconClass}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${timeAgo}</div>
                </div>
                <button class="btn btn-secondary dismiss-alert" data-alert-id="${alert.id}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    /**
     * Get icon for alert type
     */
    getAlertIcon(type) {
        switch (type) {
            case 'critical':
                return 'fa-exclamation-triangle';
            case 'warning':
                return 'fa-exclamation-circle';
            case 'info':
                return 'fa-info-circle';
            default:
                return 'fa-bell';
        }
    }

    /**
     * Get time ago string
     */
    getTimeAgo(timestamp) {
        const now = new Date();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    }

    /**
     * Dismiss an alert
     */
    dismissAlert(alertId) {
        window.energyDataManager.dismissAlert(alertId);
        this.renderAlerts();
        
        // Update badge count
        if (window.dashboard) {
            window.dashboard.updateAlertBadge();
        }
    }

    /**
     * Clear all alerts
     */
    clearAllAlerts() {
        if (confirm('Are you sure you want to clear all alerts?')) {
            window.energyDataManager.clearDismissedAlerts();
            this.renderAlerts();
            
            // Update badge count
            if (window.dashboard) {
                window.dashboard.updateAlertBadge();
            }
        }
    }

    /**
     * Toggle alert settings panel
     */
    toggleAlertSettings() {
        const settingsPanel = document.getElementById('alert-settings');
        if (settingsPanel) {
            settingsPanel.classList.toggle('active');
        }
    }

    /**
     * Load alert settings
     */
    loadAlertSettings() {
        const savedSettings = localStorage.getItem('alertSettings');
        if (savedSettings) {
            this.alertSettings = { ...this.alertSettings, ...JSON.parse(savedSettings) };
        }

        // Update UI elements
        const batteryThreshold = document.getElementById('battery-threshold');
        const gridThreshold = document.getElementById('grid-threshold');
        const pushNotifications = document.getElementById('push-notifications');
        const emailAlerts = document.getElementById('email-alerts');

        if (batteryThreshold) {
            batteryThreshold.value = this.alertSettings.batteryThreshold;
            document.getElementById('battery-threshold-value').textContent = `${this.alertSettings.batteryThreshold}%`;
        }

        if (gridThreshold) {
            gridThreshold.value = this.alertSettings.gridThreshold;
            document.getElementById('grid-threshold-value').textContent = `${this.alertSettings.gridThreshold}%`;
        }

        if (pushNotifications) {
            pushNotifications.checked = this.alertSettings.pushNotifications;
        }

        if (emailAlerts) {
            emailAlerts.checked = this.alertSettings.emailAlerts;
        }
    }

    /**
     * Save alert settings
     */
    saveAlertSettings() {
        localStorage.setItem('alertSettings', JSON.stringify(this.alertSettings));
    }

    /**
     * Get alert settings
     */
    getAlertSettings() {
        return { ...this.alertSettings };
    }

    /**
     * Show notification (if enabled)
     */
    showNotification(title, message, type = 'info') {
        if (!this.alertSettings.pushNotifications) return;

        // Check if browser supports notifications
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(title, {
                    body: message,
                    icon: '/favicon.ico',
                    tag: type
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(title, {
                            body: message,
                            icon: '/favicon.ico',
                            tag: type
                        });
                    }
                });
            }
        }
    }

    /**
     * Update alerts display
     */
    update() {
        if (this.isInitialized) {
            this.renderAlerts();
        }
    }
}

// Create global instance
window.alertsManager = new AlertsManager();
