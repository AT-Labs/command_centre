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
import thunk from 'redux-thunk';
import { ViewDiversionDetailModal } from './ViewDiversionDetailModal';
import { deleteDiversion } from '../../../../utils/transmitters/disruption-mgt-api';

jest.mock('../../../../utils/transmitters/disruption-mgt-api', () => ({
    ...(jest.requireActual('../../../../utils/transmitters/disruption-mgt-api')),
    deleteDiversion: jest.fn(() => Promise.resolve()),
}));

const mockStore = configureStore([thunk]);
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
const mockDiversions = [{
    diversionId: 'DIV123',
    diversionRouteVariants: [
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
    diversionRouteVariants: [
        {
            diversionId: 'DIV456',
            routeId: 'TMKL-203',
            routeVariantId: 'TMKL-203-1',
            routeVariantName: 'Tamaki Link',
            direction: 'Southbound',
        },
    ],
}];

const mockDisruption = {
    disruption: {
        disruptionId: 93839,
        incidentNo: 'DISR093839',
        diversions: mockDiversions,
    },
    onClose: jest.fn(),
    isOpen: true,
};

const mockOnClose = jest.fn();
describe('<ViewDiversionDetailModal />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders component diversions is not null, but diversionRouteVariants is empty', async () => {
        const mockDiversionsEmpty = [{
            diversionId: 'DIV123',
            diversionRouteVariants: [],
        },
        {
            diversionId: 'DIV456',
            diversionRouteVariants: [],
        },
        ];

        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ mockDiversionsEmpty }
                    setShouldRefetchDiversions={ setShouldRefetchDiversions => setShouldRefetchDiversions(true) }
                    onEditDiversion={ setRefresh => setRefresh(true) }
                    disruption={ mockDisruption.disruption }
                    onClose={ mockDisruption.onClose }
                    isOpen={ mockDisruption.isOpen }
                />,
            ));
        });
        expect(screen.getByText('Close')).toBeInTheDocument();
        expect(mockDiversionsEmpty.length).toBe(2);
    });

    it('toggles "Collapse All" back to "Expand All" on second click', async () => {
        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ mockDiversions }
                    setShouldRefetchDiversions={ jest.fn() }
                    onEditDiversion={ jest.fn() }
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });
        const expandAllButton = screen.getByTestId('expand-all-button');
        expect(expandAllButton).toHaveTextContent('Expand All');
        fireEvent.click(expandAllButton);
        expect(expandAllButton).toHaveTextContent('Collapse All');
        fireEvent.click(expandAllButton);
        expect(expandAllButton).toHaveTextContent('Expand All');
    });

    it('renders no diversions message and hides expand button when diversions is empty', async () => {
        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ [] }
                    setShouldRefetchDiversions={ jest.fn() }
                    onEditDiversion={ jest.fn() }
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });
        expect(screen.getByText('No diversions added to this disruption.')).toBeInTheDocument();
        expect(screen.queryByTestId('expand-all-button')).not.toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('renders "Expand All" button and ActiveDiversionView when diversions is not null', async () => {
        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ mockDiversions }
                    setShouldRefetchDiversions={ jest.fn() }
                    onEditDiversion={ jest.fn() }
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });
        expect(screen.getByTestId('expand-all-button')).toBeInTheDocument();
        expect(screen.getByText('Expand All')).toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('renders Expand All button initially and toggles to Collapse All on click', async () => {
        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ mockDiversions }
                    setShouldRefetchDiversions={ jest.fn() }
                    onEditDiversion={ jest.fn() }
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });
        const expandAllButton = screen.getByTestId('expand-all-button');
        expect(expandAllButton).toBeInTheDocument();
        expect(expandAllButton).toHaveTextContent('Expand All');
        await act(async () => {
            fireEvent.click(expandAllButton);
        });
        expect(expandAllButton).toHaveTextContent('Collapse All');
    });

    it('toggles "Expand All" and "Collapse All" button text on click', async () => {
        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ mockDiversions }
                    setShouldRefetchDiversions={ jest.fn() }
                    onEditDiversion={ jest.fn() }
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });
        const expandAllButton = screen.getByTestId('expand-all-button');
        expect(expandAllButton).toHaveTextContent('Expand All');
        fireEvent.click(expandAllButton);
        expect(expandAllButton).toHaveTextContent('Collapse All');
    });

    it('calls onClose when "Close" button is clicked', async () => {
        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ mockDiversions }
                    setShouldRefetchDiversions={ jest.fn() }
                    onEditDiversion={ jest.fn() }
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });
        const closeButton = screen.getByText('Close');
        fireEvent.click(closeButton);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('renders no diversions message and hides expand button when diversions is null', async () => {
        const emptyMockDiversions = null;
        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ emptyMockDiversions }
                    setShouldRefetchDiversions={ jest.fn() }
                    onEditDiversion={ jest.fn() }
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });

        expect(screen.getByText('No diversions added to this disruption.')).toBeInTheDocument();
        expect(screen.queryByTestId('expand-all-button')).not.toBeInTheDocument();
        expect(screen.getByText('Close')).toBeInTheDocument();
    });
});

describe('<ViewDiversionDetailModal /> - Deleting Operation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders active-diversion-actions with Edit and Delete button', async () => {
        const disruptionNotStarted = {
            ...mockDisruption.disruption,
            status: 'not-started',
        };
        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ mockDiversions }
                    setShouldRefetchDiversions={ jest.fn() }
                    onEditDiversion={ jest.fn() }
                    disruption={ disruptionNotStarted }
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

    it('renders active-diversion-actions without Edit button when disruption is resolved', async () => {
        const disruptionNotStarted = {
            ...mockDisruption.disruption,
            status: 'resolved',
        };
        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ mockDiversions }
                    setShouldRefetchDiversions={ jest.fn() }
                    onEditDiversion={ jest.fn() }
                    disruption={ disruptionNotStarted }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });
        const activeDiversionView = await screen.findByTestId('active-diversion-view');
        expect(activeDiversionView).toBeInTheDocument();

        const { getAllByTestId } = within(activeDiversionView);
        const activeDiversionActions = getAllByTestId('active-diversion-actions');
        expect(activeDiversionActions.length).toBeGreaterThan(0);
        const createIcons = screen.queryAllByTestId('edit-diversion-icon-button');

        // No edit button should be present when disruption is resolved
        expect(createIcons.length).toBe(0);
        const deleteIcons = screen.getAllByTestId('delete-diversion-icon-button');
        expect(deleteIcons.length).toBeGreaterThan(0);
    });

    it('can launch the delete modal correctly', async () => {
        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ mockDiversions }
                    setShouldRefetchDiversions={ jest.fn() }
                    onEditDiversion={ jest.fn() }
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
        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ mockDiversions }
                    setShouldRefetchDiversions={ setShouldRefetchDiversions => setShouldRefetchDiversions(true) }
                    onEditDiversion={ jest.fn() }
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });
        expect(deleteDiversion).toHaveBeenCalledTimes(0);
        const deleteIcons = screen.getAllByTestId('delete-diversion-icon-button');
        await act(async () => {
            const deleteButton = deleteIcons[0];
            fireEvent.click(deleteButton);
        });
        const deleteModalOkButton = screen.getAllByTestId('delete-dialog-ok-button')[0];
        await act(async () => {
            fireEvent.click(deleteModalOkButton);
        });
        expect(deleteDiversion).toHaveBeenCalledTimes(1); // It is deleted
    });

    it('should not call delete API and refresh screen when delete cancelled', async () => {
        await act(async () => {
            render(withCacheProvider(
                <ViewDiversionDetailModal
                    diversions={ mockDiversions }
                    setShouldRefetchDiversions={ setShouldRefetchDiversions => setShouldRefetchDiversions(true) }
                    onEditDiversion={ jest.fn() }
                    disruption={ mockDisruption.disruption }
                    onClose={ mockOnClose }
                    isOpen
                />,
            ));
        });
        expect(deleteDiversion).toHaveBeenCalledTimes(0);
        const deleteIcons = screen.getAllByTestId('delete-diversion-icon-button');
        await act(async () => {
            const deleteButton = deleteIcons[0];
            fireEvent.click(deleteButton);
        });
        const deleteModalCancelButton = screen.getAllByTestId('delete-dialog-cancel-button')[0];
        await act(async () => {
            fireEvent.click(deleteModalCancelButton);
        });
        expect(deleteDiversion).toHaveBeenCalledTimes(0); // It is not deleted
    });
});
