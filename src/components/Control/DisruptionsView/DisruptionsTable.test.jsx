import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import DisruptionsTable from './DisruptionsTable';

const mockStore = configureMockStore([thunk]);
let wrapper;
let sandbox;

const defaultDisruption = {
    disruptionId: 752,
    incidentNo: 'DISR00752',
    mode: 'Train',
    affectedEntities: [],
    impact: 'REDUCED_SERVICE',
    cause: 'TECHNICAL_PROBLEM',
    startTime: '2022-01-11T01:26:00.000Z',
    endTime: '2022-01-11T02:01:00.000Z',
    status: 'resolved',
    lastUpdatedTime: '2022-01-11T02:01:03.555Z',
    description: 'test',
    createdTime: '2022-01-11T01:26:46.605Z',
};

const componentPropsMock = {
    disruptions: [defaultDisruption],
    updateActiveDisruptionId: () => { },
};

const setup = (customProps) => {
    const props = {};
    Object.assign(props, componentPropsMock, customProps);    
    const store = mockStore({});
    
    wrapper = shallow(<DisruptionsTable store={store} { ...props } />).childAt(0).dive();
};

describe('<DisruptionsTable />', () => {
    beforeEach(() => { sandbox = sinon.createSandbox(); });
    afterEach(() => { sandbox.restore(); });

    it('Should distinct routes and stops if there are duplicated', () => {
        setup({ disruptions: [{
            ...defaultDisruption,
            affectedEntities: [
                { stopId: '9001-3be05f0c', stopCode: '9001', locationType: 0, routeType: 2, type: 'stop', routeId: 'EAST-201', routeShortName: 'EAST' },
                { stopId: '9001-3be05f0c', stopCode: '9001', locationType: 0, routeType: 2, type: 'stop', routeId: 'STH-201', routeShortName: 'STH' },
                { stopId: '9001-3be05f0c', stopCode: '9001', locationType: 0, routeType: 2, type: 'stop', routeId: 'WEST-201', routeShortName: 'WEST' },
                { stopId: '9002-8ff96893', stopCode: '9002', locationType: 0, routeType: 2, type: 'stop', routeId: 'ONE-201', routeShortName: 'ONE' },
                { stopId: '9002-8ff96893', stopCode: '9002', locationType: 0, routeType: 2, type: 'stop', routeId: 'STH-201', routeShortName: 'STH' },
                { stopId: '9002-8ff96893', stopCode: '9002', locationType: 0, routeType: 2, type: 'stop', routeId: 'WEST-201', routeShortName: 'WEST' },
            ],
        }] });
        expect(wrapper.html()).to.contain('>EAST, STH, WEST, ONE<');
        expect(wrapper.html()).to.contain('>9001, 9002<');
    });
});
