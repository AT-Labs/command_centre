/* eslint-disable react/button-has-type */
/* eslint-disable react/prop-types */
import { mount } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { Map as LeafletMap } from 'react-leaflet';
import StopsLayer from './StopsLayer';
import AlertMessage from '../../../../Common/AlertMessage/AlertMessage';
import { ALERT_TYPES } from '../../../../../types/disruptions-types';

jest.mock('../../../../Common/AlertMessage/AlertMessage', () => props => (
    <div>
        { props.message.body }
    </div>
));
jest.mock('react-leaflet', () => {
    const original = jest.requireActual('react-leaflet'); // Step 2.
    return {
        ...original,
        CircleMarker: props => (<button id="testButton" onClick={ props.onClick }> test </button>),
    };
});

let wrapper;
const mockStore = configureMockStore();
let store;

const componentPropsMock = {
    stopDetail: {},
    disruptionType: 'Routes',
};

const setup = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    store = mockStore({
        control: {
            disruptions: {
                activeStep: 1,
            },
        },
        static: {
            stops: {
                all: {
                    1026: {
                        stop_id: '1-1026',
                        stop_name: '10 Portman Rd',
                        stop_code: '1026',
                        location_type: 0,
                        stop_lat: -36.85210183300703,
                        stop_lon: 174.7631907463074,
                        parent_station: '1-31496',
                        platform_code: '1026',
                        route_type: 3,
                        parent_stop_code: '31496',
                        tokens: [
                            '10',
                            'portman',
                            'rd',
                            '1026',
                        ],
                    },
                },
            },
        },
    });

    store.dispatch = jest.fn();

    return mount(
        <Provider store={ store }>
            <LeafletMap
                center={ [-36.8520950, 174.7631803] }
                zoom={ 16 }
            >
                <StopsLayer { ...props } />
            </LeafletMap>
        </Provider>,
    );
};

describe('<StopsLayer />', () => {
    it('should display alert when trying to add stop to route base disruption', () => {
        wrapper = setup();
        expect(wrapper.find(AlertMessage)).toHaveLength(0);
        wrapper.find('#testButton').simulate('click');
        expect(wrapper.find(AlertMessage)).toHaveLength(1);
        expect(wrapper.find(AlertMessage).contains(ALERT_TYPES.STOP_SELECTION_DISABLED_ERROR().body)).toEqual(true);
    });

    it('should not display alert when trying to add stop to stop base disruption', () => {
        wrapper = setup({ disruptionType: 'Stops' });
        expect(wrapper.find(AlertMessage)).toHaveLength(0);
        wrapper.find('#testButton').simulate('click');
        expect(wrapper.find(AlertMessage)).toHaveLength(0);
    });

    it('should add stop entity with correct type', () => {
        wrapper = setup({ disruptionType: 'Stops' });
        expect(wrapper.find(AlertMessage)).toHaveLength(0);
        wrapper.find('#testButton').simulate('click');
        expect(wrapper.find(AlertMessage)).toHaveLength(0);
        wrapper.update();

        const expectedAffectedStopEntity = [{
            stopId: '1-1026',
            stopName: '10 Portman Rd',
            stopCode: '1026',
            locationType: 0,
            stopLat: -36.85210183300703,
            stopLon: 174.7631907463074,
            parentStation: '1-31496',
            platformCode: '1026',
            routeType: 3,
            parentStopCode: '31496',
            tokens: ['10', 'portman', 'rd', '1026'],
            valueKey: 'stopCode',
            labelKey: 'stopCode',
            type: 'stop',
        }];

        expect(store.dispatch.mock.calls[0][0].type).toEqual('update-affected-entities');
        expect(store.dispatch.mock.calls[0][0].payload.affectedStops).toEqual(expectedAffectedStopEntity);
    });
});
