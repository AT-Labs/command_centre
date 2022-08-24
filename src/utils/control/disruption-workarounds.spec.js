import {
    isWorkaroundTypeDisable,
    mergeWorkarounds,
    updateWorkaroundsByAffectedEntities,
    generateWorkaroundsUIOptions,
    getFirstWorkaroundTextInTheSameGroup,
    getWorkaroundsAsText,
} from './disruption-workarounds';
import { DISRUPTION_TYPE, WORKAROUND_TYPES } from '../../types/disruptions-types';

export const routeBasedEffectedEntities = [
    {
        routeShortName: '83',
        routeId: '83-123',
        type: 'route',
    },
    {
        routeShortName: 'NX1',
        routeId: 'NX1-203',
        stopId: '4222-hash',
        stopCode: '4222',
        stopName: 'Stop A Constellation',
        type: 'route',
    },
    {
        routeShortName: 'NX2',
        routeId: 'NX2-203',
        stopId: '4222-hash',
        stopCode: '4222',
        stopName: 'Stop A Constellation',
        type: 'route',
    },
    {
        routeShortName: 'NX2',
        routeId: 'NX2-203',
        stopId: '7037-hash',
        stopCode: '7037',
        stopName: 'Daldy Street',
        type: 'route',
    },
];

const stopBasedEffectedEntities = [
    {
        routeShortName: 'NX1',
        routeId: 'NX1-203',
        stopId: '4222-hash',
        stopCode: '4222',
        stopName: 'Stop A Constellation',
        type: 'stop',
    },
    {
        routeShortName: 'NX2',
        routeId: 'NX2-203',
        stopId: '4222-hash',
        stopCode: '4222',
        stopName: 'Stop A Constellation',
        type: 'stop',
    },
    {
        routeShortName: 'NX2',
        routeId: 'NX2-203',
        stopId: '7037-hash',
        stopCode: '7037',
        stopName: 'Daldy Street',
        type: 'stop',
    },
    {
        stopId: '1377-hash',
        stopCode: '1377',
        stopName: '47 Lunn Avenue',
        type: 'stop',
    },
];

const workaroundsForAll = [{
    type: 'all',
    workaround: 'workaround text for all',
}];

const workaroundsByRoute = [{
    type: 'route',
    routeShortName: '83',
    workaround: 'workaround text for route 1',
}, {
    type: 'route',
    routeShortName: 'NX1',
    stopCode: '4222',
    workaround: 'workaround text for route NX1',
}, {
    type: 'route',
    routeShortName: 'NX2',
    stopCode: '4222',
    workaround: 'workaround text for route NX2',
}, {
    type: 'route',
    routeShortName: 'NX2',
    stopCode: '7037',
    workaround: 'workaround text for route NX2',
}];

const workaroundsByStop = [{
    type: 'stop',
    routeShortName: 'NX1',
    stopCode: '4222',
    workaround: 'workaround text for stop 1',
}, {
    type: 'stop',
    routeShortName: 'NX2',
    stopCode: '7037',
    workaround: 'workaround text for stop 2',
}];

describe('getFirstWorkaroundTextInTheSameGroup', () => {
    test.each([
        { workarounds: [], result: '' },
        { workarounds: undefined, result: '' },
        { workarounds: 'wrong type', result: '' },
    ])('should return empty text if the input is invaid', ({ workarounds, result }) => {
        expect(getFirstWorkaroundTextInTheSameGroup(workarounds)).toEqual(result);
    });

    test('should return first workaround text if has more than 1 workarounds object ', () => {
        expect(getFirstWorkaroundTextInTheSameGroup([workaroundsByRoute[2], workaroundsByRoute[3]])).toEqual(workaroundsByRoute[2].workaround);
    });
});

describe('isWorkaroundTypeDisable', () => {
    test('stop workaround should not be disabled if there are stops in affectedEntities', () => {
        expect(isWorkaroundTypeDisable(routeBasedEffectedEntities, DISRUPTION_TYPE.ROUTES, WORKAROUND_TYPES.stop.key)).toEqual(false);
    });
    test('stop workaround should be disabled if there is no stop in affectedEntities', () => {
        expect(isWorkaroundTypeDisable([routeBasedEffectedEntities[0]], DISRUPTION_TYPE.ROUTES, WORKAROUND_TYPES.stop.key)).toEqual(true);
    });
    test('route workaround should not be disabled if there are routes in affectedEntities', () => {
        expect(isWorkaroundTypeDisable(stopBasedEffectedEntities, DISRUPTION_TYPE.ROUTES, WORKAROUND_TYPES.route.key)).toEqual(false);
    });
    test('route workaround should be disabled if there is no route in affectedEntities', () => {
        expect(isWorkaroundTypeDisable([stopBasedEffectedEntities[3]], DISRUPTION_TYPE.ROUTES, WORKAROUND_TYPES.route.key)).toEqual(true);
    });
    test('route workaround should be disabled if there is no affectedEntities', () => {
        expect(isWorkaroundTypeDisable(undefined, DISRUPTION_TYPE.ROUTES, WORKAROUND_TYPES.route.key)).toEqual(true);
    });
});

describe('mergeWorkarounds', () => {
    test.each([undefined, null, []])('should not merge if there is no existing workarounds', (invalidExistingWorkarounds) => {
        const currentEditingWorkarounds = {
            key: 'NX1',
            workarounds: workaroundsByRoute[1],
        };
        expect(mergeWorkarounds(invalidExistingWorkarounds, currentEditingWorkarounds)).toEqual(currentEditingWorkarounds.workarounds);
    });

    test('should update current editing workarounds and merge to existing one', () => {
        const existingWorkarounds = workaroundsByRoute;
        const currentEditingWorkarounds = {
            key: 'NX2',
            workarounds: [{
                type: 'route',
                routeShortName: 'NX2',
                stopCode: '4222',
                workaround: 'updated workaround text for route NX2',
            }, {
                type: 'route',
                routeShortName: 'NX2',
                stopCode: '7037',
                workaround: 'updated workaround text for route NX2',
            }],
        };
        const expectedResult = [{
            type: 'route',
            routeShortName: '83',
            workaround: 'workaround text for route 1',
        }, {
            type: 'route',
            routeShortName: 'NX1',
            stopCode: '4222',
            workaround: 'workaround text for route NX1',
        }, {
            type: 'route',
            routeShortName: 'NX2',
            stopCode: '4222',
            workaround: 'updated workaround text for route NX2',
        }, {
            type: 'route',
            routeShortName: 'NX2',
            stopCode: '7037',
            workaround: 'updated workaround text for route NX2',
        }];
        expect(mergeWorkarounds(existingWorkarounds, currentEditingWorkarounds, DISRUPTION_TYPE.ROUTES, WORKAROUND_TYPES.route.key)).toEqual(expectedResult);
    });
});

describe('updateWorkaroundsByAffectedEntities', () => {
    test('should not update workaround if workaround for all', () => {
        expect(updateWorkaroundsByAffectedEntities(routeBasedEffectedEntities, workaroundsForAll, DISRUPTION_TYPE.ROUTES, WORKAROUND_TYPES.all.key)).toEqual(workaroundsForAll);
    });
    test('should generate workarounds for the new added routes with the workaround for the same stop if diruption type is stop and workaround type is stop', () => {
        const existingWorkarounds = workaroundsByStop;
        const newAddedWorkaround = {
            type: 'stop',
            routeShortName: 'NX2',
            stopCode: '4222',
            workaround: 'workaround text for stop 1',
        };
        expect(existingWorkarounds).not.toContainEqual(newAddedWorkaround);
        const result = updateWorkaroundsByAffectedEntities(stopBasedEffectedEntities, existingWorkarounds, DISRUPTION_TYPE.STOPS, WORKAROUND_TYPES.stop.key);
        expect(result).toContainEqual(newAddedWorkaround);
    });

    test('should remove workaround when a route is removed from a stop if diruption type is stop and workaround type is stop', () => {
        const existingWorkarounds = workaroundsByStop;
        const effectedEntitiesWithoutNX1 = [stopBasedEffectedEntities[1], stopBasedEffectedEntities[2]];
        const workaroundToBeRemoved = {
            type: 'stop',
            routeShortName: 'NX1',
            stopCode: '4222',
            workaround: 'workaround text for stop 1',
        };
        expect(existingWorkarounds).toContainEqual(workaroundToBeRemoved);
        const result = updateWorkaroundsByAffectedEntities(effectedEntitiesWithoutNX1, existingWorkarounds, DISRUPTION_TYPE.STOPS, WORKAROUND_TYPES.stop.key);
        expect(result).not.toContainEqual(workaroundToBeRemoved);
    });

    test('should remove all workarounds when removed all effectedEntities', () => {
        const existingWorkarounds = workaroundsByStop;
        const result = updateWorkaroundsByAffectedEntities([], existingWorkarounds, DISRUPTION_TYPE.ROUTES, WORKAROUND_TYPES.stop.key);
        expect(result).toEqual([]);
    });

    test('should try to keep the workarounds for those with the same route and stop when disruption type is changed', () => {
        const existingWorkarounds = workaroundsByRoute;
        const result = updateWorkaroundsByAffectedEntities(stopBasedEffectedEntities, existingWorkarounds, DISRUPTION_TYPE.ROUTES, WORKAROUND_TYPES.route.key);
        expect(result).toEqual([{
            type: 'route',
            routeShortName: 'NX1',
            stopCode: '4222',
            workaround: 'workaround text for route NX1',
        }, {
            type: 'route',
            routeShortName: 'NX2',
            stopCode: '4222',
            workaround: 'workaround text for route NX2',
        }, {
            type: 'route',
            routeShortName: 'NX2',
            stopCode: '7037',
            workaround: 'workaround text for route NX2',
        }]);
    });
});

describe('generateWorkaroundsUIOptions', () => {
    const allCases = [{
        caseDescription: 'route-based disruption, no existing workarounds, workaround for all',
        affectedEntities: routeBasedEffectedEntities,
        existingWorkarounds: undefined,
        disruptionType: DISRUPTION_TYPE.ROUTES,
        workaroundType: WORKAROUND_TYPES.all.key,
        expectResult: [{
            label: 'Workaround',
            helperText: 'Applies to all selected stops for routes 83, NX1, NX2',
            key: 'all',
            workaroundKey: 'all',
            workaroundText: '',
            workaroundType: 'all',
        }],
    },
    {
        caseDescription: 'route-based disruption, existing workarounds, workaround for all',
        affectedEntities: routeBasedEffectedEntities,
        existingWorkarounds: workaroundsForAll,
        disruptionType: DISRUPTION_TYPE.ROUTES,
        workaroundType: WORKAROUND_TYPES.all.key,
        expectResult: [{
            workaroundText: 'workaround text for all',
        }],
    },
    {
        caseDescription: 'route-based disruption, no existing workarounds, workaround for all, single entity',
        affectedEntities: [routeBasedEffectedEntities[0]],
        existingWorkarounds: undefined,
        disruptionType: DISRUPTION_TYPE.ROUTES,
        workaroundType: WORKAROUND_TYPES.all.key,
        expectResult: [{
            label: 'Workaround',
            helperText: 'Applies to all selected stops for route 83',
            key: 'all',
            workaroundKey: 'all',
            workaroundText: '',
            workaroundType: 'all',
        }],
    },
    {
        caseDescription: 'route-based disruption, no existing workarounds, workaround by route',
        affectedEntities: routeBasedEffectedEntities,
        existingWorkarounds: undefined,
        disruptionType: DISRUPTION_TYPE.ROUTES,
        workaroundType: WORKAROUND_TYPES.route.key,
        expectResult: [{
            label: '83',
            helperText: 'Applies to route 83',
            key: '83',
            workaroundKey: '83',
            workaroundText: '',
            workaroundType: 'route',
        },
        {
            label: 'NX1',
            helperText: 'Applies to stop 4222 for route NX1',
            key: 'NX1',
            workaroundKey: 'NX1',
            workaroundText: '',
            workaroundType: 'route',
        },
        {
            label: 'NX2',
            helperText: 'Applies to stops 4222, 7037 for route NX2',
            key: 'NX2',
            workaroundKey: 'NX2',
            workaroundText: '',
            workaroundType: 'route',
        }],
    },
    {
        caseDescription: 'route-based disruption, existing workarounds, workaround by route',
        affectedEntities: routeBasedEffectedEntities,
        existingWorkarounds: workaroundsByRoute,
        disruptionType: DISRUPTION_TYPE.ROUTES,
        workaroundType: WORKAROUND_TYPES.route.key,
        expectResult: [{
            workaroundText: 'workaround text for route 1',
        },
        {
            workaroundText: 'workaround text for route NX1',
        },
        {
            workaroundText: 'workaround text for route NX2',
        }],
    },
    {
        caseDescription: 'route-based disruption, no existing workarounds, workaround by stop',
        affectedEntities: routeBasedEffectedEntities,
        existingWorkarounds: undefined,
        disruptionType: DISRUPTION_TYPE.ROUTES,
        workaroundType: WORKAROUND_TYPES.stop.key,
        expectResult: [{
            label: '4222 Stop A Constellation',
            helperText: 'Applies to stop 4222 for routes NX1, NX2',
            key: '4222',
            workaroundKey: '4222',
            workaroundText: '',
            workaroundType: 'stop',
        },
        {
            label: '7037 Daldy Street',
            helperText: 'Applies to stop 7037 for route NX2',
            key: '7037',
            workaroundKey: '7037',
            workaroundText: '',
            workaroundType: 'stop',
        }],
    },
    {
        caseDescription: 'route-based disruption, existing workarounds, workaround by stop',
        affectedEntities: routeBasedEffectedEntities,
        existingWorkarounds: workaroundsByStop,
        disruptionType: DISRUPTION_TYPE.ROUTES,
        workaroundType: WORKAROUND_TYPES.stop.key,
        expectResult: [{
            workaroundText: 'workaround text for stop 1',
        },
        {
            workaroundText: 'workaround text for stop 2',
        }],
    },
    {
        caseDescription: 'stop-based disruption, no existing workarounds, workaround for all',
        affectedEntities: stopBasedEffectedEntities,
        existingWorkarounds: undefined,
        disruptionType: DISRUPTION_TYPE.STOPS,
        workaroundType: WORKAROUND_TYPES.all.key,
        expectResult: [{
            label: 'Workaround',
            helperText: 'Applies to all selected routes at stops 1377, 4222, 7037',
            key: 'all',
            workaroundKey: 'all',
            workaroundText: '',
            workaroundType: 'all',
        }],
    },
    {
        caseDescription: 'stop-based disruption, no existing workarounds, workaround by route',
        affectedEntities: stopBasedEffectedEntities,
        existingWorkarounds: undefined,
        disruptionType: DISRUPTION_TYPE.STOPS,
        workaroundType: WORKAROUND_TYPES.route.key,
        expectResult: [{
            label: 'NX1',
            helperText: 'Applies to route NX1 at stop 4222',
            key: 'NX1',
            workaroundKey: 'NX1',
            workaroundText: '',
            workaroundType: 'route',
        },
        {
            label: 'NX2',
            helperText: 'Applies to route NX2 at stops 4222, 7037',
            key: 'NX2',
            workaroundKey: 'NX2',
            workaroundText: '',
            workaroundType: 'route',
        }],
    },
    {
        caseDescription: 'stop-based disruption, no existing workarounds, workaround by stop',
        affectedEntities: stopBasedEffectedEntities,
        existingWorkarounds: undefined,
        disruptionType: DISRUPTION_TYPE.STOPS,
        workaroundType: WORKAROUND_TYPES.stop.key,
        expectResult: [{
            label: '1377 47 Lunn Avenue',
            helperText: 'Applies to stop 1377',
            key: '1377',
            workaroundKey: '1377',
            workaroundText: '',
            workaroundType: 'stop',
        },
        {
            label: '4222 Stop A Constellation',
            helperText: 'Applies to routes NX1, NX2 at stop 4222',
            key: '4222',
            workaroundKey: '4222',
            workaroundText: '',
            workaroundType: 'stop',
        },
        {
            label: '7037 Daldy Street',
            helperText: 'Applies to route NX2 at stop 7037',
            key: '7037',
            workaroundKey: '7037',
            workaroundText: '',
            workaroundType: 'stop',
        }],
    }];

    test.each(allCases)('$caseDescription', ({ affectedEntities, existingWorkarounds, disruptionType, workaroundType, expectResult }) => {
        const workaroundOptions = generateWorkaroundsUIOptions(affectedEntities, existingWorkarounds, disruptionType, workaroundType);
        expect(workaroundOptions.length).toEqual(expectResult.length);
        workaroundOptions.forEach((workaroundOption, index) => expect(workaroundOption).toEqual(expect.objectContaining(expectResult[index])));
    });
});

describe('getWorkaroundsAsText', () => {
    test('should return a workaround as text(all)', () => {
        const workaround = [
            {
                type: 'all',
                workaround: 'Workaround for all',
            },
        ];
        expect(getWorkaroundsAsText(workaround)).toEqual('Workaround for all');
    });
    test('should return a route workaround as text', () => {
        const workaroundOne = [
            {
                type: 'route',
                stopCode: '4981',
                workaround: 'Workaround to stop 4981',
                routeShortName: 'NX1',
            },
        ];

        const workaroundTwo = [
            {
                type: 'route',
                workaround: 'Workaround for NX1',
                routeShortName: 'NX1',
            },
            {
                type: 'route',
                workaround: 'Workaround for NX2',
                routeShortName: 'NX2',
            },
        ];

        const workaroundThree = [
            {
                type: 'route',
                workaround: 'Applies to route N10',
                routeShortName: 'N10',
            },
            {
                type: 'route',
                workaround: 'Applies to route N10',
                routeShortName: 'N10',
            },
        ];

        expect(getWorkaroundsAsText(workaroundOne)).toEqual('[NX1]Workaround to stop 4981');
        expect(getWorkaroundsAsText(workaroundTwo)).toEqual('[NX1]Workaround for NX1; [NX2]Workaround for NX2');
        expect(getWorkaroundsAsText(workaroundThree)).toEqual('[N10]Applies to route N10');
    });
    test('should return a stop workaround as text', () => {
        const workaround = [
            {
                type: 'stop',
                workaround: 'Workaround for NX1',
                routeShortName: 'NX1',
                stopCode: 'Stop 404',
            },
            {
                type: 'stop',
                workaround: 'Workaround for NX2',
                routeShortName: 'NX2',
                stopCode: 'Stop 123',
            },
        ];
        expect(getWorkaroundsAsText(workaround)).toEqual('[Stop 404]Workaround for NX1; [Stop 123]Workaround for NX2');
    });
});
