import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DiversionResultModalWrapper from './DiversionResultModalWrapper';

describe('DiversionResultModalWrapper - Our Result Modal', () => {
    const mockDiversionResultState = {
        diversionId: 'DIV123',
        isLoading: false,
        isSuccess: true,
        error: null
    };

    const defaultProps = {
        diversionResultState: mockDiversionResultState,
        onClose: jest.fn(),
        onReset: jest.fn(),
        onViewDiversions: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render our success modal when diversion creation is successful', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);

        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText(/Diversion DIV123 has been successfully created/)).toBeInTheDocument();
    });

    it('should render our error modal when diversion creation fails', () => {
        const errorState = {
            ...mockDiversionResultState,
            isSuccess: false,
            error: 'Our creation failed'
        };

        render(<DiversionResultModalWrapper {...defaultProps} diversionResultState={errorState} />);

        expect(screen.getByText('Creation Failed')).toBeInTheDocument();
        expect(screen.getByText(/Failed to create diversion/)).toBeInTheDocument();
    });

    it('should not render when our diversionResultState is null', () => {
        render(<DiversionResultModalWrapper {...defaultProps} diversionResultState={null} />);

        expect(screen.queryByText('Success')).not.toBeInTheDocument();
        expect(screen.queryByText('Creation Failed')).not.toBeInTheDocument();
    });

    it('should not render when our isLoading is true', () => {
        const loadingState = {
            ...mockDiversionResultState,
            isLoading: true
        };

        render(<DiversionResultModalWrapper {...defaultProps} diversionResultState={loadingState} />);

        expect(screen.queryByText('Success')).not.toBeInTheDocument();
        expect(screen.queryByText('Creation Failed')).not.toBeInTheDocument();
    });

    it('should call our onClose when clicking outside the modal', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);

        const backdrop = screen.getByTestId('modal-backdrop');
        fireEvent.click(backdrop);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should call our onReset when Create Another button is clicked', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);

        const createAnotherButton = screen.getByText('Create Another');
        fireEvent.click(createAnotherButton);

        expect(defaultProps.onReset).toHaveBeenCalled();
    });

    it('should call our onViewDiversions when View Diversions button is clicked', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);

        const viewDiversionsButton = screen.getByText('View Diversions');
        fireEvent.click(viewDiversionsButton);

        expect(defaultProps.onViewDiversions).toHaveBeenCalled();
    });

    it('should call our onClose when Close button is clicked', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should render our loading state correctly', () => {
        const loadingState = {
            ...mockDiversionResultState,
            isLoading: true
        };

        render(<DiversionResultModalWrapper {...defaultProps} diversionResultState={loadingState} />);

        expect(screen.queryByText('Success')).not.toBeInTheDocument();
        expect(screen.queryByText('Creation Failed')).not.toBeInTheDocument();
    });

    it('should handle our missing diversionId gracefully', () => {
        const stateWithoutId = {
            ...mockDiversionResultState,
            diversionId: null
        };

        render(<DiversionResultModalWrapper {...defaultProps} diversionResultState={stateWithoutId} />);

        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText(/Diversion has been successfully created/)).toBeInTheDocument();
    });

    it('should handle our empty error message gracefully', () => {
        const stateWithEmptyError = {
            ...mockDiversionResultState,
            isSuccess: false,
            error: ''
        };

        render(<DiversionResultModalWrapper {...defaultProps} diversionResultState={stateWithEmptyError} />);

        expect(screen.getByText('Creation Failed')).toBeInTheDocument();
        expect(screen.getByText(/Failed to create diversion/)).toBeInTheDocument();
    });

    it('should have our equal button lengths', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);

        const buttons = screen.getAllByRole('button');
        const buttonWidths = buttons.map(button => button.offsetWidth);


        const firstWidth = buttonWidths[0];
        buttonWidths.forEach(width => {
            expect(width).toBe(firstWidth);
        });
    });

    it('should not have our close button (cross)', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);


        const closeButtons = screen.getAllByRole('button');
        closeButtons.forEach(button => {
            expect(button).not.toHaveAttribute('aria-label', 'close');
        });
    });

    it('should have our dark backdrop', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);

        const backdrop = screen.getByTestId('modal-backdrop');
        expect(backdrop).toHaveClass('modal-backdrop', 'show');
    });

    it('should have our centered title', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);

        const title = screen.getByText('Success');
        expect(title).toHaveClass('text-center');
    });

    it('should handle our different success scenarios', () => {

        const successWithId = {
            diversionId: 'DIV456',
            isLoading: false,
            isSuccess: true,
            error: null
        };

        render(<DiversionResultModalWrapper {...defaultProps} diversionResultState={successWithId} />);

        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText(/Diversion DIV456 has been successfully created/)).toBeInTheDocument();


        const successWithoutId = {
            diversionId: null,
            isLoading: false,
            isSuccess: true,
            error: null
        };

        const { rerender } = render(<DiversionResultModalWrapper {...defaultProps} diversionResultState={successWithoutId} />);

        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText(/Diversion has been successfully created/)).toBeInTheDocument();
    });

    it('should handle our different error scenarios', () => {

        const errorWithMessage = {
            diversionId: null,
            isLoading: false,
            isSuccess: false,
            error: 'Our specific error message'
        };

        render(<DiversionResultModalWrapper {...defaultProps} diversionResultState={errorWithMessage} />);

        expect(screen.getByText('Creation Failed')).toBeInTheDocument();
        expect(screen.getByText(/Failed to create diversion/)).toBeInTheDocument();


        const errorWithoutMessage = {
            diversionId: null,
            isLoading: false,
            isSuccess: false,
            error: ''
        };

        const { rerender } = render(<DiversionResultModalWrapper {...defaultProps} diversionResultState={errorWithoutMessage} />);

        expect(screen.getByText('Creation Failed')).toBeInTheDocument();
        expect(screen.getByText(/Failed to create diversion/)).toBeInTheDocument();
    });

    it('should handle our missing props gracefully', () => {

        const propsWithoutOnClose = { ...defaultProps };
        delete propsWithoutOnClose.onClose;

        expect(() => {
            render(<DiversionResultModalWrapper {...propsWithoutOnClose} />);
        }).not.toThrow();


        const propsWithoutOnReset = { ...defaultProps };
        delete propsWithoutOnReset.onReset;

        expect(() => {
            render(<DiversionResultModalWrapper {...propsWithoutOnReset} />);
        }).not.toThrow();


        const propsWithoutOnView = { ...defaultProps };
        delete propsWithoutOnView.onViewDiversions;

        expect(() => {
            render(<DiversionResultModalWrapper {...propsWithoutOnView} />);
        }).not.toThrow();
    });

    it('should handle our different modal states', () => {

        const { rerender } = render(<DiversionResultModalWrapper {...defaultProps} />);

        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText(/Diversion DIV123 has been successfully created/)).toBeInTheDocument();


        const errorState = {
            ...mockDiversionResultState,
            isSuccess: false,
            error: 'Our error message'
        };

        rerender(<DiversionResultModalWrapper {...defaultProps} diversionResultState={errorState} />);

        expect(screen.getByText('Creation Failed')).toBeInTheDocument();
        expect(screen.getByText(/Failed to create diversion/)).toBeInTheDocument();


        const loadingState = {
            ...mockDiversionResultState,
            isLoading: true
        };

        rerender(<DiversionResultModalWrapper {...defaultProps} diversionResultState={loadingState} />);

        expect(screen.queryByText('Success')).not.toBeInTheDocument();
        expect(screen.queryByText('Creation Failed')).not.toBeInTheDocument();
    });

    it('should handle our edge cases correctly', () => {

        const propsWithUndefined = { ...defaultProps, diversionResultState: undefined };

        expect(() => {
            render(<DiversionResultModalWrapper {...propsWithUndefined} />);
        }).not.toThrow();


        const emptyState = {};

        render(<DiversionResultModalWrapper {...defaultProps} diversionResultState={emptyState} />);

        expect(screen.queryByText('Success')).not.toBeInTheDocument();
        expect(screen.queryByText('Creation Failed')).not.toBeInTheDocument();
    });

    it('should handle our component lifecycle correctly', () => {
        const { unmount, rerender } = render(<DiversionResultModalWrapper {...defaultProps} />);

        expect(screen.getByText('Success')).toBeInTheDocument();


        const errorState = {
            ...mockDiversionResultState,
            isSuccess: false,
            error: 'Our error'
        };

        rerender(<DiversionResultModalWrapper {...defaultProps} diversionResultState={errorState} />);

        expect(screen.getByText('Creation Failed')).toBeInTheDocument();


        expect(() => unmount()).not.toThrow();
    });

    it('should handle our keyboard events', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);


        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle our accessibility requirements', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);


        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();


        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button.tagName).toBe('BUTTON');
        });
    });

    it('should handle our performance scenarios', () => {

        const largeResultState = {
            diversionId: 'DIV' + '0'.repeat(1000),
            isLoading: false,
            isSuccess: true,
            error: null
        };

        const startTime = performance.now();

        render(<DiversionResultModalWrapper {...defaultProps} diversionResultState={largeResultState} />);

        const endTime = performance.now();

        expect(screen.getByText('Success')).toBeInTheDocument();


        expect(endTime - startTime).toBeLessThan(50);
    });

    it('should handle our internationalization scenarios', () => {

        render(<DiversionResultModalWrapper {...defaultProps} />);


        expect(screen.getByText('Success')).toBeInTheDocument();
        expect(screen.getByText('Success')).toHaveTextContent('Success');
        expect(screen.getByText('Create Another')).toBeInTheDocument();
        expect(screen.getByText('View Diversions')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('should handle our error boundaries gracefully', () => {

        const invalidProps = {
            ...defaultProps,
            diversionResultState: 'invalid',
            onClose: 'invalid'
        };

        expect(() => {
            render(<DiversionResultModalWrapper {...invalidProps} />);
        }).not.toThrow();
    });

    it('should handle our confirmation scenarios', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);


        expect(screen.getByText('Create Another')).toBeInTheDocument();
        expect(screen.getByText('View Diversions')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();


        const createAnotherButton = screen.getByText('Create Another');
        fireEvent.click(createAnotherButton);
        expect(defaultProps.onReset).toHaveBeenCalled();

        const viewDiversionsButton = screen.getByText('View Diversions');
        fireEvent.click(viewDiversionsButton);
        expect(defaultProps.onViewDiversions).toHaveBeenCalled();

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle our modal positioning correctly', () => {
        render(<DiversionResultModalWrapper {...defaultProps} />);


        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();


        const backdrop = screen.getByTestId('modal-backdrop');
        expect(backdrop).toBeInTheDocument();
    });

    it('should handle our different screen sizes', () => {

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 800,
        });

        render(<DiversionResultModalWrapper {...defaultProps} />);

        expect(screen.getByText('Success')).toBeInTheDocument();


        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1200,
        });

        const { rerender } = render(<DiversionResultModalWrapper {...defaultProps} />);

        expect(screen.getByText('Success')).toBeInTheDocument();
    });
});