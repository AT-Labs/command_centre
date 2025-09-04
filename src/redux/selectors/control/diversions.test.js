import {
    getIsDiversionManagerOpen,
    getDiversionMode,
    getDiversionToEdit,
    getDiversionsForDisruption,
    getDiversionsForDisruptionById,
    getDiversionResultState,
    getIsLoading,
    getLoadingStates,
    getErrors,
    getDiversionCountForDisruption
} from './diversions';

describe('Diversion Selectors', () => {
    let mockState;

    beforeEach(() => {
        mockState = {
            control: {
                diversions: {
                    isDiversionManagerOpen: false,
                    diversionMode: 'CREATE',
                    diversionToEdit: null,
                    diversionsForDisruption: {
                        DISR123: [
                            { diversionId: 'DIV1', diversionName: 'Diversion 1' },
                            { diversionId: 'DIV2', diversionName: 'Diversion 2' }
                        ],
                        DISR456: [
                            { diversionId: 'DIV3', diversionName: 'Diversion 3' }
                        ]
                    },
                    diversionResultState: null,
                    isLoading: false,
                    loadingStates: {
                        DISR123: false,
                        DISR456: true
                    },
                    errors: {
                        DISR123: null,
                        DISR456: 'Error occurred'
                    }
                }
            }
        };
    });

    describe('getIsDiversionManagerOpen', () => {
        it('should return isDiversionManagerOpen from state', () => {
            const result = getIsDiversionManagerOpen(mockState);
            expect(result).toBe(false);
        });

        it('should return true when manager is open', () => {
            mockState.control.diversions.isDiversionManagerOpen = true;
            const result = getIsDiversionManagerOpen(mockState);
            expect(result).toBe(true);
        });

        it('should return false when state is undefined', () => {
            const result = getIsDiversionManagerOpen(undefined);
            expect(result).toBe(false);
        });

        it('should return false when control.diversions is undefined', () => {
            const stateWithoutDiversions = { control: {} };
            const result = getIsDiversionManagerOpen(stateWithoutDiversions);
            expect(result).toBe(false);
        });
    });

    describe('getDiversionMode', () => {
        it('should return diversionMode from state', () => {
            const result = getDiversionMode(mockState);
            expect(result).toBe('CREATE');
        });

        it('should return different modes', () => {
            mockState.control.diversions.diversionMode = 'EDIT';
            const result = getDiversionMode(mockState);
            expect(result).toBe('EDIT');
        });

        it('should return undefined when state is undefined', () => {
            const result = getDiversionMode(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('getDiversionToEdit', () => {
        it('should return diversionToEdit from state', () => {
            const result = getDiversionToEdit(mockState);
            expect(result).toBeNull();
        });

        it('should return diversion object when set', () => {
            const diversion = { diversionId: 'DIV123', diversionName: 'Test' };
            mockState.control.diversions.diversionToEdit = diversion;
            const result = getDiversionToEdit(mockState);
            expect(result).toEqual(diversion);
        });

        it('should return undefined when state is undefined', () => {
            const result = getDiversionToEdit(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('getDiversionsForDisruption', () => {
        it('should return all diversions for all disruptions', () => {
            const result = getDiversionsForDisruption(mockState);
            expect(result).toEqual({
                DISR123: [
                    { diversionId: 'DIV1', diversionName: 'Diversion 1' },
                    { diversionId: 'DIV2', diversionName: 'Diversion 2' }
                ],
                DISR456: [
                    { diversionId: 'DIV3', diversionName: 'Diversion 3' }
                ]
            });
        });

        it('should return empty object when no diversions', () => {
            mockState.control.diversions.diversionsForDisruption = {};
            const result = getDiversionsForDisruption(mockState);
            expect(result).toEqual({});
        });

        it('should return undefined when state is undefined', () => {
            const result = getDiversionsForDisruption(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('getDiversionsForDisruptionById', () => {
        it('should return diversions for specific disruption', () => {
            const result = getDiversionsForDisruptionById(mockState, 'DISR123');
            expect(result).toEqual([
                { diversionId: 'DIV1', diversionName: 'Diversion 1' },
                { diversionId: 'DIV2', diversionName: 'Diversion 2' }
            ]);
        });

        it('should return empty array for disruption with no diversions', () => {
            const result = getDiversionsForDisruptionById(mockState, 'DISR789');
            expect(result).toEqual([]);
        });

        it('should return empty array when disruptionId is null', () => {
            const result = getDiversionsForDisruptionById(mockState, null);
            expect(result).toEqual([]);
        });

        it('should return empty array when disruptionId is undefined', () => {
            const result = getDiversionsForDisruptionById(mockState, undefined);
            expect(result).toEqual([]);
        });

        it('should return empty array when state is undefined', () => {
            const result = getDiversionsForDisruptionById(undefined, 'DISR123');
            expect(result).toEqual([]);
        });
    });

    describe('getDiversionResultState', () => {
        it('should return diversionResultState from state', () => {
            const result = getDiversionResultState(mockState);
            expect(result).toBeNull();
        });

        it('should return result state when set', () => {
            const resultState = {
                diversionId: 'DIV123',
                isLoading: false,
                isSuccess: true,
                error: null
            };
            mockState.control.diversions.diversionResultState = resultState;
            const result = getDiversionResultState(mockState);
            expect(result).toEqual(resultState);
        });

        it('should return undefined when state is undefined', () => {
            const result = getDiversionResultState(undefined);
            expect(result).toBeUndefined();
        });
    });

    describe('getIsLoading', () => {
        it('should return isLoading from state', () => {
            const result = getIsLoading(mockState);
            expect(result).toBe(false);
        });

        it('should return true when loading', () => {
            mockState.control.diversions.isLoading = true;
            const result = getIsLoading(mockState);
            expect(result).toBe(true);
        });

        it('should return false when state is undefined', () => {
            const result = getIsLoading(undefined);
            expect(result).toBe(false);
        });
    });

    describe('getLoadingStates', () => {
        it('should return loadingStates from state', () => {
            const result = getLoadingStates(mockState);
            expect(result).toEqual({
                DISR123: false,
                DISR456: true
            });
        });

        it('should return empty object when no loading states', () => {
            mockState.control.diversions.loadingStates = {};
            const result = getLoadingStates(mockState);
            expect(result).toEqual({});
        });

        it('should return empty object when state is undefined', () => {
            const result = getLoadingStates(undefined);
            expect(result).toEqual({});
        });
    });

    describe('getErrors', () => {
        it('should return errors from state', () => {
            const result = getErrors(mockState);
            expect(result).toEqual({
                DISR123: null,
                DISR456: 'Error occurred'
            });
        });

        it('should return empty object when no errors', () => {
            mockState.control.diversions.errors = {};
            const result = getErrors(mockState);
            expect(result).toEqual({});
        });

        it('should return empty object when state is undefined', () => {
            const result = getErrors(undefined);
            expect(result).toEqual({});
        });
    });

    describe('getDiversionCountForDisruption', () => {
        it('should return count of diversions for specific disruption', () => {
            const result = getDiversionCountForDisruption(mockState, 'DISR123');
            expect(result).toBe(2);
        });

        it('should return 0 for disruption with no diversions', () => {
            const result = getDiversionCountForDisruption(mockState, 'DISR789');
            expect(result).toBe(0);
        });

        it('should return 0 when disruptionId is null', () => {
            const result = getDiversionCountForDisruption(mockState, null);
            expect(result).toBe(0);
        });

        it('should return 0 when disruptionId is undefined', () => {
            const result = getDiversionCountForDisruption(mockState, undefined);
            expect(result).toBe(0);
        });

        it('should return 0 when state is undefined', () => {
            const result = getDiversionCountForDisruption(undefined, 'DISR123');
            expect(result).toBe(0);
        });
    });

    describe('Selector composition', () => {
        it('should work together correctly', () => {
            // Test multiple selectors together
            const isOpen = getIsDiversionManagerOpen(mockState);
            const mode = getDiversionMode(mockState);
            const diversions = getDiversionsForDisruptionById(mockState, 'DISR123');
            const count = getDiversionCountForDisruption(mockState, 'DISR123');

            expect(isOpen).toBe(false);
            expect(mode).toBe('CREATE');
            expect(diversions).toHaveLength(2);
            expect(count).toBe(2);
        });
    });

    describe('Edge cases', () => {
        it('should handle deeply nested undefined states', () => {
            const deeplyNestedState = {
                control: {
                    diversions: {
                        isDiversionManagerOpen: undefined,
                        diversionMode: undefined,
                        diversionToEdit: undefined,
                        diversionsForDisruption: undefined,
                        diversionResultState: undefined,
                        isLoading: undefined,
                        loadingStates: undefined,
                        errors: undefined
                    }
                }
            };

            expect(getIsDiversionManagerOpen(deeplyNestedState)).toBe(false);
            expect(getDiversionMode(deeplyNestedState)).toBeUndefined();
            expect(getDiversionToEdit(deeplyNestedState)).toBeUndefined();
            expect(getDiversionsForDisruption(deeplyNestedState)).toBeUndefined();
            expect(getDiversionResultState(deeplyNestedState)).toBeUndefined();
            expect(getIsLoading(deeplyNestedState)).toBe(false);
            expect(getLoadingStates(deeplyNestedState)).toEqual({});
            expect(getErrors(deeplyNestedState)).toEqual({});
        });

        it('should handle missing control property', () => {
            const stateWithoutControl = {};
            
            expect(getIsDiversionManagerOpen(stateWithoutControl)).toBe(false);
            expect(getDiversionMode(stateWithoutControl)).toBeUndefined();
            expect(getDiversionToEdit(stateWithoutControl)).toBeUndefined();
            expect(getDiversionsForDisruption(stateWithoutControl)).toBeUndefined();
            expect(getDiversionResultState(stateWithoutControl)).toBeUndefined();
            expect(getIsLoading(stateWithoutControl)).toBe(false);
            expect(getLoadingStates(stateWithoutControl)).toEqual({});
            expect(getErrors(stateWithoutControl)).toEqual({});
        });

        it('should handle missing diversions property', () => {
            const stateWithoutDiversions = { control: {} };
            
            expect(getIsDiversionManagerOpen(stateWithoutDiversions)).toBe(false);
            expect(getDiversionMode(stateWithoutDiversions)).toBeUndefined();
            expect(getDiversionToEdit(stateWithoutDiversions)).toBeUndefined();
            expect(getDiversionsForDisruption(stateWithoutDiversions)).toBeUndefined();
            expect(getDiversionResultState(stateWithoutDiversions)).toBeUndefined();
            expect(getIsLoading(stateWithoutDiversions)).toBe(false);
            expect(getLoadingStates(stateWithoutDiversions)).toEqual({});
            expect(getErrors(stateWithoutDiversions)).toEqual({});
        });
    });

    describe('Performance considerations', () => {
        it('should handle large number of disruptions efficiently', () => {
            const largeState = {
                control: {
                    diversions: {
                        isDiversionManagerOpen: false,
                        diversionMode: 'CREATE',
                        diversionToEdit: null,
                        diversionsForDisruption: {},
                        diversionResultState: null,
                        isLoading: false,
                        loadingStates: {},
                        errors: {}
                    }
                }
            };

            // Create 1000 disruptions with diversions
            for (let i = 0; i < 1000; i++) {
                const disruptionId = `DISR${i}`;
                largeState.control.diversions.diversionsForDisruption[disruptionId] = [
                    { diversionId: `DIV${i}`, diversionName: `Diversion ${i}` }
                ];
                largeState.control.diversions.loadingStates[disruptionId] = false;
                largeState.control.diversions.errors[disruptionId] = null;
            }

            // Test performance
            const startTime = performance.now();
            const result = getDiversionsForDisruptionById(largeState, 'DISR500');
            const endTime = performance.now();

            expect(result).toHaveLength(1);
            expect(result[0].diversionId).toBe('DIV500');
            
            // Should complete in reasonable time (less than 100ms)
            expect(endTime - startTime).toBeLessThan(100);
        });
    });
}); 