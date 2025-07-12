// Shred - Calendar View Implementation
// 6-week calendar grid layout

class CalendarView {
    constructor(app) {
        this.app = app;
        
        console.log('🗓️ Calendar View initialized');
    }

    render() {
        const calendarView = document.getElementById('calendar-view');
        if (!calendarView) return;

        // Get program info for dynamic content
        const programInfo = this.getProgramInfo();

        calendarView.innerHTML = `
            <div class="calendar-header">
                <h2>${programInfo.title}</h2>
                <div class="calendar-subtitle">${programInfo.subtitle}</div>
            </div>
            
            <div class="calendar-legend">
                <div class="legend-item">
                    <div class="legend-color incomplete"></div>
                    <span>Not Started</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color partial"></div>
                    <span>In Progress</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color complete"></div>
                    <span>Complete</span>
                </div>
            </div>
            
            <div class="calendar-weeks">
                ${this.generateCalendarGrid()}
            </div>
        `;
        
        this.setupDayTileClicks();
        
        console.log(`🗓️ Calendar View rendered: ${programInfo.weeks} weeks`);
    }
    
    generateCalendarGrid() {
        let gridHTML = '';
        
        // Get dynamic number of weeks from program data
        const totalWeeks = this.getProgramWeeks();
        
        // Generate weeks dynamically
        for (let week = 1; week <= totalWeeks; week++) {
            gridHTML += `
                <div class="calendar-week">
                    <div class="week-label">Week ${week}</div>
                    <div class="week-days">
                        ${this.generateWeekDays(week)}
                    </div>
                </div>
            `;
        }
        
        return gridHTML;
    }
    
    generateWeekDays(week) {
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        let daysHTML = '';
        
        for (let day = 1; day <= 7; day++) {
            // Get completion for this specific week and day
            const dayCompletion = this.app.getDayCompletion(week, day);
            const isToday = this.isToday(week, day);
            const isCurrent = this.app.currentWeek === week && this.app.currentDay === day;
            
            const completionClass = this.getCompletionClass(dayCompletion);
            const extraClasses = [];
            if (isToday) extraClasses.push('today');
            if (isCurrent) extraClasses.push('current');
            
            // Debug Tuesday specifically (after variables are defined)
            if (day === 2) {
                console.log(`🐛 Calendar: Week ${week}, Tuesday completion: ${dayCompletion}%`);
                console.log(`🐛 Calendar: completionClass: "${completionClass}", extraClasses: [${extraClasses.join(', ')}]`);
                console.log(`🐛 Calendar: isToday: ${isToday}, isCurrent: ${isCurrent}`);
            }
            
            daysHTML += `
                <div class="calendar-day ${completionClass} ${extraClasses.join(' ')}" 
                     data-week="${week}" 
                     data-day="${day}"
                     role="button"
                     tabindex="0">
                    <div class="day-number">${day}</div>
                    <div class="day-label">${days[day - 1]}</div>
                    ${dayCompletion >= 100 ? '<div class="complete-indicator">✓</div>' : ''}
                </div>
            `;
        }
        
        return daysHTML;
    }
    
    setupDayTileClicks() {
        document.querySelectorAll('.calendar-day').forEach(tile => {
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
                }, 150);
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
        return 'incomplete';
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
    
    // Get program information for dynamic display
    getProgramInfo() {
        const workoutData = this.app.dataManager.workoutData;
        if (!workoutData) {
            return {
                title: 'Workout Program',
                subtitle: 'Complete Overview',
                weeks: 6
            };
        }
        
        const weeks = workoutData.weeks || 6;
        const programName = workoutData.name || 'Workout Program';
        
        // Create dynamic title based on program
        let title = programName;
        if (weeks === 3) {
            title = `${programName} (3-Week Program)`;
        } else if (weeks === 6) {
            title = `${programName} (6-Week Program)`;
        } else {
            title = `${programName} (${weeks}-Week Program)`;
        }
        
        return {
            title: title,
            subtitle: 'Complete Overview',
            weeks: weeks
        };
    }
    
    // Get total number of weeks from program data
    getProgramWeeks() {
        const workoutData = this.app.dataManager.workoutData;
        return workoutData?.weeks || 6; // Default to 6 for backwards compatibility
    }

    // Refresh calendar data without full re-render
    refreshCalendarData() {
        // Update week tiles with completion data
        document.querySelectorAll('.week-tile').forEach(tile => {
            const week = parseInt(tile.dataset.week);
            if (week) {
                const weekCompletion = this.app.getWeekCompletion(week);
                const progressBar = tile.querySelector('.week-progress-bar');
                const progressText = tile.querySelector('.week-progress-text');
                
                if (progressBar) {
                    progressBar.style.width = `${weekCompletion}%`;
                }
                if (progressText) {
                    progressText.textContent = `${weekCompletion}% Complete`;
                }
                
                // Update tile class
                tile.className = `week-tile ${weekCompletion >= 80 ? 'complete' : weekCompletion > 0 ? 'partial' : ''}`;
            }
        });
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarView;
}