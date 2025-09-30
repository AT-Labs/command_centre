import * as selectors from './diversions';

describe('Diversions Selectors', () => {
    const mockState = {
        control: {
            diversions: {
                diversionsData: {
                    'disruption-1': [
                        { diversionId: 'div-1', name: 'Diversion 1' },
                        { diversionId: 'div-2', name: 'Diversion 2' },
                    ],
                    'disruption-2': [
                        { diversionId: 'div-3', name: 'Diversion 3' },
                    ],
                },
                diversionsLoading: {
                    'disruption-1': false,
                    'disruption-2': true,
                },
                diversionsError: {
                    'disruption-1': null,
                    'disruption-2': 'Error loading diversions',
                },
                isDiversionManagerOpen: true,
                isDiversionManagerLoading: false,
                diversionEditMode: 'create',
                diversionResultState: 'success',
                diversion: { diversionId: 'div-1', name: 'Test Diversion' },
            },
        },
    };

    const emptyState = {
        control: {
            diversions: {},
        },
    };

    describe('Basic Selectors', () => {
        it('should return correct values from diversions state', () => {
            expect(selectors.getDiversionsData(mockState)).toEqual(mockState.control.diversions.diversionsData);
            expect(selectors.getDiversionsLoading(mockState)).toEqual(mockState.control.diversions.diversionsLoading);
            expect(selectors.getDiversionsError(mockState)).toEqual(mockState.control.diversions.diversionsError);
            expect(selectors.getIsDiversionManagerOpen(mockState)).toBe(true);
            expect(selectors.getIsDiversionManagerLoading(mockState)).toBe(false);
            expect(selectors.getDiversionEditMode(mockState)).toBe('create');
            expect(selectors.getDiversionResultState(mockState)).toBe('success');
            expect(selectors.getDiversionForEditing(mockState)).toEqual({ diversionId: 'div-1', name: 'Test Diversion' });
        });

        it('should return undefined when diversions state is empty', () => {
            expect(selectors.getDiversionsData(emptyState)).toBeUndefined();
            expect(selectors.getDiversionsLoading(emptyState)).toBeUndefined();
            expect(selectors.getDiversionsError(emptyState)).toBeUndefined();
            expect(selectors.getIsDiversionManagerOpen(emptyState)).toBeUndefined();
            expect(selectors.getIsDiversionManagerLoading(emptyState)).toBeUndefined();
            expect(selectors.getDiversionEditMode(emptyState)).toBeUndefined();
            expect(selectors.getDiversionResultState(emptyState)).toBeUndefined();
            expect(selectors.getDiversionForEditing(emptyState)).toBeUndefined();
        });
    });

    describe('Disruption-specific Selectors', () => {
        it('should return correct values for existing disruptions', () => {
            const diversionsSelector = selectors.getDiversionsForDisruption('disruption-1');
            const loadingSelector = selectors.getDiversionsLoadingForDisruption('disruption-2');
            const errorSelector = selectors.getDiversionsErrorForDisruption('disruption-2');

            expect(diversionsSelector(mockState)).toEqual([
                { diversionId: 'div-1', name: 'Diversion 1' },
                { diversionId: 'div-2', name: 'Diversion 2' },
            ]);
            expect(loadingSelector(mockState)).toBe(true);
            expect(errorSelector(mockState)).toBe('Error loading diversions');
        });

        it('should return default values for non-existing disruptions', () => {
            const diversionsSelector = selectors.getDiversionsForDisruption('disruption-3');
            const loadingSelector = selectors.getDiversionsLoadingForDisruption('disruption-3');
            const errorSelector = selectors.getDiversionsErrorForDisruption('disruption-3');

            expect(diversionsSelector(mockState)).toEqual([]);
            expect(loadingSelector(mockState)).toBe(false);
            expect(errorSelector(mockState)).toBe(null);
        });

        it('should return default values when diversions state is empty', () => {
            const diversionsSelector = selectors.getDiversionsForDisruption('disruption-1');
            const loadingSelector = selectors.getDiversionsLoadingForDisruption('disruption-1');
            const errorSelector = selectors.getDiversionsErrorForDisruption('disruption-1');

            expect(diversionsSelector(emptyState)).toEqual([]);
            expect(loadingSelector(emptyState)).toBe(false);
            expect(errorSelector(emptyState)).toBe(null);
        });
    });
});
