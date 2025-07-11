# LLM Workout Program Generator Guide

This guide explains how to use the modular workout data system to generate custom workout programs using Large Language Models (LLMs).

## System Overview

The workout system uses 6 modular data types that work together to create comprehensive workout programs:

1. **Program Metadata** - Core program information
2. **Phase Definitions** - Training phases with progression
3. **Day Templates** - Types of workout days
4. **Exercise Library** - Database of exercises
5. **Section Definitions** - Workout blocks (warmup, strength, etc.)
6. **Workout Sessions** - Specific workouts combining all elements

## Quick Start for LLMs

### Step 1: Define Program Metadata
Start with the program's basic information:

```json
{
  "id": "your-program-id",
  "name": "Your Program Name",
  "description": "Program description and goals",
  "version": "1.0.0",
  "duration": {
    "weeks": 8,
    "daysPerWeek": 5,
    "estimatedDuration": "45-60 minutes"
  },
  "difficulty": "intermediate",
  "targetAudience": ["muscle-gain", "strength"],
  "equipment": {
    "required": ["dumbbells", "barbell"],
    "optional": ["pull-up-bar"],
    "alternatives": {
      "barbell": ["dumbbells", "resistance-bands"]
    }
  }
}
```

### Step 2: Create Training Phases
Define how the program progresses over time:

```json
{
  "phases": [
    {
      "id": "base-phase",
      "name": "Base Building Phase",
      "weeks": {"start": 1, "end": 4},
      "focus": "strength",
      "progression": {
        "strengthReps": {"sets": 3, "reps": 8},
        "intensityPercent": {"week1": 70, "week2": 75, "progression": "linear"}
      }
    }
  ]
}
```

### Step 3: Define Day Templates  
Create templates for different workout types:

```json
{
  "templates": [
    {
      "id": "full-body-strength",
      "name": "Full Body Strength",
      "type": "strength",
      "location": "gym",
      "duration": {"min": 45, "max": 75, "typical": 60},
      "structure": {
        "warmup": {"duration": "10 minutes"},
        "main": {"sections": ["strength-block", "volume-block"]},
        "cooldown": {"duration": "10 minutes"}
      }
    }
  ]
}
```

### Step 4: Build Exercise Library
Define all exercises with detailed parameters:

```json
{
  "exercises": [
    {
      "id": "squat",
      "name": "Squat",
      "category": "strength",
      "muscleGroups": {
        "primary": ["quadriceps", "glutes"],
        "secondary": ["hamstrings"]
      },
      "equipment": {"required": ["barbell"]},
      "parameters": {
        "trackingType": "weight-reps",
        "defaultSets": 3,
        "repRanges": {"strength": "1-6", "hypertrophy": "6-12"}
      }
    }
  ]
}
```

### Step 5: Create Section Definitions
Define workout blocks and their structure:

```json
{
  "sections": [
    {
      "id": "strength-block",
      "name": "Strength Block",
      "type": "strength",
      "structure": {
        "setRep": {"sets": 3, "reps": "5", "rest": "3 minutes"}
      },
      "exerciseConstraints": {
        "exerciseTypes": ["strength", "compound"],
        "minExercises": 2, "maxExercises": 4
      }
    }
  ]
}
```

### Step 6: Assemble Workout Sessions
Combine everything into specific workouts:

```json
{
  "sessions": {
    "1": {
      "1": {
        "template": "full-body-strength",
        "phase": "base-phase",
        "sections": [
          {
            "sectionId": "strength-block",
            "exercises": [
              {
                "exerciseId": "squat",
                "parameters": {"sets": 3, "reps": 5},
                "notes": "Focus on form and depth"
              }
            ]
          }
        ]
      }
    }
  }
}
```

## LLM Generation Strategies

### 1. Goal-Based Generation
When a user provides a goal, generate appropriate configurations:

**User Goal:** "I want to build muscle in 12 weeks with home equipment"

**LLM Response:**
- Set `targetAudience: ["muscle-gain"]`
- Set `duration.weeks: 12`
- Set `equipment.required: ["dumbbells"]`
- Create hypertrophy-focused phases with 8-12 rep ranges
- Include volume-building sections

### 2. Progressive Programming
Use phases to create logical progression:

```json
{
  "phases": [
    {"weeks": {"start": 1, "end": 4}, "focus": "hypertrophy", "reps": "8-12"},
    {"weeks": {"start": 5, "end": 8}, "focus": "strength", "reps": "4-6"},
    {"weeks": {"start": 9, "end": 12}, "focus": "power", "reps": "1-3"}
  ]
}
```

### 3. Equipment-Based Adaptation
Modify programs based on available equipment:

```javascript
// If only bodyweight available:
"equipment": {"required": []},
"exerciseConstraints": {"exerciseTypes": ["bodyweight", "isometric"]}

// If full gym available:
"equipment": {"required": ["barbell", "dumbbells", "machines"]},
"exerciseConstraints": {"exerciseTypes": ["strength", "compound", "isolation"]}
```

### 4. Difficulty Scaling
Adjust complexity based on user experience:

```json
{
  "beginner": {
    "exercises": {"minExercises": 2, "maxExercises": 4},
    "sections": ["strength-block"],
    "complexity": "simple"
  },
  "advanced": {
    "exercises": {"minExercises": 4, "maxExercises": 8},
    "sections": ["strength-block", "power-block", "conditioning"],
    "complexity": "complex"
  }
}
```

## Common Program Templates

### 1. Beginner Full Body (3 days/week)
```json
{
  "difficulty": "beginner",
  "duration": {"weeks": 8, "daysPerWeek": 3},
  "dayTemplates": ["full-body-basic"],
  "sections": ["warmup", "strength-block", "cooldown"],
  "repRanges": "8-12"
}
```

### 2. Intermediate Push/Pull/Legs (6 days/week)
```json
{
  "difficulty": "intermediate", 
  "duration": {"weeks": 12, "daysPerWeek": 6},
  "dayTemplates": ["push-day", "pull-day", "leg-day"],
  "sections": ["strength-block", "volume-block", "isolation-block"]
}
```

### 3. Advanced Powerlifting (4 days/week)
```json
{
  "difficulty": "advanced",
  "focus": "strength",
  "dayTemplates": ["squat-focus", "bench-focus", "deadlift-focus", "accessory"],
  "sections": ["power-block", "strength-block", "technique-block"]
}
```

## Validation Rules

When generating programs, ensure:

1. **Equipment Consistency**: All exercises use available equipment
2. **Progressive Overload**: Each phase builds on the previous
3. **Recovery Balance**: Avoid overloading same muscle groups
4. **Time Constraints**: Sessions fit within specified durations
5. **Skill Progression**: Exercises match user ability level

## Error Handling

Common issues and solutions:

```json
{
  "missingExerciseId": "Reference exercise that doesn't exist in library",
  "solution": "Check exercise-library.json for valid IDs",
  
  "invalidProgression": "Phase progression doesn't make sense",
  "solution": "Ensure logical rep/intensity progression across phases",
  
  "equipmentMismatch": "Exercise requires equipment not in program",
  "solution": "Filter exercises by available equipment"
}
```

## Integration Examples

### Loading Generated Program
```javascript
// Save your generated files to assets/configs/programs/
const dataManager = new ModularDataManager();
dataManager.configPaths.programMetadata = 'path/to/your/program-metadata.json';
dataManager.configPaths.workoutSessions = 'path/to/your/workout-sessions.json';
await dataManager.init();
```

### Exporting for User
```javascript
const schema = await dataManager.exportConfigurationSchema();
// Returns complete schema and current config for LLM analysis
```

## Best Practices for LLMs

1. **Start Simple**: Begin with basic program structure, add complexity gradually
2. **Validate Logic**: Check that progressions make physiological sense
3. **Consider Recovery**: Include appropriate rest days and deload weeks
4. **Equipment Substitutions**: Always provide alternatives for missing equipment
5. **User Feedback**: Design programs that can be easily modified based on results

## Schema Validation

All generated JSON should validate against the schemas in `assets/configs/schemas/`. Use these to ensure your generated programs are correctly formatted and will load properly in the application.

## Example Complete Program Generation

See the complete example in `assets/configs/programs/six-week-shred-sessions.json` for a fully implemented program using all data types.

This modular system allows infinite customization while maintaining structure and consistency. LLMs can focus on the training logic while the system handles the technical implementation.