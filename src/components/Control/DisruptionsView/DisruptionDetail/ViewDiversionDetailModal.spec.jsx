/**
 * @jest-environment jsdom
 */

import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';

import { ViewDiversionDetailModal } from './ViewDiversionDetailModal';

const mockStore = configureStore([]);

const store = mockStore({
    realtime: {
        layers: {
            fetchDiversionDetails: true,
        },
    },
});

const cache = createCache({ key: 'blah' });
const withCacheProvider = children => (
    <Provider store={ store }>
        <CacheProvider value={ cache }>
            {children}
        </CacheProvider>
    </Provider>
);

const mockDisruption = {
    disruption: {
        disruptionId: 93839,
        incidentNo: 'DISR093839',
    },
};

describe('<ViewDiversionDetailModal />', () => {
    it('Should render', () => {
        render(withCacheProvider(<ViewDiversionDetailModal { ...mockDisruption } />));
        const component = screen.getByTestId('active-diversion-detail');
        expect(component).toBeInTheDocument();
    });
});
