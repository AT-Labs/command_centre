import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import CreateIncident from './index';

const mockStore = configureStore([]);

describe('CreateIncident - Diversion Integration', () => {
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
        mode: 'CREATE'
    };

    beforeEach(() => {
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
                    diversionsForDisruption: {
                        DISR123: []
                    },
                    diversionResultState: null,
                    isLoading: false
                }
            }
        });
    });

    it('should render DiversionsButton when useDiversion is true', () => {
        render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should not render DiversionsButton when useDiversion is false', () => {
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: false
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
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        expect(screen.queryByText(/Diversions/)).not.toBeInTheDocument();
    });

    it('should render EditEffectPanel when useEditEffectPanel is true', () => {
        render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        // EditEffectPanel should be rendered
        expect(screen.getByText(/Edit Effect Panel/)).toBeInTheDocument();
    });

    it('should not render EditEffectPanel when useEditEffectPanel is false', () => {
        store = mockStore({
            appSettings: {
                useEditEffectPanel: false,
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
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        expect(screen.queryByText(/Edit Effect Panel/)).not.toBeInTheDocument();
    });

    it('should handle diversion manager opening', () => {
        render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        fireEvent.click(addDiversionButton);

        // Should open diversion manager
        expect(store.getActions()).toContainEqual({
            type: 'OPEN_DIVERSION_MANAGER',
            payload: true
        });
    });

    it('should handle diversion creation success', async () => {
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
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        // Should show success message
        expect(screen.getByText(/Diversion DIV123 has been successfully created/)).toBeInTheDocument();
    });

    it('should handle diversion creation error', async () => {
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
                    diversionsForDisruption: {
                        DISR123: []
                    },
                    diversionResultState: {
                        diversionId: null,
                        isLoading: false,
                        isSuccess: false,
                        error: 'Creation failed'
                    },
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        // Should show error message
        expect(screen.getByText(/Failed to create diversion/)).toBeInTheDocument();
    });

    it('should update diversion count after creation', async () => {
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
                    diversionsForDisruption: {
                        DISR123: [
                            { diversionId: 'DIV1', diversionName: 'Diversion 1' }
                        ]
                    },
                    diversionResultState: null,
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        // Should show updated count
        expect(screen.getByText(/Diversions\(1\)/)).toBeInTheDocument();
    });

    it('should handle diversion editing', () => {
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: false,
                    diversionMode: 'EDIT',
                    diversionToEdit: {
                        diversionId: 'DIV123',
                        diversionName: 'Test Diversion'
                    },
                    diversionsForDisruption: {
                        DISR123: [
                            { diversionId: 'DIV123', diversionName: 'Test Diversion' }
                        ]
                    },
                    diversionResultState: null,
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        // Should show edit mode
        expect(screen.getByText(/Diversions\(1\)/)).toBeInTheDocument();
    });

    it('should handle diversion deletion', async () => {
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: true
            },
            control: {
                diversions: {
                    isDiversionManagerOpen: false,
                    diversionMode: 'VIEW',
                    diversionToEdit: null,
                    diversionsForDisruption: {
                        DISR123: [
                            { diversionId: 'DIV1', diversionName: 'Diversion 1' }
                        ]
                    },
                    diversionResultState: null,
                    isLoading: false
                }
            }
        });

        render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(1\)/);
        fireEvent.click(diversionsButton);

        const viewButton = screen.getByText('View & Edit Diversions');
        fireEvent.click(viewButton);

        // Should open view modal
        expect(screen.getByText('View & Edit Diversions')).toBeInTheDocument();
    });

    it('should handle disruption status changes', () => {
        const resolvedDisruption = {
            ...mockDisruption,
            status: 'resolved'
        };

        render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} disruption={resolvedDisruption} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeDisabled();
    });

    it('should handle route type restrictions', () => {
        const trainDisruption = {
            ...mockDisruption,
            affectedEntities: [
                { routeId: 'ROUTE1', routeType: 1, stopCode: 'STOP1' } // Train route
            ]
        };

        render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} disruption={trainDisruption} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeDisabled();
    });

    it('should handle mixed route types', () => {
        const mixedDisruption = {
            ...mockDisruption,
            affectedEntities: [
                { routeId: 'ROUTE1', routeType: 3, stopCode: 'STOP1' }, // Bus route
                { routeId: 'ROUTE2', routeType: 1, stopCode: 'STOP2' }  // Train route
            ]
        };

        render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} disruption={mixedDisruption} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).not.toBeDisabled();
    });

    it('should handle feature flag changes dynamically', () => {
        // Start with useDiversion: false
        store = mockStore({
            appSettings: {
                useEditEffectPanel: true,
                useDiversion: false
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

        const { rerender } = render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        expect(screen.queryByText(/Diversions/)).not.toBeInTheDocument();

        // Change to useDiversion: true
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
                    diversionsForDisruption: {
                        DISR123: []
                    },
                    diversionResultState: null,
                    isLoading: false
                }
            }
        });

        rerender(
            <Provider store={store}>
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should handle loading states correctly', () => {
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
                <CreateIncident {...defaultProps} />
            </Provider>
        );

        // Should show loading state
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle empty affected entities', () => {
        const emptyDisruption = {
            ...mockDisruption,
            affectedEntities: []
        };

        render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} disruption={emptyDisruption} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeDisabled();
    });

    it('should handle missing affected entities property', () => {
        const disruptionWithoutEntities = {
            disruptionId: 'DISR123',
            status: 'in-progress'
        };

        render(
            <Provider store={store}>
                <CreateIncident {...defaultProps} disruption={disruptionWithoutEntities} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeDisabled();
    });
}); 