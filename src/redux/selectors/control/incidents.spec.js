import * as selectors from './incidents';
import USER_PERMISSIONS from '../../../types/user-permissions-types';
import EDIT_TYPE from '../../../types/edit-types';

describe('Incident Selectors (Jest)', () => {
    const mockState = {
        control: {
            incidents: {
                incidents: [{ incidentId: '1' }, { incidentId: '2' }],
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
                sourceIncidentNo: '123',
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
        expect(result).toEqual([{ incidentId: '1' }, { incidentId: '2' }]);
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
