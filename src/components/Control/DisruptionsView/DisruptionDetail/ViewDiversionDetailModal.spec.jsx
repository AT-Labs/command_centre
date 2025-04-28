/**
 * @jest-environment jsdom
 */

import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { ViewDiversionDetailModal } from './ViewDiversionDetailModal';

jest.mock('../../../../utils/transmitters/disruption-mgt-api', () => ({
    getDiversion: jest.fn(() => Promise.resolve([
        {
            diversionId: 'DIV123',
            tripModifications: [
                {
                    diversionId: 'DIV123',
                    routeId: 'NX2-203',
                    routeVariantId: 'NX2-203-1',
                    routeVariantName: 'North Express 2',
                    direction: 'Northbound',
                },
            ],
        },
        {
            diversionId: 'DIV543',
            tripModifications: [
                {
                    diversionId: 'DIV456',
                    routeId: 'TMKL-203',
                    routeVariantId: 'TMKL-203-1',
                    routeVariantName: 'Tamaki Link',
                    direction: 'Southbound',
                },
            ],
        },
    ])),
}));

const mockStore = configureStore([]);

const store = mockStore({
    realtime: {
        layers: {
            fetchDiversionDetails: true,
        },
    },
});

const cache = createCache({ key: 'blah' });
const withCacheProvider = children => (
    <Provider store={ store }>
        <CacheProvider value={ cache }>
            {children}
        </CacheProvider>
    </Provider>
);

const mockDisruption = {
    disruption: {
        disruptionId: 93839,
        incidentNo: 'DISR093839',
        diversions: [
            {
                diversionId: 'DIV123',
                tripModifications: [
                    {
                        diversionId: 'DIV123',
                        routeId: 'NX2-203',
                        routeVariantId: 'NX2-203-1',
                        routeVariantName: 'North Express 2',
                        direction: 'Northbound',
                    },
                ],
            },
            {
                diversionId: 'DIV456',
                tripModifications: [
                    {
                        diversionId: 'DIV456',
                        routeId: 'TMKL-203',
                        routeVariantId: 'TMKL-203-1',
                        routeVariantName: 'Tamaki Link',
                        direction: 'Southbound',
                    },
                ],
            },
        ],
    },
    onClose: jest.fn(),
    isOpen: true,
};

describe('<ViewDiversionDetailModal />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly when diversions is null', async () => {
        const mockOnClose = jest.fn();
        render(withCacheProvider(
            <ViewDiversionDetailModal
                disruption={ mockDisruption }
                onClose={ mockOnClose }
                isOpen
            />,
        ));

        expect(screen.getByTestId('active-diversion-detail')).toBeInTheDocument();
        expect(screen.getByText(`Diversions on Disruption ${mockDisruption.incidentNo}`)).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
        expect(screen.queryByTestId('expand-all-button')).not.toBeInTheDocument();
    });

    it('renders "Expand All" button and ActiveDiversionView when diversions is not null', async () => {
        const mockDiversions = [{ id: 1, name: 'Diversion 1' }];
        const mockOnClose = jest.fn();

        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    disruption={ mockDisruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });

        await act(async () => {
            const setDiversions = jest.fn();
            setDiversions(mockDiversions);
        });

        expect(screen.getByTestId('expand-all-button')).toBeInTheDocument();
        expect(screen.getByText('Expand All')).toBeInTheDocument();
    });

    it('toggles "Expand All" and "Collapse All" button text on click', async () => {
        const mockDiversions = [{ id: 1, name: 'Diversion 1' }];
        const mockOnClose = jest.fn();

        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    disruption={ mockDisruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });

        await act(async () => {
            const setDiversions = jest.fn();
            setDiversions(mockDiversions);
        });

        const expandAllButton = screen.getByTestId('expand-all-button');
        expect(expandAllButton).toHaveTextContent('Expand All');

        fireEvent.click(expandAllButton);
        expect(expandAllButton).toHaveTextContent('Collapse All');
    });

    it('calls onClose when "Close" button is clicked', () => {
        const mockOnClose = jest.fn();
        act(() => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    disruption={ mockDisruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});
