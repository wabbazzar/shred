# Modular Workout Configuration System

## Overview

This directory contains a comprehensive, modular workout configuration system that allows for flexible, data-driven workout program creation. The system is designed to be LLM-friendly, enabling AI systems to generate custom workout programs by providing structured JSON configurations.

## 🎯 Key Benefits

- **Modular Design**: Each data type is independent but composable
- **LLM-Friendly**: Clear schemas and examples for AI generation
- **Flexible**: Can create any type of workout program
- **Extensible**: Easy to add new exercises, sections, or program types
- **Validated**: JSON schemas ensure data integrity
- **Maintainable**: Separation of concerns makes updates simple

## 📁 Directory Structure

```
assets/configs/
├── schemas/                    # JSON schemas for validation
│   ├── program-metadata.schema.json
│   ├── phase-definitions.schema.json
│   ├── day-templates.schema.json
│   ├── exercise-library.schema.json
│   ├── section-definitions.schema.json
│   └── workout-sessions.schema.json
├── examples/                   # Example configurations
│   ├── program-metadata.json
│   ├── phase-definitions.json
│   ├── day-templates.json
│   ├── exercise-library.json
│   └── section-definitions.json
├── programs/                   # Complete workout programs
│   └── six-week-shred-sessions.json
└── LLM_WORKOUT_GENERATOR_GUIDE.md
```

## 🔧 Data Types

### 1. Program Metadata
Defines the core program information, duration, equipment requirements, and settings.

**Key Fields:**
- `id`, `name`, `description`, `version`
- `duration` (weeks, days per week)
- `difficulty` (beginner/intermediate/advanced/expert)
- `targetAudience` (goals like muscle-gain, weight-loss)
- `equipment` (required, optional, alternatives)
- `settings` (auto-progression, tracking fields)

### 2. Phase Definitions
Defines training phases with progression rules and periodization.

**Key Fields:**
- `phases[]` with week ranges and focus areas
- `progression` rules (rep schemes, intensity percentages)
- `characteristics` (rest periods, tempo, RPE)
- `adaptations` (automatic progressions)

### 3. Day Templates
Templates for different types of workout days.

**Key Fields:**
- `type` (strength/cardio/hiit/circuit/yoga/mobility/rest)
- `location` (gym/home/outdoor/anywhere)
- `duration` (min/max/typical)
- `structure` (warmup/main/cooldown sections)
- `intensity` (RPE, heart rate zones)
- `recovery` requirements

### 4. Exercise Library
Comprehensive database of exercises with detailed parameters.

**Key Fields:**
- `name`, `aliases`, `category`, `subcategory`
- `muscleGroups` (primary/secondary/stabilizers)
- `equipment` (required/optional/alternatives)
- `execution` (setup, movement, breathing, cues)
- `parameters` (tracking type, rep ranges, rest periods)
- `variations` and `progressions`

### 5. Section Definitions
Defines workout blocks like warmup, strength, EMOM, AMRAP, etc.

**Key Fields:**
- `type` (warmup/strength/power/emom/amrap/circuit/etc.)
- `structure` (traditional/timed/rounds format)
- `intensity` (RPE, percentage, heart rate)
- `exerciseConstraints` (types, muscle groups, equipment)
- `flowRules` (preferred position, dependencies)

### 6. Workout Sessions
Specific workout sessions that combine all the above elements.

**Key Fields:**
- `sessions[week][day]` structure
- `template` reference to day template
- `phase` reference to training phase
- `sections[]` with specific exercises
- `overrides` for template modifications
- `substitutions` for exercise alternatives

## 🚀 Usage

### For Developers

1. **Load the system:**
```javascript
const dataManager = new ModularDataManager();
await dataManager.init();
```

2. **Access loaded data:**
```javascript
const exercises = dataManager.exerciseLibrary.exercises;
const dayTemplates = dataManager.dayTemplates.templates;
const workoutProgram = dataManager.workoutData;
```

3. **Export configuration schema:**
```javascript
const schema = await dataManager.exportConfigurationSchema();
console.log(schema); // Complete guide for LLM usage
```

### For LLMs

1. **Read the guide:** `LLM_WORKOUT_GENERATOR_GUIDE.md`
2. **Study the schemas:** Files in `schemas/` directory
3. **Examine examples:** Files in `examples/` directory
4. **Generate programs:** Create JSON files following the schemas
5. **Validate:** Use schemas to ensure correct format

## 🔄 Creating Custom Programs

### Method 1: From Templates (Recommended for beginners)
1. Copy existing files from `examples/`
2. Modify values to match your program goals
3. Create sessions file referencing your configurations
4. Update config paths in application

### Method 2: From Scratch (For advanced users)
1. Start with program metadata
2. Define training phases
3. Create day templates
4. Build exercise library
5. Define workout sections
6. Assemble specific sessions

### Method 3: LLM Generation (For AI systems)
1. Read the LLM guide thoroughly
2. Use schemas for validation
3. Generate all required data types
4. Ensure proper references between files
5. Test with application

## 📊 Example Program Flow

```
1. Program Metadata: "8-Week Strength Program"
   ↓
2. Phase Definitions: "Base (1-4) → Peak (5-8)"
   ↓
3. Day Templates: "Upper/Lower Split"
   ↓
4. Exercise Library: "Squats, Deadlifts, etc."
   ↓
5. Section Definitions: "Strength Block, Volume Block"
   ↓
6. Workout Sessions: "Week 1 Day 1: Upper Body"
```

## ✅ Validation

All configurations should validate against their schemas:

```bash
# Use JSON schema validators or online tools
# Check against schemas in schemas/ directory
```

Required validations:
- **Equipment consistency**: All exercises use available equipment
- **Reference integrity**: All IDs exist in referenced files
- **Progressive logic**: Phases and progressions make sense
- **Time constraints**: Sessions fit within specified durations

## 🔧 Integration

The system integrates with the existing workout app through:

1. **ModularDataManager**: Loads and manages all configurations
2. **Fallback support**: Falls back to legacy system if configs fail
3. **Compatible interface**: Same methods as original DataManager
4. **Real-time validation**: Checks configuration integrity on load

## 🎨 Customization Examples

### Creating a Powerlifting Program
```json
{
  "targetAudience": ["strength"],
  "phases": [
    {"focus": "hypertrophy", "weeks": {"start": 1, "end": 4}},
    {"focus": "strength", "weeks": {"start": 5, "end": 8}},
    {"focus": "power", "weeks": {"start": 9, "end": 12}}
  ],
  "dayTemplates": ["squat-focus", "bench-focus", "deadlift-focus"],
  "equipment": {"required": ["barbell", "squat-rack", "bench"]}
}
```

### Creating a Home Bodyweight Program
```json
{
  "equipment": {"required": []},
  "location": "home",
  "exerciseConstraints": {"exerciseTypes": ["bodyweight", "isometric"]},
  "dayTemplates": ["full-body-bodyweight"],
  "duration": {"estimatedDuration": "30-45 minutes"}
}
```

### Creating a Rehabilitation Program
```json
{
  "difficulty": "beginner",
  "targetAudience": ["rehabilitation"],
  "intensity": {"rpe": {"target": 3, "range": {"min": 2, "max": 5}}},
  "focus": "mobility",
  "equipment": {"required": ["resistance-bands", "mat"]}
}
```

## 🆘 Troubleshooting

### Common Issues:

1. **Missing Exercise ID**: Check exercise-library.json for valid IDs
2. **Invalid Progression**: Ensure logical rep/intensity progression
3. **Equipment Mismatch**: Filter exercises by available equipment
4. **Reference Errors**: Verify all referenced IDs exist in source files
5. **Schema Validation**: Use schemas to check JSON format

### Debug Steps:

1. Check browser console for error messages
2. Validate JSON files against schemas
3. Verify all file paths are correct
4. Test with example configurations first
5. Use fallback to legacy system if needed

## 📈 Future Enhancements

- **Exercise video integration**: Add video references to exercises
- **Nutrition integration**: Link meal plans to workout phases
- **Biometric tracking**: Include heart rate and other metrics
- **Social features**: Share and rate custom programs
- **AI coaching**: Automatic program adjustments based on performance

## 🤝 Contributing

To contribute new exercise definitions, program templates, or improvements:

1. Follow existing schema patterns
2. Add comprehensive exercise documentation
3. Include proper validation
4. Test with real workout sessions
5. Submit with example usage

This modular system enables infinite workout program customization while maintaining structure and consistency. Whether you're a developer, trainer, or AI system, you can create comprehensive workout programs tailored to any goal or constraint.