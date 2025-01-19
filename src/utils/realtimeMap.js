import { Filters } from '../components/RealTime/TrafficFilters/TrafficFilters';
import { Category } from '../types/incidents';
import VEHICLE_OCCUPANCY_STATUS_TYPE from '../types/vehicle-occupancy-status-types';
import VEHICLE_TYPE_DETAILS, { VEHICLE_TYPES } from '../types/vehicle-types';

const validateQueryValues = (query, allowedValuesObject) => {
    const allowedValues = new Set(Object.values(allowedValuesObject));
    const values = query.split(',');

    if (values.length < 1 || values.length > allowedValues.size) {
        return false;
    }

    const seen = new Set();
    return values.every((value) => {
        if (!allowedValues.has(value) || seen.has(value)) {
            return false;
        }
        seen.add(value);
        return true;
    });
};

export const isTagsQueryValid = (query) => {
    if (!query) {
        return false;
    }

    const allowedValues = {
        SMARTRAK: 'Smartrak',
        TORUTEK: 'Torutek',
        CAF: 'CAF',
    };

    return validateQueryValues(query, allowedValues);
};

export const isStatusQueryValid = (statusQuery, earlyCustomQuery, lateCustomQuery) => {
    if (!statusQuery) {
        return false;
    }

    const allowedValues = new Set(['earlyCustom', 'earlyMoreThan30', 'lateCustom', 'lateMoreThan30', 'notInService', 'unscheduled']);
    const values = statusQuery.split(',');

    if (values.length < 1 || values.length > 4) {
        return false;
    }

    const seen = new Set();
    let isValid = true;
    values.forEach((value) => {
        if (!allowedValues.has(value) || seen.has(value)) {
            isValid = false;
        }
        seen.add(value);
    });

    if (!isValid) {
        return false;
    }

    const isCustomQueryValid = (customQuery) => {
        const customValues = customQuery?.split('-');
        const customMin = Number(customValues?.[0]);
        const customMax = Number(customValues?.[1]);
        const hasTwoValues = customValues.length === 2;
        const isMinValid = customMin >= 0 && customMin <= 30;
        const isMaxValid = customMax === 'Infinity' || (customMax >= 0 && customMax <= 30);
        const isRangeValid = customMax === 'Infinity' || customMin <= customMax;

        return hasTwoValues && isMinValid && isMaxValid && isRangeValid;
    };

    if (values.includes('earlyCustom') && !isCustomQueryValid(earlyCustomQuery)) {
        return false;
    }

    if (values.includes('lateCustom') && !isCustomQueryValid(lateCustomQuery)) {
        return false;
    }

    return true;
};

export const isOccupancyLevelsValid = (query) => {
    if (!query) {
        return false;
    }

    return validateQueryValues(query, VEHICLE_OCCUPANCY_STATUS_TYPE);
};

export const isRouteTypeQueryValid = (routeTypeQuery, agencyIdsQuery, settingsQuery, allAgencies) => {
    if (!routeTypeQuery) {
        return false;
    }

    const vehicleTypesIds = VEHICLE_TYPES.map(type => Object.entries(VEHICLE_TYPE_DETAILS).find(([, value]) => value.type === type)[0]);
    if (!vehicleTypesIds.includes(routeTypeQuery)) {
        return false;
    }

    const agencyOptions = allAgencies.filter(agency => agency.route_type === Number(routeTypeQuery));
    const agencyOptionsObject = agencyOptions.reduce((agencies, option) => ({ ...agencies, ...{ [option.agency_id]: option.agency_id } }), {});
    if (agencyIdsQuery && !validateQueryValues(agencyIdsQuery, agencyOptionsObject)) {
        return false;
    }

    const settingsOptions = {
        inbound: 'inbound',
        outbound: 'outbound',
        schoolBus: 'schoolBus',
    };
    if (settingsQuery && !validateQueryValues(settingsQuery, settingsOptions)) {
        return false;
    }

    return true;
};

export const isIncidentsQueryValid = (query) => {
    if (!query) {
        return false;
    }

    return validateQueryValues(query, Category);
};

export const isLiveTrafficQueryValid = (query) => {
    if (!query) {
        return false;
    }

    return validateQueryValues(query, Filters);
};

export const isMapCenterQueryValid = (query) => {
    if (!query) {
        return false;
    }

    const values = query.split(',');

    if (values.length < 1 || values.length > 2) {
        return false;
    }

    return values.every(value => Number.isFinite(Number(value)));
};

export const isMapZoomLevelQueryValid = (query) => {
    if (!query) {
        return false;
    }

    return Number.isFinite(Number(query));
};
