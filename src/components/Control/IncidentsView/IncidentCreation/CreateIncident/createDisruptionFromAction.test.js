import { DEFAULT_IMPACT, DISRUPTION_TYPE, STATUSES } from '../../../../../types/disruptions-types';

const createDisruptionFromAction = (incidentData, resultIncidentId) => {
    const firstDisruption = incidentData.disruptions[0] || {};
    
    return {
        key: resultIncidentId,
        incidentNo: resultIncidentId,
        startTime: incidentData.startTime,
        startDate: incidentData.startDate,
        endTime: incidentData.endTime,
        endDate: incidentData.endDate,
        impact: firstDisruption.impact || DEFAULT_IMPACT.value,
        cause: incidentData.cause,
        affectedEntities: firstDisruption.affectedEntities || {
            affectedRoutes: [],
            affectedStops: [],
        },
        createNotification: false,
        disruptionType: firstDisruption.disruptionType || DISRUPTION_TYPE.ROUTES,
        severity: incidentData.severity,
        recurrent: incidentData.recurrent,
        duration: incidentData.duration,
        recurrencePattern: incidentData.recurrencePattern,
        header: incidentData.header,
        status: STATUSES.NOT_STARTED,
    };
};

describe('createDisruptionFromAction', () => {
    const mockIncidentData = {
        startTime: '10:00',
        startDate: '2024-01-01',
        endTime: '11:00',
        endDate: '2024-01-01',
        cause: 'Test Cause',
        severity: 'SERIOUS',
        recurrent: false,
        duration: '60',
        recurrencePattern: { freq: 2 },
        header: 'Test Header',
        disruptions: [
            {
                impact: 'CATASTROPHIC',
                affectedEntities: {
                    affectedRoutes: ['route1'],
                    affectedStops: ['stop1'],
                },
                disruptionType: 'Stops',
            },
        ],
    };

    it('should create disruption with all required fields', () => {
        const resultIncidentId = 'TEST-123';
        const result = createDisruptionFromAction(mockIncidentData, resultIncidentId);

        expect(result).toEqual({
            key: resultIncidentId,
            incidentNo: resultIncidentId,
            startTime: '10:00',
            startDate: '2024-01-01',
            endTime: '11:00',
            endDate: '2024-01-01',
            impact: 'CATASTROPHIC',
            cause: 'Test Cause',
            affectedEntities: {
                affectedRoutes: ['route1'],
                affectedStops: ['stop1'],
            },
            createNotification: false,
            disruptionType: 'Stops',
            severity: 'SERIOUS',
            recurrent: false,
            duration: '60',
            recurrencePattern: { freq: 2 },
            header: 'Test Header',
            status: STATUSES.NOT_STARTED,
        });
    });

    it('should use default values when first disruption is empty', () => {
        const incidentDataWithoutDisruptions = {
            ...mockIncidentData,
            disruptions: [],
        };
        const resultIncidentId = 'TEST-456';
        const result = createDisruptionFromAction(incidentDataWithoutDisruptions, resultIncidentId);

        expect(result.impact).toBe(DEFAULT_IMPACT.value);
        expect(result.affectedEntities).toEqual({
            affectedRoutes: [],
            affectedStops: [],
        });
        expect(result.disruptionType).toBe(DISRUPTION_TYPE.ROUTES);
    });

    it('should handle null/undefined first disruption gracefully', () => {
        const incidentDataWithNullDisruption = {
            ...mockIncidentData,
            disruptions: [null],
        };
        const resultIncidentId = 'TEST-789';
        const result = createDisruptionFromAction(incidentDataWithNullDisruption, resultIncidentId);

        expect(result.impact).toBe(DEFAULT_IMPACT.value);
        expect(result.affectedEntities).toEqual({
            affectedRoutes: [],
            affectedStops: [],
        });
        expect(result.disruptionType).toBe(DISRUPTION_TYPE.ROUTES);
    });

    it('should preserve all incident data fields', () => {
        const resultIncidentId = 'TEST-999';
        const result = createDisruptionFromAction(mockIncidentData, resultIncidentId);

        expect(result.startTime).toBe(mockIncidentData.startTime);
        expect(result.startDate).toBe(mockIncidentData.startDate);
        expect(result.endTime).toBe(mockIncidentData.endTime);
        expect(result.endDate).toBe(mockIncidentData.endDate);
        expect(result.cause).toBe(mockIncidentData.cause);
        expect(result.severity).toBe(mockIncidentData.severity);
        expect(result.recurrent).toBe(mockIncidentData.recurrent);
        expect(result.duration).toBe(mockIncidentData.duration);
        expect(result.recurrencePattern).toEqual(mockIncidentData.recurrencePattern);
        expect(result.header).toBe(mockIncidentData.header);
    });
}); 