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
});
