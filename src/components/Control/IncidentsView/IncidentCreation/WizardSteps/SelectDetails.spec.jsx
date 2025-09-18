/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { RRule } from 'rrule';
import { SelectDetails } from './SelectDetails';
import { STATUSES, DISRUPTION_TYPE, DEFAULT_SEVERITY } from '../../../../../types/disruptions-types';
import { DEFAULT_CAUSE } from '../../../../../types/disruption-cause-and-effect';
import { useAlertCauses, useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import EDIT_TYPE from '../../../../../types/edit-types';

const mockStore = configureStore([thunk]);

jest.useFakeTimers();

jest.mock('react-flatpickr', () => props => (
    // eslint-disable-next-line react/prop-types
    <input data-testid={ props['data-testid'] } id={ props.id } value={ props.value } onChange={ e => props.onChange([new Date(e.target.value)]) } />
));

const defaultIncidentData = {
    startTime: '',
    startDate: '',
    endTime: '',
    endDate: '',
    cause: DEFAULT_CAUSE.value,
    activePeriods: [],
    mode: '-',
    status: STATUSES.NOT_STARTED,
    header: '',
    url: '',
    createNotification: false,
    recurrent: false,
    duration: '',
    recurrencePattern: { freq: RRule.WEEKLY },
    disruptionType: DISRUPTION_TYPE.ROUTES,
    severity: DEFAULT_SEVERITY.value,

    notes: '',
    disruptions: [],
    modalOpenedTime: new Date('2025-06-19T06:00:00.000Z'),
};

const filledIncidentData = {
    startTime: '06:00',
    startDate: '20/06/2025',
    endTime: '06:00',
    endDate: '28/06/2025',
    status: STATUSES.NOT_STARTED,
    header: 'Incident Test Title',
    url: 'https://at.govt.nz',
    disruptionType: DISRUPTION_TYPE.ROUTES,
    severity: 'MINOR',
    cause: 'CONGESTION',
    activePeriods: [],
    mode: '-',
    createNotification: false,
    recurrent: false,
    duration: '',
    recurrencePattern: { freq: RRule.WEEKLY },

    notes: '',
    disruptions: [],
    modalOpenedTime: new Date('2025-06-19T06:00:00.000Z'),
};

const filledRecurrentIncidentData = {
    startTime: '06:00',
    startDate: '20/06/2025',
    endTime: '',
    endDate: '28/06/2025',
    status: STATUSES.NOT_STARTED,
    header: 'Incident Test Title',
    url: 'https://at.govt.nz',
    disruptionType: DISRUPTION_TYPE.ROUTES,
    severity: 'MINOR',
    cause: 'CONGESTION',
    activePeriods: [],
    mode: '-',
    createNotification: false,
    recurrent: true,
    duration: '2',
    recurrencePattern: {
        freq: 2,
        dtstart: new Date('2025-06-20T06:00:00.000Z'),
        until: new Date('2025-06-28T06:00:00.000Z'),
        byweekday: [1, 3],
    },

    notes: '',
    disruptions: [],
    modalOpenedTime: new Date('2025-06-19T06:00:00.000Z'),
};

const mockTimeForModalOpenedTime = new Date('2025-06-19T06:00:00.000Z');

const incidentForEdit = {
    incidentId: 139273,
    mode: 'Bus',
    cause: 'CONGESTION',
    startTime: '2025-06-21T20:27:00.000Z',
    endTime: null,
    status: 'not-started',
    header: 'test incident n0827',
    url: '',
    version: 1,
    recurrencePattern: null,
    duration: '',
    recurrent: false,
    source: 'UI',
    notes: [],
    severity: 'HEADLINE',
    disruptions: [
        {
            disruptionId: 139535,
            incidentNo: 'DISR139535',
            mode: 'Bus',
            affectedEntities: [
                {
                    routeId: '101-202',
                    routeShortName: '101',
                    routeType: 3,
                    type: 'route',
                    notes: [],
                },
                {
                    routeId: '105-202',
                    routeShortName: '105',
                    routeType: 3,
                    type: 'route',
                    notes: [],
                },
            ],
            impact: 'ESCALATOR_NOT_WORKING',
            cause: 'CONGESTION',
            startTime: '2025-06-21T20:27:00.000Z',
            endTime: null,
            status: 'in-progress',
            lastUpdatedTime: '2025-06-21T20:27:33.201Z',
            lastUpdatedBy: 'aqwe@propellerhead.co.nz',
            description: null,
            createdBy: 'aqwe@propellerhead.co.nz',
            createdTime: '2025-06-21T20:27:33.201Z',
            url: '',
            header: 'test incident n0827',
            feedEntityId: 'eacda2bb-baf4-44dc-9b11-bd2c15021ff1',
            uploadedFiles: null,
            createNotification: false,
            exemptAffectedTrips: null,
            version: 1,
            duration: '',
            activePeriods: [
                {
                    startTime: 1755808020,
                },
            ],
            recurrencePattern: null,
            recurrent: false,
            workarounds: [],
            notes: [],
            severity: 'HEADLINE',
            passengerCount: null,
            incidentId: 139273,
            incidentTitle: 'test incident n0827',
            incidentDisruptionNo: 'CCD139273',
        },
    ],
    lastUpdatedTime: '2025-06-21T20:27:33.172Z',
    lastUpdatedBy: 'aqwe@propellerhead.co.nz',
    createdTime: '2025-06-21T20:27:33.172Z',
    createdBy: 'aqwe@propellerhead.co.nz',
    modalOpenedTime: mockTimeForModalOpenedTime,
};

jest.mock('../../../../../utils/control/alert-cause-effect', () => ({
    useAlertCauses: jest.fn(),
    useAlertEffects: jest.fn(),
}));

const fakeNow = new Date(2025, 5, 19, 11, 12, 0);

describe('SelectDetails Component', () => {
    let store;

    const defaultProps = {
        data: { ...defaultIncidentData },
        onStepUpdate: jest.fn(),
        onDataUpdate: jest.fn(),
        onSubmitUpdate: jest.fn(),
        onSubmitDraft: jest.fn(),
        toggleIncidentModals: jest.fn(),
        updateCurrentStep: jest.fn(),
        useDraftDisruptions: false,
    };

    beforeEach(() => {
        jest.setSystemTime(fakeNow);
        useAlertEffects.mockReturnValue([
            { label: '', value: '' },
            { label: '123', value: '123' },
            { label: 'Buses replace trains', value: 'BUSES_REPLACE_TRAINS' },
            { label: 'Bus replaces ferry', value: 'BUS_REPLACES_FERRY' },
            { label: 'Cancellations', value: 'CANCELLATIONS' },
            { label: 'Escalator not working', value: 'ESCALATOR_NOT_WORKING' },
        ]);
        useAlertCauses.mockReturnValue([
            { value: '', label: '' },
            { value: 'BREAKDOWN', label: 'Breakdown' },
            { value: 'INCIDENT', label: 'Incident' },
            { value: 'CONGESTION', label: 'Congestion' },
        ]);
        store = mockStore({
            control:
                {
                    incidents: {
                        incidents: {},
                        disruptions: [],
                        isLoading: false,
                    },
                },
            appSettings: {
                useDraftDisruptions: 'true',
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Renders without crashing and displays empty form', () => {
        render(
            <Provider store={ store }>
                <SelectDetails { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('Frequency')).toBeInTheDocument();
        expect(screen.getByText('Start Time')).toBeInTheDocument();
        expect(screen.getByText('End Date')).toBeInTheDocument();
        expect(screen.getByText('End Time')).toBeInTheDocument();
        expect(screen.getByText('Cause')).toBeInTheDocument();
        expect(screen.getByText('Severity')).toBeInTheDocument();
        expect(screen.getByText('Disruption Title')).toBeInTheDocument();
    });

    it('Renders without crashing and displays filled form', () => {
        const propsWithValues = { ...defaultProps,
            data: { ...filledIncidentData },
        };
        const { container } = render(
            <Provider store={ store }>
                <SelectDetails { ...propsWithValues } />
            </Provider>,
        );
        const startDateField = container.querySelector('#disruption-creation__wizard-select-details__start-date');
        expect(startDateField).toBeInTheDocument();
        expect(startDateField.value).toBe('20/06/2025');
        const startTimeField = container.querySelector('#disruption-creation__wizard-select-details__start-time');
        expect(startTimeField).toBeInTheDocument();
        expect(startTimeField.value).toBe('06:00');
        const endDateField = container.querySelector('#disruption-creation__wizard-select-details__end-date');
        expect(endDateField).toBeInTheDocument();
        expect(endDateField.value).toBe('28/06/2025');
        const endTimeField = container.querySelector('#disruption-creation__wizard-select-details__end-time');
        expect(endTimeField).toBeInTheDocument();
        expect(endTimeField.value).toBe('06:00');
        const causeField = container.querySelector('#disruption-creation__wizard-select-details__cause');
        expect(causeField).toBeInTheDocument();
        expect(causeField.value).toBe('CONGESTION');
        const severityField = container.querySelector('#disruption-creation__wizard-select-details__severity');
        expect(severityField).toBeInTheDocument();
        expect(severityField.value).toBe('MINOR');
        const headerField = container.querySelector('#disruption-creation__wizard-select-details__header');
        expect(headerField).toBeInTheDocument();
        expect(headerField.value).toBe('Incident Test Title');
    });

    it('Renders without crashing and displays filled form for recurrent incident', () => {
        const propsWithValues = { ...defaultProps,
            data: { ...filledRecurrentIncidentData },
        };
        const { container } = render(
            <Provider store={ store }>
                <SelectDetails { ...propsWithValues } />
            </Provider>,
        );
        const startDateField = container.querySelector('#disruption-creation__wizard-select-details__start-date');
        expect(startDateField).toBeInTheDocument();
        expect(startDateField.value).toBe('20/06/2025');
        const startTimeField = container.querySelector('#disruption-creation__wizard-select-details__start-time');
        expect(startTimeField).toBeInTheDocument();
        expect(startTimeField.value).toBe('06:00');
        const endDateField = container.querySelector('#disruption-creation__wizard-select-details__end-date');
        expect(endDateField).toBeInTheDocument();
        expect(endDateField.value).toBe('28/06/2025');
        const durationField = container.querySelector('#disruption-creation__wizard-select-details__duration');
        expect(durationField).toBeInTheDocument();
        expect(durationField.value).toBe('2');
        const recurrencePatternSelector = container.getElementsByClassName('weekday-picker__day ');
        expect(recurrencePatternSelector.length).toBe(7);
        expect(recurrencePatternSelector[1].classList.contains('selected')).toBe(true);
        expect(recurrencePatternSelector[3].classList.contains('selected')).toBe(true);
        const causeField = container.querySelector('#disruption-creation__wizard-select-details__cause');
        expect(causeField).toBeInTheDocument();
        expect(causeField.value).toBe('CONGESTION');
        const severityField = container.querySelector('#disruption-creation__wizard-select-details__severity');
        expect(severityField).toBeInTheDocument();
        expect(severityField.value).toBe('MINOR');
        const headerField = container.querySelector('#disruption-creation__wizard-select-details__header');
        expect(headerField).toBeInTheDocument();
        expect(headerField.value).toBe('Incident Test Title');
    });

    it('Renders without crashing and displays edit incident form', () => {
        const props = {
            ...defaultProps,
            editMode: EDIT_TYPE.EDIT,
            data: { ...incidentForEdit },
        };
        const { container } = render(
            <Provider store={ store }>
                <SelectDetails { ...props } />
            </Provider>,
        );
        const headerField = container.querySelector('#disruption-creation__wizard-select-details__header');
        expect(headerField).toBeInTheDocument();
        expect(headerField.value).toBe('test incident n0827');
        expect(screen.getByText('Status')).toBeInTheDocument();
        const statusField = container.querySelector('#disruption-detail__status');
        expect(statusField).toBeInTheDocument();
        expect(statusField.value).toBe(STATUSES.NOT_STARTED);
        expect(screen.getByText('Effects')).toBeInTheDocument();
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    describe('Submit button', () => {
        it('Should be enabled with filled form', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...filledIncidentData },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const button = screen.getByRole('button', { name: /continue/i });
            expect(button.disabled).toBe(false);
        });

        it('Should be disabled when startTime is empty', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...filledIncidentData, startTime: '' },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const button = screen.getByRole('button', { name: /continue/i });
            expect(button.disabled).toBe(true);
        });

        it('Should be disabled when startDate is empty', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...filledIncidentData, startDate: '' },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const button = screen.getByRole('button', { name: /continue/i });
            expect(button.disabled).toBe(true);
        });

        it('Should be disabled when endDate is empty but endTime filled', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...filledIncidentData, endDate: '' },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const button = screen.getByRole('button', { name: /continue/i });
            expect(button.disabled).toBe(true);
        });

        it('Should be disabled when cause is empty', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...filledIncidentData, cause: '' },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const button = screen.getByRole('button', { name: /continue/i });
            expect(button.disabled).toBe(true);
        });

        it('Should be disabled when header is empty', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...filledIncidentData, header: '' },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const button = screen.getByRole('button', { name: /continue/i });
            expect(button.disabled).toBe(true);
        });

        it('Should update current step on continue click', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...filledIncidentData },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const button = screen.getByRole('button', { name: /continue/i });
            expect(button).not.toBeNull();

            fireEvent.click(button);

            expect(defaultProps.onStepUpdate).toHaveBeenCalledWith(1);
            expect(defaultProps.updateCurrentStep).toHaveBeenCalledWith(2);
        });

        it('Should update current step on continue click with recurrent incident', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...filledRecurrentIncidentData },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const button = screen.getByRole('button', { name: /continue/i });
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(false);

            fireEvent.click(button);

            expect(defaultProps.onStepUpdate).toHaveBeenCalledWith(1);
            expect(defaultProps.updateCurrentStep).toHaveBeenCalledWith(2);
        });

        it('Should be enable with filled recurrent incident and useDraftDisruptions true and trigger onStepUpdate on clicking', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...filledRecurrentIncidentData },
                useDraftDisruptions: true,
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const button = screen.getByRole('button', { name: /continue/i });
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(false);

            fireEvent.click(button);

            expect(defaultProps.onStepUpdate).toHaveBeenCalledWith(1);
            expect(defaultProps.updateCurrentStep).toHaveBeenCalledWith(2);
        });
    });

    describe('Submit draft', () => {
        it('Should be disabled with empty form', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...defaultIncidentData },
                useDraftDisruptions: true,
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const button = screen.getByRole('button', { name: /save draft/i });
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(true);
        });

        it('Should be enabled with cause and header', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...defaultIncidentData, cause: 'BREAKDOWN', header: 'Test Draft Title' },
                useDraftDisruptions: true,
            };
            const { container } = render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const causeField = container.querySelector('#disruption-creation__wizard-select-details__cause');
            expect(causeField).toBeInTheDocument();
            expect(causeField.value).toBe('BREAKDOWN');
            const headerField = container.querySelector('#disruption-creation__wizard-select-details__header');
            expect(headerField).toBeInTheDocument();
            expect(headerField.value).toBe('Test Draft Title');
            const button = screen.getByRole('button', { name: /save draft/i });
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(false);
        });

        it('Should be disabled with cause and empty header', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...defaultIncidentData, cause: 'BREAKDOWN' },
                useDraftDisruptions: true,
            };
            const { container } = render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const causeField = container.querySelector('#disruption-creation__wizard-select-details__cause');
            expect(causeField).toBeInTheDocument();
            expect(causeField.value).toBe('BREAKDOWN');
            const headerField = container.querySelector('#disruption-creation__wizard-select-details__header');
            expect(headerField).toBeInTheDocument();
            expect(headerField.value).toBe('');
            const button = screen.getByRole('button', { name: /save draft/i });
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(true);
        });

        it('Should be disabled with header and empty cause', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...defaultIncidentData, cause: '', header: 'Test Draft Title' },
                useDraftDisruptions: true,
            };
            const { container } = render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const causeField = container.querySelector('#disruption-creation__wizard-select-details__cause');
            expect(causeField).toBeInTheDocument();
            expect(causeField.value).toBe('');
            const headerField = container.querySelector('#disruption-creation__wizard-select-details__header');
            expect(headerField).toBeInTheDocument();
            expect(headerField.value).toBe('Test Draft Title');
            const button = screen.getByRole('button', { name: /save draft/i });
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(true);
        });

        it('Should be enabled with cause and header and trigger onSubmit draft on clicking', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...defaultIncidentData, cause: 'BREAKDOWN', header: 'Test Draft Title' },
                useDraftDisruptions: true,
            };
            const { container } = render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const causeField = container.querySelector('#disruption-creation__wizard-select-details__cause');
            expect(causeField).toBeInTheDocument();
            expect(causeField.value).toBe('BREAKDOWN');
            const headerField = container.querySelector('#disruption-creation__wizard-select-details__header');
            expect(headerField).toBeInTheDocument();
            expect(headerField.value).toBe('Test Draft Title');
            const button = screen.getByRole('button', { name: /save draft/i });
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(false);
            fireEvent.click(button);
            expect(defaultProps.onSubmitDraft).toHaveBeenCalled();
            expect(defaultProps.onStepUpdate).toHaveBeenCalledWith(3);
        });

        it('Should be enable with filled recurrent incident and trigger onSubmit draft on clicking', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...filledRecurrentIncidentData },
                useDraftDisruptions: true,
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const button = screen.getByRole('button', { name: /save draft/i });
            expect(button).not.toBeNull();
            expect(button.disabled).toBe(false);

            fireEvent.click(button);

            expect(defaultProps.onSubmitDraft).toHaveBeenCalled();
            expect(defaultProps.onStepUpdate).toHaveBeenCalledWith(3);
        });
    });

    describe('OnChange', () => {
        it('Renders without crashing and displays filled form', () => {
            const propsWithValues = { ...defaultProps,
                data: { ...filledIncidentData },
            };
            const { container } = render(
                <Provider store={ store }>
                    <SelectDetails { ...propsWithValues } />
                </Provider>,
            );
            const startDateField = container.querySelector('#disruption-creation__wizard-select-details__start-date');
            expect(startDateField).toBeInTheDocument();
            expect(startDateField.value).toBe('20/06/2025');
            const startTimeField = container.querySelector('#disruption-creation__wizard-select-details__start-time');
            expect(startTimeField).toBeInTheDocument();
            expect(startTimeField.value).toBe('06:00');
            const endDateField = container.querySelector('#disruption-creation__wizard-select-details__end-date');
            expect(endDateField).toBeInTheDocument();
            expect(endDateField.value).toBe('28/06/2025');
            const endTimeField = container.querySelector('#disruption-creation__wizard-select-details__end-time');
            expect(endTimeField).toBeInTheDocument();
            expect(endTimeField.value).toBe('06:00');
            const causeField = container.querySelector('#disruption-creation__wizard-select-details__cause');
            expect(causeField).toBeInTheDocument();
            expect(causeField.value).toBe('CONGESTION');
            const severityField = container.querySelector('#disruption-creation__wizard-select-details__severity');
            expect(severityField).toBeInTheDocument();
            expect(severityField.value).toBe('MINOR');
            const headerField = container.querySelector('#disruption-creation__wizard-select-details__header');
            expect(headerField).toBeInTheDocument();
            expect(headerField.value).toBe('Incident Test Title');
        });

        it('Should update endDate and endTime when change status from in-progress to resolved', () => {
            const props = {
                ...defaultProps,
                editMode: EDIT_TYPE.EDIT,
                data: { ...incidentForEdit, status: STATUSES.IN_PROGRESS, startTime: '2025-06-18T20:27:00.000Z' },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...props } />
                </Provider>,
            );
            const input = document.getElementById('disruption-detail__status');
            fireEvent.change(input, { target: { value: STATUSES.RESOLVED } });

            expect(defaultProps.onDataUpdate).toHaveBeenCalledTimes(2);
            expect(defaultProps.onDataUpdate).toHaveBeenCalledWith('endDate', '19/06/2025');
            expect(defaultProps.onDataUpdate).toHaveBeenCalledWith('endTime', '11:12');
        });

        it('Should update startDate, startTime, endDate and endTime when change status from not-started to resolved', () => {
            const props = {
                ...defaultProps,
                editMode: EDIT_TYPE.EDIT,
                data: { ...incidentForEdit, status: STATUSES.NOT_STARTED },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...props } />
                </Provider>,
            );
            const input = document.getElementById('disruption-detail__status');
            fireEvent.change(input, { target: { value: STATUSES.RESOLVED } });

            expect(defaultProps.onDataUpdate).toHaveBeenCalledTimes(4);
            expect(defaultProps.onDataUpdate).toHaveBeenCalledWith('startDate', '19/06/2025');
            expect(defaultProps.onDataUpdate).toHaveBeenCalledWith('startTime', '11:12');
            expect(defaultProps.onDataUpdate).toHaveBeenCalledWith('endDate', '19/06/2025');
            expect(defaultProps.onDataUpdate).toHaveBeenCalledWith('endTime', '11:12');
        });

        it('Should update startDate and startTime when change status from not-started to in-progress', () => {
            const props = {
                ...defaultProps,
                editMode: EDIT_TYPE.EDIT,
                data: { ...incidentForEdit, status: STATUSES.NOT_STARTED },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...props } />
                </Provider>,
            );
            const input = document.getElementById('disruption-detail__status');
            fireEvent.change(input, { target: { value: STATUSES.IN_PROGRESS } });

            expect(defaultProps.onDataUpdate).toHaveBeenCalledTimes(2);
            expect(defaultProps.onDataUpdate).toHaveBeenCalledWith('startDate', '19/06/2025');
            expect(defaultProps.onDataUpdate).toHaveBeenCalledWith('startTime', '11:12');
        });

        it('Should update startDate on change', () => {
            const props = {
                ...defaultProps,
                editMode: EDIT_TYPE.EDIT,
                data: { ...incidentForEdit, status: STATUSES.NOT_STARTED },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...props } />
                </Provider>,
            );
            const startPicker = screen.getByTestId('start-date_date-picker');
            fireEvent.change(startPicker, { target: { value: '2025-06-18' } });

            expect(defaultProps.onDataUpdate).toHaveBeenCalledTimes(1);
            expect(defaultProps.onDataUpdate).toHaveBeenCalledWith('startDate', '18/06/2025');
        });

        it('Should update endDate on change', () => {
            const props = {
                ...defaultProps,
                editMode: EDIT_TYPE.EDIT,
                data: { ...incidentForEdit, status: STATUSES.NOT_STARTED },
            };
            render(
                <Provider store={ store }>
                    <SelectDetails { ...props } />
                </Provider>,
            );
            const endPicker = screen.getByTestId('end-date_date-picker');
            fireEvent.change(endPicker, { target: { value: '2025-07-11' } });

            expect(defaultProps.onDataUpdate).toHaveBeenCalledTimes(1);
            expect(defaultProps.onDataUpdate).toHaveBeenCalledWith('endDate', '11/07/2025');
        });
    });
});
