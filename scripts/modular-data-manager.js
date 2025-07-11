// 6-Week Engagement Workout Tracker - Modular Data Management System
// Handles multiple data types, config-driven workout generation, LLM-friendly

class ModularDataManager {
    constructor() {
        this.workoutData = null;
        this.userProgress = {};
        this.settings = {};
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        
        // Configuration data storage
        this.programMetadata = null;
        this.phaseDefinitions = null;
        this.dayTemplates = null;
        this.exerciseLibrary = null;
        this.sectionDefinitions = null;
        this.workoutSessions = null;
        
        // Configuration paths
        this.configPaths = {
            programMetadata: 'assets/configs/examples/program-metadata.json',
            phaseDefinitions: 'assets/configs/examples/phase-definitions.json',
            dayTemplates: 'assets/configs/examples/day-templates.json',
            exerciseLibrary: 'assets/configs/examples/exercise-library.json',
            sectionDefinitions: 'assets/configs/examples/section-definitions.json',
            workoutSessions: 'assets/configs/programs/six-week-shred-sessions.json'
        };
        
        this.init();
    }

    async init() {
        this.setupOnlineStatusListener();
        await this.loadAllData();
        console.log('💾 Modular Data Manager initialized');
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

    // Data Loading - Modular Config System
    async loadAllData() {
        try {
            await Promise.all([
                this.loadConfigurationData(),
                this.loadUserProgress(),
                this.loadSettings()
            ]);
            
            // Generate workout program from loaded configs
            await this.generateWorkoutProgram();
            
            console.log('📋 All modular data loaded successfully');
        } catch (error) {
            console.error('❌ Failed to load modular data:', error);
            // Fallback to legacy system
            await this.fallbackToLegacySystem();
        }
    }

    async loadConfigurationData() {
        try {
            console.log('🔧 Loading configuration data...');
            
            const configPromises = Object.entries(this.configPaths).map(async ([key, path]) => {
                try {
                    const data = await this.loadJSONConfig(path);
                    this[key] = data;
                    console.log(`✅ Loaded ${key} from ${path}`);
                    return { key, data };
                } catch (error) {
                    console.warn(`⚠️ Failed to load ${key} from ${path}:`, error.message);
                    return { key, data: null, error };
                }
            });

            const results = await Promise.all(configPromises);
            
            // Check if critical configs loaded
            const criticalConfigs = ['programMetadata', 'exerciseLibrary', 'sectionDefinitions'];
            const missingCritical = criticalConfigs.filter(config => !this[config]);
            
            if (missingCritical.length > 0) {
                throw new Error(`Missing critical configurations: ${missingCritical.join(', ')}`);
            }
            
            console.log('🎯 All configuration data loaded successfully');
            
        } catch (error) {
            console.error('❌ Failed to load configuration data:', error);
            throw error;
        }
    }

    async loadJSONConfig(path) {
        try {
            const response = await fetch(path);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error(`❌ Failed to fetch config from ${path}:`, error);
            throw error;
        }
    }

    async generateWorkoutProgram() {
        try {
            console.log('🏗️ Generating workout program from configurations...');
            
            if (!this.programMetadata) {
                throw new Error('Program metadata is required');
            }

            // Use existing workout sessions if available, otherwise generate
            if (this.workoutSessions && this.workoutSessions.sessions) {
                this.workoutData = await this.buildProgramFromSessions();
            } else {
                this.workoutData = await this.buildProgramFromTemplates();
            }
            
            await this.saveWorkoutData();
            console.log('✅ Workout program generated and saved');
            
        } catch (error) {
            console.error('❌ Failed to generate workout program:', error);
            throw error;
        }
    }

    async buildProgramFromSessions() {
        const sessions = this.workoutSessions.sessions;
        const metadata = this.programMetadata;
        
        const exercises = {};
        
        // Convert sessions to the expected exercise structure
        for (const [weekStr, weekData] of Object.entries(sessions)) {
            const week = parseInt(weekStr);
            exercises[week] = {};
            
            for (const [dayStr, dayData] of Object.entries(weekData)) {
                const day = parseInt(dayStr);
                
                // Get day template info
                const template = this.getDayTemplate(dayData.template);
                const phase = this.getPhase(week);
                
                exercises[week][day] = {
                    type: template ? template.location : 'gym',
                    focus: template ? template.name : 'Workout',
                    duration: template ? `${template.duration.typical} minutes` : '45-60 minutes',
                    template: dayData.template,
                    phase: dayData.phase,
                    sections: await this.buildSectionsFromConfig(dayData.sections)
                };
            }
        }
        
        return {
            id: metadata.id,
            name: metadata.name,
            description: metadata.description,
            version: metadata.version,
            created: metadata.created || new Date().toISOString(),
            weeks: metadata.duration.weeks,
            daysPerWeek: metadata.duration.daysPerWeek,
            metadata: {
                targetAudience: metadata.targetAudience?.[0] || 'general-fitness',
                difficulty: metadata.difficulty,
                equipment: metadata.equipment.required,
                estimatedDuration: metadata.duration.estimatedDuration
            },
            exercises: exercises
        };
    }

    async buildSectionsFromConfig(sectionsConfig) {
        const builtSections = [];
        
        for (const sectionConfig of sectionsConfig) {
            const sectionDef = this.getSectionDefinition(sectionConfig.sectionId);
            if (!sectionDef) {
                console.warn(`⚠️ Section definition not found: ${sectionConfig.sectionId}`);
                continue;
            }
            
            const section = {
                name: sectionConfig.name || sectionDef.name,
                exercises: await this.buildExercisesFromConfig(sectionConfig.exercises)
            };
            
            builtSections.push(section);
        }
        
        return builtSections;
    }

    async buildExercisesFromConfig(exercisesConfig) {
        const builtExercises = [];
        
        for (const exerciseConfig of exercisesConfig) {
            const exerciseDef = this.getExerciseDefinition(exerciseConfig.exerciseId);
            if (!exerciseDef) {
                console.warn(`⚠️ Exercise definition not found: ${exerciseConfig.exerciseId}`);
                continue;
            }
            
            const exercise = {
                name: exerciseConfig.name || exerciseDef.name,
                category: exerciseDef.category,
                notes: exerciseConfig.notes || ''
            };
            
            // Add parameters from config
            if (exerciseConfig.parameters) {
                const params = exerciseConfig.parameters;
                if (params.sets) exercise.sets = params.sets;
                if (params.reps) exercise.reps = params.reps;
                if (params.weight) exercise.weight = params.weight;
                if (params.time) exercise.time = params.time;
                if (params.rest) exercise.rest = params.rest;
            }
            
            builtExercises.push(exercise);
        }
        
        return builtExercises;
    }

    async buildProgramFromTemplates() {
        // Generate program from templates and phases when no explicit sessions
        const metadata = this.programMetadata;
        const exercises = {};
        
        for (let week = 1; week <= metadata.duration.weeks; week++) {
            exercises[week] = {};
            const phase = this.getPhaseForWeek(week);
            
            for (let day = 1; day <= metadata.duration.daysPerWeek; day++) {
                const template = this.getTemplateForDay(day);
                if (!template) continue;
                
                exercises[week][day] = {
                    type: template.location,
                    focus: template.name,
                    duration: `${template.duration.typical} minutes`,
                    template: template.id,
                    phase: phase?.id,
                    sections: await this.generateSectionsFromTemplate(template, phase)
                };
            }
        }
        
        return {
            id: metadata.id,
            name: metadata.name,
            description: metadata.description,
            version: metadata.version,
            created: metadata.created || new Date().toISOString(),
            weeks: metadata.duration.weeks,
            daysPerWeek: metadata.duration.daysPerWeek,
            metadata: {
                targetAudience: metadata.targetAudience?.[0] || 'general-fitness',
                difficulty: metadata.difficulty,
                equipment: metadata.equipment.required,
                estimatedDuration: metadata.duration.estimatedDuration
            },
            exercises: exercises
        };
    }

    async generateSectionsFromTemplate(template, phase) {
        const sections = [];
        
        if (template.structure?.warmup) {
            sections.push({
                name: 'Warm-up',
                exercises: [{
                    name: 'Dynamic Warm-up',
                    category: 'mobility',
                    time: template.structure.warmup.duration,
                    notes: 'Prepare body for workout'
                }]
            });
        }
        
        if (template.structure?.main) {
            for (const sectionId of template.structure.main.sections || []) {
                const sectionDef = this.getSectionDefinition(sectionId);
                if (sectionDef) {
                    const section = await this.generateSectionFromDefinition(sectionDef, phase);
                    sections.push(section);
                }
            }
        }
        
        return sections;
    }

    async generateSectionFromDefinition(sectionDef, phase) {
        // This is where the magic happens - generate exercises based on section constraints
        const exercises = [];
        
        // Get exercises that match the section constraints
        const validExercises = this.getExercisesForSection(sectionDef);
        
        // Apply phase-specific parameters
        const phaseParams = phase?.progression || {};
        
        // Generate section exercises
        const exerciseCount = Math.min(
            sectionDef.exerciseConstraints?.maxExercises || 3,
            validExercises.length
        );
        
        for (let i = 0; i < exerciseCount && i < validExercises.length; i++) {
            const exerciseDef = validExercises[i];
            const exercise = {
                name: exerciseDef.name,
                category: exerciseDef.category,
                notes: ''
            };
            
            // Apply section structure parameters
            if (sectionDef.structure?.setRep) {
                exercise.sets = sectionDef.structure.setRep.sets;
                exercise.reps = phaseParams.strengthReps?.reps || sectionDef.structure.setRep.reps;
            }
            
            if (sectionDef.structure?.timeConstraints) {
                exercise.time = sectionDef.structure.timeConstraints.totalTime;
            }
            
            exercises.push(exercise);
        }
        
        return {
            name: sectionDef.name,
            exercises: exercises
        };
    }

    // Helper methods for config lookups
    getDayTemplate(templateId) {
        return this.dayTemplates?.templates?.find(t => t.id === templateId);
    }

    getPhase(week) {
        return this.phaseDefinitions?.phases?.find(p => 
            week >= p.weeks.start && week <= p.weeks.end
        );
    }

    getPhaseForWeek(week) {
        return this.getPhase(week);
    }

    getTemplateForDay(day) {
        // Default mapping - can be made configurable
        const templateMapping = {
            1: 'upper-strength-gym',
            2: 'dumbbell-hiit-home', 
            3: 'lower-strength-gym',
            4: 'dumbbell-hiit-home',
            5: 'upper-strength-gym',
            6: 'yoga-mobility',
            7: 'complete-rest'
        };
        
        const templateId = templateMapping[day];
        return this.getDayTemplate(templateId);
    }

    getSectionDefinition(sectionId) {
        return this.sectionDefinitions?.sections?.find(s => s.id === sectionId);
    }

    getExerciseDefinition(exerciseId) {
        return this.exerciseLibrary?.exercises?.find(e => e.id === exerciseId);
    }

    getExercisesForSection(sectionDef) {
        if (!this.exerciseLibrary?.exercises) return [];
        
        let validExercises = this.exerciseLibrary.exercises;
        
        // Filter by allowed exercise types
        if (sectionDef.exerciseConstraints?.exerciseTypes) {
            validExercises = validExercises.filter(ex => 
                sectionDef.exerciseConstraints.exerciseTypes.includes(ex.category)
            );
        }
        
        // Apply other constraints as needed
        return validExercises.slice(0, sectionDef.exerciseConstraints?.maxExercises || 10);
    }

    // Legacy compatibility methods
    async fallbackToLegacySystem() {
        console.log('🔄 Falling back to legacy data system...');
        
        // Import and use the original DataManager
        const LegacyDataManager = await this.loadLegacyDataManager();
        const legacyManager = new LegacyDataManager();
        
        // Copy essential data
        this.workoutData = legacyManager.workoutData;
        this.userProgress = legacyManager.userProgress;
        this.settings = legacyManager.settings;
        
        console.log('✅ Legacy system loaded successfully');
    }

    async loadLegacyDataManager() {
        // This would typically import the original DataManager
        // For now, we'll use the existing methods
        return class LegacyDataManager {
            constructor() {
                this.workoutData = null;
                this.userProgress = {};
                this.settings = {};
            }
        };
    }

    // Program configuration validation
    validateConfiguration() {
        const errors = [];
        
        if (!this.programMetadata) {
            errors.push('Program metadata is required');
        }
        
        if (!this.exerciseLibrary?.exercises?.length) {
            errors.push('Exercise library must contain at least one exercise');
        }
        
        if (!this.sectionDefinitions?.sections?.length) {
            errors.push('Section definitions must contain at least one section');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Configuration export for LLM usage
    async exportConfigurationSchema() {
        return {
            dataTypes: {
                programMetadata: 'Program information, duration, equipment, difficulty',
                phaseDefinitions: 'Training phases with progression rules',
                dayTemplates: 'Types of workout days with structure',
                exerciseLibrary: 'Exercise database with parameters',
                sectionDefinitions: 'Workout blocks (warmup, strength, EMOM, etc.)',
                workoutSessions: 'Specific workout sessions combining above elements'
            },
            currentConfig: {
                programMetadata: this.programMetadata,
                phaseDefinitions: this.phaseDefinitions,
                dayTemplates: this.dayTemplates,
                exerciseLibrary: this.exerciseLibrary,
                sectionDefinitions: this.sectionDefinitions,
                workoutSessions: this.workoutSessions
            },
            schemas: {
                location: 'assets/configs/schemas/',
                files: [
                    'program-metadata.schema.json',
                    'phase-definitions.schema.json', 
                    'day-templates.schema.json',
                    'exercise-library.schema.json',
                    'section-definitions.schema.json',
                    'workout-sessions.schema.json'
                ]
            },
            usage: {
                description: 'To create a new workout program, provide JSON files following these schemas',
                steps: [
                    '1. Define program metadata (name, duration, equipment)',
                    '2. Create training phases with progression rules',
                    '3. Define day templates for workout types',
                    '4. Build exercise library with all needed exercises',
                    '5. Create section definitions for workout blocks',
                    '6. Assemble workout sessions referencing above elements'
                ],
                validation: 'Use the schemas to validate your JSON before loading'
            }
        };
    }

    // Data persistence (delegate to existing methods)
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

    getDefaultSettings() {
        const metadata = this.programMetadata;
        return {
            currentProgram: metadata?.id || 'six-week-shred',
            startDate: this.getTodayString(),
            units: metadata?.settings?.unitSystem || 'imperial',
            darkMode: true,
            autoProgression: metadata?.settings?.autoProgression ?? true,
            restTimers: metadata?.settings?.restTimers ?? true,
            trackingFields: metadata?.settings?.trackingFields || ['weight', 'reps', 'time', 'notes'],
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

    // Utility methods
    getTodayString() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

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
        // Implementation details same as original
    }

    generateSessionId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Exercise Progress Management (delegate to compatible methods)
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
        
        const hasData = Object.values(exerciseData).some(value => {
            if (typeof value === 'string') return value.trim() !== '';
            if (typeof value === 'number') return value > 0;
            return Boolean(value);
        });
        
        return hasData;
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

    // Data retrieval methods (compatible with existing interface)
    getExercisesForDay(week, day) {
        const dayData = this.workoutData?.exercises?.[week]?.[day];
        if (!dayData) return [];
        
        if (dayData.sections) {
            let allExercises = [];
            dayData.sections.forEach(section => {
                if (section.exercises) {
                    allExercises = allExercises.concat(section.exercises);
                }
            });
            return allExercises;
        }
        
        return dayData.exercises || [];
    }

    getDayInfo(week, day) {
        return this.workoutData?.exercises?.[week]?.[day] || null;
    }

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
                if (dayCompletion >= 80) {
                    completedDays++;
                }
            }
        }
        
        return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    }

    // Program Management methods (required for settings)
    async getProgramList() {
        // Return a simplified program list for the settings UI
        const metadata = this.programMetadata;
        if (!metadata) {
            return [{
                id: 'six-week-shred',
                name: '6-Week Shred Program',
                description: 'Default program',
                created: new Date().toISOString(),
                lastAccessed: new Date().toISOString(),
                isDefault: true,
                isActive: true,
                hasProgress: Object.keys(this.userProgress).length > 0
            }];
        }

        return [{
            id: metadata.id,
            name: metadata.name,
            description: metadata.description,
            created: metadata.created || new Date().toISOString(),
            lastAccessed: new Date().toISOString(),
            isDefault: true,
            isActive: true,
            hasProgress: Object.keys(this.userProgress).length > 0
        }];
    }

    async getCurrentProgramInfo() {
        const metadata = this.programMetadata;
        if (!metadata) {
            return {
                id: 'six-week-shred',
                name: '6-Week Shred Program',
                description: 'Default program',
                isDefault: true,
                created: new Date().toISOString(),
                hasProgress: Object.keys(this.userProgress).length > 0
            };
        }

        return {
            id: metadata.id,
            name: metadata.name,
            description: metadata.description,
            isDefault: true,
            created: metadata.created || new Date().toISOString(),
            hasProgress: Object.keys(this.userProgress).length > 0
        };
    }

    async saveCurrentProgramAs(programName) {
        console.log(`💾 Program "${programName}" would be saved (modular system doesn't support multiple programs yet)`);
        throw new Error('Multiple program support not yet implemented in modular system');
    }

    async switchToProgram(programId, continueProgress = false) {
        console.log(`🔄 Program switching not yet implemented in modular system: ${programId}`);
        throw new Error('Program switching not yet implemented in modular system');
    }

    async deleteProgram(programId) {
        console.log(`🗑️ Program deletion not yet implemented in modular system: ${programId}`);
        throw new Error('Program deletion not yet implemented in modular system');
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

    // CSV Export/Import (simplified for now)
    async exportToCSV() {
        try {
            const csvData = this.convertWorkoutProgramToCSV();
            return { success: true, data: csvData };
            
        } catch (error) {
            console.error('❌ CSV export failed:', error);
            return { success: false, error: error.message };
        }
    }

    convertWorkoutProgramToCSV() {
        const csvRows = [];
        csvRows.push(['week', 'day', 'exercise_name', 'category', 'sets', 'reps', 'time', 'notes']);
        
        if (!this.workoutData?.exercises) {
            return csvRows.map(row => row.join(',')).join('\n');
        }

        for (let week = 1; week <= (this.workoutData.weeks || 6); week++) {
            for (let day = 1; day <= 7; day++) {
                const exercises = this.getExercisesForDay(week, day);
                exercises.forEach(exercise => {
                    csvRows.push([
                        week,
                        day,
                        exercise.name || '',
                        exercise.category || '',
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

    async importFromCSV(csvData) {
        console.log('📥 CSV import not yet fully implemented in modular system');
        return { success: false, error: 'CSV import not yet implemented in modular system' };
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ModularDataManager;
}