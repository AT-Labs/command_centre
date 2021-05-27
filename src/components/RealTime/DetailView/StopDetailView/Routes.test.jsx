import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import _ from 'lodash-es';

import { Routes } from './Routes';

let sandbox;
let wrapper;
let instance;

const allRoutes = {
    '02209-20180910114240_v70.21': {
        route_id: '02209-20180910114240_v70.21',
        route_long_name: 'Avondale To City Centre Via New North Rd',
        route_short_name: '22A',
    },
    '02203-20180910114240_v70.21': {
        route_id: '02203-20180910114240_v70.21',
        route_long_name: 'New Lynn To City Centre Via New North Rd',
        route_short_name: '22N',
    },
    '02201-20180910114240_v70.21': {
        route_id: '02201-20180910114240_v70.21',
        route_long_name: 'Rosebank Rd To City Centre Via New North Rd',
        route_short_name: '22R',
    },
    '22307-20180910114240_v70.21': {
        route_id: '22307-20180910114240_v70.21',
        route_long_name: 'New Lynn to City Centre via New North Rd Express',
        route_short_name: '223X',
    },
    '00103-20180910114240_v70.21': {
        route_id: '00103-20180910114240_v70.21',
        route_long_name: 'Onetangi To Matiatia Wharf',
        route_short_name: '1',
    },
    '22107-20180910114240_v70.21': {
        route_id: '22107-20180910114240_v70.21',
        route_long_name: 'Rosebank Rd to City Centre via New North Rd Express',
        route_short_name: '221X',
    },
    '00104-20180910114240_v70.21': {
        route_id: '22107-20180910114240_v70.21',
        route_long_name: 'Rosebank Rd to City Centre via New North Rd Express',
        route_short_name: '221X',
    },
    '02205-20180910114240_v70.21': {
        route_id: '22107-20180910114240_v70.21',
        route_long_name: 'Onetangi To Matiatia Wharf',
        route_short_name: '1',
    },
};
const routeIds = [
    '22107-20180910114240_v70.21',
    '00103-20180910114240_v70.21',
    '02203-20180910114240_v70.21',
    '02209-20180910114240_v70.21',
    '02205-20180910114240_v70.21',
    '02201-20180910114240_v70.21',
    '00104-20180910114240_v70.21',
    '22307-20180910114240_v70.21',
];
const componentPropsMock = {
    allRoutes: {},
    routeIds: [],
};

const setup = (customProps) => {
    const props = componentPropsMock;
    Object.assign(props, customProps);
    wrapper = shallow(<Routes { ...props } />);
    instance = wrapper.instance();
    return wrapper;
};

describe('<Routes />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should return route names sorted and unique by route name', () => {
        const expectedData = [
            '1',
            '221X',
            '223X',
            '22A',
            '22N',
            '22R',
        ];

        const routeNames = instance.getRouteNames(allRoutes, routeIds);

        expect(_.isEqual(routeNames, expectedData)).to.equal(true);
    });
});
