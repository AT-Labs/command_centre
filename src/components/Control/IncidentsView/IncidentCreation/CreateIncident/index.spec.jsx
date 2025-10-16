import React from 'react';
import { shallow, mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { RRule } from 'rrule';
import { CreateIncident } from './index';
import LoadingOverlay from '../../../../Common/Overlay/LoadingOverlay';
import { updateCurrentStep } from '../../../../../redux/actions/control/disruptions';
import { buildIncidentSubmitBody, momentFromDateTime, getStatusForEffect } from '../../../../../utils/control/disruptions';
import { STATUSES, DISRUPTION_TYPE, getParentChildDefaultSeverity } from '../../../../../types/disruptions-types';
import { DEFAULT_CAUSE } from '../../../../../types/disruption-cause-and-effect';
import EDIT_TYPE from '../../../../../types/edit-types';

jest.mock('../../../../Common/Map/ShapeLayer/ShapeLayer', () => jest.fn());

jest.mock('../../../../Common/Map/StopsLayer/StopsLayer', () => jest.fn());

jest.mock('../../../../Common/Map/HighlightingLayer/HighlightingLayer', () => jest.fn());

jest.mock('../../../../Common/Map/StopsLayer/SelectedStopsMarker', () => jest.fn());

jest.mock('../../../../Common/Map/RouteShapeEditor/RouteShapeEditor', () => () => <div data-testid="route-shape-editor" />);

jest.mock('react-leaflet-draw', () => ({
    EditControl: () => <div data-testid="edit-control" />,
}));

jest.mock('./DrawLayer', () => () => <div data-testid="draw-layer" />);

jest.mock('../../../../Common/CustomModal/CustomModal', () => jest.fn());

const disruptionActivePeriodsMock = [
    {
        endTime: 1732571652,
        startTime: 1732312452,
    },
];
const mockTimeForMoment = new Date('2025-08-21T20:27:00.000Z');
const mockTimeForModalOpenedTime = new Date('2025-06-19T06:00:00.000Z');

jest.mock('../../../../../utils/control/disruptions', () => {
    const actual = jest.requireActual('../../../../../utils/control/disruptions');
    return {
        ...actual,
        generateDisruptionActivePeriods: jest.fn().mockReturnValue(disruptionActivePeriodsMock),
        buildIncidentSubmitBody: jest.fn(),
        momentFromDateTime: jest.fn(),
        getStatusForEffect: jest.fn(),
    };
});

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
    createNotification: false,
    recurrent: false,
    duration: '',
    recurrencePattern: { freq: RRule.WEEKLY },
    disruptionType: DISRUPTION_TYPE.ROUTES,
    severity: getParentChildDefaultSeverity().value,

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
        const mockUpdateEditMode = jest.fn();
        const mockSetDisruptionForWorkaroundEdit = jest.fn();
        const mockToggleWorkaroundPanel = jest.fn();
        const mockUpdateDisruptionKeyToWorkaroundEdit = jest.fn();
        const mockToggleEditEffectPanel = jest.fn();

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
                    toggleEditEffectPanel={ mockToggleEditEffectPanel }
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
            expect(mockUpdateIncident).toHaveBeenCalledWith(expectedIncident, false);
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
            expect(mockUpdateIncident).toHaveBeenCalledWith(expectedIncident, false);
        });

        it('Should call drawAffectedEntity when disruptions length was changed', () => {
            const newDisruption = {
                disruptionId: 139537,
                incidentNo: 'DISR139537',
                mode: 'Bus',
                affectedEntities: [{
                    stopId: '100-56c57897',
                    stopName: 'Papatoetoe Train Station',
                    stopCode: '100',
                    locationType: 1,
                    stopLat: -36.97766,
                    stopLon: 174.84925,
                    parentStation: null,
                    platformCode: null,
                    routeType: 2,
                    text: '100 - Papatoetoe Train Station',
                    category: {
                        type: 'stop',
                        icon: 'stop',
                        label: 'Stops',
                    },
                    icon: 'stop',
                    valueKey: 'stopCode',
                    labelKey: 'stopCode',
                    type: 'stop',
                },
                {
                    stopId: '101-9ef61446',
                    stopName: 'Otahuhu Train Station',
                    stopCode: '101',
                    locationType: 1,
                    stopLat: -36.94669,
                    stopLon: 174.83321,
                    parentStation: null,
                    platformCode: null,
                    routeType: 2,
                    text: '101 - Otahuhu Train Station',
                    category: {
                        type: 'stop',
                        icon: 'stop',
                        label: 'Stops',
                    },
                    icon: 'stop',
                    valueKey: 'stopCode',
                    labelKey: 'stopCode',
                    type: 'stop',
                },
                {
                    stopId: '102-a4eddeea',
                    stopName: 'Penrose Train Station',
                    stopCode: '102',
                    locationType: 1,
                    stopLat: -36.91009,
                    stopLon: 174.8157,
                    parentStation: null,
                    platformCode: null,
                    routeType: 2,
                    text: '102 - Penrose Train Station',
                    category: {
                        type: 'stop',
                        icon: 'stop',
                        label: 'Stops',
                    },
                    icon: 'stop',
                    valueKey: 'stopCode',
                    labelKey: 'stopCode',
                    type: 'stop',
                },
                {
                    stopId: '103-be3d2b7e',
                    stopName: 'Glen Innes Train Station',
                    stopCode: '103',
                    locationType: 1,
                    stopLat: -36.8788,
                    stopLon: 174.85412,
                    parentStation: null,
                    platformCode: null,
                    routeType: 2,
                    text: '103 - Glen Innes Train Station',
                    category: {
                        type: 'stop',
                        icon: 'stop',
                        label: 'Stops',
                    },
                    icon: 'stop',
                    valueKey: 'stopCode',
                    labelKey: 'stopCode',
                    type: 'stop',
                }],
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
            };

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

            wrapper.setProps({ incidentToEdit: {
                ...incidentForEdit,
                disruptions: [...incidentForEdit.disruptions, { ...newDisruption }],
            } });
            expect(mockUpdateAffectedStopsState).toHaveBeenCalledTimes(3); // 2 times for setup + 1 for redraw
            expect(mockUpdateAffectedRoutesState).toHaveBeenCalledTimes(3);
        });

        it('Should call updateIncident on add new effect with additional disruption', async () => {
            getStatusForEffect.mockReturnValue({ status: STATUSES.IN_PROGRESS });
            const newDisruption = {
                disruptionId: 139537,
                incidentNo: 'DISR139537',
                mode: 'Bus',
                affectedEntities: [{
                    stopId: '100-56c57897',
                    stopName: 'Papatoetoe Train Station',
                    stopCode: '100',
                    locationType: 1,
                    stopLat: -36.97766,
                    stopLon: 174.84925,
                    parentStation: null,
                    platformCode: null,
                    routeType: 2,
                    text: '100 - Papatoetoe Train Station',
                    category: {
                        type: 'stop',
                        icon: 'stop',
                        label: 'Stops',
                    },
                    icon: 'stop',
                    valueKey: 'stopCode',
                    labelKey: 'stopCode',
                    type: 'stop',
                },
                {
                    stopId: '101-9ef61446',
                    stopName: 'Otahuhu Train Station',
                    stopCode: '101',
                    locationType: 1,
                    stopLat: -36.94669,
                    stopLon: 174.83321,
                    parentStation: null,
                    platformCode: null,
                    routeType: 2,
                    text: '101 - Otahuhu Train Station',
                    category: {
                        type: 'stop',
                        icon: 'stop',
                        label: 'Stops',
                    },
                    icon: 'stop',
                    valueKey: 'stopCode',
                    labelKey: 'stopCode',
                    type: 'stop',
                },
                {
                    stopId: '102-a4eddeea',
                    stopName: 'Penrose Train Station',
                    stopCode: '102',
                    locationType: 1,
                    stopLat: -36.91009,
                    stopLon: 174.8157,
                    parentStation: null,
                    platformCode: null,
                    routeType: 2,
                    text: '102 - Penrose Train Station',
                    category: {
                        type: 'stop',
                        icon: 'stop',
                        label: 'Stops',
                    },
                    icon: 'stop',
                    valueKey: 'stopCode',
                    labelKey: 'stopCode',
                    type: 'stop',
                },
                {
                    stopId: '103-be3d2b7e',
                    stopName: 'Glen Innes Train Station',
                    stopCode: '103',
                    locationType: 1,
                    stopLat: -36.8788,
                    stopLon: 174.85412,
                    parentStation: null,
                    platformCode: null,
                    routeType: 2,
                    text: '103 - Glen Innes Train Station',
                    category: {
                        type: 'stop',
                        icon: 'stop',
                        label: 'Stops',
                    },
                    icon: 'stop',
                    valueKey: 'stopCode',
                    labelKey: 'stopCode',
                    type: 'stop',
                }],
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
                key: 'DISR139537',
            };

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
            wrapper.setProps({ editMode: EDIT_TYPE.ADD_EFFECT });
            wrapper.setState(prevState => ({
                ...prevState,
                newIncidentEffect: {
                    ...newDisruption,
                },
            }));
            momentFromDateTime.mockReturnValue(mockTimeForMoment);
            buildIncidentSubmitBody.mockReturnValue({});
            await wrapper.instance().onSubmitUpdate();
            expect(buildIncidentSubmitBody).toHaveBeenCalledWith(
                expect.objectContaining({
                    disruptions: expect.arrayContaining([expect.anything()]),
                }),
                true,
            );
            const callArgs = buildIncidentSubmitBody.mock.calls[0][0];
            expect(callArgs.disruptions).toHaveLength(2);
            expect(mockUpdateIncident).toHaveBeenCalled();
        });

        it('Should call updateIncident on add new effect with additional disruption for draft incident', async () => {
            getStatusForEffect.mockReturnValue({ status: STATUSES.IN_PROGRESS });
            const newDisruption = {
                disruptionId: 139537,
                incidentNo: 'DISR139537',
                mode: '',
                affectedEntities: [],
                impact: 'ESCALATOR_NOT_WORKING',
                cause: 'CONGESTION',
                startTime: '2025-08-21T20:27:00.000Z',
                endTime: null,
                status: 'draft',
                header: 'test incident n0827',
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
                incidentTitle: 'test draft n0827',
                incidentDisruptionNo: 'CCD139273',
                key: 'DISR139537',
            };
            const incident = {
                ...incidentForEdit,
                status: STATUSES.DRAFT,
            };
            wrapper = shallow(
                <CreateIncident
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createNewIncident={ mockCreateNewIncident }
                    openCreateIncident={ mockOpenCreateIncident }
                    toggleIncidentModals={ mockToggleIncidentModals }
                    action={ mockAction }
                    incidentToEdit={ incident }
                    editMode={ EDIT_TYPE.EDIT }
                    updateIncident={ mockUpdateIncident }
                    updateAffectedStopsState={ mockUpdateAffectedStopsState }
                    updateAffectedRoutesState={ mockUpdateAffectedRoutesState }
                    getRoutesByShortName={ mockGetRoutesByShortName }
                    isEditEffectPanelOpen
                />,
            );
            wrapper.setProps({ editMode: EDIT_TYPE.ADD_EFFECT });
            wrapper.setState(prevState => ({
                ...prevState,
                newIncidentEffect: {
                    ...newDisruption,
                },
            }));
            momentFromDateTime.mockReturnValue(mockTimeForMoment);
            buildIncidentSubmitBody.mockReturnValue({});
            await wrapper.instance().onSubmitUpdate();
            expect(buildIncidentSubmitBody).toHaveBeenCalledWith(
                expect.objectContaining({
                    disruptions: expect.arrayContaining([expect.anything()]),
                }),
                true,
            );
            const callArgs = buildIncidentSubmitBody.mock.calls[0][0];
            expect(callArgs.disruptions).toHaveLength(2);
            expect(mockUpdateIncident).toHaveBeenCalled();
            expect(wrapper.state('incidentData').status).toEqual(STATUSES.DRAFT);
        });

        it('Should update edit mode on addNewEffectToIncident call', async () => {
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
                    updateEditMode={ mockUpdateEditMode }
                    isEditEffectPanelOpen
                    updateDisruptionKeyToWorkaroundEdit={ mockUpdateDisruptionKeyToWorkaroundEdit }
                    toggleWorkaroundPanel={ mockToggleWorkaroundPanel }
                    setDisruptionForWorkaroundEdit={ mockSetDisruptionForWorkaroundEdit }
                    toggleEditEffectPanel={ mockToggleEditEffectPanel }
                />,
            );
            await wrapper.instance().addNewEffectToIncident();
            expect(mockSetDisruptionForWorkaroundEdit).toHaveBeenCalledWith({});
            expect(mockToggleWorkaroundPanel).toHaveBeenCalledWith(false);
            expect(mockUpdateDisruptionKeyToWorkaroundEdit).toHaveBeenCalledWith('');
            expect(mockUpdateAffectedStopsState).toHaveBeenCalledWith([]);
            expect(mockUpdateAffectedRoutesState).toHaveBeenCalledWith([]);
            expect(mockUpdateEditMode).toHaveBeenCalledWith(EDIT_TYPE.ADD_EFFECT);
            expect(mockUpdateCurrentStep).toHaveBeenCalledWith(2);
        });

        it('Add effect button should not be disabled if incident not resolved', async () => {
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
                    updateEditMode={ mockUpdateEditMode }
                    isEditEffectPanelOpen
                    updateDisruptionKeyToWorkaroundEdit={ mockUpdateDisruptionKeyToWorkaroundEdit }
                    toggleWorkaroundPanel={ mockToggleWorkaroundPanel }
                    setDisruptionForWorkaroundEdit={ mockSetDisruptionForWorkaroundEdit }
                />,
            );
            const button = wrapper.find('button.add-effect-button');
            expect(button.prop('disabled')).toBe(false);
        });

        it('Add effect button should be disabled if incident resolved', async () => {
            const incident = {
                ...incidentForEdit,
                status: STATUSES.RESOLVED,
            };
            wrapper = shallow(
                <CreateIncident
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createNewIncident={ mockCreateNewIncident }
                    openCreateIncident={ mockOpenCreateIncident }
                    toggleIncidentModals={ mockToggleIncidentModals }
                    action={ mockAction }
                    incidentToEdit={ incident }
                    editMode={ EDIT_TYPE.EDIT }
                    updateIncident={ mockUpdateIncident }
                    updateAffectedStopsState={ mockUpdateAffectedStopsState }
                    updateAffectedRoutesState={ mockUpdateAffectedRoutesState }
                    getRoutesByShortName={ mockGetRoutesByShortName }
                    updateEditMode={ mockUpdateEditMode }
                    isEditEffectPanelOpen
                    updateDisruptionKeyToWorkaroundEdit={ mockUpdateDisruptionKeyToWorkaroundEdit }
                    toggleWorkaroundPanel={ mockToggleWorkaroundPanel }
                    setDisruptionForWorkaroundEdit={ mockSetDisruptionForWorkaroundEdit }
                />,
            );
            const button = wrapper.find('button.add-effect-button');
            expect(button.prop('disabled')).toBe(true);
        });

        it('Should update newIncidentEffect value on updateNewIncidentEffect call', async () => {
            const newDisruption = {
                disruptionId: 139537,
                incidentNo: 'DISR139537',
                mode: 'Bus',
                affectedEntities: [],
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
                header: 'test incident n0827',
                feedEntityId: 'eacda2bb-baf4-44dc-9b11-bd2c15021ff1',
                uploadedFiles: null,
                createNotification: false,
                exemptAffectedTrips: null,
                version: 1,
                duration: '',
                recurrencePattern: null,
                recurrent: false,
                workarounds: [],
                notes: [],
                severity: 'HEADLINE',
                passengerCount: null,
                incidentId: 139273,
                incidentTitle: 'test incident n0827',
                incidentDisruptionNo: 'CCD139273',
                key: 'DISR139537',
            };
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
                    updateEditMode={ mockUpdateEditMode }
                    isEditEffectPanelOpen
                />,
            );
            await wrapper.instance().updateNewIncidentEffect(newDisruption);
            expect(wrapper.state('newIncidentEffect')).toEqual(newDisruption);
        });

        it('Should update newIncidentEffect value on updateNewIncidentEffect call', async () => {
            const newIncidentEffect = {
                disruptionId: 139537,
                incidentNo: 'DISR139537',
                mode: 'Bus',
                affectedEntities: [],
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
                header: 'test incident n0827',
                feedEntityId: 'eacda2bb-baf4-44dc-9b11-bd2c15021ff1',
                uploadedFiles: null,
                createNotification: false,
                exemptAffectedTrips: null,
                version: 1,
                duration: '',
                recurrencePattern: null,
                recurrent: false,
                workarounds: [],
                notes: [],
                severity: 'HEADLINE',
                passengerCount: null,
                incidentId: 139273,
                incidentTitle: 'test incident n0827',
                incidentDisruptionNo: 'CCD139273',
                key: 'DISR139537',
            };
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
                    updateEditMode={ mockUpdateEditMode }
                    isEditEffectPanelOpen
                />,
            );

            wrapper.setState(prevState => ({
                ...prevState,
                newIncidentEffect: {
                    ...newIncidentEffect,
                },
            }));
            await wrapper.instance().clearNewEffectToIncident();
            expect(wrapper.state('newIncidentEffect')).toEqual({});
        });

        it('Should open publish and apply modal on onPublishUpdate call', async () => {
            const draftIncident = {
                ...incidentForEdit,
                status: STATUSES.DRAFT,
                disruptions: [{ ...incidentForEdit.disruptions[0], status: STATUSES.DRAFT }],
            };
            wrapper = shallow(
                <CreateIncident
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createNewIncident={ mockCreateNewIncident }
                    openCreateIncident={ mockOpenCreateIncident }
                    toggleIncidentModals={ mockToggleIncidentModals }
                    action={ mockAction }
                    incidentToEdit={ draftIncident }
                    editMode={ EDIT_TYPE.EDIT }
                    updateIncident={ mockUpdateIncident }
                    updateAffectedStopsState={ mockUpdateAffectedStopsState }
                    updateAffectedRoutesState={ mockUpdateAffectedRoutesState }
                    getRoutesByShortName={ mockGetRoutesByShortName }
                    updateEditMode={ mockUpdateEditMode }
                    isEditEffectPanelOpen
                />,
            );
            wrapper.setState(prevState => ({
                ...prevState,
                isEffectUpdated: true,
            }));
            await wrapper.instance().onPublishUpdate();
            expect(mockToggleIncidentModals).toHaveBeenCalledWith('isPublishAndApplyChangesOpen', true);
        });

        it('Should update status to not-started on onPublishUpdate call', async () => {
            const draftIncident = {
                ...incidentForEdit,
                status: STATUSES.DRAFT,
                disruptions: [{ ...incidentForEdit.disruptions[0], status: STATUSES.DRAFT }],
            };
            wrapper = shallow(
                <CreateIncident
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createNewIncident={ mockCreateNewIncident }
                    openCreateIncident={ mockOpenCreateIncident }
                    toggleIncidentModals={ mockToggleIncidentModals }
                    action={ mockAction }
                    incidentToEdit={ draftIncident }
                    editMode={ EDIT_TYPE.EDIT }
                    updateIncident={ mockUpdateIncident }
                    updateAffectedStopsState={ mockUpdateAffectedStopsState }
                    updateAffectedRoutesState={ mockUpdateAffectedRoutesState }
                    getRoutesByShortName={ mockGetRoutesByShortName }
                    updateEditMode={ mockUpdateEditMode }
                    isEditEffectPanelOpen
                />,
            );
            await wrapper.instance().onPublishUpdate();
            expect(wrapper.state('incidentData').status).toEqual(STATUSES.NOT_STARTED);
        });

        it('Should update status to not-started on onPublishIncidentUpdate call and close publish and apply modal', async () => {
            const draftIncident = {
                ...incidentForEdit,
                status: STATUSES.DRAFT,
                disruptions: [{ ...incidentForEdit.disruptions[0], status: STATUSES.DRAFT }],
            };
            wrapper = shallow(
                <CreateIncident
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createNewIncident={ mockCreateNewIncident }
                    openCreateIncident={ mockOpenCreateIncident }
                    toggleIncidentModals={ mockToggleIncidentModals }
                    action={ mockAction }
                    incidentToEdit={ draftIncident }
                    editMode={ EDIT_TYPE.EDIT }
                    updateIncident={ mockUpdateIncident }
                    updateAffectedStopsState={ mockUpdateAffectedStopsState }
                    updateAffectedRoutesState={ mockUpdateAffectedRoutesState }
                    getRoutesByShortName={ mockGetRoutesByShortName }
                    updateEditMode={ mockUpdateEditMode }
                    isEditEffectPanelOpen
                    cachedShapes={ {} }
                />,
            );
            await wrapper.instance().onPublishIncidentUpdate();
            expect(wrapper.state('incidentData').status).toEqual(STATUSES.NOT_STARTED);
            expect(mockToggleIncidentModals).toHaveBeenCalledWith('isPublishAndApplyChangesOpen', false);
        });
    });

    describe('Entity Limit Validation', () => {
        let wrapper;
        const mockUpdateCurrentStep = jest.fn();
        const mockCreateNewIncident = jest.fn();
        const mockOpenCreateIncident = jest.fn();
        const mockToggleIncidentModals = jest.fn();
        const mockUpdateIncident = jest.fn();
        const mockUpdateAffectedStopsState = jest.fn();
        const mockUpdateAffectedRoutesState = jest.fn();
        const mockGetRoutesByShortName = jest.fn();
        const mockUpdateEditMode = jest.fn();

        const createDisruptionWithEntities = (routesCount, stopsCount) => ({
            key: 'DISR123',
            impact: 'CANCELLATIONS',
            startTime: '06:00',
            startDate: '10/06/2025',
            endTime: '09:00',
            endDate: '20/06/2025',
            cause: 'CONGESTION',
            mode: '-',
            status: 'not-started',
            header: 'Incident Title',
            createNotification: false,
            recurrent: true,
            duration: '2',
            recurrencePattern: {
                freq: RRule.WEEKLY,
                dtstart: new Date('2025-06-10T06:00:00.000Z'),
                until: new Date('2025-06-20T09:00:00.000Z'),
                byweekday: [0],
            },
            severity: 'MINOR',
            affectedEntities: {
                affectedRoutes: Array(routesCount).fill().map((_, i) => ({
                    category: { type: 'route', icon: '', label: 'Routes' },
                    labelKey: 'routeShortName',
                    routeId: `ROUTE-${i}`,
                    routeShortName: `ROUTE${i}`,
                    routeType: 2,
                    text: `ROUTE${i}`,
                    type: 'route',
                    valueKey: 'routeId',
                })),
                affectedStops: Array(stopsCount).fill().map((_, i) => ({
                    category: { type: 'stop', icon: '', label: 'Stops' },
                    labelKey: 'stopCode',
                    stopCode: `STOP${i}`,
                    stopName: `Stop ${i}`,
                    type: 'stop',
                    valueKey: 'stopCode',
                })),
            },
        });

        it('should handle empty affected entities', () => {
            const disruption = {
                ...createDisruptionWithEntities(0, 0),
                affectedEntities: {
                    affectedRoutes: [],
                    affectedStops: [],
                },
            };
            const incidentData = {
                ...defaultIncidentData,
                disruptions: [disruption],
            };
            wrapper = shallow(
                <CreateIncident
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createNewIncident={ mockCreateNewIncident }
                    openCreateIncident={ mockOpenCreateIncident }
                    toggleIncidentModals={ mockToggleIncidentModals }
                    action={ mockAction }
                    incidentToEdit={ incidentData }
                    editMode={ EDIT_TYPE.CREATE }
                    updateIncident={ mockUpdateIncident }
                    updateAffectedStopsState={ mockUpdateAffectedStopsState }
                    updateAffectedRoutesState={ mockUpdateAffectedRoutesState }
                    getRoutesByShortName={ mockGetRoutesByShortName }
                    updateEditMode={ mockUpdateEditMode }
                />,
            );

            wrapper.instance().onSubmit();
            expect(wrapper.find('IncidentLimitModal').prop('isOpen')).toBe(false);
        });

        it('should handle null affected entities', () => {
            const disruption = {
                ...createDisruptionWithEntities(0, 0),
                affectedEntities: null,
            };
            const incidentData = {
                ...defaultIncidentData,
                disruptions: [disruption],
            };
            wrapper = shallow(
                <CreateIncident
                    updateCurrentStep={ mockUpdateCurrentStep }
                    createNewIncident={ mockCreateNewIncident }
                    openCreateIncident={ mockOpenCreateIncident }
                    toggleIncidentModals={ mockToggleIncidentModals }
                    action={ mockAction }
                    incidentToEdit={ incidentData }
                    editMode={ EDIT_TYPE.CREATE }
                    updateIncident={ mockUpdateIncident }
                    updateAffectedStopsState={ mockUpdateAffectedStopsState }
                    updateAffectedRoutesState={ mockUpdateAffectedRoutesState }
                    getRoutesByShortName={ mockGetRoutesByShortName }
                    updateEditMode={ mockUpdateEditMode }
                />,
            );

            wrapper.instance().onSubmit();
            expect(wrapper.find('IncidentLimitModal').prop('isOpen')).toBe(false);
        });

        it('should close modal when onClose is called', () => {
            const disruption = createDisruptionWithEntities(150, 100);
            const incidentData = {
                ...defaultIncidentData,
                disruptions: [disruption],
            };

            const mockStore = configureStore([thunk]);
            const store = mockStore({
                control: {
                    incidents: {
                        routesByStop: (() => {
                            const routesByStop = {};
                            for (let i = 0; i < 200; i++) {
                                routesByStop[`STOP${i}`] = [];
                            }
                            return routesByStop;
                        })(),
                    },
                },
            });

            wrapper = mount(
                <Provider store={ store }>
                    <CreateIncident
                        updateCurrentStep={ mockUpdateCurrentStep }
                        createNewIncident={ mockCreateNewIncident }
                        openCreateIncident={ mockOpenCreateIncident }
                        toggleIncidentModals={ mockToggleIncidentModals }
                        action={ mockAction }
                        incidentToEdit={ incidentData }
                        editMode={ EDIT_TYPE.CREATE }
                        updateIncident={ mockUpdateIncident }
                        updateAffectedStopsState={ mockUpdateAffectedStopsState }
                        updateAffectedRoutesState={ mockUpdateAffectedRoutesState }
                        getRoutesByShortName={ mockGetRoutesByShortName }
                        updateEditMode={ mockUpdateEditMode }
                    />
                </Provider>,
            );

            wrapper.instance().onSubmit();
            expect(wrapper.find('IncidentLimitModal').prop('isOpen')).toBe(true);

            const modal = wrapper.find('IncidentLimitModal');
            modal.prop('onClose')();
            expect(wrapper.find('IncidentLimitModal').prop('isOpen')).toBe(false);
        });
    });
});
