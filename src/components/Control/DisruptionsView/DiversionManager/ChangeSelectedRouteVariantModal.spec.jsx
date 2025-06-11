/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import ChangeSelectedRouteVariantModal from './ChangeSelectedRouteVariantModal';

describe('<ChangeSelectedRouteVariantModal />', () => {
    let onConfirmation;
    let onCancel;

    beforeEach(() => {
        onConfirmation = jest.fn();
        onCancel = jest.fn();

        render(
            <ChangeSelectedRouteVariantModal
                onConfirmation={ onConfirmation }
                onCancel={ onCancel }
            />,
        );
    });

    it('renders the description and buttons', () => {
        expect(
            screen.getByText('By selecting another route variant as the base shape, this diversion will be reset.'),
        ).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Confirm')).toBeInTheDocument();
    });

    it('calls onCancel when Cancel button is clicked', () => {
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        expect(onCancel).toHaveBeenCalled();
    });

    it('calls onConfirmation when Confirm button is clicked', () => {
        const confirmButton = screen.getByText('Confirm');
        fireEvent.click(confirmButton);
        expect(onConfirmation).toHaveBeenCalled();
    });
});
