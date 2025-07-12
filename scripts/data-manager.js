// Shred - Data Management System
// Handles workout data, user progress, and offline storage

class DataManager {
    constructor() {
        this.workoutData = null;
        this.userProgress = {};
        this.settings = {};
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        
        this.init();
    }

    async init() {
        this.setupOnlineStatusListener();
        await this.loadAllData();
        console.log('💾 Data Manager initialized');
    }

    // Online/Offline Status Management
    setupOnlineStatusListener() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            console.log('🌐 Connection restored');
            this.processSyncQueue();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            console.log('📴 Connection lost - working offline');
        });
    }

    // Data Loading
    async loadAllData() {
        try {
            await Promise.all([
                this.loadWorkoutData(),
                this.loadUserProgress(),
                this.loadSettings()
            ]);
            console.log('📋 All data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load data:', error);
            throw error;
        }
    }

    async loadWorkoutData() {
        try {
            // Try local storage first
            const stored = localStorage.getItem('workout-program-data');
            if (stored) {
                const storedData = JSON.parse(stored);
                
                // Check if stored data has template variables that need processing
                if (this.hasUnprocessedTemplateVariables(storedData)) {
                    console.log('🔄 Stored data has unprocessed template variables, regenerating...');
                    this.workoutData = await this.getDefaultWorkoutProgram();
                    await this.saveWorkoutData();
                } else {
                    this.workoutData = storedData;
                    console.log('📋 Workout data loaded from local storage');
                }
                return;
            }

            // Load default data if no stored data
            this.workoutData = await this.getDefaultWorkoutProgram();
            await this.saveWorkoutData();
            
        } catch (error) {
            console.error('❌ Failed to load workout data:', error);
            this.workoutData = await this.getDefaultWorkoutProgram();
        }
    }

    async loadUserProgress() {
        try {
            const stored = localStorage.getItem('user-workout-progress');
            if (stored) {
                this.userProgress = JSON.parse(stored);
                console.log('📈 User progress loaded');
            } else {
                this.userProgress = {};
                console.log('📈 Starting with empty progress');
            }
        } catch (error) {
            console.error('❌ Failed to load user progress:', error);
            this.userProgress = {};
        }
    }

    async loadSettings() {
        try {
            const stored = localStorage.getItem('app-settings');
            if (stored) {
                this.settings = JSON.parse(stored);
            } else {
                this.settings = this.getDefaultSettings();
                await this.saveSettings();
            }
            console.log('⚙️ Settings loaded');
        } catch (error) {
            console.error('❌ Failed to load settings:', error);
            this.settings = this.getDefaultSettings();
        }
    }

    // Data Saving
    async saveWorkoutData() {
        try {
            localStorage.setItem('workout-program-data', JSON.stringify(this.workoutData));
            this.addToSyncQueue('workout-data', this.workoutData);
            console.log('💾 Workout data saved');
        } catch (error) {
            console.error('❌ Failed to save workout data:', error);
            throw error;
        }
    }

    async saveUserProgress() {
        try {
            localStorage.setItem('user-workout-progress', JSON.stringify(this.userProgress));
            this.addToSyncQueue('user-progress', this.userProgress);
            console.log('💾 User progress saved');
        } catch (error) {
            console.error('❌ Failed to save user progress:', error);
            throw error;
        }
    }

    async saveSettings() {
        try {
            localStorage.setItem('app-settings', JSON.stringify(this.settings));
            this.addToSyncQueue('settings', this.settings);
            console.log('💾 Settings saved');
        } catch (error) {
            console.error('❌ Failed to save settings:', error);
            throw error;
        }
    }

    // // CSV Loading Methods
    // async loadWorkoutDataFromCSV(csvPath) {
    //     try {
    //         const response = await fetch(csvPath);
    //         if (!response.ok) {
    //             throw new Error(`Failed to fetch CSV: ${response.status} ${response.statusText}`);
    //         }
            
    //         const csvText = await response.text();
    //         return this.parseCSVToWorkoutStructure(csvText);
    //     } catch (error) {
    //         console.error(`❌ Error loading CSV from ${csvPath}:`, error);
    //         throw error;
    //     }
    // }
    
    // parseCSVToWorkoutStructure(csvText) {
    //     const lines = csvText.trim().split('\n');
    //     const headers = lines[0].split(',').map(h => h.trim());
        
    //     // Validate CSV format
    //     const expectedHeaders = ['week', 'day', 'exercise_name', 'category', 'sets', 'reps', 'time', 'notes'];
    //     const hasValidHeaders = expectedHeaders.every(header => headers.includes(header));
        
    //     if (!hasValidHeaders) {
    //         throw new Error('Invalid CSV format - missing required headers');
    //     }
        
    //     const exercises = {};
        
    //     // Parse each data row
    //     for (let i = 1; i < lines.length; i++) {
    //         const line = lines[i].trim();
    //         if (!line) continue;
            
    //         const values = this.parseCSVLine(line);
    //         if (values.length !== headers.length) {
    //             console.warn(`⚠️ Skipping malformed CSV line ${i + 1}: ${line}`);
    //             continue;
    //         }
            
    //         const exercise = {};
    //         headers.forEach((header, index) => {
    //             exercise[header] = values[index].trim();
    //         });
            
    //         // Convert string numbers to actual numbers where appropriate
    //         const week = parseInt(exercise.week);
    //         const day = parseInt(exercise.day);
            
    //         if (isNaN(week) || isNaN(day)) {
    //             console.warn(`⚠️ Skipping invalid week/day on line ${i + 1}: week=${exercise.week}, day=${exercise.day}`);
    //             continue;
    //         }
            
    //         // Initialize nested structure
    //         if (!exercises[week]) exercises[week] = {};
    //         if (!exercises[week][day]) {
    //             exercises[week][day] = {
    //                 type: this.getDayType(day),
    //                 focus: this.getDayFocus(day),
    //                 duration: '45-60 minutes',
    //                 sections: [{
    //                     name: 'Workout',
    //                     exercises: []
    //                 }]
    //             };
    //         }
            
    //         // Create exercise object
    //         const exerciseObj = {
    //             name: exercise.exercise_name,
    //             category: exercise.category,
    //             notes: exercise.notes || ''
    //         };
            
    //         // Add sets, reps, time as appropriate
    //         if (exercise.sets && exercise.sets !== '') {
    //             exerciseObj.sets = parseInt(exercise.sets) || exercise.sets;
    //         }
    //         if (exercise.reps && exercise.reps !== '') {
    //             exerciseObj.reps = exercise.reps;
    //         }
    //         if (exercise.time && exercise.time !== '') {
    //             exerciseObj.time = exercise.time;
    //         }
            
    //         exercises[week][day].sections[0].exercises.push(exerciseObj);
    //     }
        
    //     console.log('📋 Successfully parsed CSV workout data');
    //     return exercises;
    // }
    
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }
        
        result.push(current);
        return result;
    }
    
    getDayType(day) {
        if (this.programTemplate && this.programTemplate.dayTypes) {
            return this.programTemplate.dayTypes[day.toString()] || 'gym';
        }
        // Fallback to default
        const dayTypes = {
            1: 'gym', 2: 'home', 3: 'gym', 4: 'home', 
            5: 'gym', 6: 'recovery', 7: 'rest'
        };
        return dayTypes[day] || 'gym';
    }
    
    getDayFocus(day) {
        if (this.programTemplate && this.programTemplate.dayFocus) {
            return this.programTemplate.dayFocus[day.toString()] || 'Workout';
        }
        // Fallback to default
        const dayFocus = {
            1: 'Upper Body Strength + Volume',
            2: 'Dumbbell HIIT + Cardio', 
            3: 'Lower Body Strength + Volume',
            4: 'Dumbbell Metabolic + Cardio',
            5: 'Full Body Power + AMRAP',
            6: 'Yoga/Mobility',
            7: 'Active Recovery + Optional Cardio'
        };
        return dayFocus[day] || 'Workout';
    }

    // Program Template Loading
    async loadProgramTemplate(programPath = 'assets/workouts/six_week_shred.json') {
        try {
            const response = await fetch(programPath);
            if (!response.ok) {
                throw new Error(`Failed to load program template: ${response.status}`);
            }
            
            this.programTemplate = await response.json();
            console.log(`📋 Program template loaded: ${this.programTemplate.name}`);
            return this.programTemplate;
            
        } catch (error) {
            console.error('❌ Failed to load program template:', error);
            // Return minimal fallback template
            return this.getFallbackTemplate();
        }
    }

    getFallbackTemplate() {
        return {
            id: 'fallback',
            name: 'Fallback Program',
            description: 'Basic fallback program',
            version: '1.0.0',
            weeks: 6,
            daysPerWeek: 7,
            metadata: {
                targetAudience: 'General',
                difficulty: 'Beginner',
                equipment: ['Bodyweight'],
                estimatedDuration: '30 minutes per session'
            },
            dayTypes: {
                1: 'gym', 2: 'home', 3: 'gym', 4: 'home', 
                5: 'gym', 6: 'recovery', 7: 'rest'
            },
            dayFocus: {
                1: 'Upper Body', 2: 'Cardio', 3: 'Lower Body',
                4: 'Cardio', 5: 'Full Body', 6: 'Recovery', 7: 'Rest'
            },
            weeklyProgression: {
                strengthReps: {
                    'weeks1-2': '8',
                    'weeks3-4': '6', 
                    'weeks5-6': '5'
                }
            },
            workoutTemplate: {
                1: {
                    type: 'gym',
                    focus: 'Upper Body',
                    duration: '30 minutes',
                    sections: [{
                        name: 'Basic Workout',
                        exercises: [{
                            name: 'Push-ups',
                            category: 'bodyweight',
                            sets: 3,
                            reps: '10',
                            notes: 'Basic push-up exercise'
                        }]
                    }]
                }
            }
        };
    }

    // Default Data Generators
    async getDefaultWorkoutProgram() {
        // Load program template first
        if (!this.programTemplate) {
            await this.loadProgramTemplate();
        }
        
        return {
            id: this.programTemplate.id,
            name: this.programTemplate.name,
            description: this.programTemplate.description,
            version: this.programTemplate.version,
            created: new Date().toISOString(),
            weeks: this.programTemplate.weeks,
            daysPerWeek: this.programTemplate.daysPerWeek,
            metadata: this.programTemplate.metadata,
            exercises: this.generateFullProgram()
        };
    }

    generateFullProgram() {
        const program = {};
        
        // Generate all weeks based on template
        for (let week = 1; week <= this.programTemplate.weeks; week++) {
            program[week] = this.generateWeekProgram(week);
        }
        
        return program;
    }

    generateWeekProgram(week) {
        const weekProgram = {};
        
        // Generate each day of the week
        for (let day = 1; day <= this.programTemplate.daysPerWeek; day++) {
            const dayTemplate = this.programTemplate.workoutTemplate[day.toString()];
            
            if (dayTemplate) {
                weekProgram[day] = this.processWorkoutTemplate(dayTemplate, week);
            }
        }
        
        return weekProgram;
    }

    processWorkoutTemplate(template, week) {
        // Deep clone the template to avoid modifying original
        const workout = JSON.parse(JSON.stringify(template));
        
        // Apply weekly progressions
        if (this.programTemplate.weeklyProgression) {
            this.applyWeeklyProgressions(workout, week);
        }
        
        return workout;
    }

    applyWeeklyProgressions(workout, week) {
        // Apply strength rep progressions
        if (this.programTemplate.weeklyProgression.strengthReps) {
            const strengthReps = this.getStrengthRepsForWeek(week);
            console.log(`🔧 Applying template variables for week ${week}: strengthReps = ${strengthReps}`);
            
            // Replace template variables in the workout object
            const updatedWorkout = this.replaceTemplateVariables(workout, { strengthReps });
            // Copy the updated properties back to the original workout object
            Object.assign(workout, updatedWorkout);
            
            console.log(`✅ Template variables applied for week ${week}`);
        }
        
        // Add more progression types as needed
    }

    getStrengthRepsForWeek(week) {
        const progressions = this.programTemplate.weeklyProgression.strengthReps;
        
        if (week <= 2 && progressions['weeks1-2']) {
            return progressions['weeks1-2'];
        } else if (week <= 4 && progressions['weeks3-4']) {
            return progressions['weeks3-4'];
        } else if (week <= 6 && progressions['weeks5-6']) {
            return progressions['weeks5-6'];
        }
        
        // Default fallback
        return progressions['weeks1-2'] || '5';
    }

    replaceTemplateVariables(obj, variables) {
        if (typeof obj === 'string') {
            // Replace template variables like {{strengthReps}}
            const result = obj.replace(/\{\{(\w+)\}\}/g, (match, key) => {
                const replacement = variables[key] || match;
                if (replacement !== match) {
                    console.log(`🔄 Replacing ${match} with ${replacement} in: "${obj}"`);
                }
                return replacement;
            });
            return result;
        } else if (Array.isArray(obj)) {
            return obj.map(item => this.replaceTemplateVariables(item, variables));
        } else if (typeof obj === 'object' && obj !== null) {
            const result = {};
            for (const [key, value] of Object.entries(obj)) {
                result[key] = this.replaceTemplateVariables(value, variables);
            }
            return result;
        }
        
        return obj;
    }

    hasUnprocessedTemplateVariables(obj) {
        if (typeof obj === 'string') {
            return /\{\{(\w+)\}\}/.test(obj);
        } else if (Array.isArray(obj)) {
            return obj.some(item => this.hasUnprocessedTemplateVariables(item));
        } else if (typeof obj === 'object' && obj !== null) {
            return Object.values(obj).some(value => this.hasUnprocessedTemplateVariables(value));
        }
        
        return false;
    }

    getDefaultSettings() {
        return {
            currentProgram: 'six-week-shred',
            startDate: this.getTodayString(), // Default to today, user can change
            units: 'imperial', // or 'metric'
            darkMode: true,
            notifications: {
                enabled: true,
                workoutReminders: true,
                restDayReminders: false,
                time: '18:00'
            },
            privacy: {
                analytics: false,
                crashReporting: true
            },
            backup: {
                autoBackup: true,
                frequency: 'daily'
            }
        };
    }

    // Exercise Progress Management
    updateExerciseProgress(week, day, exerciseIndex, data) {
        const key = `w${week}-d${day}-e${exerciseIndex}`;
        
        const progressEntry = {
            week,
            day,
            exerciseIndex,
            data,
            completed: this.isExerciseComplete(data),
            timestamp: new Date().toISOString(),
            sessionId: this.generateSessionId()
        };
        
        this.userProgress[key] = progressEntry;
        this.saveUserProgress();
        
        console.log(`📈 Exercise progress updated: ${key}`);
        return progressEntry;
    }

    getExerciseProgress(week, day, exerciseIndex) {
        const key = `w${week}-d${day}-e${exerciseIndex}`;
        return this.userProgress[key] || null;
    }

    isExerciseComplete(exerciseData) {
        if (!exerciseData || typeof exerciseData !== 'object') return false;
        
        // Check if any meaningful data has been entered
        const hasData = Object.values(exerciseData).some(value => {
            if (typeof value === 'string') return value.trim() !== '';
            if (typeof value === 'number') return value > 0;
            return Boolean(value);
        });
        
        return hasData;
    }

    // Day/Week Completion Calculations
    calculateDayCompletion(week, day) {
        const exercises = this.getExercisesForDay(week, day);
        if (!exercises || exercises.length === 0) {
            console.log(`⚠️ No exercises found for W${week}-D${day}`);
            return 0;
        }
        
        // Only show detailed logs for Day 1 to avoid spam
        const showDetailedLogs = day === 1;
        
        let completedCount = 0;
        exercises.forEach((_, index) => {
            const progress = this.getExerciseProgress(week, day, index);
            if (showDetailedLogs) {
                console.log(`📊 W${week}-D${day} Exercise ${index} progress:`, progress);
            }
            if (progress && progress.completed) {
                completedCount++;
            }
        });
        
        const completion = Math.round((completedCount / exercises.length) * 100);
        if (showDetailedLogs || completion > 0) {
            console.log(`📋 Day W${week}-D${day}: ${completedCount}/${exercises.length} exercises complete = ${completion}%`);
        }
        return completion;
    }

    calculateWeekCompletion(week) {
        let totalDays = 0;
        let completedDays = 0;
        
        for (let day = 1; day <= 7; day++) {
            const exercises = this.getExercisesForDay(week, day);
            if (exercises && exercises.length > 0) {
                totalDays++;
                const dayCompletion = this.calculateDayCompletion(week, day);
                if (dayCompletion >= 80) { // Consider 80%+ as completed
                    completedDays++;
                }
            }
        }
        
        return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    }

    // Data Retrieval Methods
    getExercisesForDay(week, day) {
        const dayData = this.workoutData?.exercises?.[week]?.[day];
        if (!dayData) return [];
        
        // Handle new section-based structure
        if (dayData.sections) {
            let allExercises = [];
            dayData.sections.forEach(section => {
                if (section.exercises) {
                    allExercises = allExercises.concat(section.exercises);
                }
            });
            return allExercises;
        }
        
        // Fallback for legacy structure
        return dayData.exercises || [];
    }

    getDayInfo(week, day) {
        return this.workoutData?.exercises?.[week]?.[day] || null;
    }

    getWeekInfo(week) {
        const weekData = this.workoutData?.exercises?.[week];
        if (!weekData) return null;
        
        return {
            week,
            days: Object.keys(weekData).map(day => ({
                day: parseInt(day),
                ...weekData[day],
                completion: this.calculateDayCompletion(week, parseInt(day))
            })),
            completion: this.calculateWeekCompletion(week)
        };
    }

    // CSV Import/Export
    async importFromCSV(csvData) {
        try {
            const workoutProgram = this.parseCSVToWorkoutProgram(csvData);
            this.workoutData = workoutProgram;
            await this.saveWorkoutData();
            
            console.log('📥 CSV data imported successfully');
            return { success: true, program: workoutProgram };
            
        } catch (error) {
            console.error('❌ CSV import failed:', error);
            return { success: false, error: error.message };
        }
    }

    async exportToCSV() {
        try {
            const csvData = this.convertWorkoutProgramToCSV();
            return { success: true, data: csvData };
            
        } catch (error) {
            console.error('❌ CSV export failed:', error);
            return { success: false, error: error.message };
        }
    }

    parseCSVToWorkoutProgram(csvData) {
        // Implementation will depend on CSV structure
        // This is a placeholder for the CSV parsing logic
        console.log('🔄 Parsing CSV data...');
        return this.workoutData; // Placeholder
    }

    convertWorkoutProgramToCSV() {
        const csvRows = [];
        csvRows.push(['week', 'day', 'exercise_name', 'category', 'sets', 'reps', 'time', 'notes']);
        
        for (let week = 1; week <= this.workoutData.weeks; week++) {
            for (let day = 1; day <= 7; day++) {
                const exercises = this.getExercisesForDay(week, day);
                exercises.forEach(exercise => {
                    csvRows.push([
                        week,
                        day,
                        exercise.name,
                        exercise.category,
                        exercise.sets || '',
                        exercise.reps || '',
                        exercise.time || '',
                        exercise.notes || ''
                    ]);
                });
            }
        }
        
        return csvRows.map(row => row.join(',')).join('\n');
    }

    // Sync Queue Management
    addToSyncQueue(type, data) {
        const syncItem = {
            id: this.generateSessionId(),
            type,
            data,
            timestamp: new Date().toISOString(),
            attempts: 0
        };
        
        this.syncQueue.push(syncItem);
        
        if (this.isOnline) {
            this.processSyncQueue();
        }
    }

    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) return;
        
        console.log(`🔄 Processing sync queue: ${this.syncQueue.length} items`);
        
        const itemsToSync = [...this.syncQueue];
        this.syncQueue = [];
        
        for (const item of itemsToSync) {
            try {
                await this.syncItem(item);
                console.log(`✅ Synced: ${item.type}`);
            } catch (error) {
                console.warn(`⚠️ Sync failed for ${item.type}:`, error);
                item.attempts++;
                
                if (item.attempts < 3) {
                    this.syncQueue.push(item); // Retry later
                }
            }
        }
    }

    async syncItem(item) {
        // Placeholder for actual sync implementation
        // In a real app, this would sync with a backend service
        console.log(`🔄 Syncing ${item.type}...`);
        
        // Simulate network request
        await new Promise(resolve => setTimeout(resolve, 100));
        
        return true;
    }

    // Utility Methods
    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getTodayString() {
        // Get today's date in local timezone as YYYY-MM-DD
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Data Validation
    validateWorkoutData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.exercises || typeof data.exercises !== 'object') return false;
        if (!data.weeks || data.weeks < 1) return false;
        
        return true;
    }

    // Storage Management
    getStorageUsage() {
        let totalSize = 0;
        
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                totalSize += localStorage[key].length;
            }
        }
        
        return {
            used: totalSize,
            usedMB: (totalSize / 1024 / 1024).toFixed(2),
            available: 5 * 1024 * 1024 - totalSize, // Assume 5MB limit
            availableMB: ((5 * 1024 * 1024 - totalSize) / 1024 / 1024).toFixed(2)
        };
    }

    clearAllData() {
        const keys = ['workout-program-data', 'user-workout-progress', 'app-settings'];
        keys.forEach(key => localStorage.removeItem(key));
        
        this.workoutData = null;
        this.userProgress = {};
        this.settings = {};
        
        console.log('🗑️ All data cleared');
    }

    // Program Management
    async loadSavedPrograms() {
        try {
            const stored = localStorage.getItem('saved-programs');
            if (stored) {
                return JSON.parse(stored);
            } else {
                // Initialize with default program only
                const defaultProgram = await this.getDefaultWorkoutProgram();
                const savedPrograms = {
                    [defaultProgram.id]: {
                        ...defaultProgram,
                        isDefault: true,
                        lastAccessed: new Date().toISOString()
                    }
                };
                await this.saveProgramList(savedPrograms);
                return savedPrograms;
            }
        } catch (error) {
            console.error('❌ Failed to load saved programs:', error);
            return {};
        }
    }

    async saveProgramList(programs) {
        try {
            localStorage.setItem('saved-programs', JSON.stringify(programs));
            console.log('💾 Program list saved');
        } catch (error) {
            console.error('❌ Failed to save program list:', error);
            throw error;
        }
    }

    async saveCurrentProgramAs(programName) {
        try {
            if (!programName || !programName.trim()) {
                throw new Error('Program name is required');
            }

            const trimmedName = programName.trim();
            const savedPrograms = await this.loadSavedPrograms();
            
            // Check for duplicate names
            const existingProgram = Object.values(savedPrograms).find(
                program => program.name.toLowerCase() === trimmedName.toLowerCase()
            );
            
            if (existingProgram) {
                throw new Error('A program with this name already exists');
            }

            // Create new program ID
            const programId = this.generateProgramId(trimmedName);
            
            // Create new program with current data and progress
            const newProgram = {
                id: programId,
                name: trimmedName,
                description: `Custom program: ${trimmedName}`,
                version: '1.0.0',
                created: new Date().toISOString(),
                weeks: this.workoutData.weeks,
                daysPerWeek: this.workoutData.daysPerWeek,
                metadata: {
                    ...this.workoutData.metadata,
                    customProgram: true,
                    originalProgram: this.workoutData.name
                },
                exercises: JSON.parse(JSON.stringify(this.workoutData.exercises)),
                isDefault: false,
                lastAccessed: new Date().toISOString(),
                // Store current progress with the program
                savedProgress: JSON.parse(JSON.stringify(this.userProgress)),
                savedSettings: JSON.parse(JSON.stringify(this.settings))
            };

            // Add to saved programs
            savedPrograms[programId] = newProgram;
            await this.saveProgramList(savedPrograms);

            console.log(`💾 Program "${trimmedName}" saved successfully`);
            return programId;
            
        } catch (error) {
            console.error('❌ Failed to save program:', error);
            throw error;
        }
    }

    async switchToProgram(programId, continueProgress = false) {
        try {
            const savedPrograms = await this.loadSavedPrograms();
            const targetProgram = savedPrograms[programId];
            
            if (!targetProgram) {
                throw new Error('Program not found');
            }

            // Store current state before switching
            await this.saveUserProgress();
            await this.saveSettings();

            // Load target program
            this.workoutData = {
                id: targetProgram.id,
                name: targetProgram.name,
                description: targetProgram.description,
                version: targetProgram.version,
                created: targetProgram.created,
                weeks: targetProgram.weeks,
                daysPerWeek: targetProgram.daysPerWeek,
                metadata: targetProgram.metadata,
                exercises: targetProgram.exercises
            };

            if (continueProgress && targetProgram.savedProgress) {
                // Continue with saved progress
                this.userProgress = JSON.parse(JSON.stringify(targetProgram.savedProgress));
                if (targetProgram.savedSettings) {
                    this.settings = {
                        ...this.settings,
                        ...targetProgram.savedSettings
                    };
                }
            } else {
                // Start fresh
                this.userProgress = {};
                // Keep current settings but update current program
                this.settings.currentProgram = programId;
            }

            // Update last accessed time
            targetProgram.lastAccessed = new Date().toISOString();
            savedPrograms[programId] = targetProgram;
            await this.saveProgramList(savedPrograms);

            // Save new state
            await this.saveWorkoutData();
            await this.saveUserProgress();
            await this.saveSettings();

            console.log(`🔄 Switched to program: ${targetProgram.name}`);
            return true;

        } catch (error) {
            console.error('❌ Failed to switch program:', error);
            throw error;
        }
    }

    async deleteProgram(programId) {
        try {
            const savedPrograms = await this.loadSavedPrograms();
            const targetProgram = savedPrograms[programId];
            
            if (!targetProgram) {
                throw new Error('Program not found');
            }

            if (targetProgram.isDefault) {
                throw new Error('Cannot delete the default program');
            }

            if (this.workoutData && this.workoutData.id === programId) {
                throw new Error('Cannot delete the currently active program');
            }

            delete savedPrograms[programId];
            await this.saveProgramList(savedPrograms);

            console.log(`🗑️ Program "${targetProgram.name}" deleted`);
            return true;

        } catch (error) {
            console.error('❌ Failed to delete program:', error);
            throw error;
        }
    }

    async getProgramList() {
        const savedPrograms = await this.loadSavedPrograms();
        return Object.values(savedPrograms).map(program => ({
            id: program.id,
            name: program.name,
            description: program.description,
            created: program.created,
            lastAccessed: program.lastAccessed,
            isDefault: program.isDefault || false,
            isActive: this.workoutData && this.workoutData.id === program.id,
            hasProgress: program.savedProgress && Object.keys(program.savedProgress).length > 0
        })).sort((a, b) => {
            // Sort: active first, then default, then by last accessed
            if (a.isActive) return -1;
            if (b.isActive) return 1;
            if (a.isDefault) return -1;
            if (b.isDefault) return 1;
            return new Date(b.lastAccessed) - new Date(a.lastAccessed);
        });
    }

    async getCurrentProgramInfo() {
        if (!this.workoutData) return null;
        
        const savedPrograms = await this.loadSavedPrograms();
        const currentProgram = savedPrograms[this.workoutData.id];
        
        return {
            id: this.workoutData.id,
            name: this.workoutData.name,
            description: this.workoutData.description,
            isDefault: currentProgram ? currentProgram.isDefault : false,
            created: this.workoutData.created,
            hasProgress: Object.keys(this.userProgress).length > 0
        };
    }

    generateProgramId(programName) {
        // Create URL-friendly ID from program name
        const baseId = programName
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 30);
        
        // Add timestamp to ensure uniqueness
        const timestamp = Date.now().toString(36);
        return `${baseId}-${timestamp}`;
    }

    async resetCurrentProgram() {
        try {
            // Clear all user progress but keep the program structure
            this.userProgress = {};
            
            // Reset settings to defaults but keep program reference
            const currentProgramId = this.workoutData ? this.workoutData.id : null;
            this.settings = {
                ...this.getDefaultSettings(),
                currentProgram: currentProgramId
            };

            // Save reset state
            await this.saveUserProgress();
            await this.saveSettings();

            console.log('🔄 Current program reset successfully');
            return true;

        } catch (error) {
            console.error('❌ Failed to reset program:', error);
            throw error;
        }
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}