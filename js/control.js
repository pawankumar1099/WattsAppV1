/**
 * Control Panel Management Module
 * Handles system controls, device management, and automated scheduling
 */

class ControlManager {
    constructor() {
        this.isInitialized = false;
        this.controlsData = null;
    }

    /**
     * Initialize the control manager
     */
    initialize() {
        if (this.isInitialized) return;
        
        this.setupEventListeners();
        this.loadControlsData();
        this.updateDisplay();
        this.isInitialized = true;
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // System control toggles
        this.setupSystemControls();
        
        // Energy limit controls
        this.setupEnergyLimits();
        
        // Emergency stop button
        const emergencyStop = document.getElementById('emergency-stop');
        if (emergencyStop) {
            emergencyStop.addEventListener('click', () => {
                this.handleEmergencyStop();
            });
        }

        // Add schedule button
        const addScheduleBtn = document.getElementById('add-schedule');
        if (addScheduleBtn) {
            addScheduleBtn.addEventListener('click', () => {
                this.showAddScheduleDialog();
            });
        }
    }

    /**
     * Setup system control toggles
     */
    setupSystemControls() {
        const controls = [
            'grid-toggle',
            'auto-balance',
            'battery-charging'
        ];

        controls.forEach(controlId => {
            const toggle = document.getElementById(controlId);
            if (toggle) {
                toggle.addEventListener('change', (e) => {
                    this.updateSystemControl(controlId, e.target.checked);
                });
            }
        });
    }

    /**
     * Setup energy limit controls
     */
    setupEnergyLimits() {
        // Max grid import
        const maxGridImport = document.getElementById('max-grid-import');
        if (maxGridImport) {
            maxGridImport.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                document.getElementById('max-grid-value').textContent = `${value} kW`;
                this.updateEnergyLimit('maxGridImport', value);
            });
        }

        // Battery discharge limit
        const batteryDischargeLimit = document.getElementById('battery-discharge-limit');
        if (batteryDischargeLimit) {
            batteryDischargeLimit.addEventListener('input', (e) => {
                const value = parseInt(e.target.value);
                document.getElementById('discharge-limit-value').textContent = `${value}%`;
                this.updateEnergyLimit('batteryDischargeLimit', value);
            });
        }

        // Load priority
        const loadPriority = document.getElementById('load-priority');
        if (loadPriority) {
            loadPriority.addEventListener('change', (e) => {
                this.updateEnergyLimit('loadPriority', e.target.value);
            });
        }
    }

    /**
     * Load controls data
     */
    loadControlsData() {
        this.controlsData = window.energyDataManager.getControlsData();
        
        // Update UI elements with current values
        this.updateControlsUI();
    }

    /**
     * Update controls UI with current values
     */
    updateControlsUI() {
        if (!this.controlsData) return;

        // System controls
        const gridToggle = document.getElementById('grid-toggle');
        const autoBalance = document.getElementById('auto-balance');
        const batteryCharging = document.getElementById('battery-charging');

        if (gridToggle) {
            gridToggle.checked = this.controlsData.systemControls.gridConnection;
        }
        if (autoBalance) {
            autoBalance.checked = this.controlsData.systemControls.autoLoadBalancing;
        }
        if (batteryCharging) {
            batteryCharging.checked = this.controlsData.systemControls.batteryCharging;
        }

        // Energy limits
        const maxGridImport = document.getElementById('max-grid-import');
        const batteryDischargeLimit = document.getElementById('battery-discharge-limit');
        const loadPriority = document.getElementById('load-priority');

        if (maxGridImport) {
            maxGridImport.value = this.controlsData.energyLimits.maxGridImport;
            document.getElementById('max-grid-value').textContent = `${this.controlsData.energyLimits.maxGridImport} kW`;
        }
        if (batteryDischargeLimit) {
            batteryDischargeLimit.value = this.controlsData.energyLimits.batteryDischargeLimit;
            document.getElementById('discharge-limit-value').textContent = `${this.controlsData.energyLimits.batteryDischargeLimit}%`;
        }
        if (loadPriority) {
            loadPriority.value = this.controlsData.energyLimits.loadPriority;
        }
    }

    /**
     * Update display
     */
    updateDisplay() {
        this.updateDeviceControls();
        this.updateSchedulesList();
    }

    /**
     * Update device controls list
     */
    updateDeviceControls() {
        const deviceControlList = document.getElementById('device-control-list');
        if (!deviceControlList) return;

        const householdData = window.energyDataManager.getHouseholdData();
        const allDevices = [];

        // Collect all devices from all households
        householdData.households.forEach(household => {
            household.devices.forEach(device => {
                allDevices.push({
                    ...device,
                    householdId: household.id,
                    householdName: household.name
                });
            });
        });

        if (allDevices.length === 0) {
            deviceControlList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-plug" style="font-size: 48px; color: #888; margin-bottom: 15px;"></i>
                    <h3>No devices found</h3>
                    <p>No controllable devices are available.</p>
                </div>
            `;
            return;
        }

        const devicesHTML = allDevices.map(device => this.createDeviceControlHTML(device)).join('');
        deviceControlList.innerHTML = devicesHTML;

        // Add event listeners for device controls
        deviceControlList.querySelectorAll('.device-control-toggle').forEach(toggle => {
            toggle.addEventListener('change', (e) => {
                const householdId = e.target.getAttribute('data-household');
                const deviceName = e.target.getAttribute('data-device');
                this.toggleDeviceControl(householdId, deviceName);
            });
        });
    }

    /**
     * Create HTML for device control
     */
    createDeviceControlHTML(device) {
        const priorityClass = device.priority === 'high' ? 'priority-high' : 
                            device.priority === 'medium' ? 'priority-medium' : 'priority-low';
        
        return `
            <div class="device-control-item">
                <div class="device-info">
                    <div class="device-name">${device.name}</div>
                    <div class="device-status">
                        ${device.householdName} • ${device.power} kW • 
                        <span class="${priorityClass}">${device.priority} priority</span>
                    </div>
                </div>
                <div class="toggle-switch">
                    <input type="checkbox" class="device-control-toggle" 
                           data-household="${device.householdId}" 
                           data-device="${device.name}"
                           ${device.status === 'on' ? 'checked' : ''}>
                    <span class="slider"></span>
                </div>
            </div>
        `;
    }

    /**
     * Toggle device control
     */
    toggleDeviceControl(householdId, deviceName) {
        window.energyDataManager.toggleDevice(householdId, deviceName);
        
        // Update household manager if active
        if (window.householdManager && window.householdManager.isInitialized) {
            window.householdManager.update();
        }
    }

    /**
     * Update system control
     */
    updateSystemControl(controlId, value) {
        const controlMap = {
            'grid-toggle': 'gridConnection',
            'auto-balance': 'autoLoadBalancing',
            'battery-charging': 'batteryCharging'
        };

        const controlName = controlMap[controlId];
        if (controlName) {
            window.energyDataManager.updateControlSetting('systemControls', controlName, value);
        }
    }

    /**
     * Update energy limit
     */
    updateEnergyLimit(limitName, value) {
        window.energyDataManager.updateControlSetting('energyLimits', limitName, value);
    }

    /**
     * Update schedules list
     */
    updateSchedulesList() {
        const scheduleList = document.getElementById('schedule-list');
        if (!scheduleList) return;

        const schedules = window.energyDataManager.getSchedulesData();

        if (schedules.length === 0) {
            scheduleList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-calendar-alt" style="font-size: 48px; color: #888; margin-bottom: 15px;"></i>
                    <h3>No schedules configured</h3>
                    <p>Create automated schedules to optimize energy usage.</p>
                </div>
            `;
            return;
        }

        const schedulesHTML = schedules.map(schedule => this.createScheduleHTML(schedule)).join('');
        scheduleList.innerHTML = schedulesHTML;

        // Add event listeners for schedule toggles
        scheduleList.querySelectorAll('.schedule-toggle-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scheduleId = parseInt(e.target.getAttribute('data-schedule-id'));
                this.toggleSchedule(scheduleId);
            });
        });
    }

    /**
     * Create HTML for schedule
     */
    createScheduleHTML(schedule) {
        return `
            <div class="schedule-item">
                <div class="schedule-header">
                    <span class="schedule-name">${schedule.name}</span>
                    <button class="schedule-toggle-btn ${schedule.active ? 'active' : ''}" 
                            data-schedule-id="${schedule.id}">
                        <i class="fas ${schedule.active ? 'fa-toggle-on' : 'fa-toggle-off'}"></i>
                    </button>
                </div>
                <div class="schedule-details">
                    <div><strong>Time:</strong> ${schedule.time}</div>
                    <div><strong>Action:</strong> ${schedule.action}</div>
                    <div><strong>Conditions:</strong> ${schedule.conditions}</div>
                </div>
            </div>
        `;
    }

    /**
     * Toggle schedule
     */
    toggleSchedule(scheduleId) {
        window.energyDataManager.toggleSchedule(scheduleId);
        this.updateSchedulesList();
    }

    /**
     * Handle emergency stop
     */
    handleEmergencyStop() {
        if (confirm('Are you sure you want to trigger an emergency stop? This will shut down all non-essential systems.')) {
            // Update all system controls to safe state
            window.energyDataManager.updateControlSetting('systemControls', 'gridConnection', false);
            window.energyDataManager.updateControlSetting('systemControls', 'autoLoadBalancing', false);
            
            // Turn off all non-essential devices
            const householdData = window.energyDataManager.getHouseholdData();
            householdData.households.forEach(household => {
                household.devices.forEach(device => {
                    if (device.priority === 'low') {
                        device.status = 'off';
                    }
                });
            });

            // Update UI
            this.updateControlsUI();
            this.updateDisplay();
            
            // Show confirmation
            alert('Emergency stop activated. All non-essential systems have been shut down.');
        }
    }

    /**
     * Show add schedule dialog
     */
    showAddScheduleDialog() {
        const name = prompt('Enter schedule name:');
        if (!name) return;

        const time = prompt('Enter time range (e.g., "22:00 - 06:00"):');
        if (!time) return;

        const action = prompt('Enter action (e.g., "Charge EV"):');
        if (!action) return;

        const conditions = prompt('Enter conditions (e.g., "Low grid rates"):');
        if (!conditions) return;

        const newSchedule = {
            name,
            time,
            action,
            conditions
        };

        window.energyDataManager.addSchedule(newSchedule);
        this.updateSchedulesList();
    }

    /**
     * Get control status
     */
    getControlStatus() {
        return {
            systemControls: this.controlsData?.systemControls || {},
            energyLimits: this.controlsData?.energyLimits || {},
            schedules: window.energyDataManager.getSchedulesData(),
            deviceCount: this.getDeviceCount()
        };
    }

    /**
     * Get device count
     */
    getDeviceCount() {
        const householdData = window.energyDataManager.getHouseholdData();
        return householdData.households.reduce((total, household) => {
            return total + household.devices.length;
        }, 0);
    }

    /**
     * Update from external data changes
     */
    update() {
        if (this.isInitialized) {
            this.loadControlsData();
            this.updateDisplay();
        }
    }
}

// Create global instance
window.controlManager = new ControlManager();
