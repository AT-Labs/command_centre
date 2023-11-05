/** @jest-environment jsdom */
import React from 'react';
import moment from 'moment';
import { shallow } from 'enzyme';
import sinon from 'sinon';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import { DATE_FORMAT_GTFS } from '../../../../utils/dateUtils';
import { UpdateStopStatusModal } from './UpdateStopStatusModal';
import { updateStopsModalTypes } from '../Types';
import CustomModal from '../../../Common/CustomModal/CustomModal';

let sandbox;
let wrapper;
const trip1 = {
    tripId: 'tripId',
    routeVariantId: 'test1',
    routeShortName: 'test1',
    routeLongName: 'test1',
    routeType: 3,
    agencyId: 'NZB',
    referenceId: 'test1',
    serviceId: 'test11',
    status: TRIP_STATUS_TYPES.notStarted,
    serviceDate: moment().format(DATE_FORMAT_GTFS),
};

const componentPropsMock = {
    onClose: jest.fn(),
    isModalOpen: true,
    activeModal: updateStopsModalTypes.UPDATE_HEADSIGN,
    tripInstance: trip1,
    moveTripToStop: jest.fn(),
    selectedStopsByTripKey: () => [{
        stopId: 'test7',
        tripId: 'tripId',
        stopSequence: 1,
        stopCode: '1111',
        stopName: 'test8',
        arrivalTime: '00:00:00',
        departureTime: '11:11:11',
        scheduledArrivalTime: '00:00:00',
        scheduledDepartureTime: '11:11:11',
        status: 'NOT_PASSED',
        parent: 'test9',
    }],
    areSelectedStopsUpdating: true,
    updateSelectedStopsStatus: jest.fn(),
    updateDestination: jest.fn(),
    onStopUpdated: undefined,
};

const setup = (customProps) => {
    const props = { ...componentPropsMock, ...customProps };
    return shallow(<UpdateStopStatusModal { ...props } />);
};

describe('<UpdateStopStatusModal />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        jest.clearAllMocks();
    });

    describe('update destination tests', () => {
        it('Should display UpdateStopStatusModal for update-destination', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.UPDATE_HEADSIGN });
            expect(wrapper.find(CustomModal).prop('title')).toEqual('Update destination');
        });

        it('Should Update destination button be disable when input is empty', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.UPDATE_HEADSIGN });
            expect(wrapper.find(CustomModal).prop('title')).toEqual('Update destination');
            expect(wrapper.find(CustomModal).prop('okButton').isDisabled).toEqual(true);
        });

        it('Should not found Update destination title when activeModal is not update-destination', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.SKIP });
            expect(wrapper.find(CustomModal).prop('title')).not.toEqual('Update destination');
        });

        it('Should invoke onStopUpdated when onStopUpdated is not undefined', () => {
            const onStopUpdatedMock = jest.fn();
            wrapper = setup({ activeModal: updateStopsModalTypes.UPDATE_HEADSIGN, onStopUpdated: onStopUpdatedMock });
            wrapper.find(CustomModal).prop('okButton').onClick();
            expect(onStopUpdatedMock).toHaveBeenCalledTimes(1);
            expect(onStopUpdatedMock).toHaveBeenCalledWith({
                action: 'update-headsign',
                serviceDate: expect.anything(),
                headsign: '',
                startTime: undefined,
                stopCodes: ['1111'],
                tripId: 'tripId',
            });
        });

        it('Should invoke updateDestination when onStopUpdated is undefined', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.UPDATE_HEADSIGN });
            wrapper.find(CustomModal).prop('okButton').onClick();
            expect(componentPropsMock.updateDestination).toHaveBeenCalledTimes(1);
        });
    });

    describe('ski stop tests', () => {
        it('Should display UpdateStopStatusModal correctly', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.SKIP });
            expect(wrapper.find(CustomModal).prop('title')).toEqual('Skip stop(s)');
        });

        it('Should update status to SKIPPED for selected non-skipped stops', () => {
            const testStop = {
                stopId: 'test7',
                tripId: 'tripId',
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
            wrapper = setup({ activeModal: updateStopsModalTypes.SKIP,
                selectedStopsByTripKey: () => [testStop] });
            wrapper.find(CustomModal).prop('okButton').onClick();
            expect(componentPropsMock.updateSelectedStopsStatus).toHaveBeenCalledTimes(1);
            expect(componentPropsMock.updateSelectedStopsStatus).toHaveBeenCalledWith(
                expect.anything(),
                { 0: testStop },
                'SKIPPED',
                expect.anything(),
                expect.anything(),
            );
        });

        it('Should not update status if the stop status is already SKIPPED', () => {
            const testStop = {
                stopId: 'test7',
                tripId: 'tripId',
                stopSequence: 1,
                stopCode: '1111',
                stopName: 'test8',
                arrivalTime: '00:00:00',
                departureTime: '11:11:11',
                scheduledArrivalTime: '00:00:00',
                scheduledDepartureTime: '11:11:11',
                status: 'SKIPPED',
                parent: 'test9',
            };
            wrapper = setup({ activeModal: updateStopsModalTypes.SKIP,
                selectedStopsByTripKey: () => [testStop] });
            wrapper.find(CustomModal).prop('okButton').onClick();
            expect(componentPropsMock.updateSelectedStopsStatus).toHaveBeenCalledTimes(1);
            expect(componentPropsMock.updateSelectedStopsStatus).toHaveBeenCalledWith(
                expect.anything(),
                {},
                'SKIPPED',
                expect.anything(),
                expect.anything(),
            );
        });
    });

    describe('reinstate stop tests', () => {
        it('Should display UpdateStopStatusModal correctly', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.REINSTATE });
            expect(wrapper.find(CustomModal).prop('title')).toEqual('Reinstate stop(s)');
        });

        it('Should update status to NOT_PASSED for selected skipped stops', () => {
            const testStop = {
                stopId: 'test7',
                tripId: 'tripId',
                stopSequence: 1,
                stopCode: '1111',
                stopName: 'test8',
                arrivalTime: '00:00:00',
                departureTime: '11:11:11',
                scheduledArrivalTime: '00:00:00',
                scheduledDepartureTime: '11:11:11',
                status: 'SKIPPED',
                parent: 'test9',
            };
            wrapper = setup({ activeModal: updateStopsModalTypes.REINSTATE,
                selectedStopsByTripKey: () => [testStop] });
            wrapper.find(CustomModal).prop('okButton').onClick();
            expect(componentPropsMock.updateSelectedStopsStatus).toHaveBeenCalledTimes(1);
            expect(componentPropsMock.updateSelectedStopsStatus).toHaveBeenCalledWith(
                expect.anything(),
                { 0: testStop },
                'NOT_PASSED',
                expect.anything(),
                expect.anything(),
            );
        });

        it('Should not update status if the stop status is not SKIPPED', () => {
            const testStop = {
                stopId: 'test7',
                tripId: 'tripId',
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
            wrapper = setup({ activeModal: updateStopsModalTypes.REINSTATE,
                selectedStopsByTripKey: () => [testStop] });
            wrapper.find(CustomModal).prop('okButton').onClick();
            expect(componentPropsMock.updateSelectedStopsStatus).toHaveBeenCalledTimes(1);
            expect(componentPropsMock.updateSelectedStopsStatus).toHaveBeenCalledWith(
                expect.anything(),
                {},
                'NOT_PASSED',
                expect.anything(),
                expect.anything(),
            );
        });
    });

    describe('move service tests', () => {
        it('Should display UpdateStopStatusModal correctly', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.MOVE_SERVICE });
            expect(wrapper.find(CustomModal).prop('title')).toEqual('Move current service location');
        });

        it('Should invoke updateDestination when onStopUpdated is undefined', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.MOVE_SERVICE });
            wrapper.find(CustomModal).prop('okButton').onClick();
            expect(componentPropsMock.moveTripToStop).toHaveBeenCalledTimes(1);
        });
    });

    describe('set non-stopping tests', () => {
        it('Should display UpdateStopStatusModal correctly', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.SET_NON_STOPPING });
            expect(wrapper.find(CustomModal).prop('title')).toEqual('Set non-stopping stop(s)');
        });

        it('Should invoke onStopUpdated when onStopUpdated is not undefined', () => {
            const onStopUpdatedMock = jest.fn();
            wrapper = setup({ activeModal: updateStopsModalTypes.SET_NON_STOPPING, onStopUpdated: onStopUpdatedMock });
            wrapper.find(CustomModal).prop('okButton').onClick();
            expect(onStopUpdatedMock).toHaveBeenCalledTimes(1);
            expect(onStopUpdatedMock).toHaveBeenCalledWith({
                action: 'set-non-stopping',
                serviceDate: expect.anything(),
                startTime: undefined,
                status: 'NON_STOPPING',
                stopCodes: ['1111'],
                tripId: 'tripId',
            });
        });

        it('Should not update status if the stop status is already NON_STOPPING', () => {
            const onStopUpdatedMock = jest.fn();
            wrapper = setup({ activeModal: updateStopsModalTypes.SET_NON_STOPPING,
                onStopUpdated: onStopUpdatedMock,
                selectedStopsByTripKey: () => [{
                    stopId: 'test7',
                    tripId: 'tripId',
                    stopSequence: 1,
                    stopCode: '1111',
                    stopName: 'test8',
                    arrivalTime: '00:00:00',
                    departureTime: '11:11:11',
                    scheduledArrivalTime: '00:00:00',
                    scheduledDepartureTime: '11:11:11',
                    status: 'NON_STOPPING',
                    parent: 'test9',
                }] });
            wrapper.find(CustomModal).prop('okButton').onClick();
            expect(onStopUpdatedMock).toHaveBeenCalledTimes(1);
            expect(onStopUpdatedMock).toHaveBeenCalledWith({
                action: 'set-non-stopping',
                serviceDate: expect.anything(),
                startTime: undefined,
                status: 'NON_STOPPING',
                stopCodes: [],
                tripId: 'tripId',
            });
        });

        it('Should invoke updateSelectedStopsStatus when onStopUpdated is undefined', () => {
            wrapper = setup({ activeModal: updateStopsModalTypes.SET_NON_STOPPING });
            wrapper.find(CustomModal).prop('okButton').onClick();
            expect(componentPropsMock.updateSelectedStopsStatus).toHaveBeenCalledTimes(1);
        });
    });
});
