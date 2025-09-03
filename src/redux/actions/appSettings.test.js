import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
    getApplicationSettings
} from './appSettings';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('AppSettings Actions - Diversion Integration', () => {
    let store;

    beforeEach(() => {
        store = mockStore({});
        // Mock fetch globally
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getApplicationSettings', () => {
        it('should create GET_APPLICATION_SETTINGS_REQUEST action initially', () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({
                    useEditEffectPanel: true,
                    useDiversion: true,
                    useDisruptionNotePopup: false
                })
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                expect(actions[0]).toEqual({
                    type: 'GET_APPLICATION_SETTINGS_REQUEST'
                });
            });
        });

        it('should handle successful settings fetch with diversion flags', () => {
            const mockSettings = {
                useEditEffectPanel: true,
                useDiversion: true,
                useDisruptionNotePopup: false,
                otherFeatures: {
                    feature1: true,
                    feature2: false
                }
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSettings)
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_SUCCESS');
                expect(actions[1].payload).toEqual(mockSettings);
            });
        });

        it('should handle settings fetch error', () => {
            const error = new Error('Settings fetch failed');
            
            global.fetch.mockRejectedValueOnce(error);

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_FAILURE');
                expect(actions[1].payload).toEqual({
                    error: error.message
                });
            });
        });

        it('should handle HTTP error responses', () => {
            global.fetch.mockResolvedValueOnce({
                ok: false,
                status: 500,
                statusText: 'Internal Server Error'
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_FAILURE');
                expect(actions[1].payload.error).toContain('500');
            });
        });

        it('should handle malformed JSON response', () => {
            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.reject(new Error('Invalid JSON'))
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_FAILURE');
                expect(actions[1].payload.error).toContain('Invalid JSON');
            });
        });

        it('should handle missing diversion flags gracefully', () => {
            const mockSettings = {
                otherFeatures: {
                    feature1: true,
                    feature2: false
                }
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSettings)
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_SUCCESS');
                expect(actions[1].payload).toEqual(mockSettings);
            });
        });

        it('should handle partial diversion flags', () => {
            const mockSettings = {
                useEditEffectPanel: true,
                // useDiversion is missing
                useDisruptionNotePopup: false
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSettings)
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_SUCCESS');
                expect(actions[1].payload).toEqual(mockSettings);
            });
        });

        it('should handle boolean diversion flags correctly', () => {
            const mockSettings = {
                useEditEffectPanel: true,
                useDiversion: true,
                useDisruptionNotePopup: false
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSettings)
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_SUCCESS');
                expect(actions[1].payload.useEditEffectPanel).toBe(true);
                expect(actions[1].payload.useDiversion).toBe(true);
                expect(actions[1].payload.useDisruptionNotePopup).toBe(false);
            });
        });

        it('should handle string diversion flags correctly', () => {
            const mockSettings = {
                useEditEffectPanel: 'true',
                useDiversion: 'false',
                useDisruptionNotePopup: 'true'
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSettings)
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_SUCCESS');
                expect(actions[1].payload.useEditEffectPanel).toBe('true');
                expect(actions[1].payload.useDiversion).toBe('false');
                expect(actions[1].payload.useDisruptionNotePopup).toBe('true');
            });
        });

        it('should handle numeric diversion flags correctly', () => {
            const mockSettings = {
                useEditEffectPanel: 1,
                useDiversion: 0,
                useDisruptionNotePopup: 1
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSettings)
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_SUCCESS');
                expect(actions[1].payload.useEditEffectPanel).toBe(1);
                expect(actions[1].payload.useDiversion).toBe(0);
                expect(actions[1].payload.useDisruptionNotePopup).toBe(1);
            });
        });

        it('should handle null diversion flags correctly', () => {
            const mockSettings = {
                useEditEffectPanel: null,
                useDiversion: null,
                useDisruptionNotePopup: null
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSettings)
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_SUCCESS');
                expect(actions[1].payload.useEditEffectPanel).toBeNull();
                expect(actions[1].payload.useDiversion).toBeNull();
                expect(actions[1].payload.useDisruptionNotePopup).toBeNull();
            });
        });

        it('should handle undefined diversion flags correctly', () => {
            const mockSettings = {
                useEditEffectPanel: undefined,
                useDiversion: undefined,
                useDisruptionNotePopup: undefined
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSettings)
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_SUCCESS');
                expect(actions[1].payload.useEditEffectPanel).toBeUndefined();
                expect(actions[1].payload.useDiversion).toBeUndefined();
                expect(actions[1].payload.useDisruptionNotePopup).toBeUndefined();
            });
        });

        it('should handle network timeout gracefully', () => {
            global.fetch.mockImplementationOnce(() => 
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Network timeout')), 100)
                )
            );

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_FAILURE');
                expect(actions[1].payload.error).toContain('Network timeout');
            });
        });

        it('should handle CORS errors gracefully', () => {
            const corsError = new Error('CORS error');
            corsError.name = 'TypeError';
            
            global.fetch.mockRejectedValueOnce(corsError);

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_FAILURE');
                expect(actions[1].payload.error).toContain('CORS error');
            });
        });

        it('should handle fetch not available gracefully', () => {
            const originalFetch = global.fetch;
            delete global.fetch;

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_FAILURE');
                expect(actions[1].payload.error).toContain('fetch is not defined');
            }).finally(() => {
                global.fetch = originalFetch;
            });
        });

        it('should handle large settings response efficiently', () => {
            const largeSettings = {
                useEditEffectPanel: true,
                useDiversion: true,
                useDisruptionNotePopup: false
            };

            // Add 1000 additional settings
            for (let i = 0; i < 1000; i++) {
                largeSettings[`setting${i}`] = i % 2 === 0;
            }

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(largeSettings)
            });

            const startTime = performance.now();
            
            return store.dispatch(getApplicationSettings()).then(() => {
                const endTime = performance.now();
                const actions = store.getActions();
                
                expect(actions[0].type).toBe('GET_APPLICATION_SETTINGS_REQUEST');
                expect(actions[1].type).toBe('GET_APPLICATION_SETTINGS_SUCCESS');
                expect(actions[1].payload.useEditEffectPanel).toBe(true);
                expect(actions[1].payload.useDiversion).toBe(true);
                expect(actions[1].payload.useDisruptionNotePopup).toBe(false);
                
                // Should complete in reasonable time (less than 100ms)
                expect(endTime - startTime).toBeLessThan(100);
            });
        });
    });

    describe('Integration scenarios', () => {
        it('should work with diversion workflow when settings are loaded', () => {
            const mockSettings = {
                useEditEffectPanel: true,
                useDiversion: true,
                useDisruptionNotePopup: false
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSettings)
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                const settings = actions[1].payload;
                
                // These settings should enable diversion functionality
                expect(settings.useEditEffectPanel).toBe(true);
                expect(settings.useDiversion).toBe(true);
                expect(settings.useDisruptionNotePopup).toBe(false);
            });
        });

        it('should work with diversion workflow when settings are disabled', () => {
            const mockSettings = {
                useEditEffectPanel: false,
                useDiversion: false,
                useDisruptionNotePopup: false
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSettings)
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                const settings = actions[1].payload;
                
                // These settings should disable diversion functionality
                expect(settings.useEditEffectPanel).toBe(false);
                expect(settings.useDiversion).toBe(false);
                expect(settings.useDisruptionNotePopup).toBe(false);
            });
        });

        it('should work with diversion workflow when settings are mixed', () => {
            const mockSettings = {
                useEditEffectPanel: true,
                useDiversion: false,
                useDisruptionNotePopup: true
            };

            global.fetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockSettings)
            });

            return store.dispatch(getApplicationSettings()).then(() => {
                const actions = store.getActions();
                const settings = actions[1].payload;
                
                // Mixed settings should enable some features and disable others
                expect(settings.useEditEffectPanel).toBe(true);
                expect(settings.useDiversion).toBe(false);
                expect(settings.useDisruptionNotePopup).toBe(true);
            });
        });
    });
}); 