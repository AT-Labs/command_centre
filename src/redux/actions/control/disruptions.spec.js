import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { updateDisruptionFilters, updateRequestingDisruptionResult, updateDisruptionsDatagridConfig, searchByDrawing } from './disruptions';
import ACTION_TYPE from '../../action-types';
import * as ccStatic from '../../../utils/transmitters/cc-static';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
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
}));

describe('Disruptions actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
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

    it('Search routes by drawing', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING,
                payload: { isLoading: true },
            },
            {
                type: ACTION_TYPE.UPDATE_AFFECTED_ENTITIES,
                payload: { affectedRoutes: [] },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING,
                payload: { isLoading: true },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING,
                payload: { isLoading: false },
            },
        ];
        ccStatic.geoSearch.mockResolvedValue([]);
        await store.dispatch(searchByDrawing('Routes', mockShape));
        expect(store.getActions()).to.eql(expectedActions);
    });

    it('Search stops by drawing', async () => {
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING,
                payload: { isLoading: true },
            },
            {
                type: ACTION_TYPE.UPDATE_AFFECTED_ENTITIES,
                payload: { affectedStops: [] },
            },
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DISRUPTIONS_LOADING,
                payload: { isLoading: false },
            },
        ];
        ccStatic.geoSearch.mockResolvedValue([]);
        await store.dispatch(searchByDrawing('Stops', mockShape));
        expect(store.getActions()).to.eql(expectedActions);
    });
});
