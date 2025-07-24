import { uniqueId } from 'lodash-es';

export const getTitle = (items) => {
    const infos = items.find(element => element.name === 'title');
    if (infos) return infos.content;
    return '';
};

export const getDescription = (items) => {
    const infos = items.find(element => element.name === 'description');
    if (infos) return infos.content;
    return '';
};

export const getAndParseInformedEntities = informedEntities => (
    informedEntities.map((informedEntity) => {
        const { informedEntityType, stops, routes, ...entity } = informedEntity;
        if (informedEntityType === 'route') {
            return stops.length
                ? stops.map(({ informedEntityType: _i, routes: _r, ...stop }) => ({ ...stop, text: stop.stopCode, ...entity, type: 'route' }))
                : { ...entity, type: 'route' };
        }
        return routes.length
            ? routes.map(({ informedEntityType: _i, stops: _s, ...route }) => ({ ...route, ...entity, text: entity.stopCode, type: 'stop' }))
            : { ...entity, text: entity.stopCode, type: 'stop' };
    }).flat()
);

export const flatInformedEntities = (informedEntities) => {
    const result = [];
    informedEntities.forEach((entity) => {
        result.push(entity);
        entity.routes?.forEach((routeChild) => {
            result.push(routeChild);
        });
        entity.stops?.forEach((stopChild) => {
            result.push(stopChild);
        });
    });
    return result;
};

export const buildQueryParams = (query, useNotificationEffectColumn) => [
    ...(query.parentDisruptionId && useNotificationEffectColumn
        ? [{ id: uniqueId(), columnField: 'parentSourceId', operatorValue: '==', value: query.parentDisruptionId }]
        : []),
    ...(query.disruptionId != null
        ? [{ id: uniqueId(), columnField: 'sourceId', operatorValue: '==', value: { id: query.disruptionId, source: 'DISR' } }]
        : []),
    { id: uniqueId(), columnField: 'sourceType', operatorValue: '==', value: query.source },
];

export const findNotificationByQuery = (query, notifications, useNotificationEffectColumn) => {
    const filtered = notifications.filter((n) => {
        if (query.parentDisruptionId != null && useNotificationEffectColumn) {
            if (n.source?.parentIdentifier !== Number(query.parentDisruptionId)) return false;
        }
        if (query.disruptionId != null && n.source?.identifier !== Number(query.disruptionId)) return false;
        return !(query.version != null && n.source?.version !== Number(query.version));
    });

    if (filtered.length === 0) return null;

    if (filtered.length === 1) return filtered[0];

    // Sort by identifier descending, then version descending
    return filtered.sort((a, b) => b.source.identifier - a.source.identifier
        || b.source.version - a.source.version)[0];
};
