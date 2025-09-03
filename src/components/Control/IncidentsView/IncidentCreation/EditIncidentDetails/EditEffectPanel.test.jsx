import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import EditEffectPanel from './EditEffectPanel';

const mockStore = configureStore([]);

describe('EditEffectPanel - Diversion Integration', () => {
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

    it('should render HeaderButtons with DiversionsButton when useDiversion is true', () => {
        render(
            <Provider store={store}>
                <EditEffectPanel {...defaultProps} />
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
                <EditEffectPanel {...defaultProps} />
            </Provider>
        );

        expect(screen.queryByText(/Diversions/)).not.toBeInTheDocument();
    });

    it('should handle diversion manager opening from EditEffectPanel', () => {
        render(
            <Provider store={store}>
                <EditEffectPanel {...defaultProps} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        fireEvent.click(addDiversionButton);

        
        expect(store.getActions()).toContainEqual({
            type: 'OPEN_DIVERSION_MANAGER',
            payload: true
        });
    });

    it('should handle diversion creation success in EditEffectPanel', async () => {
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
                <EditEffectPanel {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversion DIV123 has been successfully created/)).toBeInTheDocument();
    });

    it('should handle diversion creation error in EditEffectPanel', async () => {
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
                <EditEffectPanel {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Failed to create diversion/)).toBeInTheDocument();
    });

    it('should update diversion count after creation in EditEffectPanel', async () => {
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
                <EditEffectPanel {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversions\(1\)/)).toBeInTheDocument();
    });

    it('should handle diversion editing from EditEffectPanel', () => {
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
                <EditEffectPanel {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Diversions\(1\)/)).toBeInTheDocument();
    });

    it('should handle diversion deletion from EditEffectPanel', async () => {
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
                <EditEffectPanel {...defaultProps} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(1\)/);
        fireEvent.click(diversionsButton);

        const viewButton = screen.getByText('View & Edit Diversions');
        fireEvent.click(viewButton);

        
        expect(screen.getByText('View & Edit Diversions')).toBeInTheDocument();
    });

    it('should handle disruption status changes in EditEffectPanel', () => {
        const resolvedDisruption = {
            ...mockDisruption,
            status: 'resolved'
        };

        render(
            <Provider store={store}>
                <EditEffectPanel {...defaultProps} disruption={resolvedDisruption} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeDisabled();
    });

    it('should handle route type restrictions in EditEffectPanel', () => {
        const trainDisruption = {
            ...mockDisruption,
            affectedEntities: [
                { routeId: 'ROUTE1', routeType: 1, stopCode: 'STOP1' } 
            ]
        };

        render(
            <Provider store={store}>
                <EditEffectPanel {...defaultProps} disruption={trainDisruption} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeDisabled();
    });

    it('should handle mixed route types in EditEffectPanel', () => {
        const mixedDisruption = {
            ...mockDisruption,
            affectedEntities: [
                { routeId: 'ROUTE1', routeType: 3, stopCode: 'STOP1' }, 
                { routeId: 'ROUTE2', routeType: 1, stopCode: 'STOP2' }  
            ]
        };

        render(
            <Provider store={store}>
                <EditEffectPanel {...defaultProps} disruption={mixedDisruption} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).not.toBeDisabled();
    });

    it('should handle feature flag changes dynamically in EditEffectPanel', () => {
        
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
                <EditEffectPanel {...defaultProps} />
            </Provider>
        );

        expect(screen.queryByText(/Diversions/)).not.toBeInTheDocument();

        
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
                <EditEffectPanel {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should handle loading states correctly in EditEffectPanel', () => {
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
                <EditEffectPanel {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle empty affected entities in EditEffectPanel', () => {
        const emptyDisruption = {
            ...mockDisruption,
            affectedEntities: []
        };

        render(
            <Provider store={store}>
                <EditEffectPanel {...defaultProps} disruption={emptyDisruption} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeDisabled();
    });

    it('should handle missing affected entities property in EditEffectPanel', () => {
        const disruptionWithoutEntities = {
            disruptionId: 'DISR123',
            status: 'in-progress'
        };

        render(
            <Provider store={store}>
                <EditEffectPanel {...defaultProps} disruption={disruptionWithoutEntities} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeDisabled();
    });

    it('should integrate with EditEffectPanel functionality', () => {
        render(
            <Provider store={store}>
                <EditEffectPanel {...defaultProps} />
            </Provider>
        );

        
        expect(screen.getByText(/Edit Effect Panel/)).toBeInTheDocument();
        
        
        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
        
        
        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);
        
        expect(screen.getByText('Add Diversion')).toBeInTheDocument();
        expect(screen.getByText('View & Edit Diversions')).toBeInTheDocument();
    });
}); 