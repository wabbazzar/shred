# Game Template - Claude AI Development Context

## Project Overview
This is a master template repository for mobile-first game development. It provides a complete foundation for building cross-platform games that work seamlessly on mobile and desktop with PWA capabilities.

## Current Development Status
- **Current Phase**: Template Initialization - Setting up reusable game development template
- **Last Completed**: Phase -1 initialization with cursor rules and context files
- **Next Steps**: Complete template structure with test infrastructure and example implementations
- **Known Issues**: None - fresh template initialization

## Project Structure
```
game_template/
├── index.html          # Main game file template
├── CLAUDE.md          # This file - AI context
├── .cursorrules       # Cursor IDE rules
├── Makefile           # Build commands
├── manifest.json      # PWA manifest template
├── service-worker.js  # Offline support template
├── assets/
│   ├── sprites/       # Game graphics templates
│   ├── audio/         # Sound effects templates
│   └── fonts/         # Typography templates
├── styles/
│   ├── mobile.css     # Mobile-first styles template
│   └── desktop.css    # Desktop enhancements template
├── scripts/
│   └── game.js        # Main game logic template
├── docs/
│   └── todo-prompt-generator.md  # Master development guide
└── tests/
    ├── mobile_test.html    # Touch testing template
    ├── visual_test.html    # Cross-platform template
    ├── touch_test.html     # Gesture testing template
    ├── render_verify.html  # Rendering verification template
    ├── debug_render.html   # Performance debugging template
    └── test_runner.js      # Automated test template
```

## Key Development Principles
1. **Mobile-First**: Always test on 320px viewport first
2. **Visual Verification**: Test in browser, not console
3. **60 FPS Required**: Performance is non-negotiable
4. **Touch Before Mouse**: Implement touch controls first
5. **Git Commits**: After each successful phase
6. **Template Reusability**: Keep all code generic and customizable

## Testing Procedures
```bash
# Start development server
make serve

# Test mobile experience first
make mobile-test

# Verify visual elements
make visual-test

# Check performance
make debug-render

# Test PWA features
make pwa-test
```

## Success Criteria for Template
- [ ] Complete mobile-first project structure
- [ ] Comprehensive test infrastructure in tests/ directory
- [ ] Working PWA manifest and service worker templates
- [ ] Unified input handling system template
- [ ] Performance monitoring and debugging tools
- [ ] Cross-platform compatibility verified
- [ ] Clear customization points documented

## Common Issues & Solutions
1. **Touch not working**: Check tests/touch_test.html
2. **Performance issues**: Run tests/debug_render.html
3. **Visual glitches**: Use tests/visual_test.html
4. **PWA not installing**: Verify manifest.json and service-worker.js

## Important Code Patterns
```javascript
// Unified input handler template
class UnifiedInput {
  constructor(gameInstance) {
    this.game = gameInstance;
    this.setupTouch();
    this.setupKeyboard();
    this.setupMouse();
  }
  
  handleInput(action, inputType) {
    // Single method for all input types
    switch(action) {
      case 'PRIMARY_ACTION':
        this.game.handlePrimaryAction();
        break;
      // Add more actions as needed
    }
  }
}

// Game state management template
const GameStates = {
  LOADING: 'loading',
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  VICTORY: 'victory'
};

class GameStateManager {
  constructor() {
    this.currentState = GameStates.LOADING;
    this.previousState = null;
  }
  
  changeState(newState) {
    this.previousState = this.currentState;
    this.currentState = newState;
    this.onStateChange(newState, this.previousState);
  }
}
```

## Performance Targets
- Mobile: 60 FPS on iPhone SE (baseline)
- Touch response: <50ms latency
- Load time: <3 seconds on 3G
- Memory: <100MB usage
- Battery: 2+ hours continuous play

## Template Customization Guide
When using this template for a new game:

1. **Update CLAUDE.md**: Replace template info with game-specific details
2. **Customize .cursorrules**: Add game-specific mechanics and visual style
3. **Modify manifest.json**: Update name, description, icons, colors
4. **Update index.html**: Replace placeholder content with game UI
5. **Customize styles**: Adapt mobile.css and desktop.css for game theme
6. **Implement game logic**: Replace template game.js with actual game mechanics
7. **Add assets**: Replace placeholder sprites, audio, fonts with game assets
8. **Update tests**: Customize test files for game-specific features

## Notes for Claude
- This is a template repository - maintain generic, reusable structure
- Always test template features work across different game types
- Keep customization points clearly documented
- Update this file when template structure changes
- Ensure all test files work with placeholder content
- Maintain mobile-first architecture throughout
- Template should work immediately after customization

## Template Development Status
- **Phase -1**: ✅ Cursor rules, CLAUDE.md, Makefile created
- **Phase 0**: 🔄 Setting up test infrastructure and project structure
- **Phase 1**: ⏳ Creating template game logic and unified input system
- **Phase 2**: ⏳ Building PWA features and service worker
- **Phase 3**: ⏳ Adding visual effects and polish templates
- **Phase 4**: ⏳ Final testing and documentation

## Template Validation Checklist
- [ ] Works with arcade/action games (Tetris, Snake, Platformers)
- [ ] Works with puzzle/strategy games (Card games, Match-3)
- [ ] Works with educational/quiz games (Flashcards, Trivia)
- [ ] Mobile touch controls function properly
- [ ] Desktop keyboard/mouse enhancements work
- [ ] PWA installation and offline play functional
- [ ] Performance targets met on target devices
- [ ] Visual effects and animations smooth
- [ ] Cross-platform compatibility verified 