// 6-Week Engagement Workout Tracker - Data Management System
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
                this.workoutData = JSON.parse(stored);
                console.log('📋 Workout data loaded from local storage');
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

    // Default Data Generators
    async getDefaultWorkoutProgram() {
        return {
            id: 'six-week-engagement',
            name: '6-Week Engagement Program',
            description: 'Complete workout program for engagement photo preparation',
            version: '1.0.0',
            created: new Date().toISOString(),
            weeks: 6,
            daysPerWeek: 7,
            metadata: {
                targetAudience: 'Engagement preparation',
                difficulty: 'Intermediate',
                equipment: ['Gym access', 'Dumbbells'],
                estimatedDuration: '45-60 minutes per session'
            },
            exercises: this.generateFullProgram()
        };
    }

    generateFullProgram() {
        const program = {};
        
        // Generate all 6 weeks
        for (let week = 1; week <= 6; week++) {
            program[week] = this.generateWeekProgram(week);
        }
        
        return program;
    }

    generateWeekProgram(week) {
        // Progressive rep scheme for strength exercises based on the actual plan
        const strengthReps = week <= 2 ? '5' : week <= 4 ? '4' : '3';
        
        return {
            1: { // Monday - Upper Body Strength + Volume (Gym)
                type: 'gym',
                focus: 'Upper Body Strength + Volume',
                duration: '45-60 minutes',
                sections: [
                    {
                        name: 'Strength Block',
                        exercises: [
                            {
                                name: 'Bench Press',
                                category: 'strength',
                                sets: 4,
                                reps: strengthReps,
                                notes: `Weeks 1-2: 5 reps, Weeks 3-4: 4 reps, Weeks 5-6: 3 reps`
                            },
                            {
                                name: 'Bent-Over Row',
                                category: 'strength',
                                sets: 4,
                                reps: strengthReps,
                                notes: 'Pull to lower chest, squeeze shoulder blades'
                            },
                            {
                                name: 'Overhead Press',
                                category: 'strength',
                                sets: 3,
                                reps: strengthReps,
                                notes: 'Keep core tight, controlled movement'
                            }
                        ]
                    },
                    {
                        name: 'Volume Block (EMOM/AMRAP)',
                        exercises: [
                            {
                                name: 'EMOM 12 minutes: Pull-ups / Push-ups',
                                category: 'emom',
                                time: '12 minutes',
                                notes: 'Minute 1: Pull-ups x 8-12, Minute 2: Push-ups x 15-20. Alternate each minute.'
                            },
                            {
                                name: 'AMRAP 8 minutes',
                                category: 'amrap',
                                time: '8 minutes',
                                notes: 'Dumbbell rows x 12 each arm, Incline dumbbell press x 15, Lateral raises x 20'
                            },
                            {
                                name: 'Plank Hold',
                                category: 'time',
                                sets: 3,
                                time: '45-60 seconds',
                                notes: 'Maintain straight line from head to toe'
                            }
                        ]
                    }
                ]
            },
            2: { // Tuesday - Dumbbell HIIT + Cardio (Home)
                type: 'home',
                focus: 'Dumbbell HIIT + Cardio',
                duration: '30-45 minutes',
                sections: [
                    {
                        name: 'Warm-up',
                        exercises: [
                            {
                                name: 'Dynamic Movement',
                                category: 'mobility',
                                time: '5 minutes',
                                notes: 'Prepare body for workout'
                            }
                        ]
                    },
                    {
                        name: 'EMOM 20 minutes',
                        exercises: [
                            {
                                name: 'EMOM 20 minutes: 4 exercises',
                                category: 'emom',
                                time: '20 minutes',
                                notes: 'Min 1: Dumbbell thrusters x 12-15, Min 2: Renegade rows x 8-10 each arm, Min 3: Single-arm overhead carry + reverse lunge x 6 each side, Min 4: Dumbbell burpees x 8-12'
                            }
                        ]
                    },
                    {
                        name: 'Finisher',
                        exercises: [
                            {
                                name: 'AMRAP 5 minutes',
                                category: 'amrap',
                                time: '5 minutes',
                                notes: 'Dumbbell swings x 15, Push-ups x 10, Squat jumps x 10'
                            }
                        ]
                    }
                ]
            },
            3: { // Wednesday - Lower Body Strength + Volume (Gym)
                type: 'gym',
                focus: 'Lower Body Strength + Volume',
                duration: '45-60 minutes',
                sections: [
                    {
                        name: 'Strength Block',
                        exercises: [
                            {
                                name: 'Back Squat',
                                category: 'strength',
                                sets: 4,
                                reps: strengthReps,
                                notes: 'Same rep scheme as Monday'
                            },
                            {
                                name: 'Romanian Deadlift',
                                category: 'strength',
                                sets: 4,
                                reps: strengthReps,
                                notes: 'Hip hinge movement, keep bar close to body'
                            },
                            {
                                name: 'Bulgarian Split Squats',
                                category: 'strength',
                                sets: 3,
                                reps: '8 each leg',
                                notes: 'Rear foot elevated on bench'
                            }
                        ]
                    },
                    {
                        name: 'Volume Block',
                        exercises: [
                            {
                                name: 'EMOM 15 minutes',
                                category: 'emom',
                                time: '15 minutes',
                                notes: 'Minutes 1-5: Goblet squats x 15, Minutes 6-10: Single-leg RDL x 8 each leg, Minutes 11-15: Jump squats x 12'
                            },
                            {
                                name: 'AMRAP 6 minutes',
                                category: 'amrap',
                                time: '6 minutes',
                                notes: 'Walking lunges x 20 (10 each leg), Calf raises x 25, Wall sit x 30 seconds'
                            }
                        ]
                    }
                ]
            },
            4: { // Thursday - Dumbbell Metabolic + Cardio (Home)
                type: 'home',
                focus: 'Dumbbell Metabolic + Cardio',
                duration: '30-45 minutes',
                sections: [
                    {
                        name: 'Circuit 1',
                        exercises: [
                            {
                                name: 'Circuit 1 (4 rounds)',
                                category: 'circuit',
                                sets: 4,
                                time: '45 sec work / 15 sec rest',
                                notes: '1. Dumbbell squat to press, 2. Single-arm row (alternate), 3. Reverse lunges with bicep curls, 4. Renegade rows, 5. Dumbbell deadlift to upright row, 6. Mountain climbers'
                            }
                        ]
                    },
                    {
                        name: 'Rest',
                        exercises: [
                            {
                                name: 'Rest Period',
                                category: 'rest',
                                time: '2 minutes',
                                notes: 'Recover between circuits'
                            }
                        ]
                    },
                    {
                        name: 'Circuit 2',
                        exercises: [
                            {
                                name: 'Circuit 2 (3 rounds)',
                                category: 'circuit',
                                sets: 3,
                                time: '40 sec work / 20 sec rest',
                                notes: '1. Dumbbell Romanian deadlifts, 2. Push-up to T-rotation, 3. Goblet squats with pulse, 4. Single-arm overhead press (switch arms), 5. Dumbbell step-ups, 6. Plank with dumbbell pull-throughs'
                            }
                        ]
                    },
                    {
                        name: 'Finisher',
                        exercises: [
                            {
                                name: 'Farmer\'s Walk',
                                category: 'strength',
                                sets: 3,
                                time: '30 seconds',
                                notes: 'Use 50lb dumbbells or adjust weight as needed'
                            }
                        ]
                    }
                ]
            },
            5: { // Friday - Full Body Power + AMRAP (Gym)
                type: 'gym',
                focus: 'Full Body Power + AMRAP',
                duration: '45-60 minutes',
                sections: [
                    {
                        name: 'Power Block',
                        exercises: [
                            {
                                name: 'Deadlift',
                                category: 'strength',
                                sets: 5,
                                reps: '3',
                                notes: 'Focus on speed and power'
                            },
                            {
                                name: 'Push Press',
                                category: 'strength',
                                sets: 4,
                                reps: '5',
                                notes: 'Explosive overhead movement'
                            },
                            {
                                name: 'Box Jumps or Jump Squats',
                                category: 'bodyweight',
                                sets: 4,
                                reps: '8',
                                notes: 'Explosive lower body power'
                            }
                        ]
                    },
                    {
                        name: 'AMRAP Finisher (20 minutes)',
                        exercises: [
                            {
                                name: 'AMRAP Round 1 (5 min)',
                                category: 'amrap',
                                time: '5 minutes',
                                notes: 'Burpees x 5, Kettlebell swings x 10, Mountain climbers x 20'
                            },
                            {
                                name: 'AMRAP Round 2 (5 min)',
                                category: 'amrap',
                                time: '5 minutes',
                                notes: 'Thrusters x 8, Pull-ups x 6, Push-ups x 12'
                            },
                            {
                                name: 'AMRAP Round 3 (5 min)',
                                category: 'amrap',
                                time: '5 minutes',
                                notes: 'Squat to calf raise x 15, Pike push-ups x 8, Plank to downward dog x 10'
                            },
                            {
                                name: 'AMRAP Round 4 (5 min)',
                                category: 'amrap',
                                time: '5 minutes',
                                notes: 'Repeat Round 1: Burpees x 5, Kettlebell swings x 10, Mountain climbers x 20'
                            }
                        ]
                    }
                ]
            },
            6: { // Saturday - Yoga/Mobility (45-60 min)
                type: 'recovery',
                focus: 'Yoga/Mobility',
                duration: '45-60 minutes',
                sections: [
                    {
                        name: 'Flow 1 - Dynamic Warm-up',
                        exercises: [
                            {
                                name: 'Dynamic Warm-up',
                                category: 'mobility',
                                time: '10 minutes',
                                notes: 'Cat-cow stretches, World\'s greatest stretch, Hip circles and leg swings, Arm circles and shoulder rolls'
                            }
                        ]
                    },
                    {
                        name: 'Flow 2 - Strength-Flexibility',
                        exercises: [
                            {
                                name: 'Strength-Flexibility Flow',
                                category: 'flexibility',
                                time: '25 minutes',
                                notes: 'Sun salutation A (5 rounds), Warrior sequence (30 sec holds), Triangle pose series, Twisted chair pose, Eagle pose balance, Low lunge with side stretch'
                            }
                        ]
                    },
                    {
                        name: 'Flow 3 - Recovery/Restoration',
                        exercises: [
                            {
                                name: 'Recovery/Restoration',
                                category: 'flexibility',
                                time: '15 minutes',
                                notes: 'Pigeon pose (2 min each side), Seated spinal twist, Happy baby pose, Legs up the wall, Savasana'
                            }
                        ]
                    }
                ]
            },
            7: { // Sunday - Active Recovery + Optional Cardio
                type: 'recovery',
                focus: 'Active Recovery + Optional Cardio',
                duration: 'Flexible',
                sections: [
                    {
                        name: 'Active Recovery',
                        exercises: [
                            {
                                name: 'Complete Rest',
                                category: 'rest',
                                notes: 'Focus on sleep, hydration, and meal prep for the week'
                            },
                            {
                                name: 'Optional Cardio',
                                category: 'cardio',
                                time: '20-30 minutes',
                                notes: 'Light cardio if desired: walking, easy cycling, or swimming'
                            },
                            {
                                name: 'Meal Prep',
                                category: 'lifestyle',
                                time: '1-2 hours',
                                notes: 'Prepare healthy meals for the upcoming week'
                            }
                        ]
                    }
                ]
            }
        };
    }

    getDefaultSettings() {
        return {
            currentProgram: 'six-week-engagement',
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
        if (!exercises || exercises.length === 0) return 0;
        
        let completedCount = 0;
        exercises.forEach((_, index) => {
            const progress = this.getExerciseProgress(week, day, index);
            if (progress && progress.completed) {
                completedCount++;
            }
        });
        
        return Math.round((completedCount / exercises.length) * 100);
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