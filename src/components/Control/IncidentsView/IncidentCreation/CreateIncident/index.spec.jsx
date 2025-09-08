import React from 'react';
import { shallow } from 'enzyme';
import { RRule } from 'rrule';
import { CreateIncident } from './index';
import LoadingOverlay from '../../../../Common/Overlay/LoadingOverlay';
import { updateCurrentStep } from '../../../../../redux/actions/control/disruptions';
import { buildIncidentSubmitBody } from '../../../../../utils/control/disruptions';
import { STATUSES, DISRUPTION_TYPE, DEFAULT_SEVERITY } from '../../../../../types/disruptions-types';
import { DEFAULT_CAUSE } from '../../../../../types/disruption-cause-and-effect';

jest.mock('../../../../Common/Map/ShapeLayer/ShapeLayer', () => jest.fn());

jest.mock('../../../../Common/Map/StopsLayer/StopsLayer', () => jest.fn());

jest.mock('../../../../Common/Map/HighlightingLayer/HighlightingLayer', () => jest.fn());

jest.mock('../../../../Common/Map/StopsLayer/SelectedStopsMarker', () => jest.fn());

jest.mock('./DrawLayer', () => jest.fn());

jest.mock('../../../../Common/CustomModal/CustomModal', () => jest.fn());

const disruptionActivePeriodsMock = [
    {
        endTime: 1732571652,
        startTime: 1732312452,
    },
];

jest.mock('../../../../../utils/control/disruptions', () => ({
    generateDisruptionActivePeriods: jest.fn().mockReturnValue(disruptionActivePeriodsMock),
    buildIncidentSubmitBody: jest.fn(),
    momentFromDateTime: jest.fn(),
}));

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

const mockAction = { resultDisruptionId: 12345 };

describe('CreateIncident component', () => {
    it('Should render a SidePanel component with a LoadingOverlay if isLoading is true', () => {
        const wrapper = shallow(<CreateIncident isLoading action={ mockAction } updateCurrentStep={ updateCurrentStep } />);
        expect(wrapper.find(LoadingOverlay)).toHaveLength(1);
    });

    it('Should render a SidePanel component without a LoadingOverlay if isLoading is false', () => {
        const wrapper = shallow(<CreateIncident action={ mockAction } updateCurrentStep={ updateCurrentStep } />);
        expect(wrapper.find(LoadingOverlay)).toHaveLength(0);
    });

    describe('onSubmit', () => {
        let wrapper;
        const mockUpdateCurrentStep = jest.fn();
        const mockCreateNewIncident = jest.fn();
        const mockOpenCreateIncident = jest.fn();
        const mockToggleIncidentModals = jest.fn();

        const dtstart = new Date('2025-03-01T10:00:00.000Z');
        const until = new Date('2022-03-09T06:00:00.000Z');
        const mockIncidentData = {
            ...defaultIncidentData,
            startDate: dtstart,
            startTime: '10:00:00',
            endDate: until,
            endTime: '11:00:00',
            disruptionType: 'type',
            activePeriods: [],
            recurrencePattern: {
                freq: 2,
                dtstart,
                until,
                byweekday: [0],
            },
        };

        beforeEach(() => {
            wrapper = shallow(
                <CreateIncident
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createNewIncident={ mockCreateNewIncident }
                    openCreateIncident={ mockOpenCreateIncident }
                    toggleIncidentModals={ mockToggleIncidentModals }
                    incidentData={ mockIncidentData }
                    action={ mockAction }
                />,
            );
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('Should call toggleIncidentModals with isConfirmationOpen and true', async () => {
            await wrapper.instance().onSubmit();
            expect(mockToggleIncidentModals).toHaveBeenCalledWith('isConfirmationOpen', true);
        });

        it('Should call createNewIncident', async () => {
            await wrapper.instance().onSubmit();
            expect(mockCreateNewIncident).toHaveBeenCalledTimes(1);
        });

        it('Should call createNewIncident with recurrencePattern without start end dates', async () => {
            const incidentData = {
                recurrent: true,
                startTime: undefined,
                endTime: undefined,
                recurrencePattern: {
                    freq: 2,
                    byweekday: undefined,
                    dtstart,
                    until,
                },
            };
            const expectedDisruption = {
                ...incidentData,
                recurrencePattern: { freq: RRule.WEEKLY, byweekday: [] },
                endTime: undefined,
                startTime: undefined,
                status: STATUSES.DRAFT,
                notes: [],
            };

            buildIncidentSubmitBody.mockReturnValue(expectedDisruption);
            wrapper.setState({ incidentData });

            await wrapper.instance().onSubmit();

            expect(mockCreateNewIncident).toHaveBeenCalledWith(expectedDisruption);
        });

        it('Should call createNewIncident with full recurrencePattern', async () => {
            const incidentData = {
                ...mockIncidentData,
                startTime: dtstart,
                endTime: until,
                status: STATUSES.DRAFT,
                notes: [],
            };
            const expectedDisruption = {
                ...mockIncidentData,
                recurrencePattern: {
                    freq: RRule.WEEKLY,
                    byweekday: [RRule.MO, RRule.FR],
                    dtstart,
                    until,
                },
                endTime: until,
                startTime: dtstart,
                status: STATUSES.DRAFT,
                notes: [],
            };

            buildIncidentSubmitBody.mockReturnValue(expectedDisruption);
            wrapper.setState({ incidentData });

            await wrapper.instance().onSubmit();

            expect(mockCreateNewIncident).toHaveBeenCalledWith(expectedDisruption);
        });
    });

    describe('onSubmitDraft', () => {
        let wrapper;
        const mockUpdateCurrentStep = jest.fn();
        const mockCreateNewIncident = jest.fn();
        const mockOpenCreateIncident = jest.fn();
        const mockToggleIncidentModals = jest.fn();

        const dtstart = new Date('2025-03-01T10:00:00.000Z');
        const until = new Date('2022-03-09T06:00:00.000Z');
        const mockIncidentData = {
            ...defaultIncidentData,
            startDate: dtstart,
            startTime: '10:00:00',
            endDate: until,
            endTime: '11:00:00',
            disruptionType: 'type',
            activePeriods: [],
            recurrencePattern: {
                freq: 2,
                dtstart,
                until,
                byweekday: [0],
            },
        };

        beforeEach(() => {
            wrapper = shallow(
                <CreateIncident
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createNewIncident={ mockCreateNewIncident }
                    openCreateIncident={ mockOpenCreateIncident }
                    toggleIncidentModals={ mockToggleIncidentModals }
                    incidentData={ mockIncidentData }
                    action={ mockAction }
                />,
            );
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('Should call updateCurrentStep with 1', async () => {
            await wrapper.instance().onSubmitDraft();
            expect(mockUpdateCurrentStep).toHaveBeenCalledWith(1);
        });

        it('Should call openCreateIncident with false', async () => {
            await wrapper.instance().onSubmitDraft();
            expect(mockOpenCreateIncident).toHaveBeenCalledWith(false);
        });

        it('Should call toggleIncidentModals with isConfirmationOpen and true', async () => {
            await wrapper.instance().onSubmitDraft();
            expect(mockToggleIncidentModals).toHaveBeenCalledWith('isConfirmationOpen', true);
        });

        it('Should call createNewIncident', async () => {
            await wrapper.instance().onSubmitDraft();
            expect(mockCreateNewIncident).toHaveBeenCalledTimes(1);
        });

        it('Should call createNewIncident with recurrencePattern without start end dates', async () => {
            const incidentData = {
                recurrent: true,
                startTime: undefined,
                endTime: undefined,
                recurrencePattern: {
                    freq: 2,
                    byweekday: undefined,
                    dtstart,
                    until,
                },
                disruptions: [],
                notes: '',
            };
            const expectedDisruption = {
                ...incidentData,
                recurrencePattern: { freq: RRule.WEEKLY, byweekday: [] },
                endTime: undefined,
                startTime: undefined,
                status: STATUSES.DRAFT,
            };

            buildIncidentSubmitBody.mockReturnValue(expectedDisruption);
            wrapper.setState({ incidentData });

            await wrapper.instance().onSubmitDraft();

            expect(mockCreateNewIncident).toHaveBeenCalledWith(expectedDisruption);
        });

        it('Should call createNewIncident with full recurrencePattern', async () => {
            const incidentData = {
                ...mockIncidentData,
                startTime: dtstart,
                endTime: until,
                status: STATUSES.DRAFT,
                disruptions: [],
                notes: '',
            };
            const expectedDisruption = {
                ...incidentData,
                recurrencePattern: {
                    freq: RRule.WEEKLY,
                    byweekday: [RRule.MO, RRule.FR],
                    dtstart,
                    until,
                },
                endTime: until,
                startTime: dtstart,
                status: STATUSES.DRAFT,
            };

            buildIncidentSubmitBody.mockReturnValue(expectedDisruption);
            wrapper.setState({ incidentData });

            await wrapper.instance().onSubmitDraft();

            expect(mockCreateNewIncident).toHaveBeenCalledWith(expectedDisruption);
        });
    });
});
