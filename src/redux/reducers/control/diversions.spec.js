import { expect } from 'chai';
import diversionsReducer, { INIT_STATE } from './diversions';
import ACTION_TYPE from '../../action-types';
import EDIT_TYPE from '../../../types/edit-types';

describe('Diversions Reducer', () => {
    it('should return the initial state', () => {
        expect(diversionsReducer(undefined, {})).to.deep.equal(INIT_STATE);
    });

    describe('Simple Actions', () => {
        it('should handle OPEN_DIVERSION_MANAGER', () => {
            const action = {
                type: ACTION_TYPE.OPEN_DIVERSION_MANAGER,
                payload: { isDiversionManagerOpen: true },
            };

            const result = diversionsReducer(INIT_STATE, action);
            expect(result.isDiversionManagerOpen).to.equal(true);
        });

        it('should handle UPDATE_DIVERSION_EDIT_MODE', () => {
            const createAction = {
                type: ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE,
                payload: { diversionEditMode: EDIT_TYPE.CREATE },
            };
            const editAction = {
                type: ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE,
                payload: { diversionEditMode: EDIT_TYPE.EDIT },
            };

            expect(diversionsReducer(INIT_STATE, createAction).diversionEditMode).to.equal(EDIT_TYPE.CREATE);
            expect(diversionsReducer(INIT_STATE, editAction).diversionEditMode).to.equal(EDIT_TYPE.EDIT);
        });

        it('should handle UPDATE_DIVERSION_TO_EDIT', () => {
            const diversion = { id: '123', name: 'Test Diversion' };
            const action = {
                type: ACTION_TYPE.UPDATE_DIVERSION_TO_EDIT,
                payload: { diversion },
            };

            expect(diversionsReducer(INIT_STATE, action).diversion).to.deep.equal(diversion);
        });

        it('should handle UPDATE_DIVERSION_RESULT_STATE', () => {
            const loadingAction = {
                type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                payload: { isLoading: true, diversionId: null, error: null },
            };
            const successAction = {
                type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                payload: { isLoading: false, diversionId: '123', error: null },
            };
            const errorAction = {
                type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                payload: { isLoading: false, diversionId: null, error: new Error('Test error') },
            };

            expect(diversionsReducer(INIT_STATE, loadingAction).diversionResultState.isLoading).to.equal(true);
            expect(diversionsReducer(INIT_STATE, successAction).diversionResultState.diversionId).to.equal('123');
            expect(diversionsReducer(INIT_STATE, errorAction).diversionResultState.error).to.be.instanceOf(Error);
        });
    });

    describe('Fetch Actions', () => {
        it('should handle FETCH_DIVERSIONS_START', () => {
            const disruptionId = '123';
            const action = {
                type: ACTION_TYPE.FETCH_DIVERSIONS_START,
                payload: { disruptionId },
            };

            const result = diversionsReducer(INIT_STATE, action);
            expect(result.diversionsLoading[disruptionId]).to.equal(true);
            expect(result.diversionsError[disruptionId]).to.equal(null);
        });

        it('should handle FETCH_DIVERSIONS_SUCCESS', () => {
            const disruptionId = '123';
            const diversions = [{ id: '1' }, { id: '2' }];
            const action = {
                type: ACTION_TYPE.FETCH_DIVERSIONS_SUCCESS,
                payload: { disruptionId, diversions },
            };

            const result = diversionsReducer(INIT_STATE, action);
            expect(result.diversionsData[disruptionId]).to.deep.equal(diversions);
            expect(result.diversionsLoading[disruptionId]).to.equal(false);
            expect(result.diversionsError[disruptionId]).to.equal(null);
        });

        it('should handle FETCH_DIVERSIONS_ERROR', () => {
            const disruptionId = '123';
            const error = 'Network error';
            const action = {
                type: ACTION_TYPE.FETCH_DIVERSIONS_ERROR,
                payload: { disruptionId, error },
            };

            const result = diversionsReducer(INIT_STATE, action);
            expect(result.diversionsLoading[disruptionId]).to.equal(false);
            expect(result.diversionsError[disruptionId]).to.equal(error);
        });
    });

    describe('CLEAR_DIVERSIONS_CACHE', () => {
        it('should handle clearing diversions cache for specific disruption', () => {
            const disruptionId = '123';
            const initialState = {
                ...INIT_STATE,
                diversionsData: {
                    [disruptionId]: [{ id: '1' }],
                    456: [{ id: '2' }],
                },
                diversionsLoading: {
                    [disruptionId]: false,
                    456: true,
                },
                diversionsError: {
                    [disruptionId]: null,
                    456: 'error',
                },
            };

            const action = {
                type: ACTION_TYPE.CLEAR_DIVERSIONS_CACHE,
                payload: { disruptionId },
            };

            const result = diversionsReducer(initialState, action);
            // eslint-disable-next-line no-unused-expressions
            expect(result.diversionsData[disruptionId]).to.be.undefined;
            // eslint-disable-next-line no-unused-expressions
            expect(result.diversionsData[456]).to.deep.equal([{ id: '2' }]);
            // eslint-disable-next-line no-unused-expressions
            expect(result.diversionsLoading[disruptionId]).to.be.undefined;
            // eslint-disable-next-line no-unused-expressions
            expect(result.diversionsError[disruptionId]).to.be.undefined;
        });

        it('should handle clearing all diversions cache when disruptionId is null', () => {
            const initialState = {
                ...INIT_STATE,
                diversionsData: {
                    123: [{ id: '1' }],
                    456: [{ id: '2' }],
                },
                diversionsLoading: {
                    123: false,
                    456: true,
                },
                diversionsError: {
                    123: null,
                    456: 'error',
                },
            };

            const action = {
                type: ACTION_TYPE.CLEAR_DIVERSIONS_CACHE,
                payload: { disruptionId: null },
            };

            const result = diversionsReducer(initialState, action);
            expect(result.diversionsData).to.deep.equal({});
            expect(result.diversionsLoading).to.deep.equal({});
            expect(result.diversionsError).to.deep.equal({});
        });
    });
});
