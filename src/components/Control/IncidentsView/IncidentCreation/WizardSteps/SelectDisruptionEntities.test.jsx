import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import SelectDisruptionEntities from './SelectDisruptionEntities';

const mockStore = configureStore([]);

describe('SelectDisruptionEntities - Diversion Integration', () => {
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
        onNext: jest.fn(),
        onBack: jest.fn(),
        onClose: jest.fn()
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

    it('should render with diversion functionality enabled', () => {
        render(
            <Provider store={store}>
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        // Should render SelectDisruptionEntities content
        expect(screen.getByText(/Select Disruption Entities/)).toBeInTheDocument();
        
        // Should render DiversionsButton when useDiversion is true
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
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        expect(screen.queryByText(/Diversions/)).not.toBeInTheDocument();
    });

    it('should handle diversion manager opening from SelectDisruptionEntities', () => {
        render(
            <Provider store={store}>
                <SelectDisruptionEntities {...defaultProps} />
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

    it('should handle diversion creation success in SelectDisruptionEntities', async () => {
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
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        // Should show success message
        expect(screen.getByText(/Diversion DIV123 has been successfully created/)).toBeInTheDocument();
    });

    it('should handle diversion creation error in SelectDisruptionEntities', async () => {
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
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        // Should show error message
        expect(screen.getByText(/Failed to create diversion/)).toBeInTheDocument();
    });

    it('should update diversion count after creation in SelectDisruptionEntities', async () => {
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
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        // Should show updated count
        expect(screen.getByText(/Diversions\(1\)/)).toBeInTheDocument();
    });

    it('should handle diversion editing from SelectDisruptionEntities', () => {
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
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        // Should show edit mode
        expect(screen.getByText(/Diversions\(1\)/)).toBeInTheDocument();
    });

    it('should handle diversion deletion from SelectDisruptionEntities', async () => {
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
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(1\)/);
        fireEvent.click(diversionsButton);

        const viewButton = screen.getByText('View & Edit Diversions');
        fireEvent.click(viewButton);

        // Should open view modal
        expect(screen.getByText('View & Edit Diversions')).toBeInTheDocument();
    });

    it('should handle disruption status changes in SelectDisruptionEntities', () => {
        const resolvedDisruption = {
            ...mockDisruption,
            status: 'resolved'
        };

        render(
            <Provider store={store}>
                <SelectDisruptionEntities {...defaultProps} disruption={resolvedDisruption} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeDisabled();
    });

    it('should handle route type restrictions in SelectDisruptionEntities', () => {
        const trainDisruption = {
            ...mockDisruption,
            affectedEntities: [
                { routeId: 'ROUTE1', routeType: 1, stopCode: 'STOP1' } // Train route
            ]
        };

        render(
            <Provider store={store}>
                <SelectDisruptionEntities {...defaultProps} disruption={trainDisruption} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeDisabled();
    });

    it('should handle mixed route types in SelectDisruptionEntities', () => {
        const mixedDisruption = {
            ...mockDisruption,
            affectedEntities: [
                { routeId: 'ROUTE1', routeType: 3, stopCode: 'STOP1' }, // Bus route
                { routeId: 'ROUTE2', routeType: 1, stopCode: 'STOP2' }  // Train route
            ]
        };

        render(
            <Provider store={store}>
                <SelectDisruptionEntities {...defaultProps} disruption={mixedDisruption} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).not.toBeDisabled();
    });

    it('should handle feature flag changes dynamically in SelectDisruptionEntities', () => {
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
                <SelectDisruptionEntities {...defaultProps} />
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
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should handle loading states correctly in SelectDisruptionEntities', () => {
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
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        // Should show loading state
        expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should handle empty affected entities in SelectDisruptionEntities', () => {
        const emptyDisruption = {
            ...mockDisruption,
            affectedEntities: []
        };

        render(
            <Provider store={store}>
                <SelectDisruptionEntities {...defaultProps} disruption={emptyDisruption} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeDisabled();
    });

    it('should handle missing affected entities property in SelectDisruptionEntities', () => {
        const disruptionWithoutEntities = {
            disruptionId: 'DISR123',
            status: 'in-progress'
        };

        render(
            <Provider store={store}>
                <SelectDisruptionEntities {...defaultProps} disruption={disruptionWithoutEntities} />
            </Provider>
        );

        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeDisabled();
    });

    it('should integrate with SelectDisruptionEntities functionality', () => {
        render(
            <Provider store={store}>
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        // Should render SelectDisruptionEntities content
        expect(screen.getByText(/Select Disruption Entities/)).toBeInTheDocument();
        
        // Should render DiversionsButton
        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
        
        // Both should work together
        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);
        
        expect(screen.getByText('Add Diversion')).toBeInTheDocument();
        expect(screen.getByText('View & Edit Diversions')).toBeInTheDocument();
    });

    it('should handle navigation with diversion state', () => {
        render(
            <Provider store={store}>
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        // Should handle Next button
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);

        expect(defaultProps.onNext).toHaveBeenCalled();

        // Should handle Back button
        const backButton = screen.getByText('Back');
        fireEvent.click(backButton);

        expect(defaultProps.onBack).toHaveBeenCalled();

        // Should handle Close button
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('should handle diversion workflow integration in SelectDisruptionEntities', () => {
        // This test simulates the integration with diversion workflow in SelectDisruptionEntities
        const diversionWorkflowProps = {
            ...defaultProps,
            onNext: jest.fn(),
            onBack: jest.fn(),
            onClose: jest.fn()
        };

        render(
            <Provider store={store}>
                <SelectDisruptionEntities {...diversionWorkflowProps} />
            </Provider>
        );

        // User can interact with diversions
        const diversionsButton = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(diversionsButton);

        expect(screen.getByText('Add Diversion')).toBeInTheDocument();
        expect(screen.getByText('View & Edit Diversions')).toBeInTheDocument();

        // User can navigate
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);

        expect(diversionWorkflowProps.onNext).toHaveBeenCalled();
    });

    it('should handle entity selection with diversion context', () => {
        render(
            <Provider store={store}>
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        // Should handle entity selection
        const entityCheckbox = screen.getByLabelText(/Route ROUTE1/);
        fireEvent.click(entityCheckbox);

        expect(entityCheckbox).toBeChecked();

        // Should handle multiple entity selection
        const entityCheckbox2 = screen.getByLabelText(/Route ROUTE2/);
        fireEvent.click(entityCheckbox2);

        expect(entityCheckbox2).toBeChecked();
    });

    it('should handle validation with diversion requirements', () => {
        render(
            <Provider store={store}>
                <SelectDisruptionEntities {...defaultProps} />
            </Provider>
        );

        // Should validate that at least one entity is selected
        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);

        // Should show validation error if no entities selected
        expect(screen.getByText(/Please select at least one entity/)).toBeInTheDocument();
    });
}); 