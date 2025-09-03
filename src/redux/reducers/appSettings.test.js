import appSettingsReducer, { INIT_STATE } from './appSettings';
import {
    GET_APPLICATION_SETTINGS_REQUEST,
    GET_APPLICATION_SETTINGS_SUCCESS,
    GET_APPLICATION_SETTINGS_FAILURE
} from '../action-types';

describe('AppSettings Reducer - Diversion Integration', () => {
    let initialState;

    beforeEach(() => {
        initialState = { ...INIT_STATE };
    });

    it('should return initial state', () => {
        expect(appSettingsReducer(undefined, {})).toEqual(INIT_STATE);
    });

    it('should return current state for unknown action', () => {
        const currentState = { ...INIT_STATE, isLoading: true };
        expect(appSettingsReducer(currentState, { type: 'UNKNOWN_ACTION' })).toEqual(currentState);
    });

    describe('GET_APPLICATION_SETTINGS_REQUEST', () => {
        it('should set isLoading to true', () => {
            const action = { type: GET_APPLICATION_SETTINGS_REQUEST };
            const newState = appSettingsReducer(initialState, action);

            expect(newState.isLoading).toBe(true);
        });

        it('should preserve other state properties', () => {
            initialState.error = 'Previous error';
            initialState.settings = { oldSetting: true };

            const action = { type: GET_APPLICATION_SETTINGS_REQUEST };
            const newState = appSettingsReducer(initialState, action);

            expect(newState.isLoading).toBe(true);
            expect(newState.error).toBe('Previous error');
            expect(newState.settings).toEqual({ oldSetting: true });
        });
    });

    describe('GET_APPLICATION_SETTINGS_SUCCESS', () => {
        it('should set isLoading to false and update settings with diversion flags', () => {
            const mockSettings = {
                useEditEffectPanel: true,
                useDiversion: true,
                useDisruptionNotePopup: false,
                otherFeatures: {
                    feature1: true,
                    feature2: false
                }
            };

            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: mockSettings
            };

            initialState.isLoading = true;
            const newState = appSettingsReducer(initialState, action);

            expect(newState.isLoading).toBe(false);
            expect(newState.settings).toEqual(mockSettings);
            expect(newState.error).toBeNull();
        });

        it('should handle settings with only diversion flags', () => {
            const mockSettings = {
                useEditEffectPanel: true,
                useDiversion: true,
                useDisruptionNotePopup: false
            };

            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: mockSettings
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings).toEqual(mockSettings);
            expect(newState.settings.useEditEffectPanel).toBe(true);
            expect(newState.settings.useDiversion).toBe(true);
            expect(newState.settings.useDisruptionNotePopup).toBe(false);
        });

        it('should handle settings with missing diversion flags', () => {
            const mockSettings = {
                otherFeatures: {
                    feature1: true,
                    feature2: false
                }
            };

            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: mockSettings
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings).toEqual(mockSettings);
            expect(newState.settings.useEditEffectPanel).toBeUndefined();
            expect(newState.settings.useDiversion).toBeUndefined();
            expect(newState.settings.useDisruptionNotePopup).toBeUndefined();
        });

        it('should handle settings with partial diversion flags', () => {
            const mockSettings = {
                useEditEffectPanel: true,
                // useDiversion is missing
                useDisruptionNotePopup: false
            };

            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: mockSettings
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings).toEqual(mockSettings);
            expect(newState.settings.useEditEffectPanel).toBe(true);
            expect(newState.settings.useDiversion).toBeUndefined();
            expect(newState.settings.useDisruptionNotePopup).toBe(false);
        });

        it('should handle boolean diversion flags correctly', () => {
            const mockSettings = {
                useEditEffectPanel: true,
                useDiversion: true,
                useDisruptionNotePopup: false
            };

            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: mockSettings
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings.useEditEffectPanel).toBe(true);
            expect(newState.settings.useDiversion).toBe(true);
            expect(newState.settings.useDisruptionNotePopup).toBe(false);
        });

        it('should handle string diversion flags correctly', () => {
            const mockSettings = {
                useEditEffectPanel: 'true',
                useDiversion: 'false',
                useDisruptionNotePopup: 'true'
            };

            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: mockSettings
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings.useEditEffectPanel).toBe('true');
            expect(newState.settings.useDiversion).toBe('false');
            expect(newState.settings.useDisruptionNotePopup).toBe('true');
        });

        it('should handle numeric diversion flags correctly', () => {
            const mockSettings = {
                useEditEffectPanel: 1,
                useDiversion: 0,
                useDisruptionNotePopup: 1
            };

            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: mockSettings
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings.useEditEffectPanel).toBe(1);
            expect(newState.settings.useDiversion).toBe(0);
            expect(newState.settings.useDisruptionNotePopup).toBe(1);
        });

        it('should handle null diversion flags correctly', () => {
            const mockSettings = {
                useEditEffectPanel: null,
                useDiversion: null,
                useDisruptionNotePopup: null
            };

            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: mockSettings
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings.useEditEffectPanel).toBeNull();
            expect(newState.settings.useDiversion).toBeNull();
            expect(newState.settings.useDisruptionNotePopup).toBeNull();
        });

        it('should handle undefined diversion flags correctly', () => {
            const mockSettings = {
                useEditEffectPanel: undefined,
                useDiversion: undefined,
                useDisruptionNotePopup: undefined
            };

            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: mockSettings
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings.useEditEffectPanel).toBeUndefined();
            expect(newState.settings.useDiversion).toBeUndefined();
            expect(newState.settings.useDisruptionNotePopup).toBeUndefined();
        });

        it('should clear previous error when settings are loaded successfully', () => {
            initialState.error = 'Previous error message';
            initialState.isLoading = true;

            const mockSettings = {
                useEditEffectPanel: true,
                useDiversion: true
            };

            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: mockSettings
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.error).toBeNull();
            expect(newState.isLoading).toBe(false);
            expect(newState.settings).toEqual(mockSettings);
        });

        it('should handle large settings objects efficiently', () => {
            const largeSettings = {
                useEditEffectPanel: true,
                useDiversion: true,
                useDisruptionNotePopup: false
            };

            // Add 1000 additional settings
            for (let i = 0; i < 1000; i++) {
                largeSettings[`setting${i}`] = i % 2 === 0;
            }

            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: largeSettings
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings).toEqual(largeSettings);
            expect(newState.settings.useEditEffectPanel).toBe(true);
            expect(newState.settings.useDiversion).toBe(true);
            expect(newState.settings.useDisruptionNotePopup).toBe(false);
            expect(Object.keys(newState.settings)).toHaveLength(1003); // 3 diversion flags + 1000 additional
        });
    });

    describe('GET_APPLICATION_SETTINGS_FAILURE', () => {
        it('should set isLoading to false and update error', () => {
            const errorMessage = 'Failed to fetch settings';
            const action = {
                type: GET_APPLICATION_SETTINGS_FAILURE,
                payload: { error: errorMessage }
            };

            initialState.isLoading = true;
            const newState = appSettingsReducer(initialState, action);

            expect(newState.isLoading).toBe(false);
            expect(newState.error).toBe(errorMessage);
        });

        it('should preserve existing settings when error occurs', () => {
            const existingSettings = {
                useEditEffectPanel: true,
                useDiversion: true
            };

            initialState.settings = existingSettings;
            initialState.isLoading = true;

            const action = {
                type: GET_APPLICATION_SETTINGS_FAILURE,
                payload: { error: 'Network error' }
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings).toEqual(existingSettings);
            expect(newState.error).toBe('Network error');
            expect(newState.isLoading).toBe(false);
        });

        it('should handle error with missing error message', () => {
            const action = {
                type: GET_APPLICATION_SETTINGS_FAILURE,
                payload: {}
            };

            initialState.isLoading = true;
            const newState = appSettingsReducer(initialState, action);

            expect(newState.isLoading).toBe(false);
            expect(newState.error).toBeUndefined();
        });

        it('should handle error with null error message', () => {
            const action = {
                type: GET_APPLICATION_SETTINGS_FAILURE,
                payload: { error: null }
            };

            initialState.isLoading = true;
            const newState = appSettingsReducer(initialState, action);

            expect(newState.isLoading).toBe(false);
            expect(newState.error).toBeNull();
        });
    });

    describe('State immutability', () => {
        it('should not mutate original state', () => {
            const originalState = { ...initialState };
            const action = { type: GET_APPLICATION_SETTINGS_REQUEST };
            
            appSettingsReducer(initialState, action);
            
            expect(initialState).toEqual(originalState);
        });

        it('should not mutate nested objects', () => {
            const originalSettings = { useEditEffectPanel: true };
            initialState.settings = originalSettings;

            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: { useDiversion: true }
            };

            appSettingsReducer(initialState, action);
            
            expect(originalSettings).toEqual({ useEditEffectPanel: true });
        });
    });

    describe('Complex state updates', () => {
        it('should handle multiple actions correctly', () => {
            let state = { ...initialState };

            // Request
            state = appSettingsReducer(state, { type: GET_APPLICATION_SETTINGS_REQUEST });
            expect(state.isLoading).toBe(true);

            // Success
            const settings = {
                useEditEffectPanel: true,
                useDiversion: true,
                useDisruptionNotePopup: false
            };
            state = appSettingsReducer(state, {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: settings
            });
            expect(state.isLoading).toBe(false);
            expect(state.settings).toEqual(settings);
            expect(state.error).toBeNull();

            // Another request
            state = appSettingsReducer(state, { type: GET_APPLICATION_SETTINGS_REQUEST });
            expect(state.isLoading).toBe(true);
            expect(state.settings).toEqual(settings); // Settings preserved

            // Failure
            state = appSettingsReducer(state, {
                type: GET_APPLICATION_SETTINGS_FAILURE,
                payload: { error: 'New error' }
            });
            expect(state.isLoading).toBe(false);
            expect(state.error).toBe('New error');
            expect(state.settings).toEqual(settings); // Settings still preserved
        });

        it('should handle rapid state changes', () => {
            let state = { ...initialState };

            // Rapid sequence of actions
            state = appSettingsReducer(state, { type: GET_APPLICATION_SETTINGS_REQUEST });
            state = appSettingsReducer(state, { type: GET_APPLICATION_SETTINGS_REQUEST });
            state = appSettingsReducer(state, { type: GET_APPLICATION_SETTINGS_REQUEST });

            expect(state.isLoading).toBe(true);

            // Success should clear loading regardless of multiple requests
            state = appSettingsReducer(state, {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: { useDiversion: true }
            });

            expect(state.isLoading).toBe(false);
            expect(state.settings.useDiversion).toBe(true);
        });
    });

    describe('Edge cases', () => {
        it('should handle empty settings payload', () => {
            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: {}
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings).toEqual({});
            expect(newState.isLoading).toBe(false);
            expect(newState.error).toBeNull();
        });

        it('should handle null settings payload', () => {
            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: null
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings).toBeNull();
            expect(newState.isLoading).toBe(false);
            expect(newState.error).toBeNull();
        });

        it('should handle undefined settings payload', () => {
            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: undefined
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings).toBeUndefined();
            expect(newState.isLoading).toBe(false);
            expect(newState.error).toBeNull();
        });

        it('should handle missing payload', () => {
            const action = {
                type: GET_APPLICATION_SETTINGS_SUCCESS
            };

            const newState = appSettingsReducer(initialState, action);

            expect(newState.settings).toBeUndefined();
            expect(newState.isLoading).toBe(false);
            expect(newState.error).toBeNull();
        });
    });

    describe('Integration scenarios', () => {
        it('should work with diversion workflow when settings are loaded', () => {
            let state = { ...initialState };

            // Load settings with diversion flags
            const diversionSettings = {
                useEditEffectPanel: true,
                useDiversion: true,
                useDisruptionNotePopup: false
            };

            state = appSettingsReducer(state, {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: diversionSettings
            });

            // These settings should enable diversion functionality
            expect(state.settings.useEditEffectPanel).toBe(true);
            expect(state.settings.useDiversion).toBe(true);
            expect(state.settings.useDisruptionNotePopup).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('should work with diversion workflow when settings are disabled', () => {
            let state = { ...initialState };

            // Load settings with diversion flags disabled
            const disabledSettings = {
                useEditEffectPanel: false,
                useDiversion: false,
                useDisruptionNotePopup: false
            };

            state = appSettingsReducer(state, {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: disabledSettings
            });

            // These settings should disable diversion functionality
            expect(state.settings.useEditEffectPanel).toBe(false);
            expect(state.settings.useDiversion).toBe(false);
            expect(state.settings.useDisruptionNotePopup).toBe(false);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });

        it('should work with diversion workflow when settings are mixed', () => {
            let state = { ...initialState };

            // Load settings with mixed flags
            const mixedSettings = {
                useEditEffectPanel: true,
                useDiversion: false,
                useDisruptionNotePopup: true
            };

            state = appSettingsReducer(state, {
                type: GET_APPLICATION_SETTINGS_SUCCESS,
                payload: mixedSettings
            });

            // Mixed settings should enable some features and disable others
            expect(state.settings.useEditEffectPanel).toBe(true);
            expect(state.settings.useDiversion).toBe(false);
            expect(state.settings.useDisruptionNotePopup).toBe(true);
            expect(state.isLoading).toBe(false);
            expect(state.error).toBeNull();
        });
    });
}); 