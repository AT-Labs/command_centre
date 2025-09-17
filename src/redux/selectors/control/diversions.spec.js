import * as selectors from './diversions';

describe('Diversions Selectors', () => {
    const mockState = {
        control: {
            diversions: {
                diversionsData: {
                    'disruption-1': [
                        { diversionId: 'div-1', name: 'Diversion 1' },
                        { diversionId: 'div-2', name: 'Diversion 2' }
                    ],
                    'disruption-2': [
                        { diversionId: 'div-3', name: 'Diversion 3' }
                    ]
                },
                diversionsLoading: {
                    'disruption-1': false,
                    'disruption-2': true
                },
                diversionsError: {
                    'disruption-1': null,
                    'disruption-2': 'Error loading diversions'
                },
                isDiversionManagerOpen: true,
                isDiversionManagerLoading: false,
                diversionEditMode: 'create',
                diversionResultState: 'success',
                diversion: { diversionId: 'div-1', name: 'Test Diversion' }
            }
        }
    };

    const emptyState = {
        control: {
            diversions: {}
        }
    };

    const nullState = {
        control: {
            diversions: null
        }
    };

    describe('getDiversionsState', () => {
        it('should return diversions state from control', () => {
            const result = selectors.getDiversionsState(mockState);
            expect(result).toEqual(mockState.control.diversions);
        });

        it('should return undefined when control.diversions does not exist', () => {
            const result = selectors.getDiversionsState({});
            expect(result).toBeUndefined();
        });
    });

    describe('getDiversionsData', () => {
        it('should return diversionsData from diversions state', () => {
            const result = selectors.getDiversionsData(mockState);
            expect(result).toEqual(mockState.control.diversions.diversionsData);
        });

        it('should return undefined when diversionsData does not exist', () => {
            const result = selectors.getDiversionsData(emptyState);
            expect(result).toBeUndefined();
        });

        it('should return undefined when diversions state is null', () => {
            const result = selectors.getDiversionsData(nullState);
            expect(result).toBeUndefined();
        });
    });

    describe('getDiversionsLoading', () => {
        it('should return diversionsLoading from diversions state', () => {
            const result = selectors.getDiversionsLoading(mockState);
            expect(result).toEqual(mockState.control.diversions.diversionsLoading);
        });

        it('should return undefined when diversionsLoading does not exist', () => {
            const result = selectors.getDiversionsLoading(emptyState);
            expect(result).toBeUndefined();
        });

        it('should return undefined when diversions state is null', () => {
            const result = selectors.getDiversionsLoading(nullState);
            expect(result).toBeUndefined();
        });
    });

    describe('getDiversionsError', () => {
        it('should return diversionsError from diversions state', () => {
            const result = selectors.getDiversionsError(mockState);
            expect(result).toEqual(mockState.control.diversions.diversionsError);
        });

        it('should return undefined when diversionsError does not exist', () => {
            const result = selectors.getDiversionsError(emptyState);
            expect(result).toBeUndefined();
        });

        it('should return undefined when diversions state is null', () => {
            const result = selectors.getDiversionsError(nullState);
            expect(result).toBeUndefined();
        });
    });

    describe('getIsDiversionManagerOpen', () => {
        it('should return isDiversionManagerOpen from diversions state', () => {
            const result = selectors.getIsDiversionManagerOpen(mockState);
            expect(result).toBe(true);
        });

        it('should return undefined when isDiversionManagerOpen does not exist', () => {
            const result = selectors.getIsDiversionManagerOpen(emptyState);
            expect(result).toBeUndefined();
        });
    });

    describe('getIsDiversionManagerLoading', () => {
        it('should return isDiversionManagerLoading from diversions state', () => {
            const result = selectors.getIsDiversionManagerLoading(mockState);
            expect(result).toBe(false);
        });

        it('should return undefined when isDiversionManagerLoading does not exist', () => {
            const result = selectors.getIsDiversionManagerLoading(emptyState);
            expect(result).toBeUndefined();
        });
    });

    describe('getDiversionEditMode', () => {
        it('should return diversionEditMode from diversions state', () => {
            const result = selectors.getDiversionEditMode(mockState);
            expect(result).toBe('create');
        });

        it('should return undefined when diversionEditMode does not exist', () => {
            const result = selectors.getDiversionEditMode(emptyState);
            expect(result).toBeUndefined();
        });
    });

    describe('getDiversionResultState', () => {
        it('should return diversionResultState from diversions state', () => {
            const result = selectors.getDiversionResultState(mockState);
            expect(result).toBe('success');
        });

        it('should return undefined when diversionResultState does not exist', () => {
            const result = selectors.getDiversionResultState(emptyState);
            expect(result).toBeUndefined();
        });
    });

    describe('getDiversionForEditing', () => {
        it('should return diversion from diversions state', () => {
            const result = selectors.getDiversionForEditing(mockState);
            expect(result).toEqual({ diversionId: 'div-1', name: 'Test Diversion' });
        });

        it('should return undefined when diversion does not exist', () => {
            const result = selectors.getDiversionForEditing(emptyState);
            expect(result).toBeUndefined();
        });
    });

    describe('getDiversionsForDisruption', () => {
        it('should return diversions for specific disruption', () => {
            const selector = selectors.getDiversionsForDisruption('disruption-1');
            const result = selector(mockState);
            expect(result).toEqual([
                { diversionId: 'div-1', name: 'Diversion 1' },
                { diversionId: 'div-2', name: 'Diversion 2' }
            ]);
        });

        it('should return empty array when disruption has no diversions', () => {
            const selector = selectors.getDiversionsForDisruption('disruption-3');
            const result = selector(mockState);
            expect(result).toEqual([]);
        });

        it('should return empty array when diversionsData is undefined', () => {
            const selector = selectors.getDiversionsForDisruption('disruption-1');
            const result = selector(emptyState);
            expect(result).toEqual([]);
        });
    });

    describe('getDiversionsLoadingForDisruption', () => {
        it('should return loading state for specific disruption', () => {
            const selector = selectors.getDiversionsLoadingForDisruption('disruption-2');
            const result = selector(mockState);
            expect(result).toBe(true);
        });

        it('should return false when disruption is not loading', () => {
            const selector = selectors.getDiversionsLoadingForDisruption('disruption-1');
            const result = selector(mockState);
            expect(result).toBe(false);
        });

        it('should return false when diversionsLoading is undefined', () => {
            const selector = selectors.getDiversionsLoadingForDisruption('disruption-1');
            const result = selector(emptyState);
            expect(result).toBe(false);
        });
    });

    describe('getDiversionsErrorForDisruption', () => {
        it('should return error for specific disruption', () => {
            const selector = selectors.getDiversionsErrorForDisruption('disruption-2');
            const result = selector(mockState);
            expect(result).toBe('Error loading diversions');
        });

        it('should return null when disruption has no error', () => {
            const selector = selectors.getDiversionsErrorForDisruption('disruption-1');
            const result = selector(mockState);
            expect(result).toBe(null);
        });

        it('should return null when diversionsError is undefined', () => {
            const selector = selectors.getDiversionsErrorForDisruption('disruption-1');
            const result = selector(emptyState);
            expect(result).toBe(null);
        });
    });
});
