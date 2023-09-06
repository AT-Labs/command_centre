import React from 'react';
import { expect } from 'chai';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';

import { CacheProvider } from '@emotion/react';
import configureMockStore from 'redux-mock-store';
import createCache from '@emotion/cache';

import CloseConfirmation from './CloseConfirmation';

const mockStore = configureMockStore();
const cache = createCache({ key: 'blah' });

let wrapper;

const mockProps = {
    updateEnabledAddTripModal: () => {},
    updateSelectedAddTrip: () => {},
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    const store = mockStore({});
    return mount(<CacheProvider value={ cache }><Provider store={ store }><CloseConfirmation { ...props } /></Provider></CacheProvider>);
};

describe('<CloseConfirmation />', () => {
    beforeEach(() => {
        wrapper = setup();
    });

    it('Should render', () => {
        setup();
        expect(wrapper.exists()).equal(true);
    });
});
