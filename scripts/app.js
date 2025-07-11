// 6-Week Engagement Workout Tracker - Main Application
// Mobile-first PWA with offline functionality

class WorkoutApp {
    constructor() {
        this.currentView = 'day';
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
            calendarView.innerHTML = `
                <div class="calendar-header">
                    <h2>6-Week Program Calendar</h2>
                </div>
                <div class="placeholder-content">
                    <h3>Calendar View</h3>
                    <p>6-week calendar grid will be implemented here</p>
                    <div class="calendar-grid">
                        ${Array.from({length: 42}, (_, i) => `
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
        const today = new Date();
        
        // Get start date from settings, fallback to default
        const startDateStr = this.settings?.startDate || new Date().toISOString().split('T')[0];
        const programStart = new Date(startDateStr);
        
        const daysDiff = Math.floor((today - programStart) / (1000 * 60 * 60 * 24));
        
        console.log(`📅 Program started: ${programStart.toDateString()}, Days since start: ${daysDiff}`);
        
        if (daysDiff >= 0 && daysDiff < 42) { // 6 weeks = 42 days
            this.currentWeek = Math.floor(daysDiff / 7) + 1;
            this.currentDay = (daysDiff % 7) + 1;
        } else if (daysDiff >= 42) {
            // Program completed - show last week/day
            this.currentWeek = 6;
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

    showSettings() {
        console.log('⚙️ Settings modal would open here');
        // Settings modal implementation will come later
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

    getDayCompletion(week, day) {
        const dayExercises = this.workoutData.exercises[week]?.[day]?.exercises || [];
        if (dayExercises.length === 0) return 0;
        
        let completed = 0;
        dayExercises.forEach((_, index) => {
            if (this.getExerciseCompletion(week, day, index).completed) {
                completed++;
            }
        });
        
        return Math.round((completed / dayExercises.length) * 100);
    }

    updateCompletionIndicators() {
        // Update UI completion indicators
        // This will be expanded when views are fully implemented
        console.log('📊 Completion indicators updated');
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🌟 Starting 6-Week Engagement Workout Tracker...');
    window.workoutApp = new WorkoutApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorkoutApp;
}