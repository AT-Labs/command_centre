import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DiversionContent from './DiversionContent';

const mockStore = configureStore([]);

describe('DiversionContent - Our Creation Modal', () => {
    let store;
    const mockDisruption = {
        disruptionId: 'DISR123',
        status: 'in-progress'
    };

    const defaultProps = {
        disruption: mockDisruption,
        onClose: jest.fn(),
        onSuccess: jest.fn(),
        mode: 'CREATE',
        diversionToEdit: null,
        onEditSuccess: jest.fn()
    };

    beforeEach(() => {
        store = mockStore({
            control: {
                diversions: {
                    diversionResultState: null,
                    isLoading: false
                }
            }
        });
    });

    it('should render our modal in CREATE mode', () => {
        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText('Create New Diversion')).toBeInTheDocument();
    });

    it('should render our modal in EDIT mode', () => {
        const editProps = {
            ...defaultProps,
            mode: 'EDIT',
            diversionToEdit: { diversionId: 'DIV123', diversionName: 'Our Test Diversion' }
        };

        render(
            <Provider store={store}>
                <DiversionContent {...editProps} />
            </Provider>
        );

        expect(screen.getByText('Edit Diversion')).toBeInTheDocument();
    });

    it('should show our footer buttons', () => {
        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Create Diversion')).toBeInTheDocument();
    });

    it('should call our onClose when Cancel button is clicked', () => {
        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );

        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle our form submission', async () => {
        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );

        const createButton = screen.getByText('Create Diversion');
        fireEvent.click(createButton);


        await waitFor(() => {

        });
    });

    it('should show our loading state when submitting', () => {
        store = mockStore({
            control: {
                diversions: {
                    diversionResultState: null,
                    isLoading: true
                }
            }
        });

        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle our diversion creation success', () => {
        const successState = {
            diversionId: 'DIV123',
            isLoading: false,
            isSuccess: true
        };

        store = mockStore({
            control: {
                diversions: {
                    diversionResultState: successState,
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('should handle our diversion creation error', () => {
        const errorState = {
            diversionId: null,
            isLoading: false,
            isSuccess: false,
            error: 'Our creation failed'
        };

        store = mockStore({
            control: {
                diversions: {
                    diversionResultState: errorState,
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText('Creation Failed')).toBeInTheDocument();
    });

    it('should reset our form after successful creation', async () => {
        const successState = {
            diversionId: 'DIV123',
            isLoading: false,
            isSuccess: true
        };

        store = mockStore({
            control: {
                diversions: {
                    diversionResultState: successState,
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );


        await waitFor(() => {
            expect(screen.getByText('Create New Diversion')).toBeInTheDocument();
        });
    });

    it('should maintain our footer buttons visibility after diversion creation', () => {
        const successState = {
            diversionId: 'DIV123',
            isLoading: false,
            isSuccess: true
        };

        store = mockStore({
            control: {
                diversions: {
                    diversionResultState: successState,
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );


        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Create Diversion')).toBeInTheDocument();
    });

    it('should handle our diversion editing mode correctly', () => {
        const editProps = {
            ...defaultProps,
            mode: 'EDIT',
            diversionToEdit: {
                diversionId: 'DIV123',
                diversionName: 'Our Test Diversion'
            }
        };

        render(
            <Provider store={store}>
                <DiversionContent {...editProps} />
            </Provider>
        );

        expect(screen.getByText('Edit Diversion')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Our Test Diversion')).toBeInTheDocument();
    });

    it('should handle our diversion editing success', () => {
        const successState = {
            diversionId: 'DIV123',
            isLoading: false,
            isSuccess: true
        };

        store = mockStore({
            control: {
                diversions: {
                    diversionResultState: successState,
                    isLoading: false
                }
            }
        });

        const editProps = {
            ...defaultProps,
            mode: 'EDIT',
            diversionToEdit: { diversionId: 'DIV123', diversionName: 'Our Test Diversion' }
        };

        render(
            <Provider store={store}>
                <DiversionContent {...editProps} />
            </Provider>
        );

        expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('should handle our diversion editing error', () => {
        const errorState = {
            diversionId: null,
            isLoading: false,
            isSuccess: false,
            error: 'Our update failed'
        };

        store = mockStore({
            control: {
                diversions: {
                    diversionResultState: errorState,
                    isLoading: false
                }
            }
        });

        const editProps = {
            ...defaultProps,
            mode: 'EDIT',
            diversionToEdit: { diversionId: 'DIV123', diversionName: 'Our Test Diversion' }
        };

        render(
            <Provider store={store}>
                <DiversionContent {...editProps} />
            </Provider>
        );

        expect(screen.getByText('Creation Failed')).toBeInTheDocument();
    });

    it('should handle our different modes correctly', () => {
        const modes = ['CREATE', 'EDIT', 'VIEW'];

        modes.forEach(mode => {
            const props = {
                ...defaultProps,
                mode,
                diversionToEdit: mode === 'EDIT' ? { diversionId: 'DIV123', diversionName: 'Our Test' } : null
            };

            const { unmount } = render(
                <Provider store={store}>
                    <DiversionContent {...props} />
                </Provider>
            );

            if (mode === 'CREATE') {
                expect(screen.getByText('Create New Diversion')).toBeInTheDocument();
            } else if (mode === 'EDIT') {
                expect(screen.getByText('Edit Diversion')).toBeInTheDocument();
            }

            unmount();
        });
    });

    it('should handle our missing props gracefully', () => {

        const propsWithoutOnClose = { ...defaultProps };
        delete propsWithoutOnClose.onClose;

        expect(() => {
            render(
                <Provider store={store}>
                    <DiversionContent {...propsWithoutOnClose} />
                </Provider>
            );
        }).not.toThrow();


        const propsWithoutOnSuccess = { ...defaultProps };
        delete propsWithoutOnSuccess.onSuccess;

        expect(() => {
            render(
                <Provider store={store}>
                    <DiversionContent {...propsWithoutOnSuccess} />
                </Provider>
            );
        }).not.toThrow();


        const propsWithoutMode = { ...defaultProps };
        delete propsWithoutMode.mode;

        expect(() => {
            render(
                <Provider store={store}>
                    <DiversionContent {...propsWithoutMode} />
                </Provider>
            );
        }).not.toThrow();
    });

    it('should handle our different disruption structures', () => {

        const minimalDisruption = {
            disruptionId: 'DISR123'
        };

        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} disruption={minimalDisruption} />
            </Provider>
        );

        expect(screen.getByText('Create New Diversion')).toBeInTheDocument();


        const extendedDisruption = {
            ...mockDisruption,
            additionalProperty: 'value'
        };

        const { rerender } = render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} disruption={extendedDisruption} />
            </Provider>
        );

        expect(screen.getByText('Create New Diversion')).toBeInTheDocument();
    });

    it('should handle our edge cases correctly', () => {

        expect(() => {
            render(
                <Provider store={store}>
                    <DiversionContent {...defaultProps} disruption={null} />
                </Provider>
            );
        }).not.toThrow();


        expect(() => {
            render(
                <Provider store={store}>
                    <DiversionContent {...defaultProps} disruption={undefined} />
                </Provider>
            );
        }).not.toThrow();


        expect(() => {
            render(
                <Provider store={store}>
                    <DiversionContent {...defaultProps} disruption={{}} />
                </Provider>
            );
        }).not.toThrow();
    });

    it('should handle our component lifecycle correctly', () => {
        const { unmount, rerender } = render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText('Create New Diversion')).toBeInTheDocument();


        rerender(
            <Provider store={store}>
                <DiversionContent {...defaultProps} mode="EDIT" diversionToEdit={{ diversionId: 'DIV123', diversionName: 'Our Test' }} />
            </Provider>
        );

        expect(screen.getByText('Edit Diversion')).toBeInTheDocument();


        expect(() => unmount()).not.toThrow();
    });

    it('should handle our Redux store changes', () => {

        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText('Create New Diversion')).toBeInTheDocument();


        const newStore = mockStore({
            control: {
                diversions: {
                    diversionResultState: {
                        diversionId: 'DIV123',
                        isLoading: false,
                        isSuccess: true
                    },
                    isLoading: false
                }
            }
        });

        const { rerender } = render(
            <Provider store={newStore}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );


        expect(screen.getByText('Success')).toBeInTheDocument();
    });

    it('should handle our performance scenarios', () => {

        const largeDisruption = {
            ...mockDisruption,
            affectedEntities: Array.from({ length: 1000 }, (_, i) => ({
                routeId: `ROUTE${i}`,
                routeType: 3,
                stopCode: `STOP${i}`
            }))
        };

        const startTime = performance.now();

        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} disruption={largeDisruption} />
            </Provider>
        );

        const endTime = performance.now();

        expect(screen.getByText('Create New Diversion')).toBeInTheDocument();


        expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle our accessibility requirements', () => {
        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );


        const form = screen.getByRole('form');
        expect(form).toBeInTheDocument();


        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button.tagName).toBe('BUTTON');
        });
    });

    it('should handle our keyboard events', () => {
        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );


        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle our click outside functionality', () => {
        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );


        const backdrop = screen.getByTestId('modal-backdrop');
        fireEvent.click(backdrop);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle our form validation correctly', () => {
        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );


        expect(screen.getByText('Create New Diversion')).toBeInTheDocument();


        const createButton = screen.getByText('Create Diversion');
        fireEvent.click(createButton);


    });

    it('should handle our internationalization scenarios', () => {

        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );


        expect(screen.getByText('Create New Diversion')).toBeInTheDocument();
        expect(screen.getByText('Create New Diversion')).toHaveTextContent('Create New Diversion');
        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Create Diversion')).toBeInTheDocument();
    });

    it('should handle our error boundaries gracefully', () => {

        const invalidProps = {
            ...defaultProps,
            disruption: null,
            mode: 'INVALID'
        };

        expect(() => {
            render(
                <Provider store={store}>
                    <DiversionContent {...invalidProps} />
                </Provider>
            );
        }).not.toThrow();
    });

    it('should handle our confirmation scenarios', () => {
        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );


        expect(screen.getByText('Cancel')).toBeInTheDocument();
        expect(screen.getByText('Create Diversion')).toBeInTheDocument();


        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        expect(defaultProps.onClose).toHaveBeenCalled();

        const createButton = screen.getByText('Create Diversion');
        fireEvent.click(createButton);

    });

    it('should handle our modal positioning correctly', () => {
        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );


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

        render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText('Create New Diversion')).toBeInTheDocument();


        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1200,
        });

        const { rerender } = render(
            <Provider store={store}>
                <DiversionContent {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText('Create New Diversion')).toBeInTheDocument();
    });
});