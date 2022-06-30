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
