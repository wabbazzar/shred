// 6-Week Engagement Workout Tracker - Week View Implementation
// Weekly overview with clickable day tiles

class WeekView {
    constructor(app) {
        this.app = app;
        this.currentWeek = 1;
        
        console.log('📋 Week View initialized');
    }

    render(week = this.currentWeek) {
        this.currentWeek = week;
        
        const weekView = document.getElementById('week-view');
        if (!weekView) return;

        const weekCompletion = this.app.getWeekCompletion(week);
        const totalDays = 7;
        
        weekView.innerHTML = `
            <div class="week-header">
                <div class="week-title-section">
                    <h2>Week ${week}</h2>
                    <div class="week-subtitle">${this.getWeekPhaseDescription(week)}</div>
                </div>
                
                <div class="week-nav-row">
                    <button class="week-nav" id="prev-week" ${week <= 1 ? 'disabled' : ''}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                    </button>
                    
                    <div class="week-indicator">
                        <span class="current-week">${week}</span>
                        <span class="week-separator">/</span>
                        <span>6</span>
                    </div>
                    
                    <button class="week-nav" id="next-week" ${week >= 6 ? 'disabled' : ''}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="week-grid">
                ${this.generateWeekGrid(week)}
            </div>
            
            <div class="week-summary">
                <div class="week-stats">
                    <div class="stat-card">
                        <div class="stat-value">${this.getCompletedDays(week)}</div>
                        <div class="stat-label">Days Complete</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${Math.round(weekCompletion)}%</div>
                        <div class="stat-label">Week Progress</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${this.getTotalExercises(week)}</div>
                        <div class="stat-label">Total Exercises</div>
                    </div>
                </div>
                
                <div class="week-actions">
                    <button class="week-action-btn" onclick="workoutApp.showView('day')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
                        </svg>
                        Today's Workout
                    </button>
                    <button class="week-action-btn secondary" onclick="workoutApp.showView('calendar')">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
                        </svg>
                        View Calendar
                    </button>
                </div>
            </div>
        `;
        
        this.setupWeekNavigation();
        this.setupDayTileClicks();
        
        console.log(`📋 Week View rendered: Week ${week} (${Math.round(weekCompletion)}% complete)`);
    }
    
    generateWeekGrid(week) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let gridHTML = '';
        
        for (let day = 1; day <= 7; day++) {
            const dayCompletion = this.app.getDayCompletion(week, day);
            const workoutData = this.app.workoutData?.exercises?.[week]?.[day];
            const isToday = this.isToday(week, day);
            const isCurrent = this.app.currentWeek === week && this.app.currentDay === day;
            
            // Debug Tuesday specifically
            if (day === 2) {
                console.log(`🐛 Week View: Week ${week}, Tuesday completion: ${dayCompletion}%`);
                console.log(`🐛 Week View: isToday: ${isToday}, isCurrent: ${isCurrent}`);
            }
            
            const completionClass = this.getCompletionClass(dayCompletion);
            const extraClasses = [];
            if (isToday) extraClasses.push('today');
            if (isCurrent) extraClasses.push('current');
            
            gridHTML += `
                <div class="day-tile ${completionClass} ${extraClasses.join(' ')}" 
                     data-week="${week}" 
                     data-day="${day}"
                     role="button"
                     tabindex="0">
                    
                    <div class="day-header-mini">
                        <div class="day-name">${days[day - 1]}</div>
                        <div class="day-number">Day ${day}</div>
                    </div>
                    
                    <div class="day-content-preview">
                        ${this.generateDayPreview(workoutData)}
                    </div>
                    
                    <div class="day-completion">
                        ${this.generateCompletionCircle(dayCompletion)}
                        ${isToday ? '<div class="today-indicator">Today</div>' : ''}
                    </div>
                </div>
            `;
        }
        
        return gridHTML;
    }
    
    generateDayPreview(workoutData) {
        if (!workoutData || !workoutData.exercises || workoutData.exercises.length === 0) {
            if (workoutData?.type === 'rest') {
                return `
                    <div class="preview-empty">
                        <div class="rest-icon">😴</div>
                        <div class="rest-text">Rest Day</div>
                    </div>
                `;
            }
            return `
                <div class="preview-empty">
                    <div>No workout</div>
                </div>
            `;
        }
        
        const typeIcons = {
            'gym': '🏋️',
            'home': '🏠',
            'recovery': '🧘',
            'rest': '😴'
        };
        
        return `
            <div class="preview-workout">
                <div class="workout-type">${typeIcons[workoutData.type] || '💪'}</div>
                <div class="workout-info">
                    <div class="workout-focus">${workoutData.focus || 'Workout'}</div>
                    <div class="exercise-count">${workoutData.exercises.length} exercises</div>
                    <div class="workout-duration">${workoutData.duration || ''}</div>
                </div>
            </div>
        `;
    }
    
    generateCompletionCircle(completion) {
        const radius = 16;
        const circumference = 2 * Math.PI * radius;
        const strokeDasharray = circumference;
        const strokeDashoffset = circumference - (completion / 100) * circumference;
        const completionClass = this.getCompletionClass(completion);
        
        return `
            <div class="completion-circle">
                <svg class="circular-chart" width="36" height="36">
                    <circle class="circle-bg" cx="18" cy="18" r="${radius}"></circle>
                    <circle class="circle ${completionClass}" 
                            cx="18" cy="18" r="${radius}"
                            stroke-dasharray="${strokeDasharray}"
                            stroke-dashoffset="${strokeDashoffset}">
                    </circle>
                </svg>
                <div class="completion-text">${Math.round(completion)}%</div>
            </div>
        `;
    }
    
    setupWeekNavigation() {
        const prevBtn = document.getElementById('prev-week');
        const nextBtn = document.getElementById('next-week');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (this.currentWeek > 1) {
                    this.render(this.currentWeek - 1);
                    this.app.currentWeek = this.currentWeek;
                }
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (this.currentWeek < 6) {
                    this.render(this.currentWeek + 1);
                    this.app.currentWeek = this.currentWeek;
                }
            });
        }
    }
    
    setupDayTileClicks() {
        document.querySelectorAll('.day-tile').forEach(tile => {
            tile.addEventListener('click', () => {
                const week = parseInt(tile.dataset.week);
                const day = parseInt(tile.dataset.day);
                
                // Add navigation animation
                tile.classList.add('navigating');
                
                // Update app state and switch to day view
                this.app.currentWeek = week;
                this.app.currentDay = day;
                
                setTimeout(() => {
                    this.app.showView('day');
                }, 200);
            });
            
            // Add keyboard support
            tile.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    tile.click();
                }
            });
        });
    }
    
    // Helper methods
    getCompletionClass(completion) {
        if (completion >= 100) return 'complete';
        if (completion > 0) return 'partial';
        return '';
    }
    
    getWeekPhaseDescription(week) {
        const phaseMap = {
            1: 'Foundation Week - Building Base Strength',
            2: 'Foundation Week - Building Base Strength', 
            3: 'Intensification - Increasing Challenge',
            4: 'Intensification - Increasing Challenge',
            5: 'Peak Phase - Maximum Performance',
            6: 'Peak Phase - Maximum Performance'
        };
        return phaseMap[week] || `Week ${week} of 6`;
    }
    
    isToday(week, day) {
        // If program hasn't started, no day should be "today"
        if (!this.app.programStarted) {
            return false;
        }
        
        // Proper date logic - check if this specific week/day is actually today
        const today = new Date();
        
        // Get the program start date from app settings
        const startDateStr = this.app.settings?.startDate;
        if (!startDateStr) return false;
        
        // Create date object using local timezone to avoid timezone issues
        const [year, month, dayNum] = startDateStr.split('-').map(Number);
        const programStartDate = new Date(year, month - 1, dayNum);
        
        // Calculate the specific date for this week and day
        const daysSinceStart = (week - 1) * 7 + (day - 1);
        const workoutDate = new Date(programStartDate);
        workoutDate.setDate(programStartDate.getDate() + daysSinceStart);
        
        // Check if the workout date is today
        return (
            workoutDate.getFullYear() === today.getFullYear() &&
            workoutDate.getMonth() === today.getMonth() &&
            workoutDate.getDate() === today.getDate()
        );
    }
    
    getCompletedDays(week) {
        let completed = 0;
        for (let day = 1; day <= 7; day++) {
            if (this.app.getDayCompletion(week, day) >= 100) {
                completed++;
            }
        }
        return completed;
    }
    
    getTotalExercises(week) {
        let total = 0;
        for (let day = 1; day <= 7; day++) {
            const dayData = this.app.workoutData?.exercises?.[week]?.[day];
            if (dayData?.exercises) {
                total += dayData.exercises.length;
            }
        }
        return total;
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeekView;
}