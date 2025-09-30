import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import {
    updateDisruptionFilters,
    updateRequestingDisruptionResult,
    updateDisruptionsDatagridConfig,
    searchByDrawing,
    updateDisruption,
    publishDraftDisruption,
    createDisruption,
} from './disruptions';
import { INIT_STATE } from '../../reducers/control/disruptions';
import ACTION_TYPE from '../../action-types';
import SEARCH_RESULT_TYPE from '../../../types/search-result-types';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import * as disruptionsMgtApi from '../../../utils/transmitters/disruption-mgt-api';
import { ACTION_RESULT } from '../../../types/disruptions-types';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;
const mockFilters = {
    selectedEntity: {
        text: 'EAST',
        data: {
            route_id: 'EAST-201',
        },
    },
    selectedStatus: 'in-progress',
    selectedStartDate: new Date(),
    selectedEndDate: new Date(),
};

const mockDataGridConfig = {
    columns: [],
    page: 0,
    pageSize: 15,
    sortModel: [],
    density: 'standard',
    routeSelection: '',
    filterModel: { items: [], linkOperator: 'and' },
    pinnedColumns: { right: ['__detail_panel_toggle__'] },
};

const mockShape = {
    type: 'circle',
    coordinates: [{ lat: 1, lng: 1 }],
    radius: 200,
};

jest.mock('../../../utils/transmitters/cc-static', () => ({
    geoSearch: jest.fn(),
    getRoutesByShortName: jest.fn(),
}));

jest.mock('../../../utils/transmitters/disruption-mgt-api', () => ({
    updateDisruption: jest.fn(),
    getDisruptions: jest.fn(),
    createDisruption: jest.fn(),
}));

describe('Disruptions actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        store = mockStore({ control: { disruptions: INIT_STATE } });
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('updates filters', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_DISRUPTION_FILTERS,
                payload: {
                    filters: mockFilters,
                },
            },
        ];

        await store.dispatch(updateDisruptionFilters(mockFilters));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('updates the datagrid config', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_DISRUPTION_DATAGRID_CONFIG,
                payload: mockDataGridConfig,
            },
        ];

        await store.dispatch(updateDisruptionsDatagridConfig(mockDataGridConfig));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('updates requesting disruption result', async () => {
        const mock = {
            resultDisruptionId: 'de728acf-4445-48d7-9a00-c151661245a2',
            resultStatus: 202,
            resultMessage: 'Sample message',
            resultCreateNotification: true,
            resultDisruptionVersion: 3,
        };

        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT,
                payload: {
                    ...mock,
                },
            },
        ];

        await store.dispatch(updateRequestingDisruptionResult(mock.resultDisruptionId, mock));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('Search routes by drawing: should perform search routes by geoseach', async () => {
        const expectedAction = {
            type: ACTION_TYPE.UPDATE_AFFECTED_ENTITIES,
            payload: { affectedRoutes: [] },
        };
        ccStatic.geoSearch.mockResolvedValue([]);
        await store.dispatch(searchByDrawing('Routes', mockShape));
        expect(store.getActions()[1]).to.deep.eql(expectedAction);
    });

    it('Search routes by drawing: should keep existing routes if there is a new search', async () => {
        const expectedAction = {
            type: ACTION_TYPE.UPDATE_AFFECTED_ENTITIES,
            payload: { affectedRoutes: [
                { labelKey: 'routeShortName', routeId: 'NX1', routeShortName: 'NX1', type: 'route', valueKey: 'routeId' },
                { labelKey: 'routeShortName', routeId: 'NX2', routeShortName: 'NX2', text: 'NX2', type: 'route', valueKey: 'routeId', routeType: '', agencyId: '', agencyName: '' },
            ] },
        };
        const existingEffectedRoutes = [{
            routeId: 'NX1',
            routeShortName: 'NX1',
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: SEARCH_RESULT_TYPE.ROUTE.type,
        }];
        const mockSearchResult = [{
            route_id: 'NX2',
        }];
        const staticRoutes = { NX2: {
            route_id: 'NX2',
            route_short_name: 'NX2',
            route_type: '',
            agency_id: '',
            agency_name: '',
        } };

        store = mockStore({
            control: { disruptions: { ...INIT_STATE, affectedEntities: { affectedRoutes: existingEffectedRoutes } } },
            static: { routes: staticRoutes },
        });

        ccStatic.geoSearch.mockResolvedValue(mockSearchResult);
        await store.dispatch(searchByDrawing('Routes', mockShape));
        expect(store.getActions()[1]).to.deep.eql(expectedAction);
    });

    it('Search stops by drawing: should perform search stops by geoseach', async () => {
        const expectedAction = {
            type: ACTION_TYPE.UPDATE_AFFECTED_ENTITIES,
            payload: { affectedStops: [] },
        };
        ccStatic.geoSearch.mockResolvedValue([]);
        await store.dispatch(searchByDrawing('Stops', mockShape));
        expect(store.getActions()[1]).to.eql(expectedAction);
    });

    it('Search stops by drawing: should keep existing stops if there is a new search', async () => {
        const expectedAction = {
            type: ACTION_TYPE.UPDATE_AFFECTED_ENTITIES,
            payload: { affectedStops: [
                { stopCode: '133', stopId: '133', stopName: '133', type: 'stop' },
                { stopCode: '115',
                    stopId: '115',
                    stopName: '115',
                    text: '115 - 115',
                    routeType: '',
                    type: 'stop',
                    labelKey: 'stopCode',
                    valueKey: 'stopCode',
                    locationType: 1,
                    parentStation: '',
                    platformCode: '',
                    stopLat: '',
                    stopLon: '',
                },
            ] },
        };
        const existingEffectedStops = [{
            stopId: '133',
            stopName: '133',
            stopCode: '133',
            type: SEARCH_RESULT_TYPE.STOP.type,
        }];
        const mockSearchResult = [{
            stop_code: '115',
        }];
        const staticStops = { 115: {
            stop_id: '115',
            stop_name: '115',
            stop_code: '115',
            location_type: 1,
            stop_lat: '',
            stop_lon: '',
            parent_station: '',
            platform_code: '',
            route_type: '',
        } };

        store = mockStore({
            control: { disruptions: { ...INIT_STATE, affectedEntities: { affectedStops: existingEffectedStops } } },
            static: { stops: { all: staticStops } },
        });

        ccStatic.geoSearch.mockResolvedValue(mockSearchResult);
        await store.dispatch(searchByDrawing('Stops', mockShape));
        expect(store.getActions()[1]).to.deep.eql(expectedAction);
    });

    it('dispatches success actions when update disruption succeeds and returns updated disruption', async () => {
        const disruption = {
            disruptionId: 1,
            incidentNo: 1,
            createNotification: false,
        };
        disruptionsMgtApi.updateDisruption.mockResolvedValue(disruption);
        disruptionsMgtApi.getDisruptions.mockResolvedValue({
            disruptions: [disruption],
            _links: { permissions: [] },
        });

        const result = await store.dispatch(updateDisruption(disruption));

        expect(store.getActions()[0]).to.deep.eql({
            payload: {
                isRequesting: true,
                resultDisruptionId: 1,
            },
            type: 'update-control-disruption-action-requesting',
        });
        expect(store.getActions()[1]).to.deep.eql({
            payload: {
                resultCreateNotification: false,
                resultDisruptionId: 1,
                resultDisruptionVersion: undefined,
                resultMessage: 'Disruption 1 has been updated.',
                resultStatus: 'success',
            },
            type: 'update-control-disruption-action-result',
        });
        expect(store.getActions()[2]).to.deep.eql({
            payload: {
                isRequesting: false,
                resultDisruptionId: 1,
            },
            type: 'update-control-disruption-action-requesting',
        });
        expect(store.getActions()[3]).to.deep.eql({
            payload: {
                permissions: [],
            },
            type: 'update-control-disruptions-permissions',
        });
        expect(store.getActions()[4]).to.deep.eql({
            payload: {
                disruptions: [{
                    createNotification: false,
                    disruptionId: 1,
                    incidentNo: 1,
                }],
            },
            type: 'fetch-control-disruptions',
        });
        expect(store.getActions()[5]).to.deep.eql({
            payload: {
                isLoading: false,
            },
            type: 'update-control-disruptions-loading',
        });
        expect(result).to.eql(disruption);
    });

    it('dispatches save draft success actions when disruption status is draft', async () => {
        const disruption = {
            disruptionId: 1,
            incidentNo: 1,
            createNotification: false,
            status: 'draft',
        };

        disruptionsMgtApi.updateDisruption.mockResolvedValue(disruption);
        disruptionsMgtApi.getDisruptions.mockResolvedValue({
            disruptions: [disruption],
            _links: { permissions: [] },
        });

        const result = await store.dispatch(updateDisruption(disruption));

        expect(store.getActions()[0]).to.deep.eql({
            payload: {
                isRequesting: true,
                resultDisruptionId: 1,
            },
            type: 'update-control-disruption-action-requesting',
        });
        expect(store.getActions()[1]).to.deep.eql({
            payload: {
                resultCreateNotification: false,
                resultDisruptionId: 1,
                resultDisruptionVersion: undefined,
                resultMessage: 'Draft disruption number #1 saved successfully.',
                resultStatus: 'success',
            },
            type: 'update-control-disruption-action-result',
        });
        expect(store.getActions()[2]).to.deep.eql({
            payload: {
                isRequesting: false,
                resultDisruptionId: 1,
            },
            type: 'update-control-disruption-action-requesting',
        });
        expect(store.getActions()[3]).to.deep.eql({
            payload: {
                permissions: [],
            },
            type: 'update-control-disruptions-permissions',
        });
        expect(store.getActions()[4]).to.deep.eql({
            payload: {
                disruptions: [{
                    createNotification: false,
                    disruptionId: 1,
                    incidentNo: 1,
                    status: 'draft',
                }],
            },
            type: 'fetch-control-disruptions',
        });
        expect(store.getActions()[5]).to.deep.eql({
            payload: {
                isLoading: false,
            },
            type: 'update-control-disruptions-loading',
        });

        expect(store.getActions()[1]).to.deep.eql({
            payload: {
                resultCreateNotification: false,
                resultDisruptionId: 1,
                resultDisruptionVersion: undefined,
                resultMessage: 'Draft disruption number #1 saved successfully.',
                resultStatus: 'success',
            },
            type: 'update-control-disruption-action-result',
        });

        expect(result).to.eql(disruption);
    });

    it('dispatches create disruption success actions when disruption status is draft and not in copy mode', async () => {
        const disruption = {
            disruptionId: 1,
            incidentNo: 1,
            createNotification: true,
            status: 'draft',
        };

        const response = {
            disruptionId: 1,
            incidentNo: 1,
            version: 'v1',
            createNotification: false,
        };

        disruptionsMgtApi.createDisruption.mockResolvedValue(response);
        disruptionsMgtApi.getDisruptions.mockResolvedValue({
            disruptions: [disruption],
            _links: { permissions: [] },
        });

        await store.dispatch(createDisruption(disruption));

        expect(store.getActions()[0]).to.deep.eql({
            payload: {
                isRequesting: true,
                resultDisruptionId: undefined,
            },
            type: 'update-control-disruption-action-requesting',
        });

        expect(store.getActions()[1]).to.deep.eql({
            payload: {
                resultDisruptionId: 1,
                resultDisruptionVersion: 'v1',
                resultMessage: 'Disruption number #1 created successfully.',
                resultStatus: 'success',
                resultCreateNotification: false,
            },
            type: 'update-control-disruption-action-result',
        });

        expect(store.getActions()[2]).to.deep.eql({
            payload: {
                isOpen: true,
            },
            type: 'set-modal-status',
        });

        expect(store.getActions()[3]).to.deep.eql({
            payload: {
                isRequesting: false,
                resultDisruptionId: undefined,
            },
            type: 'update-control-disruption-action-requesting',
        });

        expect(store.getActions()[4]).to.deep.eql({
            payload: { affectedRoutes: [] },
            type: 'update-affected-entities',
        });

        expect(store.getActions()[5]).to.deep.eql({
            payload: {
                permissions: [],
            },
            type: 'update-control-disruptions-permissions',
        });

        expect(store.getActions()[6]).to.deep.eql({
            payload: {
                disruptions: [{
                    createNotification: true,
                    disruptionId: 1,
                    incidentNo: 1,
                    status: 'draft',
                }],
            },
            type: 'fetch-control-disruptions',
        });

        expect(store.getActions()[7]).to.deep.eql({
            payload: {
                isLoading: false,
            },
            type: 'update-control-disruptions-loading',
        });
    });

    it('dispatches error actions when update disruption fails and returns undefined', async () => {
        const disruption = {
            disruptionId: 1,
            incidentNo: 1,
            createNotification: false,
        };
        disruptionsMgtApi.updateDisruption.mockRejectedValue({ code: 'ERROR_CODE' });
        disruptionsMgtApi.getDisruptions.mockResolvedValue({
            disruptions: [disruption],
            _links: { permissions: [] },
        });

        const result = await store.dispatch(updateDisruption(disruption));

        expect(store.getActions()[0]).to.deep.eql({
            payload: {
                isRequesting: true,
                resultDisruptionId: 1,
            },
            type: 'update-control-disruption-action-requesting',
        });
        expect(store.getActions()[1]).to.deep.eql({
            payload: {
                resultCreateNotification: undefined,
                resultDisruptionId: 1,
                resultDisruptionVersion: undefined,
                resultMessage: 'Failed to update disruption 1.',
                resultStatus: 'danger',
            },
            type: 'update-control-disruption-action-result',
        });
        expect(store.getActions()[2]).to.deep.eql({
            payload: {
                isRequesting: false,
                resultDisruptionId: 1,
            },
            type: 'update-control-disruption-action-requesting',
        });
        expect(store.getActions()[3]).to.deep.eql({
            payload: {
                permissions: [],
            },
            type: 'update-control-disruptions-permissions',
        });
        expect(store.getActions()[4]).to.deep.eql({
            payload: {
                disruptions: [{
                    createNotification: false,
                    disruptionId: 1,
                    incidentNo: 1,
                }],
            },
            type: 'fetch-control-disruptions',
        });
        expect(store.getActions()[5]).to.deep.eql({
            payload: {
                isLoading: false,
            },
            type: 'update-control-disruptions-loading',
        });
        expect(result).to.eql(undefined);
    });

    it('dispatches actions when update disruption is successful with draft status', async () => {
        const disruption = {
            disruptionId: 1,
            incidentNo: 1,
            status: 'draft',
            createNotification: false,
        };

        disruptionsMgtApi.updateDisruption.mockResolvedValue({});
        disruptionsMgtApi.getDisruptions.mockResolvedValue({
            disruptions: [disruption],
            _links: { permissions: [] },
        });
        const result = await store.dispatch(updateDisruption(disruption));
        expect(store.getActions()[0]).to.deep.eql({
            payload: {
                isRequesting: true,
                resultDisruptionId: 1,
            },
            type: 'update-control-disruption-action-requesting',
        });
        expect(store.getActions()[1]).to.deep.eql({
            payload: {
                resultCreateNotification: false,
                resultDisruptionId: 1,
                resultDisruptionVersion: undefined,
                resultMessage: 'Draft disruption number #1 saved successfully.',
                resultStatus: 'success',
            },
            type: 'update-control-disruption-action-result',
        });
        expect(store.getActions()[2]).to.deep.eql({
            payload: {
                isRequesting: false,
                resultDisruptionId: 1,
            },
            type: 'update-control-disruption-action-requesting',
        });
        expect(store.getActions()[3]).to.deep.eql({
            payload: {
                permissions: [],
            },
            type: 'update-control-disruptions-permissions',
        });
        expect(store.getActions()[4]).to.deep.eql({
            payload: {
                disruptions: [{
                    createNotification: false,
                    disruptionId: 1,
                    incidentNo: 1,
                    status: 'draft',
                }],
            },
            type: 'fetch-control-disruptions',
        });
        expect(store.getActions()[5]).to.deep.eql({
            payload: {
                isLoading: false,
            },
            type: 'update-control-disruptions-loading',
        });
        expect(result).to.eql({});
    });

    it('dispatches actions when publish draft disruption is successful', async () => {
        const disruption = {
            disruptionId: 1,
            incidentNo: 1,
            status: 'in-progress',
            createNotification: false,
        };

        const response = {
            incidentNo: 1,
            version: '1.0',
            createNotification: false,
        };

        disruptionsMgtApi.updateDisruption.mockResolvedValue(response);
        disruptionsMgtApi.getDisruptions.mockResolvedValue({
            disruptions: [disruption],
            _links: { permissions: [] },
        });

        const result = await store.dispatch(publishDraftDisruption(disruption));

        expect(store.getActions()[0]).to.deep.eql({
            payload: {
                isRequesting: true,
                resultDisruptionId: 1,
            },
            type: 'update-control-disruption-action-requesting',
        });

        expect(store.getActions()[1]).to.deep.eql({
            payload: {
                resultCreateNotification: false,
                resultDisruptionId: 1,
                resultDisruptionVersion: '1.0',
                resultMessage: 'Draft disruption number #1 published successfully.',
                resultStatus: 'success',
            },
            type: 'update-control-disruption-action-result',
        });

        expect(store.getActions()[2]).to.deep.eql({
            payload: {
                isRequesting: false,
                resultDisruptionId: 1,
            },
            type: 'update-control-disruption-action-requesting',
        });

        expect(store.getActions()[3]).to.deep.eql({
            payload: {
                permissions: [],
            },
            type: 'update-control-disruptions-permissions',
        });

        expect(store.getActions()[4]).to.deep.eql({
            payload: {
                disruptions: [{
                    createNotification: false,
                    disruptionId: 1,
                    incidentNo: 1,
                    status: 'in-progress',
                }],
            },
            type: 'fetch-control-disruptions',
        });

        expect(store.getActions()[5]).to.deep.eql({
            payload: {
                isLoading: false,
            },
            type: 'update-control-disruptions-loading',
        });

        expect(result).to.eql(response);
    });

    it('dispatches actions when publish draft disruption fails', async () => {
        const disruption = {
            disruptionId: 1,
            incidentNo: 1,
            status: 'draft',
            createNotification: false,
        };

        disruptionsMgtApi.updateDisruption.mockRejectedValue({ code: 'ERROR_CODE' });
        disruptionsMgtApi.getDisruptions.mockResolvedValue({
            disruptions: [disruption],
            _links: { permissions: [] },
        });

        const result = await store.dispatch(publishDraftDisruption(disruption));

        expect(store.getActions()[0]).to.deep.eql({
            payload: {
                isRequesting: true,
                resultDisruptionId: 1,
            },
            type: 'update-control-disruption-action-requesting',
        });
        expect(store.getActions()[1]).to.deep.eql({
            payload: {
                resultCreateNotification: undefined,
                resultDisruptionId: 1,
                resultDisruptionVersion: undefined,
                resultMessage: 'Failed to publish draft disruption',
                resultStatus: 'danger',
            },
            type: 'update-control-disruption-action-result',
        });
        expect(store.getActions()[2]).to.deep.eql({
            payload: {
                isRequesting: false,
                resultDisruptionId: 1,
            },
            type: 'update-control-disruption-action-requesting',
        });
        expect(store.getActions()[3]).to.deep.eql({
            payload: {
                permissions: [],
            },
            type: 'update-control-disruptions-permissions',
        });
        expect(store.getActions()[4]).to.deep.eql({
            payload: {
                disruptions: [{
                    createNotification: false,
                    disruptionId: 1,
                    incidentNo: 1,
                    status: 'draft',
                }],
            },
            type: 'fetch-control-disruptions',
        });
        expect(store.getActions()[5]).to.deep.eql({
            payload: {
                isLoading: false,
            },
            type: 'update-control-disruptions-loading',
        });

        expect(result).to.eql(undefined);
    });

    [
        {
            title: 'should dispatch error if disruption has diversions but no endTime',
            disruption: { disruptionId: '123', endTime: null },
            diversions: [{ id: 'div1' }],
            expectedMessage: 'Disruption with diversion(s) require and End Date and Time to be published',
        },
        {
            title: 'should dispatch error if disruption has diversions and endTime is undefined',
            disruption: { disruptionId: '456' },
            diversions: [{ id: 'div2' }],
            expectedMessage: 'Disruption with diversion(s) require and End Date and Time to be published',
        },
        {
            title: 'should not dispatch error if disruption has diversions and valid endTime',
            disruption: { disruptionId: '789', endTime: '2025-10-01T12:00:00Z' },
            diversions: [{ id: 'div3' }],
            expectedMessage: null,
        },
        {
            title: 'should not dispatch error if no endTime and no diversions',
            disruption: { disruptionId: '789' },
            expectedMessage: null,
        },
        {
            title: 'should not dispatch error if no endTime and diversions is empty array',
            disruption: { disruptionId: '789' },
            diversions: [],
            expectedMessage: null,
        },

    ].forEach(({ title, disruption, diversions, expectedMessage }) => {
        it(title, async () => {
            const dispatch = sinon.spy();
            await publishDraftDisruption(disruption, diversions)(dispatch);

            expect(dispatch).to.have.been.calledWithMatch({
                type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_REQUESTING,
            });

            if (expectedMessage) {
                expect(dispatch).to.have.been.calledWithMatch({
                    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT,
                    payload: {
                        resultMessage: sinon.match(expectedMessage),
                    },
                });
            } else {
                // Should not dispatch error result action
                expect(dispatch).not.to.have.been.calledWithMatch({
                    type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT,
                    payload: {
                        resultMessage: sinon.match('Disruption with diversion(s) require and End Date and Time to be published'),
                    },
                });
            }

            expect(dispatch).to.have.been.calledWithMatch({
                type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_REQUESTING,
                payload: {
                    isRequesting: false,
                },
            });
        });
    });

    it('should dispatch PUBLISH_DRAFT_ERROR with error code and message when updateDisruption throws', async () => {
        const disruption = {
            disruptionId: 'error-test',
            endTime: '2025-09-24T12:00:00Z',
        };
        const diversions = [];

        // Mock updateDisruption to throw error with code and message
        const errorObj = { code: 'ERR_XYZ', message: 'Unit test error message' };
        disruptionsMgtApi.updateDisruption.mockRejectedValue(errorObj);
        disruptionsMgtApi.getDisruptions.mockResolvedValue({
            disruptions: [disruption],
            _links: { permissions: [] },
        });

        await store.dispatch(publishDraftDisruption(disruption, diversions));

        // Find the error action in the dispatched actions
        const errorAction = store.getActions().find(
            a => a.type === ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT,
        );

        expect(errorAction).to.deep.include({
            type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTION_ACTION_RESULT,
            payload: {
                resultDisruptionId: 'error-test',
                resultStatus: 'danger',
                resultMessage: 'Unit test error message',
                resultCreateNotification: undefined,
                resultDisruptionVersion: undefined,
            },
        });
    });
});

describe('PUBLISH_DRAFT_ERROR action', () => {
    it('should handle empty code/message with default message', () => {
        const errorAction = ACTION_RESULT.PUBLISH_DRAFT_ERROR();

        expect(errorAction).to.deep.equal({
            resultMessage: 'Failed to publish draft disruption',
            resultStatus: 'danger',
        });
    });
    it('should handle use message supplied if one exist', () => {
        const errorAction = ACTION_RESULT.PUBLISH_DRAFT_ERROR(null, 'Blah');

        expect(errorAction).to.deep.equal({
            resultMessage: 'Blah',
            resultStatus: 'danger',
        });
    });
});
