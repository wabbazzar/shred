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
        const baseIntensity = 1 + (week - 1) * 0.1; // Progressive intensity
        
        return {
            1: { // Monday - Upper Body Strength (Gym)
                type: 'gym',
                focus: 'Upper Body Strength',
                duration: '45-60 minutes',
                exercises: [
                    {
                        name: 'Bench Press',
                        category: 'strength',
                        sets: 4,
                        reps: week <= 2 ? '8-10' : week <= 4 ? '6-8' : '5-6',
                        notes: 'Progressive overload each week'
                    },
                    {
                        name: 'Pull-ups/Lat Pulldown',
                        category: 'strength',
                        sets: 3,
                        reps: '8-12',
                        notes: 'Use assistance if needed for pull-ups'
                    },
                    {
                        name: 'Overhead Press',
                        category: 'strength',
                        sets: 3,
                        reps: '8-10',
                        notes: 'Keep core tight, controlled movement'
                    },
                    {
                        name: 'Barbell Rows',
                        category: 'strength',
                        sets: 3,
                        reps: '8-10',
                        notes: 'Pull to lower chest, squeeze shoulder blades'
                    },
                    {
                        name: 'Tricep Dips',
                        category: 'bodyweight',
                        sets: 3,
                        reps: '10-15',
                        notes: 'Use assistance or add weight as needed'
                    }
                ]
            },
            2: { // Tuesday - Lower Body & Core (Home)
                type: 'home',
                focus: 'Lower Body & Core',
                duration: '30-45 minutes',
                exercises: [
                    {
                        name: 'Goblet Squats',
                        category: 'strength',
                        sets: 4,
                        reps: '12-15',
                        notes: 'Hold dumbbell at chest level'
                    },
                    {
                        name: 'Romanian Deadlifts',
                        category: 'strength',
                        sets: 3,
                        reps: '10-12',
                        notes: 'Focus on hip hinge movement'
                    },
                    {
                        name: 'Walking Lunges',
                        category: 'strength',
                        sets: 3,
                        reps: '10 each leg',
                        notes: 'Alternate legs, step forward'
                    },
                    {
                        name: 'Single-Leg Glute Bridges',
                        category: 'bodyweight',
                        sets: 3,
                        reps: '12 each leg',
                        notes: 'Squeeze glutes at top'
                    },
                    {
                        name: 'Plank Hold',
                        category: 'time',
                        sets: 3,
                        time: week <= 2 ? '30-45 seconds' : week <= 4 ? '45-60 seconds' : '60-90 seconds',
                        notes: 'Maintain straight line from head to toe'
                    },
                    {
                        name: 'Russian Twists',
                        category: 'strength',
                        sets: 3,
                        reps: '20 total',
                        notes: 'Hold dumbbell, twist side to side'
                    }
                ]
            },
            3: { // Wednesday - Lower Body Strength (Gym)
                type: 'gym',
                focus: 'Lower Body Strength',
                duration: '45-60 minutes',
                exercises: [
                    {
                        name: 'Back Squats',
                        category: 'strength',
                        sets: 4,
                        reps: week <= 2 ? '8-10' : week <= 4 ? '6-8' : '5-6',
                        notes: 'Squat below parallel, controlled descent'
                    },
                    {
                        name: 'Deadlifts',
                        category: 'strength',
                        sets: 3,
                        reps: week <= 2 ? '8' : week <= 4 ? '6' : '5',
                        notes: 'Hip hinge movement, keep bar close to body'
                    },
                    {
                        name: 'Bulgarian Split Squats',
                        category: 'strength',
                        sets: 3,
                        reps: '8-10 each leg',
                        notes: 'Rear foot elevated on bench'
                    },
                    {
                        name: 'Leg Press',
                        category: 'strength',
                        sets: 3,
                        reps: '12-15',
                        notes: 'Full range of motion, controlled'
                    },
                    {
                        name: 'Calf Raises',
                        category: 'strength',
                        sets: 4,
                        reps: '15-20',
                        notes: 'Pause at top, full stretch at bottom'
                    }
                ]
            },
            4: { // Thursday - Upper Body & Arms (Home)
                type: 'home',
                focus: 'Upper Body & Arms',
                duration: '30-45 minutes',
                exercises: [
                    {
                        name: 'Dumbbell Chest Press',
                        category: 'strength',
                        sets: 4,
                        reps: '10-12',
                        notes: 'Can be floor press or on bench'
                    },
                    {
                        name: 'Single-Arm Dumbbell Rows',
                        category: 'strength',
                        sets: 3,
                        reps: '10-12 each arm',
                        notes: 'Support with opposite hand'
                    },
                    {
                        name: 'Shoulder Press',
                        category: 'strength',
                        sets: 3,
                        reps: '10-12',
                        notes: 'Standing or seated'
                    },
                    {
                        name: 'Bicep Curls',
                        category: 'strength',
                        sets: 3,
                        reps: '12-15',
                        notes: 'Controlled movement, squeeze at top'
                    },
                    {
                        name: 'Tricep Extensions',
                        category: 'strength',
                        sets: 3,
                        reps: '12-15',
                        notes: 'Overhead or lying position'
                    },
                    {
                        name: 'Push-ups',
                        category: 'bodyweight',
                        sets: 3,
                        reps: week <= 2 ? '8-12' : week <= 4 ? '10-15' : '12-20',
                        notes: 'Modify as needed (knees, incline)'
                    }
                ]
            },
            5: { // Friday - Full Body Power (Gym)
                type: 'gym',
                focus: 'Full Body Power',
                duration: '45-60 minutes',
                exercises: [
                    {
                        name: 'Incline Bench Press',
                        category: 'strength',
                        sets: 4,
                        reps: '8-10',
                        notes: '30-45 degree incline'
                    },
                    {
                        name: 'Bent-Over Rows',
                        category: 'strength',
                        sets: 3,
                        reps: '8-10',
                        notes: 'Barbell or dumbbell'
                    },
                    {
                        name: 'Step-ups',
                        category: 'strength',
                        sets: 3,
                        reps: '10 each leg',
                        notes: 'Use bench or box, add weight'
                    },
                    {
                        name: 'Cable Flyes',
                        category: 'strength',
                        sets: 3,
                        reps: '12-15',
                        notes: 'Squeeze chest at peak contraction'
                    },
                    {
                        name: 'Face Pulls',
                        category: 'strength',
                        sets: 3,
                        reps: '15-20',
                        notes: 'High rep, focus on rear delts'
                    },
                    {
                        name: 'Hanging Knee Raises',
                        category: 'bodyweight',
                        sets: 3,
                        reps: '8-12',
                        notes: 'Control the movement, no swinging'
                    }
                ]
            },
            6: { // Saturday - Active Recovery
                type: 'recovery',
                focus: 'Mobility & Active Recovery',
                duration: '30-45 minutes',
                exercises: [
                    {
                        name: 'Dynamic Warm-up',
                        category: 'mobility',
                        sets: 1,
                        time: '10 minutes',
                        notes: 'Leg swings, arm circles, hip circles'
                    },
                    {
                        name: 'Yoga Flow',
                        category: 'flexibility',
                        sets: 1,
                        time: '15-20 minutes',
                        notes: 'Focus on problem areas from week'
                    },
                    {
                        name: 'Walking or Light Cardio',
                        category: 'cardio',
                        sets: 1,
                        time: '20-30 minutes',
                        notes: 'Easy pace, enjoy the outdoors'
                    },
                    {
                        name: 'Foam Rolling',
                        category: 'recovery',
                        sets: 1,
                        time: '10-15 minutes',
                        notes: 'Focus on tight areas'
                    }
                ]
            },
            7: { // Sunday - Complete Rest
                type: 'rest',
                focus: 'Complete Rest & Recovery',
                duration: 'All day',
                exercises: [
                    {
                        name: 'Complete Rest',
                        category: 'rest',
                        sets: 1,
                        notes: 'Focus on sleep, hydration, and meal prep for the week'
                    },
                    {
                        name: 'Meal Prep',
                        category: 'lifestyle',
                        sets: 1,
                        time: '1-2 hours',
                        notes: 'Prepare healthy meals for the upcoming week'
                    },
                    {
                        name: 'Reflection & Planning',
                        category: 'mental',
                        sets: 1,
                        time: '15-30 minutes',
                        notes: 'Review week progress, plan for next week'
                    }
                ]
            }
        };
    }

    getDefaultSettings() {
        return {
            currentProgram: 'six-week-engagement',
            startDate: new Date().toISOString().split('T')[0],
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
        return this.workoutData?.exercises?.[week]?.[day]?.exercises || [];
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
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
}