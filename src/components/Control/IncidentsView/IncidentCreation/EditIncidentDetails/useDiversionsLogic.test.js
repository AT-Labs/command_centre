import { useAffectedEntities, useDiversionValidation } from './useDiversionsLogic';

describe('useDiversionsLogic functions', () => {
    const mockDisruption = {
        disruptionId: 'DISR123',
        status: 'in-progress',
        affectedEntities: [
            { routeId: 'ROUTE1', routeType: 3, stopCode: 'STOP1' },
            { routeId: 'ROUTE2', routeType: 3, stopCode: 'STOP2' }
        ]
    };

    it('should test useDiversionsLogic hook exists', () => {
        const { useDiversionsLogic } = require('./useDiversionsLogic');
        expect(typeof useDiversionsLogic).toBe('function');
    });
});

describe('useAffectedEntities', () => {
    it('should return reduxAffectedRoutes when provided', () => {
        const reduxAffectedRoutes = [
            { routeId: 'REDUX_ROUTE1', routeType: 3 },
            { routeId: 'REDUX_ROUTE2', routeType: 3 }
        ];

        const result = useAffectedEntities(null, reduxAffectedRoutes);

        expect(result).toEqual(reduxAffectedRoutes);
    });

    it('should return disruption.affectedEntities when reduxAffectedRoutes is empty', () => {
        const disruption = {
            affectedEntities: [
                { routeId: 'ROUTE1', routeType: 3 },
                { routeId: 'ROUTE2', routeType: 3 }
            ]
        };

        const result = useAffectedEntities(disruption, []);

        expect(result).toEqual(disruption.affectedEntities);
    });

    it('should return empty array when disruption is null', () => {
        const result = useAffectedEntities(null, []);

        expect(result).toEqual([]);
    });

    it('should handle disruption.affectedEntities.affectedRoutes', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [
                    { routeId: 'ROUTE1', routeType: 3 },
                    { routeId: 'ROUTE2', routeType: 3 }
                ]
            }
        };

        const result = useAffectedEntities(disruption, []);

        expect(result).toEqual(disruption.affectedEntities.affectedRoutes);
    });

    it('should handle disruption.routes', () => {
        const disruption = {
            affectedEntities: {},
            routes: [
                { routeId: 'ROUTE1', routeType: 3 },
                { routeId: 'ROUTE2', routeType: 3 }
            ]
        };

        const result = useAffectedEntities(disruption, []);

        expect(result).toEqual(disruption.routes);
    });

    it('should handle disruption.affectedRoutes', () => {
        const disruption = {
            affectedEntities: {},
            affectedRoutes: [
                { routeId: 'ROUTE1', routeType: 3 },
                { routeId: 'ROUTE2', routeType: 3 }
            ]
        };

        const result = useAffectedEntities(disruption, []);

        expect(result).toEqual(disruption.affectedRoutes);
    });
});

describe('useDiversionValidation', () => {
    const mockAffectedEntities = [
        { routeId: 'ROUTE1', routeType: 3 },
        { routeId: 'ROUTE2', routeType: 3 }
    ];

    it('should return false when disruption is null', () => {
        const result = useDiversionValidation(null, mockAffectedEntities);

        expect(result).toBe(false);
    });

    it('should return false when disruption status is resolved', () => {
        const disruption = {
            status: 'resolved',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z'
        };

        const result = useDiversionValidation(disruption, mockAffectedEntities);

        expect(result).toBe(false);
    });

    it('should return false when no bus routes available', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z'
        };

        const trainRoutes = [
            { routeId: 'ROUTE1', routeType: 1 },
            { routeId: 'ROUTE2', routeType: 1 }
        ];

        const result = useDiversionValidation(disruption, trainRoutes);

        expect(result).toBe(false);
    });

    it('should return true when all conditions are met', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z'
        };

        const result = useDiversionValidation(disruption, mockAffectedEntities);

        expect(result).toBe(true);
    });

    it('should return true for draft status', () => {
        const disruption = {
            status: 'draft'
        };

        const result = useDiversionValidation(disruption, mockAffectedEntities);

        expect(result).toBe(true);
    });

    it('should return true for not-started status', () => {
        const disruption = {
            status: 'not-started'
        };

        const result = useDiversionValidation(disruption, mockAffectedEntities);

        expect(result).toBe(true);
    });

    it('should return false when all bus routes have diversions', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z'
        };

        const diversions = [
            {
                diversionRouteVariants: [
                    { routeId: 'ROUTE1' },
                    { routeId: 'ROUTE2' }
                ]
            }
        ];

        const result = useDiversionValidation(disruption, mockAffectedEntities, diversions);

        expect(result).toBe(false);
    });

    it('should return false when status is not allowed', () => {
        const disruption = {
            status: 'cancelled',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z'
        };

        const result = useDiversionValidation(disruption, mockAffectedEntities);

        expect(result).toBe(false);
    });

    it('should return false when startTime or endTime is missing for non-draft status', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z'
            // endTime is missing
        };

        const result = useDiversionValidation(disruption, mockAffectedEntities);

        expect(result).toBe(false);
    });
});