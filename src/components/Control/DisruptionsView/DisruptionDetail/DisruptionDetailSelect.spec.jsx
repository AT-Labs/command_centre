/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { DisruptionDetailSelect } from './DisruptionDetailSelect';

jest.mock('react-icons/io', () => ({
    IoIosArrowDropdown: props => <svg data-testid="dropdown-icon" { ...props } />,
}));

const mockOptions = [
    { label: 'Option A', value: 'A' },
    { label: 'Option B', value: 'B' },
];

describe('DisruptionDetailSelect', () => {
    it('renders label and options correctly', () => {
        render(<DisruptionDetailSelect id="test-id" label="Test Label" options={ mockOptions } />);
        expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
        expect(screen.getByText('Option A')).toBeInTheDocument();
        expect(screen.getByText('Option B')).toBeInTheDocument();
    });

    it('calls onChange with the selected value', () => {
        const handleChange = jest.fn();
        render(
            <DisruptionDetailSelect
                id="test-id"
                label="Label"
                options={ mockOptions }
                onChange={ handleChange }
            />,
        );

        fireEvent.change(screen.getByLabelText('Label'), { target: { value: 'B' } });
        expect(handleChange).toHaveBeenCalledWith('B');
    });

    it('calls onBlur with the current value on blur', () => {
        const handleBlur = jest.fn();
        render(
            <DisruptionDetailSelect
                id="test-id"
                label="Label"
                options={ mockOptions }
                onBlur={ handleBlur }
                value="A"
            />,
        );

        fireEvent.blur(screen.getByLabelText('Label'));
        expect(handleBlur).toHaveBeenCalledWith('A');
    });

    it('shows dropdown icon when input is not invalid', () => {
        render(
            <DisruptionDetailSelect
                id="test-id"
                label="Label"
                options={ mockOptions }
                invalid={ false }
            />,
        );
        expect(screen.getByTestId('dropdown-icon')).toBeInTheDocument();
    });

    it('hides dropdown icon when input is invalid', () => {
        render(
            <DisruptionDetailSelect
                id="test-id"
                label="Label"
                options={ mockOptions }
                invalid
            />,
        );
        expect(screen.queryByTestId('dropdown-icon')).not.toBeInTheDocument();
    });

    it('displays feedback when input is invalid', () => {
        render(
            <DisruptionDetailSelect
                id="test-id"
                label="Label"
                options={ mockOptions }
                invalid
                feedback="This field is required"
            />,
        );

        expect(screen.getByText('This field is required')).toBeInTheDocument();
    });

    it('renders options using value when label is undefined', () => {
        const options = ['One', 'Two'];
        render(<DisruptionDetailSelect id="test-id" label="Label" options={ options } />);

        expect(screen.getByText('One')).toBeInTheDocument();
        expect(screen.getByText('Two')).toBeInTheDocument();
    });

    it('disables the select input when disabled is true', () => {
        render(<DisruptionDetailSelect id="test-id" label="Label" options={ mockOptions } disabled />);
        expect(screen.getByLabelText('Label')).toBeDisabled();
    });
});
