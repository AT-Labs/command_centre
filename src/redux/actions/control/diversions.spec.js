import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import * as diversionsActions from './diversions';
import * as disruptionsMgtApi from '../../../utils/transmitters/disruption-mgt-api';
import ACTION_TYPE from '../../action-types';
import EDIT_TYPE from '../../../types/edit-types';

const mockStore = configureMockStore([thunk]);

jest.mock('../../../utils/transmitters/disruption-mgt-api');

describe('Diversions Actions', () => {
    let store;

    beforeEach(() => {
        store = mockStore({});
        jest.clearAllMocks();
    });

    describe('Synchronous Actions', () => {
        it('should dispatch openDiversionManager action', () => {
            store.dispatch(diversionsActions.openDiversionManager(true));
            const actions = store.getActions();
            expect(actions[0].type).toBe(ACTION_TYPE.OPEN_DIVERSION_MANAGER);
            expect(actions[0].payload.isDiversionManagerOpen).toBe(true);
        });

        it('should create updateDiversionMode action', () => {
            const action = diversionsActions.updateDiversionMode(EDIT_TYPE.EDIT);
            expect(action.type).toBe(ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE);
            expect(action.payload.diversionEditMode).toBe(EDIT_TYPE.EDIT);
        });

        it('should create updateDiversionToEdit action', () => {
            const diversion = { id: '123', name: 'Test Diversion' };
            const action = diversionsActions.updateDiversionToEdit(diversion);
            expect(action.type).toBe(ACTION_TYPE.UPDATE_DIVERSION_TO_EDIT);
            expect(action.payload.diversion).toEqual(diversion);
        });

        it('should create updateDiversionResultState action', () => {
            const action = diversionsActions.updateDiversionResultState(true, '123', null);
            expect(action.type).toBe(ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE);
            expect(action.payload.isLoading).toBe(true);
            expect(action.payload.diversionId).toBe('123');
            expect(action.payload.error).toBe(null);
        });

        it('should create clearDiversionsCache action', () => {
            const actionWithId = diversionsActions.clearDiversionsCache('123');
            const actionWithoutId = diversionsActions.clearDiversionsCache();

            expect(actionWithId.type).toBe(ACTION_TYPE.CLEAR_DIVERSIONS_CACHE);
            expect(actionWithId.payload.disruptionId).toBe('123');
            expect(actionWithoutId.payload.disruptionId).toBe(null);
        });
    });

    describe('Asynchronous Actions', () => {
        it('should handle createDiversion success and error', async () => {
            const diversion = { name: 'Test Diversion' };
            const mockResponse = { diversionId: '123' };
            const mockError = new Error('API Error');

            disruptionsMgtApi.addDiversion.mockResolvedValue(mockResponse);
            await store.dispatch(diversionsActions.createDiversion(diversion));

            const successActions = store.getActions();
            expect(successActions[0].payload.isLoading).toBe(true);
            expect(successActions[1].payload.isLoading).toBe(false);
            expect(successActions[1].payload.diversionId).toBe('123');
            expect(disruptionsMgtApi.addDiversion).toHaveBeenCalledWith(diversion);

            store.clearActions();
            disruptionsMgtApi.addDiversion.mockRejectedValue(mockError);
            await store.dispatch(diversionsActions.createDiversion(diversion));

            const errorActions = store.getActions();
            expect(errorActions[1].payload.error).toBe(mockError);
        });

        it('should handle updateDiversion success and error', async () => {
            const diversion = { diversionId: '123', name: 'Updated Diversion' };
            const mockError = new Error('Update failed');

            disruptionsMgtApi.updateDiversion.mockResolvedValue();
            await store.dispatch(diversionsActions.updateDiversion(diversion));

            const successActions = store.getActions();
            expect(successActions[0].payload.isLoading).toBe(true);
            expect(successActions[1].payload.isLoading).toBe(false);
            expect(successActions[1].payload.diversionId).toBe('123');
            expect(disruptionsMgtApi.updateDiversion).toHaveBeenCalledWith(diversion);

            store.clearActions();
            disruptionsMgtApi.updateDiversion.mockRejectedValue(mockError);
            await store.dispatch(diversionsActions.updateDiversion(diversion));

            const errorActions = store.getActions();
            expect(errorActions[1].payload.error).toBe(mockError);
        });

        it('should dispatch resetDiversionResult', () => {
            store.dispatch(diversionsActions.resetDiversionResult());
            const actions = store.getActions();
            expect(actions[0].type).toBe(ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE);
            expect(actions[0].payload.isLoading).toBe(false);
            expect(actions[0].payload.diversionId).toBe(null);
            expect(actions[0].payload.error).toBe(null);
        });

        it('should handle fetchDiversions success and error', async () => {
            const disruptionId = '123';
            const mockDiversions = [{ id: '1' }, { id: '2' }];
            const mockError = new Error('Fetch failed');
            const mockState = {
                control: {
                    diversions: {
                        diversionsLoading: {},
                        diversionsData: {},
                    },
                },
            };

            store = mockStore(mockState);
            disruptionsMgtApi.getDiversion.mockResolvedValue(mockDiversions);

            const result = await store.dispatch(diversionsActions.fetchDiversions(disruptionId));
            const actions = store.getActions();

            expect(actions[0].type).toBe(ACTION_TYPE.FETCH_DIVERSIONS_START);
            expect(actions[1].type).toBe(ACTION_TYPE.FETCH_DIVERSIONS_SUCCESS);
            expect(result).toEqual(mockDiversions);
            expect(disruptionsMgtApi.getDiversion).toHaveBeenCalledWith(disruptionId);

            store.clearActions();
            disruptionsMgtApi.getDiversion.mockRejectedValue(mockError);
            const errorResult = await store.dispatch(diversionsActions.fetchDiversions(disruptionId));
            const errorActions = store.getActions();

            expect(errorActions[1].type).toBe(ACTION_TYPE.FETCH_DIVERSIONS_ERROR);
            expect(errorResult).toEqual([]);
        });

        it('should handle fetchDiversions edge cases', async () => {
            const disruptionId = '123';
            const cachedDiversions = [{ id: '1' }];
            const loadingState = {
                control: {
                    diversions: {
                        diversionsLoading: { [disruptionId]: true },
                        diversionsData: {},
                    },
                },
            };
            const cachedState = {
                control: {
                    diversions: {
                        diversionsLoading: {},
                        diversionsData: { [disruptionId]: cachedDiversions },
                    },
                },
            };

            const noIdResult = await store.dispatch(diversionsActions.fetchDiversions());
            expect(noIdResult).toBeUndefined();

            store = mockStore(loadingState);
            const loadingResult = await store.dispatch(diversionsActions.fetchDiversions(disruptionId));
            expect(loadingResult).toBeUndefined();
            expect(disruptionsMgtApi.getDiversion).not.toHaveBeenCalled();

            store = mockStore(cachedState);
            const cachedResult = await store.dispatch(diversionsActions.fetchDiversions(disruptionId, false));
            expect(cachedResult).toEqual(cachedDiversions);
            expect(disruptionsMgtApi.getDiversion).not.toHaveBeenCalled();
        });

        it('should try incidentId fallback when no diversions found', async () => {
            const disruptionId = '123456';
            const incidentId = '789012';
            const mockDiversions = [{ id: '1' }];
            const mockState = {
                control: {
                    diversions: {
                        diversionsLoading: {},
                        diversionsData: {},
                    },
                    incidents: {
                        disruptions: [
                            { disruptionId, incidentId },
                        ],
                    },
                },
            };

            store = mockStore(mockState);
            disruptionsMgtApi.getDiversion
                .mockResolvedValueOnce([])
                .mockResolvedValueOnce(mockDiversions);

            const result = await store.dispatch(diversionsActions.fetchDiversions(disruptionId));
            const actions = store.getActions();

            expect(disruptionsMgtApi.getDiversion).toHaveBeenCalledTimes(2);
            expect(disruptionsMgtApi.getDiversion).toHaveBeenNthCalledWith(1, disruptionId);
            expect(disruptionsMgtApi.getDiversion).toHaveBeenNthCalledWith(2, incidentId);
            expect(actions[1].payload.diversions).toEqual(mockDiversions);
            expect(result).toEqual(mockDiversions);
        });

        it('should handle missing incidents state gracefully', async () => {
            const disruptionId = '123456';
            const mockState = {
                control: {
                    diversions: {
                        diversionsLoading: {},
                        diversionsData: {},
                    },
                },
            };

            store = mockStore(mockState);
            disruptionsMgtApi.getDiversion.mockResolvedValue([]);

            const result = await store.dispatch(diversionsActions.fetchDiversions(disruptionId));
            const actions = store.getActions();

            expect(disruptionsMgtApi.getDiversion).toHaveBeenCalledTimes(1);
            expect(disruptionsMgtApi.getDiversion).toHaveBeenCalledWith(disruptionId);
            expect(actions[1].payload.diversions).toEqual([]);
            expect(result).toEqual([]);
        });
    });
});
