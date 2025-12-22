import { isEmpty, uniqBy, flatMap, forEach } from 'lodash-es';
import moment from 'moment';
import { getJSONFromWKT } from '../helpers';
import { STATUSES } from '../../types/disruptions-types';
import { DATE_FORMAT_DDMMYYYY as DATE_FORMAT } from '../dateUtils';
import { momentFromDateTime } from './disruptions';
import { TIME_FORMAT } from '../../constants/disruptions';

export function getShapes(affectedRoutes, affectedStops) {
    const allAffectedRoutes = uniqBy(
        [...affectedRoutes, ...affectedStops.filter(stop => stop.routeId)],
        route => route.routeId,
    );

    if (!isEmpty(allAffectedRoutes)) {
        const withShapes = [];
        forEach(flatMap(allAffectedRoutes), (r) => {
            if (r.shapeWkt) {
                const shape = getJSONFromWKT(r.shapeWkt);
                const coordinates = shape.coordinates.map(c => c.reverse());
                withShapes.push(coordinates);
            } else {
                withShapes.push(null);
            }
        });

        return withShapes;
    }

    return [];
}

export function getRouteColors(affectedRoutes, affectedStops) {
    const allAffectedRoutes = uniqBy(
        [...affectedRoutes, ...affectedStops.filter(stop => stop.routeId)],
        route => route.routeId,
    );

    if (!isEmpty(allAffectedRoutes)) {
        const withRouteColors = [];
        forEach(flatMap(allAffectedRoutes), (r) => {
            withRouteColors.push(r.routeColor || null);
        });

        return withRouteColors;
    }

    return [];
}

export const getEntityCounts = (disruption) => {
    if (!disruption?.affectedEntities) {
        return { routesCount: 0, stopsCount: 0, entitiesCount: 0 };
    }

    const routesCount = disruption.affectedEntities.affectedRoutes?.length || 0;
    const stopsCount = disruption.affectedEntities.affectedStops?.length || 0;
    const entitiesCount = routesCount + stopsCount;

    return { routesCount, stopsCount, entitiesCount };
};

export const generateSelectedText = (routesCount, stopsCount) => {
    let selectedText = '';
    if (routesCount > 0) {
        selectedText = 'routes';
    }
    if (stopsCount > 0) {
        if (selectedText.length > 0) {
            selectedText += ' and stops';
        } else {
            selectedText = 'stops';
        }
    }
    return selectedText;
};

export const mergeExistingAndDrawnEntities = (existingEntities, drawnEntities) => {
    let newRoutes = drawnEntities?.filter(e => e.type === 'route') || [];
    let newStops = drawnEntities?.filter(e => e.type === 'stop') || [];
    if (Array.isArray(existingEntities.affectedRoutes) && existingEntities.affectedRoutes.length > 0) {
        newRoutes = newRoutes.filter(newRoute => !existingEntities.affectedRoutes.some(existingRoute => existingRoute.routeId === newRoute.routeId));
    }

    if (Array.isArray(existingEntities.affectedStops) && existingEntities.affectedStops.length > 0) {
        newStops = newStops.filter(newStop => !existingEntities.affectedStops.some(existingStop => existingStop.stopId === newStop.stopId));
    }

    const mergedRoutes = [...existingEntities.affectedRoutes, ...newRoutes];
    const mergedStops = [...existingEntities.affectedStops, ...newStops];
    return {
        affectedRoutes: mergedRoutes,
        affectedStops: mergedStops,
    };
};

export const buildPublishPayload = incident => ({
    ...incident,
    status: STATUSES.NOT_STARTED,
    disruptions: (incident.disruptions || []).map(disruption => ({
        ...disruption,
        status: STATUSES.NOT_STARTED,
    })),
});

export const filterDisruptionsBySearchTerm = (disruptions, searchTerm) => {
    if (!disruptions || !searchTerm) {
        return disruptions || [];
    }

    const term = searchTerm.toLowerCase();

    return disruptions.filter((disruption) => {
        const impactMatches = disruption.impact?.toLowerCase().includes(term);
        if (impactMatches) {
            return true;
        }
        const routeMatches = disruption.affectedEntities?.affectedRoutes?.some(
            route => route.routeShortName?.toLowerCase().includes(term),
        );
        if (routeMatches) {
            return true;
        }
        const stopMatches = disruption.affectedEntities?.affectedStops?.some(
            stop => stop.text?.toLowerCase().includes(term),
        );
        if (stopMatches) {
            return true;
        }

        return false;
    });
};

export const removeDuplicatesByKey = (array, getKey) => {
    if (!array || array.length === 0) {
        return [];
    }
    return array.filter((item, index, self) => index === self.findIndex(i => getKey(i) === getKey(item)));
};

export const isDateFieldValid = date => moment(date, DATE_FORMAT, true).isValid();
export const isTimeFieldValid = time => time !== '24:00' && moment(time, TIME_FORMAT, true).isValid();

export const startDateTimeWillBeAutomaticallyUpdated = (startDate, startTime, disruptions) => {
    if (!Array.isArray(disruptions) || disruptions.length === 0 || !isDateFieldValid(startDate) || !isTimeFieldValid(startTime)) {
        return false;
    }
    const disruptionStartTimes = disruptions.reduce((momentStartTimes, disruption) => {
        if (!isDateFieldValid(disruption.startDate) || !isTimeFieldValid(disruption.startTime)) {
            return momentStartTimes;
        }
        momentStartTimes.push(momentFromDateTime(disruption.startDate, disruption.startTime));
        return momentStartTimes;
    }, []);
    if (disruptionStartTimes.length === 0) {
        return false;
    }
    const earliestDisruptionsStartTime = moment.min(disruptionStartTimes);
    const incidentStartTimeMoment = momentFromDateTime(startDate, startTime);
    if (earliestDisruptionsStartTime && incidentStartTimeMoment) {
        return earliestDisruptionsStartTime.isBefore(incidentStartTimeMoment);
    }

    return false;
};

export const endDateTimeWillBeAutomaticallyUpdated = (endDate, endTime, disruptions, recurrent = false) => {
    if (!Array.isArray(disruptions) || disruptions.length === 0 || !isDateFieldValid(endDate) || (!recurrent && !isTimeFieldValid(endTime))) {
        return false;
    }

    const disruptionEndTimes = disruptions.reduce((momentEndTimes, disruption) => {
        if (!isDateFieldValid(disruption.endDate) || (!recurrent && !isTimeFieldValid(disruption.endTime))) {
            return momentEndTimes;
        }
        momentEndTimes.push(momentFromDateTime(disruption.endDate, recurrent ? '23:59' : disruption.endTime));
        return momentEndTimes;
    }, []);
    if (disruptionEndTimes.length === 0) {
        return false;
    }
    const latestDisruptionsEndTime = moment.max(disruptionEndTimes);
    const incidentEndTimeMoment = momentFromDateTime(endDate, recurrent ? '23:59' : endTime);
    if (latestDisruptionsEndTime && incidentEndTimeMoment) {
        return latestDisruptionsEndTime.isAfter(incidentEndTimeMoment);
    }

    return false;
};
