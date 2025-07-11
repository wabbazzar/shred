// 6-Week Engagement Workout Tracker - Service Worker Registration
// PWA service worker registration and management

if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('./service-worker.js');
            console.log('🔧 Service Worker registered:', registration.scope);
            
            // Handle updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('🔄 New Service Worker available - forcing update');
                            // Force immediate update for development
                            newWorker.postMessage({ type: 'SKIP_WAITING' });
                            window.location.reload();
                        }
                    });
                }
            });
            
            // Force update check every 10 seconds in development
            setInterval(() => {
                registration.update();
            }, 10000);
            
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    });
} else {
    console.warn('⚠️ Service Worker not supported');
}