import { ACTION_RESULT, ACTION_RESULT_TYPES } from './disruptions-types';

describe('Disruption types', () => {
    describe('PUBLISH_DRAFT_SUCCESS', () => {
        it('should return expected result', () => {
            const expectedResult = {
                resultStatus: ACTION_RESULT_TYPES.SUCCESS,
                resultMessage: 'Draft disruption number #1 published successfully.',
                resultCreateNotification: false,
                resultDisruptionVersion: 'v1',
            };
            const result = ACTION_RESULT.PUBLISH_DRAFT_SUCCESS(1, 'v1', false);
            expect(result).toEqual(expectedResult);
        });

        it('should return SUCCESS status', () => {
            const result = ACTION_RESULT.PUBLISH_DRAFT_SUCCESS(1, 'v1');
            expect(result.resultStatus).toBe(ACTION_RESULT_TYPES.SUCCESS);
        });

        it('should return the correct result message with incidentNo', () => {
            const result = ACTION_RESULT.PUBLISH_DRAFT_SUCCESS(100, 'v1');
            expect(result.resultMessage).toBe('Draft disruption number #100 published successfully.');
        });

        it('should set resultCreateNotification to true when createNotification is true', () => {
            const result = ACTION_RESULT.PUBLISH_DRAFT_SUCCESS(100, 'v1', true);
            expect(result.resultCreateNotification).toBe(true);
        });

        it('should set resultCreateNotification to false when createNotification is false', () => {
            const result = ACTION_RESULT.PUBLISH_DRAFT_SUCCESS(100, 'v1', false);
            expect(result.resultCreateNotification).toBe(false);
        });

        it('should handle default createNotification as false', () => {
            const result = ACTION_RESULT.PUBLISH_DRAFT_SUCCESS(100, 'v1');
            expect(result.resultCreateNotification).toBe(false);
        });

        it('should include the correct disruption version', () => {
            const result = ACTION_RESULT.PUBLISH_DRAFT_SUCCESS(100, 'v2');
            expect(result.resultDisruptionVersion).toBe('v2');
        });
    });

    describe('SAVE_DRAFT_SUCCESS', () => {
        it('should return expected result', () => {
            const expectedResult = {
                resultStatus: ACTION_RESULT_TYPES.SUCCESS,
                resultMessage: 'Draft disruption number #1 saved successfully.',
                resultCreateNotification: false,
            };
            const result = ACTION_RESULT.SAVE_DRAFT_SUCCESS(1, false);
            expect(result).toEqual(expectedResult);
        });

        it('should return SUCCESS status', () => {
            const result = ACTION_RESULT.SAVE_DRAFT_SUCCESS(1);
            expect(result.resultStatus).toBe(ACTION_RESULT_TYPES.SUCCESS);
        });

        it('should return the correct result message with incidentNo', () => {
            const result = ACTION_RESULT.SAVE_DRAFT_SUCCESS(100);
            expect(result.resultMessage).toBe('Draft disruption number #100 saved successfully.');
        });

        it('should set resultCreateNotification to true when createNotification is true', () => {
            const result = ACTION_RESULT.SAVE_DRAFT_SUCCESS(100, true);
            expect(result.resultCreateNotification).toBe(true);
        });

        it('should set resultCreateNotification to false when createNotification is false', () => {
            const result = ACTION_RESULT.SAVE_DRAFT_SUCCESS(100, false);
            expect(result.resultCreateNotification).toBe(false);
        });

        it('should handle default createNotification as false', () => {
            const result = ACTION_RESULT.SAVE_DRAFT_SUCCESS(100);
            expect(result.resultCreateNotification).toBe(false);
        });
    });
});
