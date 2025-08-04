require('@babel/polyfill');
require('core-js/features/promise');

// fetch() polyfill for making API calls.
require('whatwg-fetch');

// Object.assign() is commonly used with React.
// It will use the native implementation if it's present and isn't buggy.
Object.assign = require('object-assign');

// Polyfill for process object in browser environment
if (typeof window !== 'undefined') {
    if (typeof window.process === 'undefined') {
        window.process = { env: {} };
    }
    if (typeof process === 'undefined') {
        global.process = { env: {} };
    }
}
