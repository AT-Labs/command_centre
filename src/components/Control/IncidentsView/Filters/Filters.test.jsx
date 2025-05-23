import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import Filters from './Filters';
import { INIT_STATE } from '../../../../redux/reducers/control/disruptions';

let wrapper;

const mockStore = configureMockStore([thunk]);
let store;

const setup = (customState) => {
    const state = {};
    Object.assign(state, INIT_STATE, customState);
    store = mockStore({
        'control.disruptions': state,
    });
 
    wrapper = shallow(<Filters store={store} />).childAt(0).dive();
    return wrapper;
};

describe('<Filters />', () => {
    beforeEach(() => { wrapper = setup(); });

    it('should render', () => expect(wrapper.exists()).to.equal(true));
});
