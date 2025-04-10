import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { mount } from 'enzyme';
import '@testing-library/jest-dom';

import { ViewDiversionDetailModal } from './ViewDiversionDetailModal';

let wrapper;

const cache = createCache({ key: 'blah' });
const withCacheProvider = children => (
    <CacheProvider value={ cache }>
        {children}
    </CacheProvider>
);

const mockDisruption = {
    disruption: {
        disruptionId: 93839,
        incidentNo: 'DISR093839',
    },
};

const setup = (customProps = {}) => {
    const props = { ...mockDisruption, ...customProps };
    return mount(withCacheProvider(<ViewDiversionDetailModal { ...props } />));
};

describe('<ViewDiversionDetailModal />', () => {
    beforeEach(() => {
        wrapper = setup();
    });

    it('Should render', () => {
        expect(wrapper.exists()).toEqual(true);
    });

    describe('Check ViewDiversionDetailModal View', () => {
        it('Should have active-diversion-detail class container', () => {
            expect(wrapper.find('.active-diversion-detail').length).toEqual(1);
        });
    });
});
