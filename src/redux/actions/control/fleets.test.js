import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import { expect } from 'chai';


import ACTION_TYPE from '../../action-types';
import * as fleets from './fleets';
import * as fleetsApi from '../../../utils/transmitters/fleets-api';

const mockStore = configureMockStore([thunk]);
let store;
let sandbox;

describe('Fleet actions', () => {
    beforeEach(() => {
        store = mockStore({});
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    it('Should dispatch fleets fetch action', async () => {
        const fakeFleetData = [
            {
                id:"10304",
                label:"NB0304",
                registration:"LFT274",
                agency: {
                    agencyId:"NZB",
                    agencyName:"NEW ZEALAND BUS",
                    depot: {
                        name:"CITY",
                    }
                },
                attributes: {
                    loweringFloor:true,
                    wheelchair:true,
                },
                capacity: {
                    seating:36,
                    standing:19,
                    total:55,
                },
                type: {
                    type:"Bus",
                    subtype:"LB-E",
                    makeModel:"ADL-E200 ELEC",
                },
                eod: {
                    generated:{},
                    activated:{},
                    beId:101,
                },
            },
        ];
        const expectedActions = [
            {
                type: ACTION_TYPE.FETCH_CONTROL_FLEETS,
                payload: {
                    fleets: fakeFleetData,
                },
            },
        ];
        const getFleets = sandbox.stub(fleetsApi, 'getFleets').resolves(fakeFleetData);
        await store.dispatch(fleets.getFleets());
        sandbox.assert.calledOnce(getFleets);
        expect(store.getActions()).to.eql(expectedActions);
    });
});
