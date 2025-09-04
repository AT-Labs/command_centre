import { renderHook, act } from '@testing-library/react';
import { useDiversionsLogic, useAffectedEntities, useDiversionValidation } from './useDiversionsLogic';

describe('useDiversionsLogic - Our Custom Hook', () => {
    const mockDisruption = {
        disruptionId: 'DISR123',
        status: 'in-progress'
    };

    const mockFetchDiversionsAction = jest.fn();
    const mockClearDiversionsCacheAction = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('useDiversionsLogic - Main Hook', () => {
        it('should initialize with null anchorEl (our default state)', () => {
            const { result } = renderHook(() =>
                useDiversionsLogic(mockDisruption, mockFetchDiversionsAction, false, null, mockClearDiversionsCacheAction)
            );

            expect(result.current.anchorEl).toBeNull();
        });

        it('should set anchorEl when setAnchorEl is called (our state management)', () => {
            const { result } = renderHook(() =>
                useDiversionsLogic(mockDisruption, mockFetchDiversionsAction, false, null, mockClearDiversionsCacheAction)
            );

            const mockElement = document.createElement('div');
            act(() => {
                result.current.setAnchorEl(mockElement);
            });

            expect(result.current.anchorEl).toBe(mockElement);
        });

        it('should close dropdown when DiversionManager opens (our integration logic)', () => {
            const { result } = renderHook(() =>
                useDiversionsLogic(mockDisruption, mockFetchDiversionsAction, false, null, mockClearDiversionsCacheAction)
            );

            
            const mockElement = document.createElement('div');
            act(() => {
                result.current.setAnchorEl(mockElement);
            });

            expect(result.current.anchorEl).toBe(mockElement);

            
            const { result: result2 } = renderHook(() =>
                useDiversionsLogic(mockDisruption, mockFetchDiversionsAction, true, null, mockClearDiversionsCacheAction)
            );

            expect(result2.current.anchorEl).toBeNull();
        });

        it('should fetch diversions when component mounts (our initialization)', () => {
            renderHook(() =>
                useDiversionsLogic(mockDisruption, mockFetchDiversionsAction, false, null, mockClearDiversionsCacheAction)
            );

            expect(mockFetchDiversionsAction).toHaveBeenCalledWith('DISR123');
        });

        it('should refresh diversions when DiversionManager closes (our refresh logic)', () => {
            renderHook(() =>
                useDiversionsLogic(mockDisruption, mockFetchDiversionsAction, false, null, mockClearDiversionsCacheAction)
            );

            
            renderHook(() =>
                useDiversionsLogic(mockDisruption, mockFetchDiversionsAction, true, null, mockClearDiversionsCacheAction)
            );

            
            renderHook(() =>
                useDiversionsLogic(mockDisruption, mockFetchDiversionsAction, false, null, mockClearDiversionsCacheAction)
            );

            act(() => {
                jest.advanceTimersByTime(500);
            });

            expect(mockFetchDiversionsAction).toHaveBeenCalledWith('DISR123');
        });

        it('should handle diversion result state changes (our state monitoring)', () => {
            const mockDiversionResultState = {
                diversionId: 'DIV123',
                isLoading: false
            };

            renderHook(() =>
                useDiversionsLogic(mockDisruption, mockFetchDiversionsAction, false, mockDiversionResultState, mockClearDiversionsCacheAction)
            );

            act(() => {
                jest.advanceTimersByTime(500);
            });

            expect(mockFetchDiversionsAction).toHaveBeenCalledWith('DISR123', true);
        });
    });

    describe('useAffectedEntities - Our Entity Extraction Hook', () => {
        it('should return reduxAffectedRoutes when available (our priority logic)', () => {
            const mockReduxRoutes = [
                { routeId: 'ROUTE1', routeType: 3 },
                { routeId: 'ROUTE2', routeType: 3 }
            ];

            const result = useAffectedEntities({}, mockReduxRoutes);
            expect(result).toEqual(mockReduxRoutes);
        });

        it('should return empty array when no routes available (our fallback)', () => {
            const result = useAffectedEntities({}, []);
            expect(result).toEqual([]);
        });

        it('should handle disruption with affectedEntities array (our data structure handling)', () => {
            const mockDisruption = {
                affectedEntities: [
                    { routeId: 'ROUTE1', routeType: 3 },
                    { routeId: 'ROUTE2', routeType: 3 }
                ]
            };

            const result = useAffectedEntities(mockDisruption, []);
            expect(result).toEqual(mockDisruption.affectedEntities);
        });

        it('should handle disruption with affectedEntities.affectedRoutes (our nested structure handling)', () => {
            const mockDisruption = {
                affectedEntities: {
                    affectedRoutes: [
                        { routeId: 'ROUTE1', routeType: 3 },
                        { routeId: 'ROUTE2', routeType: 3 }
                    ]
                }
            };

            const result = useAffectedEntities(mockDisruption, []);
            expect(result).toEqual(mockDisruption.affectedEntities.affectedRoutes);
        });

        it('should handle disruption with routes property (our alternative structure)', () => {
            const mockDisruption = {
                routes: [
                    { routeId: 'ROUTE1', routeType: 3 },
                    { routeId: 'ROUTE2', routeType: 3 }
                ]
            };

            const result = useAffectedEntities(mockDisruption, []);
            expect(result).toEqual(mockDisruption.routes);
        });

        it('should return empty array when no valid routes found (our error handling)', () => {
            const result = useAffectedEntities({}, []);
            expect(result).toEqual([]);
        });
    });

    describe('useDiversionValidation - Our Validation Hook', () => {
        it('should return false when disruption is null (our null safety)', () => {
            const result = useDiversionValidation(null, [], []);
            expect(result()).toBe(false);
        });

        it('should return false when disruption is resolved (our status validation)', () => {
            const mockDisruption = { status: 'resolved' };
            const result = useDiversionValidation(mockDisruption, [], []);
            expect(result()).toBe(false);
        });

        it('should return false when status is not allowed (our status filtering)', () => {
            const mockDisruption = { status: 'cancelled' };
            const result = useDiversionValidation(mockDisruption, [], []);
            expect(result()).toBe(false);
        });

        it('should return true for allowed statuses (our allowed statuses)', () => {
            const allowedStatuses = ['not-started', 'in-progress', 'draft'];
            
            allowedStatuses.forEach(status => {
                const mockDisruption = { status };
                const mockAffectedEntities = [{ routeId: 'ROUTE1', routeType: 3 }];
                
                const result = useDiversionValidation(mockDisruption, mockAffectedEntities, []);
                expect(result()).toBe(true);
            });
        });

        it('should return false when no bus routes available (our route type validation)', () => {
            const mockDisruption = { status: 'in-progress' };
            const mockAffectedEntities = [
                { routeId: 'ROUTE1', routeType: 1 } 
            ];
            
            const result = useDiversionValidation(mockDisruption, mockAffectedEntities, []);
            expect(result()).toBe(false);
        });

        it('should return false when only train routes available (our route type filtering)', () => {
            const mockDisruption = { status: 'in-progress' };
            const mockAffectedEntities = [
                { routeId: 'ROUTE1', routeType: 1 }, 
                { routeId: 'ROUTE2', routeType: 1 }  
            ];
            
            const result = useDiversionValidation(mockDisruption, mockAffectedEntities, []);
            expect(result()).toBe(false);
        });

        it('should return true when bus routes are available (our bus route detection)', () => {
            const mockDisruption = { status: 'in-progress' };
            const mockAffectedEntities = [
                { routeId: 'ROUTE1', routeType: 3 }, 
                { routeId: 'ROUTE2', routeType: 1 }  
            ];
            
            const result = useDiversionValidation(mockDisruption, mockAffectedEntities, []);
            expect(result()).toBe(true);
        });

        it('should return false when all bus routes already have diversions (our diversion limit logic)', () => {
            const mockDisruption = { status: 'in-progress' };
            const mockAffectedEntities = [
                { routeId: 'ROUTE1', routeType: 3 }, 
                { routeId: 'ROUTE2', routeType: 3 }  
            ];
            const mockDiversions = [
                {
                    diversionRouteVariants: [
                        { routeId: 'ROUTE1' },
                        { routeId: 'ROUTE2' }
                    ]
                }
            ];
            
            const result = useDiversionValidation(mockDisruption, mockAffectedEntities, mockDiversions);
            expect(result()).toBe(false);
        });

        it('should return true when some bus routes do not have diversions (our partial diversion logic)', () => {
            const mockDisruption = { status: 'in-progress' };
            const mockAffectedEntities = [
                { routeId: 'ROUTE1', routeType: 3 }, 
                { routeId: 'ROUTE2', routeType: 3 }  
            ];
            const mockDiversions = [
                {
                    diversionRouteVariants: [
                        { routeId: 'ROUTE1' }
                    ]
                }
            ];
            
            const result = useDiversionValidation(mockDisruption, mockAffectedEntities, mockDiversions);
            expect(result()).toBe(true);
        });

        it('should handle edge cases in our validation logic', () => {
            
            const mockDisruption = { status: 'in-progress' };
            const result1 = useDiversionValidation(mockDisruption, [], []);
            expect(result1()).toBe(false);

            
            const mockDisruption2 = {};
            const mockAffectedEntities = [{ routeId: 'ROUTE1', routeType: 3 }];
            const result2 = useDiversionValidation(mockDisruption2, mockAffectedEntities, []);
            expect(result2()).toBe(false);

            
            const mockDisruption3 = { status: 'in-progress' };
            const mockAffectedEntities3 = [
                { routeId: 'ROUTE1', routeType: 999 } 
            ];
            const result3 = useDiversionValidation(mockDisruption3, mockAffectedEntities3, []);
            expect(result3()).toBe(false);
        });

        it('should handle our complex diversion scenarios', () => {
            const mockDisruption = { status: 'in-progress' };
            const mockAffectedEntities = [
                { routeId: 'ROUTE1', routeType: 3 }, 
                { routeId: 'ROUTE2', routeType: 3 }, 
                { routeId: 'ROUTE3', routeType: 1 }  
            ];
            
            
            const result1 = useDiversionValidation(mockDisruption, mockAffectedEntities, []);
            expect(result1()).toBe(true);

            
            const mockDiversions1 = [
                {
                    diversionRouteVariants: [
                        { routeId: 'ROUTE1' }
                    ]
                }
            ];
            const result2 = useDiversionValidation(mockDisruption, mockAffectedEntities, mockDiversions1);
            expect(result2()).toBe(true);

            
            const mockDiversions2 = [
                {
                    diversionRouteVariants: [
                        { routeId: 'ROUTE1' },
                        { routeId: 'ROUTE2' }
                    ]
                }
            ];
            const result3 = useDiversionValidation(mockDisruption, mockAffectedEntities, mockDiversions2);
            expect(result3()).toBe(false);
        });
    });

    describe('Hook Integration - Our Combined Logic', () => {
        it('should work together correctly (our integration)', () => {
            const mockDisruption = {
                disruptionId: 'DISR123',
                status: 'in-progress',
                affectedEntities: [
                    { routeId: 'ROUTE1', routeType: 3 },
                    { routeId: 'ROUTE2', routeType: 1 }
                ]
            };

            
            const affectedEntities = useAffectedEntities(mockDisruption, []);
            expect(affectedEntities).toEqual(mockDisruption.affectedEntities);

            
            const canCreateDiversion = useDiversionValidation(mockDisruption, affectedEntities, []);
            expect(canCreateDiversion()).toBe(true);

            
            const { result } = renderHook(() =>
                useDiversionsLogic(mockDisruption, mockFetchDiversionsAction, false, null, mockClearDiversionsCacheAction)
            );

            expect(result.current.anchorEl).toBeNull();
            expect(mockFetchDiversionsAction).toHaveBeenCalledWith('DISR123');
        });

        it('should handle our real-world scenarios', () => {
            
            const activeDisruption = {
                disruptionId: 'DISR123',
                status: 'in-progress',
                affectedEntities: [
                    { routeId: 'ROUTE1', routeType: 3 },
                    { routeId: 'ROUTE2', routeType: 3 }
                ]
            };

            const affectedEntities = useAffectedEntities(activeDisruption, []);
            const canCreateDiversion = useDiversionValidation(activeDisruption, affectedEntities, []);
            
            expect(affectedEntities).toHaveLength(2);
            expect(canCreateDiversion()).toBe(true);

            
            const resolvedDisruption = {
                ...activeDisruption,
                status: 'resolved'
            };

            const canCreateDiversionResolved = useDiversionValidation(resolvedDisruption, affectedEntities, []);
            expect(canCreateDiversionResolved()).toBe(false);

            
            const existingDiversions = [
                {
                    diversionRouteVariants: [
                        { routeId: 'ROUTE1' }
                    ]
                }
            ];

            const canCreateDiversionWithExisting = useDiversionValidation(activeDisruption, affectedEntities, existingDiversions);
            expect(canCreateDiversionWithExisting()).toBe(true);
        });
    });
}); 