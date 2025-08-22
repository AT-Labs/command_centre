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
import { useAlertCauses } from '../../../../../utils/control/alert-cause-effect';

const mockStore = configureStore([thunk]);

jest.useFakeTimers();

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

jest.mock('../../../../../utils/control/alert-cause-effect', () => ({
    useAlertCauses: jest.fn(),
}));

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
        const fakeNow = new Date('2025-06-19T12:00:00Z');
        jest.setSystemTime(fakeNow);
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
    });
});
