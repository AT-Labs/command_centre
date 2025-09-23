import { expect } from 'chai';
import diversionsReducer, { INIT_STATE } from './diversions';
import ACTION_TYPE from '../../action-types';
import EDIT_TYPE from '../../../types/edit-types';

describe('Diversions Reducer', () => {
    it('should return the initial state', () => {
        expect(diversionsReducer(undefined, {})).to.deep.equal(INIT_STATE);
    });

    describe('OPEN_DIVERSION_MANAGER', () => {
        it('should handle opening diversion manager', () => {
            const action = {
                type: ACTION_TYPE.OPEN_DIVERSION_MANAGER,
                payload: {
                    isDiversionManagerOpen: true,
                },
            };

            const expectedState = {
                ...INIT_STATE,
                isDiversionManagerOpen: true,
            };

            expect(diversionsReducer(INIT_STATE, action)).to.deep.equal(expectedState);
        });
    });

    describe('SET_DIVERSION_MANAGER_LOADING', () => {
        it('should handle setting diversion manager loading to true', () => {
            const action = {
                type: ACTION_TYPE.SET_DIVERSION_MANAGER_LOADING,
                payload: {
                    isLoading: true,
                },
            };

            const expectedState = {
                ...INIT_STATE,
                isDiversionManagerLoading: true,
            };

            expect(diversionsReducer(INIT_STATE, action)).to.deep.equal(expectedState);
        });
    });

    describe('UPDATE_DIVERSION_EDIT_MODE', () => {
        it('should handle updating diversion edit mode to CREATE', () => {
            const action = {
                type: ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE,
                payload: {
                    diversionEditMode: EDIT_TYPE.CREATE,
                },
            };

            const expectedState = {
                ...INIT_STATE,
                diversionEditMode: EDIT_TYPE.CREATE,
            };

            expect(diversionsReducer(INIT_STATE, action)).to.deep.equal(expectedState);
        });

        it('should handle updating diversion edit mode to EDIT', () => {
            const action = {
                type: ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE,
                payload: {
                    diversionEditMode: EDIT_TYPE.EDIT,
                },
            };

            const expectedState = {
                ...INIT_STATE,
                diversionEditMode: EDIT_TYPE.EDIT,
            };

            expect(diversionsReducer(INIT_STATE, action)).to.deep.equal(expectedState);
        });
    });

    describe('UPDATE_DIVERSION_TO_EDIT', () => {
        it('should handle updating diversion to edit', () => {
            const diversion = { id: '123', name: 'Test Diversion' };
            const action = {
                type: ACTION_TYPE.UPDATE_DIVERSION_TO_EDIT,
                payload: {
                    diversion,
                },
            };

            const expectedState = {
                ...INIT_STATE,
                diversion,
            };

            expect(diversionsReducer(INIT_STATE, action)).to.deep.equal(expectedState);
        });
    });

    describe('UPDATE_DIVERSION_RESULT_STATE', () => {
        it('should handle updating diversion result state with loading', () => {
            const action = {
                type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                payload: {
                    isLoading: true,
                    diversionId: null,
                    error: null,
                },
            };

            const expectedState = {
                ...INIT_STATE,
                diversionResultState: {
                    isLoading: true,
                    diversionId: null,
                    error: null,
                },
            };

            expect(diversionsReducer(INIT_STATE, action)).to.deep.equal(expectedState);
        });

        it('should handle updating diversion result state with success', () => {
            const action = {
                type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                payload: {
                    isLoading: false,
                    diversionId: '123',
                    error: null,
                },
            };

            const expectedState = {
                ...INIT_STATE,
                diversionResultState: {
                    isLoading: false,
                    diversionId: '123',
                    error: null,
                },
            };

            expect(diversionsReducer(INIT_STATE, action)).to.deep.equal(expectedState);
        });

        it('should handle updating diversion result state with error', () => {
            const error = new Error('Test error');
            const action = {
                type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                payload: {
                    isLoading: false,
                    diversionId: null,
                    error,
                },
            };

            const expectedState = {
                ...INIT_STATE,
                diversionResultState: {
                    isLoading: false,
                    diversionId: null,
                    error,
                },
            };

            expect(diversionsReducer(INIT_STATE, action)).to.deep.equal(expectedState);
        });
    });

    describe('FETCH_DIVERSIONS_START', () => {
        it('should handle fetch diversions start', () => {
            const disruptionId = '123';
            const action = {
                type: ACTION_TYPE.FETCH_DIVERSIONS_START,
                payload: { disruptionId },
            };

            const expectedState = {
                ...INIT_STATE,
                diversionsLoading: {
                    [disruptionId]: true,
                },
                diversionsError: {
                    [disruptionId]: null,
                },
            };

            expect(diversionsReducer(INIT_STATE, action)).to.deep.equal(expectedState);
        });
    });

    describe('FETCH_DIVERSIONS_SUCCESS', () => {
        it('should handle fetch diversions success', () => {
            const disruptionId = '123';
            const diversions = [{ id: '1' }, { id: '2' }];
            const action = {
                type: ACTION_TYPE.FETCH_DIVERSIONS_SUCCESS,
                payload: { disruptionId, diversions },
            };

            const expectedState = {
                ...INIT_STATE,
                diversionsData: {
                    [disruptionId]: diversions,
                },
                diversionsLoading: {
                    [disruptionId]: false,
                },
                diversionsError: {
                    [disruptionId]: null,
                },
            };

            expect(diversionsReducer(INIT_STATE, action)).to.deep.equal(expectedState);
        });
    });

    describe('FETCH_DIVERSIONS_ERROR', () => {
        it('should handle fetch diversions error', () => {
            const disruptionId = '123';
            const error = 'Network error';
            const action = {
                type: ACTION_TYPE.FETCH_DIVERSIONS_ERROR,
                payload: { disruptionId, error },
            };

            const expectedState = {
                ...INIT_STATE,
                diversionsLoading: {
                    [disruptionId]: false,
                },
                diversionsError: {
                    [disruptionId]: error,
                },
            };

            expect(diversionsReducer(INIT_STATE, action)).to.deep.equal(expectedState);
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

            const expectedState = {
                ...initialState,
                diversionsData: {
                    456: [{ id: '2' }],
                },
                diversionsLoading: {
                    456: true,
                },
                diversionsError: {
                    456: 'error',
                },
            };

            expect(diversionsReducer(initialState, action)).to.deep.equal(expectedState);
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

            const expectedState = {
                ...INIT_STATE,
                diversionsData: {},
                diversionsLoading: {},
                diversionsError: {},
            };

            expect(diversionsReducer(initialState, action)).to.deep.equal(expectedState);
        });
    });

    describe('Diversion Flow Access Integration', () => {
        it('should maintain state consistency during complex diversion flow', () => {
            let state = INIT_STATE;

            const openManagerAction = {
                type: ACTION_TYPE.OPEN_DIVERSION_MANAGER,
                payload: { isDiversionManagerOpen: true },
            };
            state = diversionsReducer(state, openManagerAction);

            const setModeAction = {
                type: ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE,
                payload: { diversionEditMode: EDIT_TYPE.CREATE },
            };
            state = diversionsReducer(state, setModeAction);

            const setLoadingAction = {
                type: ACTION_TYPE.SET_DIVERSION_MANAGER_LOADING,
                payload: { isLoading: true },
            };
            state = diversionsReducer(state, setLoadingAction);

            expect(state.isDiversionManagerOpen).to.equal(true);
            expect(state.diversionEditMode).to.equal(EDIT_TYPE.CREATE);
            expect(state.isDiversionManagerLoading).to.equal(true);

            const closeManagerAction = {
                type: ACTION_TYPE.OPEN_DIVERSION_MANAGER,
                payload: { isDiversionManagerOpen: false },
            };
            state = diversionsReducer(state, closeManagerAction);

            expect(state.isDiversionManagerOpen).to.equal(false);
            expect(state.diversionEditMode).to.equal(EDIT_TYPE.CREATE);
            expect(state.isDiversionManagerLoading).to.equal(true);
        });
    });
});
