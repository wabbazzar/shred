// 6-Week Engagement Workout Tracker - Calendar View Implementation
// 6-week calendar grid layout

class CalendarView {
    constructor(app) {
        this.app = app;
        
        console.log('🗓️ Calendar View initialized');
    }

    render() {
        const calendarView = document.getElementById('calendar-view');
        if (!calendarView) return;

        calendarView.innerHTML = `
            <div class="calendar-header">
                <h2>6-Week Program</h2>
                <div class="calendar-subtitle">Complete Overview</div>
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
        
        console.log('🗓️ Calendar View rendered');
    }
    
    generateCalendarGrid() {
        let gridHTML = '';
        
        // Generate 6 weeks
        for (let week = 1; week <= 6; week++) {
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
            const dayCompletion = this.app.getDayCompletion(week, day);
            const isToday = this.isToday(week, day);
            const isCurrent = this.app.currentWeek === week && this.app.currentDay === day;
            
            const completionClass = this.getCompletionClass(dayCompletion);
            const extraClasses = [];
            if (isToday) extraClasses.push('today');
            if (isCurrent) extraClasses.push('current');
            
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
        // Simple check - can be enhanced with actual date logic
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const mondayBasedDay = dayOfWeek === 0 ? 7 : dayOfWeek; // Convert to Monday = 1 system
        
        // For now, just highlight based on current day of week
        return day === mondayBasedDay;
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarView;
}