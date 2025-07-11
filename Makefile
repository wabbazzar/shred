.PHONY: serve test app-test mobile-test touch-test offline-test csv-test visual-test device-test pwa-test clean-cache git-init git-phase git-checkpoint force-serve validate-pwa help

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

# Main app testing
app-test:
	@open http://localhost:8000/index.html || xdg-open http://localhost:8000/index.html

# Mobile-specific testing
mobile-test:
	@open http://localhost:8000/tests/mobile_test.html || xdg-open http://localhost:8000/tests/mobile_test.html

# Touch control testing
touch-test:
	@open http://localhost:8000/tests/touch_test.html || xdg-open http://localhost:8000/tests/touch_test.html

# Offline functionality testing
offline-test:
	@open http://localhost:8000/tests/offline_test.html || xdg-open http://localhost:8000/tests/offline_test.html

# CSV export/import testing
csv-test:
	@open http://localhost:8000/tests/csv_test.html || xdg-open http://localhost:8000/tests/csv_test.html

# Visual verification
visual-test:
	@open http://localhost:8000/tests/visual_test.html || xdg-open http://localhost:8000/tests/visual_test.html

# Device testing information
device-test:
	@echo "Connect mobile device and navigate to:"
	@echo "http://$(shell ifconfig | grep 'inet ' | grep -v 127.0.0.1 | head -1 | awk '{print $$2}'):8000/"
	@echo ""
	@echo "App features:"
	@echo "  • 3-tab navigation (Day/Week/Calendar)"
	@echo "  • Touch gestures + swipe navigation"
	@echo "  • PWA installation support"
	@echo "  • 100% offline functionality"
	@echo "  • CSV export/import capability"
	@echo "  • Dark theme with completion tracking"

# PWA testing
pwa-test:
	@echo "Testing PWA features..."
	@echo "1. Check manifest.json validity"
	@echo "2. Verify service worker registration"
	@echo "3. Test offline functionality"
	@echo "4. Verify home screen installation"
	@open http://localhost:8000/index.html

# Validate PWA requirements
validate-pwa:
	@echo "Validating PWA requirements..."
	@test -f manifest.json || echo "❌ manifest.json missing"
	@test -f service-worker.js || echo "❌ service-worker.js missing"
	@test -f assets/icons/icon-192.png || echo "❌ 192px icon missing"
	@test -f assets/icons/icon-512.png || echo "❌ 512px icon missing"
	@echo "✅ PWA files check complete"

# Cache management
clean-cache:
	@echo "Desktop: Ctrl+Shift+R (Win/Linux) or Cmd+Shift+R (Mac)"
	@echo "Mobile Safari: Settings > Safari > Clear History and Website Data"
	@echo "Chrome Mobile: Menu > History > Clear browsing data"
	@echo "PWA: May need to uninstall and reinstall after major changes"

# Git workflow helpers
git-init:
	@git init
	@echo "tests/test_results/" >> .gitignore
	@echo "tests/screenshots/" >> .gitignore
	@echo "*.log" >> .gitignore
	@echo ".DS_Store" >> .gitignore
	@echo "node_modules/" >> .gitignore
	@echo "dist/" >> .gitignore
	@echo ".cache/" >> .gitignore
	@echo "*.csv" >> .gitignore
	@echo "# 6-Week Engagement Workout Tracker" > README.md
	@echo "A Progressive Web App for tracking your 6-week engagement photo prep workout program." >> README.md
	@echo "" >> README.md
	@echo "## Features" >> README.md
	@echo "- 3-tab navigation (Day/Week/Calendar views)" >> README.md
	@echo "- Touch-optimized interface with swipe gestures" >> README.md
	@echo "- 100% offline functionality" >> README.md
	@echo "- CSV export/import for data backup" >> README.md
	@echo "- Dark theme with visual completion tracking" >> README.md
	@echo "- PWA installable on mobile devices" >> README.md
	@echo "" >> README.md
	@echo "## Quick Start" >> README.md
	@echo "\`\`\`bash" >> README.md
	@echo "# Start development server" >> README.md
	@echo "make serve" >> README.md
	@echo "" >> README.md
	@echo "# Open app in browser" >> README.md
	@echo "make app-test" >> README.md
	@echo "\`\`\`" >> README.md
	@echo "" >> README.md
	@echo "See CLAUDE.md for development context" >> README.md
	@git add -A
	@git commit -m "Initial commit: PWA workout tracker setup"

git-phase:
	@git add -A
	@git status
	@echo "Ready to commit phase completion. Use: git commit -m 'Phase X: Description'"

git-checkpoint:
	@git add -A
	@git commit -m "Checkpoint: Working app state before next feature"

# Development workflow
start: serve
	@sleep 2
	@make app-test

# Quick access commands
day-view: serve
	@sleep 2
	@open http://localhost:8000/index.html#day

week-view: serve
	@sleep 2
	@open http://localhost:8000/index.html#week

calendar-view: serve
	@sleep 2
	@open http://localhost:8000/index.html#calendar

# Testing workflows
test-all: serve
	@sleep 2
	@echo "Running all tests..."
	@make mobile-test
	@make touch-test
	@make offline-test
	@make csv-test
	@make visual-test

# Build tasks (for future use)
build:
	@echo "Build process not yet implemented"
	@echo "App runs directly from source files"

# Help command
help:
	@echo "6-Week Engagement Workout Tracker - Available Commands:"
	@echo ""
	@echo "Development:"
	@echo "  make serve       - Start development server"
	@echo "  make app-test    - Open app in browser"
	@echo "  make device-test - Show device testing info"
	@echo ""
	@echo "Testing:"
	@echo "  make mobile-test  - Test mobile interactions"
	@echo "  make touch-test   - Test touch gestures"
	@echo "  make offline-test - Test offline functionality"
	@echo "  make csv-test     - Test CSV import/export"
	@echo "  make visual-test  - Visual verification"
	@echo "  make pwa-test     - Test PWA features"
	@echo "  make test-all     - Run all tests"
	@echo ""
	@echo "Git:"
	@echo "  make git-init      - Initialize repository"
	@echo "  make git-phase     - Prepare phase commit"
	@echo "  make git-checkpoint - Quick checkpoint commit"
	@echo ""
	@echo "Views:"
	@echo "  make day-view     - Open Day view"
	@echo "  make week-view    - Open Week view"
	@echo "  make calendar-view - Open Calendar view"