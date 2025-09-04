import diversionsReducer, { INIT_STATE } from './diversions';
import {
    OPEN_DIVERSION_MANAGER,
    CLOSE_DIVERSION_MANAGER,
    UPDATE_DIVERSION_MODE,
    UPDATE_DIVERSION_TO_EDIT,
    FETCH_DIVERSIONS_REQUEST,
    FETCH_DIVERSIONS_SUCCESS,
    FETCH_DIVERSIONS_FAILURE,
    CREATE_DIVERSION_REQUEST,
    CREATE_DIVERSION_SUCCESS,
    CREATE_DIVERSION_FAILURE,
    UPDATE_DIVERSION_REQUEST,
    UPDATE_DIVERSION_SUCCESS,
    UPDATE_DIVERSION_FAILURE,
    DELETE_DIVERSION_REQUEST,
    DELETE_DIVERSION_SUCCESS,
    DELETE_DIVERSION_FAILURE,
    CLEAR_DIVERSIONS_CACHE,
    SET_DIVERSION_RESULT_STATE,
    CLEAR_DIVERSION_RESULT_STATE
} from '../../action-types';

describe('Diversions Reducer', () => {
    let initialState;

    beforeEach(() => {
        initialState = { ...INIT_STATE };
    });

    it('should return initial state', () => {
        expect(diversionsReducer(undefined, {})).toEqual(INIT_STATE);
    });

    it('should return current state for unknown action', () => {
        const currentState = { ...INIT_STATE, isDiversionManagerOpen: true };
        expect(diversionsReducer(currentState, { type: 'UNKNOWN_ACTION' })).toEqual(currentState);
    });

    describe('OPEN_DIVERSION_MANAGER', () => {
        it('should set isDiversionManagerOpen to true', () => {
            const action = { type: OPEN_DIVERSION_MANAGER, payload: true };
            const newState = diversionsReducer(initialState, action);

            expect(newState.isDiversionManagerOpen).toBe(true);
        });

        it('should set isDiversionManagerOpen to false', () => {
            const action = { type: OPEN_DIVERSION_MANAGER, payload: false };
            const newState = diversionsReducer(initialState, action);

            expect(newState.isDiversionManagerOpen).toBe(false);
        });
    });

    describe('CLOSE_DIVERSION_MANAGER', () => {
        it('should set isDiversionManagerOpen to false', () => {
            initialState.isDiversionManagerOpen = true;
            const action = { type: CLOSE_DIVERSION_MANAGER };
            const newState = diversionsReducer(initialState, action);

            expect(newState.isDiversionManagerOpen).toBe(false);
        });
    });

    describe('UPDATE_DIVERSION_MODE', () => {
        it('should update diversionMode', () => {
            const action = { type: UPDATE_DIVERSION_MODE, payload: 'EDIT' };
            const newState = diversionsReducer(initialState, action);

            expect(newState.diversionMode).toBe('EDIT');
        });

        it('should handle different modes', () => {
            const modes = ['CREATE', 'EDIT', 'VIEW'];
            
            modes.forEach(mode => {
                const action = { type: UPDATE_DIVERSION_MODE, payload: mode };
                const newState = diversionsReducer(initialState, action);
                expect(newState.diversionMode).toBe(mode);
            });
        });
    });

    describe('UPDATE_DIVERSION_TO_EDIT', () => {
        it('should set diversionToEdit', () => {
            const diversion = { diversionId: 'DIV123', diversionName: 'Test' };
            const action = { type: UPDATE_DIVERSION_TO_EDIT, payload: diversion };
            const newState = diversionsReducer(initialState, action);

            expect(newState.diversionToEdit).toEqual(diversion);
        });

        it('should clear diversionToEdit when payload is null', () => {
            initialState.diversionToEdit = { diversionId: 'DIV123' };
            const action = { type: UPDATE_DIVERSION_TO_EDIT, payload: null };
            const newState = diversionsReducer(initialState, action);

            expect(newState.diversionToEdit).toBeNull();
        });
    });

    describe('FETCH_DIVERSIONS_REQUEST', () => {
        it('should set loading state for specific disruption', () => {
            const action = { type: FETCH_DIVERSIONS_REQUEST, payload: 'DISR123' };
            const newState = diversionsReducer(initialState, action);

            expect(newState.loadingStates.DISR123).toBe(true);
        });
    });

    describe('FETCH_DIVERSIONS_SUCCESS', () => {
        it('should update diversions for disruption and clear loading state', () => {
            const diversions = [
                { diversionId: 'DIV1', diversionName: 'Diversion 1' },
                { diversionId: 'DIV2', diversionName: 'Diversion 2' }
            ];

            const action = {
                type: FETCH_DIVERSIONS_SUCCESS,
                payload: {
                    disruptionId: 'DISR123',
                    diversions
                }
            };

            initialState.loadingStates.DISR123 = true;
            const newState = diversionsReducer(initialState, action);

            expect(newState.diversionsForDisruption.DISR123).toEqual(diversions);
            expect(newState.loadingStates.DISR123).toBe(false);
        });

        it('should handle multiple disruptions', () => {
            const diversions1 = [{ diversionId: 'DIV1' }];
            const diversions2 = [{ diversionId: 'DIV2' }];

            let newState = diversionsReducer(initialState, {
                type: FETCH_DIVERSIONS_SUCCESS,
                payload: { disruptionId: 'DISR1', diversions: diversions1 }
            });

            newState = diversionsReducer(newState, {
                type: FETCH_DIVERSIONS_SUCCESS,
                payload: { disruptionId: 'DISR2', diversions: diversions2 }
            });

            expect(newState.diversionsForDisruption.DISR1).toEqual(diversions1);
            expect(newState.diversionsForDisruption.DISR2).toEqual(diversions2);
        });
    });

    describe('FETCH_DIVERSIONS_FAILURE', () => {
        it('should clear loading state and set error for disruption', () => {
            const action = {
                type: FETCH_DIVERSIONS_FAILURE,
                payload: {
                    disruptionId: 'DISR123',
                    error: 'Fetch failed'
                }
            };

            initialState.loadingStates.DISR123 = true;
            const newState = diversionsReducer(initialState, action);

            expect(newState.loadingStates.DISR123).toBe(false);
            expect(newState.errors.DISR123).toBe('Fetch failed');
        });
    });

    describe('CREATE_DIVERSION_REQUEST', () => {
        it('should set isLoading to true', () => {
            const action = { type: CREATE_DIVERSION_REQUEST, payload: {} };
            const newState = diversionsReducer(initialState, action);

            expect(newState.isLoading).toBe(true);
        });
    });

    describe('CREATE_DIVERSION_SUCCESS', () => {
        it('should set isLoading to false and update diversionResultState', () => {
            const diversion = { diversionId: 'DIV123', diversionName: 'Test' };
            const action = { type: CREATE_DIVERSION_SUCCESS, payload: diversion };
            const newState = diversionsReducer(initialState, action);

            expect(newState.isLoading).toBe(false);
            expect(newState.diversionResultState).toEqual({
                diversionId: 'DIV123',
                isLoading: false,
                isSuccess: true,
                error: null
            });
        });
    });

    describe('CREATE_DIVERSION_FAILURE', () => {
        it('should set isLoading to false and update diversionResultState with error', () => {
            const error = 'Creation failed';
            const action = { type: CREATE_DIVERSION_FAILURE, payload: { error } };
            const newState = diversionsReducer(initialState, action);

            expect(newState.isLoading).toBe(false);
            expect(newState.diversionResultState).toEqual({
                diversionId: null,
                isLoading: false,
                isSuccess: false,
                error: 'Creation failed'
            });
        });
    });

    describe('UPDATE_DIVERSION_REQUEST', () => {
        it('should set isLoading to true', () => {
            const action = { type: UPDATE_DIVERSION_REQUEST, payload: {} };
            const newState = diversionsReducer(initialState, action);

            expect(newState.isLoading).toBe(true);
        });
    });

    describe('UPDATE_DIVERSION_SUCCESS', () => {
        it('should set isLoading to false and update diversionResultState', () => {
            const diversion = { diversionId: 'DIV123', diversionName: 'Updated' };
            const action = { type: UPDATE_DIVERSION_SUCCESS, payload: diversion };
            const newState = diversionsReducer(initialState, action);

            expect(newState.isLoading).toBe(false);
            expect(newState.diversionResultState).toEqual({
                diversionId: 'DIV123',
                isLoading: false,
                isSuccess: true,
                error: null
            });
        });
    });

    describe('UPDATE_DIVERSION_FAILURE', () => {
        it('should set isLoading to false and update diversionResultState with error', () => {
            const error = 'Update failed';
            const action = { type: UPDATE_DIVERSION_FAILURE, payload: { error } };
            const newState = diversionsReducer(initialState, action);

            expect(newState.isLoading).toBe(false);
            expect(newState.diversionResultState).toEqual({
                diversionId: null,
                isLoading: false,
                isSuccess: false,
                error: 'Update failed'
            });
        });
    });

    describe('DELETE_DIVERSION_REQUEST', () => {
        it('should set isLoading to true', () => {
            const action = { type: DELETE_DIVERSION_REQUEST, payload: {} };
            const newState = diversionsReducer(initialState, action);

            expect(newState.isLoading).toBe(true);
        });
    });

    describe('DELETE_DIVERSION_SUCCESS', () => {
        it('should set isLoading to false and remove diversion from list', () => {
            const action = {
                type: DELETE_DIVERSION_SUCCESS,
                payload: { diversionId: 'DIV123', disruptionId: 'DISR123' }
            };

            initialState.diversionsForDisruption.DISR123 = [
                { diversionId: 'DIV123', diversionName: 'Test' },
                { diversionId: 'DIV456', diversionName: 'Test2' }
            ];

            const newState = diversionsReducer(initialState, action);

            expect(newState.isLoading).toBe(false);
            expect(newState.diversionsForDisruption.DISR123).toHaveLength(1);
            expect(newState.diversionsForDisruption.DISR123[0].diversionId).toBe('DIV456');
        });

        it('should handle disruption with no diversions', () => {
            const action = {
                type: DELETE_DIVERSION_SUCCESS,
                payload: { diversionId: 'DIV123', disruptionId: 'DISR123' }
            };

            initialState.diversionsForDisruption.DISR123 = [];

            const newState = diversionsReducer(initialState, action);

            expect(newState.isLoading).toBe(false);
            expect(newState.diversionsForDisruption.DISR123).toEqual([]);
        });
    });

    describe('DELETE_DIVERSION_FAILURE', () => {
        it('should set isLoading to false and update diversionResultState with error', () => {
            const error = 'Deletion failed';
            const action = {
                type: DELETE_DIVERSION_FAILURE,
                payload: { diversionId: 'DIV123', disruptionId: 'DISR123', error }
            };
            const newState = diversionsReducer(initialState, action);

            expect(newState.isLoading).toBe(false);
            expect(newState.diversionResultState).toEqual({
                diversionId: 'DIV123',
                isLoading: false,
                isSuccess: false,
                error: 'Deletion failed'
            });
        });
    });

    describe('CLEAR_DIVERSIONS_CACHE', () => {
        it('should clear diversionsForDisruption and loadingStates', () => {
            initialState.diversionsForDisruption.DISR123 = [{ diversionId: 'DIV123' }];
            initialState.loadingStates.DISR123 = true;

            const action = { type: CLEAR_DIVERSIONS_CACHE };
            const newState = diversionsReducer(initialState, action);

            expect(newState.diversionsForDisruption).toEqual({});
            expect(newState.loadingStates).toEqual({});
        });
    });

    describe('SET_DIVERSION_RESULT_STATE', () => {
        it('should update diversionResultState', () => {
            const resultState = {
                diversionId: 'DIV123',
                isLoading: true,
                isSuccess: false,
                error: 'Test error'
            };

            const action = { type: SET_DIVERSION_RESULT_STATE, payload: resultState };
            const newState = diversionsReducer(initialState, action);

            expect(newState.diversionResultState).toEqual(resultState);
        });
    });

    describe('CLEAR_DIVERSION_RESULT_STATE', () => {
        it('should clear diversionResultState', () => {
            initialState.diversionResultState = {
                diversionId: 'DIV123',
                isLoading: false,
                isSuccess: true,
                error: null
            };

            const action = { type: CLEAR_DIVERSION_RESULT_STATE };
            const newState = diversionsReducer(initialState, action);

            expect(newState.diversionResultState).toBeNull();
        });
    });

    describe('State immutability', () => {
        it('should not mutate original state', () => {
            const originalState = { ...initialState };
            const action = { type: OPEN_DIVERSION_MANAGER, payload: true };
            
            diversionsReducer(initialState, action);
            
            expect(initialState).toEqual(originalState);
        });
    });

    describe('Complex state updates', () => {
        it('should handle multiple actions correctly', () => {
            let state = { ...initialState };

            // Open manager
            state = diversionsReducer(state, { type: OPEN_DIVERSION_MANAGER, payload: true });
            expect(state.isDiversionManagerOpen).toBe(true);

            // Set mode
            state = diversionsReducer(state, { type: UPDATE_DIVERSION_MODE, payload: 'CREATE' });
            expect(state.diversionMode).toBe('CREATE');

            // Fetch diversions
            state = diversionsReducer(state, { type: FETCH_DIVERSIONS_REQUEST, payload: 'DISR123' });
            expect(state.loadingStates.DISR123).toBe(true);

            // Success
            const diversions = [{ diversionId: 'DIV123' }];
            state = diversionsReducer(state, {
                type: FETCH_DIVERSIONS_SUCCESS,
                payload: { disruptionId: 'DISR123', diversions }
            });
            expect(state.loadingStates.DISR123).toBe(false);
            expect(state.diversionsForDisruption.DISR123).toEqual(diversions);

            // Close manager
            state = diversionsReducer(state, { type: CLOSE_DIVERSION_MANAGER });
            expect(state.isDiversionManagerOpen).toBe(false);
        });
    });
}); 