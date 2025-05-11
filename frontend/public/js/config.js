// API Configuration
const config = {
    // Use Google Apps Script endpoint
    API_BASE_URL: 'https://script.google.com/macros/s/AKfycbw0J5AM9Qq1M3yH-tp1xPwIMJRj84U3p8QTpGDdxTs7/dev',
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    DEBUG: true // Enable debug logging
};

// Debug logging
function debugLog(...args) {
    if (config.DEBUG) {
        console.log('[KOSGE]', ...args);
    }
}

// Log configuration on load
debugLog('Configuration loaded:', config);

// Prevent accidental modification
Object.freeze(config);

// Export configuration
window.APP_CONFIG = config;