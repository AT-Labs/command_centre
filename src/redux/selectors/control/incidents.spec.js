import * as selectors from './incidents';
import USER_PERMISSIONS from '../../../types/user-permissions-types';
import EDIT_TYPE from '../../../types/edit-types';
import { getJSONFromWKT } from '../../../utils/helpers';

jest.mock('../../../utils/helpers', () => ({
    getJSONFromWKT: jest.fn(),
}));

describe('Incident Selectors', () => {
    const mockState = {
        control: {
            incidents: {
                incidents: [{ incidentId: '1', impact: 'test 1' }, { incidentId: '2', impact: 'test 2' }],
                disruptions: [
                    {
                        disruptionId: '1',
                        incidentId: '1',
                        affectedEntities: [{ routeId: 'A' }],
                        status: 'active',
                        startTime: '2024-01-01',
                        endTime: '2025-01-01',
                        impact: 'high',
                    },
                ],
                sortingParams: { sortBy: 'incidentId', order: 'asc' },
                permissions: [{ _rel: USER_PERMISSIONS.DISRUPTIONS.ADD_DISRUPTION }],
                isLoading: false,
                filters: {
                    selectedEntity: { data: { route_id: 'A' } },
                    selectedStatus: 'active',
                    selectedStartDate: '2024-12-31',
                    selectedEndDate: '2025-12-31',
                    selectedImpact: 'high',
                },
                activeDisruptionId: '1',
                disruptionToEdit: { incidentId: '1' },
                action: { isRequesting: true, resultStatus: 'success', resultMessage: 'Saved' },
                activeStep: 1,
                cachedShapes: [],
                editMode: EDIT_TYPE.EDIT,
                sourceIncidentId: '123',
                affectedEntities: {
                    affectedStops: [],
                    affectedRoutes: [],
                },
                datagridConfig: { visibleColumns: ['incidentId'] },
            },
        },
    };

    it('should get grouped incidents', () => {
        const result = selectors.getGroupedIncidents(mockState);
        expect(result).toEqual([{ impact: 'test 1', incidentId: '1' }, { impact: 'test 2', incidentId: '2' }]);
    });

    it('should get incident creation permission', () => {
        const result = selectors.isIncidentCreationAllowed(mockState);
        expect(result).toBe(true);
    });

    it('should get active disruption', () => {
        const result = selectors.getActiveDisruptionId(mockState);
        expect(result).toBe('1');
    });

    it('should get filters and apply them', () => {
        const result = selectors.getFilteredDisruptions(mockState);
        expect(result).toHaveLength(1);
        expect(result[0].incidentId).toBe('1');
    });

    it('should get merged incidents', () => {
        const result = selectors.getFilteredIncidents(mockState);
        expect(result).toHaveLength(1);
        expect(result[0].incidentId).toBe('1');
        expect(result[0].impact).toBe('high');
    });

    it('should get sorted incidents', () => {
        const result = selectors.getSortedIncidents(mockState);
        expect(result[0].incidentId).toBe('1');
    });

    it('should determine edit mode is enabled', () => {
        const result = selectors.isEditEnabled(mockState);
        expect(result).toBe(true);
    });

    it('should get incident action result', () => {
        const result = selectors.getIncidentActionResult(mockState);
        expect(result).toEqual({
            resultStatus: 'success',
            resultMessage: 'Saved',
        });
    });

    it('should get incident action requesting state', () => {
        const result = selectors.getIncidentActionState(mockState);
        expect(result).toBe(true);
    });

    it('should return undefined for getActiveIncident if not matched', () => {
        const noActive = {
            ...mockState,
            control: {
                ...mockState.control,
                incidents: {
                    ...mockState.control.incidents,
                    activeIncidentId: 'non-existent',
                },
            },
        };
        const result = selectors.getActiveIncident(noActive);
        expect(result).toBeUndefined();
    });
});

describe('Incident Selectors getRouteColors', () => {
    const getState = (affectedRoutes = [], affectedStops = []) => ({
        incidents: {
            affectedRoutes,
            affectedStops,
        },
    });

    it('returns an array of route colors when routes and stops have colors', () => {
        const state = getState(
            [{ routeId: '1', routeColor: 'red' }],
            [{ routeId: '2', routeColor: 'blue' }],
        );
        expect(selectors.getRouteColors.resultFunc(state.incidents.affectedRoutes, state.incidents.affectedStops)).toEqual(['red', 'blue']);
    });

    it('returns null in array if routeColor is missing', () => {
        const state = getState(
            [{ routeId: '1', routeColor: 'red' }],
            [{ routeId: '2' }],
        );
        expect(selectors.getRouteColors.resultFunc(state.incidents.affectedRoutes, state.incidents.affectedStops)).toEqual(['red', null]);
    });

    it('filters out stops without routeId', () => {
        const state = getState(
            [],
            [{ stopId: '123' }], // no routeId
        );
        expect(selectors.getRouteColors.resultFunc(state.incidents.affectedRoutes, state.incidents.affectedStops)).toEqual([]);
    });

    it('returns empty array if input arrays are empty', () => {
        const state = getState([], []);
        expect(selectors.getRouteColors.resultFunc(state.incidents.affectedRoutes, state.incidents.affectedStops)).toEqual([]);
    });

    it('deduplicates by routeId', () => {
        const state = getState(
            [{ routeId: '1', routeColor: 'red' }],
            [
                { routeId: '1', routeColor: 'red' }, // duplicate
                { routeId: '2', routeColor: 'blue' },
            ],
        );
        expect(selectors.getRouteColors.resultFunc(state.incidents.affectedRoutes, state.incidents.affectedStops)).toEqual(['red', 'blue']);
    });
});

describe('Incident Selectors getBoundsToFit', () => {
    const getState = (shapes = []) => ({
        incidents: {
            shapes,
        },
    });

    it('returns all non-null/undefined shapes', () => {
        const state = getState([{ id: 1 }, { id: 2 }]);
        expect(selectors.getBoundsToFit.resultFunc(state.incidents.shapes)).toEqual([{ id: 1 }, { id: 2 }]);
    });

    it('filters out falsy shapes', () => {
        const state = getState([null, undefined, false, { id: 3 }]);
        expect(selectors.getBoundsToFit.resultFunc(state.incidents.shapes)).toEqual([{ id: 3 }]);
    });

    it('returns empty array if no shapes', () => {
        const state = getState([]);
        expect(selectors.getBoundsToFit.resultFunc(state.incidents.shapes)).toEqual([]);
    });

    it('returns empty array if shapes is null', () => {
        const state = getState(null);
        expect(selectors.getBoundsToFit.resultFunc(state.incidents.shapes)).toEqual([]);
    });
});

describe('Incident Selectors getShapes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns coordinates for routes with shapeWkt', () => {
        const affectedRoutes = [
            { routeId: '1', shapeWkt: 'LINESTRING (1 2, 3 4)' },
        ];
        const affectedStops = [];

        getJSONFromWKT.mockReturnValueOnce({
            coordinates: [
                [1, 2],
                [3, 4],
            ],
        });

        const result = selectors.getShapes.resultFunc(affectedRoutes, affectedStops);
        expect(getJSONFromWKT).toHaveBeenCalledWith('LINESTRING (1 2, 3 4)');
        expect(result).toEqual([[[2, 1], [4, 3]]]); // reversed coordinates
    });

    it('returns null for routes without shapeWkt', () => {
        const affectedRoutes = [
            { routeId: '1' }, // no shapeWkt
        ];
        const affectedStops = [];

        const result = selectors.getShapes.resultFunc(affectedRoutes, affectedStops);
        expect(result).toEqual([null]);
    });

    it('filters out stops without routeId', () => {
        const affectedRoutes = [];
        const affectedStops = [
            { stopId: 'stop1' }, // no routeId
            { stopId: 'stop2', routeId: '2', shapeWkt: 'LINESTRING (5 6, 7 8)' },
        ];

        getJSONFromWKT.mockReturnValueOnce({
            coordinates: [
                [5, 6],
                [7, 8],
            ],
        });

        const result = selectors.getShapes.resultFunc(affectedRoutes, affectedStops);
        expect(result).toEqual([[[6, 5], [8, 7]]]);
    });

    it('handles mixed routes with and without shapeWkt', () => {
        const affectedRoutes = [
            { routeId: '1', shapeWkt: 'LINESTRING (1 1, 2 2)' },
            { routeId: '2' }, // no shapeWkt
        ];
        const affectedStops = [];

        getJSONFromWKT.mockReturnValueOnce({
            coordinates: [
                [1, 1],
                [2, 2],
            ],
        });

        const result = selectors.getShapes.resultFunc(affectedRoutes, affectedStops);
        expect(result).toEqual([[[1, 1], [2, 2]], null]);
    });

    it('returns empty array when no affected routes or stops', () => {
        const result = selectors.getShapes.resultFunc([], []);
        expect(result).toEqual([]);
    });
});
