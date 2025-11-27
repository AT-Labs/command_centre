/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import moment from 'moment';
import { IncidentsDataGrid } from './IncidentsDataGrid';
import { STATUSES } from '../../../types/disruptions-types';

jest.mock('@mui/utils/capitalize', () => ({
    __esModule: true,
    default: val => (
        typeof val === 'string' ? val.charAt(0).toUpperCase() + val.slice(1) : ''
    ),
}));

jest.mock('../DisruptionsView/DisruptionDetailView/MinimizeDisruptionDetail', () => () => <div data-testid="mock-detail">Mock Disruption</div>);

const mockStore = configureStore([]);

const mockIncident = {
    incidentId: 138772,
    mode: 'Train',
    cause: 'CAPACITY_ISSUE',
    startTime: '2025-07-21T01:27:00.000Z',
    endTime: null,
    status: 'not-started',
    header: 'test rec incident n1327',
    version: 1,
    duration: '3',
    recurrent: true,
    source: 'UI',
    notes: [],
    severity: 'SERIOUS',
    disruptions: [
        139110,
    ],
    incidentDisruptionNo: 'CCD138772',
    path: [
        'CCD138772',
    ],
};

const mockDisruption = {
    disruptionId: 139110,
    incidentNo: 'DISR139110',
    mode: 'Train',
    affectedEntities: [
        {
            routeId: 'WEST-201',
            routeShortName: 'WEST',
            routeType: 2,
            type: 'route',
            notes: [],
        },
    ],
    impact: 'DELAYS_AND_CANCELLATIONS',
    cause: 'CAPACITY_ISSUE',
    startTime: '2025-07-21T01:27:00.000Z',
    endTime: '2025-07-30T05:27:00.000Z',
    status: 'in-progress',
    lastUpdatedTime: '2025-07-21T01:28:20.655Z',
    lastUpdatedBy: 'artem.batulev@propellerhead.co.nz',
    description: null,
    createdBy: 'artem.batulev@propellerhead.co.nz',
    createdTime: '2025-07-21T01:28:20.655Z',
    header: 'test rec incident n1327',
    feedEntityId: 'f0f4a2aa-08a6-4f88-95c7-349923942f70',
    uploadedFiles: null,
    createNotification: false,
    exemptAffectedTrips: null,
    version: 1,
    duration: '4',
    activePeriods: [
        {
            endTime: 1753075620,
            startTime: 1753061220,
        },
    ],
    recurrencePattern: {
        freq: 2,
        until: '2025-07-30T13:27:00.000Z',
        dtstart: '2025-07-21T13:27:00.000Z',
        byweekday: [
            0,
            1,
            2,
        ],
    },
    recurrent: true,
    workarounds: [],
    notes: [],
    severity: 'SERIOUS',
    passengerCount: null,
    incidentId: 138772,
    incidentTitle: 'test rec incident n1327',
    incidentDisruptionNo: 'CCD138772',
};

const mockIncidents = [mockIncident, mockDisruption];
describe('IncidentDataGrid Component', () => {
    let store;

    const defaultProps = {
        mergedIncidentsAndDisruptions: mockIncidents,
        setIncidentToUpdate: jest.fn(),
    };

    beforeEach(() => {
        store = mockStore({
            control:
                {
                    incidents: {
                        incidents: [mockIncident],
                        disruptions: [mockDisruption],
                        activeIncident: null,
                        incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                        isLoading: false,
                    },
                    datagridConfig: {
                        columns: [],
                        page: 0,
                        pageSize: 100,
                        sortModel: [],
                        density: 'standard',
                        routeSelection: '',
                        filterModel: { items: [], linkOperator: 'and' },
                        pinnedColumns: { right: ['__go_to_disruption_details__', '__go_to_notification__', '__detail_panel_toggle__'] },
                    },
                },
            appSettings: {
                useViewDisruptionDetailsPage: true,
            },
        });

        jest.clearAllMocks();
    });

    it('renders without crashing and displays column headers', () => {
        render(
            <Provider store={ store }>
                <IncidentsDataGrid { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('DISRUPTION#')).toBeInTheDocument();
        expect(screen.getByText('DISRUPTION TITLE')).toBeInTheDocument();
        expect(screen.getByText('ROUTES')).toBeInTheDocument();
        expect(screen.getByText('STOPS')).toBeInTheDocument();
        expect(screen.getByText('EFFECT#')).toBeInTheDocument();
    });

    it('renders the correct number of parent and child rows based on incidents prop', async () => {
        const { container } = render(
            <Provider store={ store }>
                <IncidentsDataGrid { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByLabelText('see children');
        expect(button).not.toBeNull();
        fireEvent.click(button);

        const parentRows = container.querySelectorAll('.incidents-custom-data-grid-parent-row');
        const childRows = container.querySelectorAll('.incidents-custom-data-grid-child-row');
        expect(parentRows.length).toBe(1);
        expect(childRows.length).toBe(1);
    });

    it('displays empty table when no data provided', () => {
        const propsWithoutIncidents = {
            mergedIncidentsAndDisruptions: [],
        };
        const storeWithoutIncidents = mockStore({
            control:
                {
                    incidents: {
                        incidents: [],
                        disruptions: [],
                        activeIncident: null,
                        incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                        isLoading: true,
                    },
                },
            appSettings: {
                useViewDisruptionDetailsPage: true,
            },
        });
        const { container } = render(
            <Provider store={ storeWithoutIncidents }>
                <IncidentsDataGrid { ...propsWithoutIncidents } />
            </Provider>,
        );
        const parentRows = container.querySelectorAll('.incidents-custom-data-grid-parent-row');
        expect(parentRows.length).toBe(0);
    });

    it('opens the calls function with correct data when "Open & Edit Disruption" button is clicked for parent row', async () => {
        const setIncidentToUpdate = jest.fn();
        const updateEditMode = jest.fn();
        render(
            <Provider store={ store }>
                <IncidentsDataGrid
                    { ...defaultProps }
                    setIncidentToUpdate={ setIncidentToUpdate }
                    updateEditMode={ updateEditMode }
                />
            </Provider>,
        );

        const buttons = screen.getAllByLabelText('open-edit-incident');
        expect(buttons.length).toBeGreaterThan(0);
        const firstButton = buttons[0];

        fireEvent.click(firstButton);
        expect(setIncidentToUpdate).toHaveBeenCalledWith(138772, undefined);
    });

    it('opens the calls function with correct data when "Open & Edit Disruption" button is clicked for child row', async () => {
        const setIncidentToUpdate = jest.fn();
        const updateEditMode = jest.fn();
        render(
            <Provider store={ store }>
                <IncidentsDataGrid
                    { ...defaultProps }
                    setIncidentToUpdate={ setIncidentToUpdate }
                    updateEditMode={ updateEditMode }
                />
            </Provider>,
        );

        const button = screen.getByLabelText('see children');
        expect(button).not.toBeNull();

        fireEvent.click(button);

        const buttons = screen.getAllByLabelText('open-edit-incident');
        expect(buttons.length).toBeGreaterThan(0);

        const childButton = buttons[1];

        fireEvent.click(childButton);
        expect(setIncidentToUpdate).toHaveBeenCalledWith(138772, 'DISR139110');
    });

    it('renders form when child row is expanded', () => {
        const updateActiveDisruptionId = jest.fn();
        const updateCopyDisruptionState = jest.fn();
        render(
            <Provider store={ store }>
                <IncidentsDataGrid
                    { ...defaultProps }
                    updateActiveDisruptionId={ updateActiveDisruptionId }
                    updateCopyDisruptionState={ updateCopyDisruptionState }
                />
            </Provider>,
        );
        const button = screen.getByLabelText('see children');
        expect(button).not.toBeNull();

        fireEvent.click(button);

        const expandButtons = screen.getAllByLabelText('Expand');
        expect(button).not.toBeNull();
        const childButton = expandButtons[1];

        fireEvent.click(childButton);

        expect(screen.getByText('Mock Disruption', { exact: true, trim: true })).toBeInTheDocument();
    });

    describe('endTime valueGetter for recurrent DRAFT disruptions', () => {
        it('should not display endTime when endTime is null for recurrent DRAFT disruption', async () => {
            const mockDraftDisruption = {
                ...mockDisruption,
                status: STATUSES.DRAFT,
                startTime: '2025-07-21T08:00:00.000Z',
                duration: '3',
                endTime: null,
                recurrent: true,
            };

            const props = {
                ...defaultProps,
                mergedIncidentsAndDisruptions: [mockIncident, mockDraftDisruption],
            };

            const { container } = render(
                <Provider store={ store }>
                    <IncidentsDataGrid { ...props } />
                </Provider>,
            );

            const expandButton = screen.getByLabelText('see children');
            fireEvent.click(expandButton);

            const childRow = container.querySelector('.incidents-custom-data-grid-child-row');
            expect(childRow).toBeInTheDocument();
            
            const cells = childRow.querySelectorAll('.MuiDataGrid-cell');
            const endTimeCell = Array.from(cells).find(cell => {
                const field = cell.getAttribute('data-field');
                return field === 'endTime';
            }) || cells[7];
            
            expect(endTimeCell?.textContent?.trim()).toBe('');
        });

        it('should combine saved date with calculated time for recurrent DRAFT disruption with saved endTime', async () => {
            const mockDraftDisruption = {
                ...mockDisruption,
                status: STATUSES.DRAFT,
                startTime: '2025-07-21T08:00:00.000Z',
                duration: '3',
                endTime: '2025-07-25T10:00:00.000Z',
                recurrent: true,
            };

            const props = {
                ...defaultProps,
                mergedIncidentsAndDisruptions: [mockIncident, mockDraftDisruption],
            };

            const { container } = render(
                <Provider store={ store }>
                    <IncidentsDataGrid { ...props } />
                </Provider>,
            );

            const expandButton = screen.getByLabelText('see children');
            fireEvent.click(expandButton);

            const savedEndTime = moment('2025-07-25T10:00:00.000Z');
            const calculatedTime = moment('2025-07-21T08:00:00.000Z').add(3, 'hours');
            const expectedEndTime = savedEndTime.hour(calculatedTime.hour()).minute(calculatedTime.minute()).toISOString();
            const expectedFormattedTime = moment(expectedEndTime).format('DD/MM/YY HH:mm');

            expect(container.textContent).toContain(expectedFormattedTime);
        });
    });
});
