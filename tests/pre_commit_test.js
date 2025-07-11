#!/usr/bin/env node

/**
 * Pre-commit test runner for 6-Week Shred app
 * Tests basic functionality without requiring a browser
 */

const fs = require('fs');
const path = require('path');

class PreCommitValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
        this.projectRoot = path.resolve(__dirname, '..');
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const prefix = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
        console.log(`[${timestamp}] ${prefix} ${message}`);
    }

    error(message) {
        this.errors.push(message);
        this.log(message, 'error');
    }

    warning(message) {
        this.warnings.push(message);
        this.log(message, 'warning');
    }

    success(message) {
        this.log(message, 'success');
    }

    readFile(filePath) {
        try {
            return fs.readFileSync(path.join(this.projectRoot, filePath), 'utf8');
        } catch (error) {
            this.error(`Failed to read ${filePath}: ${error.message}`);
            return null;
        }
    }

    testFileExists(filePath) {
        const fullPath = path.join(this.projectRoot, filePath);
        if (fs.existsSync(fullPath)) {
            this.success(`${filePath} exists`);
            return true;
        } else {
            this.error(`${filePath} is missing`);
            return false;
        }
    }

    testHtmlStructure() {
        this.log('Testing HTML structure...', 'info');
        
        const html = this.readFile('index.html');
        if (!html) return false;

        // Test for required views
        const requiredViews = ['day-view', 'week-view', 'calendar-view'];
        for (const viewId of requiredViews) {
            if (html.includes(`id="${viewId}"`)) {
                this.success(`${viewId} element found in HTML`);
            } else {
                this.error(`${viewId} element missing from HTML`);
            }
        }

        // Test for settings modal
        if (html.includes('id="settings-modal"')) {
            this.success('Settings modal found in HTML');
        } else {
            this.error('Settings modal missing from HTML');
        }

        // Test for navigation tabs
        if (html.includes('tab-navigation')) {
            this.success('Navigation tabs found in HTML');
        } else {
            this.error('Navigation tabs missing from HTML');
        }

        return true;
    }

    testJavaScriptSyntax() {
        this.log('Testing JavaScript files for basic syntax...', 'info');
        
        const jsFiles = [
            'scripts/app.js',
            'scripts/data-manager.js',
            'scripts/navigation.js',
            'scripts/day-view.js',
            'scripts/week-view.js',
            'scripts/calendar-view.js'
        ];

        for (const file of jsFiles) {
            const content = this.readFile(file);
            if (!content) continue;

            // Basic syntax checks
            if (!content.includes('class ')) {
                this.warning(`${file} may be missing class definition`);
            }

            // Check for obvious syntax errors
            const openBraces = (content.match(/\{/g) || []).length;
            const closeBraces = (content.match(/\}/g) || []).length;
            
            if (openBraces !== closeBraces) {
                this.error(`${file} has unmatched braces (${openBraces} open, ${closeBraces} close)`);
            } else {
                this.success(`${file} has balanced braces`);
            }

            // Check for common event listener issues
            if (content.includes('addEventListener') && content.includes('getElementById')) {
                const getElementCalls = content.match(/getElementById\(['"`]([^'"`]+)['"`]\)/g) || [];
                const addEventCalls = content.match(/\.addEventListener/g) || [];
                
                if (getElementCalls.length > 0 && addEventCalls.length > 0) {
                    this.success(`${file} appears to have proper event listener setup`);
                }
            }
        }

        return true;
    }

    testSettings() {
        this.log('Testing settings functionality...', 'info');
        
        const appJs = this.readFile('scripts/app.js');
        if (!appJs) return false;

        // Check that we removed the problematic CSV event listeners
        if (appJs.includes('export-data-btn')) {
            this.error('Found reference to removed export-data-btn element');
        } else {
            this.success('No references to removed export elements');
        }

        if (appJs.includes('import-data-btn')) {
            this.error('Found reference to removed import-data-btn element');
        } else {
            this.success('No references to removed import elements');
        }

        // Check that settings event listeners are properly set up
        if (appJs.includes('setupSettingsEventListeners')) {
            this.success('Settings event listener setup function exists');
        } else {
            this.error('Settings event listener setup function missing');
        }

        return true;
    }

    testDefaultView() {
        this.log('Testing default view configuration...', 'info');
        
        const appJs = this.readFile('scripts/app.js');
        if (!appJs) return false;

        if (appJs.includes("this.currentView = 'calendar'")) {
            this.success('Default view is set to calendar');
        } else if (appJs.includes("this.currentView = 'day'")) {
            this.error('Default view is still set to day (should be calendar)');
        } else {
            this.warning('Could not determine default view setting');
        }

        return true;
    }

    testCSVExample() {
        this.log('Testing CSV example files...', 'info');
        
        // Test new assets/workouts structure
        if (this.testFileExists('assets/workouts/default.csv')) {
            const defaultCsv = this.readFile('assets/workouts/default.csv');
            if (defaultCsv && defaultCsv.includes('week,day,exercise_name')) {
                this.success('Default CSV has correct header format');
            } else {
                this.error('Default CSV has incorrect format');
            }
        }
        
        if (this.testFileExists('assets/workouts/example.csv')) {
            const exampleCsv = this.readFile('assets/workouts/example.csv');
            if (exampleCsv && exampleCsv.includes('week,day,exercise_name')) {
                this.success('Example CSV has correct header format');
            } else {
                this.error('Example CSV has incorrect format');
            }
        }
        
        // Legacy file check (removed - good!)
        const legacyPath = path.join(this.projectRoot, 'example_workout_data.csv');
        if (!fs.existsSync(legacyPath)) {
            this.success('Legacy example_workout_data.csv has been removed');
        }

        return true;
    }

    run() {
        console.log('🧪 Running pre-commit validation tests...\n');

        // Test core files exist
        const coreFiles = [
            'index.html',
            'scripts/app.js',
            'scripts/data-manager.js',
            'scripts/navigation.js',
            'styles/app.css'
        ];

        this.log('Checking core files...', 'info');
        for (const file of coreFiles) {
            this.testFileExists(file);
        }

        // Run individual test suites
        this.testHtmlStructure();
        this.testJavaScriptSyntax();
        this.testSettings();
        this.testDefaultView();
        this.testCSVExample();

        // Summary
        console.log('\n=== TEST SUMMARY ===');
        this.log(`Tests completed: ${this.errors.length + this.warnings.length} issues found`, 'info');
        
        if (this.warnings.length > 0) {
            this.log(`Warnings: ${this.warnings.length}`, 'warning');
        }

        if (this.errors.length > 0) {
            this.log(`Errors: ${this.errors.length}`, 'error');
            this.log('🚫 PRE-COMMIT VALIDATION FAILED', 'error');
            process.exit(1);
        } else {
            this.log('🎉 ALL PRE-COMMIT TESTS PASSED', 'success');
            process.exit(0);
        }
    }
}

// Run if called directly
if (require.main === module) {
    new PreCommitValidator().run();
}

module.exports = PreCommitValidator;