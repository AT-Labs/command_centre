import { ParentSourceIdDataGridOperator } from './ParentSourceIdDataGridOperator';

describe('ParentSourceIdDataGridOperator', () => {
    it('should have correct structure', () => {
        expect(ParentSourceIdDataGridOperator).toHaveLength(1);

        const operator = ParentSourceIdDataGridOperator[0];
        expect(operator.label).toBe('Equals');
        expect(operator.value).toBe('==');
        expect(operator.InputComponent).toBeDefined();
        expect(operator.InputComponentProps).toEqual({ type: 'number' });
        expect(typeof operator.getApplyFilterFn).toBe('function');
    });

    describe('getApplyFilterFn', () => {
        const operator = ParentSourceIdDataGridOperator[0];

        it('should return null when filterItem.columnField is missing', () => {
            const filterItem = {
                value: { id: '123' },
                operatorValue: '==',
            };

            const result = operator.getApplyFilterFn(filterItem);
            expect(result).toBeNull();
        });

        it('should return null when filterItem.value is missing', () => {
            const filterItem = {
                columnField: 'parentSourceId',
                operatorValue: '==',
            };

            const result = operator.getApplyFilterFn(filterItem);
            expect(result).toBeNull();
        });

        it('should return null when filterItem.operatorValue is missing', () => {
            const filterItem = {
                columnField: 'parentSourceId',
                value: { id: '123' },
            };

            const result = operator.getApplyFilterFn(filterItem);
            expect(result).toBeNull();
        });

        it('should return filter function when all required fields are present', () => {
            const filterItem = {
                columnField: 'parentSourceId',
                value: { id: '123' },
                operatorValue: '==',
            };

            const filterFn = operator.getApplyFilterFn(filterItem);
            expect(typeof filterFn).toBe('function');
        });

        describe('filter function behavior', () => {
            const filterItem = {
                columnField: 'parentSourceId',
                value: { id: '123' },
                operatorValue: '==',
            };

            const filterFn = operator.getApplyFilterFn(filterItem);

            it('should return true when disruptionId matches the filter value', () => {
                const params = {
                    row: { disruptionId: 123 },
                };

                expect(filterFn(params)).toBe(true);
            });

            it('should return false when disruptionId does not match the filter value', () => {
                const params = {
                    row: { disruptionId: 456 },
                };

                expect(filterFn(params)).toBe(false);
            });

            it('should handle string id values correctly', () => {
                const filterItemWithStringId = {
                    columnField: 'parentSourceId',
                    value: { id: '789' },
                    operatorValue: '==',
                };

                const filterFnWithString = operator.getApplyFilterFn(filterItemWithStringId);
                const params = {
                    row: { disruptionId: 789 },
                };

                expect(filterFnWithString(params)).toBe(true);
            });

            it('should return false when disruptionId is not a number', () => {
                const params = {
                    row: { disruptionId: 'invalid' },
                };

                expect(filterFn(params)).toBe(false);
            });

            it('should return false when disruptionId is undefined', () => {
                const params = {
                    row: {},
                };

                expect(filterFn(params)).toBe(false);
            });
        });
    });
});
