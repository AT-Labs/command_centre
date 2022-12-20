import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import PopupContent from './PopupContent';

let wrapper;
let sandbox;

const componentPropsMock = {
    markerId: '9328_1',
    selectedKeyEvent: {
        id: '9328_1',
        type: 'Depart first stop',
    },
    currentTrip: {
        routeShortName: 'NX1',
        tripId: '1395-27001-50400-2-89c49063',
        agencyId: 'RTH',
        vehicleId: '22719',
        vehicleLabel: 'RT1365',
        vehicleEvents: [],
    },
    coordinates: [-36.72237, 174.71309],
    time: {},
    scheduledTime: {
        departure: '14:00:00',
    },
};

const setup = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    wrapper = shallow(<PopupContent { ...props } />);
};

describe('<PopupContent />', () => {
    beforeEach(() => {
        setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('Should render', () => {
        expect(wrapper.exists()).toEqual(true);
        expect(wrapper.find('div>div').at(0).text()).toEqual('Depart first stop');
        expect(wrapper.find('div>div').at(1).text()).toEqual('Scheduled departure: 14:00:00');
        expect(wrapper.find('div>div').at(2).text()).toEqual('Actual time: -');
        expect(wrapper.find('div>div').at(3).text()).toEqual('Location: lat: -36.72237, lon: 174.71309');
        expect(wrapper.find('div>div').at(4).text()).toEqual('Route: NX1');
        expect(wrapper.find('div>div').at(5).text()).toEqual('Trip ID: 1395-27001-50400-2-89c49063');
        expect(wrapper.find('div>div').at(6).text()).toEqual('Operator code: RTH');
        expect(wrapper.find('div>div').at(7).text()).toEqual('Fleet number: 22719');
        expect(wrapper.find('div>div').at(8).text()).toEqual('Vehicle label: RT1365');
    });
});
