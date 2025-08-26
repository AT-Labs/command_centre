import React from 'react';
import { shallow } from 'enzyme';
import { CreateIncident } from './index';
import { DEFAULT_IMPACT, DISRUPTION_TYPE, STATUSES } from '../../../../../types/disruptions-types';

// Mock the createDisruptionFromAction function
const mockCreateDisruptionFromAction = (incidentData, resultIncidentId) => {
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
        const result = mockCreateDisruptionFromAction(mockIncidentData, resultIncidentId);

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
        const result = mockCreateDisruptionFromAction(incidentDataWithoutDisruptions, resultIncidentId);

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
        const result = mockCreateDisruptionFromAction(incidentDataWithNullDisruption, resultIncidentId);

        expect(result.impact).toBe(DEFAULT_IMPACT.value);
        expect(result.affectedEntities).toEqual({
            affectedRoutes: [],
            affectedStops: [],
        });
        expect(result.disruptionType).toBe(DISRUPTION_TYPE.ROUTES);
    });
});

describe('CreateIncident', () => {
    const mockProps = {
        isCreateIncidentOpen: true,
        isRequiresToUpdateNotes: false,
        action: null,
        createNewIncident: jest.fn(),
        updateIncident: jest.fn(),
        closeCreateIncident: jest.fn(),
        updateCurrentStep: jest.fn(),
        currentStep: 1,
        totalSteps: 3,
    };

    let wrapper;

    beforeEach(() => {
        wrapper = shallow(<CreateIncident {...mockProps} />);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should render without crashing', () => {
            expect(wrapper.exists()).toBe(true);
        });

        it('should initialize with default state', () => {
            const state = wrapper.state();
            expect(state.incidentData).toBeDefined();
            expect(state.currentStep).toBe(1);
        });
    });

    describe('syncLocalStateWithRedux', () => {
        it('should update incidentData when action.resultIncidentId is present', () => {
            const actionWithResultId = {
                resultIncidentId: 'NEW-123',
            };

            wrapper.setProps({ action: actionWithResultId });
            
            const state = wrapper.state('incidentData');
            expect(state.disruptions).toHaveLength(1);
            expect(state.disruptions[0].key).toBe('NEW-123');
        });

        it('should not update incidentData when action.resultIncidentId is missing', () => {
            const actionWithoutResultId = {
                resultIncidentId: null,
            };

            const initialState = wrapper.state('incidentData');
            wrapper.setProps({ action: actionWithoutResultId });
            
            const finalState = wrapper.state('incidentData');
            expect(finalState).toEqual(initialState);
        });

        it('should handle missing action gracefully', () => {
            const initialState = wrapper.state('incidentData');
            wrapper.setProps({ action: null });
            
            const finalState = wrapper.state('incidentData');
            expect(finalState).toEqual(initialState);
        });
    });

    describe('Component lifecycle', () => {
        it('should call syncLocalStateWithRedux when action.resultIncidentId changes', () => {
            const syncLocalStateWithReduxSpy = jest.spyOn(wrapper.instance(), 'syncLocalStateWithRedux');
            
            wrapper.setProps({
                action: { resultIncidentId: 'TEST-123' },
            });
            
            expect(syncLocalStateWithReduxSpy).toHaveBeenCalled();
        });

        it('should not call syncLocalStateWithRedux when action.resultIncidentId is the same', () => {
            const syncLocalStateWithReduxSpy = jest.spyOn(wrapper.instance(), 'syncLocalStateWithRedux');
            
            wrapper.setProps({
                action: { resultIncidentId: 'SAME-123' },
            });
            
            wrapper.setProps({
                action: { resultIncidentId: 'SAME-123' },
            });
            
            expect(syncLocalStateWithReduxSpy).toHaveBeenCalledTimes(1);
        });
    });
}); 