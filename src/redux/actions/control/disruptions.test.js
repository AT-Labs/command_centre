import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { updateDisruptionFilters, updateRequestingDisruptionResult, updateDisruptionsDatagridConfig } from './disruptions';
import ACTION_TYPE from '../../action-types';

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
            }
        ];

        await store.dispatch(updateDisruptionsDatagridConfig(mockDataGridConfig));
        expect(store.getActions()).to.eql(expectedActions);
    })

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
                    ...mock
                },
            },
        ];

        await store.dispatch(updateRequestingDisruptionResult(mock.resultDisruptionId, mock));
        expect(store.getActions()).to.eql(expectedActions);
    });
});
