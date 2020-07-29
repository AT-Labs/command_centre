import _ from 'lodash-es';

export const getAgencies = state => _.result(state, 'static.agencies');
