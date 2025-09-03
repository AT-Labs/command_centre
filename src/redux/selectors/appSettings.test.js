import {
    getApplicationSettings,
    getUseEditEffectPanel,
    getUseDiversionFlag,
    getUseDisruptionNotePopup
} from './appSettings';

describe('AppSettings Selectors - Diversion Integration', () => {
    let mockState;

    beforeEach(() => {
        mockState = {
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true,
                useDisruptionNotePopup: false,
                otherSettings: {
                    feature1: true,
                    feature2: false
                }
            }
        };
    });

    describe('getApplicationSettings', () => {
        it('should return all application settings', () => {
            const result = getApplicationSettings(mockState);
            expect(result).toEqual(mockState.appSettings);
        });

        it('should return undefined when state is undefined', () => {
            const result = getApplicationSettings(undefined);
            expect(result).toBeUndefined();
        });

        it('should return undefined when appSettings is missing', () => {
            const stateWithoutSettings = {};
            const result = getApplicationSettings(stateWithoutSettings);
            expect(result).toBeUndefined();
        });
    });

    describe('getUseEditEffectPanel', () => {
        it('should return useEditEffectPanel flag when true', () => {
            const result = getUseEditEffectPanel(mockState);
            expect(result).toBe(true);
        });

        it('should return useEditEffectPanel flag when false', () => {
            mockState.appSettings.useEditEffectPanel = false;
            const result = getUseEditEffectPanel(mockState);
            expect(result).toBe(false);
        });

        it('should return false when flag is undefined', () => {
            delete mockState.appSettings.useEditEffectPanel;
            const result = getUseEditEffectPanel(mockState);
            expect(result).toBe(false);
        });

        it('should return false when state is undefined', () => {
            const result = getUseEditEffectPanel(undefined);
            expect(result).toBe(false);
        });

        it('should return false when appSettings is missing', () => {
            const stateWithoutSettings = {};
            const result = getUseEditEffectPanel(stateWithoutSettings);
            expect(result).toBe(false);
        });
    });

    describe('getUseDiversionFlag', () => {
        it('should return useDiversion flag when true', () => {
            const result = getUseDiversionFlag(mockState);
            expect(result).toBe(true);
        });

        it('should return useDiversion flag when false', () => {
            mockState.appSettings.useDiversion = false;
            const result = getUseDiversionFlag(mockState);
            expect(result).toBe(false);
        });

        it('should return false when flag is undefined', () => {
            delete mockState.appSettings.useDiversion;
            const result = getUseDiversionFlag(mockState);
            expect(result).toBe(false);
        });

        it('should return false when state is undefined', () => {
            const result = getUseDiversionFlag(undefined);
            expect(result).toBe(false);
        });

        it('should return false when appSettings is missing', () => {
            const stateWithoutSettings = {};
            const result = getUseDiversionFlag(stateWithoutSettings);
            expect(result).toBe(false);
        });
    });

    describe('getUseDisruptionNotePopup', () => {
        it('should return useDisruptionNotePopup flag when true', () => {
            mockState.appSettings.useDisruptionNotePopup = true;
            const result = getUseDisruptionNotePopup(mockState);
            expect(result).toBe(true);
        });

        it('should return useDisruptionNotePopup flag when false', () => {
            const result = getUseDisruptionNotePopup(mockState);
            expect(result).toBe(false);
        });

        it('should return false when flag is undefined', () => {
            delete mockState.appSettings.useDisruptionNotePopup;
            const result = getUseDisruptionNotePopup(mockState);
            expect(result).toBe(false);
        });

        it('should return false when state is undefined', () => {
            const result = getUseDisruptionNotePopup(undefined);
            expect(result).toBe(false);
        });

        it('should return false when appSettings is missing', () => {
            const stateWithoutSettings = {};
            const result = getUseDisruptionNotePopup(stateWithoutSettings);
            expect(result).toBe(false);
        });
    });

    describe('Feature flag combinations', () => {
        it('should handle both useEditEffectPanel and useDiversion as true', () => {
            const result1 = getUseEditEffectPanel(mockState);
            const result2 = getUseDiversionFlag(mockState);
            
            expect(result1).toBe(true);
            expect(result2).toBe(true);
        });

        it('should handle both useEditEffectPanel and useDiversion as false', () => {
            mockState.appSettings.useEditEffectPanel = false;
            mockState.appSettings.useDiversion = false;
            
            const result1 = getUseEditEffectPanel(mockState);
            const result2 = getUseDiversionFlag(mockState);
            
            expect(result1).toBe(false);
            expect(result2).toBe(false);
        });

        it('should handle mixed feature flags', () => {
            mockState.appSettings.useEditEffectPanel = true;
            mockState.appSettings.useDiversion = false;
            mockState.appSettings.useDisruptionNotePopup = true;
            
            const result1 = getUseEditEffectPanel(mockState);
            const result2 = getUseDiversionFlag(mockState);
            const result3 = getUseDisruptionNotePopup(mockState);
            
            expect(result1).toBe(true);
            expect(result2).toBe(false);
            expect(result3).toBe(true);
        });
    });

    describe('Edge cases', () => {
        it('should handle deeply nested undefined states', () => {
            const deeplyNestedState = {
                appSettings: {
                    useEditEffectPanel: undefined,
                    useDiversion: undefined,
                    useDisruptionNotePopup: undefined
                }
            };

            expect(getUseEditEffectPanel(deeplyNestedState)).toBe(false);
            expect(getUseDiversionFlag(deeplyNestedState)).toBe(false);
            expect(getUseDisruptionNotePopup(deeplyNestedState)).toBe(false);
        });

        it('should handle null values', () => {
            const stateWithNulls = {
                appSettings: {
                    useEditEffectPanel: null,
                    useDiversion: null,
                    useDisruptionNotePopup: null
                }
            };

            expect(getUseEditEffectPanel(stateWithNulls)).toBe(false);
            expect(getUseDiversionFlag(stateWithNulls)).toBe(false);
            expect(getUseDisruptionNotePopup(stateWithNulls)).toBe(false);
        });

        it('should handle string values', () => {
            const stateWithStrings = {
                appSettings: {
                    useEditEffectPanel: 'true',
                    useDiversion: 'false',
                    useDisruptionNotePopup: 'true'
                }
            };

            expect(getUseEditEffectPanel(stateWithStrings)).toBe('true');
            expect(getUseDiversionFlag(stateWithStrings)).toBe('false');
            expect(getUseDisruptionNotePopup(stateWithStrings)).toBe('true');
        });
    });

    describe('Performance considerations', () => {
        it('should handle large number of settings efficiently', () => {
            const largeState = {
                appSettings: {}
            };

            // Create 1000 settings
            for (let i = 0; i < 1000; i++) {
                largeState.appSettings[`setting${i}`] = i % 2 === 0;
            }

            // Add our specific flags
            largeState.appSettings.useEditEffectPanel = true;
            largeState.appSettings.useDiversion = true;
            largeState.appSettings.useDisruptionNotePopup = false;

            // Test performance
            const startTime = performance.now();
            const result1 = getUseEditEffectPanel(largeState);
            const result2 = getUseDiversionFlag(largeState);
            const result3 = getUseDisruptionNotePopup(largeState);
            const endTime = performance.now();

            expect(result1).toBe(true);
            expect(result2).toBe(true);
            expect(result3).toBe(false);
            
            // Should complete in reasonable time (less than 10ms)
            expect(endTime - startTime).toBeLessThan(10);
        });
    });

    describe('Integration scenarios', () => {
        it('should work with diversion workflow when both flags are true', () => {
            const diversionState = {
                appSettings: {
                    useEditEffectPanel: true,
                    useDiversion: true
                },
                control: {
                    diversions: {
                        isDiversionManagerOpen: false,
                        diversionMode: 'CREATE'
                    }
                }
            };

            const canUseEditEffectPanel = getUseEditEffectPanel(diversionState);
            const canUseDiversions = getUseDiversionFlag(diversionState);

            expect(canUseEditEffectPanel).toBe(true);
            expect(canUseDiversions).toBe(true);
        });

        it('should work with diversion workflow when only useDiversion is true', () => {
            const diversionState = {
                appSettings: {
                    useEditEffectPanel: false,
                    useDiversion: true
                },
                control: {
                    diversions: {
                        isDiversionManagerOpen: false,
                        diversionMode: 'CREATE'
                    }
                }
            };

            const canUseEditEffectPanel = getUseEditEffectPanel(diversionState);
            const canUseDiversions = getUseDiversionFlag(diversionState);

            expect(canUseEditEffectPanel).toBe(false);
            expect(canUseDiversions).toBe(true);
        });

        it('should work with diversion workflow when only useEditEffectPanel is true', () => {
            const diversionState = {
                appSettings: {
                    useEditEffectPanel: true,
                    useDiversion: false
                },
                control: {
                    diversions: {
                        isDiversionManagerOpen: false,
                        diversionMode: 'CREATE'
                    }
                }
            };

            const canUseEditEffectPanel = getUseEditEffectPanel(diversionState);
            const canUseDiversions = getUseDiversionFlag(diversionState);

            expect(canUseEditEffectPanel).toBe(true);
            expect(canUseDiversions).toBe(false);
        });

        it('should work with diversion workflow when both flags are false', () => {
            const diversionState = {
                appSettings: {
                    useEditEffectPanel: false,
                    useDiversion: false
                },
                control: {
                    diversions: {
                        isDiversionManagerOpen: false,
                        diversionMode: 'CREATE'
                    }
                }
            };

            const canUseEditEffectPanel = getUseEditEffectPanel(diversionState);
            const canUseDiversions = getUseDiversionFlag(diversionState);

            expect(canUseEditEffectPanel).toBe(false);
            expect(canUseDiversions).toBe(false);
        });
    });
}); 