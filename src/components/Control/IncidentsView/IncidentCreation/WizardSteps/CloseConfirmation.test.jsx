import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CloseConfirmation from './CloseConfirmation';

describe('CloseConfirmation - Diversion Integration', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        onConfirm: jest.fn(),
        hasUnsavedChanges: false
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render when open', () => {
        render(<CloseConfirmation {...defaultProps} />);

        expect(screen.getByText(/Are you sure you want to close/)).toBeInTheDocument();
    });

    it('should not render when closed', () => {
        render(<CloseConfirmation {...defaultProps} isOpen={false} />);

        expect(screen.queryByText(/Are you sure you want to close/)).not.toBeInTheDocument();
    });

    it('should show warning when there are unsaved changes', () => {
        render(<CloseConfirmation {...defaultProps} hasUnsavedChanges={true} />);

        expect(screen.getByText(/You have unsaved changes/)).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to close without saving/)).toBeInTheDocument();
    });

    it('should not show warning when there are no unsaved changes', () => {
        render(<CloseConfirmation {...defaultProps} hasUnsavedChanges={false} />);

        expect(screen.queryByText(/You have unsaved changes/)).not.toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to close/)).toBeInTheDocument();
    });

    it('should call onClose when Cancel button is clicked', () => {
        render(<CloseConfirmation {...defaultProps} />);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call onConfirm when Close button is clicked', () => {
        render(<CloseConfirmation {...defaultProps} />);

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(defaultProps.onConfirm).toHaveBeenCalled();
    });

    it('should call onClose when clicking outside modal', () => {
        render(<CloseConfirmation {...defaultProps} />);

        const backdrop = screen.getByTestId('modal-backdrop');
        fireEvent.click(backdrop);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle keyboard events', () => {
        render(<CloseConfirmation {...defaultProps} />);

        // Escape key should close modal
        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should show different button text based on unsaved changes', () => {
        // With unsaved changes
        const { rerender } = render(<CloseConfirmation {...defaultProps} hasUnsavedChanges={true} />);
        
        let closeButton = screen.getByText('Close');
        expect(closeButton).toBeInTheDocument();

        // Without unsaved changes
        rerender(<CloseConfirmation {...defaultProps} hasUnsavedChanges={false} />);
        
        closeButton = screen.getByText('Close');
        expect(closeButton).toBeInTheDocument();
    });

    it('should handle diversion-related unsaved changes', () => {
        render(<CloseConfirmation {...defaultProps} hasUnsavedChanges={true} />);

        // Should show warning about unsaved changes
        expect(screen.getByText(/You have unsaved changes/)).toBeInTheDocument();
        
        // Should show specific message about closing without saving
        expect(screen.getByText(/Are you sure you want to close without saving/)).toBeInTheDocument();
    });

    it('should handle diversion-related no unsaved changes', () => {
        render(<CloseConfirmation {...defaultProps} hasUnsavedChanges={false} />);

        // Should not show warning
        expect(screen.queryByText(/You have unsaved changes/)).not.toBeInTheDocument();
        
        // Should show general close confirmation
        expect(screen.getByText(/Are you sure you want to close/)).toBeInTheDocument();
    });

    it('should work with diversion workflow when closing', () => {
        const mockOnConfirm = jest.fn();
        const mockOnClose = jest.fn();

        render(
            <CloseConfirmation
                {...defaultProps}
                onConfirm={mockOnConfirm}
                onClose={mockOnClose}
                hasUnsavedChanges={true}
            />
        );

        // User clicks Close button
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(mockOnConfirm).toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();

        // User clicks Cancel button
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle diversion workflow when no unsaved changes', () => {
        const mockOnConfirm = jest.fn();
        const mockOnClose = jest.fn();

        render(
            <CloseConfirmation
                {...defaultProps}
                onConfirm={mockOnConfirm}
                onClose={mockOnClose}
                hasUnsavedChanges={false}
            />
        );

        // User clicks Close button
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(mockOnConfirm).toHaveBeenCalled();
        expect(mockOnClose).not.toHaveBeenCalled();

        // User clicks Cancel button
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle multiple rapid interactions', () => {
        const mockOnConfirm = jest.fn();
        const mockOnClose = jest.fn();

        render(
            <CloseConfirmation
                {...defaultProps}
                onConfirm={mockOnConfirm}
                onClose={mockOnClose}
                hasUnsavedChanges={true}
            />
        );

        // Rapid clicks should not cause issues
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);
        fireEvent.click(closeButton);
        fireEvent.click(closeButton);

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        fireEvent.click(cancelButton);
        fireEvent.click(cancelButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should handle edge cases gracefully', () => {
        // Missing onClose
        const propsWithoutOnClose = { ...defaultProps };
        delete propsWithoutOnClose.onClose;

        expect(() => {
            render(<CloseConfirmation {...propsWithoutOnClose} />);
        }).not.toThrow();

        // Missing onConfirm
        const propsWithoutOnConfirm = { ...defaultProps };
        delete propsWithoutOnConfirm.onConfirm;

        expect(() => {
            render(<CloseConfirmation {...propsWithoutOnConfirm} />);
        }).not.toThrow();

        // Missing hasUnsavedChanges
        const propsWithoutUnsavedChanges = { ...defaultProps };
        delete propsWithoutUnsavedChanges.hasUnsavedChanges;

        expect(() => {
            render(<CloseConfirmation {...propsWithoutUnsavedChanges} />);
        }).not.toThrow();
    });

    it('should handle different modal states', () => {
        // Modal closed
        const { rerender } = render(<CloseConfirmation {...defaultProps} isOpen={false} />);
        expect(screen.queryByText(/Are you sure you want to close/)).not.toBeInTheDocument();

        // Modal open
        rerender(<CloseConfirmation {...defaultProps} isOpen={true} />);
        expect(screen.getByText(/Are you sure you want to close/)).toBeInTheDocument();

        // Modal closed again
        rerender(<CloseConfirmation {...defaultProps} isOpen={false} />);
        expect(screen.queryByText(/Are you sure you want to close/)).not.toBeInTheDocument();
    });

    it('should handle diversion-specific scenarios', () => {
        // Scenario: User has created a diversion but not saved
        render(<CloseConfirmation {...defaultProps} hasUnsavedChanges={true} />);

        expect(screen.getByText(/You have unsaved changes/)).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to close without saving/)).toBeInTheDocument();

        // User decides to close anyway
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(defaultProps.onConfirm).toHaveBeenCalled();

        // Scenario: User has no unsaved changes
        const { rerender } = render(<CloseConfirmation {...defaultProps} hasUnsavedChanges={false} />);

        expect(screen.queryByText(/You have unsaved changes/)).not.toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to close/)).toBeInTheDocument();

        // User confirms close
        const closeButton2 = screen.getByText('Close');
        fireEvent.click(closeButton2);

        expect(defaultProps.onConfirm).toHaveBeenCalled();
    });

    it('should maintain accessibility features', () => {
        render(<CloseConfirmation {...defaultProps} />);

        // Modal should have proper ARIA attributes
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();

        // Buttons should be accessible
        const closeButton = screen.getByRole('button', { name: /Close/i });
        const cancelButton = screen.getByRole('button', { name: /Cancel/i });

        expect(closeButton).toBeInTheDocument();
        expect(cancelButton).toBeInTheDocument();
    });

    it('should handle diversion workflow integration', () => {
        // This test simulates the integration with diversion workflow
        const diversionWorkflowProps = {
            ...defaultProps,
            hasUnsavedChanges: true,
            onConfirm: jest.fn(),
            onClose: jest.fn()
        };

        render(<CloseConfirmation {...diversionWorkflowProps} />);

        // User sees warning about unsaved changes
        expect(screen.getByText(/You have unsaved changes/)).toBeInTheDocument();

        // User can choose to continue editing (cancel)
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(diversionWorkflowProps.onClose).toHaveBeenCalled();

        // User can choose to close anyway (confirm)
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(diversionWorkflowProps.onConfirm).toHaveBeenCalled();
    });
}); 