/**
 * @jest-environment jsdom
 */

import { updateDisruptionWithFetchData } from './EditEffectPanelHooks';

describe('EditEffectPanelHooks', () => {
    describe('updateDisruptionWithFetchData', () => {
        it('should merge shapeWkt from current disruption into fetched disruption using Map', () => {
            // Setup current disruption with routes that have shapeWkt
            const disruption = {
                affectedEntities: {
                    affectedRoutes: [
                        {
                            routeId: '101-202',
                            routeShortName: '101',
                            routeType: 3,
                            shapeWkt: 'LINESTRING(0 0, 1 1)',
                        },
                        {
                            routeId: '105-202',
                            routeShortName: '105',
                            routeType: 3,
                            shapeWkt: 'LINESTRING(2 2, 3 3)',
                        },
                    ],
                    affectedStops: [],
                },
            };

            // Setup fetched disruption with routes that lack shapeWkt
            const fetchedDisruption = {
                affectedEntities: [
                    { routeId: '101-202', routeShortName: '101', routeType: 3 },
                    { routeId: '105-202', routeShortName: '105', routeType: 3 },
                    { routeId: '999-202', routeShortName: '999', routeType: 3 }, // Route not in current disruption
                ],
            };

            // Call the function being tested
            const result = updateDisruptionWithFetchData(fetchedDisruption, disruption);

            // Verify the structure is correct
            expect(result.affectedEntities.affectedRoutes).toEqual([
                {
                    routeId: '101-202',
                    routeShortName: '101',
                    routeType: 3,
                    shapeWkt: 'LINESTRING(0 0, 1 1)', // shapeWkt merged from current disruption
                },
                {
                    routeId: '105-202',
                    routeShortName: '105',
                    routeType: 3,
                    shapeWkt: 'LINESTRING(2 2, 3 3)', // shapeWkt merged from current disruption
                },
                {
                    routeId: '999-202',
                    routeShortName: '999',
                    routeType: 3,
                    shapeWkt: undefined, // No matching route in current disruption
                },
            ]);
        });

        it('should return null when fetchedDisruption is null', () => {
            const disruption = {
                affectedEntities: {
                    affectedRoutes: [{ routeId: '101-202', shapeWkt: 'LINESTRING(0 0, 1 1)' }],
                    affectedStops: [],
                },
            };

            // Call with null fetchedDisruption
            const result = updateDisruptionWithFetchData(null, disruption);

            // Verify it returns null (early return)
            expect(result).toBeNull();
        });
    });
});
