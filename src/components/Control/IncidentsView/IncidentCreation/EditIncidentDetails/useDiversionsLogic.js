import { useState, useEffect, useMemo } from 'react';

export const useDiversionsLogic = (disruption, fetchDiversionsAction, isDiversionManagerOpen, diversionResultState, clearDiversionsCacheAction) => {
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (anchorEl && !event.target.closest('.diversions-button-container')) {
                setAnchorEl(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [anchorEl]);

    useEffect(() => {
        if (isDiversionManagerOpen && anchorEl) {
            setAnchorEl(null);
        }
    }, [isDiversionManagerOpen, anchorEl]);

    useEffect(() => {
        if (disruption?.disruptionId && fetchDiversionsAction) {
            fetchDiversionsAction(disruption.disruptionId);
        }
    }, [disruption?.disruptionId, fetchDiversionsAction]);

    useEffect(() => {
        if (!isDiversionManagerOpen && disruption?.disruptionId && fetchDiversionsAction) {
            setTimeout(() => {
                fetchDiversionsAction(disruption.disruptionId);
            }, 500);
        }
    }, [isDiversionManagerOpen, disruption?.disruptionId, fetchDiversionsAction]);

    useEffect(() => {
        if (diversionResultState?.diversionId && disruption?.disruptionId && fetchDiversionsAction && clearDiversionsCacheAction) {
            setTimeout(() => {
                clearDiversionsCacheAction(disruption.disruptionId);
                fetchDiversionsAction(disruption.disruptionId, true);
            }, 1000);
        }
    }, [diversionResultState?.diversionId, disruption?.disruptionId, fetchDiversionsAction, clearDiversionsCacheAction]);

    useEffect(() => {
        if (diversionResultState && !diversionResultState.isLoading && diversionResultState.diversionId && disruption?.disruptionId && fetchDiversionsAction) {
            setTimeout(() => {
                fetchDiversionsAction(disruption.disruptionId, true);
            }, 500);
        }
    }, [diversionResultState?.isLoading, diversionResultState?.diversionId, disruption?.disruptionId, fetchDiversionsAction]);

    return {
        anchorEl,
        setAnchorEl,
    };
};

export const useAffectedEntities = (disruption, reduxAffectedRoutes) => {
    const getAffectedEntities = () => {
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

        if (disruption.affectedEntities?.affectedRoutes) {
            return disruption.affectedEntities.affectedRoutes;
        }

        return [];
    };

    return getAffectedEntities();
};

export const useDiversionValidation = (disruption, affectedEntities, diversions = []) => {
    const isAddDiversionEnabled = useMemo(() => {
        if (!disruption) {
            return false;
        }

        if (disruption.status === 'resolved') {
            return false;
        }

        const allowedStatuses = ['not-started', 'in-progress', 'draft'];
        const isStatusAllowed = allowedStatuses.includes(disruption.status);
        if (!isStatusAllowed) return false;

        if (disruption.status !== 'draft' && disruption.status !== 'not-started') {
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
    }, [disruption, affectedEntities, diversions]);

    return isAddDiversionEnabled;
};

export const getDiversionValidation = (disruption, affectedEntities, diversions = []) => {
    if (!disruption) {
        return false;
    }

    if (disruption.status === 'resolved') {
        return false;
    }

    const allowedStatuses = ['not-started', 'in-progress', 'draft'];
    const isStatusAllowed = allowedStatuses.includes(disruption.status);
    if (!isStatusAllowed) return false;

    if (disruption.status !== 'draft' && disruption.status !== 'not-started') {
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
