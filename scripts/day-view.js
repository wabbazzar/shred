// Shred - Day View Implementation
// Detailed workout view with collapsible sections and exercise inputs

class DayView {
    constructor(app) {
        this.app = app;
        this.currentWeek = 1;
        this.currentDay = 1;
        this.expandedSections = new Set(); // Track which sections are expanded
        this.exerciseInputs = new Map(); // Track exercise input states
        
        this.init();
    }

    init() {
        this.setupDayNavigation();
        this.loadExpandedState();
        console.log('📅 Day View initialized');
    }

    // Main render method for Day View
    render(week = this.currentWeek, day = this.currentDay) {
        this.currentWeek = week;
        this.currentDay = day;
        
        const dayView = document.getElementById('day-view');
        if (!dayView) return;

        const dayData = this.app.dataManager.getDayInfo(week, day);
        const completion = this.app.getDayCompletion(week, day);
        
        dayView.innerHTML = this.generateDayViewHTML(dayData, completion);
        
        // Setup event listeners after render
        this.setupEventListeners();
        this.restoreExpandedState();
        this.loadExerciseInputs();
        
        console.log(`📅 Day View rendered: Week ${week}, Day ${day}`);
    }

    generateDayViewHTML(dayData, completion) {
        if (!dayData) {
            return this.generateEmptyDayHTML();
        }

        const dayName = this.getDayName(this.currentDay);
        const dayType = dayData.type || 'workout';
        const completionClass = completion >= 80 ? 'complete' : completion > 0 ? 'partial' : '';
        
        // Check if this is today
        const isToday = this.isToday(this.currentWeek, this.currentDay);
        const todayIndicator = isToday ? '<div class="today-indicator">Today</div>' : '';

        return `
            <div class="day-header">
                <div class="day-nav-controls">
                    <button class="day-nav-btn" id="prev-day" aria-label="Previous day">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                    </button>
                    
                    <div class="day-info">
                        <h2>Week ${this.currentWeek} - ${dayName}</h2>
                        <div class="day-subtitle">${dayData.focus || 'Workout Day'}</div>
                        ${dayData.duration ? `<div class="day-duration">${dayData.duration}</div>` : ''}
                        ${todayIndicator}
                    </div>
                    
                    <button class="day-nav-btn" id="next-day" aria-label="Next day">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="completion-badge ${completionClass}">
                    ${completion}%
                </div>
            </div>

            <div class="day-content">
                ${this.generateWorkoutContent(dayData)}
            </div>

            <div class="day-actions">
                <button class="action-btn secondary" id="reset-day">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                    </svg>
                    Reset Day
                </button>
                
                <button class="action-btn" id="mark-complete">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Mark Complete
                </button>
            </div>
        `;
    }

    generateEmptyDayHTML() {
        const dayName = this.getDayName(this.currentDay);
        
        return `
            <div class="day-header">
                <div class="day-nav-controls">
                    <button class="day-nav-btn" id="prev-day" aria-label="Previous day">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                    </button>
                    
                    <div class="day-info">
                        <h2>Week ${this.currentWeek} - ${dayName}</h2>
                        <div class="day-subtitle">No workout scheduled</div>
                    </div>
                    
                    <button class="day-nav-btn" id="next-day" aria-label="Next day">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="completion-badge">0%</div>
            </div>

            <div class="day-content">
                <div class="empty-day">
                    <div class="empty-icon">🏃‍♂️</div>
                    <h3>Rest Day</h3>
                    <p>Take time to recover and prepare for tomorrow's workout.</p>
                </div>
            </div>
        `;
    }

    generateWorkoutContent(dayData) {
        // Handle new section-based structure
        if (dayData.sections && dayData.sections.length > 0) {
            let sectionsHTML = '';
            let exerciseIndex = 0; // Global exercise index across all sections
            
            dayData.sections.forEach((section, sectionIdx) => {
                const sectionId = `section-${sectionIdx}`;
                const isExpanded = this.expandedSections.has(sectionId);
                const sectionCompletion = this.calculateSectionCompletionFromExercises(section.exercises, exerciseIndex);
                
                sectionsHTML += this.generateWorkoutSectionFromData(
                    section, 
                    sectionId, 
                    isExpanded, 
                    sectionCompletion,
                    exerciseIndex
                );
                
                exerciseIndex += section.exercises.length;
            });

            return `<div class="workout-sections">${sectionsHTML}</div>`;
        }
        
        // Fallback for legacy structure
        if (!dayData.exercises || dayData.exercises.length === 0) {
            return '<div class="no-exercises">No exercises for this day</div>';
        }

        const exercisesByCategory = this.groupExercisesByCategory(dayData.exercises);
        let sectionsHTML = '';

        for (const [category, exercises] of Object.entries(exercisesByCategory)) {
            const sectionId = `section-${category}`;
            const isExpanded = this.expandedSections.has(sectionId);
            const sectionCompletion = this.calculateSectionCompletion(exercises);
            
            sectionsHTML += this.generateWorkoutSection(
                category, 
                exercises, 
                sectionId, 
                isExpanded, 
                sectionCompletion
            );
        }

        return `<div class="workout-sections">${sectionsHTML}</div>`;
    }

    generateWorkoutSection(category, exercises, sectionId, isExpanded, completion) {
        const completionClass = completion >= 100 ? 'complete' : completion > 0 ? 'partial' : '';
        const expandedClass = isExpanded ? 'expanded' : '';
        
        return `
            <div class="workout-section ${expandedClass}" data-section="${sectionId}">
                <div class="section-header" data-section="${sectionId}">
                    <div class="section-info">
                        <h3 class="section-title">${this.formatCategoryName(category)}</h3>
                        <div class="section-stats">
                            ${exercises.length} exercise${exercises.length !== 1 ? 's' : ''} • ${completion}% complete
                        </div>
                    </div>
                    
                    <div class="section-controls">
                        <div class="section-completion ${completionClass}">
                            <div class="completion-bar">
                                <div class="completion-fill" style="width: ${completion}%"></div>
                            </div>
                        </div>
                        
                        <button class="section-toggle" aria-label="Toggle section">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="chevron">
                                <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="section-content ${expandedClass}">
                    <div class="exercise-list">
                        ${this.generateExerciseList(exercises)}
                    </div>
                </div>
            </div>
        `;
    }

    generateWorkoutSectionFromData(section, sectionId, isExpanded, completion, startExerciseIndex) {
        const completionClass = completion >= 100 ? 'complete' : completion > 0 ? 'partial' : '';
        const expandedClass = isExpanded ? 'expanded' : '';
        
        return `
            <div class="workout-section ${expandedClass}" data-section="${sectionId}">
                <div class="section-header" data-section="${sectionId}">
                    <div class="section-info">
                        <h3 class="section-title">${section.name}</h3>
                        <div class="section-stats">
                            ${section.exercises.length} exercise${section.exercises.length !== 1 ? 's' : ''} • ${completion}% complete
                        </div>
                    </div>
                    
                    <div class="section-controls">
                        <div class="section-completion ${completionClass}">
                            <div class="completion-bar">
                                <div class="completion-fill" style="width: ${completion}%"></div>
                            </div>
                        </div>
                        
                        <button class="section-toggle" aria-label="Toggle section">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" class="chevron">
                                <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="section-content ${expandedClass}">
                    <div class="exercise-list">
                        ${this.generateExerciseListWithIndex(section.exercises, startExerciseIndex)}
                    </div>
                </div>
            </div>
        `;
    }

    calculateSectionCompletionFromExercises(exercises, startIndex) {
        if (!exercises || exercises.length === 0) return 0;
        
        let completedCount = 0;
        exercises.forEach((_, localIndex) => {
            const globalIndex = startIndex + localIndex;
            const progress = this.app.getExerciseProgress(
                this.currentWeek, 
                this.currentDay, 
                globalIndex
            );
            if (progress && progress.completed) {
                completedCount++;
            }
        });
        
        return Math.round((completedCount / exercises.length) * 100);
    }

    generateExerciseListWithIndex(exercises, startIndex) {
        return exercises.map((exercise, localIndex) => {
            const globalIndex = startIndex + localIndex;
            const exerciseProgress = this.app.getExerciseProgress(
                this.currentWeek, 
                this.currentDay, 
                globalIndex
            );
            
            const isComplete = exerciseProgress && exerciseProgress.completed;
            const exerciseData = exerciseProgress ? exerciseProgress.data : {};
            
            return this.generateExerciseItem(exercise, globalIndex, isComplete, exerciseData);
        }).join('');
    }

    generateExerciseList(exercises) {
        return exercises.map((exercise, index) => {
            const exerciseProgress = this.app.getExerciseProgress(
                this.currentWeek, 
                this.currentDay, 
                index
            );
            
            const isComplete = exerciseProgress && exerciseProgress.completed;
            const exerciseData = exerciseProgress ? exerciseProgress.data : {};
            
            return this.generateExerciseItem(exercise, index, isComplete, exerciseData);
        }).join('');
    }

    generateExerciseItem(exercise, index, isComplete, savedData) {
        const completeClass = isComplete ? 'complete' : '';
        const exerciseId = `exercise-${this.currentWeek}-${this.currentDay}-${index}`;
        
        return `
            <div class="exercise-item ${completeClass}" data-exercise="${index}">
                <div class="exercise-header">
                    <div class="exercise-info">
                        <h4 class="exercise-name">${exercise.name}</h4>
                        <div class="exercise-description">
                            ${this.formatExerciseDescription(exercise)}
                        </div>
                        ${exercise.notes ? `<div class="exercise-notes">${exercise.notes}</div>` : ''}
                    </div>
                    
                    <button class="exercise-check ${isComplete ? 'checked' : ''}" 
                            data-exercise="${index}" 
                            aria-label="Mark exercise complete">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                    </button>
                </div>
                
                <div class="exercise-inputs" id="${exerciseId}">
                    ${this.generateExerciseInputs(exercise, index, savedData)}
                </div>
            </div>
        `;
    }

    generateExerciseInputs(exercise, index, savedData) {
        const category = exercise.category;
        
        switch (category) {
            case 'strength':
                return this.generateStrengthInputs(exercise, savedData);
            case 'cardio':
                return this.generateCardioInputs(exercise, savedData);
            case 'time':
                return this.generateTimeInputs(exercise, savedData);
            case 'bodyweight':
                return this.generateBodyweightInputs(exercise, savedData);
            case 'flexibility':
                return this.generateFlexibilityInputs(exercise, savedData);
            case 'mobility':
                return this.generateFlexibilityInputs(exercise, savedData);
            case 'rest':
                return this.generateRestInputs(exercise, savedData);
            case 'emom':
                return this.generateEMOMInputs(exercise, savedData);
            case 'amrap':
                return this.generateAMRAPInputs(exercise, savedData);
            case 'circuit':
                return this.generateCircuitInputs(exercise, savedData);
            case 'lifestyle':
                return this.generateLifestyleInputs(exercise, savedData);
            default:
                return this.generateGenericInputs(exercise, savedData);
        }
    }

    generateStrengthInputs(exercise, savedData) {
        const sets = exercise.sets || 3;
        let inputsHTML = '';
        
        for (let set = 1; set <= sets; set++) {
            const weightValue = savedData[`set${set}_weight`] || '';
            const repsValue = savedData[`set${set}_reps`] || '';
            
            inputsHTML += `
                <div class="input-row">
                    <label class="set-label">Set ${set}</label>
                    <div class="input-group">
                        <input type="number" 
                               class="exercise-input weight-input" 
                               placeholder="Weight"
                               data-field="set${set}_weight"
                               value="${weightValue}"
                               min="0" step="2.5"
                               inputmode="decimal">
                        <span class="input-unit">lbs</span>
                    </div>
                    <div class="input-group">
                        <input type="number" 
                               class="exercise-input reps-input" 
                               placeholder="${exercise.reps || 'Reps'}"
                               data-field="set${set}_reps"
                               value="${repsValue}"
                               min="0"
                               inputmode="numeric">
                        <span class="input-unit">reps</span>
                    </div>
                </div>
            `;
        }
        
        return inputsHTML;
    }

    generateCardioInputs(exercise, savedData) {
        return `
            <div class="input-row">
                <div class="input-group full-width">
                    <input type="number" 
                           class="exercise-input time-input" 
                           placeholder="Duration"
                           data-field="duration"
                           value="${savedData.duration || ''}"
                           min="0" step="1"
                           inputmode="numeric">
                    <span class="input-unit">minutes</span>
                </div>
            </div>
            <div class="input-row">
                <div class="input-group">
                    <input type="number" 
                           class="exercise-input distance-input" 
                           placeholder="Distance"
                           data-field="distance"
                           value="${savedData.distance || ''}"
                           min="0" step="0.1">
                    <span class="input-unit">miles</span>
                </div>
                <div class="input-group">
                    <input type="text" 
                           class="exercise-input pace-input" 
                           placeholder="Pace"
                           data-field="pace"
                           value="${savedData.pace || ''}"
                           inputmode="numeric">
                    <span class="input-unit">min/mi</span>
                </div>
            </div>
        `;
    }

    generateTimeInputs(exercise, savedData) {
        const sets = exercise.sets || 1;
        let inputsHTML = '';
        
        for (let set = 1; set <= sets; set++) {
            const timeValue = savedData[`set${set}_time`] || '';
            
            inputsHTML += `
                <div class="input-row">
                    <label class="set-label">${sets > 1 ? `Set ${set}` : 'Time'}</label>
                    <div class="input-group full-width">
                        <input type="text" 
                               class="exercise-input time-input" 
                               placeholder="${exercise.time || 'mm:ss'}"
                               data-field="set${set}_time"
                               value="${timeValue}"
                               inputmode="numeric">
                        <span class="input-unit">time</span>
                    </div>
                </div>
            `;
        }
        
        return inputsHTML;
    }

    generateBodyweightInputs(exercise, savedData) {
        const sets = exercise.sets || 3;
        let inputsHTML = '';
        
        for (let set = 1; set <= sets; set++) {
            const repsValue = savedData[`set${set}_reps`] || '';
            
            inputsHTML += `
                <div class="input-row">
                    <label class="set-label">Set ${set}</label>
                    <div class="input-group full-width">
                        <input type="number" 
                               class="exercise-input reps-input" 
                               placeholder="${exercise.reps || 'Reps'}"
                               data-field="set${set}_reps"
                               value="${repsValue}"
                               min="0"
                               inputmode="numeric">
                        <span class="input-unit">reps</span>
                    </div>
                </div>
            `;
        }
        
        return inputsHTML;
    }

    generateFlexibilityInputs(exercise, savedData) {
        return `
            <div class="input-row">
                <div class="input-group full-width">
                    <input type="number" 
                           class="exercise-input time-input" 
                           placeholder="Duration"
                           data-field="duration"
                           value="${savedData.duration || ''}"
                           min="0" step="1"
                           inputmode="numeric">
                    <span class="input-unit">minutes</span>
                </div>
            </div>
            <div class="input-row">
                <div class="input-group full-width">
                    <input type="text" 
                           class="exercise-input notes-input" 
                           placeholder="Notes (optional)"
                           data-field="notes"
                           value="${savedData.notes || ''}">
                </div>
            </div>
        `;
    }

    generateRestInputs(exercise, savedData) {
        return `
            <div class="input-row">
                <div class="rest-day-content">
                    <p>Take time to rest and recover. Focus on:</p>
                    <ul>
                        <li>Adequate sleep (7-9 hours)</li>
                        <li>Proper hydration</li>
                        <li>Nutrition planning</li>
                        <li>Light stretching if desired</li>
                    </ul>
                </div>
            </div>
        `;
    }

    generateEMOMInputs(exercise, savedData) {
        return `
            <div class="input-row">
                <div class="input-group full-width">
                    <input type="number" 
                           class="exercise-input rounds-input" 
                           placeholder="Rounds Completed"
                           data-field="rounds"
                           value="${savedData.rounds || ''}"
                           min="0"
                           inputmode="numeric">
                    <span class="input-unit">rounds</span>
                </div>
            </div>
            <div class="input-row">
                <div class="input-group full-width">
                    <input type="text" 
                           class="exercise-input notes-input" 
                           placeholder="Notes (optional)"
                           data-field="notes"
                           value="${savedData.notes || ''}">
                </div>
            </div>
        `;
    }

    generateAMRAPInputs(exercise, savedData) {
        return `
            <div class="input-row">
                <div class="input-group full-width">
                    <input type="number" 
                           class="exercise-input rounds-input" 
                           placeholder="Total Rounds"
                           data-field="rounds"
                           value="${savedData.rounds || ''}"
                           min="0"
                           inputmode="numeric">
                    <span class="input-unit">rounds</span>
                </div>
            </div>
            <div class="input-row">
                <div class="input-group full-width">
                    <input type="number" 
                           class="exercise-input partial-input" 
                           placeholder="Extra Reps (if any)"
                           data-field="partial_reps"
                           value="${savedData.partial_reps || ''}"
                           min="0"
                           inputmode="numeric">
                    <span class="input-unit">reps</span>
                </div>
            </div>
            <div class="input-row">
                <div class="input-group full-width">
                    <input type="text" 
                           class="exercise-input notes-input" 
                           placeholder="Notes (optional)"
                           data-field="notes"
                           value="${savedData.notes || ''}">
                </div>
            </div>
        `;
    }

    generateCircuitInputs(exercise, savedData) {
        return `
            <div class="input-row">
                <div class="input-group">
                    <input type="number" 
                           class="exercise-input rounds-input" 
                           placeholder="Rounds"
                           data-field="rounds"
                           value="${savedData.rounds || ''}"
                           min="0"
                           inputmode="numeric">
                    <span class="input-unit">rounds</span>
                </div>
                <div class="input-group">
                    <input type="text" 
                           class="exercise-input time-input" 
                           placeholder="Total Time"
                           data-field="total_time"
                           value="${savedData.total_time || ''}"
                           inputmode="numeric">
                    <span class="input-unit">time</span>
                </div>
            </div>
            <div class="input-row">
                <div class="input-group full-width">
                    <input type="text" 
                           class="exercise-input notes-input" 
                           placeholder="Notes (optional)"
                           data-field="notes"
                           value="${savedData.notes || ''}">
                </div>
            </div>
        `;
    }

    generateLifestyleInputs(exercise, savedData) {
        return `
            <div class="input-row">
                <div class="lifestyle-content">
                    <div class="checkbox-group">
                        <label class="checkbox-label">
                            <input type="checkbox" 
                                   class="exercise-input checkbox-input" 
                                   data-field="completed"
                                   ${savedData.completed ? 'checked' : ''}>
                            <span class="checkmark"></span>
                            Completed
                        </label>
                    </div>
                </div>
            </div>
            <div class="input-row">
                <div class="input-group full-width">
                    <input type="text" 
                           class="exercise-input notes-input" 
                           placeholder="Notes (optional)"
                           data-field="notes"
                           value="${savedData.notes || ''}">
                </div>
            </div>
        `;
    }

    generateGenericInputs(exercise, savedData) {
        return `
            <div class="input-row">
                <div class="input-group full-width">
                    <input type="text" 
                           class="exercise-input notes-input" 
                           placeholder="Notes"
                           data-field="notes"
                           value="${savedData.notes || ''}">
                </div>
            </div>
        `;
    }

    // Event Listeners Setup
    setupEventListeners() {
        this.setupSectionToggles();
        this.setupExerciseInputs();
        this.setupExerciseChecks();
        this.setupDayActions();
        this.setupProgressiveAutoFill();
    }

    setupSectionToggles() {
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', (e) => {
                const sectionId = e.currentTarget.dataset.section;
                this.toggleSection(sectionId);
            });
        });
    }

    setupExerciseInputs() {
        document.querySelectorAll('.exercise-input').forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleExerciseInput(e.target);
            });
            
            input.addEventListener('blur', (e) => {
                this.saveExerciseInput(e.target);
            });

            // Auto-advance for number inputs (like credit card forms)
            if (input.type === 'number') {
                input.addEventListener('keydown', (e) => {
                    // Move to next input on Enter
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.focusNextInput(input);
                    }
                    
                    // Accept suggestion on Tab if present
                    if (e.key === 'Tab' && input.dataset.suggestedValue && !input.value) {
                        e.preventDefault();
                        this.acceptSuggestion(input);
                        // Move to next input after accepting
                        setTimeout(() => this.focusNextInput(input), 100);
                    }
                });

                input.addEventListener('input', (e) => {
                    // Auto-advance when field is "reasonably filled"
                    const value = e.target.value;
                    const fieldName = e.target.dataset.field;
                    
                    // Auto-advance logic for different field types
                    if (this.shouldAutoAdvance(fieldName, value)) {
                        setTimeout(() => this.focusNextInput(e.target), 500);
                    }
                });
            }
        });
    }

    setupExerciseChecks() {
        document.querySelectorAll('.exercise-check').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                const exerciseIndex = parseInt(e.target.dataset.exercise);
                this.toggleExerciseComplete(exerciseIndex);
            });
        });
    }

    setupDayActions() {
        const resetBtn = document.getElementById('reset-day');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetDay());
        }
        
        const completeBtn = document.getElementById('mark-complete');
        if (completeBtn) {
            completeBtn.addEventListener('click', () => this.markDayComplete());
        }
    }

    setupDayNavigation() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'prev-day' || e.target.closest('#prev-day')) {
                this.navigatePreviousDay();
            } else if (e.target.id === 'next-day' || e.target.closest('#next-day')) {
                this.navigateNextDay();
            }
        });
    }

    // Section Management
    toggleSection(sectionId) {
        const section = document.querySelector(`[data-section="${sectionId}"]`);
        if (!section) return;
        
        const isExpanded = this.expandedSections.has(sectionId);
        
        if (isExpanded) {
            this.expandedSections.delete(sectionId);
            section.classList.remove('expanded');
            section.querySelector('.section-content').classList.remove('expanded');
        } else {
            this.expandedSections.add(sectionId);
            section.classList.add('expanded');
            section.querySelector('.section-content').classList.add('expanded');
        }
        
        this.saveExpandedState();
        console.log(`📂 Section ${sectionId} ${isExpanded ? 'collapsed' : 'expanded'}`);
    }

    saveExpandedState() {
        const state = Array.from(this.expandedSections);
        localStorage.setItem('day-view-expanded-sections', JSON.stringify(state));
    }

    loadExpandedState() {
        try {
            const saved = localStorage.getItem('day-view-expanded-sections');
            if (saved) {
                const state = JSON.parse(saved);
                this.expandedSections = new Set(state);
            }
        } catch (error) {
            console.warn('⚠️ Failed to load expanded state:', error);
        }
    }

    restoreExpandedState() {
        this.expandedSections.forEach(sectionId => {
            const section = document.querySelector(`[data-section="${sectionId}"]`);
            if (section) {
                section.classList.add('expanded');
                section.querySelector('.section-content')?.classList.add('expanded');
            }
        });
    }

    // Exercise Input Handling
    handleExerciseInput(input) {
        // Add visual feedback for active inputs
        input.classList.add('active');
        
        // Remove suggestion styling when user starts typing
        if (input.classList.contains('has-suggestion') && input.value.trim()) {
            input.classList.remove('has-suggestion');
            input.removeAttribute('data-suggested-value');
            // Restore original placeholder
            const originalPlaceholder = input.getAttribute('data-original-placeholder');
            if (originalPlaceholder) {
                input.placeholder = originalPlaceholder;
            }
        }
        
        // Auto-save after a short delay
        clearTimeout(input.saveTimeout);
        input.saveTimeout = setTimeout(() => {
            this.saveExerciseInput(input);
        }, 1000);
    }

    saveExerciseInput(input) {
        const exerciseItem = input.closest('.exercise-item');
        if (!exerciseItem) return;
        
        const exerciseIndex = parseInt(exerciseItem.dataset.exercise);
        const field = input.dataset.field;
        const value = input.value;
        
        // Get all inputs for this exercise
        const allInputs = exerciseItem.querySelectorAll('.exercise-input');
        const exerciseData = {};
        
        allInputs.forEach(inp => {
            const fieldName = inp.dataset.field;
            if (fieldName && inp.value.trim()) {
                exerciseData[fieldName] = inp.value.trim();
            }
        });
        
        // Save to data manager
        this.app.updateExerciseProgress(
            this.currentWeek, 
            this.currentDay, 
            exerciseIndex, 
            exerciseData
        );
        
        // Update UI
        this.updateExerciseCompletion(exerciseIndex);
        this.updateSectionCompletion();
        this.updateDayCompletion();
        
        // Refresh week view to sync completion percentages
        if (this.app.weekView) {
            this.app.weekView.refreshWeekData();
        }
        
        input.classList.remove('active');
        console.log(`💾 Exercise ${exerciseIndex} input saved: ${field} = ${value}`);
    }

    toggleExerciseComplete(exerciseIndex) {
        const exerciseItem = document.querySelector(`[data-exercise="${exerciseIndex}"]`);
        if (!exerciseItem) return;
        
        const isComplete = exerciseItem.classList.contains('complete');
        const checkbox = exerciseItem.querySelector('.exercise-check');
        
        if (isComplete) {
            // Mark incomplete
            exerciseItem.classList.remove('complete');
            checkbox.classList.remove('checked');
            
            // Clear saved data
            this.app.updateExerciseProgress(
                this.currentWeek, 
                this.currentDay, 
                exerciseIndex, 
                {}
            );
        } else {
            // Mark complete
            exerciseItem.classList.add('complete');
            checkbox.classList.add('checked');
            
            // Get current input data
            const inputs = exerciseItem.querySelectorAll('.exercise-input');
            const exerciseData = {};
            
            inputs.forEach(input => {
                const field = input.dataset.field;
                if (field && input.value.trim()) {
                    exerciseData[field] = input.value.trim();
                }
            });
            
            // If no data entered, mark as completed manually
            if (Object.keys(exerciseData).length === 0) {
                exerciseData._manualComplete = true;
            }
            
            this.app.updateExerciseProgress(
                this.currentWeek, 
                this.currentDay, 
                exerciseIndex, 
                exerciseData
            );
        }
        
        this.updateSectionCompletion();
        this.updateDayCompletion();
        
        // Refresh week view to sync completion percentages
        if (this.app.weekView) {
            this.app.weekView.refreshWeekData();
        }
    }

    // Navigation Methods
    navigatePreviousDay() {
        if (this.currentDay > 1) {
            this.render(this.currentWeek, this.currentDay - 1);
        } else if (this.currentWeek > 1) {
            this.render(this.currentWeek - 1, 7);
        }
        
        // Update app state
        this.app.currentWeek = this.currentWeek;
        this.app.currentDay = this.currentDay;
    }

    navigateNextDay() {
        if (this.currentDay < 7) {
            this.render(this.currentWeek, this.currentDay + 1);
        } else if (this.currentWeek < 6) {
            this.render(this.currentWeek + 1, 1);
        }
        
        // Update app state
        this.app.currentWeek = this.currentWeek;
        this.app.currentDay = this.currentDay;
    }

    // Day Actions
    resetDay() {
        if (!confirm('Reset all progress for this day? This cannot be undone.')) {
            return;
        }
        
        const dayData = this.app.dataManager.getDayInfo(this.currentWeek, this.currentDay);
        if (!dayData || !dayData.exercises) return;
        
        // Clear all exercise progress
        dayData.exercises.forEach((_, index) => {
            this.app.updateExerciseProgress(
                this.currentWeek, 
                this.currentDay, 
                index, 
                {}
            );
        });
        
        // Re-render the day
        this.render(this.currentWeek, this.currentDay);
        
        console.log(`🔄 Day ${this.currentWeek}-${this.currentDay} reset`);
    }

    markDayComplete() {
        const dayData = this.app.dataManager.getDayInfo(this.currentWeek, this.currentDay);
        if (!dayData || !dayData.exercises) return;
        
        // Mark all exercises as complete
        dayData.exercises.forEach((_, index) => {
            this.app.updateExerciseProgress(
                this.currentWeek, 
                this.currentDay, 
                index, 
                { _manualComplete: true }
            );
        });
        
        // Re-render the day
        this.render(this.currentWeek, this.currentDay);
        
        console.log(`✅ Day ${this.currentWeek}-${this.currentDay} marked complete`);
    }

    // Utility Methods
    getDayName(day) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        return days[day - 1] || `Day ${day}`;
    }

    isToday(week, day) {
        // If program hasn't started, no day should be "today"
        if (!this.app.programStarted) {
            return false;
        }
        
        // Use the same logic as other views for consistency
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

    formatCategoryName(category) {
        const categoryNames = {
            'strength': 'Strength Training',
            'cardio': 'Cardiovascular',
            'time': 'Timed Exercises',
            'bodyweight': 'Bodyweight Training',
            'flexibility': 'Flexibility & Mobility',
            'rest': 'Recovery',
            'mobility': 'Mobility Work',
            'recovery': 'Recovery Activities'
        };
        
        return categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1);
    }

    formatExerciseDescription(exercise) {
        let desc = '';
        
        if (exercise.sets) {
            desc += `${exercise.sets} sets`;
        }
        
        if (exercise.reps) {
            desc += desc ? ` of ${exercise.reps}` : exercise.reps;
        }
        
        if (exercise.time) {
            desc += desc ? ` for ${exercise.time}` : exercise.time;
        }
        
        return desc || 'Complete as prescribed';
    }

    groupExercisesByCategory(exercises) {
        const grouped = {};
        
        exercises.forEach(exercise => {
            const category = exercise.category || 'general';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(exercise);
        });
        
        return grouped;
    }

    calculateSectionCompletion(exercises) {
        if (!exercises || exercises.length === 0) return 0;
        
        let completed = 0;
        exercises.forEach((_, index) => {
            const progress = this.app.getExerciseProgress(
                this.currentWeek, 
                this.currentDay, 
                index
            );
            if (progress && progress.completed) {
                completed++;
            }
        });
        
        return Math.round((completed / exercises.length) * 100);
    }

    updateExerciseCompletion(exerciseIndex) {
        const progress = this.app.getExerciseProgress(
            this.currentWeek, 
            this.currentDay, 
            exerciseIndex
        );
        
        const exerciseItem = document.querySelector(`[data-exercise="${exerciseIndex}"]`);
        if (exerciseItem) {
            const checkbox = exerciseItem.querySelector('.exercise-check');
            
            if (progress && progress.completed) {
                exerciseItem.classList.add('complete');
                checkbox.classList.add('checked');
            } else {
                exerciseItem.classList.remove('complete');
                checkbox.classList.remove('checked');
            }
        }
    }

    updateSectionCompletion() {
        // Update all section completion indicators
        document.querySelectorAll('.workout-section').forEach(section => {
            const exercises = section.querySelectorAll('.exercise-item');
            const completed = section.querySelectorAll('.exercise-item.complete').length;
            const completion = exercises.length > 0 ? Math.round((completed / exercises.length) * 100) : 0;
            
            const completionFill = section.querySelector('.completion-fill');
            const sectionStats = section.querySelector('.section-stats');
            
            if (completionFill) {
                completionFill.style.width = `${completion}%`;
            }
            
            if (sectionStats) {
                const exerciseCount = exercises.length;
                sectionStats.textContent = `${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''} • ${completion}% complete`;
            }
            
            // Update section completion class
            const completionDiv = section.querySelector('.section-completion');
            if (completionDiv) {
                completionDiv.className = `section-completion ${completion >= 100 ? 'complete' : completion > 0 ? 'partial' : ''}`;
            }
        });
    }

    updateDayCompletion() {
        const completion = this.app.getDayCompletion(this.currentWeek, this.currentDay);
        const badge = document.querySelector('.completion-badge');
        
        if (badge) {
            badge.textContent = `${completion}%`;
            badge.className = `completion-badge ${completion >= 80 ? 'complete' : completion > 0 ? 'partial' : ''}`;
        }
    }

    loadExerciseInputs() {
        // Load saved data for all exercises
        const dayData = this.app.dataManager.getDayInfo(this.currentWeek, this.currentDay);
        if (!dayData) return;
        
        // Get all exercises from all sections
        const allExercises = this.app.dataManager.getExercisesForDay(this.currentWeek, this.currentDay);
        if (!allExercises || allExercises.length === 0) return;
        
        allExercises.forEach((_, index) => {
            const progress = this.app.getExerciseProgress(
                this.currentWeek, 
                this.currentDay, 
                index
            );
            
            if (progress && progress.data) {
                const exerciseItem = document.querySelector(`[data-exercise="${index}"]`);
                if (exerciseItem) {
                    // Load input values
                    Object.keys(progress.data).forEach(field => {
                        const input = exerciseItem.querySelector(`[data-field="${field}"]`);
                        if (input) {
                            input.value = progress.data[field];
                        }
                    });
                    
                    // Update completion state
                    this.updateExerciseCompletion(index);
                }
            } else {
                // Load suggestions from previous week if no saved data
                this.loadPreviousWeekSuggestions(index);
            }
        });
        
        // Update section and day completion
        this.updateSectionCompletion();
        this.updateDayCompletion();
    }

    // Auto-advance input navigation helpers
    shouldAutoAdvance(fieldName, value) {
        if (!value) return false;
        
        // Weight inputs: advance after 3+ digits and reasonable weight
        if (fieldName.includes('weight')) {
            return value.length >= 3 && parseFloat(value) >= 25;
        }
        
        // Rep inputs: advance after 2+ digits or double-digit number
        if (fieldName.includes('reps')) {
            return value.length >= 1 && parseInt(value) >= 3;
        }
        
        // Time/duration: advance after 2+ digits
        if (fieldName.includes('time') || fieldName.includes('duration')) {
            return value.length >= 2 && parseInt(value) >= 10;
        }
        
        return false;
    }

    focusNextInput(currentInput) {
        const exerciseItem = currentInput.closest('.exercise-item');
        if (!exerciseItem) return;
        
        const allInputs = Array.from(exerciseItem.querySelectorAll('.exercise-input[type="number"]'));
        const currentIndex = allInputs.indexOf(currentInput);
        
        if (currentIndex >= 0 && currentIndex < allInputs.length - 1) {
            const nextInput = allInputs[currentIndex + 1];
            nextInput.focus();
            nextInput.select(); // Select existing content for easy replacement
        } else {
            // If last input in exercise, move to next exercise's first input
            const nextExercise = exerciseItem.nextElementSibling;
            if (nextExercise && nextExercise.classList.contains('exercise-item')) {
                const firstInput = nextExercise.querySelector('.exercise-input[type="number"]');
                if (firstInput) {
                    firstInput.focus();
                    firstInput.select();
                }
            }
        }
    }

    loadPreviousWeekSuggestions(exerciseIndex) {
        if (this.currentWeek <= 1) return; // No previous week for week 1
        
        const exerciseItem = document.querySelector(`[data-exercise="${exerciseIndex}"]`);
        if (!exerciseItem) return;
        
        // Find the most recent data from previous weeks
        const mostRecentData = this.findMostRecentExerciseData(exerciseIndex);
        
        if (mostRecentData) {
            // Calculate progressive values based on the most recent data
            const progressiveValues = this.calculateProgressiveValues(
                mostRecentData.data, 
                this.currentWeek, 
                exerciseIndex,
                mostRecentData.sourceWeek
            );
            
            Object.keys(progressiveValues).forEach(field => {
                const input = exerciseItem.querySelector(`[data-field="${field}"]`);
                if (input && !input.value) {
                    const originalPlaceholder = input.getAttribute('data-original-placeholder') || input.placeholder;
                    if (!input.getAttribute('data-original-placeholder')) {
                        input.setAttribute('data-original-placeholder', originalPlaceholder);
                    }
                    // Set the progressive value as the placeholder (grayed out)
                    input.placeholder = progressiveValues[field];
                    input.setAttribute('data-suggested-value', progressiveValues[field]);
                    input.classList.add('has-suggestion');
                }
            });
        }
    }

    findMostRecentExerciseData(exerciseIndex) {
        // Search backwards from current week to find the most recent data
        for (let searchWeek = this.currentWeek - 1; searchWeek >= 1; searchWeek--) {
            const progress = this.app.getExerciseProgress(
                searchWeek, 
                this.currentDay, 
                exerciseIndex
            );
            
            if (progress && progress.data && Object.keys(progress.data).length > 0) {
                // Filter out non-numeric data
                const numericData = {};
                Object.keys(progress.data).forEach(key => {
                    if (key !== '_manualComplete' && key !== 'notes' && progress.data[key]) {
                        numericData[key] = progress.data[key];
                    }
                });
                
                if (Object.keys(numericData).length > 0) {
                    return {
                        data: numericData,
                        sourceWeek: searchWeek
                    };
                }
            }
        }
        
        return null;
    }

    calculateProgressiveValues(previousData, currentWeek, exerciseIndex, sourceWeek = null) {
        const progressiveValues = {};
        const exercise = this.app.dataManager.getExercisesForDay(this.currentWeek, this.currentDay)[exerciseIndex];
        const exerciseCategory = exercise?.category || 'general';
        
        // Calculate how many weeks to progress (if sourceWeek is provided)
        const weeksToProgress = sourceWeek ? (currentWeek - sourceWeek) : 1;
        
        // Progressive overload rules based on exercise type and week progression
        Object.keys(previousData).forEach(field => {
            const previousValue = previousData[field];
            let progressiveValue = previousValue;
            
            // Skip non-numeric fields
            if (field === '_manualComplete' || field === 'notes') {
                return;
            }
            
            // Calculate progression based on field type
            if (field.includes('weight')) {
                progressiveValue = this.calculateWeightProgression(previousValue, currentWeek, exerciseCategory, weeksToProgress);
            } else if (field.includes('reps')) {
                progressiveValue = this.calculateRepsProgression(previousValue, currentWeek, exerciseCategory, weeksToProgress);
            } else if (field.includes('time')) {
                progressiveValue = this.calculateTimeProgression(previousValue, currentWeek, exerciseCategory, weeksToProgress);
            }
            
            progressiveValues[field] = progressiveValue;
        });
        
        return progressiveValues;
    }

    calculateWeightProgression(previousWeight, currentWeek, exerciseCategory, weeksToProgress = 1) {
        const weight = parseFloat(previousWeight);
        if (isNaN(weight)) return previousWeight;
        
        let totalProgression = 0;
        
        // Calculate progression for each week
        for (let i = 0; i < weeksToProgress; i++) {
            const weekNum = currentWeek - weeksToProgress + i + 1;
            let progressionRate = 0;
            
            // Different progression rates based on exercise category and week
            if (exerciseCategory === 'strength') {
                // Strength exercises: 2.5-5 lbs per week, tapering as weeks progress
                if (weekNum <= 2) {
                    progressionRate = weight >= 100 ? 5 : 2.5; // Heavier weights progress more
                } else if (weekNum <= 4) {
                    progressionRate = weight >= 100 ? 2.5 : 2.5;
                } else {
                    progressionRate = weight >= 100 ? 2.5 : 2.5; // Maintain progression
                }
            } else {
                // Other categories: smaller progression
                progressionRate = weight >= 50 ? 2.5 : 2.5;
            }
            
            totalProgression += progressionRate;
        }
        
        const newWeight = weight + totalProgression;
        
        // Round to nearest 2.5 lbs (standard plate increment)
        return Math.round(newWeight / 2.5) * 2.5;
    }

    calculateRepsProgression(previousReps, currentWeek, exerciseCategory, weeksToProgress = 1) {
        const reps = parseInt(previousReps);
        if (isNaN(reps)) return previousReps;
        
        // Different progression based on exercise category
        if (exerciseCategory === 'strength') {
            // Strength exercises: maintain reps, focus on weight
            return reps; // No rep progression for strength
        }
        
        let totalProgression = 0;
        
        // Calculate progression for each week
        for (let i = 0; i < weeksToProgress; i++) {
            const weekNum = currentWeek - weeksToProgress + i + 1;
            let progressionAmount = 0;
            
            if (exerciseCategory === 'emom' || exerciseCategory === 'amrap') {
                // EMOM/AMRAP: increase reps by 1-2 per week
                progressionAmount = weekNum <= 3 ? 1 : 2;
            } else if (exerciseCategory === 'bodyweight') {
                // Bodyweight: increase reps by 1-3 per week
                const currentReps = reps + totalProgression;
                progressionAmount = currentReps < 10 ? 1 : currentReps < 20 ? 2 : 3;
            } else {
                // General: small progression
                progressionAmount = 1;
            }
            
            totalProgression += progressionAmount;
        }
        
        return Math.max(reps + totalProgression, reps);
    }

    calculateTimeProgression(previousTime, currentWeek, exerciseCategory, weeksToProgress = 1) {
        // Parse time value (could be "45", "45 seconds", "1:30", etc.)
        const timeValue = this.parseTimeValue(previousTime);
        if (timeValue === null) return previousTime;
        
        let totalProgressionSeconds = 0;
        
        // Calculate progression for each week
        for (let i = 0; i < weeksToProgress; i++) {
            const currentTimeValue = timeValue + totalProgressionSeconds;
            let progressionSeconds = 0;
            
            // Different progression based on exercise category
            if (exerciseCategory === 'time' || exerciseCategory === 'flexibility') {
                // Timed holds: increase by 5-15 seconds per week
                progressionSeconds = currentTimeValue < 30 ? 5 : currentTimeValue < 60 ? 10 : 15;
            } else if (exerciseCategory === 'cardio') {
                // Cardio: increase by 15-30 seconds per week
                progressionSeconds = currentTimeValue < 120 ? 15 : 30;
            } else {
                // General: small progression
                progressionSeconds = 5;
            }
            
            totalProgressionSeconds += progressionSeconds;
        }
        
        const newTimeSeconds = timeValue + totalProgressionSeconds;
        
        // Format back to original format
        return this.formatTimeValue(newTimeSeconds, previousTime);
    }

    parseTimeValue(timeString) {
        if (!timeString) return null;
        
        // Remove units and convert to seconds
        const cleanTime = timeString.toString().toLowerCase()
            .replace(/[^\d:]/g, ''); // Remove non-digit, non-colon characters
        
        if (cleanTime.includes(':')) {
            // Format like "1:30" (minutes:seconds)
            const parts = cleanTime.split(':');
            const minutes = parseInt(parts[0]) || 0;
            const seconds = parseInt(parts[1]) || 0;
            return minutes * 60 + seconds;
        } else {
            // Simple number (assume seconds)
            const seconds = parseInt(cleanTime);
            return isNaN(seconds) ? null : seconds;
        }
    }

    formatTimeValue(seconds, originalFormat) {
        if (originalFormat && originalFormat.includes(':')) {
            // Return in MM:SS format
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            // Return as simple seconds
            return seconds.toString();
        }
    }

    // Enhanced auto-fill functionality - fill suggested values on double-tap
    setupProgressiveAutoFill() {
        document.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('exercise-input')) {
                const input = e.target;
                const suggestedValue = input.getAttribute('data-suggested-value');
                
                if (suggestedValue && !input.value) {
                    input.value = suggestedValue;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    // Visual feedback with CSS animation
                    input.classList.add('auto-filled');
                    setTimeout(() => {
                        input.classList.remove('auto-filled');
                        // Remove suggestion styling after use
                        input.removeAttribute('data-suggested-value');
                        input.classList.remove('has-suggestion');
                        // Restore original placeholder
                        const originalPlaceholder = input.getAttribute('data-original-placeholder');
                        if (originalPlaceholder) {
                            input.placeholder = originalPlaceholder;
                        }
                    }, 300);
                    
                    console.log(`✨ Auto-filled ${input.dataset.field} with suggested value: ${suggestedValue}`);
                }
            }
        });
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DayView;
}