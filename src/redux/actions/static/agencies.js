import ACTION_TYPE from '../../action-types';

export const populateAgencies = routes => ({
    type: ACTION_TYPE.POPULATE_AGENCIES,
    payload: {
        routes,
    },
});
