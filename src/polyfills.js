require('@babel/polyfill');
require('core-js/features/promise');

// fetch() polyfill for making API calls.
require('whatwg-fetch');

// Object.assign() is commonly used with React.
// It will use the native implementation if it's present and isn't buggy.
Object.assign = require('object-assign');

// Polyfill for globalThis (not available in older browsers)
if (typeof globalThis === 'undefined') {
    if (typeof global !== 'undefined') {
        global.globalThis = global;
    } else if (typeof window !== 'undefined') {
        window.globalThis = window;
    }
}

// Create process object if it doesn't exist
const processObj = { env: {} };

// Polyfill for process object in browser environment
if (typeof window !== 'undefined') {
    if (typeof window.process === 'undefined') {
        window.process = processObj;
    }
    if (typeof global !== 'undefined' && typeof global.process === 'undefined') {
        global.process = processObj;
    }
}

// Ensure process is available globally
if (typeof process === 'undefined') {
    if (typeof window !== 'undefined') {
        window.process = processObj;
    }
    if (typeof global !== 'undefined') {
        global.process = processObj;
    }
    // Also set it on the global scope (check if globalThis exists first)
    if (typeof globalThis !== 'undefined') {
        // eslint-disable-next-line no-undef
        globalThis.process = processObj;
    }
}

// Set process globally for any remaining references
if (typeof process === 'undefined') {
    // Make it available in different contexts
    if (typeof window !== 'undefined') {
        window.process = processObj;
    }
    if (typeof global !== 'undefined') {
        global.process = processObj;
    }
    if (typeof globalThis !== 'undefined') {
        // eslint-disable-next-line no-undef
        globalThis.process = processObj;
    }
}

// Also set process on the global scope for any remaining references
if (typeof window !== 'undefined') {
    window.process = processObj;
}
if (typeof global !== 'undefined') {
    global.process = processObj;
}
if (typeof globalThis !== 'undefined') {
    // eslint-disable-next-line no-undef
    globalThis.process = processObj;
}
