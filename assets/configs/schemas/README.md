# Workout Program Data Types and Schemas

This directory contains JSON schemas that define the structure for creating modular, LLM-friendly workout programs. Each data type serves a specific purpose and can be combined to create comprehensive workout systems.

## Data Type Overview

### 1. Program Metadata (`program-metadata.schema.json`)
Defines the core program information, duration, difficulty, and requirements.

### 2. Phase Definitions (`phase-definitions.schema.json`) 
Defines training phases with progression rules and rep schemes.

### 3. Day Templates (`day-templates.schema.json`)
Defines types of workout days with default parameters.

### 4. Exercise Library (`exercise-library.schema.json`)
Defines exercise database with categories, equipment, and variations.

### 5. Section Definitions (`section-definitions.schema.json`)
Defines workout blocks/sections like warmup, strength, EMOM, etc.

### 6. Equipment Lists (`equipment-lists.schema.json`)
Defines required and optional equipment with alternatives.

### 7. Progression Rules (`progression-rules.schema.json`)
Defines how to advance week-to-week with auto-scaling.

### 8. Workout Sessions (`workout-sessions.schema.json`)
Defines individual workout sessions that combine the above elements.

## Usage for LLMs

When generating new workout programs, use these schemas to ensure proper structure:

1. Start with program metadata to define the scope
2. Define phases for progression structure  
3. Create day templates for workout types
4. Define exercises in the exercise library
5. Create section definitions for workout blocks
6. Specify equipment requirements
7. Define progression rules
8. Assemble workout sessions using references to the above

Each data type is self-contained but can reference others for maximum modularity and reusability.