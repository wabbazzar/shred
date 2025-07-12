# Workout Program JSON Generator Prompt

## Your Task
Transform workout program descriptions (markdown, text, or any format) into structured JSON format compatible with the Shred workout app. You must follow the exact schema and patterns shown below.

## Required JSON Schema

### Top-Level Structure
```json
{
  "id": "program-name-kebab-case",
  "name": "Program Display Name",
  "description": "Brief program description",
  "version": "1.0.0",
  "weeks": 6,
  "daysPerWeek": 7,
  "metadata": {
    "targetAudience": "Target user group",
    "difficulty": "Beginner|Intermediate|Advanced",
    "equipment": ["Equipment", "List"],
    "estimatedDuration": "Duration per session"
  },
  "dayTypes": {
    "1": "gym|home|recovery|rest",
    "2": "gym|home|recovery|rest",
    // ... for each day
  },
  "dayFocus": {
    "1": "Workout focus description",
    "2": "Workout focus description",
    // ... for each day
  },
  "weeklyProgression": {
    // Variable progression schemes based on program
  },
  "progressionRules": {
    "weight": {
      "categoryDefaults": {
        "strength": { "light": 2.5, "heavy": 5.0 },
        "bodyweight": 0,
        "cardio": 0,
        "time": 0,
        "flexibility": 0,
        "mobility": 0
      },
      "exerciseSpecific": {
        "Exercise Name": { "light": 2.5, "heavy": 5.0 }
      },
      "heavyThreshold": 100
    },
    "reps": {
      "bodyweight": 1,
      "emom": 1,
      "amrap": 2,
      "time": 5
    },
    "time": {
      "flexibility": 15,
      "mobility": 10,
      "cardio": 30,
      "time": 10
    }
  },
  "workoutTemplate": {
    "1": {
      "type": "gym|home|recovery|rest",
      "focus": "Workout focus",
      "duration": "Duration estimate",
      "sections": [
        {
          "name": "Section Name",
          "exercises": [
            {
              "name": "Exercise Name",
              "category": "strength|bodyweight|cardio|time|flexibility|mobility|rest|emom|amrap|circuit|lifestyle",
              "sets": 3,
              "reps": "5|8-12|{{variable}}",
              "time": "30 seconds|5 minutes",
              "notes": "Exercise-specific instructions"
            }
          ]
        }
      ]
    }
  }
}
```

## Exercise Categories and Their Usage

### **strength**
- Traditional weight training exercises
- Requires: `sets`, `reps`
- Optional: `notes`
- Examples: Bench Press, Squats, Deadlifts
- Progressive overload through weight increases

### **bodyweight** 
- Exercises using body weight only
- Requires: `sets`, `reps`
- Optional: `notes`
- Examples: Push-ups, Pull-ups, Burpees
- Progressive overload through rep increases

### **cardio**
- Cardiovascular exercises
- Requires: `time` OR `sets` + `reps`
- Optional: `notes`
- Examples: Running, Cycling, Rowing
- Progressive overload through time/distance increases

### **time**
- Timed holds or isometric exercises
- Requires: `time`, optionally `sets`
- Optional: `notes`
- Examples: Plank holds, Wall sits
- Progressive overload through time increases

### **flexibility**
- Stretching and flexibility work
- Requires: `time`
- Optional: `notes`
- Examples: Yoga poses, Static stretches
- Progressive overload through time increases

### **mobility**
- Dynamic movement and mobility work
- Requires: `time` OR `reps`
- Optional: `notes`
- Examples: Warm-up movements, Joint mobility
- Usually no progression needed

### **rest**
- Rest periods or complete rest days
- Requires: `notes` (describing rest activity)
- Optional: `time`
- Examples: Complete rest, Light walking
- No progression

### **emom**
- "Every Minute on the Minute" workouts
- Requires: `time` (total duration), `notes` (exercise details)
- Optional: `sets` (rounds)
- Examples: EMOM 12 minutes: Pull-ups/Push-ups
- Progressive overload through rep increases

### **amrap**
- "As Many Reps/Rounds As Possible" workouts
- Requires: `time` (duration), `notes` (exercise list)
- Optional: `sets` (if multiple AMRAP rounds)
- Examples: AMRAP 8 minutes: Burpees, KB swings
- Progressive overload through round/rep increases

### **circuit**
- Circuit training with multiple exercises
- Requires: `sets` (rounds), `time` (work/rest ratios), `notes` (exercise list)
- Examples: 4 rounds, 45 sec work/15 sec rest
- Progressive overload through time or intensity

### **lifestyle**
- Lifestyle activities and habits
- Requires: `notes` (activity description)
- Optional: `time`
- Examples: Meal prep, Sleep hygiene
- Usually no progression

## Day Types

- **gym**: Requires gym equipment and facilities
- **home**: Can be done at home with minimal equipment
- **recovery**: Active recovery, mobility, yoga
- **rest**: Complete rest or very light activity

## Progression Rules Guidelines

### Weight Progression
- **light**: Progression for lighter weights (< heavyThreshold)
- **heavy**: Progression for heavier weights (>= heavyThreshold)
- **heavyThreshold**: Weight in lbs where progression changes from light to heavy
- **exerciseSpecific**: Override default progression for specific exercises

### Rep Progression
- How many reps to add per week for each category
- **bodyweight**: +1 rep per week
- **emom**: +1 rep per week  
- **amrap**: +2 reps per week
- **time**: +5 seconds per week

### Time Progression
- How much time to add per week for each category
- **flexibility**: +15 seconds per week
- **mobility**: +10 seconds per week
- **cardio**: +30 seconds per week
- **time**: +10 seconds per week

## Variable Substitution in Templates

Use `{{variableName}}` for dynamic values that change based on week or progression:

- `{{strengthReps}}`: Changes based on weeklyProgression
- `{{benchPress}}`: References specific exercise progression
- `{{customVariable}}`: Any custom progression scheme

## Parsing Instructions

### 1. **Identify Program Structure**
- Extract program name, duration, and weekly schedule
- Determine day types (gym/home/recovery/rest)
- Identify weekly progression patterns

### 2. **Parse Daily Workouts**
- Group exercises into logical sections (Warm-up, Main Lifts, Accessory, etc.)
- Identify exercise categories based on movement patterns
- Extract sets, reps, time, and notes for each exercise

### 3. **Determine Progression Rules**
- Analyze how weights, reps, and time should progress
- Set appropriate progression rates for each exercise category
- Identify exercises that need specific progression rules

### 4. **Handle Special Workout Formats**
- **EMOM**: Convert to single exercise with time and detailed notes
- **AMRAP**: Convert to single exercise with time and exercise list in notes
- **Circuits**: Convert to single exercise with rounds, timing, and exercise list in notes
- **Supersets**: Either separate into individual exercises or combine with detailed notes

### 5. **Generate Metadata**
- Determine target audience based on exercise complexity
- Set difficulty level based on exercise selection and volume
- List required equipment
- Estimate session duration

## Example Transformations

### Input Text Example:
```
Week 1: Upper Body
- Bench Press: 4 sets of 5 reps
- Pull-ups: 3 sets of 8-12 reps
- EMOM 10 minutes: Push-ups x 10, Rows x 8
```

### Output JSON Example:
```json
{
  "sections": [
    {
      "name": "Strength Block",
      "exercises": [
        {
          "name": "Bench Press",
          "category": "strength",
          "sets": 4,
          "reps": "5",
          "notes": "Progressive overload weekly"
        },
        {
          "name": "Pull-ups",
          "category": "bodyweight",
          "sets": 3,
          "reps": "8-12",
          "notes": "Aim for upper rep range"
        }
      ]
    },
    {
      "name": "EMOM Block",
      "exercises": [
        {
          "name": "EMOM 10 minutes",
          "category": "emom",
          "time": "10 minutes",
          "notes": "Minute 1: Push-ups x 10, Minute 2: Rows x 8. Alternate each minute."
        }
      ]
    }
  ]
}
```

## Quality Checklist

Before outputting JSON, verify:

- [ ] All required fields are present
- [ ] Exercise categories are correctly assigned
- [ ] Progression rules make sense for the program type
- [ ] Variable substitutions are properly formatted
- [ ] Day types match the workout requirements
- [ ] Notes contain sufficient detail for execution
- [ ] JSON is valid and properly formatted
- [ ] Metadata accurately reflects the program

## Output Format

Provide only the complete, valid JSON structure. Do not include explanations or additional text unless specifically requested. The JSON should be ready to save as a `.json` file and load directly into the Shred workout app.

---

**Remember**: This JSON will be loaded by users into their workout tracking app. Accuracy, completeness, and proper categorization are critical for the app to function correctly with progressive overload, auto-suggestions, and completion tracking. 