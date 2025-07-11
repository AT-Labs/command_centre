import {
    getTrips,
    updateTripStatus,
    updateStopId,
    updateTripDelay,
    moveToNextStop,
    moveTotStop,
    updateHeadsign,
    searchTrip,
    updateStopStatus,
    updateTripOnHold,
    updateTripOperationNotes,
} from './trip-mgt-api';
import * as graphql from '../graphql';
import * as auth from '../../auth';
import * as jsonHandling from '../fetch';

const mutateStatic = jest.spyOn(graphql, 'mutateStatic');
jest.spyOn(auth, 'getAuthToken').mockResolvedValue('auth_token');
const tripId = {
    tripId: 'trip-id-1',
    serviceDate: '20230101',
    startTime: '10:00:00',
};

describe('getTrips', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should send filter for type and discruptionId if set', async () => {
        jest.spyOn(auth, 'fetchWithAuthHeader').mockResolvedValue({
            ok: true,
            json: async () => ({
                blah: 'hello',
                tripInstances: [],
            }),
        });

        const filter = {
            isType: 'foo',
            notType: 'bar',
            disruptionId: 123,
        };
        await getTrips(filter);

        // Validations
        const { body } = auth.fetchWithAuthHeader.mock.calls[0][1];
        expect(auth.fetchWithAuthHeader).toHaveBeenCalledTimes(1);
        expect(JSON.parse(body)).toEqual({
            isType: 'foo', // the ui kind of enforces only one of isType or notType is applied. Not doing any checks for now on this for flexibility purposes
            notType: 'bar',
            disruptionId: 123,
        });
    });

    it('should send filter for direction if set', async () => {
        jest.spyOn(auth, 'fetchWithAuthHeader').mockResolvedValue({
            ok: true,
            json: async () => ({
                blah: 'hello',
                tripInstances: [],
            }),
        });

        const filter = {
            directionId: 0,
        };
        await getTrips(filter);

        // Validations
        const { body } = auth.fetchWithAuthHeader.mock.calls[0][1];
        expect(auth.fetchWithAuthHeader).toHaveBeenCalledTimes(1);
        expect(JSON.parse(body)).toEqual({
            directionId: 0,
        });
    });

    it('should send empty filter when nothing set', async () => {
        jest.spyOn(auth, 'fetchWithAuthHeader').mockResolvedValue({
            ok: true,
            json: async () => ({
                blah: 'hello',
                tripInstances: [],
            }),
        });

        const filter = { };
        await getTrips(filter);

        // Validations
        const { body } = auth.fetchWithAuthHeader.mock.calls[0][1];
        expect(auth.fetchWithAuthHeader).toHaveBeenCalledTimes(1);

        expect(JSON.parse(body)).toEqual({ });
    });
});

describe('Operation result', () => {
    afterAll(() => {
        jest.resetAllMocks();
    });

    it('Should get updateTripStatus from response after sending updateTripStatus', async () => {
        const options = { ...tripId, tripStatus: 'CANCELLED' };
        mutateStatic.mockResolvedValue({ data: { updateTripStatus: options } });
        const result = await updateTripStatus(options);
        expect(result).toEqual(options);
    });

    it('Should get updateStopId from response after sending updateStopId', async () => {
        const options = { ...tripId, stopSequence: 1, stopId: 'stop1' };
        mutateStatic.mockResolvedValue({ data: { updateStopId: options } });
        const result = await updateStopId(options);
        expect(result).toEqual(options);
    });

    it('Should get setDelayTrip from response after sending updateTripDelay', async () => {
        const options = { ...tripId, delay: 1 };
        mutateStatic.mockResolvedValue({ data: { setDelayTrip: options } });
        const result = await updateTripDelay(options);
        expect(result).toEqual(options);
    });

    it('Should get stop moved to from response after sending moveToNextStop', async () => {
        const stop = { stopSequence: 2 };
        mutateStatic.mockResolvedValue({ data: { moveToNextStop: stop } });
        const result = await moveToNextStop(tripId);
        expect(result).toEqual(stop);
    });

    it('Should get stop moved to from response after sending moveTotStop', async () => {
        const stop = { stopSequence: 2 };
        mutateStatic.mockResolvedValue({ data: { moveToStop: stop } });
        const result = await moveTotStop({ ...tripId, ...stop });
        expect(result).toEqual(stop);
    });

    it('Should get trip from response after sending updateHeadsign', async () => {
        mutateStatic.mockResolvedValue({ data: { updateHeadsign: tripId } });
        const result = await updateHeadsign({ ...tripId, headsign: 'new destination', stopCodes: ['9001', '9002'] });
        expect(result).toEqual(tripId);
    });

    it('Should get data after calling trips endpoint', async () => {
        const mockResult = {
            totalCount: 2,
            trips: [{
                tripId: '1',
                serviceDate: '20190608',
                startTime: '10:00:00',
                routeShortName: '10',
                routeType: 3,
                status: 'COMPLETED',
            }, {
                tripId: '2',
                serviceDate: '20190608',
                startTime: '10:00:00',
                routeShortName: '20',
                routeType: 3,
                status: 'NOT_STARTED',
            }],
        };

        jest.spyOn(jsonHandling, 'jsonResponseHandling').mockImplementationOnce(param => param);
        jest.spyOn(auth, 'fetchWithAuthHeader').mockImplementationOnce(
            () => Promise.resolve(mockResult),
        );

        const fakeRequestBody = {
            page: 1,
            limit: 15,
            routeId: '865-203',
            routeType: 3,
            agencyId: 'RTH',
            serviceDateFrom: '20230627',
            serviceDateTo: '20230629',
            startTimeFrom: '10:00:00',
            startTimeTo: '20:00:00',
            directionId: 0,
        };

        const result = await searchTrip(fakeRequestBody);
        expect(result).toEqual(mockResult);
    });

    it('should include display: true in variables when display is true', async () => {
        mutateStatic.mockResolvedValue({ data: { updateStopStatus: tripId } });
        const result = await updateStopStatus({
            tripId: 'e28f1068-83ab-40a8-85f1-83beb041cb3d',
            serviceDate: '20240501',
            startTime: '08:00:00',
            stopSequences: [1, 2],
            stopStatus: 'SKIPPED',
            display: true,
        });
        expect(mutateStatic).toHaveBeenCalledWith(expect.objectContaining({
            variables: expect.objectContaining({
                display: true,
            }),
        }));
        expect(result).toEqual(tripId);
    });

    it('should include display: false in variables when display is false', async () => {
        mutateStatic.mockResolvedValue({ data: { updateStopStatus: tripId } });
        const result = await updateStopStatus({
            tripId: '636b0565-f02f-4990-b2bc-af7758ef542c',
            serviceDate: '20240501',
            startTime: '08:00:00',
            stopSequences: [1, 2],
            stopStatus: 'MISSED',
            display: false,
        });
        expect(mutateStatic).toHaveBeenCalledWith(expect.objectContaining({
            variables: expect.objectContaining({
                display: false,
            }),
        }));
        expect(result).toEqual(tripId);
    });

    it('should omit display in variables when display is undefined', async () => {
        mutateStatic.mockResolvedValue({ data: { updateStopStatus: tripId } });
        const result = await updateStopStatus({
            tripId: '423f80e2-2eab-47db-abc1-e419df05cdec',
            serviceDate: '20240501',
            startTime: '08:00:00',
            stopSequences: [1, 2],
            stopStatus: 'CANCELLED',
            display: undefined,
        });
        const callArgs = mutateStatic.mock.calls[0][0];
        expect(callArgs.variables).not.toHaveProperty('display');
        expect(result).toEqual(tripId);
    });

    it('Should get updateTripOnHold from response after sending updateTripOnHold', async () => {
        const options = { ...tripId, onHold: true };
        mutateStatic.mockResolvedValue({ data: { updateTripOnHold: options } });
        const result = await updateTripOnHold(options);
        expect(result).toEqual(options);
    });

    it('Should get updateTripOperationNotes from response after sending updateTripOperationNotes', async () => {
        const options = { ...tripId, operationNotes: 'Notes' };
        mutateStatic.mockResolvedValue({ data: { updateTripOperationNotes: options } });
        const result = await updateTripOperationNotes(options);
        expect(result).toEqual(options);
    });
});
