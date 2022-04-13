import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { mount } from 'enzyme';

import ActivePeriods from './ActivePeriods';

let wrapper;

const cache = createCache({ key: 'blah' });
const withCacheProvider = children => (
    <CacheProvider value={ cache }>
        {children}
    </CacheProvider>
);

const mockProps = {
    activePeriods: [],
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);

    return mount(withCacheProvider(<ActivePeriods { ...props } />));
};

describe('<ActivePeriods />', () => {
    beforeEach(() => {
        wrapper = setup();
    });

    it('Should render', () => expect(wrapper.exists()).toEqual(true));

    describe('Check View', () => {
        it('Should have active-periods-view class container', () => {
            expect(wrapper.find('.active-periods-view').length).toEqual(1);
        });
    });
});
