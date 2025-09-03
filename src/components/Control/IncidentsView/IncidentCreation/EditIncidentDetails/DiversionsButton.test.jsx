import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DiversionsButton from './DiversionsButton';

const mockStore = configureStore([]);

describe('DiversionsButton', () => {
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
                        DISR123: []
                    },
                    diversionResultState: null
                }
            }
        },
        fetchDiversionsAction: jest.fn(),
        clearDiversionsCacheAction: jest.fn()
    };

    beforeEach(() => {
        store = mockStore({
            control: {
                diversions: {
                    diversionsForDisruption: {
                        DISR123: []
                    },
                    diversionResultState: null
                }
            }
        });
    });

    it('should render when useDiversionFlag is true', () => {
        render(
            <Provider store={store}>
                <DiversionsButton {...defaultProps} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(0\)/)).toBeInTheDocument();
    });

    it('should not render when useDiversionFlag is false', () => {
        render(
            <Provider store={store}>
                <DiversionsButton {...defaultProps} useDiversionFlag={false} />
            </Provider>
        );

        expect(screen.queryByText(/Diversions/)).not.toBeInTheDocument();
    });

    it('should show correct diversion count', () => {
        const propsWithDiversions = {
            ...defaultProps,
            state: {
                control: {
                    diversions: {
                        diversionsForDisruption: {
                            DISR123: [
                                { diversionId: 'DIV1' },
                                { diversionId: 'DIV2' }
                            ]
                        },
                        diversionResultState: null
                    }
                }
            }
        };

        render(
            <Provider store={store}>
                <DiversionsButton {...propsWithDiversions} />
            </Provider>
        );

        expect(screen.getByText(/Diversions\(2\)/)).toBeInTheDocument();
    });

    it('should open dropdown menu when button is clicked', () => {
        render(
            <Provider store={store}>
                <DiversionsButton {...defaultProps} />
            </Provider>
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        expect(screen.getByText('Add Diversion')).toBeInTheDocument();
        expect(screen.getByText('View & Edit Diversions')).toBeInTheDocument();
    });

    it('should call openDiversionManager when Add Diversion is clicked', async () => {
        render(
            <Provider store={store}>
                <DiversionsButton {...defaultProps} />
            </Provider>
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

    it('should call onViewDiversions when View & Edit Diversions is clicked', () => {
        render(
            <Provider store={store}>
                <DiversionsButton {...defaultProps} />
            </Provider>
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        const viewButton = screen.getByText('View & Edit Diversions');
        fireEvent.click(viewButton);

        expect(defaultProps.onViewDiversions).toHaveBeenCalled();
    });

    it('should close dropdown when clicking outside', async () => {
        render(
            <Provider store={store}>
                <DiversionsButton {...defaultProps} />
            </Provider>
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        expect(screen.getByText('Add Diversion')).toBeInTheDocument();


        fireEvent.mouseDown(document.body);

        await waitFor(() => {
            expect(screen.queryByText('Add Diversion')).not.toBeInTheDocument();
        });
    });

    it('should disable Add Diversion when disruption is resolved', () => {
        const resolvedDisruption = {
            ...mockDisruption,
            status: 'resolved'
        };

        render(
            <Provider store={store}>
                <DiversionsButton {...defaultProps} disruption={resolvedDisruption} />
            </Provider>
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        const addButton = screen.getByText('Add Diversion');
        expect(addButton).toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' });
    });

    it('should disable Add Diversion when no bus routes available', () => {
        const disruptionWithoutBusRoutes = {
            ...mockDisruption,
            affectedEntities: [
                { routeId: 'ROUTE1', routeType: 1, stopCode: 'STOP1' }
            ]
        };

        render(
            <Provider store={store}>
                <DiversionsButton {...defaultProps} disruption={disruptionWithoutBusRoutes} />
            </Provider>
        );

        const button = screen.getByText(/Diversions\(0\)/);
        fireEvent.click(button);

        const addButton = screen.getByText('Add Diversion');
        expect(addButton).toHaveStyle({ cursor: 'not-allowed', opacity: '0.5' });
    });
});