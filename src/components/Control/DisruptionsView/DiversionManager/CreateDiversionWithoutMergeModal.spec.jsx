/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import CreateDiversionWithoutMergeModal from './CreateDiversionWithoutMergeModal';

describe('<CreateDiversionWithoutMergeModal />', () => {
    let onConfirmation;
    let onCancel;
    const description = 'The automatic generated detour has not been saved.'
    + ' To save the auto-generated detour please click "Apply auto-generation" in the map before proceeding with diversion creation or modification.'
    + ' Do you wish to create or update the diversion and discard the automatic generated detour?';

    beforeEach(() => {
        onConfirmation = jest.fn();
        onCancel = jest.fn();

        render(
            <CreateDiversionWithoutMergeModal
                onConfirmation={ onConfirmation }
                onCancel={ onCancel }
            />,
        );
    });

    it('renders the description and buttons', () => {
        expect(
            screen.getByText(description),
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
