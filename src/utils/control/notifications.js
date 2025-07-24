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
    let filtered = notifications;
    if (query.parentDisruptionId != null && useNotificationEffectColumn) {
        filtered = notifications.filter(
            n => n.source?.parentIdentifier === Number(query.parentDisruptionId),
        );
    }

    if (query.disruptionId != null && query.version != null) {
        filtered = filtered.filter(
            n => n.source?.identifier === Number(query.disruptionId) && n.source?.version === Number(query.version),
        );
    } else {
        const maxIdentifier = Math.max(...filtered.map(n => n.source.identifier));
        const withMaxIdentifier = filtered.filter(n => n.source.identifier === maxIdentifier);

        return withMaxIdentifier.reduce(
            (max, curr) => (curr.source.version > max.source.version ? curr : max),
            withMaxIdentifier[0],
        );
    }

    return filtered.length === 0 ? null : filtered[0];
};
