import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { updateDisruptionFilters } from './disruptions';
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
});
