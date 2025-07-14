import { BUS_TYPE_ID, TRAIN_TYPE_ID, FERRY_TYPE_ID } from '../types/vehicle-types';
import {
    isTagsQueryValid,
    isStatusQueryValid,
    isOccupancyLevelsValid,
    isRouteTypeQueryValid,
    isIncidentsQueryValid,
    isLiveTrafficQueryValid,
    isMapCenterQueryValid,
    isMapZoomLevelQueryValid,
    isDisruptionsQueryValid,
} from './realtimeMap';

describe('Query Validation Tests', () => {
    test('isTagsQueryValid validates correctly', () => {
        expect(isTagsQueryValid('Smartrak,Torutek')).toBe(true);
        expect(isTagsQueryValid('Smartrak')).toBe(true);
        expect(isTagsQueryValid('InvalidTag')).toBe(false);
        expect(isTagsQueryValid('')).toBe(false);
        expect(isTagsQueryValid('Smartrak,Smartrak')).toBe(false);
        expect(isTagsQueryValid('Smartrak,Torutek,CAF,InvalidTag')).toBe(false);
    });

    test('isStatusQueryValid validates correctly', () => {
        expect(isStatusQueryValid('earlyCustom,lateMoreThan30', '0-30', null)).toBe(true);
        expect(isStatusQueryValid('earlyCustom', '0-30')).toBe(true);
        expect(isStatusQueryValid('earlyCustom', 'invalid')).toBe(false);
        expect(isStatusQueryValid('earlyCustom', '-5-30')).toBe(false);
        expect(isStatusQueryValid('earlyCustom', '0-Invalid')).toBe(false);
        expect(isStatusQueryValid('lateCustom', null, '0-30')).toBe(true);
        expect(isStatusQueryValid('lateCustom', null, 'invalid')).toBe(false);
        expect(isStatusQueryValid('')).toBe(false);
        expect(isStatusQueryValid('earlyCustom,earlyCustom', '0-30')).toBe(false);
        expect(isStatusQueryValid('earlyMoreThan30,lateMoreThan30,notInService,unscheduled', null, null)).toBe(true);
        expect(isStatusQueryValid('earlyMoreThan30,invalid', null, null)).toBe(false);
        expect(isStatusQueryValid('earlyMoreThan30,lateMoreThan30,notInService,unscheduled,invalid', null, null)).toBe(false);
    });

    test('isOccupancyLevelsValid validates correctly', () => {
        expect(isOccupancyLevelsValid('EMPTY,MANY_SEATS_AVAILABLE')).toBe(true);
        expect(isOccupancyLevelsValid('EMPTY')).toBe(true);
        expect(isOccupancyLevelsValid('InvalidStatus')).toBe(false);
        expect(isOccupancyLevelsValid('EMPTY,EMPTY')).toBe(false);
        expect(isOccupancyLevelsValid('')).toBe(false);
    });

    test('isRouteTypeQueryValid validates correctly', () => {
        const allAgencies = [
            { agency_id: '1', route_type: TRAIN_TYPE_ID },
            { agency_id: '2', route_type: BUS_TYPE_ID },
        ];

        expect(isRouteTypeQueryValid(String(TRAIN_TYPE_ID), '1', 'inbound', allAgencies)).toBe(true);
        expect(isRouteTypeQueryValid(String(TRAIN_TYPE_ID), '', 'inbound', allAgencies)).toBe(true);
        expect(isRouteTypeQueryValid(String(BUS_TYPE_ID), 'invalid', 'inbound', allAgencies)).toBe(false);
        expect(isRouteTypeQueryValid(String(FERRY_TYPE_ID), null, null, allAgencies)).toBe(true);
        expect(isRouteTypeQueryValid(String(TRAIN_TYPE_ID), '1', 'invalidSetting', allAgencies)).toBe(false);
        expect(isRouteTypeQueryValid(null, '1', 'inbound', allAgencies)).toBe(false);
        expect(isRouteTypeQueryValid('invalid', '1', 'inbound', allAgencies)).toBe(false);
    });

    test('isIncidentsQueryValid validates correctly', () => {
        expect(isIncidentsQueryValid('Accidents,WeatherEnvironmentalConditions')).toBe(true);
        expect(isIncidentsQueryValid('Accidents')).toBe(true);
        expect(isIncidentsQueryValid('InvalidCategory')).toBe(false);
        expect(isIncidentsQueryValid('Accidents,Accidents')).toBe(false);
        expect(isIncidentsQueryValid('')).toBe(false);
    });

    test('isLiveTrafficQueryValid validates correctly', () => {
        expect(isLiveTrafficQueryValid('Green,DarkOrange')).toBe(true);
        expect(isLiveTrafficQueryValid('Maroon')).toBe(true);
        expect(isLiveTrafficQueryValid('Blue,Black')).toBe(true);
        expect(isLiveTrafficQueryValid('InvalidFilter')).toBe(false);
        expect(isLiveTrafficQueryValid('Green,Green')).toBe(false);
        expect(isLiveTrafficQueryValid('Yellow')).toBe(false);
        expect(isLiveTrafficQueryValid('')).toBe(false);
    });

    test('isMapCenterQueryValid validates correctly', () => {
        expect(isMapCenterQueryValid('37.7749,-122.4194')).toBe(true);
        expect(isMapCenterQueryValid('0,0')).toBe(true);
        expect(isMapCenterQueryValid('InvalidCenter')).toBe(false);
        expect(isMapCenterQueryValid('37.7749')).toBe(true);
        expect(isMapCenterQueryValid('')).toBe(false);
        expect(isMapCenterQueryValid('37.7749,-122.4194,invalid')).toBe(false);
    });

    test('isMapZoomLevelQueryValid validates correctly', () => {
        expect(isMapZoomLevelQueryValid('15')).toBe(true);
        expect(isMapZoomLevelQueryValid('0')).toBe(true);
        expect(isMapZoomLevelQueryValid('-5')).toBe(true);
        expect(isMapZoomLevelQueryValid('InvalidZoom')).toBe(false);
        expect(isMapZoomLevelQueryValid('')).toBe(false);
    });

    test('isDisruptionsQueryValid validates correctly', () => {
        expect(isDisruptionsQueryValid('InvalidFilter')).toBe(false);
        expect(isDisruptionsQueryValid('')).toBe(false);
        expect(isDisruptionsQueryValid('Active, Active')).toBe(false);
        expect(isDisruptionsQueryValid('Active,Planned')).toBe(true);
    });
});
