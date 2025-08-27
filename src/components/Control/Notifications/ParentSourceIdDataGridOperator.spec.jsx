import { shallow } from 'enzyme';
import React from 'react';
import { FormControl, Input } from '@mui/material';
import Box from '@mui/material/Box';
import { ParentSourceIdDataGridOperator } from './ParentSourceIdDataGridOperator';

const ParentSourceIdInputValue = ParentSourceIdDataGridOperator[0].InputComponent;

const componentPropsMock = {
    item: {
        columnField: 'parentSourceId',
        id: 'test-filter-id',
        operatorValue: '==',
        value: 123,
    },
    applyValue: jest.fn(),
    focusElementRef: React.createRef(),
};

const setupComponent = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    return shallow(<ParentSourceIdInputValue { ...props } />);
};

describe('ParentSourceIdDataGridOperator', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Operator structure', () => {
        it('should have correct structure', () => {
            expect(ParentSourceIdDataGridOperator).toHaveLength(1);

            const operator = ParentSourceIdDataGridOperator[0];
            expect(operator.label).toBe('Equals');
            expect(operator.value).toBe('==');
            expect(operator.InputComponent).toBeDefined();
            expect(operator.InputComponentProps).toEqual({ type: 'number' });
            expect(typeof operator.getApplyFilterFn).toBe('function');
        });
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

    describe('ParentSourceIdInputValue Component', () => {
        it('should display the correct input value', () => {
            const wrapper = setupComponent({
                item: { ...componentPropsMock.item, value: 456 },
            });

            const input = wrapper.find(Input);
            expect(input.prop('value')).toBe(456);
            expect(input.prop('type')).toBe('number');
            expect(input.prop('id')).toBe('parentSourceId-input');
        });

        it('should handle empty value correctly', () => {
            const wrapper = setupComponent({
                item: { ...componentPropsMock.item, value: '' },
            });

            const input = wrapper.find(Input);
            expect(input.prop('value')).toBe('');
        });

        it('should handle undefined value correctly', () => {
            const wrapper = setupComponent({
                item: { ...componentPropsMock.item, value: undefined },
            });

            const input = wrapper.find(Input);
            expect(input.prop('value')).toBe('');
        });

        it('should call applyValue when input value changes', () => {
            const mockApplyValue = jest.fn();
            const wrapper = setupComponent({ applyValue: mockApplyValue });

            const input = wrapper.find(Input);
            const mockEvent = { target: { value: '789' } };

            input.prop('onChange')(mockEvent);

            expect(mockApplyValue).toHaveBeenCalledWith({
                ...componentPropsMock.item,
                value: 789,
            });
        });

        it('should convert string input to number when calling applyValue', () => {
            const mockApplyValue = jest.fn();
            const wrapper = setupComponent({ applyValue: mockApplyValue });

            const input = wrapper.find(Input);
            const mockEvent = { target: { value: '123.45' } };

            input.prop('onChange')(mockEvent);

            expect(mockApplyValue).toHaveBeenCalledWith({
                ...componentPropsMock.item,
                value: 123.45,
            });
        });

        it('should handle empty string in onChange', () => {
            const mockApplyValue = jest.fn();
            const wrapper = setupComponent({ applyValue: mockApplyValue });

            const input = wrapper.find(Input);
            const mockEvent = { target: { value: '' } };

            input.prop('onChange')(mockEvent);

            expect(mockApplyValue).toHaveBeenCalledWith({
                ...componentPropsMock.item,
                value: 0,
            });
        });

        it('should apply correct styling to Box component', () => {
            const wrapper = setupComponent();
            const box = wrapper.find(Box);

            const expectedStyles = {
                display: 'inline-flex',
                flexDirection: 'row',
                alignItems: 'center',
                height: 48,
                pl: '20px',
            };

            expect(box.prop('sx')).toEqual(expectedStyles);
        });

        it('should apply correct styling to FormControl', () => {
            const wrapper = setupComponent();
            const formControl = wrapper.find(FormControl);

            expect(formControl.prop('fullWidth')).toBe(true);
            expect(formControl.prop('variant')).toBe('standard');
            expect(formControl.prop('sx')).toEqual({ m: 1 });
        });

        it('should use default focusElementRef when not provided', () => {
            const { focusElementRef, ...propsWithoutRef } = componentPropsMock;
            const wrapper = setupComponent(propsWithoutRef);

            expect(wrapper.find(Input)).toHaveLength(1);
        });
    });

    describe('Integration between operator and component', () => {
        it('should use ParentSourceIdInputValue as InputComponent', () => {
            const operator = ParentSourceIdDataGridOperator[0];
            expect(operator.InputComponent).toBe(ParentSourceIdInputValue);
        });

        it('should work together: component input should affect filter function', () => {
            const operator = ParentSourceIdDataGridOperator[0];

            const mockApplyValue = jest.fn();
            const wrapper = setupComponent({ applyValue: mockApplyValue });

            const input = wrapper.find(Input);
            input.prop('onChange')({ target: { value: '999' } });

            const appliedItem = mockApplyValue.mock.calls[0][0];

            const filterItem = {
                columnField: 'parentSourceId',
                value: { id: appliedItem.value.toString() },
                operatorValue: '==',
            };

            const filterFn = operator.getApplyFilterFn(filterItem);

            expect(filterFn({ row: { disruptionId: 999 } })).toBe(true);
            expect(filterFn({ row: { disruptionId: 123 } })).toBe(false);
        });
    });
});
