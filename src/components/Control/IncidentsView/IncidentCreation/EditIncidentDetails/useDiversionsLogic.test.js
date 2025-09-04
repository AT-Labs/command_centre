/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react-hooks';
import { useAffectedEntities, useDiversionValidation, useDiversionsLogic } from './useDiversionsLogic';

describe('useDiversionsLogic', () => {
    it('should export useDiversionsLogic function', () => {
        expect(typeof useDiversionsLogic).toBe('function');
    });

    it('should have correct function signature', () => {
        expect(useDiversionsLogic.length).toBe(5);
    });

    it('should initialize with null anchorEl', () => {
        const mockDisruption = { disruptionId: 'test-id' };
        const mockFetchDiversionsAction = jest.fn();
        const mockIsDiversionManagerOpen = false;
        const mockDiversionResultState = null;
        const mockClearDiversionsCacheAction = jest.fn();

        const { result } = renderHook(() => useDiversionsLogic(
            mockDisruption,
            mockFetchDiversionsAction,
            mockIsDiversionManagerOpen,
            mockDiversionResultState,
            mockClearDiversionsCacheAction,
        ));

        expect(result.current.anchorEl).toBe(null);
        expect(typeof result.current.setAnchorEl).toBe('function');
    });

    it('should call fetchDiversionsAction when disruption has disruptionId', () => {
        const mockDisruption = { disruptionId: 'test-id' };
        const mockFetchDiversionsAction = jest.fn();
        const mockIsDiversionManagerOpen = false;
        const mockDiversionResultState = null;
        const mockClearDiversionsCacheAction = jest.fn();

        renderHook(() => useDiversionsLogic(
            mockDisruption,
            mockFetchDiversionsAction,
            mockIsDiversionManagerOpen,
            mockDiversionResultState,
            mockClearDiversionsCacheAction,
        ));

        expect(mockFetchDiversionsAction).toHaveBeenCalledWith('test-id');
    });

    it('should not call fetchDiversionsAction when disruption has no disruptionId', () => {
        const mockDisruption = {};
        const mockFetchDiversionsAction = jest.fn();
        const mockIsDiversionManagerOpen = false;
        const mockDiversionResultState = null;
        const mockClearDiversionsCacheAction = jest.fn();

        renderHook(() => useDiversionsLogic(
            mockDisruption,
            mockFetchDiversionsAction,
            mockIsDiversionManagerOpen,
            mockDiversionResultState,
            mockClearDiversionsCacheAction,
        ));

        expect(mockFetchDiversionsAction).not.toHaveBeenCalled();
    });

    it('should set anchorEl to null when isDiversionManagerOpen changes to true', () => {
        const mockDisruption = { disruptionId: 'test-id' };
        const mockFetchDiversionsAction = jest.fn();
        const mockDiversionResultState = null;
        const mockClearDiversionsCacheAction = jest.fn();

        const { result, rerender } = renderHook(
            ({ isDiversionManagerOpen }) => useDiversionsLogic(
                mockDisruption,
                mockFetchDiversionsAction,
                isDiversionManagerOpen,
                mockDiversionResultState,
                mockClearDiversionsCacheAction,
            ),
            { initialProps: { isDiversionManagerOpen: false } },
        );

        act(() => {
            result.current.setAnchorEl(document.createElement('div'));
        });

        expect(result.current.anchorEl).not.toBe(null);

        rerender({ isDiversionManagerOpen: true });

        expect(result.current.anchorEl).toBe(null);
    });

    it('should call fetchDiversionsAction with delay when isDiversionManagerOpen changes to false', async () => {
        jest.useFakeTimers();

        const mockDisruption = { disruptionId: 'test-id' };
        const mockFetchDiversionsAction = jest.fn();
        const mockDiversionResultState = null;
        const mockClearDiversionsCacheAction = jest.fn();

        const { rerender } = renderHook(
            ({ isDiversionManagerOpen }) => useDiversionsLogic(
                mockDisruption,
                mockFetchDiversionsAction,
                isDiversionManagerOpen,
                mockDiversionResultState,
                mockClearDiversionsCacheAction,
            ),
            { initialProps: { isDiversionManagerOpen: true } },
        );

        // Clear initial calls
        mockFetchDiversionsAction.mockClear();

        rerender({ isDiversionManagerOpen: false });

        // Should not be called immediately
        expect(mockFetchDiversionsAction).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(mockFetchDiversionsAction).toHaveBeenCalledWith('test-id');

        jest.useRealTimers();
    });

    it('should call clearDiversionsCacheAction and fetchDiversionsAction when diversionResultState has diversionId', async () => {
        jest.useFakeTimers();

        const mockDisruption = { disruptionId: 'test-id' };
        const mockFetchDiversionsAction = jest.fn();
        const mockIsDiversionManagerOpen = false;
        const mockDiversionResultState = { diversionId: 'diversion-id' };
        const mockClearDiversionsCacheAction = jest.fn();

        renderHook(() => useDiversionsLogic(
            mockDisruption,
            mockFetchDiversionsAction,
            mockIsDiversionManagerOpen,
            mockDiversionResultState,
            mockClearDiversionsCacheAction,
        ));

        act(() => {
            jest.advanceTimersByTime(1000);
        });

        expect(mockClearDiversionsCacheAction).toHaveBeenCalledWith('test-id');
        expect(mockFetchDiversionsAction).toHaveBeenCalledWith('test-id', true);

        jest.useRealTimers();
    });

    it('should call fetchDiversionsAction when diversionResultState is not loading and has diversionId', async () => {
        jest.useFakeTimers();

        const mockDisruption = { disruptionId: 'test-id' };
        const mockFetchDiversionsAction = jest.fn();
        const mockIsDiversionManagerOpen = false;
        const mockDiversionResultState = {
            isLoading: false,
            diversionId: 'diversion-id',
        };
        const mockClearDiversionsCacheAction = jest.fn();

        renderHook(() => useDiversionsLogic(
            mockDisruption,
            mockFetchDiversionsAction,
            mockIsDiversionManagerOpen,
            mockDiversionResultState,
            mockClearDiversionsCacheAction,
        ));

        act(() => {
            jest.advanceTimersByTime(500);
        });

        expect(mockFetchDiversionsAction).toHaveBeenCalledWith('test-id', true);

        jest.useRealTimers();
    });
});

describe('useAffectedEntities', () => {
    it('should return reduxAffectedRoutes when provided', () => {
        const reduxAffectedRoutes = [
            { routeId: 'REDUX_ROUTE1', routeType: 3 },
        ];
        const disruption = {
            affectedEntities: [
                { routeId: 'DISRUPTION_ROUTE1', routeType: 3 },
            ],
        };
        const result = useAffectedEntities(disruption, reduxAffectedRoutes);
        expect(result).toEqual(reduxAffectedRoutes);
    });

    it('should return disruption.affectedEntities when reduxAffectedRoutes is empty', () => {
        const disruption = {
            affectedEntities: [
                { routeId: 'DISRUPTION_ROUTE1', routeType: 3 },
            ],
        };
        const result = useAffectedEntities(disruption, []);
        expect(result).toEqual(disruption.affectedEntities);
    });

    it('should return empty array when disruption is null', () => {
        const result = useAffectedEntities(null, []);
        expect(result).toEqual([]);
    });

    it('should handle disruption.affectedEntities.affectedRoutes (line 89)', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [
                    { routeId: 'ROUTE1', routeType: 3 },
                ],
            },
            routes: null,
            affectedRoutes: null,
        };
        const result = useAffectedEntities(disruption, []);
        expect(result).toEqual(disruption.affectedEntities.affectedRoutes);
    });

    it('should handle disruption.affectedEntities.affectedRoutes fallback (lines 88-92)', () => {
        const disruption = {
            affectedEntities: {
                affectedRoutes: [
                    { routeId: 'ROUTE1', routeType: 3 },
                ],
            },
            routes: null,
            affectedRoutes: null,
        };
        const result = useAffectedEntities(disruption, []);
        expect(result).toEqual(disruption.affectedEntities.affectedRoutes);
    });

    it('should handle disruption.routes', () => {
        const disruption = {
            routes: [
                { routeId: 'ROUTE1', routeType: 3 },
            ],
            affectedEntities: {},
        };
        const result = useAffectedEntities(disruption, []);
        expect(result).toEqual(disruption.routes);
    });

    it('should handle disruption.affectedRoutes', () => {
        const disruption = {
            affectedRoutes: [
                { routeId: 'ROUTE1', routeType: 3 },
            ],
            affectedEntities: {},
        };
        const result = useAffectedEntities(disruption, []);
        expect(result).toEqual(disruption.affectedRoutes);
    });

    it('should return empty array when all conditions fail', () => {
        const disruption = {
            affectedEntities: null,
            routes: null,
            affectedRoutes: null,
        };
        const result = useAffectedEntities(disruption, []);
        expect(result).toEqual([]);
    });
});

describe('useDiversionValidation', () => {
    const mockAffectedEntities = [
        { routeId: 'ROUTE1', routeType: 3 },
        { routeId: 'ROUTE2', routeType: 3 },
    ];

    it('should return false when disruption is null', () => {
        const result = useDiversionValidation(null, mockAffectedEntities);
        expect(result).toBe(false);
    });

    it('should return false when disruption status is resolved', () => {
        const disruption = {
            status: 'resolved',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const result = useDiversionValidation(disruption, mockAffectedEntities);
        expect(result).toBe(false);
    });

    it('should return false when no bus routes available', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const trainOnlyRoutes = [
            { routeId: 'ROUTE1', routeType: 1 },
        ];
        const result = useDiversionValidation(disruption, trainOnlyRoutes);
        expect(result).toBe(false);
    });

    it('should return true when all conditions are met', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const result = useDiversionValidation(disruption, mockAffectedEntities);
        expect(result).toBe(true);
    });

    it('should return true for draft status', () => {
        const disruption = {
            status: 'draft',
        };
        const result = useDiversionValidation(disruption, mockAffectedEntities);
        expect(result).toBe(true);
    });

    it('should return true for not-started status', () => {
        const disruption = {
            status: 'not-started',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const result = useDiversionValidation(disruption, mockAffectedEntities);
        expect(result).toBe(true);
    });

    it('should return false when all bus routes have diversions', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const diversions = [
            {
                diversionRouteVariants: [
                    { routeId: 'ROUTE1' },
                    { routeId: 'ROUTE2' },
                ],
            },
        ];
        const result = useDiversionValidation(disruption, mockAffectedEntities, diversions);
        expect(result).toBe(false);
    });

    it('should return false when status is not allowed', () => {
        const disruption = {
            status: 'cancelled',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const result = useDiversionValidation(disruption, mockAffectedEntities);
        expect(result).toBe(false);
    });

    it('should return false when startTime or endTime is missing for non-draft status', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
        };
        const result = useDiversionValidation(disruption, mockAffectedEntities);
        expect(result).toBe(false);
    });

    it('should return false when only train routes are available', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const trainOnlyRoutes = [
            { routeId: 'ROUTE1', routeType: 1 },
        ];
        const result = useDiversionValidation(disruption, trainOnlyRoutes);
        expect(result).toBe(false);
    });

    it('should return false when train routes exist but no bus routes (line 128)', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const mixedRoutes = [
            { routeId: 'ROUTE1', routeType: 1 }, // train
            { routeId: 'ROUTE2', routeType: 2 }, // other
        ];
        const result = useDiversionValidation(disruption, mixedRoutes);
        expect(result).toBe(false);
    });

    it('should return false when train routes exist but bus routes are empty (line 128 variant)', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const trainOnlyRoutes = [
            { routeId: 'ROUTE1', routeType: 1 }, // train
            { routeId: 'ROUTE2', routeType: 1 }, // train
        ];
        const result = useDiversionValidation(disruption, trainOnlyRoutes);
        expect(result).toBe(false);
    });

    it('should return true when bus routes exist with train routes', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const mixedRoutes = [
            { routeId: 'ROUTE1', routeType: 1 }, // train
            { routeId: 'ROUTE2', routeType: 3 }, // bus
        ];
        const result = useDiversionValidation(disruption, mixedRoutes);
        expect(result).toBe(true);
    });

    it('should return true when some bus routes have diversions but not all', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const diversions = [
            {
                diversionRouteVariants: [
                    { routeId: 'ROUTE1' },
                ],
            },
        ];
        const result = useDiversionValidation(disruption, mockAffectedEntities, diversions);
        expect(result).toBe(true);
    });

    it('should handle empty diversions array', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const result = useDiversionValidation(disruption, mockAffectedEntities, []);
        expect(result).toBe(true);
    });

    it('should handle null diversions', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const result = useDiversionValidation(disruption, mockAffectedEntities, null);
        expect(result).toBe(true);
    });

    it('should handle diversions with empty diversionRouteVariants', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const diversions = [
            {
                diversionRouteVariants: [],
            },
        ];
        const result = useDiversionValidation(disruption, mockAffectedEntities, diversions);
        expect(result).toBe(true);
    });

    it('should handle diversions with null diversionRouteVariants', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        const diversions = [
            {
                diversionRouteVariants: null,
            },
        ];
        const result = useDiversionValidation(disruption, mockAffectedEntities, diversions);
        expect(result).toBe(true);
    });

    it('should throw error when affectedEntities is null', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        expect(() => {
            useDiversionValidation(disruption, null);
        }).toThrow();
    });

    it('should throw error when affectedEntities is undefined', () => {
        const disruption = {
            status: 'in-progress',
            startTime: '2025-01-01T10:00:00Z',
            endTime: '2025-01-01T12:00:00Z',
        };
        expect(() => {
            useDiversionValidation(disruption, undefined);
        }).toThrow();
    });
});
