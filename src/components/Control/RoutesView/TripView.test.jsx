import React from 'react';
import { flatten, find, isEmpty } from 'lodash-es';
import moment from 'moment';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { TripView } from './TripView';
import { useTripOperationNotes } from '../../../redux/selectors/appSettings';

const busTrip = {
    tripId: 'test1',
    routeVariantId: 'test2',
    routeShortName: 'test3',
    routeLongName: 'test4',
    routeType: 3,
    agencyId: 'NZB',
    referenceId: 'test5',
    serviceId: 'test11',
};
const trainTrip = {
    tripId: 'test6',
    routeVariantId: 'test7',
    routeShortName: 'test8',
    routeLongName: 'test9',
    routeType: 2,
    agencyId: 'NZB',
    referenceId: 'test10',
    serviceId: 'test12',
    blockId: '123',
};

const blocks = [
    {
        operationalBlockId: '123',
        operationalTrips: [
            {
                tripId: 'test6',
            },
        ],
    },
];

let wrapper;
let sandbox;
const componentPropsMock = {
    isControlBlockViewPermitted: true,
    tripInstance: busTrip,
    actionResults: [],
    agencies: [],
    actionLoadingStatesByTripId: {},
    updateTripInstanceStatus: () => {},
    clearTripInstanceActionResult: () => {},
    updateTripInstanceDelay: () => {},
    goToBlocksView: () => {},
    serviceDate: moment().format(),
    vehicleAllocations: {},
    blocks,
};
const setup = (customProps) => {
    const props = {};
    Object.assign(props, componentPropsMock, customProps);
    return shallow(<TripView { ...props } />);
};

describe('<TripView />', () => {
    beforeEach(() => { sandbox = sinon.createSandbox(); });
    afterEach(() => { sandbox.restore(); });

    describe('Trip Details Data', () => {
        context('When trip is TRAIN', () => {
            it('Should contain External Ref ID info', () => {
                wrapper = setup({ tripInstance: trainTrip });
                const result = flatten(wrapper.instance().getTripDetailsData(trainTrip));
                expect(find(result, { value: 'test10' })).to.not.be.undefined; // eslint-disable-line
            });

            it('Should contain Block ID', () => {
                wrapper = setup({ tripInstance: trainTrip });
                const result = flatten(wrapper.instance().getTripDetailsData(trainTrip));
                expect(find(result, { value: '123' })).to.not.be.undefined; // eslint-disable-line
            });
        });

        context('When trip is NOT TRAIN', () => {
            it('Should not contain External Ref ID info', () => {
                wrapper = setup({ tripInstance: busTrip });
                const result = flatten(wrapper.instance().getTripDetailsData(busTrip));
                expect(find(result, { value: 'test5' })).to.be.undefined;  // eslint-disable-line
            });

            it('Should not contain Block ID', () => {
                wrapper = setup({ tripInstance: busTrip });
                const result = flatten(wrapper.instance().getTripDetailsData(busTrip));
                expect(find(result, { value: '123' })).to.be.undefined;  // eslint-disable-line
            });
        });
    });

    describe('Button Bar', () => {
        context('When trip is TRAIN', () => {
            const trip = trainTrip;
            beforeEach(() => {
                wrapper = setup({ tripInstance: trip });
            });

            it('should contain View in Blocks button', () => {
                const result = wrapper.instance().getButtonBarConfig(trip);
                expect(find(result, { label: 'View in Blocks' })).to.not.be.undefined; // eslint-disable-line
            });
        });

        context('When trip is NOT TRAIN', () => {
            const trip = busTrip;
            beforeEach(() => {
                wrapper = setup({ tripInstance: trip });
            });

            it('should not contain View in Blocks button', () => {
                const result = wrapper.instance().getButtonBarConfig(trip);
                expect(find(result, { label: 'View in Blocks' })).to.be.undefined;  // eslint-disable-line
            });
        });

        context('When trip is NOT STARTED', () => {
            const trip = { ...trainTrip, status: 'NOT_STARTED', _links: { permissions: [{ _rel: 'cancel' }, { _rel: 'delay' }, { _rel: 'advancer' }] } };
            let result;
            beforeEach(() => {
                wrapper = setup({ tripInstance: trip, useHoldTrip: true });
                result = wrapper.instance().getButtonBarConfig(trip);
            });

            it('should contain Cancel trip button', () => {
                expect(find(result, { label: 'Cancel trip' })).to.not.be.undefined;  // eslint-disable-line
            });
            it('should contain Set trip delay button', () => {
                expect(find(result, { label: 'Set trip delay' })).to.not.be.undefined;  // eslint-disable-line
            });
            it('should contain Move to next stop button', () => {
                expect(find(result, { label: 'Move to next stop' })).to.not.be.undefined;  // eslint-disable-line
            });

            it('should contain Hold button', () => {
                expect(find(result, { label: 'Hold trip' })).to.not.be.undefined;  // eslint-disable-line
            });
        });

        context('When it is a bus trip, Hold trip button is not defined', () => {
            const trip = { ...busTrip, status: 'NOT_STARTED', _links: { permissions: [{ _rel: 'cancel' }, { _rel: 'delay' }, { _rel: 'advancer' }] } };
            let result;
            beforeEach(() => {
                wrapper = setup({ tripInstance: trip, useHoldTrip: true });
                result = wrapper.instance().getButtonBarConfig(trip);
            });

            it('should not contain Hold button', () => {
                expect(find(result, { label: 'Hold trip' })).to.be.undefined;  // eslint-disable-line
            });
        });

        context('When trip is NOT STARTED and user dont have persmission for the action', () => {
            const trip = { ...busTrip, status: 'NOT_STARTED', _links: { permissions: [{ _rel: 'delay' }, { _rel: 'advancer' }] } };
            let result;
            beforeEach(() => {
                wrapper = setup({ tripInstance: trip, useHoldTrip: true });
                result = wrapper.instance().getButtonBarConfig(trip);
            });

            it('should not contain Cancel trip button', () => {
                expect(find(result, { label: 'Cancel trip' })).to.be.undefined;
            });

            it('should not contain Hold button', () => {
                expect(find(result, { label: 'Hold trip' })).to.be.undefined;
            });
        });

        context('When trip is IN PROGRESS', () => {
            const trip = { ...busTrip, status: 'IN_PROGRESS', _links: { permissions: [{ _rel: 'cancel' }, { _rel: 'delay' }, { _rel: 'advancer' }] } };
            let result;
            beforeEach(() => {
                wrapper = setup({ tripInstance: trip });
                result = wrapper.instance().getButtonBarConfig(trip);
            });

            it('should contain Cancel trip button', () => {
                expect(find(result, { label: 'Cancel trip' })).to.not.be.undefined;  // eslint-disable-line
            });
            it('should contain Set trip delay button', () => {
                expect(find(result, { label: 'Set trip delay' })).to.not.be.undefined;  // eslint-disable-line
            });
            it('should not contain Reinstate trip button', () => {
                expect(find(result, { label: 'Reinstate trip' })).to.be.undefined;  // eslint-disable-line
            });
            it('should contain Move to next stop button', () => {
                expect(find(result, { label: 'Move to next stop' })).to.not.be.undefined;  // eslint-disable-line
            });
        });

        context('When trip is COMPLETED', () => {
            const trip = { ...busTrip, status: 'COMPLETED', _links: { permissions: [{ _rel: 'cancel' }, { _rel: 'delay' }, { _rel: 'advancer' }] } };
            let result;
            beforeEach(() => {
                wrapper = setup({ tripInstance: trip, useHoldTrip: true });
                result = wrapper.instance().getButtonBarConfig(trip);
            });

            it('should not contain Cancel trip button', () => {
                expect(find(result, { label: 'Cancel trip' })).to.be.undefined;  // eslint-disable-line
            });
            it('should not contain Set trip delay button', () => {
                expect(find(result, { label: 'Set trip delay' })).to.be.undefined;  // eslint-disable-line
            });
            it('should not contain Move to next stop button', () => {
                expect(find(result, { label: 'Move to next stop' })).to.be.undefined;  // eslint-disable-line
            });
            it('should not contain Hold button', () => {
                expect(find(result, { label: 'Hold trip' })).to.be.undefined;  // eslint-disable-line
            });
        });

        context('When trip is CANCELLED', () => {
            const trip = { ...busTrip, status: 'CANCELLED', _links: { permissions: [{ _rel: 'cancel' }, { _rel: 'delay' }, { _rel: 'advancer' }] } };
            let result;
            beforeEach(() => {
                wrapper = setup({ tripInstance: trip });
                result = wrapper.instance().getButtonBarConfig(trip);
            });

            it('should not contain Cancel trip button', () => {
                expect(find(result, { label: 'Cancel trip' })).to.be.undefined;  // eslint-disable-line
            });
            it('should not contain Set trip delay button', () => {
                expect(find(result, { label: 'Set trip delay' })).to.be.undefined;  // eslint-disable-line
            });
            it('should contain reinstate trip button', () => {
                expect(find(result, { label: 'Reinstate trip' })).to.not.be.undefined;  // eslint-disable-line
            });
            it('should not contain Move to next stop button', () => {
                expect(find(result, { label: 'Move to next stop' })).to.be.undefined;  // eslint-disable-line
            });
        });

        context('When serviceDate is YESTERDAY', () => {
            const trip = { ...busTrip, status: 'NOT_STARTED', _links: { permissions: [{ _rel: 'cancel' }, { _rel: 'delay' }] } };
            let result;
            beforeEach(() => {
                wrapper = setup({ tripInstance: trip, serviceDate: moment().subtract(1, 'days').format() });
                result = wrapper.instance().getButtonBarConfig(trip);
            });

            it('should contain some buttons', () => {
                expect(isEmpty(result)).to.be.false;  // eslint-disable-line
            });
        });

        context('When serviceDate is TODAY', () => {
            const trip = { ...busTrip, status: 'NOT_STARTED', _links: { permissions: [{ _rel: 'cancel' }, { _rel: 'delay' }] } };
            let result;
            beforeEach(() => {
                wrapper = setup({ tripInstance: trip, serviceDate: moment().format() });
                result = wrapper.instance().getButtonBarConfig(trip);
            });

            it('should contain some buttons', () => {
                expect(isEmpty(result)).to.be.false;  // eslint-disable-line
            });
        });

        context('When serviceDate is TOMORROW', () => {
            const trip = { ...trainTrip, status: 'NOT_STARTED', _links: { permissions: [{ _rel: 'cancel' }, { _rel: 'delay' }, { _rel: 'advancer' }] } };
            let result;
            beforeEach(() => {
                wrapper = setup({ tripInstance: trip, serviceDate: moment().add(1, 'days').format(), useHoldTrip: true });
                result = wrapper.instance().getButtonBarConfig(trip);
            });

            it('should contain some buttons', () => {
                expect(isEmpty(result)).to.be.false;  // eslint-disable-line
            });
            it('should not contain Set trip delay button', () => {
                expect(find(result, { label: 'Set trip delay' })).to.be.undefined;  // eslint-disable-line
            });
            it('should not contain Move to next stop button', () => {
                expect(find(result, { label: 'Move to next stop' })).to.be.undefined;  // eslint-disable-line
            });
            it('should not contain View in Blocks button', () => {
                expect(find(result, { label: 'View in Blocks' })).to.be.undefined;  // eslint-disable-line
            });

            it('should not contain onHold button', () => {
                expect(find(result, { label: 'Hold trip' })).to.be.undefined;  // eslint-disable-line
            });
        });

        context('When serviceDate is after TOMORROW', () => {
            const trip = { ...busTrip, status: 'NOT_STARTED', _links: { permissions: [{ _rel: 'cancel' }, { _rel: 'delay' }] } };
            let result;
            beforeEach(() => {
                wrapper = setup({ tripInstance: trip, serviceDate: moment().add(2, 'days').format() });
                result = wrapper.instance().getButtonBarConfig(trip);
            });

            it('should be empty', () => {
                expect(isEmpty(result)).to.be.true;  // eslint-disable-line
            });
        });

        context("Check add operation notes button for all mode", () => {
            const trip = {
                ...busTrip,
                status: "NOT_STARTED",
                _links: {
                    permissions: [{ _rel: "cancel" }, { _rel: "delay" }, { _rel: "operation_notes" }],
                },
                operationNotes: "this is a fake operation notes for test",
            };
            let result;
            beforeEach(() => {
                wrapper = setup({
                    tripInstance: trip,
                    serviceDate: moment().format(),
                    useTripOperationNotes: true,
                });
                result = wrapper.instance().getButtonBarConfig(trip);
            });

            it("should contain some buttons", () => {
                expect(isEmpty(result)).to.be.false;
            });

            it("should contain add operation notes button", () => {
                expect(find(result, { label: "Operation notes" })).to.not.be
                    .undefined;
            });
        });
    });
});
