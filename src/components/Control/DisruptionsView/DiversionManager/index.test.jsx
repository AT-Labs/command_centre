import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DiversionManager from './index';

const mockStore = configureStore([]);

describe('DiversionManager Index - Our Main Component', () => {
    let store;
    const mockDisruption = {
        disruptionId: 'DISR123',
        status: 'in-progress',
        affectedEntities: [
            { routeId: 'ROUTE1', routeType: 3, stopCode: 'STOP1' },
            { routeId: 'ROUTE2', routeType: 3, stopCode: 'STOP2' }
        ]
    };

    const defaultProps = {
        disruption: mockDisruption,
        onClose: jest.fn(),
        onSuccess: jest.fn(),
        mode: 'CREATE',
        diversionToEdit: null
    };

    beforeEach(() => {
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: true,
                    diversionMode: 'CREATE',
                    diversionToEdit: null,
                    diversionsForDisruption: {
                        DISR123: []
                    },
                    diversionResultState: null,
                    isLoading: false
                }
            }
        });
    });

    it('should render our DiversionManager when open', () => {
        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();
    });

    it('should not render when our diversion manager is closed', () => {
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: false,
                    diversionMode: 'CREATE',
                    diversionToEdit: null,
                    diversionsForDisruption: {},
                    diversionResultState: null,
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        expect(screen.queryByText(/Diversion Manager/)).not.toBeInTheDocument();
    });

    it('should render our component in CREATE mode', () => {
        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} mode="CREATE" />
            </Provider>
        );

        expect(screen.getByText(/Create New Diversion/)).toBeInTheDocument();
    });

    it('should render our component in EDIT mode', () => {
        const editProps = {
            ...defaultProps,
            mode: 'EDIT',
            diversionToEdit: { diversionId: 'DIV123', diversionName: 'Our Test Diversion' }
        };

        render(
            <Provider store={store}>
                <DiversionManager {...editProps} />
            </Provider>
        );

        expect(screen.getByText(/Edit Diversion/)).toBeInTheDocument();
    });

    it('should render our component in VIEW mode', () => {
        const viewProps = {
            ...defaultProps,
            mode: 'VIEW'
        };

        render(
            <Provider store={store}>
                <DiversionManager {...viewProps} />
            </Provider>
        );

        expect(screen.getByText(/View Diversion/)).toBeInTheDocument();
    });

    it('should handle our diversion creation success', async () => {
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: true,
                    diversionMode: 'CREATE',
                    diversionToEdit: null,
                    diversionsForDisruption: {
                        DISR123: []
                    },
                    diversionResultState: {
                        diversionId: 'DIV123',
                        isLoading: false,
                        isSuccess: true,
                        error: null
                    },
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversion DIV123 has been successfully created/)).toBeInTheDocument();
    });

    it('should handle our diversion creation error', async () => {
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: true,
                    diversionMode: 'CREATE',
                    diversionToEdit: null,
                    diversionsForDisruption: {
                        DISR123: []
                    },
                    diversionResultState: {
                        diversionId: null,
                        isLoading: false,
                        isSuccess: false,
                        error: 'Our creation failed'
                    },
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Failed to create diversion/)).toBeInTheDocument();
    });

    it('should handle our diversion update success', async () => {
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: true,
                    diversionMode: 'EDIT',
                    diversionToEdit: { diversionId: 'DIV123', diversionName: 'Our Test' },
                    diversionsForDisruption: {
                        DISR123: [{ diversionId: 'DIV123', diversionName: 'Our Test' }]
                    },
                    diversionResultState: {
                        diversionId: 'DIV123',
                        isLoading: false,
                        isSuccess: true,
                        error: null
                    },
                    isLoading: false
                }
            }
        });

        const editProps = {
            ...defaultProps,
            mode: 'EDIT',
            diversionToEdit: { diversionId: 'DIV123', diversionName: 'Our Test' }
        };

        render(
            <Provider store={store}>
                <DiversionManager {...editProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversion DIV123 has been successfully updated/)).toBeInTheDocument();
    });

    it('should handle our diversion update error', async () => {
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: true,
                    diversionMode: 'EDIT',
                    diversionToEdit: { diversionId: 'DIV123', diversionName: 'Our Test' },
                    diversionsForDisruption: {
                        DISR123: [{ diversionId: 'DIV123', diversionName: 'Our Test' }]
                    },
                    diversionResultState: {
                        diversionId: null,
                        isLoading: false,
                        isSuccess: false,
                        error: 'Our update failed'
                    },
                    isLoading: false
                }
            }
        });

        const editProps = {
            ...defaultProps,
            mode: 'EDIT',
            diversionToEdit: { diversionId: 'DIV123', diversionName: 'Our Test' }
        };

        render(
            <Provider store={store}>
                <DiversionManager {...editProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Failed to update diversion/)).toBeInTheDocument();
    });

    it('should handle our loading states correctly', () => {
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: true,
                    diversionMode: 'CREATE',
                    diversionToEdit: null,
                    diversionsForDisruption: {
                        DISR123: []
                    },
                    diversionResultState: null,
                    isLoading: true
                }
            }
        });

        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle our diversion result state changes', async () => {
        const { rerender } = render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        expect(screen.queryByText(/Diversion.*has been successfully/)).not.toBeInTheDocument();

        
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: true,
                    diversionMode: 'CREATE',
                    diversionToEdit: null,
                    diversionsForDisruption: {
                        DISR123: []
                    },
                    diversionResultState: {
                        diversionId: 'DIV123',
                        isLoading: false,
                        isSuccess: true,
                        error: null
                    },
                    isLoading: false
                }
            }
        });

        rerender(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversion DIV123 has been successfully created/)).toBeInTheDocument();
    });

    it('should handle our diversion mode changes', () => {
        const { rerender } = render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Create New Diversion/)).toBeInTheDocument();

        
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: true,
                    diversionMode: 'EDIT',
                    diversionToEdit: { diversionId: 'DIV123', diversionName: 'Our Test' },
                    diversionsForDisruption: {
                        DISR123: [{ diversionId: 'DIV123', diversionName: 'Our Test' }]
                    },
                    diversionResultState: null,
                    isLoading: false
                }
            }
        });

        rerender(
            <Provider store={store}>
                <DiversionManager {...defaultProps} mode="EDIT" diversionToEdit={{ diversionId: 'DIV123', diversionName: 'Our Test' }} />
            </Provider>
        );

        
        expect(screen.getByText(/Edit Diversion/)).toBeInTheDocument();
    });

    it('should handle our diversion to edit changes', () => {
        const { rerender } = render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Create New Diversion/)).toBeInTheDocument();

        
        rerender(
            <Provider store={store}>
                <DiversionManager {...defaultProps} diversionToEdit={{ diversionId: 'DIV123', diversionName: 'Our Test' }} />
            </Provider>
        );

        
        expect(screen.getByText(/Create New Diversion/)).toBeInTheDocument();
    });

    it('should handle our disruption changes', () => {
        const { rerender } = render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Create New Diversion/)).toBeInTheDocument();

        
        const newDisruption = {
            disruptionId: 'DISR456',
            status: 'in-progress',
            affectedEntities: [
                { routeId: 'ROUTE3', routeType: 3, stopCode: 'STOP3' }
            ]
        };

        rerender(
            <Provider store={store}>
                <DiversionManager {...defaultProps} disruption={newDisruption} />
            </Provider>
        );

        
        expect(screen.getByText(/Create New Diversion/)).toBeInTheDocument();
    });

    it('should handle our onClose callback', () => {
        const mockOnClose = jest.fn();

        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} onClose={mockOnClose} />
            </Provider>
        );

        
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });

    it('should handle our onSuccess callback', async () => {
        const mockOnSuccess = jest.fn();

        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: true,
                    diversionMode: 'CREATE',
                    diversionToEdit: null,
                    diversionsForDisruption: {
                        DISR123: []
                    },
                    diversionResultState: {
                        diversionId: 'DIV123',
                        isLoading: false,
                        isSuccess: true,
                        error: null
                    },
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} onSuccess={mockOnSuccess} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversion DIV123 has been successfully created/)).toBeInTheDocument();

        
        await waitFor(() => {
            expect(mockOnSuccess).toHaveBeenCalled();
        });
    });

    it('should handle our edge cases gracefully', () => {
        
        const propsWithoutDisruption = { ...defaultProps };
        delete propsWithoutDisruption.disruption;

        expect(() => {
            render(
                <Provider store={store}>
                    <DiversionManager {...propsWithoutDisruption} />
                </Provider>
            );
        }).not.toThrow();

        
        const propsWithoutMode = { ...defaultProps };
        delete propsWithoutMode.mode;

        expect(() => {
            render(
                <Provider store={store}>
                    <DiversionManager {...propsWithoutMode} />
                </Provider>
            );
        }).not.toThrow();

        
        const propsWithoutCallbacks = { ...defaultProps };
        delete propsWithoutCallbacks.onClose;
        delete propsWithoutCallbacks.onSuccess;

        expect(() => {
            render(
                <Provider store={store}>
                    <DiversionManager {...propsWithoutCallbacks} />
                </Provider>
            );
        }).not.toThrow();
    });

    it('should handle our different disruption statuses', () => {
        const statuses = ['not-started', 'in-progress', 'draft', 'resolved', 'cancelled'];

        statuses.forEach(status => {
            const disruptionWithStatus = {
                ...mockDisruption,
                status
            };

            const { unmount } = render(
                <Provider store={store}>
                    <DiversionManager {...defaultProps} disruption={disruptionWithStatus} />
                </Provider>
            );

            
            expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();

            unmount();
        });
    });

    it('should handle our different route types', () => {
        const routeTypes = [
            { type: 1, name: 'Train' },
            { type: 2, name: 'Tram' },
            { type: 3, name: 'Bus' },
            { type: 4, name: 'Ferry' }
        ];

        routeTypes.forEach(({ type, name }) => {
            const disruptionWithRouteType = {
                ...mockDisruption,
                affectedEntities: [
                    { routeId: 'ROUTE1', routeType: type, stopCode: 'STOP1' }
                ]
            };

            const { unmount } = render(
                <Provider store={store}>
                    <DiversionManager {...defaultProps} disruption={disruptionWithRouteType} />
                </Provider>
            );

            
            expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();

            unmount();
        });
    });

    it('should handle our empty affected entities', () => {
        const disruptionWithoutEntities = {
            ...mockDisruption,
            affectedEntities: []
        };

        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} disruption={disruptionWithoutEntities} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();
    });

    it('should handle our missing affected entities property', () => {
        const disruptionWithoutEntitiesProperty = {
            disruptionId: 'DISR123',
            status: 'in-progress'
        };

        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} disruption={disruptionWithoutEntitiesProperty} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();
    });

    it('should integrate with our diversion workflow', () => {
        
        const diversionWorkflowProps = {
            ...defaultProps,
            onClose: jest.fn(),
            onSuccess: jest.fn()
        };

        render(
            <Provider store={store}>
                <DiversionManager {...diversionWorkflowProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();

        
        expect(screen.getByText(/Create New Diversion/)).toBeInTheDocument();

        
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(diversionWorkflowProps.onClose).toHaveBeenCalled();
    });

    it('should handle our feature flag changes', () => {
        
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: false
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: true,
                    diversionMode: 'CREATE',
                    diversionToEdit: null,
                    diversionsForDisruption: {},
                    diversionResultState: null,
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();
    });

    it('should handle our different diversion modes from store', () => {
        const modes = ['CREATE', 'EDIT', 'VIEW'];

        modes.forEach(mode => {
            store = mockStore({
                appSettings: {
                    useEditEffectPanel: true,
                    useDiversion: true
                },
                control: {
                    diversions: {
                        isDiversionManagerOpen: true,
                        diversionMode: mode,
                        diversionToEdit: mode === 'EDIT' ? { diversionId: 'DIV123', diversionName: 'Our Test' } : null,
                        diversionsForDisruption: {
                            DISR123: mode === 'EDIT' ? [{ diversionId: 'DIV123', diversionName: 'Our Test' }] : []
                        },
                        diversionResultState: null,
                        isLoading: false
                    }
                }
            });

            const { unmount } = render(
                <Provider store={store}>
                    <DiversionManager {...defaultProps} mode={mode} />
                </Provider>
            );

            
            expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();

            unmount();
        });
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
                <DiversionManager {...defaultProps} disruption={largeDisruption} />
            </Provider>
        );

        const endTime = performance.now();

        expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();
        
        
        expect(endTime - startTime).toBeLessThan(100);
    });

    it('should handle our accessibility requirements', () => {
        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        const modal = screen.getByRole('dialog');
        expect(modal).toBeInTheDocument();

        
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
            expect(button.tagName).toBe('BUTTON');
        });
    });

    it('should handle our keyboard events', () => {
        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle our click outside functionality', () => {
        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        const backdrop = screen.getByTestId('modal-backdrop');
        fireEvent.click(backdrop);
        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle our component lifecycle correctly', () => {
        const { unmount, rerender } = render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();

        
        rerender(
            <Provider store={store}>
                <DiversionManager {...defaultProps} mode="EDIT" diversionToEdit={{ diversionId: 'DIV123', diversionName: 'Our Test' }} />
            </Provider>
        );

        expect(screen.getByText(/Edit Diversion/)).toBeInTheDocument();

        
        expect(() => unmount()).not.toThrow();
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
                    <DiversionManager {...invalidProps} />
                </Provider>
            );
        }).not.toThrow();
    });

    it('should handle our internationalization scenarios', () => {
        
        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();
        expect(screen.getByText(/Create New Diversion/)).toBeInTheDocument();
    });

    it('should handle our confirmation scenarios', () => {
        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();
        expect(screen.getByText(/Create New Diversion/)).toBeInTheDocument();

        
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle our modal positioning correctly', () => {
        render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
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
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();

        
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1200,
        });

        const { rerender } = render(
            <Provider store={store}>
                <DiversionManager {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversion Manager/)).toBeInTheDocument();
    });
}); 