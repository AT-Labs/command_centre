import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import { Circle, LayerGroup } from 'react-leaflet';
import StopThresholdCircle from './StopThresholdCircle';

describe('StopThresholdCircle', () => {
    it('should render entry and outer circles for bus stops when routeType is "Bus"', () => {
        const stops = [
            {
                stopId: '1',
                stopLat: 40.123,
                stopLon: -74.567,
                entryDistance: 30,
                exitDistance: 60,
            },
        ];
        const routeType = 3;
        const hideExitCircle = false;

        const wrapper = shallow(
            <StopThresholdCircle stops={ stops } routeType={ routeType } hideExitCircle={ hideExitCircle } />,
        );

        const entryCircle = wrapper.find(Circle).at(0);
        const exitCircle = wrapper.find(Circle).at(1);
        const layerGroup = wrapper.find(LayerGroup);

        expect(entryCircle.prop('center')).to.deep.equal([40.123, -74.567]);
        expect(entryCircle.prop('radius')).to.equal(30);
        expect(entryCircle.prop('color')).to.equal('gold');
        expect(entryCircle.prop('fillOpacity')).to.equal(0.6);

        expect(exitCircle.prop('center')).to.deep.equal([40.123, -74.567]);
        expect(exitCircle.prop('radius')).to.equal(600);
        expect(exitCircle.prop('color')).to.equal('cyan');
        expect(exitCircle.prop('fillOpacity')).to.equal(0.4);
        expect(exitCircle.prop('stroke')).to.equal(false);

        expect(layerGroup.children()).to.have.lengthOf(2);
    });

    it('should render entry and exit circles for ferry stops when routeType is "Ferry"', () => {
        const stops = [
            {
                stopId: '1',
                stopLat: 40.123,
                stopLon: -74.567,
                entryDistance: 30,
                exitDistance: 60,
            },
            {
                stopId: '2',
                stopLat: 40.456,
                stopLon: -74.789,
                entryDistance: 20,
                exitDistance: 50,
            },
        ];
        const routeType = 4;
        const hideExitCircle = false;

        const wrapper = shallow(
            <StopThresholdCircle stops={ stops } routeType={ routeType } hideExitCircle={ hideExitCircle } />,
        );

        const entryCircle1 = wrapper.find(Circle).at(0);
        const exitCircle1 = wrapper.find(Circle).at(1);
        const entryCircle2 = wrapper.find(Circle).at(2);
        const exitCircle2 = wrapper.find(Circle).at(3);
        const layerGroup = wrapper.find(LayerGroup);

        expect(entryCircle1.prop('center')).to.deep.equal([40.123, -74.567]);
        expect(entryCircle1.prop('radius')).to.equal(30);
        expect(entryCircle1.prop('color')).to.equal('gold');
        expect(entryCircle1.prop('fillOpacity')).to.equal(0.6);

        expect(exitCircle1.prop('center')).to.deep.equal([40.123, -74.567]);
        expect(exitCircle1.prop('radius')).to.equal(60);
        expect(exitCircle1.prop('color')).to.equal('darksalmon');
        expect(exitCircle1.prop('fillOpacity')).to.equal(0.5);
        expect(exitCircle1.prop('stroke')).to.equal(false);

        expect(entryCircle2.prop('center')).to.deep.equal([40.456, -74.789]);
        expect(entryCircle2.prop('radius')).to.equal(20);
        expect(entryCircle2.prop('color')).to.equal('gold');
        expect(entryCircle2.prop('fillOpacity')).to.equal(0.6);

        expect(exitCircle2.prop('center')).to.deep.equal([40.456, -74.789]);
        expect(exitCircle2.prop('radius')).to.equal(50);
        expect(exitCircle2.prop('color')).to.equal('darksalmon');
        expect(exitCircle2.prop('fillOpacity')).to.equal(0.5);
        expect(exitCircle2.prop('stroke')).to.equal(false);

        expect(layerGroup.children()).to.have.lengthOf(4);
    });

    it('should render only entry circles if hideExitCircle is true', () => {
        const stops = [
            {
                stopId: '1',
                stopLat: 40.123,
                stopLon: -74.567,
                entryDistance: 30,
                exitDistance: 60,
            },
        ];
        const routeType = 3;
        const hideExitCircle = true;

        const wrapper = shallow(
            <StopThresholdCircle stops={ stops } routeType={ routeType } hideExitCircle={ hideExitCircle } />,
        );

        const entryCircle = wrapper.find(Circle).at(0);
        const layerGroup = wrapper.find(LayerGroup);

        expect(entryCircle.prop('center')).to.deep.equal([40.123, -74.567]);
        expect(entryCircle.prop('radius')).to.equal(30);
        expect(entryCircle.prop('color')).to.equal('gold');
        expect(entryCircle.prop('fillOpacity')).to.equal(0.6);

        expect(layerGroup.children()).to.have.lengthOf(1);
    });
});
