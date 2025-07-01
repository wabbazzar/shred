/**
 * Game Template - Mobile-First JavaScript
 * Unified input handling for touch, keyboard, and mouse
 */

// Game States
const GameStates = {
    LOADING: 'loading',
    MENU: 'menu',
    PLAYING: 'playing',
    PAUSED: 'paused',
    GAME_OVER: 'game_over',
    SETTINGS: 'settings'
};

// Game Configuration
const GameConfig = {
    TARGET_FPS: 60,
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 600,
    TOUCH_THRESHOLD: 30
};

// Main Game Class
class GameTemplate {
    constructor() {
        this.currentState = GameStates.LOADING;
        this.score = 0;
        this.gameLoop = null;
        this.lastFrameTime = 0;
        this.deltaTime = 0;
        
        this.canvas = null;
        this.ctx = null;
        this.screens = {};
        this.input = null;
        
        this.settings = {
            sound: true,
            music: true,
            vibration: true
        };
        
        this.init();
    }
    
    init() {
        console.log('Game Template: Initializing...');
        
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.screens = {
            loading: document.getElementById('loading-screen'),
            menu: document.getElementById('menu-screen'),
            game: document.getElementById('game-screen'),
            pause: document.getElementById('pause-screen'),
            gameOver: document.getElementById('gameover-screen'),
            settings: document.getElementById('settings-screen')
        };
        
        this.setupCanvas();
        this.input = new UnifiedInput(this);
        this.setupEventListeners();
        this.loadSettings();
        this.startLoading();
    }
    
    setupCanvas() {
        this.canvas.width = GameConfig.CANVAS_WIDTH;
        this.canvas.height = GameConfig.CANVAS_HEIGHT;
        this.ctx.imageSmoothingEnabled = false;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
    }
    
    setupEventListeners() {
        document.getElementById('play-button').addEventListener('click', () => this.startGame());
        document.getElementById('settings-button').addEventListener('click', () => this.showSettings());
        document.getElementById('about-button').addEventListener('click', () => this.showAbout());
        document.getElementById('pause-button').addEventListener('click', () => this.pauseGame());
        document.getElementById('resume-button').addEventListener('click', () => this.resumeGame());
        document.getElementById('restart-button').addEventListener('click', () => this.restartGame());
        document.getElementById('menu-button').addEventListener('click', () => this.showMenu());
        document.getElementById('play-again-button').addEventListener('click', () => this.restartGame());
        document.getElementById('back-to-menu-button').addEventListener('click', () => this.showMenu());
        document.getElementById('settings-back-button').addEventListener('click', () => this.showMenu());
        
        document.getElementById('sound-toggle').addEventListener('change', (e) => {
            this.settings.sound = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('music-toggle').addEventListener('change', (e) => {
            this.settings.music = e.target.checked;
            this.saveSettings();
        });
        
        document.getElementById('vibration-toggle').addEventListener('change', (e) => {
            this.settings.vibration = e.target.checked;
            this.saveSettings();
        });
        
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && this.currentState === GameStates.PLAYING) {
                this.pauseGame();
            }
        });
    }
    
    startLoading() {
        this.changeState(GameStates.LOADING);
        setTimeout(() => this.showMenu(), 2000);
    }
    
    changeState(newState) {
        console.log(`Game State: ${this.currentState} -> ${newState}`);
        this.currentState = newState;
        
        Object.values(this.screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        switch (newState) {
            case GameStates.LOADING:
                this.screens.loading.classList.add('active');
                break;
            case GameStates.MENU:
                this.screens.menu.classList.add('active');
                this.stopGameLoop();
                break;
            case GameStates.PLAYING:
                this.screens.game.classList.add('active');
                this.startGameLoop();
                break;
            case GameStates.PAUSED:
                this.screens.pause.classList.add('active');
                this.stopGameLoop();
                break;
            case GameStates.GAME_OVER:
                this.screens.gameOver.classList.add('active');
                this.updateFinalScore();
                this.stopGameLoop();
                break;
            case GameStates.SETTINGS:
                this.screens.settings.classList.add('active');
                break;
        }
    }
    
    showMenu() { this.changeState(GameStates.MENU); }
    showSettings() { this.changeState(GameStates.SETTINGS); this.updateSettingsUI(); }
    showAbout() { alert('Game Template v1.0\n\nA mobile-first game template with PWA capabilities.'); }
    
    startGame() {
        this.score = 0;
        this.updateScore();
        this.changeState(GameStates.PLAYING);
        this.initializeGame();
    }
    
    pauseGame() {
        if (this.currentState === GameStates.PLAYING) {
            this.changeState(GameStates.PAUSED);
        }
    }
    
    resumeGame() {
        if (this.currentState === GameStates.PAUSED) {
            this.changeState(GameStates.PLAYING);
        }
    }
    
    restartGame() { this.startGame(); }
    gameOver() { this.changeState(GameStates.GAME_OVER); }
    initializeGame() { console.log('Game: Initializing game objects...'); }
    
    startGameLoop() {
        if (this.gameLoop) cancelAnimationFrame(this.gameLoop);
        this.lastFrameTime = performance.now();
        this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
    }
    
    stopGameLoop() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
    }
    
    update(timestamp) {
        this.deltaTime = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;
        
        if (this.currentState === GameStates.PLAYING) {
            this.updateGame(this.deltaTime);
            this.render();
        }
        
        this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
    }
    
    updateGame(deltaTime) {
        // Override this method in your specific game implementation
    }
    
    render() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.renderPlaceholderGame();
    }
    
    renderPlaceholderGame() {
        this.ctx.fillStyle = '#00ffff';
        this.ctx.font = '24px Arial';
        this.ctx.fillText('Game Template', this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '16px Arial';
        this.ctx.fillText('Replace this with your game logic', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText('Touch controls work on mobile', this.canvas.width / 2, this.canvas.height / 2 + 30);
        this.ctx.fillText('Keyboard controls work on desktop', this.canvas.width / 2, this.canvas.height / 2 + 60);
    }
    
    handleInput(action, inputType) {
        console.log(`Input: ${action} (${inputType})`);
        
        switch (this.currentState) {
            case GameStates.PLAYING:
                this.handleGameInput(action, inputType);
                break;
            case GameStates.PAUSED:
                if (action === 'PAUSE' || action === 'ESCAPE') {
                    this.resumeGame();
                }
                break;
        }
        
        if (inputType === 'touch' && this.settings.vibration && 'vibrate' in navigator) {
            navigator.vibrate(50);
        }
    }
    
    handleGameInput(action, inputType) {
        switch (action) {
            case 'UP': break;
            case 'DOWN': break;
            case 'LEFT': break;
            case 'RIGHT': break;
            case 'ACTION_A': break;
            case 'ACTION_B': break;
            case 'PAUSE': this.pauseGame(); break;
        }
    }
    
    updateScore(points = 0) {
        this.score += points;
        document.getElementById('score-value').textContent = this.score;
    }
    
    updateFinalScore() {
        document.getElementById('final-score-value').textContent = this.score;
    }
    
    updateSettingsUI() {
        document.getElementById('sound-toggle').checked = this.settings.sound;
        document.getElementById('music-toggle').checked = this.settings.music;
        document.getElementById('vibration-toggle').checked = this.settings.vibration;
    }
    
    saveSettings() {
        localStorage.setItem('gameSettings', JSON.stringify(this.settings));
    }
    
    loadSettings() {
        const saved = localStorage.getItem('gameSettings');
        if (saved) {
            this.settings = { ...this.settings, ...JSON.parse(saved) };
        }
    }
}

// Unified Input Handler
class UnifiedInput {
    constructor(game) {
        this.game = game;
        this.touchStartPos = { x: 0, y: 0 };
        this.touchEndPos = { x: 0, y: 0 };
        
        this.setupTouch();
        this.setupKeyboard();
        this.setupMouse();
    }
    
    setupTouch() {
        const touchButtons = document.querySelectorAll('.control-btn, .action-btn');
        touchButtons.forEach(button => {
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const action = this.getActionFromButton(button);
                this.game.handleInput(action, 'touch');
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
            });
        });
        
        this.game.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        });
        
        this.game.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            this.touchEndPos = { x: touch.clientX, y: touch.clientY };
            this.handleSwipe();
        });
    }
    
    setupKeyboard() {
        document.addEventListener('keydown', (e) => {
            const action = this.getActionFromKey(e.code);
            if (action) {
                e.preventDefault();
                this.game.handleInput(action, 'keyboard');
            }
        });
    }
    
    setupMouse() {
        this.game.canvas.addEventListener('click', (e) => {
            const rect = this.game.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const canvasX = (x / rect.width) * this.game.canvas.width;
            const canvasY = (y / rect.height) * this.game.canvas.height;
            
            this.game.handleInput('CLICK', 'mouse', { x: canvasX, y: canvasY });
        });
    }
    
    getActionFromButton(button) {
        const action = button.dataset.action;
        switch (action) {
            case 'up': return 'UP';
            case 'down': return 'DOWN';
            case 'left': return 'LEFT';
            case 'right': return 'RIGHT';
            case 'a': return 'ACTION_A';
            case 'b': return 'ACTION_B';
            default: return null;
        }
    }
    
    getActionFromKey(keyCode) {
        switch (keyCode) {
            case 'ArrowUp':
            case 'KeyW':
                return 'UP';
            case 'ArrowDown':
            case 'KeyS':
                return 'DOWN';
            case 'ArrowLeft':
            case 'KeyA':
                return 'LEFT';
            case 'ArrowRight':
            case 'KeyD':
                return 'RIGHT';
            case 'Space':
                return 'ACTION_A';
            case 'ShiftLeft':
            case 'ShiftRight':
                return 'ACTION_B';
            case 'Escape':
            case 'KeyP':
                return 'PAUSE';
            default:
                return null;
        }
    }
    
    handleSwipe() {
        const deltaX = this.touchEndPos.x - this.touchStartPos.x;
        const deltaY = this.touchEndPos.y - this.touchStartPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance < GameConfig.TOUCH_THRESHOLD) {
            this.game.handleInput('TAP', 'touch');
            return;
        }
        
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            if (deltaX > 0) {
                this.game.handleInput('SWIPE_RIGHT', 'touch');
            } else {
                this.game.handleInput('SWIPE_LEFT', 'touch');
            }
        } else {
            if (deltaY > 0) {
                this.game.handleInput('SWIPE_DOWN', 'touch');
            } else {
                this.game.handleInput('SWIPE_UP', 'touch');
            }
        }
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.game = new GameTemplate();
    console.log('Game Template: Ready!');
});
