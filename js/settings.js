/**
 * Settings & Language Management Module
 * Handles user preferences, language settings, and configuration management
 */

class SettingsManager {
    constructor() {
        this.settings = {
            general: {
                language: 'en',
                theme: 'dark',
                timezone: 'UTC'
            },
            dashboard: {
                updateFrequency: 5000,
                defaultChartPeriod: '24h',
                showAnimations: true
            },
            units: {
                energy: 'kwh',
                power: 'kw',
                temperature: 'celsius'
            },
            data: {
                retentionPeriod: 90,
                shareUsageData: false,
                cloudBackup: true
            }
        };
        this.isInitialized = false;
        this.languages = {
            'en': 'English',
            'es': 'Español',
            'fr': 'Français',
            'de': 'Deutsch',
            'zh': '中文'
        };
    }

    /**
     * Initialize the settings manager
     */
    initialize() {
        if (this.isInitialized) return;
        
        this.loadSettings();
        this.setupEventListeners();
        this.updateUI();
        this.isInitialized = true;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Save settings button
        const saveBtn = document.getElementById('save-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveSettings();
                this.showSaveConfirmation();
            });
        }

        // Reset settings button
        const resetBtn = document.getElementById('reset-settings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.resetSettings();
            });
        }

        // General settings
        this.setupGeneralSettings();
        
        // Dashboard preferences
        this.setupDashboardSettings();
        
        // Units & display
        this.setupUnitsSettings();
        
        // Data & privacy
        this.setupDataSettings();
    }

    /**
     * Setup general settings event listeners
     */
    setupGeneralSettings() {
        const languageSelect = document.getElementById('language-select');
        const themeSelect = document.getElementById('theme-select');
        const timezoneSelect = document.getElementById('timezone-select');

        if (languageSelect) {
            languageSelect.addEventListener('change', (e) => {
                this.settings.general.language = e.target.value;
                this.applyLanguage(e.target.value);
            });
        }

        if (themeSelect) {
            themeSelect.addEventListener('change', (e) => {
                this.settings.general.theme = e.target.value;
                this.applyTheme(e.target.value);
            });
        }

        if (timezoneSelect) {
            timezoneSelect.addEventListener('change', (e) => {
                this.settings.general.timezone = e.target.value;
            });
        }
    }

    /**
     * Setup dashboard settings event listeners
     */
    setupDashboardSettings() {
        const updateFrequency = document.getElementById('update-frequency');
        const defaultChartPeriod = document.getElementById('default-chart-period');
        const showAnimations = document.getElementById('show-animations');

        if (updateFrequency) {
            updateFrequency.addEventListener('change', (e) => {
                this.settings.dashboard.updateFrequency = parseInt(e.target.value);
                this.applyUpdateFrequency(parseInt(e.target.value));
            });
        }

        if (defaultChartPeriod) {
            defaultChartPeriod.addEventListener('change', (e) => {
                this.settings.dashboard.defaultChartPeriod = e.target.value;
            });
        }

        if (showAnimations) {
            showAnimations.addEventListener('change', (e) => {
                this.settings.dashboard.showAnimations = e.target.checked;
                this.applyAnimationSettings(e.target.checked);
            });
        }
    }

    /**
     * Setup units settings event listeners
     */
    setupUnitsSettings() {
        const energyUnit = document.getElementById('energy-unit');
        const powerUnit = document.getElementById('power-unit');
        const temperatureUnit = document.getElementById('temperature-unit');

        if (energyUnit) {
            energyUnit.addEventListener('change', (e) => {
                this.settings.units.energy = e.target.value;
            });
        }

        if (powerUnit) {
            powerUnit.addEventListener('change', (e) => {
                this.settings.units.power = e.target.value;
            });
        }

        if (temperatureUnit) {
            temperatureUnit.addEventListener('change', (e) => {
                this.settings.units.temperature = e.target.value;
            });
        }
    }

    /**
     * Setup data settings event listeners
     */
    setupDataSettings() {
        const dataRetention = document.getElementById('data-retention');
        const shareUsageData = document.getElementById('share-usage-data');
        const cloudBackup = document.getElementById('cloud-backup');

        if (dataRetention) {
            dataRetention.addEventListener('change', (e) => {
                this.settings.data.retentionPeriod = parseInt(e.target.value);
            });
        }

        if (shareUsageData) {
            shareUsageData.addEventListener('change', (e) => {
                this.settings.data.shareUsageData = e.target.checked;
            });
        }

        if (cloudBackup) {
            cloudBackup.addEventListener('change', (e) => {
                this.settings.data.cloudBackup = e.target.checked;
            });
        }
    }

    /**
     * Load settings from localStorage
     */
    loadSettings() {
        const savedSettings = localStorage.getItem('energyDashboardSettings');
        if (savedSettings) {
            try {
                const parsed = JSON.parse(savedSettings);
                this.settings = this.mergeSettings(this.settings, parsed);
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        }
    }

    /**
     * Merge settings objects
     */
    mergeSettings(defaults, saved) {
        const merged = { ...defaults };
        for (const category in saved) {
            if (merged[category]) {
                merged[category] = { ...merged[category], ...saved[category] };
            }
        }
        return merged;
    }

    /**
     * Save settings to localStorage
     */
    saveSettings() {
        try {
            localStorage.setItem('energyDashboardSettings', JSON.stringify(this.settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    /**
     * Reset settings to defaults
     */
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to their default values?')) {
            localStorage.removeItem('energyDashboardSettings');
            
            // Reset to default values
            this.settings = {
                general: {
                    language: 'en',
                    theme: 'dark',
                    timezone: 'UTC'
                },
                dashboard: {
                    updateFrequency: 5000,
                    defaultChartPeriod: '24h',
                    showAnimations: true
                },
                units: {
                    energy: 'kwh',
                    power: 'kw',
                    temperature: 'celsius'
                },
                data: {
                    retentionPeriod: 90,
                    shareUsageData: false,
                    cloudBackup: true
                }
            };
            
            this.updateUI();
            this.applyAllSettings();
            this.showResetConfirmation();
        }
    }

    /**
     * Update UI elements with current settings
     */
    updateUI() {
        // General settings
        const languageSelect = document.getElementById('language-select');
        const themeSelect = document.getElementById('theme-select');
        const timezoneSelect = document.getElementById('timezone-select');

        if (languageSelect) languageSelect.value = this.settings.general.language;
        if (themeSelect) themeSelect.value = this.settings.general.theme;
        if (timezoneSelect) timezoneSelect.value = this.settings.general.timezone;

        // Dashboard preferences
        const updateFrequency = document.getElementById('update-frequency');
        const defaultChartPeriod = document.getElementById('default-chart-period');
        const showAnimations = document.getElementById('show-animations');

        if (updateFrequency) updateFrequency.value = this.settings.dashboard.updateFrequency;
        if (defaultChartPeriod) defaultChartPeriod.value = this.settings.dashboard.defaultChartPeriod;
        if (showAnimations) showAnimations.checked = this.settings.dashboard.showAnimations;

        // Units & display
        const energyUnit = document.getElementById('energy-unit');
        const powerUnit = document.getElementById('power-unit');
        const temperatureUnit = document.getElementById('temperature-unit');

        if (energyUnit) energyUnit.value = this.settings.units.energy;
        if (powerUnit) powerUnit.value = this.settings.units.power;
        if (temperatureUnit) temperatureUnit.value = this.settings.units.temperature;

        // Data & privacy
        const dataRetention = document.getElementById('data-retention');
        const shareUsageData = document.getElementById('share-usage-data');
        const cloudBackup = document.getElementById('cloud-backup');

        if (dataRetention) dataRetention.value = this.settings.data.retentionPeriod;
        if (shareUsageData) shareUsageData.checked = this.settings.data.shareUsageData;
        if (cloudBackup) cloudBackup.checked = this.settings.data.cloudBackup;
    }

    /**
     * Apply language setting
     */
    applyLanguage(language) {
        // In a real implementation, this would load language files
        // For now, we'll just store the setting
        document.documentElement.lang = language;
        
        // Update any language-dependent UI elements
        this.updateLanguageDependentElements(language);
    }

    /**
     * Update language-dependent elements
     */
    updateLanguageDependentElements(language) {
        // This would typically load translations
        // For demo purposes, we'll just update the document language
        console.log(`Language changed to: ${this.languages[language] || language}`);
    }

    /**
     * Apply theme setting
     */
    applyTheme(theme) {
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        
        if (theme === 'light') {
            document.body.classList.add('theme-light');
            // Update chart theme
            if (window.chartManager) {
                window.chartManager.setTheme('light');
            }
        } else if (theme === 'auto') {
            // Use system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.body.classList.add(prefersDark ? 'theme-dark' : 'theme-light');
            
            if (window.chartManager) {
                window.chartManager.setTheme(prefersDark ? 'dark' : 'light');
            }
        } else {
            // Default to dark theme
            document.body.classList.add('theme-dark');
            if (window.chartManager) {
                window.chartManager.setTheme('dark');
            }
        }
    }

    /**
     * Apply update frequency setting
     */
    applyUpdateFrequency(frequency) {
        if (window.dashboard) {
            window.dashboard.setUpdateFrequency(frequency);
        }
    }

    /**
     * Apply animation settings
     */
    applyAnimationSettings(enabled) {
        document.body.classList.toggle('no-animations', !enabled);
        
        // Update CSS custom property for animations
        document.documentElement.style.setProperty(
            '--animation-duration', 
            enabled ? '0.3s' : '0s'
        );
    }

    /**
     * Apply all settings
     */
    applyAllSettings() {
        this.applyTheme(this.settings.general.theme);
        this.applyLanguage(this.settings.general.language);
        this.applyUpdateFrequency(this.settings.dashboard.updateFrequency);
        this.applyAnimationSettings(this.settings.dashboard.showAnimations);
    }

    /**
     * Show save confirmation
     */
    showSaveConfirmation() {
        this.showNotification('Settings saved successfully!', 'success');
    }

    /**
     * Show reset confirmation
     */
    showResetConfirmation() {
        this.showNotification('Settings reset to defaults!', 'info');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `settings-notification ${type}`;
        notification.innerHTML = `
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-info-circle'}"></i>
            ${message}
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : '#2196f3'};
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

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Get current settings
     */
    getSettings() {
        return { ...this.settings };
    }

    /**
     * Update specific setting
     */
    updateSetting(category, key, value) {
        if (this.settings[category] && this.settings[category].hasOwnProperty(key)) {
            this.settings[category][key] = value;
            return true;
        }
        return false;
    }

    /**
     * Export settings
     */
    exportSettings() {
        const dataStr = JSON.stringify(this.settings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `energy-dashboard-settings-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    /**
     * Import settings
     */
    importSettings(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedSettings = JSON.parse(e.target.result);
                    this.settings = this.mergeSettings(this.settings, importedSettings);
                    this.updateUI();
                    this.applyAllSettings();
                    this.saveSettings();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }

    /**
     * Get unit conversions
     */
    getUnitConversions() {
        return {
            energy: {
                'kwh': { factor: 1, symbol: 'kWh' },
                'mwh': { factor: 0.001, symbol: 'MWh' },
                'wh': { factor: 1000, symbol: 'Wh' }
            },
            power: {
                'kw': { factor: 1, symbol: 'kW' },
                'mw': { factor: 0.001, symbol: 'MW' },
                'w': { factor: 1000, symbol: 'W' }
            },
            temperature: {
                'celsius': { symbol: '°C' },
                'fahrenheit': { symbol: '°F' }
            }
        };
    }

    /**
     * Convert value to selected unit
     */
    convertValue(value, type, fromUnit = null) {
        const conversions = this.getUnitConversions();
        const targetUnit = this.settings.units[type];
        
        if (!conversions[type] || !conversions[type][targetUnit]) {
            return value;
        }
        
        if (type === 'temperature' && fromUnit === 'celsius' && targetUnit === 'fahrenheit') {
            return (value * 9/5) + 32;
        } else if (type === 'temperature' && fromUnit === 'fahrenheit' && targetUnit === 'celsius') {
            return (value - 32) * 5/9;
        } else if (conversions[type][targetUnit].factor) {
            return value * conversions[type][targetUnit].factor;
        }
        
        return value;
    }
}

// Create global instance
window.settingsManager = new SettingsManager();

// Initialize settings when page loads
window.addEventListener('load', () => {
    window.settingsManager.initialize();
    window.settingsManager.applyAllSettings();
});
