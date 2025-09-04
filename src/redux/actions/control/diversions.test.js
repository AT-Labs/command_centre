import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import {
    openDiversionManager,
    updateDiversionMode,
    updateDiversionToEdit,
    fetchDiversions,
    createDiversion,
    updateDiversion,
    deleteDiversion,
    clearDiversionsCache,
} from './diversions';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe('Diversion Actions', () => {
    describe('openDiversionManager', () => {
        it('should create OPEN_DIVERSION_MANAGER action', () => {
            const expectedAction = {
                type: 'OPEN_DIVERSION_MANAGER',
                payload: true,
            };

            expect(openDiversionManager(true)).toEqual(expectedAction);
        });

        it('should handle boolean payload correctly', () => {
            expect(openDiversionManager(false)).toEqual({
                type: 'OPEN_DIVERSION_MANAGER',
                payload: false,
            });
        });
    });

    describe('updateDiversionMode', () => {
        it('should create UPDATE_DIVERSION_MODE action', () => {
            const mode = 'CREATE';
            const expectedAction = {
                type: 'UPDATE_DIVERSION_MODE',
                payload: mode,
            };

            expect(updateDiversionMode(mode)).toEqual(expectedAction);
        });

        it('should handle different modes', () => {
            const modes = ['CREATE', 'EDIT', 'VIEW'];

            modes.forEach((mode) => {
                expect(updateDiversionMode(mode)).toEqual({
                    type: 'UPDATE_DIVERSION_MODE',
                    payload: mode,
                });
            });
        });
    });

    describe('updateDiversionToEdit', () => {
        it('should create UPDATE_DIVERSION_TO_EDIT action', () => {
            const diversion = { diversionId: 'DIV123', diversionName: 'Test' };
            const expectedAction = {
                type: 'UPDATE_DIVERSION_TO_EDIT',
                payload: diversion,
            };

            expect(updateDiversionToEdit(diversion)).toEqual(expectedAction);
        });

        it('should handle null diversion', () => {
            expect(updateDiversionToEdit(null)).toEqual({
                type: 'UPDATE_DIVERSION_TO_EDIT',
                payload: null,
            });
        });
    });

    describe('fetchDiversions', () => {
        it('should create FETCH_DIVERSIONS_REQUEST action initially', () => {
            const testStore = mockStore({});

            return testStore.dispatch(fetchDiversions('DISR123')).then(() => {
                const actions = testStore.getActions();
                expect(actions[0]).toEqual({
                    type: 'FETCH_DIVERSIONS_REQUEST',
                    payload: 'DISR123',
                });
            });
        });

        it('should handle successful fetch', () => {
            const mockDiversions = [
                { diversionId: 'DIV1', diversionName: 'Diversion 1' },
                { diversionId: 'DIV2', diversionName: 'Diversion 2' },
            ];

            // Mock API response
            global.fetch = jest.fn(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockDiversions),
            }));

            const testStore = mockStore({});

            return testStore.dispatch(fetchDiversions('DISR123')).then(() => {
                const actions = testStore.getActions();

                expect(actions[0].type).toBe('FETCH_DIVERSIONS_REQUEST');
                expect(actions[1].type).toBe('FETCH_DIVERSIONS_SUCCESS');
                expect(actions[1].payload).toEqual({
                    disruptionId: 'DISR123',
                    diversions: mockDiversions,
                });
            });
        });

        it('should handle fetch error', () => {
            const error = new Error('Fetch failed');

            global.fetch = jest.fn(() => Promise.reject(error));

            const testStore = mockStore({});

            return testStore.dispatch(fetchDiversions('DISR123')).then(() => {
                const actions = testStore.getActions();

                expect(actions[0].type).toBe('FETCH_DIVERSIONS_REQUEST');
                expect(actions[1].type).toBe('FETCH_DIVERSIONS_FAILURE');
                expect(actions[1].payload).toEqual({
                    disruptionId: 'DISR123',
                    error: error.message,
                });
            });
        });

        it('should handle refresh parameter', () => {
            global.fetch = jest.fn(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve([]),
            }));

            const testStore = mockStore({});

            return testStore.dispatch(fetchDiversions('DISR123', true)).then(() => {
                const actions = testStore.getActions();

                expect(actions[0].type).toBe('FETCH_DIVERSIONS_REQUEST');
                expect(actions[0].payload).toBe('DISR123');
            });
        });
    });

    describe('createDiversion', () => {
        it('should create CREATE_DIVERSION_REQUEST action initially', () => {
            const diversionData = {
                diversionName: 'Test Diversion',
                disruptionId: 'DISR123',
            };

            const testStore = mockStore({});

            return testStore.dispatch(createDiversion(diversionData)).then(() => {
                const actions = testStore.getActions();
                expect(actions[0]).toEqual({
                    type: 'CREATE_DIVERSION_REQUEST',
                    payload: diversionData,
                });
            });
        });

        it('should handle successful creation', () => {
            const diversionData = {
                diversionName: 'Test Diversion',
                disruptionId: 'DISR123',
            };

            const createdDiversion = {
                diversionId: 'DIV123',
                ...diversionData,
            };

            global.fetch = jest.fn(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(createdDiversion),
            }));

            const testStore = mockStore({});

            return testStore.dispatch(createDiversion(diversionData)).then(() => {
                const actions = testStore.getActions();

                expect(actions[0].type).toBe('CREATE_DIVERSION_REQUEST');
                expect(actions[1].type).toBe('CREATE_DIVERSION_SUCCESS');
                expect(actions[1].payload).toEqual(createdDiversion);
            });
        });

        it('should handle creation error', () => {
            const diversionData = {
                diversionName: 'Test Diversion',
                disruptionId: 'DISR123',
            };

            const error = new Error('Creation failed');

            global.fetch = jest.fn(() => Promise.reject(error));

            const testStore = mockStore({});

            return testStore.dispatch(createDiversion(diversionData)).then(() => {
                const actions = testStore.getActions();

                expect(actions[0].type).toBe('CREATE_DIVERSION_REQUEST');
                expect(actions[1].type).toBe('CREATE_DIVERSION_FAILURE');
                expect(actions[1].payload).toEqual({
                    error: error.message,
                });
            });
        });
    });

    describe('updateDiversion', () => {
        it('should create UPDATE_DIVERSION_REQUEST action initially', () => {
            const diversionData = {
                diversionId: 'DIV123',
                diversionName: 'Updated Diversion',
            };

            const testStore = mockStore({});

            return testStore.dispatch(updateDiversion(diversionData)).then(() => {
                const actions = testStore.getActions();
                expect(actions[0]).toEqual({
                    type: 'UPDATE_DIVERSION_REQUEST',
                    payload: diversionData,
                });
            });
        });

        it('should handle successful update', () => {
            const diversionData = {
                diversionId: 'DIV123',
                diversionName: 'Updated Diversion',
            };

            const updatedDiversion = {
                ...diversionData,
                updatedAt: new Date().toISOString(),
            };

            global.fetch = jest.fn(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve(updatedDiversion),
            }));

            const testStore = mockStore({});

            return testStore.dispatch(updateDiversion(diversionData)).then(() => {
                const actions = testStore.getActions();

                expect(actions[0].type).toBe('UPDATE_DIVERSION_REQUEST');
                expect(actions[1].type).toBe('UPDATE_DIVERSION_SUCCESS');
                expect(actions[1].payload).toEqual(updatedDiversion);
            });
        });
    });

    describe('deleteDiversion', () => {
        it('should create DELETE_DIVERSION_REQUEST action initially', () => {
            const testStore = mockStore({});

            return testStore.dispatch(deleteDiversion('DIV123', 'DISR123')).then(() => {
                const actions = testStore.getActions();
                expect(actions[0]).toEqual({
                    type: 'DELETE_DIVERSION_REQUEST',
                    payload: { diversionId: 'DIV123', disruptionId: 'DISR123' },
                });
            });
        });

        it('should handle successful deletion', () => {
            global.fetch = jest.fn(() => Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ success: true }),
            }));

            const testStore = mockStore({});

            return testStore.dispatch(deleteDiversion('DIV123', 'DISR123')).then(() => {
                const actions = testStore.getActions();

                expect(actions[0].type).toBe('DELETE_DIVERSION_REQUEST');
                expect(actions[1].type).toBe('DELETE_DIVERSION_SUCCESS');
                expect(actions[1].payload).toEqual({
                    diversionId: 'DIV123',
                    disruptionId: 'DISR123',
                });
            });
        });

        it('should handle deletion error', () => {
            const error = new Error('Deletion failed');

            global.fetch = jest.fn(() => Promise.reject(error));

            const testStore = mockStore({});

            return testStore.dispatch(deleteDiversion('DIV123', 'DISR123')).then(() => {
                const actions = testStore.getActions();

                expect(actions[0].type).toBe('DELETE_DIVERSION_REQUEST');
                expect(actions[1].type).toBe('DELETE_DIVERSION_FAILURE');
                expect(actions[1].payload).toEqual({
                    diversionId: 'DIV123',
                    disruptionId: 'DISR123',
                    error: error.message,
                });
            });
        });
    });

    describe('clearDiversionsCache', () => {
        it('should create CLEAR_DIVERSIONS_CACHE action', () => {
            const expectedAction = {
                type: 'CLEAR_DIVERSIONS_CACHE',
            };

            expect(clearDiversionsCache()).toEqual(expectedAction);
        });
    });
});
