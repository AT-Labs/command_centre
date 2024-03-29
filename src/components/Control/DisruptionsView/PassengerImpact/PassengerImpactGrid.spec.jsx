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
    disruptionData: {
        affectedEntities: [
            {
                routeId: 'STH-201',
                routeType: 2,
                routeShortName: 'STH',
                agencyName: 'AT Metro',
                agencyId: 'AM',
                text: 'STH',
                icon: 'Train',
                valueKey: 'routeId',
                labelKey: 'routeShortName',
                type: 'route',
                routeColor: '97C93D',
            },
            {
                stopId: '115-96c3c7be',
                stopName: 'Newmarket Train Station',
                stopCode: '115',
                locationType: 1,
                stopLat: -36.86972,
                stopLon: 174.77883,
                parentStation: null,
                platformCode: null,
                routeType: 2,
                text: '115 - Newmarket Train Station',
                icon: 'stop',
                valueKey: 'stopCode',
                labelKey: 'stopCode',
                type: 'stop',
            },
        ],
    },
    onUpdatePassengerImpactState: jest.fn(),
    onUpdatePassengerImpactData: jest.fn(),
    childStops: {},
};

cache = createCache({ key: 'blah' });

const setup = async (customProps) => {
    let props = mockProps;
    props = Object.assign(props, customProps);

    store = mockStore({});
    let component;
    await act(() => {
        component = mount(<CacheProvider value={ cache }><Provider store={ store }><PassengerImpactGrid { ...props } /></Provider></CacheProvider>);
    });
    return component;
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
            id: '115',
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
        }, {
            id: '106-202__1009',
            path: ['106-202', '1009'],
            stopCode: '1009',
            monday: 'n/a',
            tuesday: 'n/a',
            wednesday: 'n/a',
            thursday: 'n/a',
            friday: 'n/a',
            saturday: 'n/a',
            sunday: 'n/a',
            stopName: 'Stop not available',
        }];
        jest.spyOn(passengerImpactUtil, 'fetchAndProcessPassengerImpactData').mockResolvedValueOnce({ grid: gridData, total: 7 });
        wrapper = await setup();

        await waitForComponentToRender(wrapper);

        expect(wrapper.exists()).toEqual(true);
        expect(wrapper.find(DataGridPro).exists()).toEqual(true);
    });
});
