/**
 * @jest-environment jsdom
 */

import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { render, screen, act, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { ViewDiversionDetailModal } from './ViewDiversionDetailModal';
import { getDiversion, deleteDiversion } from '../../../../utils/transmitters/disruption-mgt-api';

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
    deleteDiversion: jest.fn(() => Promise.resolve()),
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

    it('calls onClose when "Close" button is clicked', async () => {
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

        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});

describe('<ViewDiversionDetailModal /> - Deleting Operation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders active-diversion-actions with CreateIcon and Delete button', async () => {
        const mockOnClose = jest.fn();

        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });

        const activeDiversionView = await screen.findByTestId('active-diversion-view');
        expect(activeDiversionView).toBeInTheDocument();

        // Checking to see if the delete/edit buttons are added to active diversion
        const { getAllByTestId } = within(activeDiversionView);
        const activeDiversionActions = getAllByTestId('active-diversion-actions');
        expect(activeDiversionActions.length).toBeGreaterThan(0);

        const createIcons = screen.getAllByTestId('edit-diversion-icon-button');
        expect(createIcons.length).toBeGreaterThan(0);

        const deleteIcons = screen.getAllByTestId('delete-diversion-icon-button');
        expect(deleteIcons.length).toBeGreaterThan(0);
    });

    it('can launch the delete modal correctly', async () => {
        const mockOnClose = jest.fn();

        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });

        const deleteIcons = screen.getAllByTestId('delete-diversion-icon-button');
        await act(async () => {
            const deleteButton = deleteIcons[0];
            fireEvent.click(deleteButton);
        });

        const deleteModalCancelButton = screen.getAllByTestId('delete-dialog-cancel-button');
        expect(deleteModalCancelButton.length).toBe(1);
    });

    it('should call delete API and refresh screen when delete confimed', async () => {
        const mockOnClose = jest.fn();

        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });

        expect(deleteDiversion).toHaveBeenCalledTimes(0);
        expect(getDiversion).toHaveBeenCalledTimes(1);

        const deleteIcons = screen.getAllByTestId('delete-diversion-icon-button');
        await act(async () => {
            const deleteButton = deleteIcons[0];
            fireEvent.click(deleteButton);
        });

        const deleteModalOkButton = screen.getAllByTestId('delete-dialog-ok-button')[0];
        await act(async () => {
            fireEvent.click(deleteModalOkButton);
        });

        expect(getDiversion).toHaveBeenCalledTimes(2); // It is refreshed
        expect(deleteDiversion).toHaveBeenCalledTimes(1); // It is deleted
    });

    it('should not call delete API and refresh screen when delete cancelled', async () => {
        const mockOnClose = jest.fn();

        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });

        expect(deleteDiversion).toHaveBeenCalledTimes(0);
        expect(getDiversion).toHaveBeenCalledTimes(1);

        const deleteIcons = screen.getAllByTestId('delete-diversion-icon-button');
        await act(async () => {
            const deleteButton = deleteIcons[0];
            fireEvent.click(deleteButton);
        });

        const deleteModalCancelButton = screen.getAllByTestId('delete-dialog-cancel-button')[0];
        await act(async () => {
            fireEvent.click(deleteModalCancelButton);
        });

        expect(getDiversion).toHaveBeenCalledTimes(1); // It is not refreshed
        expect(deleteDiversion).toHaveBeenCalledTimes(0); // It is not deleted
    });
});
