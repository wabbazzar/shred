# 6-Week Engagement Workout App - Technical Specification

## Project Overview
A Progressive Web App (PWA) for tracking the 6-week engagement photo prep workout program. The app features program management, offline functionality, and detailed progress tracking with CSV export/import capabilities.

## Technical Requirements

### Platform & Architecture
- **Type:** Progressive Web App (PWA)
- **Compatibility:** Mobile-first responsive design
- **Offline:** 100% offline functionality with local storage
- **Installation:** Can be installed to device home screen
- **Data Storage:** Browser local storage only (no cloud/server requirements)

### Design Theme
- **Style:** Dark theme, minimalist, sleek
- **Typography:** Clean, readable fonts with good hierarchy
- **Colors:** Dark backgrounds with high contrast text, orange for partial completion, green for full completion
- **Mobile-first:** Optimized for mobile viewing and touch interaction

---

## Core Navigation Structure

### Bottom Tab Navigation (3 tabs)
1. **Day View (Left Tab)** - Current day's workout
2. **Week View (Middle Tab)** - 7-day week overview  
3. **Calendar View (Right Tab)** - Full 6-week calendar

### Top Header Elements
- Program dropdown (current program name)
- Settings gear icon (top right)
- Day/Week indicator when relevant

---

## Day View (Primary Interface)

### Navigation
- **Swipe left/right** to cycle between days
- **Day header** showing "Day Name - Week X" with completion percentage

### Workout Display
- **Scrollable list** with collapsible sections
- **Default behavior:** 
  - If all sections fit on screen → all open by default
  - If scrolling required → first section open by default
- **Persistent state:** Remember which sections were expanded between sessions

### Section Structure
```
Day Header (Monday - Week 2) [85% Complete]

▼ Strength Block
  ■ Bench Press - 4 sets of 5 reps
    Weight: [185] lbs (placeholder from last week)
  
  ■ Bent-Over Row - 4 sets of 5 reps  
    Weight: [155] lbs
    
▼ Volume Block
  ■ EMOM 12 minutes: Pull-ups x 8-12
    Reps: [10]
    
  ■ EMOM 12 minutes: Push-ups x 15-20
    Reps: [18]
```

### Exercise Input Logic

#### Field Types by Exercise Category:
1. **Strength Exercises** (prescribed sets/reps)
   - Single weight input field only
   - Example: "Bench Press - 4 sets of 5 reps" → Weight: [___] lbs

2. **EMOM/AMRAP Exercises** 
   - Single rep count field (user sustains across sets)
   - Example: "Pull-ups x 8-12" → Reps: [___]

3. **Timed Exercises** (≤4 sets)
   - Individual time input for each set
   - Example: "Plank hold - 3 sets" → Set 1: [___] Set 2: [___] Set 3: [___]

4. **Timed Exercises** (>4 sets)  
   - Single time input field
   - Example: "Mountain climbers - 8 rounds" → Time: [___]

5. **Bodyweight with Rep Ranges** (≤4 sets)
   - Individual rep input for each set  
   - Example: "Push-ups - 3 sets of 15-20" → Set 1: [___] Set 2: [___] Set 3: [___]

6. **Bodyweight with Rep Ranges** (>4 sets)
   - Single rep input field
   - Example: "Jumping jacks - 6 rounds" → Reps: [___]

#### No Checkboxes Rule:
- Exercises with input fields do NOT have checkboxes (redundant)
- Completion determined by filled vs empty input fields

### Auto-Suggestion System
- **Previous week's data** shows as placeholder text in input fields
- **Behavior:** Placeholder disappears when user starts typing
- **Example:** If last Monday's bench press was 185 lbs, this Monday shows "185" as placeholder

---

## Week View

### Layout
- **7 clickable day tiles** arranged in week format
- **Visual completion indicators:**
  - Gray: 0% complete
  - Orange: 1-99% complete  
  - Green: 100% complete
- **Tap day tile** → Navigate to Day View for that day

### Week Navigation
- **Swipe left/right** or arrow buttons to cycle through weeks 1-6
- **Week header:** "Week 2 of 6" with overall week completion percentage

---

## Calendar View

### Layout
- **6-week grid** showing all 42 days at once
- **Day tiles** with completion status color coding
- **Tap any day** → Navigate to Day View for that day
- **Current day indicator** (subtle highlight/border)

### Date System
- **Relative dates:** Based on when user started that specific program
- **Example:** Program start date = Day 1, regardless of calendar date

---

## Completion Tracking System

### Exercise-Level Completion
- **Formula:** Filled input fields ÷ Total input fields for that exercise
- **Visual states:**
  - Empty fields: Default/gray state
  - Partial completion: Orange highlight
  - Full completion: Green highlight

### Day-Level Completion  
- **Formula:** Total filled fields ÷ Total required fields for entire day
- **Display:** Percentage in day header
- **Visual:** Progress bar or percentage indicator

### Week/Calendar Visual Coding
- **0% complete:** Gray day tile
- **1-99% complete:** Orange day tile  
- **100% complete:** Green day tile

---

## Program Management System

### Data Structure (CSV-based)
Each row represents one exercise instance with columns:
```csv
program_name,week,day,day_name,section,exercise_name,prescribed_sets,actual_sets,prescribed_reps,actual_reps,prescribed_weight,actual_weight,prescribed_time,actual_time,exercise_type,notes
```

### Program Dropdown (Top Header)
- **Default:** "6-Week Engagement Program"
- **Additional programs:** User-saved variations
- **Switching behavior:** Ask user "Start over or continue at same position?"

### Save Program Feature
- **Access:** Via Settings → "Save Current Program As..."
- **Input:** Custom program name (e.g., "Summer Cycle 1")
- **Result:** Appears in program dropdown for future selection

---

## Settings Screen

### Access
- **Gear icon** in top-right header
- **Slide-in modal** or full-screen overlay

### Settings Organization

#### Program Management
- **Switch Program:** Dropdown showing all saved programs
- **Save Current Program As:** Text input for new program name
- **Import Program:** File upload for CSV import
- **Delete Program:** Remove saved programs (except default)

#### Data Export/Import  
- **Export Current Program:** Download CSV with all historical data
- **Import Program:** Upload CSV file
  - Imported programs appear in program dropdown
  - Validation for malformed CSV files

#### App Settings
- **Reset Current Program:** Clear all progress, start over
- **About:** App version, developer info

---

## CSV Import/Export System

### Export Functionality
- **Button location:** Settings screen
- **File name:** `[program_name]_workout_data_[date].csv`
- **Content:** Complete historical data including:
  - All prescribed values (sets, reps, weights, times)
  - All user-entered actual values  
  - Completion status for each exercise
  - Program structure and metadata

### Import Functionality
- **File upload:** Standard file picker
- **Validation:** Check for required columns and data format
- **Error handling:** Show user-friendly error messages for invalid files
- **Success:** New program appears in dropdown immediately

### Data Portability
- **Goal:** CSV should completely recreate app state
- **Use case:** User can edit CSV externally to modify programs
- **Backup:** Users can save CSV files as personal backups

---

## Initial User Experience

### First App Load
- **No onboarding screens** - immediate access
- **Default state:** 6-Week Engagement Program loaded
- **Starting position:** Day 1, Week 1
- **Ready to use:** All exercises visible, ready for input

### Progressive Enhancement
- **Offline message:** Brief toast if user loses connectivity
- **Installation prompt:** Subtle suggestion to "Add to Home Screen"

---

## Technical Implementation Notes

### State Management
- **Persistent state:** Which workout sections are expanded/collapsed
- **Program state:** Current day/week position for each saved program
- **Auto-save:** All user inputs saved immediately to local storage

### Performance Considerations
- **Lazy loading:** Only render visible week/calendar data
- **Smooth animations:** Section expand/collapse, swipe transitions
- **Touch optimization:** Generous tap targets, swipe gestures

### Data Validation
- **Input fields:** Accept reasonable numeric ranges
- **CSV import:** Validate structure and provide helpful error messages
- **Backup prompts:** Suggest export before major actions (reset, delete)

### Offline Reliability
- **Service worker:** Cache all app assets for offline use
- **Local storage:** Robust data persistence
- **No network dependency:** App functions completely offline

---

## Development Priorities

### Phase 1 (MVP)
1. Core navigation (3 tabs)
2. Day view with exercise tracking
3. Basic completion tracking
4. Settings with export functionality

### Phase 2 (Enhanced)
1. Program management (save/switch)
2. CSV import functionality  
3. Week/Calendar completion indicators
4. Auto-suggestion system

### Phase 3 (Polish)
1. Smooth animations and transitions
2. PWA installation features
3. Advanced data validation
4. Performance optimizations

---

## Success Metrics
- **User retention:** Daily workout completion rates
- **Data integrity:** Successful CSV export/import operations  
- **Performance:** <3 second load time, smooth 60fps interactions
- **Offline reliability:** 100% functionality without network connection