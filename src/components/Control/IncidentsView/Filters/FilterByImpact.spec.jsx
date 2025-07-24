/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FilterByImpact from './FilterByImpact';
import '@testing-library/jest-dom';
import * as alertEffectHook from '../../../../utils/control/alert-cause-effect';

jest.mock('../../../../utils/control/alert-cause-effect', () => ({
    useAlertCauses: jest.fn(),
    useAlertEffects: jest.fn(),
}));

describe('FilterByImpact', () => {
    const mockImpacts = [
        { value: 'HIGH', label: 'High Impact' },
        { value: 'LOW', label: 'Low Impact' },
    ];

    beforeEach(() => {
        alertEffectHook.useAlertEffects.mockReturnValue(mockImpacts);
    });

    it('renders with placeholder and no selection', () => {
        render(
            <FilterByImpact
                placeholder="Select option"
            />,
        );

        expect(screen.getByPlaceholderText('Select option')).toBeInTheDocument();
    });

    it('renders with selected option label when selectedOption is provided', () => {
        const mockOnSelection = jest.fn();

        render(
            <FilterByImpact
                onSelection={ mockOnSelection }
                selectedOption="HIGH"
            />,
        );

        expect(screen.getByDisplayValue('High Impact')).toBeInTheDocument();
    });

    it('calls onSelection when option is selected', async () => {
        const mockOnSelection = jest.fn();
        render(
            <FilterByImpact
                onSelection={ mockOnSelection }
            />,
        );

        const input = screen.getByPlaceholderText('Select option');
        expect(input).toBeInTheDocument();

        input.focus();
        fireEvent.change(input, { target: { value: 'Low Impact' } });

        const option = await screen.findByText('Low Impact');
        fireEvent.click(option);

        expect(mockOnSelection).toHaveBeenCalledWith({ value: 'LOW', label: 'Low Impact' });
    });
});
