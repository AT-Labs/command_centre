import React from 'react';
import moment from 'moment';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { Stop } from './Stop';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

const trip = {
    tripId: 'test1',
    routeVariantId: 'test2',
    routeShortName: 'test3',
    routeLongName: 'test4',
    routeType: 3,
    agencyId: 'NZB',
    referenceId: 'test5',
    serviceId: 'test6',
};
const stop = {
    stopId: 'test7',
    stopSequence: 1,
    stopCode: '1111',
    stopName: 'test8',
    arrivalTime: '00:00:00',
    departureTime: '11:11:11',
    scheduledArrivalTime: '00:00:00',
    scheduledDepartureTime: '11:11:11',
    status: 'NOT_PASSED',
    parent: 'test9',
};
const platforms = {
    test9: {
        children: [
            { stop_id: 'test7' },
            { stop_id: 'test10' },
        ],
    },
};
let wrapper;
let sandbox;
const componentPropsMock = {
    tripInstance: trip,
    stop,
    isCurrent: false,
    serviceDate: moment().format(),
    platforms,
    selectedStopsByTripKey: () => {},
    updateTripInstanceStopStatus: () => {},
    updateTripInstanceStopPlatform: () => {},
};
const setup = (customProps) => {
    const props = {};
    Object.assign(props, componentPropsMock, customProps);
    return shallow(<Stop { ...props } />);
};

describe('<Stop />', () => {
    beforeEach(() => { sandbox = sinon.createSandbox(); });
    afterEach(() => { sandbox.restore(); });

    describe('isStopMutationPossible', () => {
        it('allows mutations when stop is not passed or skipped, trip is not started and it is today', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isStopMutationPossible()).to.be.true; // eslint-disable-line
        });

        it('allows mutations when trip is in progress', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'IN_PROGRESS' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isStopMutationPossible()).to.be.true; // eslint-disable-line
        });

        it('allows mutations when trip is missed', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'MISSED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isStopMutationPossible()).to.be.true; // eslint-disable-line
        });

        it('does not allow mutations when trip is cancelled', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'CANCELLED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isStopMutationPossible()).to.be.false; // eslint-disable-line
        });

        it('does not allow mutations when trip is completed', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'COMPLETED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isStopMutationPossible()).to.be.false; // eslint-disable-line
        });

        it('does allow mutations when stop is skipped', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'SKIPPED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isStopMutationPossible()).to.be.true; // eslint-disable-line
        });

        it('does allow mutations when stop is passed (change plattform is allowed)', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'PASSED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isStopMutationPossible()).to.be.true; // eslint-disable-line
        });

        it('does not allow mutations after tomorrow', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().add(2, 'days').format(),
            });
            expect(wrapper.instance().isStopMutationPossible()).to.be.false; // eslint-disable-line
        });

        it('does not allows mutations when it is yesterday', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().subtract(1, 'days').format(),
            });
            expect(wrapper.instance().isStopMutationPossible()).to.be.false; // eslint-disable-line
        });

        it('does not allows mutations when it is yesterday, except overnight trips', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED', endTime: '24:00:01' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().subtract(1, 'days').format(),
            });
            expect(wrapper.instance().isStopMutationPossible()).to.be.true; // eslint-disable-line
        });
    });

    describe('isSkipStopDisabled', () => {
        it('disables stop cancel when stop mutations are not allowed', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'PASSED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isSkipStopDisabled()).to.be.true; // eslint-disable-line
        });

        it('enables stop cancel when stop mutations are allowed', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'NOT_PASSED', _links: { permissions: [{ _rel: 'skip' }, { _rel: 'change' }] } },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isStopMutationPossible()).to.be.true; // eslint-disable-line
            expect(wrapper.instance().isSkipStopDisabled()).to.be.false; // eslint-disable-line
        });
    });

    describe('isReinstateStopDisabled', () => {
        it('does allow to reinstate stop when stop is skipped', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'SKIPPED', _links: { permissions: [{ _rel: 'skip' }] } },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isReinstateStopDisabled()).to.be.false; // eslint-disable-line
        });

        it('does not allow to reinstate stop when stop is passed', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'PASSED', _links: { permissions: [{ _rel: 'skip' }] } },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isReinstateStopDisabled()).to.be.true; // eslint-disable-line
        });

        it('does not allow to reinstate stop when stop is not passed', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'NOT_PASSED', _links: { permissions: [{ _rel: 'skip' }] } },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isReinstateStopDisabled()).to.be.true; // eslint-disable-line
        });

        it('does not allow to reinstate stop when stop permission is missing', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'SKIPPED', _links: { permissions: [] } },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isReinstateStopDisabled()).to.be.true; // eslint-disable-line
        });
    });

    describe('isChangePlatformDisabled', () => {
        // eslint-disable-next-line max-len
        it('enables change platform when stop mutations are allowed, trip is a train and there are more than 1 platform and has permission "change" ', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED', routeType: 2 },
                stop: {
                    ...stop,
                    status: 'NOT_PASSED',
                    _links: {
                        permissions: [
                            { _rel: 'skip' },
                            { _rel: 'change' },
                        ],
                    },
                },
                serviceDate: moment().format(),
                platforms,
            });
            expect(wrapper.instance().isStopMutationPossible()).to.be.true; // eslint-disable-line
            expect(wrapper.instance().isChangePlatformDisabled()).to.be.false; // eslint-disable-line
        });

        it('disables change platform when permission is missing', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED', routeType: 3 },
                stop: {
                    ...stop,
                    status: 'NOT_PASSED',
                    _links: {
                        permissions: [
                            { _rel: 'skip' },
                        ],
                    },
                },
                serviceDate: moment().format(),
                platforms,
            });
            expect(wrapper.instance().isChangePlatformDisabled()).to.be.true; // eslint-disable-line
        });

        it('allows change platform when stop mutations are allowed', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED', routeType: 2 },
                stop: {
                    ...stop,
                    status: 'PASSED',
                    _links: {
                        permissions: [
                            { _rel: 'skip' },
                            { _rel: 'change' },
                        ],
                    },
                },
                serviceDate: moment().format(),
                platforms,
            });
            expect(wrapper.instance().isChangePlatformDisabled()).to.be.false; // eslint-disable-line
        });

        it('disables change platform when there are no platforms', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED', routeType: 2 },
                stop: {
                    ...stop,
                    status: 'NOT_PASSED',
                    _links: {
                        permissions: [
                            { _rel: 'skip' },
                            { _rel: 'change' },
                        ],
                    },
                },
                serviceDate: moment().format(),
                platforms: {
                    test9: {
                        children: [],
                    },
                },
            });
            expect(wrapper.instance().isChangePlatformDisabled()).to.be.true; // eslint-disable-line
        });

        it('disables change platform when there is 1 platforms', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED', routeType: 2 },
                stop: {
                    ...stop,
                    status: 'NOT_PASSED',
                    _links: {
                        permissions: [
                            { _rel: 'skip' },
                            { _rel: 'change' },
                        ],
                    },
                },
                serviceDate: moment().format(),
                platforms: {
                    test9: {
                        children: [
                            { stopId: 'test7' },
                        ],
                    },
                },
            });
            expect(wrapper.instance().isChangePlatformDisabled()).to.be.true; // eslint-disable-line
        });

        it('disables change platform for trips after today', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED', routeType: 2 },
                stop: {
                    ...stop,
                    status: 'NOT_PASSED',
                    _links: {
                        permissions: [
                            { _rel: 'skip' },
                            { _rel: 'change' },
                        ],
                    },
                },
                serviceDate: moment().add(1, 'days').format(),
                platforms,
            });
            expect(wrapper.instance().isChangePlatformDisabled()).to.be.true; // eslint-disable-line
        });
    });

    describe('isUpdateStopHeadsignPossible', () => {
        it('allows update when trip is not started and it is today', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isUpdateStopHeadsignPossible()).to.be.true; // eslint-disable-line
        });

        it('allows update when trip is in progress', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'IN_PROGRESS' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isUpdateStopHeadsignPossible()).to.be.true; // eslint-disable-line
        });

        it('does not allow update when trip is missed', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'MISSED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isUpdateStopHeadsignPossible()).to.be.false; // eslint-disable-line
        });

        it('does not allow update when trip is cancelled', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'CANCELLED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isUpdateStopHeadsignPossible()).to.be.false; // eslint-disable-line
        });

        it('does not allow update when trip is completed', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'COMPLETED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isUpdateStopHeadsignPossible()).to.be.false; // eslint-disable-line
        });

        it('does allow update when stop is skipped', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'SKIPPED' },
                serviceDate: moment().format(),
            });
            expect(wrapper.instance().isUpdateStopHeadsignPossible()).to.be.true; // eslint-disable-line
        });

        it('does not allow update after today', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().add(1, 'days').format(),
            });
            expect(wrapper.instance().isUpdateStopHeadsignPossible()).to.be.false; // eslint-disable-line
        });

        it('does not allow update when it is yesterday', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().subtract(1, 'days').format(),
            });
            expect(wrapper.instance().isUpdateStopHeadsignPossible()).to.be.false; // eslint-disable-line
        });

        it('does not allow update when it is yesterday, except overnight trips', () => {
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED', endTime: '24:00:01' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().subtract(1, 'days').format(),
            });
            expect(wrapper.instance().isUpdateStopHeadsignPossible()).to.be.true; // eslint-disable-line
        });
    });

    describe('is stopUpdatedHandler being called', () => {
        it('call stopUpdatedHandler if it is not undefined when changing platform', () => {
            const mockStopUpdatedHandler = jest.fn();
            wrapper = setup({
                tripInstance: { ...trip, status: 'NOT_STARTED' },
                stop: { ...stop, status: 'NOT_PASSED' },
                serviceDate: moment().format(),
                stopUpdatedHandler: mockStopUpdatedHandler,
            });

            const confirmationModal = wrapper.find(ConfirmationModal);

            // change platform
            confirmationModal.invoke('onAction')();

            expect(mockStopUpdatedHandler.mock.calls.length).to.be.equal(1);
        });
    });
});
