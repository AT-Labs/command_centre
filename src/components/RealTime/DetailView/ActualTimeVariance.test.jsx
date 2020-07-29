import { expect } from 'chai';
import { shallow } from 'enzyme';
import moment from 'moment/moment';
import React from 'react';
import sinon from 'sinon';
import ActualTimeVariance from './ActualTimeVariance';


let sandbox;
let wrapper;

const skippedStop = {
    scheduledTime: '2019-08-13T05:16:00.000Z',
    actualTime: '2019-08-13T05:17:08.000Z',
    stop:
        { arrival:
                { time: '1565653380',
                    delay: 0,
                    type: 'SCHEDULED' },
        departure: null,
        stopName: 'Manukau Train Station 1',
        stopCode: '9507',
        stopSequence: 11,
        scheduleRelationship: 'SKIPPED',
        pickupType: 1,
        dropOffType: 0,
        parentStation: { stopCode: '9218', stopName: 'Manukau' } },
    trip: { startTime: '11:06:00',
        routeShortName: 'EAST',
        destinationDisplay: 'Manukau',
        headsign: 'Brit 3 To Manukau 1 Via Panmure',
        tripId: '246-850004-39960-2-4247110-dLTOU',
        routeId: '246-201',
        routeType: 2,
        shapeId: '246-850004',
        __oldTripId: '50051144211-20190719095551_v82.14',
        __oldRouteId: '850004-20190719095551_v82.14',
        __oldShapeId: '1093-20190719095551_v82.14',
    },
};

const canceledStop = {
    scheduledTime: '2019-08-13T05:16:00.000Z',
    actualTime: '2019-08-13T05:17:08.000Z',
    stop:
        { arrival:
                { time: '1565653380',
                    delay: 0,
                    type: 'SCHEDULED' },
        departure: null,
        stopName: 'Manukau Train Station 1',
        stopCode: '9507',
        stopSequence: 11,
        pickupType: 1,
        dropOffType: 0,
        scheduleRelationship: 'SCHEDULED',
        parentStation: { stopCode: '9218', stopName: 'Manukau' } },
    trip: { startTime: '11:06:00',
        routeShortName: 'EAST',
        destinationDisplay: 'Manukau',
        headsign: 'Brit 3 To Manukau 1 Via Panmure',
        tripId: '246-850004-39960-2-4247110-dLTOU',
        routeId: '246-201',
        routeType: 2,
        shapeId: '246-850004',
        __oldTripId: '50051144211-20190719095551_v82.14',
        __oldRouteId: '850004-20190719095551_v82.14',
        __oldShapeId: '1093-20190719095551_v82.14',
        scheduleRelationship: 'CANCELED' },
};

const normalStop = {
    scheduledTime: '2019-08-13T05:16:00.000Z',
    actualTime: '2019-08-13T05:17:08.000Z',
    stop:
        { arrival:
                { time: '1565653380',
                    delay: 0,
                    type: 'SCHEDULED' },
        departure: null,
        stopName: 'Manukau Train Station 1',
        stopCode: '9507',
        scheduleRelationship: 'SCHEDULED',
        stopSequence: 11,
        pickupType: 1,
        dropOffType: 0,
        parentStation: { stopCode: '9218', stopName: 'Manukau' } },
    trip: { startTime: '11:06:00',
        routeShortName: 'EAST',
        destinationDisplay: 'Manukau',
        headsign: 'Brit 3 To Manukau 1 Via Panmure',
        tripId: '246-850004-39960-2-4247110-dLTOU',
        routeId: '246-201',
        routeType: 2,
        shapeId: '246-850004',
        __oldTripId: '50051144211-20190719095551_v82.14',
        __oldRouteId: '850004-20190719095551_v82.14',
        __oldShapeId: '1093-20190719095551_v82.14',
        scheduleRelationship: 'SCHEDULED' },
};

const componentPropsMock = {
    scheduledTime: '',
    actualTime: '',
    trip: {},
    stop: {},
};

const setup = (customProps) => {
    const props = componentPropsMock;
    Object.assign(props, customProps);
    wrapper = shallow(<ActualTimeVariance { ...props } />);
    return wrapper;
};

describe('<ActualTimeVariance />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should display skipped', () => {
        wrapper = setup(skippedStop);
        expect(wrapper.find('.my-0').contains('Skipped')).to.be.true;
    });

    it('Should display canceled', () => {
        wrapper = setup(canceledStop);
        expect(wrapper.find('.my-0').contains('C')).to.be.true;
    });

    it('Should display a time', () => {
        wrapper = setup(normalStop);

        const time = moment(normalStop.actualTime, moment.ISO_8601).format('HH:mm');

        expect(wrapper.find('.my-0').text()).to.equal(time);
    });
});
