import { DISRUPTION_STATUSES } from '../../constants/disruptions';

export const LOADER_PROTECTION_TIMEOUT = 2000;

export const canFetchDiversions = (disruption, fetchDiversionsAction) => disruption?.disruptionId && fetchDiversionsAction;

export const fetchDiversionsHelper = (disruption, fetchDiversionsAction, forceRefresh = false) => {
    if (canFetchDiversions(disruption, fetchDiversionsAction)) {
        fetchDiversionsAction(disruption.disruptionId, forceRefresh);
    }
};

export const handleDiversionRefetch = (disruption, fetchDiversionsAction, clearDiversionsCacheAction, scenario) => {
    if (!canFetchDiversions(disruption, fetchDiversionsAction)) {
        return;
    }

    switch (scenario) {
    case 'MANAGER_CLOSED':
        fetchDiversionsAction(disruption.disruptionId, true);
        break;

    case 'DIVERSION_CREATED':
        if (clearDiversionsCacheAction) {
            clearDiversionsCacheAction(disruption.disruptionId);
            fetchDiversionsAction(disruption.disruptionId, true);
        }
        break;

    case 'DIVERSION_UPDATED':
        fetchDiversionsAction(disruption.disruptionId, true);
        break;

    default:
        fetchDiversionsAction(disruption.disruptionId, false);
    }
};

export const getAffectedEntities = (disruption, reduxAffectedRoutes) => {
    if (reduxAffectedRoutes?.length) {
        return reduxAffectedRoutes;
    }

    if (!disruption) {
        return [];
    }

    return disruption.affectedEntities?.affectedRoutes
           || disruption.routes
           || disruption.affectedRoutes
           || (Array.isArray(disruption.affectedEntities) ? disruption.affectedEntities : []);
};

export const getDiversionValidation = (disruption, affectedEntities, diversions = []) => {
    if (!disruption) {
        return false;
    }

    if (disruption.status === DISRUPTION_STATUSES.RESOLVED) {
        return false;
    }

    const allowedStatuses = [
        DISRUPTION_STATUSES.NOT_STARTED,
        DISRUPTION_STATUSES.IN_PROGRESS,
        DISRUPTION_STATUSES.DRAFT,
    ];
    const isStatusAllowed = allowedStatuses.includes(disruption.status);
    if (!isStatusAllowed) return false;

    if (disruption.status !== DISRUPTION_STATUSES.DRAFT && disruption.status !== DISRUPTION_STATUSES.NOT_STARTED) {
        if (!disruption.startTime || !disruption.endTime) {
            return false;
        }
    }

    const isBusRoute = route => route.routeType === 3;
    const isTrainRoute = route => route.routeType === 1;
    const busRoutes = affectedEntities.filter(isBusRoute);
    const trainRoutes = affectedEntities.filter(isTrainRoute);

    if (busRoutes.length === 0) {
        return false;
    }

    if (trainRoutes.length > 0 && busRoutes.length === 0) {
        return false;
    }

    const existingDiversions = diversions || [];

    const busRoutesWithDiversions = busRoutes.filter(route => existingDiversions.some((diversion) => {
        const diversionRouteVariants = diversion.diversionRouteVariants || [];
        return diversionRouteVariants.some(drv => drv.routeId === route.routeId);
    }));

    if (busRoutesWithDiversions.length === busRoutes.length && busRoutes.length > 0) {
        return false;
    }

    return true;
};
