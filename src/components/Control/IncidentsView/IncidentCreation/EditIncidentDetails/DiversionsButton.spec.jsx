/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DiversionsButton from './DiversionsButton';

const mockStore = configureStore([]);

describe('DiversionsButton - Our Implementation', () => {
    let store;
    const mockDisruption = {
        disruptionId: 'DISR123',
        status: 'in-progress',
        affectedEntities: [
            { routeId: 'ROUTE1', routeType: 3, stopCode: 'STOP1' },
            { routeId: 'ROUTE2', routeType: 3, stopCode: 'STOP2' },
        ],
    };

    const defaultProps = {
        disruption: mockDisruption,
        openDiversionManagerAction: jest.fn(),
        updateDiversionModeAction: jest.fn(),
        useDiversionFlag: true,
        onViewDiversions: jest.fn(),
        isDiversionManagerOpen: false,
        toggleEditEffectPanel: jest.fn(),
        state: {
            control: {
                diversions: {
                    diversionsForDisruption: {
                        DISR123: [],
                    },
                    diversionResultState: null,
                },
            },
        },
        fetchDiversionsAction: jest.fn(),
        clearDiversionsCacheAction: jest.fn(),
    };

    beforeEach(() => {
        store = mockStore({
            control: {
                diversions: {
                    diversionsForDisruption: {
                        DISR123: [],
                    },
                    diversionResultState: null,
                },
            },
        });
        jest.clearAllMocks();
    });

    it('should render our DiversionsButton when useDiversionFlag is true', () => {
        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should not render when useDiversionFlag is false', () => {
        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } useDiversionFlag={ false } />
            </Provider>,
        );

        expect(screen.queryByText(/Diversions/)).not.toBeInTheDocument();
    });

    it('should show correct diversion count from our state', () => {
        const propsWithDiversions = {
            ...defaultProps,
            state: {
                control: {
                    diversions: {
                        diversionsForDisruption: {
                            DISR123: [
                                { diversionId: 'DIV1' },
                                { diversionId: 'DIV2' },
                            ],
                        },
                        diversionResultState: null,
                    },
                },
            },
        };

        render(
            <Provider store={ store }>
                <DiversionsButton { ...propsWithDiversions } />
            </Provider>,
        );

        expect(screen.getByText(/Diversions\(2\)/)).toBeInTheDocument();
    });

    it('should open our dropdown menu when button is clicked', () => {
        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } />
            </Provider>,
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        expect(screen.getByText('Add Diversion')).toBeInTheDocument();
        expect(screen.getByText('View & Edit Diversions')).toBeInTheDocument();
    });

    it('should call our openDiversionManager when Add Diversion is clicked', async () => {
        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } />
            </Provider>,
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        const addButton = screen.getByText('Add Diversion');
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(defaultProps.openDiversionManagerAction).toHaveBeenCalledWith(true);
            expect(defaultProps.updateDiversionModeAction).toHaveBeenCalledWith('CREATE');
        });
    });

    it('should call our onViewDiversions when View & Edit Diversions is clicked', () => {
        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } />
            </Provider>,
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        const viewButton = screen.getByText('View & Edit Diversions');
        fireEvent.click(viewButton);

        expect(defaultProps.onViewDiversions).toHaveBeenCalled();
    });

    it('should close our dropdown when clicking outside', async () => {
        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } />
            </Provider>,
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        expect(screen.getByText('Add Diversion')).toBeInTheDocument();

        // Click outside
        fireEvent.mouseDown(document.body);

        await waitFor(() => {
            expect(screen.queryByText('Add Diversion')).not.toBeInTheDocument();
        });
    });

    it('should disable Add Diversion when disruption is resolved (our logic)', () => {
        const resolvedDisruption = {
            ...mockDisruption,
            status: 'resolved',
        };

        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } disruption={ resolvedDisruption } />
            </Provider>,
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        const addButton = screen.getByText('Add Diversion');
        expect(addButton).toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' });
    });

    it('should disable Add Diversion when no bus routes available (our validation)', () => {
        const disruptionWithoutBusRoutes = {
            ...mockDisruption,
            affectedEntities: [
                { routeId: 'ROUTE1', routeType: 1, stopCode: 'STOP1' }, // Train route
            ],
        };

        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } disruption={ disruptionWithoutBusRoutes } />
            </Provider>,
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        const addButton = screen.getByText('Add Diversion');
        expect(addButton).toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' });
    });

    it('should handle our dropdown state correctly', () => {
        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } />
            </Provider>,
        );

        const button = screen.getByText(/Diversions\(0\)/);

        // Initially closed
        expect(screen.queryByText('Add Diversion')).not.toBeInTheDocument();

        // Open dropdown
        fireEvent.click(button);
        expect(screen.getByText('Add Diversion')).toBeInTheDocument();

        // Close dropdown
        fireEvent.click(button);
        expect(screen.queryByText('Add Diversion')).not.toBeInTheDocument();
    });

    it('should handle our disruption status validation correctly', () => {
        const allowedStatuses = ['not-started', 'in-progress', 'draft'];
        const disallowedStatuses = ['resolved', 'cancelled'];

        allowedStatuses.forEach((status) => {
            const { unmount } = render(
                <Provider store={ store }>
                    <DiversionsButton { ...defaultProps } disruption={ { ...mockDisruption, status } } />
                </Provider>,
            );

            const button = screen.getByText(/Diversions\(0\)/);
            fireEvent.click(button);

            const addButton = screen.getByText('Add Diversion');
            expect(addButton).not.toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' });

            unmount();
        });

        disallowedStatuses.forEach((status) => {
            const { unmount } = render(
                <Provider store={ store }>
                    <DiversionsButton { ...defaultProps } disruption={ { ...mockDisruption, status } } />
                </Provider>,
            );

            const button = screen.getByText(/Diversions\(0\)/);
            fireEvent.click(button);

            const addButton = screen.getByText('Add Diversion');
            expect(addButton).toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' });

            unmount();
        });
    });

    it('should handle our route type validation correctly', () => {
        const busRoutes = [
            { routeId: 'ROUTE1', routeType: 3, stopCode: 'STOP1' },
            { routeId: 'ROUTE2', routeType: 3, stopCode: 'STOP2' },
        ];

        const nonBusRoutes = [
            { routeId: 'ROUTE1', routeType: 1, stopCode: 'STOP1' }, // Train
            { routeId: 'ROUTE2', routeType: 2, stopCode: 'STOP2' }, // Tram
        ];

        // Test with bus routes
        const { rerender } = render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } disruption={ { ...mockDisruption, affectedEntities: busRoutes } } />
            </Provider>,
        );

        let button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        let addButton = screen.getByText('Add Diversion');
        expect(addButton).not.toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' });

        // Test with non-bus routes
        rerender(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } disruption={ { ...mockDisruption, affectedEntities: nonBusRoutes } } />
            </Provider>,
        );

        button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        addButton = screen.getByText('Add Diversion');
        expect(addButton).toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' });
    });

    it('should handle our mixed route types correctly', () => {
        const mixedRoutes = [
            { routeId: 'ROUTE1', routeType: 3, stopCode: 'STOP1' }, // Bus route
            { routeId: 'ROUTE2', routeType: 1, stopCode: 'STOP2' }, // Train route
        ];

        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } disruption={ { ...mockDisruption, affectedEntities: mixedRoutes } } />
            </Provider>,
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        const addButton = screen.getByText('Add Diversion');
        expect(addButton).not.toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' });
    });

    it('should handle our edge cases gracefully', () => {
        // Missing affectedEntities
        const disruptionWithoutEntities = {
            disruptionId: 'DISR123',
            status: 'in-progress',
        };

        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } disruption={ disruptionWithoutEntities } />
            </Provider>,
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        const addButton = screen.getByText('Add Diversion');
        expect(addButton).toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' });

        // Empty affectedEntities
        const disruptionWithEmptyEntities = {
            ...mockDisruption,
            affectedEntities: [],
        };

        const { rerender } = render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } disruption={ disruptionWithEmptyEntities } />
            </Provider>,
        );

        rerender(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } disruption={ disruptionWithEmptyEntities } />
            </Provider>,
        );

        const button2 = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button2);

        const addButton2 = screen.getByText('Add Diversion');
        expect(addButton2).toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' });
    });

    it('should handle our dropdown positioning correctly', () => {
        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } />
            </Provider>,
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        const dropdown = screen.getByText('Add Diversion').closest('.dropdown-menu');
        expect(dropdown).toBeInTheDocument();
    });

    it('should handle our keyboard navigation', () => {
        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } />
            </Provider>,
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        // Escape key should close dropdown
        fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

        expect(screen.queryByText('Add Diversion')).not.toBeInTheDocument();
    });

    it('should handle our loading states correctly', () => {
        const loadingState = {
            ...defaultProps.state,
            control: {
                diversions: {
                    diversionsForDisruption: {
                        DISR123: [],
                    },
                    diversionResultState: null,
                    isLoading: true,
                },
            },
        };

        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } state={ loadingState } />
            </Provider>,
        );

        // Should still render button even when loading
        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should handle our diversion result state changes', async () => {
        const resultState = {
            ...defaultProps.state,
            control: {
                diversions: {
                    diversionsForDisruption: {
                        DISR123: [],
                    },
                    diversionResultState: {
                        diversionId: 'DIV123',
                        isLoading: false,
                        isSuccess: true,
                        error: null,
                    },
                },
            },
        };

        render(
            <Provider store={ store }>
                <DiversionsButton { ...defaultProps } state={ resultState } />
            </Provider>,
        );

        // Should still render button with result state
        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });
});
