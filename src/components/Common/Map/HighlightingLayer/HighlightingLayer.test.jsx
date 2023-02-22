import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import L from 'leaflet';
import { isEqual } from 'lodash-es';

import { HighlightingLayer } from './HighlightingLayer';

let wrapper;
let sandbox;
let instance;

const componentPropsMock = {
    vehicleDetail: {},
    stopDetail: {},
};

const setup = (customProps) => {
    const props = componentPropsMock;
    Object.assign(props, customProps);
    wrapper = shallow(<HighlightingLayer { ...props } />);
    return wrapper;
};

describe('<HighlightingLayer />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    after(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    it('It should render the highligh over the stop', () => {
        instance = wrapper.instance();

        wrapper.setProps({
            stopDetail: {
                stop_code: '7084',
                stop_lat: -36.85275,
                stop_lon: 174.7593,
            },
        });

        const expectedPosition = new L.LatLng(-36.85275, 174.7593);

        const renderHighlightingLayer = instance.renderHiglightingLayer();

        expect(isEqual(renderHighlightingLayer, expectedPosition)).to.equal(true);
    });

    it('It should render the highligh over the vehicle', () => {
        instance = wrapper.instance();

        wrapper.setProps({
            vehiclePosition: {
                latitude: -36.84912166666667,
                longitude: 174.75817333333333,
            },
        });

        const expectedPosition = new L.LatLng(-36.84912166666667, 174.75817333333333);

        const renderHighlightingLayer = instance.renderHiglightingLayer();

        expect(isEqual(renderHighlightingLayer, expectedPosition)).to.equal(true);
    });
});
