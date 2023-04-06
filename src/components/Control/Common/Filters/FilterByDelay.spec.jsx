import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import FilterByDelay from './FilterByDelay';
import tripStatusTypes from '../../../../types/trip-status-types';

const reduxSelectors = require('../../../../redux/selectors/control/routes/filters');
const reduxTripInstancesSelectors = require('../../../../redux/selectors/control/routes/trip-instances');

let sandbox;

const cache = createCache({ key: 'blah' });

const mockStore = configureMockStore([thunk]);
let store;

let delayRangeValue;
const setDelayRange = (range) => { delayRangeValue = range; };

const mockContext = {
    tripStatusFilter: 'blah',
};

const mockProps = {
    delayRange: null,
    delayRangeLimits: { MIN: -30, MAX: 30 },
};

const setup = (customState, customProps, tripStatusFilterInit, datagridConfigInit) => {
    const state = {};
    Object.assign(state, mockContext, customState);
    store = mockStore(state);

    const props = {};
    Object.assign(props, mockProps, customProps);

    if (tripStatusFilterInit) {
        sandbox.stub(reduxSelectors, 'getTripStatusFilter').returns(tripStatusFilterInit);
    }
    if (datagridConfigInit) {
        sandbox.stub(reduxTripInstancesSelectors, 'getTripsDatagridConfig').returns(datagridConfigInit);
    }

    sandbox.stub(React, 'useState').callsFake((value) => {
        delayRangeValue = value;

        return [delayRangeValue, setDelayRange];
    });

    mount(<CacheProvider value={ cache }><Provider store={ store }><FilterByDelay { ...customProps } /></Provider></CacheProvider>);
};

describe('<FilterByDelay />', () => {
    beforeEach(() => { sandbox = sinon.createSandbox(); });
    afterEach(() => {
        sandbox.restore();
        delayRangeValue = null;
    });

    describe('Status selection change impact on Delay Range Filter', () => {
        it('Will set the range to the max limits when no range is passed', () => {
            setup(null, {
                delayRangeLimits: { MIN: -25, MAX: 25 },
                delayRange: { min: null, max: null },
                onRangeChange: () => {},
            }, null, { filterModel: { items: [] } });

            expect(delayRangeValue[0]).to.equal(-25);
            expect(delayRangeValue[1]).to.equal(25);
        });

        it('Will set the range to the range that is passed ignoring the max limits', () => {
            setup(null, {
                delayRangeLimits: { MIN: -25, MAX: 25 },
                delayRange: { min: 10, max: 15 },
                onRangeChange: () => {},
            }, tripStatusTypes.inProgress, { filterModel: { items: [{ columnField: 'status', value: tripStatusTypes.inProgress }] } });

            expect(delayRangeValue[0]).to.equal(10);
            expect(delayRangeValue[1]).to.equal(15);
        });
    });
});
