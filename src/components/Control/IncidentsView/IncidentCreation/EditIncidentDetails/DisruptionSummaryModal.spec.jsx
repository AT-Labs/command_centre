/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { isEmpty } from 'lodash-es';
import DisruptionSummaryModal from './DisruptionSummaryModal';
import { shareToEmail } from '../../../../../utils/control/disruption-sharing';
import { useAlertCauses, useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import { momentFromDateTime } from '../../../../../utils/control/disruptions';

const mockStore = configureStore([thunk]);

jest.useFakeTimers();

const mockDisruption = {
    key: 'DISR123',
    incidentNo: 'DISR123',
    impact: 'BREAKDOWN',
    startTime: '06:00',
    startDate: '09/03/2022',
    endTime: '06:00',
    endDate: '10/03/2022',
    cause: 'CAPACITY_ISSUE',
    mode: '-',
    status: 'not-started',
    header: 'Incident Title',
    createNotification: false,
    recurrent: true,
    duration: '2',
    recurrencePattern: {
        freq: 2,
        dtstart: new Date('2022-03-09T06:00:00.000Z'),
        until: new Date('2022-03-10T06:00:00.000Z'),
        byweekday: [0],
    },
    severity: 'MINOR',
    affectedEntities: {
        affectedRoutes: [{
            category: { type: 'route', icon: '', label: 'Routes' },
            labelKey: 'routeShortName',
            routeId: 'WEST-201',
            routeShortName: 'WEST',
            routeType: 2,
            text: 'WEST',
            type: 'route',
            valueKey: 'routeId',
        }],
        affectedStops: [{
            category: { type: 'stop', icon: '', label: 'Stops' },
            stopCode: '100',
            text: '100 - test',
            type: 'stop',
            valueKey: 'stopCode',
        }],
    },
    workarounds: [],
    notes: [
        {
            createdTime: '2022-03-09T06:00:00.000Z',
            createdBy: 'username@test.com',
            description: 'test description',
        },
    ],
};

jest.mock('../../../../../utils/control/alert-cause-effect', () => ({
    useAlertCauses: jest.fn(),
    useAlertEffects: jest.fn(),
}));

jest.mock('../../../../../utils/control/disruption-sharing', () => ({
    shareToEmail: jest.fn(),
}));

describe('DisruptionSummaryModal Component', () => {
    let store;

    const defaultProps = {
        toggleIncidentModals: jest.fn(),
        setRequestToUpdateEditEffectState: jest.fn(),
        setRequestedDisruptionKeyToUpdateEditEffect: jest.fn(),
        discardChanges: jest.fn(),
        isModalOpen: true,
        disruption: mockDisruption,
        onClose: jest.fn(),
    };

    beforeEach(() => {
        useAlertCauses.mockReturnValue([
            { value: '', label: '' },
            { value: 'BREAKDOWN', label: 'Breakdown' },
            { value: 'INCIDENT', label: 'Incident' },
            { value: 'CONGESTION', label: 'Congestion' },
        ]);

        useAlertEffects.mockReturnValue([
            { label: '', value: '' },
            { label: '123', value: '123' },
            { label: 'Buses replace trains', value: 'BUSES_REPLACE_TRAINS' },
            { label: 'Bus replaces ferry', value: 'BUS_REPLACES_FERRY' },
            { label: 'Cancellations', value: 'CANCELLATIONS' },
        ]);
        store = mockStore({
            control:
                {
                    incidents: {
                        incidents: {},
                        disruptions: [],
                        isLoading: false,
                        affectedEntities: [],
                        isCreateEnabled: false,
                        activeIncident: null,
                        incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                    },
                },
            appSettings: {
                useDisruptionEmailFormat: 'true',
                useDraftDisruptions: 'true',
                useDisruptionDraftEmailSharing: 'true',
                useEditDisruptionNotes: 'true',
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Renders without crashing and displays disruption summary modal', () => {
        render(
            <Provider store={ store }>
                <DisruptionSummaryModal { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('Summary for Disruption #DISR123')).toBeInTheDocument();
        expect(screen.getByText('Disruption Title')).toBeInTheDocument();
        expect(screen.getByText('test description')).toBeInTheDocument();
    });

    it('Trigger share to email on click', () => {
        render(
            <Provider store={ store }>
                <DisruptionSummaryModal { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /share to email/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);

        const startTimeMoment = momentFromDateTime(mockDisruption.startDate, mockDisruption.startTime);
        let endTimeMoment;
        if (!isEmpty(mockDisruption.endDate) && !isEmpty(mockDisruption.endTime)) {
            endTimeMoment = momentFromDateTime(mockDisruption.endDate, mockDisruption.endTime);
        }
        const mergedEntities = [
            ...(mockDisruption.affectedEntities.affectedStops || []),
            ...(mockDisruption.affectedEntities.affectedRoutes || []),
        ];
        const expectedDisruptionToShare = {
            ...mockDisruption,
            endTime: endTimeMoment,
            startTime: startTimeMoment,
            affectedEntities: mergedEntities,
        };

        expect(shareToEmail).toHaveBeenCalledWith(expectedDisruptionToShare);
    });

    it('Close the modal after clicking the close button', () => {
        render(
            <Provider store={ store }>
                <DisruptionSummaryModal { ...defaultProps } />
            </Provider>,
        );

        const button = screen.getByText('Close');
        expect(button).not.toBeNull();
        fireEvent.click(button);

        expect(defaultProps.onClose).toHaveBeenCalled();
    });
});
