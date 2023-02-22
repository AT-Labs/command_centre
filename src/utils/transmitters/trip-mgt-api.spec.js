import { updateTripStatus, updateStopId, updateTripDelay, moveToNextStop, moveTotStop } from './trip-mgt-api';
import * as graphql from '../graphql';
import * as auth from '../../auth';

const mutateStatic = jest.spyOn(graphql, 'mutateStatic');
jest.spyOn(auth, 'getAuthToken').mockReturnValue('auth_token');

const tripId = {
    tripId: 'trip-id-1',
    serviceDate: '20230101',
    startTime: '10:00:00',
};

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
});
