import { result } from 'lodash-es';

export const getAgencies = state => result(state, 'static.agencies');
