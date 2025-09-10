import { useAffectedEntities, useDiversionValidation } from './useDiversionsLogic';

// Mock React hooks
jest.mock('react', () => ({
    useState: jest.fn(),
    useEffect: jest.fn(),
}));

describe('useDiversionsLogic', () => {
    const mockDisruption = {
        disruptionId: 'DISR123',
        startTime: '2023-01-01T10:00:00Z',
        endTime: '2023-01-01T18:00:00Z',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useAffectedEntities', () => {
        it('should return reduxAffectedRoutes when available', () => {
            const reduxAffectedRoutes = [{ routeId: 1, routeType: 3 }];
            const result = useAffectedEntities(mockDisruption, reduxAffectedRoutes);
            expect(result).toEqual(reduxAffectedRoutes);
        });

        it('should return empty array when no disruption affectedEntities', () => {
            const disruption = { disruptionId: 'DISR123' };
            const result = useAffectedEntities(disruption, []);
            expect(result).toEqual([]);
        });

        it('should return disruption.affectedEntities when it is an array', () => {
            const disruption = {
                disruptionId: 'DISR123',
                affectedEntities: [{ routeId: 1, routeType: 3 }],
            };
            const result = useAffectedEntities(disruption, []);
            expect(result).toEqual([{ routeId: 1, routeType: 3 }]);
        });

        it('should return disruption.affectedEntities.affectedRoutes when available', () => {
            const disruption = {
                disruptionId: 'DISR123',
                affectedEntities: {
                    affectedRoutes: [{ routeId: 1, routeType: 3 }],
                },
            };
            const result = useAffectedEntities(disruption, []);
            expect(result).toEqual([{ routeId: 1, routeType: 3 }]);
        });

        it('should return disruption.routes when available', () => {
            const disruption = {
                disruptionId: 'DISR123',
                routes: [{ routeId: 1, routeType: 3 }],
            };
            const result = useAffectedEntities(disruption, []);
            expect(result).toEqual([]);
        });

        it('should return disruption.affectedRoutes when available', () => {
            const disruption = {
                disruptionId: 'DISR123',
                affectedRoutes: [{ routeId: 1, routeType: 3 }],
            };
            const result = useAffectedEntities(disruption, []);
            expect(result).toEqual([]);
        });

        it('should return empty array when no valid routes found', () => {
            const disruption = {
                disruptionId: 'DISR123',
                affectedEntities: {},
            };
            const result = useAffectedEntities(disruption, []);
            expect(result).toEqual([]);
        });
    });

    describe('useDiversionValidation', () => {
        const mockAffectedEntities = [
            { routeId: 1, routeType: 3 }, // bus route
            { routeId: 2, routeType: 3 }, // bus route
        ];

        it('should return false when no disruption', () => {
            const result = useDiversionValidation(null, mockAffectedEntities);
            expect(result).toBe(false);
        });

        it('should return false when disruption status is resolved', () => {
            const disruption = { ...mockDisruption, status: 'resolved' };
            const result = useDiversionValidation(disruption, mockAffectedEntities);
            expect(result).toBe(false);
        });

        it('should return false when disruption status is not allowed', () => {
            const disruption = { ...mockDisruption, status: 'cancelled' };
            const result = useDiversionValidation(disruption, mockAffectedEntities);
            expect(result).toBe(false);
        });

        it('should return false when no bus routes', () => {
            const affectedEntities = [{ routeId: 1, routeType: 1 }]; // train route only
            const result = useDiversionValidation(mockDisruption, affectedEntities);
            expect(result).toBe(false);
        });

        it('should return false when only train routes', () => {
            const affectedEntities = [{ routeId: 1, routeType: 1 }]; // train route only
            const disruption = { ...mockDisruption, status: 'in-progress' };
            const result = useDiversionValidation(disruption, affectedEntities);
            expect(result).toBe(false);
        });

        it('should return true when bus routes available and no existing diversions', () => {
            const disruption = { ...mockDisruption, status: 'in-progress' };
            const result = useDiversionValidation(disruption, mockAffectedEntities, []);
            expect(result).toBe(true);
        });

        it('should return false when all bus routes already have diversions', () => {
            const disruption = { ...mockDisruption, status: 'in-progress' };
            const diversions = [{
                diversionRouteVariants: [
                    { routeId: 1 },
                    { routeId: 2 },
                ],
            }];
            const result = useDiversionValidation(disruption, mockAffectedEntities, diversions);
            expect(result).toBe(false);
        });

        it('should return true when some bus routes have diversions but not all', () => {
            const disruption = { ...mockDisruption, status: 'in-progress' };
            const diversions = [{
                diversionRouteVariants: [{ routeId: 1 }],
            }];
            const result = useDiversionValidation(disruption, mockAffectedEntities, diversions);
            expect(result).toBe(true);
        });
    });
});
