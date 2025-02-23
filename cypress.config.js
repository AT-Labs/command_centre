const { defineConfig } = require('cypress');

module.exports = defineConfig({
    reporter: 'mocha-multi-reporters',
    video: false,
    trashAssetsBeforeRuns: false,
    viewportWidth: 1920,
    viewportHeight: 1200,

    reporterOptions: {
        toConsole: true,
        configFile: 'config/cypress/reporter.json',
    },

    chromeWebSecurity: false,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 60000,
    experimentalFetchPolyfill: true,
    numTestsKeptInMemory: 3,

    retries: {
        runMode: 2,
        openMode: 0,
    },

    e2e: {
        setupNodeEvents(on, config) {
            return require('./cypress/plugins/index.js')(on, config);
        },
        baseUrl: 'http://localhost:3000/',
        testIsolation: false,
        experimentalRunAllSpecs: true,
    },

    experimentalMemoryManagement: true,

});
