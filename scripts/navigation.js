// Shred - Navigation System
// Enhanced navigation with touch gestures and smooth transitions

class NavigationManager {
    constructor(app) {
        this.app = app;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeThreshold = 50;
        this.isTransitioning = false;
        
        this.init();
    }

    init() {
        this.setupTabNavigation();
        this.setupSwipeGestures();
        this.setupKeyboardNavigation();
        this.setupBackButton();
        
        console.log('🧭 Navigation Manager initialized');
    }

    // Tab Navigation System
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            // Click/Touch events with better handling
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (this.isTransitioning) return;
                
                const view = button.dataset.view;
                if (view) {
                    this.navigateToView(view);
                }
            });

            // Add ripple effect for better feedback
            button.addEventListener('touchstart', (e) => {
                this.addRippleEffect(button, e);
            });

            // Keyboard support
            button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const view = button.dataset.view;
                    this.navigateToView(view);
                }
            });
        });

        console.log('📱 Tab navigation setup complete');
    }

    // Touch Gesture Navigation
    setupSwipeGestures() {
        const appContent = document.querySelector('.app-content');
        if (!appContent) return;

        // Touch events for swipe navigation
        appContent.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });

        appContent.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: true });

        appContent.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });

        // Mouse events for desktop testing
        appContent.addEventListener('mousedown', (e) => {
            this.handleMouseStart(e);
        });

        appContent.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        appContent.addEventListener('mouseup', (e) => {
            this.handleMouseEnd(e);
        });

        console.log('👆 Touch gestures setup complete');
    }

    // Keyboard Navigation
    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Arrow key navigation between tabs
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'ArrowLeft':
                        e.preventDefault();
                        this.navigateToPreviousTab();
                        break;
                    case 'ArrowRight':
                        e.preventDefault();
                        this.navigateToNextTab();
                        break;
                }
            }

            // Number key navigation (1-4 for tabs/settings) - but not when typing in inputs
            if (e.key >= '1' && e.key <= '4' && !e.ctrlKey && !e.metaKey) {
                // Check if user is typing in an input field
                const activeElement = document.activeElement;
                const isInputFocused = activeElement && (
                    activeElement.tagName === 'INPUT' || 
                    activeElement.tagName === 'TEXTAREA' || 
                    activeElement.tagName === 'SELECT' ||
                    activeElement.contentEditable === 'true'
                );
                
                // Only navigate if NOT typing in an input
                if (!isInputFocused) {
                    const views = ['day', 'week', 'calendar', 'settings'];
                    const viewIndex = parseInt(e.key) - 1;
                    if (views[viewIndex]) {
                        e.preventDefault();
                        if (views[viewIndex] === 'settings') {
                            // Open settings modal
                            this.app.showSettings();
                        } else {
                            this.navigateToView(views[viewIndex]);
                        }
                    }
                }
            }

            // Escape key to close modals
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });

        console.log('⌨️ Keyboard navigation setup complete');
    }

    // Browser Back Button Support
    setupBackButton() {
        // Push initial state
        if (window.history.state === null) {
            window.history.pushState({ view: this.app.currentView }, '', `#${this.app.currentView}`);
        }

        // Handle back button
        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.view) {
                this.navigateToView(e.state.view, false); // Don't push to history again
            }
        });

        console.log('🔙 Back button support setup complete');
    }

    // Core Navigation Methods
    navigateToView(viewName, pushHistory = true) {
        if (this.isTransitioning || viewName === this.app.currentView) return;

        this.isTransitioning = true;

        // Update URL and history
        if (pushHistory) {
            window.history.pushState({ view: viewName }, '', `#${viewName}`);
        }

        // Perform view transition
        this.performViewTransition(this.app.currentView, viewName);

        // Update app state
        this.app.showView(viewName);

        // Reset transition flag
        setTimeout(() => {
            this.isTransitioning = false;
        }, 300);

        console.log(`🚀 Navigated to ${viewName}`);
    }

    performViewTransition(fromView, toView) {
        const fromElement = document.getElementById(`${fromView}-view`);
        const toElement = document.getElementById(`${toView}-view`);

        if (!fromElement || !toElement) return;

        // Add transition classes
        fromElement.classList.add('view-exit');
        toElement.classList.add('view-enter');

        // Clean up after transition
        setTimeout(() => {
            fromElement.classList.remove('view-exit');
            toElement.classList.remove('view-enter');
        }, 300);
    }

    // Tab Navigation Helpers
    navigateToPreviousTab() {
        const views = ['day', 'week', 'calendar'];
        const currentIndex = views.indexOf(this.app.currentView);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : views.length - 1;
        this.navigateToView(views[prevIndex]);
    }

    navigateToNextTab() {
        const views = ['day', 'week', 'calendar'];
        const currentIndex = views.indexOf(this.app.currentView);
        const nextIndex = currentIndex < views.length - 1 ? currentIndex + 1 : 0;
        this.navigateToView(views[nextIndex]);
    }

    // Touch Gesture Handlers
    handleTouchStart(e) {
        if (e.touches.length !== 1) return;
        
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.swipeStartTime = Date.now();
    }

    handleTouchMove(e) {
        // Passive listener - no preventDefault needed
    }

    handleTouchEnd(e) {
        if (e.changedTouches.length !== 1) return;
        
        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;
        const swipeTime = Date.now() - this.swipeStartTime;
        
        this.processSwipe(this.touchStartX, this.touchStartY, touchEndX, touchEndY, swipeTime);
    }

    // Mouse Handlers for Desktop Testing
    handleMouseStart(e) {
        this.touchStartX = e.clientX;
        this.touchStartY = e.clientY;
        this.swipeStartTime = Date.now();
        this.isMouseDown = true;
    }

    handleMouseMove(e) {
        // Only process if mouse is down
        if (!this.isMouseDown) return;
    }

    handleMouseEnd(e) {
        if (!this.isMouseDown) return;
        
        const swipeTime = Date.now() - this.swipeStartTime;
        this.processSwipe(this.touchStartX, this.touchStartY, e.clientX, e.clientY, swipeTime);
        this.isMouseDown = false;
    }

    // Swipe Processing
    processSwipe(startX, startY, endX, endY, swipeTime) {
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const absDeltaX = Math.abs(deltaX);
        const absDeltaY = Math.abs(deltaY);

        // Check if this is a horizontal swipe
        if (absDeltaX > absDeltaY && 
            absDeltaX > this.swipeThreshold && 
            swipeTime < 500) { // Must be within 500ms for responsive feel
            
            if (deltaX > 0) {
                // Swipe right - go to previous view/day
                this.handleSwipeRight();
            } else {
                // Swipe left - go to next view/day
                this.handleSwipeLeft();
            }
        }
    }

    handleSwipeRight() {
        if (this.app.currentView === 'day') {
            // Navigate to previous day
            this.navigateToPreviousDay();
        } else {
            // Navigate to previous tab
            this.navigateToPreviousTab();
        }
    }

    handleSwipeLeft() {
        if (this.app.currentView === 'day') {
            // Navigate to next day
            this.navigateToNextDay();
        } else {
            // Navigate to next tab
            this.navigateToNextTab();
        }
    }

    // Day Navigation (for Day View)
    navigateToPreviousDay() {
        if (this.app.currentDay > 1) {
            this.app.currentDay--;
        } else if (this.app.currentWeek > 1) {
            this.app.currentWeek--;
            this.app.currentDay = 7;
        }
        this.app.initializeCurrentView();
        console.log(`📅 Previous day: Week ${this.app.currentWeek}, Day ${this.app.currentDay}`);
    }

    navigateToNextDay() {
        if (this.app.currentDay < 7) {
            this.app.currentDay++;
        } else if (this.app.currentWeek < 6) {
            this.app.currentWeek++;
            this.app.currentDay = 1;
        }
        this.app.initializeCurrentView();
        console.log(`📅 Next day: Week ${this.app.currentWeek}, Day ${this.app.currentDay}`);
    }

    // Visual Feedback
    addRippleEffect(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        // Get touch position relative to element
        const x = (event.touches ? event.touches[0].clientX : event.clientX) - rect.left - size / 2;
        const y = (event.touches ? event.touches[0].clientY : event.clientY) - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
        `;
        
        // Add ripple CSS if not exists
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
                .tab-btn {
                    position: relative;
                    overflow: hidden;
                }
            `;
            document.head.appendChild(style);
        }
        
        element.appendChild(ripple);
        
        // Clean up ripple
        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // Modal Management
    closeModals() {
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        modals.forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    // Accessibility Support
    announceViewChange(viewName) {
        // Screen reader announcement
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.textContent = `Switched to ${viewName} view`;
        
        document.body.appendChild(announcement);
        
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    // Public API for External Use
    setCurrentDay(week, day) {
        this.app.currentWeek = week;
        this.app.currentDay = day;
        
        if (this.app.currentView === 'day') {
            this.app.initializeCurrentView();
        }
    }

    getCurrentLocation() {
        return {
            view: this.app.currentView,
            week: this.app.currentWeek,
            day: this.app.currentDay
        };
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NavigationManager;
}