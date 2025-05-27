/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { Provider } from 'react-redux';
import MinimizeDisruptionDetail from './MinimizeDisruptionDetail';
import { STATUSES } from '../../../../types/disruptions-types';
import { useAlertCauses, useAlertEffects } from '../../../../utils/control/alert-cause-effect';

const middlewares = [thunk];
const mockStore = configureStore(middlewares);

jest.mock('../../../../utils/control/alert-cause-effect', () => ({
    useAlertCauses: () => [{ value: 'ACCIDENT', label: 'Accident' }],
    useAlertEffects: () => [{ value: 'SIGNIFICANT_DELAYS', label: 'Significant Delays' }],
}));

const disruptionMock = {
    affectedEntities: [],
    incidentNo: '1234',
    cause: 'ACCIDENT',
    impact: 'SIGNIFICANT_DELAYS',
    disruptionId: 1,
    lastUpdatedTime: '2025-05-27T08:00:00Z',
    recurrent: false,
    mode: 'Bus',
    severity: 'SERIOUS',
    lastUpdatedBy: 'Tester',
    createdTime: '2025-05-25T08:00:00Z',
    createdBy: 'Admin',
    notes: [],
    startTime: '2025-05-27T08:00:00Z',
    endTime: '2025-05-27T09:00:00Z',
    status: STATUSES.DRAFT,
};

const defaultProps = {
    disruption: disruptionMock,
    updateDisruption: jest.fn(),
    isRequesting: false,
    resultDisruptionId: null,
    getRoutesByShortName: jest.fn(),
    shapes: [],
    isLoading: false,
    routeColors: [],
    openCreateDisruption: jest.fn(),
    openCopyDisruption: jest.fn(),
    updateAffectedRoutesState: jest.fn(),
    updateAffectedStopsState: jest.fn(),
    updateEditMode: jest.fn(),
    updateDisruptionToEdit: jest.fn(),
    uploadDisruptionFiles: jest.fn(),
    deleteDisruptionFile: jest.fn(),
    routes: [],
    stops: [],
    boundsToFit: [],
    clearDisruptionActionResult: jest.fn(),
    useDraftDisruptions: true,
};

const mockIncidents = [
    {
        incidentId: 1,
        disruptionId: 1,
        incidentNo: 'DISR0001',
        incidentTitle: 'Incident 1',
        affectedEntities: [],
        cause: 'ACCIDENT',
        impact: 'SIGNIFICANT_DELAYS',
        title: 'Road closure',
        startTime: '2025-05-27T10:00:00Z',
        endTime: '2025-05-27T12:00:00Z',
    },
];

const renderWithStore = (props = {}) => {
    const store = mockStore({
        control:
            {
                disruptions: {
                    disruptions: mockIncidents,
                    activeIncident: null,
                    incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                    isLoading: false,
                    action: {
                        resultDisruptionId: null,
                        isRequesting: false,
                        resultStatus: null,
                        resultMessage: null,
                        resultCreateNotification: false,
                        isCopied: false,
                    },
                    affectedEntities: {
                        affectedRoutes: [],
                        affectedStops: [],
                    },
                },
                appSettings: {
                    useViewDisruptionDetailsPage: true,
                },
            },
    });
    return render(
        <Provider store={ store }>
            <MinimizeDisruptionDetail { ...defaultProps } { ...props } />
        </Provider>,
    );
};

describe('MinimizeDisruptionDetail', () => {
    it('renders component with basic elements', () => {
        renderWithStore();

        expect(screen.getByText(/Preview & Share/i)).toBeInTheDocument();
        expect(screen.getByText(/Copy/i)).toBeInTheDocument();
        expect(screen.getByText(/Save Changes/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Disruption Notes/i)).toBeInTheDocument();
    });

    it('button Save Changes should be enabled', () => {
        renderWithStore();

        const button = screen.getByText(/Save Changes/i);
        expect(button).toBeInTheDocument();

        expect(button).toBeEnabled();
    });

    it('updates disruption notes on input', () => {
        renderWithStore();
        const textarea = screen.getByLabelText(/Disruption Notes/i);

        fireEvent.change(textarea, { target: { value: 'New note here' } });

        expect(textarea.value).toBe('New note here');
    });
});
