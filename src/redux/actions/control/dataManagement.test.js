import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import { updateDataManagementPageSettings } from './dataManagement';
import ACTION_TYPE from '../../action-types';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;

describe('Data Management actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('updates page settings', async () => {
        const mockSettings = {
            selectedIndex: 1,
            drawerOpen: true,
        };
        const expectedActions = [
            {
                type: ACTION_TYPE.UPDATE_CONTROL_DATAMANAGEMENT_PAGESETTINGS,
                payload: {
                    ...mockSettings,
                },
            },
        ];

        await store.dispatch(updateDataManagementPageSettings(mockSettings));
        expect(store.getActions()).to.eql(expectedActions);
    });
});
