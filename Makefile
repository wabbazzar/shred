.PHONY: serve test visual-test mobile-test touch-test device-test verify-render clean-cache debug-render auto-test game-test pwa-test git-init git-phase git-checkpoint force-serve template-init

# Core development server (mobile-ready)
serve:
	@python3 -m http.server 8000 --bind 0.0.0.0 || python -m SimpleHTTPServer 8000

# Kill existing servers and run
force-serve:
	@echo "Stopping any existing servers..."
	@pkill -f "python.*http.server" || true
	@sleep 1
	@echo "Starting server on http://localhost:8000"
	@python3 -m http.server 8000

# Cross-platform game testing
game-test:
	@open http://localhost:8000/index.html || xdg-open http://localhost:8000/index.html

# Mobile-specific testing
mobile-test:
	@open http://localhost:8000/tests/mobile_test.html || xdg-open http://localhost:8000/tests/mobile_test.html

# Touch control testing
touch-test:
	@open http://localhost:8000/tests/touch_test.html || xdg-open http://localhost:8000/tests/touch_test.html

# Visual verification
visual-test:
	@open http://localhost:8000/tests/visual_test.html || xdg-open http://localhost:8000/tests/visual_test.html

# Device testing information
device-test:
	@echo "Connect mobile device and navigate to:"
	@echo "http://$(shell ifconfig | grep 'inet ' | grep -v 127.0.0.1 | head -1 | awk '{print $$2}'):8000/"
	@echo ""
	@echo "Game features:"
	@echo "  • Touch controls + gesture recognition"
	@echo "  • PWA installation support"
	@echo "  • Offline gameplay capability"
	@echo "  • 60 FPS performance target"

# Render verification
verify-render:
	@open http://localhost:8000/tests/render_verify.html || xdg-open http://localhost:8000/tests/render_verify.html

# Cache management
clean-cache:
	@echo "Desktop: Ctrl+Shift+R (Win/Linux) or Cmd+Shift+R (Mac)"
	@echo "Mobile Safari: Settings > Safari > Clear History and Website Data"
	@echo "Chrome Mobile: Menu > History > Clear browsing data"

# Debug render pipeline
debug-render:
	@open http://localhost:8000/tests/debug_render.html || xdg-open http://localhost:8000/tests/debug_render.html

# Automated test suite
auto-test:
	@node tests/test_runner.js || python tests/test_runner.py

# PWA testing
pwa-test:
	@open http://localhost:8000/tests/pwa_test.html || xdg-open http://localhost:8000/tests/pwa_test.html

# Git workflow helpers
git-init:
	@git init
	@echo "tests/test_results/" >> .gitignore
	@echo "tests/screenshots/" >> .gitignore
	@echo "*.log" >> .gitignore
	@echo ".DS_Store" >> .gitignore
	@echo "node_modules/" >> .gitignore
	@echo "# Game Template Repository" > README.md
	@echo "" >> README.md
	@echo "A comprehensive template for building mobile-first games with PWA capabilities." >> README.md
	@echo "" >> README.md
	@echo "## Quick Start" >> README.md
	@echo "\`\`\`bash" >> README.md
	@echo "# Start development server" >> README.md
	@echo "make serve" >> README.md
	@echo "" >> README.md
	@echo "# Test mobile experience" >> README.md
	@echo "make mobile-test" >> README.md
	@echo "\`\`\`" >> README.md
	@echo "" >> README.md
	@echo "See CLAUDE.md for complete development context and docs/todo-prompt-generator.md for usage instructions." >> README.md
	@git add -A
	@git commit -m "Initial commit: Game template with mobile-first architecture"

git-phase:
	@git add -A
	@git status
	@echo "Ready to commit phase completion. Use: git commit -m 'Phase X: Description'"

git-checkpoint:
	@git add -A
	@git commit -m "Checkpoint: Working template state before next feature"

# Template initialization helper
template-init:
	@echo "Initializing game template structure..."
	@mkdir -p assets/sprites assets/audio assets/fonts
	@mkdir -p styles scripts tests
	@echo "Template structure created. Run 'make git-init' to initialize git repository."

# Development workflow
start: serve
	@sleep 2
	@make game-test

# Template validation
validate-template:
	@echo "Validating template structure..."
	@test -f index.html && echo "✅ index.html exists" || echo "❌ index.html missing"
	@test -f manifest.json && echo "✅ manifest.json exists" || echo "❌ manifest.json missing"
	@test -f service-worker.js && echo "✅ service-worker.js exists" || echo "❌ service-worker.js missing"
	@test -d assets && echo "✅ assets directory exists" || echo "❌ assets directory missing"
	@test -d styles && echo "✅ styles directory exists" || echo "❌ styles directory missing"
	@test -d scripts && echo "✅ scripts directory exists" || echo "❌ scripts directory missing"
	@test -d tests && echo "✅ tests directory exists" || echo "❌ tests directory missing"
	@echo "Template validation complete." 