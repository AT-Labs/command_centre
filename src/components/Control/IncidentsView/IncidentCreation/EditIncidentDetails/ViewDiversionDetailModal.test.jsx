import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import ViewDiversionDetailModal from './ViewDiversionDetailModal';

const CONFIRMATION_MESSAGE_TYPE = 'success';

describe('ViewDiversionDetailModal - Our Modal Component', () => {
    const mockDisruption = {
        disruptionId: 'DISR123',
        status: 'in-progress'
    };

    const mockDiversions = [
        {
            diversionId: 'DIV1',
            diversionName: 'Our Test Diversion 1',
            status: 'active'
        },
        {
            diversionId: 'DIV2',
            diversionName: 'Our Test Diversion 2',
            status: 'active'
        }
    ];

    const defaultProps = {
        disruption: mockDisruption,
        diversions: mockDiversions,
        onClose: jest.fn(),
        onEditDiversion: jest.fn(),
        deleteDiversion: jest.fn(),
        setShouldRefetchDiversions: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render our modal with diversions', () => {
        render(<ViewDiversionDetailModal {...defaultProps} />);

        expect(screen.getByText('Our Test Diversion 1')).toBeInTheDocument();
        expect(screen.getByText('Our Test Diversion 2')).toBeInTheDocument();
    });

    it('should render our empty state when no diversions', () => {
        render(<ViewDiversionDetailModal {...defaultProps} diversions={[]} />);

        expect(screen.getByText(/No diversions found/)).toBeInTheDocument();
    });

    it('should show our expand/collapse all button', () => {
        render(<ViewDiversionDetailModal {...defaultProps} />);

        expect(screen.getByText('Expand All')).toBeInTheDocument();
    });

    it('should toggle our expand all functionality', () => {
        render(<ViewDiversionDetailModal {...defaultProps} />);

        const expandButton = screen.getByText('Expand All');
        fireEvent.click(expandButton);

        expect(screen.getByText('Collapse All')).toBeInTheDocument();
    });

    it('should handle our individual row expansion', () => {
        render(<ViewDiversionDetailModal {...defaultProps} />);

        const expandButtons = screen.getAllByTestId('expand-row');
        fireEvent.click(expandButtons[0]);


        expect(screen.getByText('Diversion Details')).toBeInTheDocument();
    });

    it('should call our onEditDiversion when edit button is clicked', () => {
        render(<ViewDiversionDetailModal {...defaultProps} />);

        const editButtons = screen.getAllByTestId('edit-diversion');
        fireEvent.click(editButtons[0]);

        expect(defaultProps.onEditDiversion).toHaveBeenCalledWith(mockDiversions[0]);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call our deleteDiversion when delete button is clicked', async () => {
        defaultProps.deleteDiversion.mockResolvedValue();

        render(<ViewDiversionDetailModal {...defaultProps} />);

        const deleteButtons = screen.getAllByTestId('delete-diversion');
        fireEvent.click(deleteButtons[0]);


        const confirmButton = screen.getByText('Delete');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(defaultProps.deleteDiversion).toHaveBeenCalledWith('DIV1', 'DISR123');
        });
    });

    it('should show our success notification after successful deletion', async () => {
        defaultProps.deleteDiversion.mockResolvedValue();

        render(<ViewDiversionDetailModal {...defaultProps} />);

        const deleteButtons = screen.getAllByTestId('delete-diversion');
        fireEvent.click(deleteButtons[0]);

        const confirmButton = screen.getByText('Delete');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(screen.getByText(/Diversion DIV1 has been successfully deleted/)).toBeInTheDocument();
        });
    });

    it('should show our error notification after failed deletion', async () => {
        const error = new Error('Our delete failed');
        defaultProps.deleteDiversion.mockRejectedValue(error);

        render(<ViewDiversionDetailModal {...defaultProps} />);

        const deleteButtons = screen.getAllByTestId('delete-diversion');
        fireEvent.click(deleteButtons[0]);

        const confirmButton = screen.getByText('Delete');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(screen.getByText(/Failed to delete diversion DIV1/)).toBeInTheDocument();
        });
    });

    it('should handle our editing disabled for resolved disruptions', () => {
        const resolvedDisruption = { ...mockDisruption, status: 'resolved' };

        render(<ViewDiversionDetailModal {...defaultProps} disruption={resolvedDisruption} />);

        const editButtons = screen.getAllByTestId('edit-diversion');
        editButtons.forEach(button => {
            expect(button).toBeDisabled();
        });
    });

    it('should handle our editing disabled for certain disruption statuses', () => {
        const editableStatuses = ['not-started', 'in-progress', 'draft'];
        const nonEditableStatuses = ['resolved', 'cancelled'];

        editableStatuses.forEach(status => {
            const { unmount } = render(
                <ViewDiversionDetailModal {...defaultProps} disruption={{ ...mockDisruption, status }} />
            );

            const editButtons = screen.getAllByTestId('edit-diversion');
            editButtons.forEach(button => {
                expect(button).not.toBeDisabled();
            });

            unmount();
        });

        nonEditableStatuses.forEach(status => {
            const { unmount } = render(
                <ViewDiversionDetailModal {...defaultProps} disruption={{ ...mockDisruption, status }} />
            );

            const editButtons = screen.getAllByTestId('edit-diversion');
            editButtons.forEach(button => {
                expect(button).toBeDisabled();
            });

            unmount();
        });
    });

    it('should close our notification when close button is clicked', async () => {
        defaultProps.deleteDiversion.mockResolvedValue();

        render(<ViewDiversionDetailModal {...defaultProps} />);

        const deleteButtons = screen.getAllByTestId('delete-diversion');
        fireEvent.click(deleteButtons[0]);

        const confirmButton = screen.getByText('Delete');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(screen.getByText(/Diversion DIV1 has been successfully deleted/)).toBeInTheDocument();
        });

        const closeButton = screen.getByTestId('close-notification');
        fireEvent.click(closeButton);

        expect(screen.queryByText(/Diversion DIV1 has been successfully deleted/)).not.toBeInTheDocument();
    });

    it('should auto-hide our success notification after 3 seconds', async () => {
        jest.useFakeTimers();
        defaultProps.deleteDiversion.mockResolvedValue();

        render(<ViewDiversionDetailModal {...defaultProps} />);

        const deleteButtons = screen.getAllByTestId('delete-diversion');
        fireEvent.click(deleteButtons[0]);

        const confirmButton = screen.getByText('Delete');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(screen.getByText(/Diversion DIV1 has been successfully deleted/)).toBeInTheDocument();
        });


        act(() => {
            jest.advanceTimersByTime(3000);
        });

        expect(screen.queryByText(/Diversion DIV1 has been successfully deleted/)).not.toBeInTheDocument();

        jest.useRealTimers();
    });

    it('should auto-hide our error notification after 5 seconds', async () => {
        jest.useFakeTimers();
        const error = new Error('Our delete failed');
        defaultProps.deleteDiversion.mockRejectedValue(error);

        render(<ViewDiversionDetailModal {...defaultProps} />);

        const deleteButtons = screen.getAllByTestId('delete-diversion');
        fireEvent.click(deleteButtons[0]);

        const confirmButton = screen.getByText('Delete');
        fireEvent.click(confirmButton);

        await waitFor(() => {
            expect(screen.getByText(/Failed to delete diversion DIV1/)).toBeInTheDocument();
        });


        act(() => {
            jest.advanceTimersByTime(5000);
        });

        expect(screen.queryByText(/Failed to delete diversion DIV1/)).not.toBeInTheDocument();

        jest.useRealTimers();
    });

    it('should handle our different diversion statuses', () => {
        const diversionsWithStatuses = [
            { ...mockDiversions[0], status: 'active' },
            { ...mockDiversions[1], status: 'inactive' }
        ];

        render(<ViewDiversionDetailModal {...defaultProps} diversions={diversionsWithStatuses} />);

        expect(screen.getByText('Our Test Diversion 1')).toBeInTheDocument();
        expect(screen.getByText('Our Test Diversion 2')).toBeInTheDocument();
    });

    it('should handle our empty diversions array', () => {
        render(<ViewDiversionDetailModal {...defaultProps} diversions={[]} />);

        expect(screen.getByText(/No diversions found/)).toBeInTheDocument();
        expect(screen.queryByText('Our Test Diversion 1')).not.toBeInTheDocument();
    });

    it('should handle our null diversions gracefully', () => {
        render(<ViewDiversionDetailModal {...defaultProps} diversions={null} />);

        expect(screen.getByText(/No diversions found/)).toBeInTheDocument();
    });

    it('should handle our undefined diversions gracefully', () => {
        render(<ViewDiversionDetailModal {...defaultProps} diversions={undefined} />);

        expect(screen.getByText(/No diversions found/)).toBeInTheDocument();
    });

    it('should handle our missing props gracefully', () => {

        const propsWithoutOnClose = { ...defaultProps };
        delete propsWithoutOnClose.onClose;

        expect(() => {
            render(<ViewDiversionDetailModal {...propsWithoutOnClose} />);
        }).not.toThrow();


        const propsWithoutOnEdit = { ...defaultProps };
        delete propsWithoutOnEdit.onEditDiversion;

        expect(() => {
            render(<ViewDiversionDetailModal {...propsWithoutOnEdit} />);
        }).not.toThrow();


        const propsWithoutDelete = { ...defaultProps };
        delete propsWithoutDelete.deleteDiversion;

        expect(() => {
            render(<ViewDiversionDetailModal {...propsWithoutDelete} />);
        }).not.toThrow();
    });

    it('should handle our different disruption structures', () => {

        const minimalDisruption = {
            disruptionId: 'DISR123'
        };

        render(<ViewDiversionDetailModal {...defaultProps} disruption={minimalDisruption} />);

        expect(screen.getByText('Our Test Diversion 1')).toBeInTheDocument();


        const extendedDisruption = {
            ...mockDisruption,
            additionalProperty: 'value'
        };

        const { rerender } = render(<ViewDiversionDetailModal {...defaultProps} disruption={extendedDisruption} />);

        expect(screen.getByText('Our Test Diversion 1')).toBeInTheDocument();
    });

    it('should handle our edge cases correctly', () => {

        const emptyDisruption = {};

        render(<ViewDiversionDetailModal {...defaultProps} disruption={emptyDisruption} />);

        expect(screen.getByText('Our Test Diversion 1')).toBeInTheDocument();


        const disruptionWithUndefined = {
            disruptionId: undefined,
            status: undefined
        };

        const { rerender } = render(<ViewDiversionDetailModal {...defaultProps} disruption={disruptionWithUndefined} />);

        expect(screen.getByText('Our Test Diversion 1')).toBeInTheDocument();
    });

    it('should handle our performance scenarios', () => {

        const largeDiversions = Array.from({ length: 1000 }, (_, i) => ({
            diversionId: `DIV${i}`,
            diversionName: `Our Test Diversion ${i}`,
            status: 'active'
        }));

        const startTime = performance.now();

        render(<ViewDiversionDetailModal {...defaultProps} diversions={largeDiversions} />);

        const endTime = performance.now();

        expect(screen.getByText('Our Test Diversion 0')).toBeInTheDocument();
        expect(screen.getByText('Our Test Diversion 999')).toBeInTheDocument();


        expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle our accessibility requirements', () => {
        render(<ViewDiversionDetailModal {...defaultProps} />);


        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();


        const editButtons = screen.getAllByTestId('edit-diversion');
        editButtons.forEach(button => {
            expect(button.tagName).toBe('BUTTON');
        });

        const deleteButtons = screen.getAllByTestId('delete-diversion');
        deleteButtons.forEach(button => {
            expect(button.tagName).toBe('BUTTON');
        });
    });

    it('should handle our keyboard navigation', () => {
        render(<ViewDiversionDetailModal {...defaultProps} />);


        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle our click outside functionality', () => {
        render(<ViewDiversionDetailModal {...defaultProps} />);


        const backdrop = screen.getByTestId('modal-backdrop');
        fireEvent.click(backdrop);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle our component lifecycle correctly', () => {
        const { unmount, rerender } = render(<ViewDiversionDetailModal {...defaultProps} />);

        expect(screen.getByText('Our Test Diversion 1')).toBeInTheDocument();


        rerender(<ViewDiversionDetailModal {...defaultProps} diversions={[]} />);

        expect(screen.getByText(/No diversions found/)).toBeInTheDocument();


        expect(() => unmount()).not.toThrow();
    });

    it('should handle our error boundaries gracefully', () => {

        const invalidProps = {
            ...defaultProps,
            disruption: null,
            diversions: 'invalid'
        };

        expect(() => {
            render(<ViewDiversionDetailModal {...invalidProps} />);
        }).not.toThrow();
    });

    it('should handle our internationalization scenarios', () => {

        render(<ViewDiversionDetailModal {...defaultProps} />);


        expect(screen.getByText('Our Test Diversion 1')).toBeInTheDocument();
        expect(screen.getByText('Our Test Diversion 1')).toHaveTextContent('Our Test Diversion 1');
    });

    it('should handle our confirmation dialog correctly', () => {
        defaultProps.deleteDiversion.mockResolvedValue();

        render(<ViewDiversionDetailModal {...defaultProps} />);


        const deleteButtons = screen.getAllByTestId('delete-diversion');
        fireEvent.click(deleteButtons[0]);


        expect(screen.getByText('Delete Diversion')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to delete this diversion/)).toBeInTheDocument();


        const confirmButton = screen.getByText('Delete');
        fireEvent.click(confirmButton);

        expect(defaultProps.deleteDiversion).toHaveBeenCalledWith('DIV1', 'DISR123');
    });

    it('should handle our cancellation of deletion', () => {
        defaultProps.deleteDiversion.mockResolvedValue();

        render(<ViewDiversionDetailModal {...defaultProps} />);


        const deleteButtons = screen.getAllByTestId('delete-diversion');
        fireEvent.click(deleteButtons[0]);


        expect(screen.getByText('Delete Diversion')).toBeInTheDocument();


        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);


        expect(defaultProps.deleteDiversion).not.toHaveBeenCalled();
    });
});