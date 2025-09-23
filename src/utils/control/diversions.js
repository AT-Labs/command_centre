export const ROUTE_TYPES = {
    TRAIN: 1,
    RAIL: 2,
    BUS: 3,
};

export const LOADER_PROTECTION_TIMEOUT = 2000;

export const DISRUPTION_STATUSES = {
    NOT_STARTED: 'not-started',
    IN_PROGRESS: 'in-progress',
    DRAFT: 'draft',
    RESOLVED: 'resolved',
};

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
    if (reduxAffectedRoutes && reduxAffectedRoutes.length > 0) {
        return reduxAffectedRoutes;
    }

    if (!disruption?.affectedEntities) {
        return [];
    }

    if (Array.isArray(disruption.affectedEntities)) {
        return disruption.affectedEntities;
    }

    if (disruption.affectedEntities.affectedRoutes) {
        return disruption.affectedEntities.affectedRoutes;
    }

    if (disruption.routes) {
        return disruption.routes;
    }

    if (disruption.affectedRoutes) {
        return disruption.affectedRoutes;
    }

    return [];
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

    const isBusRoute = route => route.routeType === ROUTE_TYPES.BUS;
    const isTrainRoute = route => route.routeType === ROUTE_TYPES.TRAIN;
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
