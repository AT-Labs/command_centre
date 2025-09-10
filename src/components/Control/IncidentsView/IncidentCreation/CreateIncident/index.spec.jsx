import React from 'react';
import { shallow } from 'enzyme';
import { RRule } from 'rrule';
import { CreateIncident } from './index';
import LoadingOverlay from '../../../../Common/Overlay/LoadingOverlay';
import { updateCurrentStep } from '../../../../../redux/actions/control/disruptions';
import { buildIncidentSubmitBody, momentFromDateTime } from '../../../../../utils/control/disruptions';
import { STATUSES, DISRUPTION_TYPE, DEFAULT_SEVERITY } from '../../../../../types/disruptions-types';
import { DEFAULT_CAUSE } from '../../../../../types/disruption-cause-and-effect';
import EDIT_TYPE from '../../../../../types/edit-types';

jest.mock('../../../../Common/Map/ShapeLayer/ShapeLayer', () => jest.fn());

jest.mock('../../../../Common/Map/StopsLayer/StopsLayer', () => jest.fn());

jest.mock('../../../../Common/Map/HighlightingLayer/HighlightingLayer', () => jest.fn());

jest.mock('../../../../Common/Map/StopsLayer/SelectedStopsMarker', () => jest.fn());

jest.mock('../../../DisruptionsView/DiversionManager', () => jest.fn());

jest.mock('./DrawLayer', () => jest.fn());

jest.mock('../../../../Common/CustomModal/CustomModal', () => jest.fn());

const disruptionActivePeriodsMock = [
    {
        endTime: 1732571652,
        startTime: 1732312452,
    },
];
const mockTimeForMoment = new Date('2025-08-21T20:27:00.000Z');
const mockTimeForModalOpenedTime = new Date('2025-06-19T06:00:00.000Z');

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
    modalOpenedTime: mockTimeForModalOpenedTime,
};

const incidentForEdit = {
    incidentId: 139273,
    mode: 'Bus',
    cause: 'CONGESTION',
    startTime: '2025-08-21T20:27:00.000Z',
    endTime: null,
    status: 'in-progress',
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
            startTime: '2025-08-21T20:27:00.000Z',
            endTime: null,
            status: 'in-progress',
            lastUpdatedTime: '2025-08-21T20:27:33.201Z',
            lastUpdatedBy: 'aqwe@propellerhead.co.nz',
            description: null,
            createdBy: 'aqwe@propellerhead.co.nz',
            createdTime: '2025-08-21T20:27:33.201Z',
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
    lastUpdatedTime: '2025-08-21T20:27:33.172Z',
    lastUpdatedBy: 'aqwe@propellerhead.co.nz',
    createdTime: '2025-08-21T20:27:33.172Z',
    createdBy: 'aqwe@propellerhead.co.nz',
    modalOpenedTime: mockTimeForModalOpenedTime,
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

    describe('onSubmitUpdate', () => {
        let wrapper;
        const mockUpdateCurrentStep = jest.fn();
        const mockCreateNewIncident = jest.fn();
        const mockOpenCreateIncident = jest.fn();
        const mockToggleIncidentModals = jest.fn();
        const mockUpdateIncident = jest.fn();
        const mockUpdateAffectedStopsState = jest.fn();
        const mockUpdateAffectedRoutesState = jest.fn();
        const mockGetRoutesByShortName = jest.fn();

        beforeEach(() => {
            wrapper = shallow(
                <CreateIncident
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createNewIncident={ mockCreateNewIncident }
                    openCreateIncident={ mockOpenCreateIncident }
                    toggleIncidentModals={ mockToggleIncidentModals }
                    action={ mockAction }
                    incidentToEdit={ incidentForEdit }
                    editMode={ EDIT_TYPE.EDIT }
                    updateIncident={ mockUpdateIncident }
                    updateAffectedStopsState={ mockUpdateAffectedStopsState }
                    updateAffectedRoutesState={ mockUpdateAffectedRoutesState }
                    getRoutesByShortName={ mockGetRoutesByShortName }
                />,
            );
        });

        afterEach(() => {
            jest.clearAllMocks();
        });

        it('Should setup data for edit and update map', async () => {
            expect(mockUpdateAffectedStopsState).toHaveBeenCalled();
            expect(mockUpdateAffectedRoutesState).toHaveBeenCalled();
            expect(mockGetRoutesByShortName).toHaveBeenCalled();
        });

        it('Should open apply changes modal', async () => {
            wrapper = shallow(
                <CreateIncident
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createNewIncident={ mockCreateNewIncident }
                    openCreateIncident={ mockOpenCreateIncident }
                    toggleIncidentModals={ mockToggleIncidentModals }
                    action={ mockAction }
                    incidentToEdit={ incidentForEdit }
                    editMode={ EDIT_TYPE.EDIT }
                    updateIncident={ mockUpdateIncident }
                    updateAffectedStopsState={ mockUpdateAffectedStopsState }
                    updateAffectedRoutesState={ mockUpdateAffectedRoutesState }
                    getRoutesByShortName={ mockGetRoutesByShortName }
                    isEditEffectPanelOpen
                />,
            );
            wrapper.setState({ isEffectUpdated: true });
            await wrapper.instance().onSubmitUpdate();
            expect(mockToggleIncidentModals).toHaveBeenCalledWith('isApplyChangesOpen', true);
        });

        it('Should update incident', async () => {
            momentFromDateTime.mockReturnValue(mockTimeForMoment);
            const expectedDisruption = {
                disruptionId: 139535,
                incidentNo: 'DISR139535',
                mode: 'Bus',
                affectedEntities: {
                    affectedRoutes: [{
                        notes: [],
                        routeId: '101-202',
                        routeShortName: '101',
                        routeType: 3,
                        type: 'route',
                    }, {
                        notes: [],
                        routeId: '105-202',
                        routeShortName: '105',
                        routeType: 3,
                        type: 'route',
                    }],
                    affectedStops: [],
                },
                impact: 'ESCALATOR_NOT_WORKING',
                cause: 'CONGESTION',
                startTime: '08:27',
                endTime: null,
                status: 'in-progress',
                lastUpdatedTime: '2025-08-21T20:27:33.201Z',
                lastUpdatedBy: 'aqwe@propellerhead.co.nz',
                description: null,
                createdBy: 'aqwe@propellerhead.co.nz',
                createdTime: '2025-08-21T20:27:33.201Z',
                url: '',
                header: 'test incident n0827',
                feedEntityId: 'eacda2bb-baf4-44dc-9b11-bd2c15021ff1',
                uploadedFiles: null,
                createNotification: false,
                exemptAffectedTrips: null,
                version: 1,
                duration: '',
                activePeriods: [{
                    startTime: 1755808020,
                }],
                recurrencePattern: null,
                recurrent: false,
                workarounds: [],
                notes: [],
                severity: 'HEADLINE',
                passengerCount: null,
                incidentId: 139273,
                incidentTitle: 'test incident n0827',
                incidentDisruptionNo: 'CCD139273',
                startDate: '22/08/2025',
                disruptionType: 'Routes',
                key: 'DISR139535',
            };
            const expectedIncident = {
                startTime: mockTimeForMoment,
                startDate: '22/08/2025',
                endTime: undefined,
                endDate: '',
                cause: 'CONGESTION',
                activePeriods: [],
                mode: 'Bus',
                status: 'in-progress',
                header: 'test incident n0827',
                description: '',
                url: '',
                createNotification: false,
                recurrent: false,
                duration: '',
                recurrencePattern: null,
                disruptionType: 'Routes',
                severity: 'HEADLINE',
                notes: [],
                incidentId: 139273,
                version: 1,
                source: 'UI',
                lastUpdatedTime: '2025-08-21T20:27:33.172Z',
                lastUpdatedBy: 'aqwe@propellerhead.co.nz',
                createdTime: '2025-08-21T20:27:33.172Z',
                createdBy: 'aqwe@propellerhead.co.nz',
                disruptions: [{ ...expectedDisruption }],
            };
            buildIncidentSubmitBody.mockReturnValue(expectedIncident);
            await wrapper.instance().onSubmitUpdate();
            expect(buildIncidentSubmitBody).toHaveBeenCalledWith(expect.objectContaining({ ...expectedIncident }), true);
            expect(mockUpdateIncident).toHaveBeenCalledWith(expectedIncident);
            expect(mockOpenCreateIncident).toHaveBeenCalledWith(false);
            expect(mockToggleIncidentModals).toHaveBeenCalledWith('isApplyChangesOpen', false);
        });

        it('Should update incident with data from editableDisruption and expectedWorkarounds', async () => {
            wrapper = shallow(
                <CreateIncident
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createNewIncident={ mockCreateNewIncident }
                    openCreateIncident={ mockOpenCreateIncident }
                    toggleIncidentModals={ mockToggleIncidentModals }
                    action={ mockAction }
                    incidentToEdit={ incidentForEdit }
                    editMode={ EDIT_TYPE.EDIT }
                    updateIncident={ mockUpdateIncident }
                    updateAffectedStopsState={ mockUpdateAffectedStopsState }
                    updateAffectedRoutesState={ mockUpdateAffectedRoutesState }
                    getRoutesByShortName={ mockGetRoutesByShortName }
                    isEditEffectPanelOpen
                />,
            );
            const expectedWorkarounds = [
                {
                    type: 'route',
                    workaround: 'qwe',
                    routeShortName: '101',
                },
                {
                    type: 'route',
                    workaround: 'zxc',
                    routeShortName: '105',
                },
            ];
            const expectedDisruption = {
                disruptionId: 139535,
                incidentNo: 'DISR139535',
                mode: 'Bus',
                affectedEntities: {
                    affectedRoutes: [{
                        notes: [],
                        routeId: '101-202',
                        routeShortName: '101',
                        routeType: 3,
                        type: 'route',
                    }, {
                        notes: [],
                        routeId: '105-202',
                        routeShortName: '105',
                        routeType: 3,
                        type: 'route',
                    }],
                    affectedStops: [],
                },
                impact: 'ESCALATOR_NOT_WORKING',
                cause: 'CONGESTION',
                startTime: '08:27',
                endTime: null,
                status: 'in-progress',
                lastUpdatedTime: '2025-08-21T20:27:33.201Z',
                lastUpdatedBy: 'aqwe@propellerhead.co.nz',
                description: null,
                createdBy: 'aqwe@propellerhead.co.nz',
                createdTime: '2025-08-21T20:27:33.201Z',
                url: '',
                header: 'test incident n0827',
                feedEntityId: 'eacda2bb-baf4-44dc-9b11-bd2c15021ff1',
                uploadedFiles: null,
                createNotification: false,
                exemptAffectedTrips: null,
                version: 1,
                duration: '',
                activePeriods: [{
                    startTime: 1755808020,
                }],
                recurrencePattern: null,
                recurrent: false,
                workarounds: [...expectedWorkarounds],
                notes: [],
                severity: 'HEADLINE',
                passengerCount: null,
                incidentId: 139273,
                incidentTitle: 'test incident n0827',
                incidentDisruptionNo: 'CCD139273',
                startDate: '22/08/2025',
                disruptionType: 'Routes',
                key: 'DISR139535',
            };
            const expectedIncident = {
                startTime: mockTimeForMoment,
                startDate: '22/08/2025',
                endTime: undefined,
                endDate: '',
                cause: 'CONGESTION',
                activePeriods: [],
                mode: 'Bus',
                status: 'in-progress',
                header: 'test incident n0827',
                description: '',
                url: '',
                createNotification: false,
                recurrent: false,
                duration: '',
                recurrencePattern: null,
                disruptionType: 'Routes',
                severity: 'HEADLINE',
                notes: [],
                incidentId: 139273,
                version: 1,
                source: 'UI',
                lastUpdatedTime: '2025-08-21T20:27:33.172Z',
                lastUpdatedBy: 'aqwe@propellerhead.co.nz',
                createdTime: '2025-08-21T20:27:33.172Z',
                createdBy: 'aqwe@propellerhead.co.nz',
                disruptions: [{ ...expectedDisruption, header: 'test' }],
            };
            wrapper.setState({
                editableDisruption: { ...expectedDisruption, header: 'test' },
                editableWorkarounds: [{
                    key: 'DISR139535',
                    workarounds: expectedWorkarounds,
                }],
            });
            momentFromDateTime.mockReturnValue(mockTimeForMoment);
            buildIncidentSubmitBody.mockReturnValue(expectedIncident);
            await wrapper.instance().onSubmitUpdate();
            expect(buildIncidentSubmitBody).toHaveBeenCalledWith(expect.objectContaining({ ...expectedIncident }), true);
            expect(mockUpdateIncident).toHaveBeenCalledWith(expectedIncident);
            expect(mockOpenCreateIncident).toHaveBeenCalledWith(false);
            expect(mockToggleIncidentModals).toHaveBeenCalledWith('isApplyChangesOpen', false);
        });
    });
});
