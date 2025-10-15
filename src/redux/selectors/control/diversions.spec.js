import * as selectors from './diversions';

describe('Diversions Selectors', () => {
    const mockState = {
        control: {
            diversions: {
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
            expect(selectors.getIsDiversionManagerOpen(mockState)).toBe(true);
            expect(selectors.getIsDiversionManagerLoading(mockState)).toBe(false);
            expect(selectors.getDiversionEditMode(mockState)).toBe('create');
            expect(selectors.getDiversionResultState(mockState)).toBe('success');
            expect(selectors.getDiversionForEditing(mockState)).toEqual({ diversionId: 'div-1', name: 'Test Diversion' });
        });

        it('should return undefined when diversions state is empty', () => {
            expect(selectors.getIsDiversionManagerOpen(emptyState)).toBeUndefined();
            expect(selectors.getIsDiversionManagerLoading(emptyState)).toBeUndefined();
            expect(selectors.getDiversionEditMode(emptyState)).toBeUndefined();
            expect(selectors.getDiversionResultState(emptyState)).toBeUndefined();
            expect(selectors.getDiversionForEditing(emptyState)).toBeUndefined();
        });
    });
});
