/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom';
import { IncidentsDisruptions } from './IncidentsDisruptions';
import { useAlertEffects } from '../../../utils/control/alert-cause-effect';

jest.mock('@mui/utils/capitalize', () => ({
    __esModule: true,
    default: val => (
        typeof val === 'string' ? val.charAt(0).toUpperCase() + val.slice(1) : ''
    ),
}));

const mockStore = configureStore([]);

const mockProps = {
    updateDisruptionsDatagridConfig: jest.fn(),
    updateActiveDisruptionId: jest.fn(),
    updateCopyDisruptionState: jest.fn(),
    goToNotificationsView: jest.fn(),
};

const mockIncidents = [
    { incidentId: 1, disruptionId: 1, incidentNo: 'DISR0001', incidentTitle: 'Incident 1', affectedEntities: [], impact: 'REDUCED_FREQUENCY' },
    { incidentId: 2, disruptionId: 2, incidentNo: 'DISR0002', incidentTitle: 'Incident 2', affectedEntities: [], impact: 'REDUCED_FREQUENCY' },
];

const disruption = {
    disruptionId: 893,
    incidentNo: 'DISR000893',
    mode: 'Bus',
    affectedEntities: [],
    impact: 'SIGNIFICANT_DELAYS',
    cause: 'TECHNICAL_PROBLEM',
    startTime: '2022-01-21T00:33:00.000Z',
    endTime: null,
    status: 'in-progress', // Ensure this is a valid string
    lastUpdatedTime: '2022-01-23T21:09:36.735Z',
    lastUpdatedBy: 'tester.test@at.govt.nz',
    description: 'Description',
    createNotification: true, // Ensure this is defined
    recurrent: false,
};

const disruptionRow = {
    disruptionId: 893,
    incidentNo: 'DISR000893',
    mode: 'Bus',
    affectedEntities: [
        {
            routeId: '22N-202',
            routeShortName: '22N',
            routeType: 3,
        },
        {
            routeId: '20-202',
            routeShortName: '20',
            routeType: 3,
        },
    ],
    impact: 'SIGNIFICANT_DELAYS',
    cause: 'TECHNICAL_PROBLEM',
    startTime: '2022-01-21T00:33:00.000Z',
    endTime: null,
    status: 'in-progress',
    lastUpdatedTime: '2022-01-23T21:09:36.735Z',
    lastUpdatedBy: 'tester.test@at.govt.nz',
    description: 'Description',
    createdBy: 'teter.test@propellerhead.co.nz',
    createdTime: '2022-01-21T00:33:23.421Z',
    url: '',
    header: 'Title',
    feedEntityId: 'bcbfeba3-899d-4870-a5bc-78134812656d',
    uploadedFiles: null,
    createNotification: true,
    exemptAffectedTrips: null,
    version: 1,
    duration: '',
    activePeriods: [
        {
            endTime: null,
            startTime: 1642725180,
        },
    ],
    recurrencePattern: null,
    recurrent: false,
    workarounds: [],
    notes: [],
    severity: 'UNKNOWN',
    passengerCount: null,
    incidentId: null,
    incidentTitle: null,
};

jest.mock('../../../utils/control/alert-cause-effect', () => ({
    useAlertEffects: jest.fn(),
}));

describe('IncidentsDisruptions Component', () => {
    let store;

    beforeEach(() => {
        useAlertEffects.mockReturnValue([
            { value: '', label: '' },
            { value: 'SIGNIFICANT_DELAYS', label: 'Significant Delays' },
            { value: 'REDUCED_FREQUENCY', label: 'Reduced Frequency' },
            { value: 'NO_SERVICE', label: 'No Service' },
        ]);

        store = mockStore({
            control:
                {
                    incidents: {
                        disruptions: [mockIncidents],
                        activeIncident: null,
                        incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                        isLoading: false,
                    },
                },
            appSettings: {
                useViewDisruptionDetailsPage: true,
            },
        });
    });

    it('renders without crashing', () => {
        render(
            <Provider store={ store }>
                <IncidentsDisruptions
                    disruptions={ [disruption] }
                />
            </Provider>,
        );

        expect(screen.getByText('#EFFECT')).toBeInTheDocument();
        expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('displays icons for disruption label', () => {
        render(
            <Provider store={ store }>
                <IncidentsDisruptions
                    disruptions={ mockIncidents }
                />
            </Provider>,
        );

        const paperclipIcon = document.querySelector('svg');
        expect(paperclipIcon).toBeInTheDocument();
    });

    it('calls updateActiveDisruptionId when row is expanded', () => {
        const updateActiveDisruptionId = jest.fn();
        const customProps = {
            ...mockProps,
            datagridConfig: {},
            disruptions: [disruptionRow],
            activeDisruptionId: 1,
            useDisruptionsNotificationsDirectLink: true,
            useViewDisruptionDetailsPage: false,
            updateActiveDisruptionId,
        };

        render(
            <Provider store={ store }>
                <IncidentsDisruptions { ...customProps } />
            </Provider>,
        );
        const button = screen.getByLabelText('Expand');
        expect(button).toBeInTheDocument();
        fireEvent.click(button);

        expect(updateActiveDisruptionId).toHaveBeenCalledWith(disruptionRow.disruptionId);
    });

    it('renders notification icon if useDisruptionsNotificationsDirectLink is true', () => {
        render(
            <Provider store={ store }>
                <IncidentsDisruptions
                    { ...mockProps }
                    datagridConfig={ {} }
                    disruptions={ [disruptionRow] }
                    activeDisruptionId={ null }
                    useViewDisruptionDetailsPage={ false }
                    useDisruptionsNotificationsDirectLink
                />
            </Provider>,
        );

        const notificationButton = screen.getByLabelText('view-notification');
        expect(notificationButton).toBeInTheDocument();
    });

    it('calls goToNotificationsView on notification icon click', () => {
        render(
            <Provider store={ store }>
                <IncidentsDisruptions
                    { ...mockProps }
                    datagridConfig={ {} }
                    disruptions={ [disruptionRow] }
                    activeDisruptionId={ null }
                    useViewDisruptionDetailsPage={ false }
                    useDisruptionsNotificationsDirectLink
                />
            </Provider>,
        );

        const button = screen.getByLabelText('view-notification');
        fireEvent.click(button);

        expect(mockProps.goToNotificationsView).toHaveBeenCalledWith({
            disruptionId: disruptionRow.disruptionId,
            version: disruptionRow.version,
            source: 'DISR',
        });
    });

    it('handles empty disruptions array gracefully', () => {
        render(
            <Provider store={ store }>
                <IncidentsDisruptions disruptions={ [] } { ...mockProps } />
            </Provider>,
        );
        expect(screen.queryByText('Title')).toBeInTheDocument();
    });

    it('disables notification button for draft disruptions', () => {
        const draftDisruption = { ...disruptionRow, status: 'draft' };
        render(
            <Provider store={ store }>
                <IncidentsDisruptions
                    { ...mockProps }
                    disruptions={ [draftDisruption] }
                    useDisruptionsNotificationsDirectLink
                    useViewDisruptionDetailsPage={ false }
                />
            </Provider>,
        );
        const button = screen.getByLabelText('view-notification');
        expect(button).toBeDisabled();
    });
});
