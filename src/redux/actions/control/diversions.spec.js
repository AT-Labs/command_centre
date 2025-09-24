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
            const isDiversionManagerOpen = true;
            const expectedActions = [
                {
                    type: ACTION_TYPE.OPEN_DIVERSION_MANAGER,
                    payload: {
                        isDiversionManagerOpen,
                    },
                },
            ];

            store.dispatch(diversionsActions.openDiversionManager(isDiversionManagerOpen));
            expect(store.getActions()).toEqual(expectedActions);
        });

        it('should create setDiversionManagerLoading action', () => {
            const isLoading = true;
            const expectedAction = {
                type: ACTION_TYPE.SET_DIVERSION_MANAGER_LOADING,
                payload: {
                    isLoading,
                },
            };

            const action = diversionsActions.setDiversionManagerLoading(isLoading);
            expect(action).toEqual(expectedAction);
        });

        it('should create updateDiversionMode action', () => {
            const editMode = EDIT_TYPE.EDIT;
            const expectedAction = {
                type: ACTION_TYPE.UPDATE_DIVERSION_EDIT_MODE,
                payload: {
                    diversionEditMode: editMode,
                },
            };

            const action = diversionsActions.updateDiversionMode(editMode);
            expect(action).toEqual(expectedAction);
        });

        it('should create updateDiversionToEdit action', () => {
            const diversion = { id: '123', name: 'Test Diversion' };
            const expectedAction = {
                type: ACTION_TYPE.UPDATE_DIVERSION_TO_EDIT,
                payload: {
                    diversion,
                },
            };

            const action = diversionsActions.updateDiversionToEdit(diversion);
            expect(action).toEqual(expectedAction);
        });

        it('should create updateDiversionResultState action', () => {
            const isLoading = true;
            const diversionId = '123';
            const error = null;
            const expectedAction = {
                type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                payload: {
                    isLoading,
                    diversionId,
                    error,
                },
            };

            const action = diversionsActions.updateDiversionResultState(isLoading, diversionId, error);
            expect(action).toEqual(expectedAction);
        });

        it('should create clearDiversionsCache action with disruptionId', () => {
            const disruptionId = '123';
            const expectedAction = {
                type: ACTION_TYPE.CLEAR_DIVERSIONS_CACHE,
                payload: { disruptionId },
            };

            const action = diversionsActions.clearDiversionsCache(disruptionId);
            expect(action).toEqual(expectedAction);
        });

        it('should create clearDiversionsCache action without disruptionId', () => {
            const expectedAction = {
                type: ACTION_TYPE.CLEAR_DIVERSIONS_CACHE,
                payload: { disruptionId: null },
            };

            const action = diversionsActions.clearDiversionsCache();
            expect(action).toEqual(expectedAction);
        });
    });

    describe('Asynchronous Actions', () => {
        it('should dispatch createDiversion success', async () => {
            const diversion = { name: 'Test Diversion' };
            const mockResponse = { diversionId: '123' };

            disruptionsMgtApi.addDiversion.mockResolvedValue(mockResponse);

            const expectedActions = [
                {
                    type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                    payload: {
                        isLoading: true,
                        diversionId: null,
                        error: null,
                    },
                },
                {
                    type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                    payload: {
                        isLoading: false,
                        diversionId: '123',
                        error: null,
                    },
                },
            ];

            await store.dispatch(diversionsActions.createDiversion(diversion));
            expect(store.getActions()).toEqual(expectedActions);
            expect(disruptionsMgtApi.addDiversion).toHaveBeenCalledWith(diversion);
        });

        it('should dispatch createDiversion error', async () => {
            const diversion = { name: 'Test Diversion' };
            const mockError = new Error('API Error');

            disruptionsMgtApi.addDiversion.mockRejectedValue(mockError);

            const expectedActions = [
                {
                    type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                    payload: {
                        isLoading: true,
                        diversionId: null,
                        error: null,
                    },
                },
                {
                    type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                    payload: {
                        isLoading: false,
                        diversionId: null,
                        error: mockError,
                    },
                },
            ];

            await store.dispatch(diversionsActions.createDiversion(diversion));
            expect(store.getActions()).toEqual(expectedActions);
        });

        it('should dispatch updateDiversion success', async () => {
            const diversion = { diversionId: '123', name: 'Updated Diversion' };

            disruptionsMgtApi.updateDiversion.mockResolvedValue();

            const expectedActions = [
                {
                    type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                    payload: {
                        isLoading: true,
                        diversionId: null,
                        error: null,
                    },
                },
                {
                    type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                    payload: {
                        isLoading: false,
                        diversionId: '123',
                        error: null,
                    },
                },
            ];

            await store.dispatch(diversionsActions.updateDiversion(diversion));
            expect(store.getActions()).toEqual(expectedActions);
            expect(disruptionsMgtApi.updateDiversion).toHaveBeenCalledWith(diversion);
        });

        it('should dispatch updateDiversion error', async () => {
            const diversion = { diversionId: '123', name: 'Updated Diversion' };
            const mockError = new Error('Update failed');

            disruptionsMgtApi.updateDiversion.mockRejectedValue(mockError);

            const expectedActions = [
                {
                    type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                    payload: {
                        isLoading: true,
                        diversionId: null,
                        error: null,
                    },
                },
                {
                    type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                    payload: {
                        isLoading: false,
                        diversionId: null,
                        error: mockError,
                    },
                },
            ];

            await store.dispatch(diversionsActions.updateDiversion(diversion));
            expect(store.getActions()).toEqual(expectedActions);
        });

        it('should dispatch resetDiversionResult', () => {
            const expectedActions = [
                {
                    type: ACTION_TYPE.UPDATE_DIVERSION_RESULT_STATE,
                    payload: {
                        isLoading: false,
                        diversionId: null,
                        error: null,
                    },
                },
            ];

            store.dispatch(diversionsActions.resetDiversionResult());
            expect(store.getActions()).toEqual(expectedActions);
        });

        it('should dispatch fetchDiversions success', async () => {
            const disruptionId = '123';
            const mockDiversions = [{ id: '1' }, { id: '2' }];
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

            const expectedActions = [
                {
                    type: ACTION_TYPE.FETCH_DIVERSIONS_START,
                    payload: { disruptionId },
                },
                {
                    type: ACTION_TYPE.FETCH_DIVERSIONS_SUCCESS,
                    payload: { disruptionId, diversions: mockDiversions },
                },
            ];

            const result = await store.dispatch(diversionsActions.fetchDiversions(disruptionId));
            expect(store.getActions()).toEqual(expectedActions);
            expect(result).toEqual(mockDiversions);
            expect(disruptionsMgtApi.getDiversion).toHaveBeenCalledWith(disruptionId);
        });

        it('should dispatch fetchDiversions error', async () => {
            const disruptionId = '123';
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
            disruptionsMgtApi.getDiversion.mockRejectedValue(mockError);

            const expectedActions = [
                {
                    type: ACTION_TYPE.FETCH_DIVERSIONS_START,
                    payload: { disruptionId },
                },
                {
                    type: ACTION_TYPE.FETCH_DIVERSIONS_ERROR,
                    payload: { disruptionId, error: 'Fetch failed' },
                },
            ];

            const result = await store.dispatch(diversionsActions.fetchDiversions(disruptionId));
            expect(store.getActions()).toEqual(expectedActions);
            expect(result).toEqual([]);
        });

        it('should return undefined when disruptionId is not provided', async () => {
            const result = await store.dispatch(diversionsActions.fetchDiversions());
            expect(result).toBeUndefined();
        });

        it('should return cached data when not forcing refresh', async () => {
            const disruptionId = '123';
            const cachedDiversions = [{ id: '1' }];
            const mockState = {
                control: {
                    diversions: {
                        diversionsLoading: {},
                        diversionsData: {
                            [disruptionId]: cachedDiversions,
                        },
                    },
                },
            };

            store = mockStore(mockState);

            const result = await store.dispatch(diversionsActions.fetchDiversions(disruptionId, false));
            expect(result).toEqual(cachedDiversions);
            expect(disruptionsMgtApi.getDiversion).not.toHaveBeenCalled();
        });

        it('should not fetch when already loading', async () => {
            const disruptionId = '123';
            const mockState = {
                control: {
                    diversions: {
                        diversionsLoading: {
                            [disruptionId]: true,
                        },
                        diversionsData: {},
                    },
                },
            };

            store = mockStore(mockState);

            const result = await store.dispatch(diversionsActions.fetchDiversions(disruptionId));
            expect(result).toBeUndefined();
            expect(disruptionsMgtApi.getDiversion).not.toHaveBeenCalled();
        });
    });
});
