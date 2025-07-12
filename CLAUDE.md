# Shred - Claude AI Development Context

## 🚨 CRITICAL COMMIT STRATEGY 🚨
**MANDATORY: Commit after EVERY phase completion - NO EXCEPTIONS**

### Commit Protocol (MUST FOLLOW):
1. **Test First**: Always test in browser before claiming phase complete
2. **Commit Immediately**: Use `git add . && git commit -m "Phase X: [Description]"` after each phase
3. **Update CLAUDE.md**: Update "Current Development Status" section in commit
4. **Never Skip**: Every phase gets its own commit - this is our fallback safety net
5. **Break Large Phases**: If a phase takes >30 minutes, break it into sub-phases with commits
6. **Clean Commit Messages**: DO NOT include "🤖 Generated with [Claude Code]" or "Co-Authored-By: Claude" in commit messages

### Recovery Protocol:
- If anything breaks, immediately: `git reset --hard <last-working-commit>`
- Always check `git log --oneline -5` to see recent commits
- Test app functionality before proceeding to next phase

## Commit Message Standards

Follow Enhanced Conventional Commits format for all git commits:

### Format:
```
<type>(<scope>): <subject under 50 chars>

<body (optional)>
- Brief explanation of what changed
- Why this change was needed
- Any testing notes or breaking changes

```

### Types (Required):
- `feat` - New feature for the user
- `fix` - Bug fix for the user
- `docs` - Documentation changes
- `style` - Code formatting, missing semicolons, etc (no production code change)
- `refactor` - Refactoring production code (no feature change)
- `test` - Adding/updating tests
- `chore` - Updating dependencies, build tools, etc (no production code change)

### Scopes (Common for Shred App):
`day-view`, `week-view`, `calendar-view`, `navigation`, `data-manager`, `csv-handler`, `pwa`, `ui`, `mobile`, `desktop`, `settings`, `offline`, `performance`, `tests`

### Examples:
```
feat(day-view): add progressive auto-fill from previous week data
fix(navigation): resolve swipe gesture conflicts on mobile
docs(readme): update PWA installation instructions
style(mobile): improve touch target sizing for accessibility
refactor(data-manager): consolidate program management methods
test(csv-handler): add comprehensive export/import validation
chore(pwa): update service worker cache strategy
```

### Rules:
- Subject line: 50 characters max, lowercase after type/scope, no period, imperative mood
- Body: Explain what and why, include testing notes for significant changes
- Footer: NEVER include Claude Code attribution (NO Co-Authored-By line)
- NEVER use "Co-Authored-By: Claude" - user preference is to exclude this line
- Always test on both mobile and desktop before committing
- Include testing notes for UI/UX changes

---

## Project Overview
A Progressive Web App (PWA) for tracking the Shred photo prep workout program. Features include 3-tab navigation (Day/Week/Calendar views), offline functionality, exercise tracking with auto-suggestions, and CSV export/import capabilities. Built mobile-first with a dark theme and optimized for touch interactions.

## Current Development Status
- **Current Phase**: Complete six-week-shred modular system
- **Last Completed**: Complete workout session data for all 42 days (COMPLETE)
- **Last Known Good Commit**: `b1ce434` - Complete six-week-shred program with all 42 workout sessions
- **Next Steps**: System ready for use with complete modular workout data
- **Known Issues**: None - complete 6-week program with modular data system implemented

## Project Structure
```
six_week_shred/
├── index.html          # Main PWA entry point
├── CLAUDE.md          # This file - AI context
├── .cursorrules       # Cursor IDE rules
├── Makefile           # Build and test commands
├── manifest.json      # PWA manifest
├── service-worker.js  # Offline functionality
├── assets/
│   ├── icons/         # PWA icons (192px, 512px)
│   └── data/          # Workout program data
│       └── workout_program.json
├── styles/
│   ├── app.css        # Main application styles
│   ├── mobile.css     # Mobile-specific styles
│   └── desktop.css    # Desktop enhancements
├── scripts/
│   ├── app.js         # Main application logic
│   ├── navigation.js  # Tab navigation handler
│   ├── day-view.js    # Day view component
│   ├── week-view.js   # Week view component
│   ├── calendar-view.js # Calendar view component
│   ├── data-manager.js # Local storage & state
│   ├── csv-handler.js  # Export/import functionality
│   └── service-worker-register.js
├── docs/
│   ├── todo.md        # Development plan
│   ├── workout_app_spec.md # App specification
│   └── engagement_workout_plan.md # 6-week program
└── tests/
    ├── mobile_test.html    # Touch interaction testing
    ├── visual_test.html    # Cross-platform verification
    ├── touch_test.html     # Gesture testing
    ├── offline_test.html   # PWA offline testing
    ├── csv_test.html       # Data export/import testing
    └── test_runner.js      # Automated test suite
```

## Key Development Principles
1. **Mobile-First**: Design for 320px-428px viewports, test on iPhone SE
2. **Offline-First**: 100% functionality without network connection
3. **Visual Verification**: Test in browser, not console
4. **Dark Theme**: Consistent UI with high contrast
5. **Touch Optimized**: 44px minimum touch targets
6. **60 FPS Required**: Smooth animations and transitions
7. **Data Persistence**: Local storage with CSV export/import
8. **🎯 CRITICAL: Cross-Platform Consistency**: Mobile browser, desktop browser, and mobile PWA (installed app) MUST look and behave identically. Use `!important` CSS declarations and explicit styling to override PWA inconsistencies. Test on all three platforms before claiming completion.

## Testing Procedures
```bash
# Start development server
make serve

# Test mobile experience first
make mobile-test

# Test offline functionality
make offline-test

# Test CSV export/import
make csv-test

# Check touch interactions
make touch-test

# Verify all views
make visual-test

# Test PWA features
make pwa-test
```

## Success Criteria for Current Phase (5.3 - CSV Export System)
- [ ] Create CSV generation from current workout data
- [ ] Include all prescribed values (sets, reps, weights, times)
- [ ] Include all user-entered actual values from progress
- [ ] Add proper CSV column headers with standard schema
- [ ] Implement file download with proper filename and MIME type
- [ ] Filename format: [program_name]_workout_data_[date].csv
- [ ] Test CSV format validity and data completeness
- [ ] Verify cross-browser compatibility for file downloads

## Common Issues & Solutions
1. **Touch not working**: Check tests/touch_test.html and verify 44px targets
2. **Data not persisting**: Check local storage in DevTools
3. **Offline not working**: Verify service worker registration
4. **CSV issues**: Test with tests/csv_test.html
5. **Performance problems**: Profile with Chrome DevTools

## Important Code Patterns

### Data Structure
```javascript
// CSV schema for workout data
const CSV_COLUMNS = [
  'program_name', 'week', 'day', 'day_name', 'section',
  'exercise_name', 'prescribed_sets', 'actual_sets',
  'prescribed_reps', 'actual_reps', 'prescribed_weight',
  'actual_weight', 'prescribed_time', 'actual_time',
  'exercise_type', 'notes'
];

// Exercise types determine input fields
const ExerciseTypes = {
  STRENGTH: 'strength',        // Weight input only
  EMOM_AMRAP: 'emom_amrap',   // Rep count input
  TIMED_SINGLE: 'timed_single', // Single time input
  TIMED_MULTI: 'timed_multi',   // Multiple time inputs
  BODYWEIGHT_SINGLE: 'bw_single', // Single rep input
  BODYWEIGHT_MULTI: 'bw_multi'    // Multiple rep inputs
};
```

### State Management
```javascript
// App state stored in local storage
const AppState = {
  currentProgram: '6-Week Shred Program',
  currentWeek: 1,
  currentDay: 1,
  workoutData: {},
  sectionStates: {},  // Expanded/collapsed states
  programList: []     // Saved programs
};

// Completion calculation
function calculateCompletion(exercise) {
  const filledFields = countFilledFields(exercise);
  const totalFields = countTotalFields(exercise);
  return (filledFields / totalFields) * 100;
}
```

### Navigation Pattern
```javascript
// Tab navigation with swipe support
class TabNavigator {
  constructor() {
    this.tabs = ['day', 'week', 'calendar'];
    this.currentTab = 'day';
    this.setupSwipeGestures();
  }
  
  switchTab(tabName) {
    // Animate transition
    // Update active states
    // Load appropriate view
  }
}
```

## Performance Targets
- Mobile: 60 FPS on iPhone SE (baseline)
- Touch response: <50ms latency
- Load time: <3 seconds on 3G
- Memory: <100MB usage
- Smooth animations: 200-300ms transitions

## App-Specific Features

### Three Navigation Views
1. **Day View**: Primary interface with collapsible workout sections
2. **Week View**: 7-day grid with completion indicators
3. **Calendar View**: 6-week overview with tap navigation

### Exercise Input Types
1. **Strength**: Single weight field (e.g., "Bench Press - 4 sets")
2. **EMOM/AMRAP**: Single rep field (e.g., "Pull-ups x 8-12")
3. **Timed ≤4 sets**: Individual time fields
4. **Timed >4 sets**: Single time field
5. **Bodyweight ≤4 sets**: Individual rep fields
6. **Bodyweight >4 sets**: Single rep field

### Completion Colors
- Gray: 0% complete
- Orange (#FF6B00): 1-99% complete
- Green (#00C851): 100% complete

## Next Phase Planning
After Phase -1 completion, Phase 0 will set up the mobile-first project structure with PWA manifest, service worker, and comprehensive test infrastructure.

## Notes for Claude
- Always run visual tests before claiming completion
- Update this file after major phase completions
- Commit to git after each successful phase
- Test on mobile viewport (320px) first
- Verify offline functionality frequently
- Check CSV export/import data integrity
- Maintain dark theme consistency throughout 