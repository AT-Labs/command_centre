/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import moment from 'moment';
import FilterByDate from './FilterByDate';
import '@testing-library/jest-dom';

describe('FilterByDate', () => {
    it('renders with label', () => {
        render(<FilterByDate label="Start Date" onChange={ jest.fn() } />);
        expect(screen.getByText('Start Date')).toBeInTheDocument();
    });

    it('calls onChange when a date is selected', async () => {
        const handleChange = jest.fn();
        render(<FilterByDate onChange={ handleChange } />);
        const input = screen.getByPlaceholderText('Select date');
        fireEvent.focus(input);

        const dateButton = await screen.findByLabelText(moment().subtract(3, 'days').format('MMMM D, YYYY'));
        fireEvent.click(dateButton);

        expect(handleChange).toHaveBeenCalledTimes(1);
        expect(handleChange.mock.calls[0][0][0]).toBeInstanceOf(Date);
    });

    it('shows clear button when a date is selected', () => {
        render(<FilterByDate selectedDate={ new Date() } onChange={ jest.fn() } />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('clears date when clear button is clicked', () => {
        const handleChange = jest.fn();
        render(<FilterByDate selectedDate={ new Date() } onChange={ handleChange } />);
        const clearButton = screen.getByRole('button');
        fireEvent.click(clearButton);
        expect(handleChange).toHaveBeenCalledWith(null);
    });

    it('renders without crashing when no props are passed (using defaults)', () => {
        render(<FilterByDate onChange={ jest.fn() } />);
        expect(screen.getByPlaceholderText('Select date')).toBeInTheDocument();
    });
});
