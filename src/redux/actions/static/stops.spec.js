import * as stopsActions from './stops';
import * as ccStatic from '../../../utils/transmitters/cc-static';
import * as browserCache from '../../../utils/browser-cache';
import { reportError } from '../activity';
import ACTION_TYPE from '../../action-types';

jest.mock('../../../utils/transmitters/cc-static');
jest.mock('../../../utils/browser-cache');
jest.mock('../activity', () => ({
    reportError: jest.fn(() => ({ type: 'ERROR' })),
}));

describe('getStops', () => {
    const dispatch = jest.fn();
    const serviceDate = '20251015';
    const stopsMock = [
        { stop_code: 'A', stop_name: 'Alpha' },
        { stop_code: 'B', stop_name: 'Beta' },
    ];
    const stopTypesMock = [
        { stop_code: 'A', route_type: 1, parent_stop_code: null },
        { stop_code: 'B', route_type: 2, parent_stop_code: null },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        ccStatic.getAllStops.mockResolvedValue(stopsMock);
        ccStatic.getAllStopTypes.mockResolvedValue(stopTypesMock);
        browserCache.setCache.mockImplementation(data => Promise.resolve(data));
    });

    it('should use cache when forceRefresh is false and cache exists', async () => {
        browserCache.getCache
            .mockResolvedValueOnce(stopsMock)
            .mockResolvedValueOnce(stopTypesMock);

        await stopsActions.getStops(serviceDate, false)(dispatch);

        expect(browserCache.getCache).toHaveBeenCalled();
        expect(ccStatic.getAllStops).not.toHaveBeenCalled();
        expect(ccStatic.getAllStopTypes).not.toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: ACTION_TYPE.FETCH_STOPS,
            payload: expect.any(Object),
        }));
    });

    it('should fetch fresh data when forceRefresh is true', async () => {
        browserCache.getCache.mockResolvedValue(null);

        await stopsActions.getStops(serviceDate, true)(dispatch);

        expect(ccStatic.getAllStops).toHaveBeenCalledWith(serviceDate);
        expect(ccStatic.getAllStopTypes).toHaveBeenCalled();
        expect(browserCache.setCache).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: ACTION_TYPE.FETCH_STOPS,
            payload: expect.any(Object),
        }));
    });

    it('should fetch fresh data when cache is missing and forceRefresh is false', async () => {
        browserCache.getCache.mockResolvedValue(null);

        await stopsActions.getStops(serviceDate, false)(dispatch);

        expect(ccStatic.getAllStops).toHaveBeenCalledWith(serviceDate);
        expect(ccStatic.getAllStopTypes).toHaveBeenCalled();
        expect(browserCache.setCache).toHaveBeenCalled();
        expect(dispatch).toHaveBeenCalledWith(expect.objectContaining({
            type: ACTION_TYPE.FETCH_STOPS,
            payload: expect.any(Object),
        }));
    });

    it('should dispatch reportError and return [] on error', async () => {
        ccStatic.getAllStops.mockRejectedValueOnce(new Error('fail'));

        const result = await stopsActions.getStops(serviceDate, true)(dispatch);

        expect(reportError).toHaveBeenCalled();
        expect(result).toEqual([]);
    });
});
