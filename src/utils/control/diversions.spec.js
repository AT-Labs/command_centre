import { DISRUPTION_STATUSES } from '../../constants/disruptions';
import {
    LOADER_PROTECTION_TIMEOUT,
    canFetchDiversions,
    fetchDiversionsHelper,
    handleDiversionRefetch,
    getAffectedEntities,
    getDiversionValidation,
} from './diversions';

describe('Diversions Utils', () => {
    describe('Constants', () => {
        it('should have correct LOADER_PROTECTION_TIMEOUT value', () => {
            expect(LOADER_PROTECTION_TIMEOUT).toBe(2000);
        });

        it('should have correct DISRUPTION_STATUSES values', () => {
            expect(DISRUPTION_STATUSES).toEqual({
                NOT_STARTED: 'not-started',
                IN_PROGRESS: 'in-progress',
                DRAFT: 'draft',
                RESOLVED: 'resolved',
            });
        });
    });

    describe('canFetchDiversions', () => {
        it('should return fetchDiversionsAction when disruption has disruptionId and fetchDiversionsAction exists', () => {
            const disruption = { disruptionId: '123' };
            const fetchDiversionsAction = jest.fn();

            expect(canFetchDiversions(disruption, fetchDiversionsAction)).toBe(fetchDiversionsAction);
        });

        it('should return undefined when disruption has no disruptionId', () => {
            const disruption = {};
            const fetchDiversionsAction = jest.fn();

            expect(canFetchDiversions(disruption, fetchDiversionsAction)).toBe(undefined);
        });

        it('should return null/undefined when fetchDiversionsAction is not provided', () => {
            const disruption = { disruptionId: '123' };

            expect(canFetchDiversions(disruption, null)).toBe(null);
            expect(canFetchDiversions(disruption, undefined)).toBe(undefined);
        });

        it('should return undefined when disruption is null or undefined', () => {
            const fetchDiversionsAction = jest.fn();

            expect(canFetchDiversions(null, fetchDiversionsAction)).toBe(undefined);
            expect(canFetchDiversions(undefined, fetchDiversionsAction)).toBe(undefined);
        });
    });

    describe('fetchDiversionsHelper', () => {
        it('should call fetchDiversionsAction when conditions are met', () => {
            const disruption = { disruptionId: '123' };
            const fetchDiversionsAction = jest.fn();

            fetchDiversionsHelper(disruption, fetchDiversionsAction);

            expect(fetchDiversionsAction).toHaveBeenCalledWith('123', false);
        });

        it('should call fetchDiversionsAction with forceRefresh when provided', () => {
            const disruption = { disruptionId: '123' };
            const fetchDiversionsAction = jest.fn();

            fetchDiversionsHelper(disruption, fetchDiversionsAction, true);

            expect(fetchDiversionsAction).toHaveBeenCalledWith('123', true);
        });

        it('should not call fetchDiversionsAction when conditions are not met', () => {
            const disruption = {};
            const fetchDiversionsAction = jest.fn();

            fetchDiversionsHelper(disruption, fetchDiversionsAction);

            expect(fetchDiversionsAction).not.toHaveBeenCalled();
        });
    });

    describe('handleDiversionRefetch', () => {
        const disruption = { disruptionId: '123' };
        const fetchDiversionsAction = jest.fn();
        const clearDiversionsCacheAction = jest.fn();

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should handle MANAGER_CLOSED scenario', () => {
            handleDiversionRefetch(disruption, fetchDiversionsAction, clearDiversionsCacheAction, 'MANAGER_CLOSED');

            expect(fetchDiversionsAction).toHaveBeenCalledWith('123', true);
            expect(clearDiversionsCacheAction).not.toHaveBeenCalled();
        });

        it('should handle DIVERSION_CREATED scenario', () => {
            handleDiversionRefetch(disruption, fetchDiversionsAction, clearDiversionsCacheAction, 'DIVERSION_CREATED');

            expect(clearDiversionsCacheAction).toHaveBeenCalledWith('123');
            expect(fetchDiversionsAction).toHaveBeenCalledWith('123', true);
        });

        it('should handle DIVERSION_CREATED scenario without clearDiversionsCacheAction', () => {
            handleDiversionRefetch(disruption, fetchDiversionsAction, null, 'DIVERSION_CREATED');

            expect(fetchDiversionsAction).not.toHaveBeenCalled();
        });

        it('should handle DIVERSION_UPDATED scenario', () => {
            handleDiversionRefetch(disruption, fetchDiversionsAction, clearDiversionsCacheAction, 'DIVERSION_UPDATED');

            expect(fetchDiversionsAction).toHaveBeenCalledWith('123', true);
            expect(clearDiversionsCacheAction).not.toHaveBeenCalled();
        });

        it('should handle default scenario', () => {
            handleDiversionRefetch(disruption, fetchDiversionsAction, clearDiversionsCacheAction, 'UNKNOWN');

            expect(fetchDiversionsAction).toHaveBeenCalledWith('123', false);
            expect(clearDiversionsCacheAction).not.toHaveBeenCalled();
        });

        it('should not call actions when disruption has no disruptionId', () => {
            const invalidDisruption = {};

            handleDiversionRefetch(invalidDisruption, fetchDiversionsAction, clearDiversionsCacheAction, 'MANAGER_CLOSED');

            expect(fetchDiversionsAction).not.toHaveBeenCalled();
            expect(clearDiversionsCacheAction).not.toHaveBeenCalled();
        });
    });

    describe('getAffectedEntities', () => {
        it('should return reduxAffectedRoutes when provided', () => {
            const disruption = { affectedEntities: { affectedRoutes: [{ routeId: '1' }] } };
            const reduxAffectedRoutes = [{ routeId: '2' }];

            const result = getAffectedEntities(disruption, reduxAffectedRoutes);

            expect(result).toEqual(reduxAffectedRoutes);
        });

        it('should return empty array when reduxAffectedRoutes is empty', () => {
            const disruption = { affectedEntities: { affectedRoutes: [{ routeId: '1' }] } };
            const reduxAffectedRoutes = [];

            const result = getAffectedEntities(disruption, reduxAffectedRoutes);

            expect(result).toEqual([{ routeId: '1' }]);
        });

        it('should return affectedEntities.affectedRoutes when no reduxAffectedRoutes', () => {
            const disruption = { affectedEntities: { affectedRoutes: [{ routeId: '1' }] } };

            const result = getAffectedEntities(disruption, null);

            expect(result).toEqual([{ routeId: '1' }]);
        });

        it('should return affectedEntities when it is an array', () => {
            const disruption = { affectedEntities: [{ routeId: '1' }] };

            const result = getAffectedEntities(disruption, null);

            expect(result).toEqual([{ routeId: '1' }]);
        });

        it('should return routes or affectedRoutes when disruption has them but no affectedEntities', () => {
            const disruptionWithRoutes = { routes: [{ routeId: '1' }] };
            const disruptionWithAffectedRoutes = { affectedRoutes: [{ routeId: '1' }] };

            expect(getAffectedEntities(disruptionWithRoutes, null)).toEqual([{ routeId: '1' }]);
            expect(getAffectedEntities(disruptionWithAffectedRoutes, null)).toEqual([{ routeId: '1' }]);
        });

        it('should return empty array when no valid entities found or disruption is null', () => {
            expect(getAffectedEntities({}, null)).toEqual([]);
            expect(getAffectedEntities(null, null)).toEqual([]);
        });
    });

    describe('getDiversionValidation', () => {
        const mockDisruption = {
            disruptionId: '123',
            status: DISRUPTION_STATUSES.NOT_STARTED,
            startTime: '2023-01-01T10:00:00Z',
            endTime: '2023-01-01T12:00:00Z',
        };

        const mockAffectedEntities = [
            { routeId: '1', routeType: 3 }, // bus route
            { routeId: '2', routeType: 1 }, // train route
        ];

        it('should return false when disruption is null', () => {
            const result = getDiversionValidation(null, mockAffectedEntities);

            expect(result).toBe(false);
        });

        it('should return false when disruption status is RESOLVED', () => {
            const disruption = { ...mockDisruption, status: DISRUPTION_STATUSES.RESOLVED };

            const result = getDiversionValidation(disruption, mockAffectedEntities);

            expect(result).toBe(false);
        });

        it('should return false when disruption status is not allowed', () => {
            const disruption = { ...mockDisruption, status: 'invalid-status' };

            const result = getDiversionValidation(disruption, mockAffectedEntities);

            expect(result).toBe(false);
        });

        it('should return true for NOT_STARTED status without startTime/endTime', () => {
            const disruption = { ...mockDisruption, status: DISRUPTION_STATUSES.NOT_STARTED, startTime: null, endTime: null };

            const result = getDiversionValidation(disruption, mockAffectedEntities);

            expect(result).toBe(true);
        });

        it('should return true for DRAFT status without startTime/endTime', () => {
            const disruption = { ...mockDisruption, status: DISRUPTION_STATUSES.DRAFT, startTime: null, endTime: null };

            const result = getDiversionValidation(disruption, mockAffectedEntities);

            expect(result).toBe(true);
        });

        it('should return false for IN_PROGRESS status without startTime/endTime', () => {
            const disruption = { ...mockDisruption, status: DISRUPTION_STATUSES.IN_PROGRESS, startTime: null, endTime: null };

            const result = getDiversionValidation(disruption, mockAffectedEntities);

            expect(result).toBe(false);
        });

        it('should return false when no bus routes are present', () => {
            const affectedEntities = [{ routeId: '1', routeType: 1 }]; // only train route

            const result = getDiversionValidation(mockDisruption, affectedEntities);

            expect(result).toBe(false);
        });

        it('should return true when bus routes are present', () => {
            const affectedEntities = [{ routeId: '1', routeType: 3 }]; // bus route

            const result = getDiversionValidation(mockDisruption, affectedEntities);

            expect(result).toBe(true);
        });

        it('should return true when both bus and train routes are present', () => {
            const affectedEntities = [
                { routeId: '1', routeType: 3 }, // bus route
                { routeId: '2', routeType: 1 }, // train route
            ];

            const result = getDiversionValidation(mockDisruption, affectedEntities);

            expect(result).toBe(true);
        });

        it('should return false when all bus routes already have diversions', () => {
            const affectedEntities = [{ routeId: '1', routeType: 3 }]; // bus route
            const diversions = [{
                diversionRouteVariants: [{ routeId: '1' }],
            }];

            const result = getDiversionValidation(mockDisruption, affectedEntities, diversions);

            expect(result).toBe(false);
        });

        it('should return true when some bus routes do not have diversions', () => {
            const affectedEntities = [
                { routeId: '1', routeType: 3 }, // bus route
                { routeId: '2', routeType: 3 }, // bus route
            ];
            const diversions = [{
                diversionRouteVariants: [{ routeId: '1' }],
            }];

            const result = getDiversionValidation(mockDisruption, affectedEntities, diversions);

            expect(result).toBe(true);
        });

        it('should handle edge cases for diversions (empty, null, empty variants)', () => {
            const affectedEntities = [{ routeId: '1', routeType: 3 }]; // bus route

            expect(getDiversionValidation(mockDisruption, affectedEntities, [])).toBe(true);
            expect(getDiversionValidation(mockDisruption, affectedEntities, null)).toBe(true);
            expect(getDiversionValidation(mockDisruption, affectedEntities, [{ diversionRouteVariants: [] }])).toBe(true);
            expect(getDiversionValidation(mockDisruption, affectedEntities, [{ diversionRouteVariants: null }])).toBe(true);
        });
    });
});
