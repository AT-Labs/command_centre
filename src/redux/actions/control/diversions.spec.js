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
    });
});
