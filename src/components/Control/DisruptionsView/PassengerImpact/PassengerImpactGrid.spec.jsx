import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { DataGridPro } from '@mui/x-data-grid-pro';
import * as passengerImpactUtil from '../../../../utils/control/disruption-passenger-impact';
import PassengerImpactGrid from './PassengerImpactGrid';

const mockStore = configureMockStore();

let wrapper;
let store;
let cache;

const mockProps = {
    affectedStops: [],
    affectedRoutes: [],
    allRoutes: {},
    allStops: {},
    disruptionData: {},
    onUpdatePassengerImpactState: jest.fn(),
    onUpdatePassengerImpactData: jest.fn(),
    childStops: {},
};

cache = createCache({ key: 'blah' });

const setup = (customProps) => {
    let props = mockProps;
    props = Object.assign(props, customProps);

    store = mockStore({});
    return mount(<CacheProvider value={ cache }><Provider store={ store }><PassengerImpactGrid { ...props } /></Provider></CacheProvider>);
};

const waitForComponentToRender = async (domWrapper) => {
    await act(async () => {
        // eslint-disable-next-line no-promise-executor-return
        await new Promise(resolve => setTimeout(resolve));
        domWrapper.update();
    });
};

describe('<PassengerImpactGrid />', () => {
    beforeEach(() => {
    });
    afterEach(() => {
        cache = null;
        jest.clearAllMocks();
    });

    it('Render: should display the grid', async () => {
        const gridData = [{
            id: 'STH-201',
            path: ['STH-201'],
            routeId: 'STH-201',
            routeShortName: 'STH-201',
            monday: 1,
            tuesday: 1,
            wednesday: 1,
            thursday: 1,
            friday: 1,
            saturday: 1,
            sunday: 1,
        }, {
            id: 'STH-201_115',
            path: ['STH-201', '115'],
            parentStopCode: '115',
            parentStopName: 'Newmarket Train Station',
            monday: 1,
            tuesday: 1,
            wednesday: 1,
            thursday: 1,
            friday: 1,
            saturday: 1,
            sunday: 1,
        }, {
            id: 'STH-201_115_9100',
            path: ['STH-201', '115', '9100'],
            stopCode: '9100',
            stopName: 'Newmarket Train Station 1',
            monday: 1,
            tuesday: 1,
            wednesday: 1,
            thursday: 1,
            friday: 1,
            saturday: 1,
            sunday: 1,
        }];
        jest.spyOn(passengerImpactUtil, 'fetchAndProcessPassengerImpactData').mockResolvedValueOnce({ grid: gridData, total: 7 });
        wrapper = setup();

        await waitForComponentToRender(wrapper);

        expect(wrapper.exists()).toEqual(true);
        expect(wrapper.find(DataGridPro).exists()).toEqual(true);
    });
});
