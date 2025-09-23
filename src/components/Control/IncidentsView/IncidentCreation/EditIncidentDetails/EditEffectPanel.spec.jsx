/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { mount } from 'enzyme';
import EditEffectPanel from './EditEffectPanel';
import {
    toggleEditEffectPanel,
    updateDisruptionKeyToEditEffect,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
    updateDisruption,
    getRoutesByShortName,
    updateAffectedStopsState,
    updateAffectedRoutesState,
    setRequireToUpdateWorkaroundsState,
    setDisruptionForWorkaroundEdit,
    setRequestToUpdateEditEffectState,
    toggleIncidentModals,
    setRequestedDisruptionKeyToUpdateEditEffect,
    getStopsByRoute,
} from '../../../../../redux/actions/control/incidents';
import { useAlertCauses, useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import { STATUSES } from '../../../../../types/disruptions-types';

import SEARCH_RESULT_TYPE from '../../../../../types/search-result-types';

const mockStore = configureStore([thunk]);

const mockDisruption = {
    key: 'DISR123',
    incidentNo: 'DISR123',
    impact: 'CANCELLATIONS',
    startTime: '06:00',
    startDate: '10/06/2025',
    endTime: '09:00',
    endDate: '20/06/2025',
    cause: 'CONGESTION',
    mode: '-',
    status: 'not-started',
    header: 'Incident Title n123',
    url: 'https://at.govt.nz',
    createNotification: false,
    recurrent: true,
    duration: '2',
    recurrencePattern: {
        freq: 2,
        dtstart: new Date('2025-06-10T06:00:00.000Z'),
        until: new Date('2025-06-20T06:00:00.000Z'),
        byweekday: [0],
    },
    severity: 'MINOR',
    affectedEntities: {
        affectedRoutes: [{
            category: { type: 'route', icon: '', label: 'Routes' },
            labelKey: 'routeShortName',
            routeId: '101-202',
            routeShortName: '101',
            routeType: 3,
            text: '101',
            type: 'route',
            valueKey: 'routeId',
        }],
        affectedStops: [],
    },
    notes: [],
    disruptionType: 'Routes',
};

jest.useFakeTimers();

jest.mock('../../../../../redux/actions/control/incidents', () => ({
    toggleEditEffectPanel: jest.fn(),
    updateDisruptionKeyToEditEffect: jest.fn(),
    toggleWorkaroundPanel: jest.fn(),
    updateDisruption: jest.fn(),
    getRoutesByShortName: jest.fn(),
    updateAffectedStopsState: jest.fn(),
    updateAffectedRoutesState: jest.fn(),
    setRequireToUpdateWorkaroundsState: jest.fn(),
    setDisruptionForWorkaroundEdit: jest.fn(),
    setRequestToUpdateEditEffectState: jest.fn(),
    toggleIncidentModals: jest.fn(),
    setRequestedDisruptionKeyToUpdateEditEffect: jest.fn(),
    updateDisruptionKeyToWorkaroundEdit: jest.fn(),
    getStopsByRoute: jest.fn(),
}));

jest.mock('../../../../../utils/control/alert-cause-effect', () => ({
    useAlertCauses: jest.fn(),
    useAlertEffects: jest.fn(),
}));

jest.mock('react-flatpickr', () => props => (
    // eslint-disable-next-line react/prop-types
    <input data-testid={ props['data-testid'] } id={ props.id } value={ props.value } onChange={ e => props.onChange([new Date(e.target.value)]) } />
));

const fakeNow = new Date(2025, 5, 9, 11, 37, 0);

describe('Confirmation Component', () => {
    let store;

    const defaultProps = {
        disruptions: [{ ...mockDisruption }],
        toggleEditEffectPanel: jest.fn(),
        isEditEffectPanelOpen: false,
        disruptionIncidentNoToEdit: '',
        updateDisruptionKeyToEditEffect: jest.fn(),
        disruptionRecurrent: false,
        modalOpenedTime: '2025-06-09T11:00:00.000Z',
        isWorkaroundPanelOpen: false,
        toggleWorkaroundPanel: jest.fn(),
        updateDisruptionKeyToWorkaroundEdit: jest.fn(),
        isNotesRequiresToUpdate: false,
        updateIsNotesRequiresToUpdateState: jest.fn(),
        isWorkaroundsRequiresToUpdate: false,
        updateIsWorkaroundsRequiresToUpdateState: jest.fn(),
        updateDisruptionAction: jest.fn(),
        updateAffectedRoutesState: jest.fn(),
        updateAffectedStopsState: jest.fn(),
        getRoutesByShortName: jest.fn(),
        setRequireToUpdateWorkaroundsState: jest.fn(),
        setDisruptionForWorkaroundEdit: jest.fn(),
        workaroundsToSync: [],
        isEditEffectUpdateRequested: false,
        newDisruptionKey: '',
        setRequestToUpdateEditEffectState: jest.fn(),
        isCancellationEffectOpen: false,
        toggleIncidentModals: jest.fn(),
        setRequestedDisruptionKeyToUpdateEditEffect: jest.fn(),
        updateEditableDisruption: jest.fn(),
        applyDisruptionChanges: jest.fn(),
        updateEffectValidationState: jest.fn(),
        updateIsEffectUpdatedState: jest.fn(),
        updateEffectValidationForPublishState: jest.fn(),
    };

    beforeEach(() => {
        jest.setSystemTime(fakeNow);
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
        toggleEditEffectPanel.mockImplementation(isEditEffectPanelOpen => (dispatch) => {
            dispatch({ type: 'MOCK_TOGGLE_EDIT_EFFECT_PANEL', payload: isEditEffectPanelOpen });
        });
        updateDisruptionKeyToEditEffect.mockImplementation(disruptionKeyToEditEffect => (dispatch) => {
            dispatch({ type: 'MOCK_UPDATE_DISRUPTION_KEY_TO_EDIT_EFFECT', payload: disruptionKeyToEditEffect });
        });
        toggleWorkaroundPanel.mockImplementation(isOpen => (dispatch) => {
            dispatch({ type: 'MOCK_TOGGLE_WORKAROUND_PANEL', payload: { isOpen } });
        });
        updateDisruptionKeyToWorkaroundEdit.mockImplementation(disruptionKeyToWorkaroundEdit => (dispatch) => {
            dispatch({ type: 'MOCK_DISRUPTION_KEY_TO_WORKAROUND_EDIT', payload: { disruptionKeyToWorkaroundEdit } });
        });
        updateDisruption.mockImplementation(disruption => (dispatch) => {
            dispatch({ type: 'MOCK_UPDATE_DISRUPTION', payload: { disruption } });
        });
        updateAffectedRoutesState.mockImplementation(affectedRoutes => (dispatch) => {
            dispatch({ type: 'MOCK_UPDATE_AFFECTED_ROUTES', payload: { affectedRoutes } });
        });
        updateAffectedStopsState.mockImplementation(affectedStops => (dispatch) => {
            dispatch({ type: 'MOCK_UPDATE_AFFECTED_STOPS', payload: { affectedStops } });
        });
        getRoutesByShortName.mockImplementation(currentRoutes => (dispatch) => {
            dispatch({ type: 'MOCK_GET_ROUTES_BY_SHORT_NAME', payload: { currentRoutes } });
        });
        setRequireToUpdateWorkaroundsState.mockImplementation(isWorkaroundsNeedsToBeUpdated => (dispatch) => {
            dispatch({ type: 'MOCK_SET_REQUIRE_TO_UPDATE_WORKAROUNDS_STATE', payload: { isWorkaroundsNeedsToBeUpdated } });
        });
        setDisruptionForWorkaroundEdit.mockImplementation(disruptionForWorkaroundEdit => (dispatch) => {
            dispatch({ type: 'MOCK_DISRUPTION_FOR_WORKAROUND_EDIT', payload: { disruptionForWorkaroundEdit } });
        });
        setRequestToUpdateEditEffectState.mockImplementation(requestToUpdateEditEffect => (dispatch) => {
            dispatch({ type: 'MOCK_SET_REQUEST_TO_UPDATE_EDIT_EFFECT_STATE', payload: { requestToUpdateEditEffect } });
        });
        toggleIncidentModals.mockImplementation((type, isOpen) => (dispatch) => {
            dispatch({ type: 'MOCK_TOGGLE_INCIDENT_MODALS', payload: { type, isOpen } });
        });
        setRequestedDisruptionKeyToUpdateEditEffect.mockImplementation(requestedDisruptionKeyToUpdateEditEffect => (dispatch) => {
            dispatch({ type: 'MOCK_SET_REQUESTED_DISRUPTION_KEY_TO_UPDATE_EDIT_EFFECT', payload: { requestedDisruptionKeyToUpdateEditEffect } });
        });
        getStopsByRoute.mockImplementation(routes => (dispatch) => {
            dispatch({ type: 'MOCK_GET_STOP_BY_ROUTES', payload: { routes } });
        });
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
                        isEditEffectPanelOpen: true,
                        disruptionKeyToEditEffect: 'DISR123',
                        isWorkaroundPanelOpen: false,
                        requestToUpdateEditEffect: false,
                        requestedDisruptionKeyToUpdateEditEffect: '',
                        isCancellationEffectOpen: false,
                        stopsByRoute: {},
                        routesByStop: {},
                        cachedStopsToRoutes: {},
                        cachedRoutesToStops: {},
                    },
                    dataManagement: {
                        stopGroups: [], // TODO
                        isStopGroupsLoading: false,
                    },
                },
            static: {
                stops: [],
                routes: [],
            },
            appSettings: {
                useParentChildIncident: 'true',
            },
            search: {
                isLoading: false,
                isFocus: false,
                searchTerms: '',
                results: {
                    [SEARCH_RESULT_TYPE.ADDRESS.type]: [],
                    [SEARCH_RESULT_TYPE.ROUTE.type]: [
                        {
                            text: '101',
                            data: {
                                route_id: '101-202',
                                route_type: 3,
                                extended_route_type: 3,
                                route_short_name: '101',
                                agency_name: 'New Zealand Bus',
                                agency_id: 'NZB',
                                route_color: null,
                                route_text_color: null,
                                tokens: [
                                    '101',
                                ],
                            },
                            category: {
                                type: 'route',
                                icon: '',
                                label: 'Routes',
                            },
                            icon: 'Bus',
                        },
                        {
                            text: '105',
                            data: {
                                route_id: '105-202',
                                route_type: 3,
                                extended_route_type: 3,
                                route_short_name: '105',
                                agency_name: 'New Zealand Bus',
                                agency_id: 'NZB',
                                route_color: null,
                                route_text_color: null,
                                tokens: [
                                    '105',
                                ],
                            },
                            category: {
                                type: 'route',
                                icon: '',
                                label: 'Routes',
                            },
                            icon: 'Bus',
                        },
                        {
                            text: '106',
                            data: {
                                route_id: '106-202',
                                route_type: 3,
                                extended_route_type: 3,
                                route_short_name: '106',
                                agency_name: 'New Zealand Bus',
                                agency_id: 'NZB',
                                route_color: null,
                                route_text_color: null,
                                tokens: [
                                    '106',
                                ],
                            },
                            category: {
                                type: 'route',
                                icon: '',
                                label: 'Routes',
                            },
                            icon: 'Bus',
                        },
                    ],
                    [SEARCH_RESULT_TYPE.STOP.type]: [
                        {
                            text: '100 - Papatoetoe Train Station',
                            data: {
                                stop_id: '100-56c57897',
                                stop_name: 'Papatoetoe Train Station',
                                stop_code: '100',
                                location_type: 1,
                                stop_lat: -36.97766,
                                stop_lon: 174.84925,
                                parent_station: null,
                                platform_code: null,
                                route_type: 2,
                                parent_stop_code: null,
                                tokens: [
                                    'papatoetoe',
                                    'train',
                                    'station',
                                    '100',
                                ],
                            },
                            category: {
                                type: 'stop',
                                icon: 'stop',
                                label: 'Stops',
                            },
                            icon: 'stop',
                        },
                        {
                            text: '101 - Otahuhu Train Station',
                            data: {
                                stop_id: '101-9ef61446',
                                stop_name: 'Otahuhu Train Station',
                                stop_code: '101',
                                location_type: 1,
                                stop_lat: -36.94669,
                                stop_lon: 174.83321,
                                parent_station: null,
                                platform_code: null,
                                route_type: 2,
                                parent_stop_code: null,
                                tokens: [
                                    'otahuhu',
                                    'train',
                                    'station',
                                    '101',
                                ],
                            },
                            category: {
                                type: 'stop',
                                icon: 'stop',
                                label: 'Stops',
                            },
                            icon: 'stop',
                        },
                        {
                            text: '102 - Penrose Train Station',
                            data: {
                                stop_id: '102-a4eddeea',
                                stop_name: 'Penrose Train Station',
                                stop_code: '102',
                                location_type: 1,
                                stop_lat: -36.91009,
                                stop_lon: 174.8157,
                                parent_station: null,
                                platform_code: null,
                                route_type: 2,
                                parent_stop_code: null,
                                tokens: [
                                    'penrose',
                                    'train',
                                    'station',
                                    '102',
                                ],
                            },
                            category: {
                                type: 'stop',
                                icon: 'stop',
                                label: 'Stops',
                            },
                            icon: 'stop',
                        },
                    ],
                    [SEARCH_RESULT_TYPE.BUS.type]: [],
                    [SEARCH_RESULT_TYPE.TRAIN.type]: [],
                    [SEARCH_RESULT_TYPE.FERRY.type]: [],
                    [SEARCH_RESULT_TYPE.BLOCK.type]: [],
                    [SEARCH_RESULT_TYPE.CONTROL_ROUTE.type]: [],
                    [SEARCH_RESULT_TYPE.CONTROL_ROUTE_VARIANT.type]: [],
                    [SEARCH_RESULT_TYPE.CONTROL_ALERTS_ROUTES.type]: [],
                    [SEARCH_RESULT_TYPE.STOP_GROUP.type]: [
                        {
                            text: 'Stop Group 1',
                            data: {
                                id: 9,
                                title: 'Stop Group 1',
                                stops: [
                                    {
                                        value: '100',
                                        label: '100 - qwe',
                                    },
                                    {
                                        value: '101',
                                        label: '101 - asd',
                                    },
                                    {
                                        value: '102',
                                        label: '102 - zxc',
                                    },
                                ],
                                user: 'qwe@propellerhead.co.nz',
                                timestamp: '2023-02-13T18:55:59+13:00',
                                workflowState: 'UPDATED',
                                tokens: [
                                    '100',
                                    '101',
                                    '102',
                                ],
                            },
                            category: {
                                type: 'stop-group',
                                icon: '',
                                label: 'Stop groups',
                            },
                            icon: '',
                        },
                        {
                            text: 'Stop Group 2',
                            data: {
                                id: 11,
                                title: 'Stop Group 2',
                                stops: [
                                    {
                                        value: '101',
                                        label: '101 - asd',
                                    },
                                    {
                                        value: '102',
                                        label: '102 - zxc',
                                    },
                                ],
                                user: 'qwe@propellerhead.co.nz',
                                timestamp: '2023-02-13T18:55:59+13:00',
                                workflowState: 'UPDATED',
                                tokens: [
                                    '101',
                                    '102',
                                ],
                            },
                            category: {
                                type: 'stop-group',
                                icon: '',
                                label: 'Stop groups',
                            },
                            icon: '',
                        },
                    ],
                    [SEARCH_RESULT_TYPE.STOP_GROUP_MERGED.type]: [],
                    [SEARCH_RESULT_TYPE.STOP_MESSAGE.type]: [],
                    [SEARCH_RESULT_TYPE.STOP_DISRUPTION.type]: [],
                    [SEARCH_RESULT_TYPE.STOP_IN_GROUP.type]: [],
                },
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Renders without crashing and displays edit effect panel', () => {
        render(
            <Provider store={ store }>
                <EditEffectPanel { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('Edit details of Effect DISR123')).toBeInTheDocument();
        expect(screen.getByText('Disruption Title')).toBeInTheDocument();
        expect(screen.getByText('Start Time')).toBeInTheDocument();
        expect(screen.getByText('Start Date')).toBeInTheDocument();
        expect(screen.getByText('End Date')).toBeInTheDocument();
        expect(screen.getByText('Search routes or draw in the map')).toBeInTheDocument();
    });

    it('Should update startDate value with status(if start date is before now) and recurrencePattern on startDate change', () => {
        render(
            <Provider store={ store }>
                <EditEffectPanel { ...defaultProps } />
            </Provider>,
        );
        const startPicker = screen.getByTestId('start-date_date-picker');
        fireEvent.change(startPicker, { target: { value: '2025-06-08' } });

        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledTimes(5);
        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledWith({ ...mockDisruption,
            startDate: '08/06/2025',
            status: 'in-progress',
            recurrencePattern: {
                freq: 2,
                dtstart: new Date('2025-06-08T06:00:00.000Z'),
                until: new Date('2025-06-20T06:00:00.000Z'),
                byweekday: [0],
            },
        });
    });

    it('Should update endDate value with recurrencePattern on endDate change', () => {
        render(
            <Provider store={ store }>
                <EditEffectPanel { ...defaultProps } />
            </Provider>,
        );
        const endPicker = screen.getByTestId('end-date_date-picker');
        fireEvent.change(endPicker, { target: { value: '2025-06-25' } });

        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledTimes(4);
        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledWith({ ...mockDisruption,
            endDate: '25/06/2025',
            recurrencePattern: {
                freq: 2,
                dtstart: new Date('2025-06-10T06:00:00.000Z'),
                until: new Date('2025-06-25T06:00:00.000Z'),
                byweekday: [0],
            },
        });
    });

    it('Should update startTime value with recurrencePattern on startTime change', () => {
        render(
            <Provider store={ store }>
                <EditEffectPanel { ...defaultProps } />
            </Provider>,
        );
        const input = screen.getByTestId('start-time_input');
        fireEvent.change(input, { target: { value: '11:11' } });

        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledTimes(4);
        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledWith({ ...mockDisruption,
            startTime: '11:11',
            recurrencePattern: {
                freq: 2,
                dtstart: new Date('2025-06-10T11:11:00.000Z'),
                until: new Date('2025-06-20T11:11:00.000Z'),
                byweekday: [0],
            },
        });
    });

    it('Should update status, startDate, startTime, endDate, endTime and recurrentPattern on changing status from not-started to resolved', () => {
        render(
            <Provider store={ store }>
                <EditEffectPanel { ...defaultProps } />
            </Provider>,
        );
        const input = document.getElementById('disruption-detail__status');
        fireEvent.change(input, { target: { value: STATUSES.RESOLVED } });

        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledTimes(5);
        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledWith({ ...mockDisruption,
            startDate: '09/06/2025',
            startTime: '11:37',
            endDate: '09/06/2025',
            endTime: '11:37',
            status: 'resolved',
            recurrencePattern: {
                freq: 2,
                dtstart: new Date('2025-06-09T11:37:00.000Z'),
                until: new Date('2025-06-09T11:37:00.000Z'),
                byweekday: [0],
            },
        });
    });

    it('Should update impact on change', () => {
        render(
            <Provider store={ store }>
                <EditEffectPanel { ...defaultProps } />
            </Provider>,
        );
        const input = document.getElementById('disruption-creation__wizard-select-details__impact');
        fireEvent.change(input, { target: { value: 'BUS_REPLACES_FERRY' } });

        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledWith({ ...mockDisruption,
            impact: 'BUS_REPLACES_FERRY',
        });
    });

    it('Should update severity on change', () => {
        render(
            <Provider store={ store }>
                <EditEffectPanel { ...defaultProps } />
            </Provider>,
        );
        const input = document.getElementById('disruption-creation__wizard-select-details__severity');
        fireEvent.change(input, { target: { value: 'CATASTROPHIC' } });

        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledWith({ ...mockDisruption,
            severity: 'CATASTROPHIC',
            isSeverityDirty: true,
        });
    });

    it('Should update endTime on change', () => {
        const props = { ...defaultProps,
            disruptions: [{ ...mockDisruption, recurrent: false }],
        };
        render(
            <Provider store={ store }>
                <EditEffectPanel { ...props } />
            </Provider>,
        );
        const input = screen.getByTestId('end-time_input');
        fireEvent.change(input, { target: { value: '13:13' } });

        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledTimes(4);
        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledWith({ ...mockDisruption,
            endTime: '13:13',
            recurrent: false,
        });
    });

    it('Should default endTime to 23:59 when endDate is selected and endTime is empty', () => {
        const props = { ...defaultProps,
            disruptions: [{ ...mockDisruption, recurrent: false, endTime: '' }],
        };
        const wrapper = mount(
            <Provider store={ store }>
                <EditEffectPanel { ...props } />
            </Provider>,
        );

        const flatpickrs = wrapper.find('Flatpickr');
        const endDateFlatpickr = flatpickrs.findWhere(flatpickr => flatpickr.prop('id') === 'disruption-creation__wizard-select-details__end-date');

        if (endDateFlatpickr.length > 0) {
            const onChange = endDateFlatpickr.prop('onChange');
            const testDate = [new Date('2024-01-15T06:00:00.000Z')];
            onChange(testDate);

            expect(defaultProps.updateEditableDisruption).toHaveBeenCalledWith({ ...mockDisruption,
                endDate: '15/01/2024',
                endTime: '23:59',
                recurrent: false,
            });
        }
    });

    it('Should update recurrencePattern on change', () => {
        const props = { ...defaultProps,
            disruptionRecurrent: true,
        };
        render(
            <Provider store={ store }>
                <EditEffectPanel { ...props } />
            </Provider>,
        );
        const button = screen.getByText('F');
        fireEvent.click(button);
        expect(defaultProps.updateEditableDisruption).toHaveBeenCalledWith({ ...mockDisruption,
            recurrencePattern: {
                freq: 2,
                dtstart: new Date('2025-06-10T06:00:00.000Z'),
                until: new Date('2025-06-20T06:00:00.000Z'),
                byweekday: [0, 4],
            },
        });
    });

    it('should disable submit button when affectedRoutes and affectedStops are empty', () => {
        const props = {
            ...defaultProps,
            disruptions: [{
                ...mockDisruption,
                affectedEntities: {
                    affectedRoutes: [],
                    affectedStops: [],
                },
            }],
        };

        render(
            <Provider store={ store }>
                <EditEffectPanel { ...props } />
            </Provider>,
        );

        const applyButton = screen.getByRole('button', { name: /apply/i });
        expect(applyButton).toBeDisabled();
    });

    it('should disable apply button when header is empty', () => {
        const props = {
            ...defaultProps,
            disruptions: [{
                ...mockDisruption,
                header: '',
                cause: 'CONGESTION',
            }],
        };

        render(
            <Provider store={ store }>
                <EditEffectPanel { ...props } />
            </Provider>,
        );

        const applyButton = screen.getByRole('button', { name: /apply/i });
        expect(applyButton).toBeDisabled();
    });

    it('should disable apply button when cause is empty', () => {
        const props = {
            ...defaultProps,
            disruptions: [{
                ...mockDisruption,
                header: 'Test Header',
                cause: '',
            }],
        };

        render(
            <Provider store={ store }>
                <EditEffectPanel { ...props } />
            </Provider>,
        );

        const applyButton = screen.getByRole('button', { name: /apply/i });
        expect(applyButton).toBeDisabled();
    });

    it('should disable submit button when recurrent with empty byweekday', () => {
        const props = {
            ...defaultProps,
            disruptions: [{
                ...mockDisruption,
                recurrent: true,
                recurrencePattern: {
                    byweekday: [],
                },
            }],
        };

        render(
            <Provider store={ store }>
                <EditEffectPanel { ...props } />
            </Provider>,
        );

        const applyButton = screen.getByRole('button', { name: /apply/i });
        expect(applyButton).toBeDisabled();
    });

    it('should disable submit button when recurrent is false', () => {
        const props = {
            ...defaultProps,
            disruptions: [{
                ...mockDisruption,
                disruptionId: 'DISR123',
                recurrent: false,
                startTime: '10:00',
                startDate: '2025-06-10',
                impact: 'DETOUR',
                cause: 'CONSTRUCTION',
                header: 'Test Header',
                severity: 'SIGNIFICANT',
                endDate: '2025-06-11',
                endTime: '18:00',
                duration: '2',
                status: 'in-progress',
                affectedEntities: {
                    affectedRoutes: [{ routeId: 'ROUTE1' }],
                    affectedStops: [],
                },
                recurrencePattern: {
                    byweekday: [],
                },
            }],
            modalOpenedTime: '2025-06-08T08:00:00.000Z',
        };

        render(
            <Provider store={ store }>
                <EditEffectPanel { ...props } />
            </Provider>,
        );

        const applyButton = screen.getByRole('button', { name: /apply/i });
        expect(applyButton).toBeDisabled();
    });

    describe('Diversion functionality', () => {
        const mockDiversionProps = {
            ...defaultProps,
            useDiversion: true,
            isDiversionManagerOpen: false,
            openDiversionManager: jest.fn(),
            updateDiversionMode: jest.fn(),
        };

        it('should handle diversion manager state correctly', () => {
            const props = {
                ...mockDiversionProps,
                disruptions: [{
                    ...mockDisruption,
                    disruptionId: 'DISR123',
                    status: STATUSES.NOT_STARTED,
                    affectedEntities: {
                        affectedRoutes: [{ routeType: 3 }],
                        affectedStops: [],
                    },
                }],
            };

            render(
                <Provider store={ store }>
                    <EditEffectPanel { ...props } />
                </Provider>,
            );

            expect(screen.getByText('Edit details of Effect DISR123')).toBeInTheDocument();
        });

        it('should not render diversion button when useDiversion is false', () => {
            const props = {
                ...mockDiversionProps,
                useDiversion: false,
                disruptions: [{
                    ...mockDisruption,
                    disruptionId: 'DISR123',
                }],
            };

            render(
                <Provider store={ store }>
                    <EditEffectPanel { ...props } />
                </Provider>,
            );

            expect(screen.queryByText(/Diversions/)).not.toBeInTheDocument();
        });
    });
});
