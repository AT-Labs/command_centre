import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { keyBy } from 'lodash-es';
import { StopGroupsMultiSelect } from './StopGroupsMultiSelect';

let wrapper;
let sandbox;

const defaultState = {
    stopGroups: [],
    affectedStops: [],
    setExpandedGroups: jest.fn(),
};

const stopGroups = keyBy([{
    id: 1,
    title: 'Stop Group 1',
    stops: [{
        stopId: '1381',
        value: 'test',
    }],
}], group => group.id);

const stopsFromStopGroup = [
    {
        stopId: '333-fd1c9e8c',
        stopName: 'Test Stop 3',
        stopCode: '333',
        locationType: 0,
        stopLat: -36.94659,
        stopLon: 174.83358,
        parentStation: null,
        platformCode: null,
        routeType: null,
        text: '333 - Test Stop 3',
        icon: 'stop',
        valueKey: 'stopId',
        labelKey: 'stopCode',
        type: 'stop',
        groupId: 1,
    }, {
        stopId: '444-fd1c9e8c',
        stopName: 'Test Stop 4',
        stopCode: '444',
        locationType: 0,
        stopLat: -36.94659,
        stopLon: 174.83358,
        parentStation: null,
        platformCode: null,
        routeType: null,
        text: '444 - Test Stop 4',
        icon: 'stop',
        valueKey: 'stopId',
        labelKey: 'stopCode',
        type: 'stop',
        groupId: 1,
    }];

function setup(customProps) {
    const props = { ...defaultState };

    Object.assign(props, customProps);

    wrapper = shallow(<StopGroupsMultiSelect { ...props } />);
}

describe('<StopGroupsMultiSelect />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
        wrapper = null;
        jest.resetAllMocks();
    });

    describe('initial load', () => {
        it('Should not render when empty affected stops', () => {
            setup();
            expect(wrapper.exists()).toEqual(false);
        });

        it('Should render when there are affected stops', () => {
            setup({
                affectedStops: stopsFromStopGroup,
                stopGroups,
            });
            expect(wrapper.exists()).toEqual(true);
        });
    });
});
