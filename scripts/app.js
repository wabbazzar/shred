// Shred - Main Application
// Mobile-first PWA with offline functionality

class WorkoutApp {
    constructor() {
        this.currentView = 'calendar';
        this.currentWeek = 1;
        this.currentDay = 1;
        
        // Initialize core modules
        this.dataManager = new DataManager();
        this.navigationManager = null; // Will be initialized after DOM setup
        
        this.init();
    }

    async init() {
        console.log('🚀 Workout Tracker initializing...');
        
        try {
            // Wait for data manager to initialize
            await this.dataManager.init();
            
            // Initialize view controllers
            this.dayView = new DayView(this);
            this.weekView = new WeekView(this);
            this.calendarView = new CalendarView(this);
            
            // Initialize navigation system
            this.navigationManager = new NavigationManager(this);
            
            // Set up settings button
            this.setupSettingsButton();
            
            // Set up service worker
            await this.setupServiceWorker();
            
            // Initialize views
            this.initializeViews();
            
            // Set current day/week based on date
            this.setCurrentDate();
            
            // Show initial view
            this.showView(this.currentView);
            
            console.log('✅ Workout Tracker initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
            this.showError('Failed to load workout data. Please refresh the page.');
        }
    }

    // Data Access Methods (delegate to DataManager)
    get workoutData() {
        return this.dataManager.workoutData;
    }

    get userProgress() {
        return this.dataManager.userProgress;
    }

    get settings() {
        return this.dataManager.settings;
    }

    // Data manipulation methods (delegate to DataManager)
    updateExerciseProgress(week, day, exerciseIndex, data) {
        return this.dataManager.updateExerciseProgress(week, day, exerciseIndex, data);
    }

    getExerciseProgress(week, day, exerciseIndex) {
        return this.dataManager.getExerciseProgress(week, day, exerciseIndex);
    }

    getDayCompletion(week, day) {
        return this.dataManager.calculateDayCompletion(week, day);
    }

    getWeekCompletion(week) {
        return this.dataManager.calculateWeekCompletion(week);
    }

    // Settings button setup (navigation handles tabs)
    setupSettingsButton() {
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                this.showSettings();
            });
        }
        console.log('⚙️ Settings button setup complete');
    }

    showView(viewName) {
        // Update current view
        this.currentView = viewName;
        
        // Hide all views
        document.querySelectorAll('.view').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show selected view
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }
        
        // Update tab buttons with force refresh
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            // Force reflow to ensure class removal takes effect
            btn.offsetHeight;
        });
        
        const activeTab = document.querySelector(`[data-view="${viewName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
            // Force reflow to ensure class addition takes effect
            activeTab.offsetHeight;
        }
        
        // Initialize view-specific functionality
        this.initializeCurrentView();
        
        console.log(`📱 Switched to ${viewName} view`);
    }

    initializeCurrentView() {
        switch (this.currentView) {
            case 'day':
                this.initializeDayView();
                break;
            case 'week':
                this.initializeWeekView();
                break;
            case 'calendar':
                this.initializeCalendarView();
                break;
        }
        
        // Debug: Log completion for current day to check consistency
        const currentCompletion = this.getDayCompletion(this.currentWeek, this.currentDay);
        console.log(`🔍 View: ${this.currentView}, Week ${this.currentWeek}, Day ${this.currentDay}: ${currentCompletion}% complete`);
    }

    initializeViews() {
        // Create placeholder content for views that don't exist yet
        this.createPlaceholderContent();
    }

    createPlaceholderContent() {
        const dayView = document.getElementById('day-view');
        const weekView = document.getElementById('week-view');
        const calendarView = document.getElementById('calendar-view');

        if (dayView && !dayView.innerHTML.trim()) {
            dayView.innerHTML = `
                <div class="day-header">
                    <h2>Week ${this.currentWeek}, Day ${this.currentDay}</h2>
                    <div class="completion-badge">0%</div>
                </div>
                <div class="placeholder-content">
                    <h3>Day View</h3>
                    <p>Detailed workout view will be implemented here</p>
                    <p>Current: Week ${this.currentWeek}, Day ${this.currentDay}</p>
                </div>
            `;
        }

        if (weekView && !weekView.innerHTML.trim()) {
            weekView.innerHTML = `
                <div class="week-header">
                    <h2>Week ${this.currentWeek}</h2>
                    <div class="week-controls">
                        <button class="week-nav" id="prev-week">‹</button>
                        <button class="week-nav" id="next-week">›</button>
                    </div>
                </div>
                <div class="placeholder-content">
                    <h3>Week View</h3>
                    <p>Weekly overview grid will be implemented here</p>
                    <div class="week-grid">
                        ${Array.from({length: 7}, (_, i) => `
                            <div class="day-tile" data-day="${i + 1}">
                                <div>Day ${i + 1}</div>
                                <div>0%</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        if (calendarView && !calendarView.innerHTML.trim()) {
            const totalWeeks = this.dataManager.workoutData?.weeks || 6;
            const totalDays = totalWeeks * 7;
            
            calendarView.innerHTML = `
                <div class="calendar-header">
                    <h2>${totalWeeks}-Week Program Calendar</h2>
                </div>
                <div class="placeholder-content">
                    <h3>Calendar View</h3>
                    <p>${totalWeeks}-week calendar grid will be implemented here</p>
                    <div class="calendar-grid">
                        ${Array.from({length: totalDays}, (_, i) => `
                            <div class="calendar-day" data-day="${i + 1}">
                                <div>${i + 1}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
    }

    initializeDayView() {
        // Render day view with current week/day
        if (this.dayView) {
            this.dayView.render(this.currentWeek, this.currentDay);
        }
        console.log('📅 Day view initialized');
    }

    initializeWeekView() {
        // Render week view with current week
        if (this.weekView) {
            this.weekView.render(this.currentWeek);
        }
        console.log('📋 Week view initialized');
    }

    initializeCalendarView() {
        // Render calendar view with current data
        if (this.calendarView) {
            this.calendarView.render();
        }
        console.log('🗓️ Calendar view initialized');
    }

    updateWeekView() {
        const weekHeader = document.querySelector('.week-header h2');
        if (weekHeader) {
            weekHeader.textContent = `Week ${this.currentWeek}`;
        }
    }

    // Date Management
    setCurrentDate() {
        const startDateStr = this.settings?.startDate;
        
        // If no start date is set, show Week 1 Day 1 but no "today" indicators
        if (!startDateStr) {
            this.currentWeek = 1;
            this.currentDay = 1;
            this.programStarted = false;
            console.log(`📅 Program not started yet. Set start date in settings. Showing Week 1, Day 1`);
            return;
        }
        
        const today = new Date();
        
        // Create date object using local timezone to avoid timezone issues
        const [year, month, day] = startDateStr.split('-').map(Number);
        const programStart = new Date(year, month - 1, day); // month is 0-indexed
        
        const daysDiff = Math.floor((today - programStart) / (1000 * 60 * 60 * 24));
        
        console.log(`📅 Program started: ${programStart.toDateString()}, Days since start: ${daysDiff}`);
        
        this.programStarted = true;
        
        const totalWeeks = this.dataManager.workoutData?.weeks || 6;
        const totalDays = totalWeeks * 7;
        
        if (daysDiff >= 0 && daysDiff < totalDays) {
            this.currentWeek = Math.floor(daysDiff / 7) + 1;
            this.currentDay = (daysDiff % 7) + 1;
        } else if (daysDiff >= totalDays) {
            // Program completed - show last week/day
            this.currentWeek = totalWeeks;
            this.currentDay = 7;
            console.log(`📅 Program completed! Showing final week/day`);
        } else {
            // Program hasn't started yet - show first week/day
            this.currentWeek = 1;
            this.currentDay = 1;
            console.log(`📅 Program starts in ${Math.abs(daysDiff)} days. Showing first week/day`);
        }
        
        console.log(`📅 Current date set: Week ${this.currentWeek}, Day ${this.currentDay}`);
    }

    // Method to set program start date
    setProgramStartDate(dateString) {
        try {
            // Validate date format
            const testDate = new Date(dateString);
            if (isNaN(testDate.getTime())) {
                throw new Error('Invalid date format');
            }

            // Update settings
            this.dataManager.settings.startDate = dateString;
            this.dataManager.saveSettings();
            
            // Recalculate current week/day
            this.setCurrentDate();
            
            // Refresh all views to reflect new current day
            this.refreshAllViews();
            
            console.log(`📅 Program start date updated to: ${testDate.toDateString()}`);
            return { success: true, startDate: testDate.toDateString() };
            
        } catch (error) {
            console.error('❌ Failed to set program start date:', error);
            return { success: false, error: error.message };
        }
    }

    // Service Worker Setup
    async setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./service-worker.js');
                console.log('🔧 Service Worker registered:', registration);
                
                // Listen for updates
                registration.addEventListener('updatefound', () => {
                    console.log('🔄 Service Worker update found');
                });
                
            } catch (error) {
                console.warn('⚠️ Service Worker registration failed:', error);
            }
        }
    }

    // Utility Methods
    showError(message) {
        console.error('❌ Error:', message);
        // Could implement toast notifications here
        alert(message); // Temporary error display
    }

    // Debug method to check day consistency across views
    debugDayConsistency(dayNum = 2) { // Default to Tuesday
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const dayName = dayNames[dayNum - 1];
        
        console.log(`🐛 Debugging ${dayName} (Day ${dayNum}) consistency across views...`);
        
        // Show all stored progress data
        console.log('📊 All stored progress data:', this.userProgress);
        
        for (let week = 1; week <= 6; week++) {
            const completion = this.getDayCompletion(week, dayNum);
            const exercises = this.dataManager.getExercisesForDay(week, dayNum);
            const dayData = this.dataManager.getDayInfo(week, dayNum);
            
            // Check if today
            const isToday = this.weekView?.isToday(week, dayNum) || this.calendarView?.isToday(week, dayNum);
            const isCurrent = this.currentWeek === week && this.currentDay === dayNum;
            
            console.log(`Week ${week}, ${dayName}:`);
            console.log(`  - Completion: ${completion}%`);
            console.log(`  - Exercises: ${exercises.length}`);
            console.log(`  - Is Today: ${isToday}`);
            console.log(`  - Is Current: ${isCurrent}`);
            console.log(`  - Day Data:`, dayData);
            
            // Check individual exercise progress
            exercises.forEach((exercise, index) => {
                const progress = this.getExerciseProgress(week, dayNum, index);
                if (progress && progress.completed) {
                    console.log(`    - Exercise ${index} (${exercise.name}): COMPLETED`, progress);
                }
            });
        }
    }

    // Method to clear specific day completion data
    clearDayData(dayNum, dayName = null) {
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const actualDayName = dayName || dayNames[dayNum - 1];
        
        console.log(`🧹 Clearing all ${actualDayName} (Day ${dayNum}) completion data...`);
        
        // Find and remove all entries for this day
        const keysToRemove = [];
        for (const key in this.userProgress) {
            if (key.includes(`-d${dayNum}-`)) {
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            delete this.userProgress[key];
            console.log(`Removed: ${key}`);
        });
        
        // Save the cleaned data
        this.dataManager.saveUserProgress();
        
        console.log(`✅ Cleared ${keysToRemove.length} ${actualDayName} entries`);
        
        // Refresh all views
        this.refreshAllViews();
    }

    // Method to clear all Friday completion data
    clearFridayData() {
        console.log('🧹 Clearing all Friday completion data...');
        
        // Find and remove all Friday progress entries
        const keysToRemove = [];
        for (const key in this.userProgress) {
            if (key.includes('-d5-')) { // Day 5 = Friday
                keysToRemove.push(key);
            }
        }
        
        keysToRemove.forEach(key => {
            delete this.userProgress[key];
            console.log(`Removed: ${key}`);
        });
        
        // Save the cleaned data
        this.dataManager.saveUserProgress();
        
        console.log(`✅ Cleared ${keysToRemove.length} Friday entries`);
        
        // Re-render calendar view
        if (this.currentView === 'calendar') {
            this.initializeCalendarView();
        }
    }

    // Method to force refresh all views and ensure consistency
    refreshAllViews() {
        console.log('🔄 Refreshing all views for consistency...');
        
        // Save current state
        const currentView = this.currentView;
        const currentWeek = this.currentWeek;
        const currentDay = this.currentDay;
        
        // Force re-render all views
        if (this.dayView) {
            this.dayView.render(currentWeek, currentDay);
        }
        if (this.weekView) {
            this.weekView.render(currentWeek);
        }
        if (this.calendarView) {
            this.calendarView.render();
        }
        
        // Re-initialize current view
        this.showView(currentView);
        
        console.log('✅ All views refreshed');
    }

    async showSettings() {
        console.log('🔧 Opening settings...');
        
        const modal = document.getElementById('settings-modal');
        const modalBody = modal.querySelector('.modal-body');
        
        // Get current program list for dropdown
        const programList = await this.dataManager.getProgramList();
        const currentProgram = await this.dataManager.getCurrentProgramInfo();
        
        // Create settings content with sections
        modalBody.innerHTML = `
            <!-- Program Management Section -->
            <div class="settings-section">
                <div class="section-header-settings">
                    <h3>Program Management</h3>
                </div>
                <div class="section-content-settings">
                    <div class="program-cards-container" id="program-cards-container">
                        <!-- Program cards will be loaded here -->
                    </div>
                    
                    <div class="program-actions-section">
                        <div class="settings-item">
                            <div>
                                <div class="settings-label">Program Start Date</div>
                                <div class="settings-description">Set when you started the active program</div>
                            </div>
                            <div class="settings-control">
                                <input type="date" class="settings-input" id="start-date-input" value="">
                            </div>
                        </div>
                        
                        <div class="settings-item">
                            <div>
                                <div class="settings-label">Save Current Progress</div>
                                <div class="settings-description">Save current progress as a new program</div>
                            </div>
                            <div class="settings-control">
                                <button class="settings-btn" id="save-program-btn">Save As...</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            
            <!-- App Settings Section -->
            <div class="settings-section">
                <div class="section-header-settings">
                    <h3>App Settings</h3>
                </div>
                <div class="section-content-settings">
                    <div class="settings-item">
                        <div>
                            <div class="settings-label">Current Program Info</div>
                            <div class="settings-description">${currentProgram ? currentProgram.name : 'No program loaded'}</div>
                        </div>
                        <div class="settings-control">
                            <span class="settings-label">${currentProgram ? (currentProgram.hasProgress ? 'In Progress' : 'Not Started') : 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="settings-item">
                        <div>
                            <div class="settings-label">Storage Used</div>
                            <div class="settings-description">Local storage usage for app data</div>
                        </div>
                        <div class="settings-control">
                            <span class="settings-label" id="storage-usage">Calculating...</span>
                        </div>
                    </div>
                    
                    <div class="settings-item">
                        <div>
                            <div class="settings-label">Clear Cache</div>
                            <div class="settings-description">Clear app cache and reload</div>
                        </div>
                        <div class="settings-control">
                            <button class="settings-btn secondary" id="clear-cache-btn">Clear Cache</button>
                        </div>
                    </div>
                    
                    <div class="settings-item">
                        <div>
                            <div class="settings-label">JSON Format Reference</div>
                            <div class="settings-description">View example JSON format for workout programs</div>
                        </div>
                        <div class="settings-control">
                            <a href="assets/workouts/six_week_shred.json" target="_blank" class="settings-btn secondary">View Example</a>
                        </div>
                    </div>
                    

                    
                    <div class="settings-item">
                        <div>
                            <div class="settings-label">Share App</div>
                            <div class="settings-description">Share Shred with friends and family</div>
                        </div>
                        <div class="settings-control">
                            <button class="settings-btn secondary" id="share-app-btn">Share</button>
                        </div>
                    </div>
                    
                    <div class="settings-item">
                        <div>
                            <div class="settings-label">About</div>
                            <div class="settings-description">Mobile-first PWA for engagement workout tracking</div>
                        </div>
                        <div class="settings-control">
                            <button class="settings-btn secondary" id="about-btn">Info</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Populate program cards
        await this.populateProgramCards(programList);
        
        // Set up event listeners for settings
        this.setupSettingsEventListeners();
        
        // Initialize settings values
        this.initializeSettingsValues();
        
        // Show modal with animation
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        
        console.log('⚙️ Settings modal opened successfully');
    }

    async generateProgramCards(programList) {
        const cards = [];
        
        for (const program of programList) {
            const programTypeMap = {
                'six-week-shred': 'six_week_shred',
                'nsuns-cap3': 'nsuns_cap3'
            };
            
            const programType = programTypeMap[program.id] || 'unknown';
            const isActive = program.isActive;
            const hasProgress = program.hasProgress;
            const isDefault = program.isDefault;
            
            // Get program description/focus
            let programFocus = '';
            if (program.id === 'six-week-shred') {
                programFocus = 'Engagement photo prep • 6 weeks • Intermediate';
            } else if (program.id === 'nsuns-cap3') {
                programFocus = 'Powerlifting strength • 3 weeks • Advanced';
            } else {
                programFocus = 'Custom program';
            }
            
            const card = `
                <div class="program-card ${isActive ? 'active' : ''}" data-program-id="${program.id}">
                    <div class="program-card-header">
                        <div class="program-card-title">
                            <h4>${program.name}</h4>
                            <div class="program-card-badges">
                                ${isActive ? '<span class="program-badge active">ACTIVE</span>' : ''}
                                ${isDefault ? '<span class="program-badge default">DEFAULT</span>' : ''}
                                ${hasProgress ? '<span class="program-badge progress">⭐</span>' : ''}
                            </div>
                        </div>
                        <div class="program-card-description">${programFocus}</div>
                        <div class="program-card-meta">
                            Created: ${new Date(program.created).toLocaleDateString()}
                            ${hasProgress ? ` • Progress: ${Math.round(Math.random() * 100)}%` : ' • Not started'}
                        </div>
                    </div>
                    
                    <div class="program-card-actions">
                        <button class="program-action-btn view-details" data-program-type="${programType}" data-program-id="${program.id}">
                            📖 View Details
                        </button>
                        ${!isActive ? `<button class="program-action-btn switch-program" data-program-id="${program.id}">🔄 Switch</button>` : ''}
                        <button class="program-action-btn save-as" data-program-id="${program.id}">💾 Save As</button>
                        ${!isDefault && !isActive ? `<button class="program-action-btn delete-program" data-program-id="${program.id}">🗑️ Delete</button>` : ''}
                        ${isActive ? `<button class="program-action-btn reset-program" data-program-id="${program.id}">🔄 Reset</button>` : ''}
                    </div>
                </div>
            `;
            
            cards.push(card);
        }
        
        // Add "Load New Program" card
        const loadNewCard = `
            <div class="program-card load-new">
                <div class="program-card-header">
                    <div class="program-card-title">
                        <h4>➕ Load New Program</h4>
                    </div>
                    <div class="program-card-description">Import or create a new workout program</div>
                </div>
                
                <div class="program-card-actions">
                    <button class="program-action-btn import-json">📁 Import JSON</button>
                    <button class="program-action-btn from-url">🔗 From URL</button>
                    <button class="program-action-btn create-custom">✨ Create Custom</button>
                </div>
            </div>
        `;
        
        cards.push(loadNewCard);
        
        return cards.join('');
    }

    async populateProgramCards(programList) {
        const container = document.getElementById('program-cards-container');
        if (container) {
            const cardsHTML = await this.generateProgramCards(programList);
            container.innerHTML = cardsHTML;
        }
    }
    
    setupSettingsEventListeners() {
        const modal = document.getElementById('settings-modal');
        
        // Close button
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => this.closeSettings());
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeSettings();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                this.closeSettings();
            }
        });
        
        // Program card actions
        const programCards = document.querySelectorAll('.program-action-btn');
        programCards.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.classList.contains('view-details') ? 'view-details' :
                              e.target.classList.contains('switch-program') ? 'switch' :
                              e.target.classList.contains('save-as') ? 'save-as' :
                              e.target.classList.contains('delete-program') ? 'delete' :
                              e.target.classList.contains('reset-program') ? 'reset' :
                              e.target.classList.contains('import-json') ? 'import-json' :
                              e.target.classList.contains('from-url') ? 'from-url' :
                              e.target.classList.contains('create-custom') ? 'create-custom' : '';
                
                const programId = e.target.dataset.programId;
                const programType = e.target.dataset.programType;
                
                this.handleProgramCardAction(action, programId, programType);
            });
        });
        
        // Program management
        const saveProgramBtn = document.getElementById('save-program-btn');
        if (saveProgramBtn) {
            saveProgramBtn.addEventListener('click', () => {
                this.showSaveProgramDialog();
            });
        }
        
        const startDateInput = document.getElementById('start-date-input');
        if (startDateInput) {
            startDateInput.addEventListener('change', (e) => {
                this.updateProgramStartDate(e.target.value);
            });
        }
        
        // App settings
        document.getElementById('clear-cache-btn').addEventListener('click', () => {
            this.clearAppCache();
        });
        
        document.getElementById('share-app-btn').addEventListener('click', () => {
            this.shareApp();
        });
        
        document.getElementById('about-btn').addEventListener('click', () => {
            this.showAboutDialog();
        });
        
        console.log('⚙️ Settings event listeners setup complete');
    }
    
    initializeSettingsValues() {
        // Set current program start date
        const startDateInput = document.getElementById('start-date-input');
        const startDate = this.dataManager.settings.programStartDate;
        if (startDate) {
            startDateInput.value = startDate;
        }
        
        // Calculate storage usage
        this.calculateStorageUsage();
        
        console.log('⚙️ Settings values initialized');
    }
    
    closeSettings() {
        const modal = document.getElementById('settings-modal');
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
        console.log('⚙️ Settings modal closed');
    }
    
    async handleProgramSelection(programId) {
        try {
            const currentProgram = await this.dataManager.getCurrentProgramInfo();
            if (currentProgram && currentProgram.id === programId) {
                return; // Already selected
            }
            
            this.showProgramSwitchDialog(programId);
        } catch (error) {
            this.showSettingsMessage('Failed to handle program selection: ' + error.message, 'error');
            console.error('❌ Program selection error:', error);
        }
    }
    
    async handleProgramCardAction(action, programId, programType) {
        try {
            switch (action) {
                case 'view-details':
                    if (programType && programType !== 'unknown') {
                        await this.showWorkoutDescription(programType);
                    } else {
                        alert('Program details not available for this program.');
                    }
                    break;
                case 'switch':
                    await this.showProgramSwitchDialog(programId);
                    break;
                case 'save-as':
                    await this.showSaveProgramDialog();
                    break;
                case 'delete':
                    await this.showDeleteProgramDialog(programId);
                    break;
                case 'reset':
                    await this.showResetProgramDialog();
                    break;
                case 'import-json':
                    this.showImportJsonDialog();
                    break;
                case 'from-url':
                    this.showFromUrlDialog();
                    break;
                case 'create-custom':
                    this.showCreateCustomDialog();
                    break;
                default:
                    console.warn('Unknown program card action:', action);
            }
        } catch (error) {
            this.showSettingsMessage('Failed to perform program action: ' + error.message, 'error');
            console.error('❌ Program card action error:', error);
        }
    }

    async handleProgramAction(action, programId) {
        try {
            switch (action) {
                case 'switch':
                    this.showProgramSwitchDialog(programId);
                    break;
                case 'delete':
                    this.showDeleteProgramDialog(programId);
                    break;
                default:
                    console.warn('Unknown program action:', action);
            }
        } catch (error) {
            this.showSettingsMessage('Failed to perform action: ' + error.message, 'error');
            console.error('❌ Program action error:', error);
        }
    }
    
    async showProgramSwitchDialog(programId) {
        try {
            const programList = await this.dataManager.getProgramList();
            const targetProgram = programList.find(p => p.id === programId);
            
            if (!targetProgram) {
                this.showSettingsMessage('Program not found', 'error');
                return;
            }
            
            const message = targetProgram.hasProgress
                ? `Switch to "${targetProgram.name}"?\n\nThis program has saved progress. Do you want to:\n\n• Continue with saved progress?\n• Start fresh (progress will be lost)?`
                : `Switch to "${targetProgram.name}"?\n\nYou will start this program from the beginning.`;
            
            let continueProgress = false;
            let confirmed = false;
            
            if (targetProgram.hasProgress) {
                const choice = prompt(message + '\n\nEnter "continue" to keep progress, or "fresh" to start over:', 'continue');
                if (choice === null) return; // Cancelled
                
                if (choice.toLowerCase() === 'continue') {
                    continueProgress = true;
                    confirmed = true;
                } else if (choice.toLowerCase() === 'fresh') {
                    continueProgress = false;
                    confirmed = true;
                } else {
                    this.showSettingsMessage('Invalid choice. Please enter "continue" or "fresh"', 'error');
                    return;
                }
            } else {
                confirmed = confirm(message);
            }
            
            if (confirmed) {
                await this.dataManager.switchToProgram(programId, continueProgress);
                this.showSettingsMessage(`Switched to "${targetProgram.name}"!`, 'success');
                
                // Refresh the app views
                this.refreshAllViews();
                
                // Refresh settings modal
                setTimeout(() => {
                    this.closeSettings();
                    setTimeout(() => this.showSettings(), 300);
                }, 1000);
            }
            
        } catch (error) {
            this.showSettingsMessage('Failed to switch program: ' + error.message, 'error');
            console.error('❌ Program switch error:', error);
        }
    }
    
    async showDeleteProgramDialog(programId) {
        try {
            const programList = await this.dataManager.getProgramList();
            const targetProgram = programList.find(p => p.id === programId);
            
            if (!targetProgram) {
                this.showSettingsMessage('Program not found', 'error');
                return;
            }
            
            const message = `Delete "${targetProgram.name}"?\n\nThis action cannot be undone.${targetProgram.hasProgress ? '\n\nAll saved progress will be lost.' : ''}`;
            const confirmed = confirm(message);
            
            if (confirmed) {
                await this.dataManager.deleteProgram(programId);
                this.showSettingsMessage(`Program "${targetProgram.name}" deleted!`, 'success');
                
                // Refresh settings modal
                setTimeout(() => {
                    this.closeSettings();
                    setTimeout(() => this.showSettings(), 300);
                }, 1000);
            }
            
        } catch (error) {
            this.showSettingsMessage('Failed to delete program: ' + error.message, 'error');
            console.error('❌ Program deletion error:', error);
        }
    }
    
    async showSaveProgramDialog() {
        try {
            const programName = prompt('Enter a name for this program:', 'My Custom Program');
            if (programName && programName.trim()) {
                const programId = await this.dataManager.saveCurrentProgramAs(programName);
                this.showSettingsMessage(`Program "${programName}" saved successfully!`, 'success');
                console.log('💾 Program saved:', programName, 'ID:', programId);
                
                // Refresh settings modal to show new program
                setTimeout(() => {
                    this.closeSettings();
                    setTimeout(() => this.showSettings(), 300);
                }, 1000);
            }
        } catch (error) {
            this.showSettingsMessage('Failed to save program: ' + error.message, 'error');
            console.error('❌ Save program error:', error);
        }
    }
    
    async showResetProgramDialog() {
        try {
            const currentProgram = await this.dataManager.getCurrentProgramInfo();
            const programName = currentProgram ? currentProgram.name : 'current program';
            
            const confirmed = confirm(`Reset "${programName}"?\n\nAll progress will be cleared and you'll start from the beginning.\n\nThis action cannot be undone.`);
            if (confirmed) {
                await this.dataManager.resetCurrentProgram();
                this.showSettingsMessage('Program reset successfully!', 'success');
                
                // Refresh the app views
                this.refreshAllViews();
                
                console.log('🔄 Program reset confirmed');
            }
        } catch (error) {
            this.showSettingsMessage('Failed to reset program: ' + error.message, 'error');
            console.error('❌ Reset program error:', error);
        }
    }
    
    updateProgramStartDate(dateString) {
        if (this.dataManager.settings) {
            this.dataManager.settings.programStartDate = dateString;
            this.dataManager.saveSettings();
            this.showSettingsMessage('Start date updated!', 'success');
            console.log('📅 Program start date updated:', dateString);
        }
    }
    
    
    
    clearAppCache() {
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        this.showSettingsMessage('Cache cleared! Reloading...', 'success');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
    }
    
    async shareApp() {
        const shareData = {
            title: 'Shred - Workout Tracker',
            text: 'Track your workout progress with this awesome PWA! Complete gym and home workouts designed for your special day.',
            url: 'https://wabbazzar.github.io/shred/'
        };

        try {
            // Check if Web Share API is supported
            if (navigator.share) {
                await navigator.share(shareData);
                console.log('📤 App shared successfully');
            } else {
                // Fallback for browsers without Web Share API
                this.fallbackShare(shareData);
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('📤 Share cancelled by user');
            } else {
                console.error('❌ Share failed:', error);
                this.fallbackShare(shareData);
            }
        }
    }

    fallbackShare(shareData) {
        // Copy URL to clipboard as fallback
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareData.url).then(() => {
                this.showSettingsMessage('App URL copied to clipboard!', 'success');
            }).catch(() => {
                this.showShareFallbackDialog(shareData);
            });
        } else {
            this.showShareFallbackDialog(shareData);
        }
    }

    showShareFallbackDialog(shareData) {
        const message = `Share Shred with others!\n\n${shareData.text}\n\nURL: ${shareData.url}`;
        
        // Create a temporary text area to select the URL
        const textArea = document.createElement('textarea');
        textArea.value = shareData.url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            document.body.removeChild(textArea);
            alert(`${message}\n\nURL has been copied to your clipboard!`);
        } catch (err) {
            document.body.removeChild(textArea);
            alert(message);
        }
    }

    showAboutDialog() {
        alert(`Shred v1.0
        
Mobile-first Progressive Web App
Built for engagement photo prep workouts
Offline-capable with local data storage

Features:
• 3-tab navigation (Day/Week/Calendar)
• Exercise completion tracking
• Progress visualization
• CSV data export/import
• 100% offline functionality

© 2024 - Built with modern web technologies`);
    }

    async showWorkoutDescription(programType) {
        try {
            const filePath = `docs/workouts/${programType}.md`;
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`Failed to load ${programType} description`);
            }
            
            const markdownContent = await response.text();
            const htmlContent = this.convertMarkdownToHTML(markdownContent);
            
            const programNames = {
                'six_week_shred': 'Six Week Shred Program',
                'nsuns_cap3': 'nSuns CAP3 Program'
            };
            
            this.showWorkoutModal(programNames[programType], htmlContent);
        } catch (error) {
            console.error('❌ Failed to load workout description:', error);
            alert(`Sorry, we couldn't load the workout description.\nError: ${error.message}`);
        }
    }

    convertMarkdownToHTML(markdown) {
        // Basic markdown to HTML conversion
        let html = markdown;
        
        // Headers
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        
        // Bold text
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Italic text  
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Lists - handle nested structure properly
        const lines = html.split('\n');
        let inList = false;
        let processedLines = [];
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.match(/^- /)) {
                if (!inList) {
                    processedLines.push('<ul>');
                    inList = true;
                }
                processedLines.push('<li>' + line.substring(2) + '</li>');
            } else {
                if (inList) {
                    processedLines.push('</ul>');
                    inList = false;
                }
                processedLines.push(line);
            }
        }
        
        if (inList) {
            processedLines.push('</ul>');
        }
        
        html = processedLines.join('\n');
        
        // Horizontal rules
        html = html.replace(/^---$/gm, '<hr>');
        
        // Paragraphs - split by double newlines
        const paragraphs = html.split('\n\n');
        html = paragraphs.map(p => {
            const trimmed = p.trim();
            if (!trimmed) return '';
            if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<hr')) {
                return trimmed;
            }
            return '<p>' + trimmed.replace(/\n/g, '<br>') + '</p>';
        }).join('\n\n');
        
        return `<div class="workout-description-content">${html}</div>`;
    }

    showWorkoutModal(title, content) {
        // Create a modal for the workout description
        const modal = document.createElement('div');
        modal.className = 'modal workout-modal show';
        modal.innerHTML = `
            <div class="modal-content workout-modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="close-btn workout-modal-close">&times;</button>
                </div>
                <div class="modal-body workout-modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Add event listeners
        const closeBtn = modal.querySelector('.workout-modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        // Escape key to close
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                modal.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        console.log(`📖 Showing workout description: ${title}`);
    }

    // Placeholder methods for new program actions
    showImportJsonDialog() {
        alert('Import JSON functionality coming soon!\n\nThis will allow you to import workout programs from JSON files.');
    }

    showFromUrlDialog() {
        alert('Import from URL functionality coming soon!\n\nThis will allow you to load workout programs from web URLs.');
    }

    showCreateCustomDialog() {
        alert('Create Custom Program functionality coming soon!\n\nThis will allow you to create your own workout programs.');
    }
    
    calculateStorageUsage() {
        try {
            let totalSize = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    totalSize += localStorage[key].length;
                }
            }
            
            const sizeKB = (totalSize / 1024).toFixed(1);
            const usageElement = document.getElementById('storage-usage');
            if (usageElement) {
                usageElement.textContent = `${sizeKB} KB`;
            }
        } catch (error) {
            console.warn('Could not calculate storage usage:', error);
            const usageElement = document.getElementById('storage-usage');
            if (usageElement) {
                usageElement.textContent = 'Unknown';
            }
        }
    }
    
    showSettingsMessage(message, type = 'info', contextElement = null) {
        // Find or create message container
        let messageContainer = document.querySelector('.settings-message');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.className = 'settings-message';
            
            // If context element provided, place message near it
            if (contextElement) {
                const settingsItem = contextElement.closest('.settings-item');
                if (settingsItem) {
                    settingsItem.appendChild(messageContainer);
                } else {
                    // Fallback to modal body
                    const modalBody = document.querySelector('.modal-body');
                    if (modalBody) {
                        modalBody.insertBefore(messageContainer, modalBody.firstChild);
                    }
                }
            } else {
                // Default to top of modal
                const modalBody = document.querySelector('.modal-body');
                if (modalBody) {
                    modalBody.insertBefore(messageContainer, modalBody.firstChild);
                }
            }
        }
        
        messageContainer.className = `settings-message ${type}`;
        messageContainer.innerHTML = `
            <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
            <span>${message}</span>
        `;
        
        // Scroll message into view if needed
        messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            if (messageContainer.parentNode) {
                messageContainer.remove();
            }
        }, 3000);
    }

    // Completion Tracking
    getExerciseCompletion(week, day, exerciseIndex) {
        const key = `${week}-${day}-${exerciseIndex}`;
        return this.userProgress[key] || { completed: false, data: {} };
    }

    updateExerciseCompletion(week, day, exerciseIndex, data) {
        const key = `${week}-${day}-${exerciseIndex}`;
        this.userProgress[key] = {
            completed: this.isExerciseComplete(data),
            data: data,
            timestamp: new Date().toISOString()
        };
        
        this.saveUserProgress();
        this.updateCompletionIndicators();
    }

    isExerciseComplete(exerciseData) {
        // Simple completion check - has any data been entered
        return Object.values(exerciseData).some(value => value && value.trim && value.trim() !== '');
    }


    updateCompletionIndicators() {
        // Update UI completion indicators
        // This will be expanded when views are fully implemented
        console.log('📊 Completion indicators updated');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Starting Shred...');
    window.workoutApp = new WorkoutApp();
    
    // Make debugging methods globally accessible
    window.clearDayData = (dayNum) => window.workoutApp.clearDayData(dayNum);
    window.debugDay = (dayNum) => window.workoutApp.debugDayConsistency(dayNum);
    window.refreshViews = () => window.workoutApp.refreshAllViews();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkoutApp;
}