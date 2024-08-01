import { result, isEmpty } from 'lodash-es';
import { createSelector } from 'reselect';
import { getOperatorPermissions } from '../user';

export const getAgenciesState = state => result(state, 'control.agencies');
export const getAgencies = createSelector(getAgenciesState, agenciesState => result(agenciesState, 'all'));
export const getRestrictedAgencies = createSelector(getAgencies, getOperatorPermissions, (agencies, operatorPermissions) => {
    const filteredAgency = agencies.filter(agency => operatorPermissions.includes(agency.agencyId));
    return filteredAgency.map(agency => ({ value: agency.agencyId, label: agency.agencyName }));
});
export const hasAgenciesLoaded = createSelector(getAgencies, agencies => !isEmpty(agencies));
