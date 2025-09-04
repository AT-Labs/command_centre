/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import DiversionResultModal, { ACTION_TYPE } from './DiversionResultModal';

describe('<DiversionResultModal />', () => {
    let onAction;

    beforeEach(() => {
        onAction = jest.fn();
    });

    it('renders result and no error, shows disruption and new diversion buttons', () => {
        render(
            <DiversionResultModal
                result="Diversion #123 has been added."
                error=""
                showNewDiversionButton
                onAction={ onAction }
            />,
        );
        expect(screen.getByText('Diversion #123 has been added.')).toBeInTheDocument();
        expect(screen.getByText('Go back to disruption page')).toBeInTheDocument();
        expect(screen.getByText('Add new diversion')).toBeInTheDocument();
    });

    it('renders error and shows only Return button', () => {
        render(
            <DiversionResultModal
                result=""
                error="Something went wrong"
                showNewDiversionButton
                onAction={ onAction }
            />,
        );
        expect(screen.getByText('Something went wrong')).toBeInTheDocument();
        expect(screen.getByText('Return')).toBeInTheDocument();
        expect(screen.queryByText('Go back to disruption page')).not.toBeInTheDocument();
        expect(screen.queryByText('Add new diversion')).not.toBeInTheDocument();
    });

    it('calls onAction with RETURN_TO_DISRUPTION when Go back button is clicked', () => {
        render(
            <DiversionResultModal
                result="Done"
                error=""
                showNewDiversionButton
                onAction={ onAction }
            />,
        );
        const goBackBtn = screen.getByRole('button', { name: 'Go back to disruption page' });
        fireEvent.click(goBackBtn);
        expect(onAction).toHaveBeenCalledWith(ACTION_TYPE.RETURN_TO_DISRUPTION);
    });

    it('calls onAction with NEW_DIVERSION when Add new diversion is clicked', () => {
        render(
            <DiversionResultModal
                result="Done"
                error=""
                showNewDiversionButton
                onAction={ onAction }
            />,
        );
        const addBtn = screen.getByRole('button', { name: 'Add new diversion' });
        fireEvent.click(addBtn);
        expect(onAction).toHaveBeenCalledWith(ACTION_TYPE.NEW_DIVERSION);
    });

    it('calls onAction with RETURN_TO_DIVERSION when Return is clicked (error case)', () => {
        render(
            <DiversionResultModal
                result=""
                error="Error!"
                showNewDiversionButton
                onAction={ onAction }
            />,
        );
        const returnBtn = screen.getByRole('button', { name: 'Return' });
        fireEvent.click(returnBtn);
        expect(onAction).toHaveBeenCalledWith(ACTION_TYPE.RETURN_TO_DIVERSION);
    });

    it('does not show Add new diversion button if showNewDiversionButton is false', () => {
        render(
            <DiversionResultModal
                result="Done"
                error=""
                showNewDiversionButton={ false }
                onAction={ onAction }
            />,
        );
        expect(screen.queryByText('Add new diversion')).not.toBeInTheDocument();
    });
});
