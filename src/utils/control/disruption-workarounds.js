import pluralize from 'pluralize';
import { groupBy } from 'lodash-es';
import { DISRUPTION_TYPE, WORKAROUND_TYPES } from '../../types/disruptions-types';

const groupByProperties = {
    [DISRUPTION_TYPE.ROUTES]: {
        [WORKAROUND_TYPES.all.key]: 'routeShortName',
        [WORKAROUND_TYPES.route.key]: 'routeShortName',
        [WORKAROUND_TYPES.stop.key]: 'stopCode',
    },
    [DISRUPTION_TYPE.STOPS]: {
        [WORKAROUND_TYPES.all.key]: 'stopCode',
        [WORKAROUND_TYPES.route.key]: 'routeShortName',
        [WORKAROUND_TYPES.stop.key]: 'stopCode',
    },
};

const labelGenerators = {
    [WORKAROUND_TYPES.all.key]: () => 'Workaround',
    [WORKAROUND_TYPES.route.key]: ({ routeShortName }) => routeShortName,
    [WORKAROUND_TYPES.stop.key]: ({ stopCode, stopName }) => `${stopCode} ${stopName}`,
};

const helperTextProperties = {
    [DISRUPTION_TYPE.ROUTES]: {
        preposition: 'for',
        childEntityType: 'stop',
        childEntityNameProperty: 'stopCode',
        parentEntityType: 'route',
        parentEntityNameProperty: 'routeShortName',
    },
    [DISRUPTION_TYPE.STOPS]: {
        preposition: 'at',
        childEntityType: 'route',
        childEntityNameProperty: 'routeShortName',
        parentEntityType: 'stop',
        parentEntityNameProperty: 'stopCode',
    },
};

const generateEntitySentence = (entitiesInSameGroup, entityType, entityNameProperty) => {
    const entityNames = entitiesInSameGroup.filter(affectedEntity => affectedEntity[entityNameProperty]).map(entity => entity[entityNameProperty]);
    const uniqueEntityNames = [...new Set(entityNames)];
    return uniqueEntityNames.length ? `${pluralize(entityType, uniqueEntityNames.length)} ${uniqueEntityNames.join(', ')}` : '';
};

const groupWorkaroundsOrAffectedEntities = (objects, disruptionType, workaroundType) => {
    if (!objects || !Array.isArray(objects)) {
        return {};
    }
    const groupByProperty = groupByProperties[disruptionType]?.[workaroundType];
    if (!groupByProperty) {
        return {};
    }
    return groupBy(objects.filter(object => object && object[groupByProperty]), groupByProperty);
};

export const getFirstWorkaroundTextInTheSameGroup = workaroundsInOneGroup => workaroundsInOneGroup?.[0]?.workaround || '';

export const isWorkaroundTypeDisable = (affectedEntities, disruptionType, workaroundType) => {
    if (!affectedEntities || !Array.isArray(affectedEntities)) {
        return true;
    }
    const groupByProperty = groupByProperties[disruptionType]?.[workaroundType];
    if (!groupByProperty) {
        return true;
    }
    return !affectedEntities.filter(object => object && object[groupByProperty]).length;
};

export const mergeWorkarounds = (existingWorkarounds, newWorkarounds, disruptionType, workaroundType) => {
    if (!existingWorkarounds?.length) {
        return newWorkarounds.workarounds;
    }
    const groupedWorkarounds = groupWorkaroundsOrAffectedEntities(existingWorkarounds, disruptionType, workaroundType);
    groupedWorkarounds[newWorkarounds.key] = newWorkarounds.workarounds;
    return Object.values(groupedWorkarounds).flat();
};

export const updateWorkaroundsByAffectedEntities = (affectedEntities, existingWorkarounds, disruptionType, workaroundType) => {
    if (workaroundType === WORKAROUND_TYPES.all.key) {
        return existingWorkarounds;
    }
    const newWorkarounds = [];
    const groupedEntities = groupWorkaroundsOrAffectedEntities(affectedEntities, disruptionType, workaroundType);
    const groupedWorkarounds = groupWorkaroundsOrAffectedEntities(existingWorkarounds, disruptionType, workaroundType);
    const groupedNames = Object.keys(groupedEntities);
    groupedNames.forEach((groupedName) => {
        const entitiesInSameGroup = groupedEntities[groupedName];
        const workaroundValue = groupedWorkarounds[groupedName]?.[0]?.workaround;
        if (workaroundValue) {
            entitiesInSameGroup.forEach(({ stopCode, routeShortName }) => {
                newWorkarounds.push({ stopCode, routeShortName, type: workaroundType, workaround: workaroundValue });
            });
        }
    });
    return newWorkarounds;
};

export const generateWorkaroundsUIOptions = (affectedEntities, existingWorkarounds, disruptionType, workaroundType) => {
    const workaroundItems = [];
    

    const helperTextConfig = helperTextProperties[disruptionType];
    if (!helperTextConfig) {
        console.warn('🔧 generateWorkaroundsUIOptions: Unknown disruptionType:', disruptionType);
        return workaroundItems;
    }
    
    const { preposition, childEntityType, parentEntityType, childEntityNameProperty, parentEntityNameProperty } = helperTextConfig;
    const labelGenerator = labelGenerators[workaroundType];
    let childEntitySentence;
    let parentEntitySentence;
    const groupedEntities = groupWorkaroundsOrAffectedEntities(affectedEntities, disruptionType, workaroundType);
    const groupedWorkarounds = groupWorkaroundsOrAffectedEntities(existingWorkarounds, disruptionType, workaroundType);
    const groupedNames = Object.keys(groupedEntities);
    if (workaroundType === WORKAROUND_TYPES.all.key) {
        childEntitySentence = `all selected ${pluralize(childEntityType, 2)} ${preposition} `;
        parentEntitySentence = `${pluralize(parentEntityType, groupedNames.length)} ${groupedNames.join(', ')}`;
        const helperText = `Applies to ${childEntitySentence}${parentEntitySentence}`;
        workaroundItems.push({
            workaroundType,
            label: labelGenerator(),
            helperText,
            workaroundKey: 'all',
            key: 'all',
            workaroundText: getFirstWorkaroundTextInTheSameGroup(existingWorkarounds),
        });
    } else {
        groupedNames.forEach((groupedName) => {
            const entitiesInSameGroup = groupedEntities[groupedName];
            childEntitySentence = generateEntitySentence(entitiesInSameGroup, childEntityType, childEntityNameProperty);
            const childEntitySentenceWithPreposition = `${childEntitySentence} ${preposition} `;
            parentEntitySentence = generateEntitySentence(entitiesInSameGroup, parentEntityType, parentEntityNameProperty);
            const helperText = `Applies to ${childEntitySentence.length ? childEntitySentenceWithPreposition : ''}${parentEntitySentence}`;
            workaroundItems.push({
                workaroundType,
                label: labelGenerator(entitiesInSameGroup[0]),
                helperText,
                workaroundKey: groupedName,
                key: groupedName,
                entities: entitiesInSameGroup,
                workaroundText: getFirstWorkaroundTextInTheSameGroup(groupedWorkarounds[groupedName]),
            });
        });
    }
    return workaroundItems;
};

export const getWorkaroundsAsText = (workarounds, separator = '; ') => {
    const parseWorkaround = (workaroundInstance) => {
        let key = null;
        if (workaroundInstance.type === 'route') {
            key = workaroundInstance.routeShortName;
        } else if (workaroundInstance.type === 'stop') {
            key = workaroundInstance.stopCode;
        }
        if (key) {
            return `[${key}]${workaroundInstance.workaround}`;
        }
        return workaroundInstance.workaround;
    };
    const workaroundsAsText = workarounds.map(workaround => parseWorkaround(workaround));
    return [...new Set(workaroundsAsText)].join(separator);
};
