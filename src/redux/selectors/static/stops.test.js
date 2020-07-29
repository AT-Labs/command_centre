import { expect } from 'chai';
import { getChildStops } from './stops';

const allStopsMock = {
    97: {
        stop_id: '1-97',
        stop_name: 'Papakura Train Station',
        stop_code: '97',
        location_type: 1,
        stop_lat: -37.06429,
        stop_lon: 174.94611,
        parent_station: null,
        platform_code: null,
        route_type: 2,
        parent_stop_code: null,
        tokens: [
            'papakura',
            'train',
            'station',
            '97',
        ],
    },
    1026: {
        stop_id: '1-1026',
        stop_name: '10 Portman Rd',
        stop_code: '1026',
        location_type: 0,
        stop_lat: -36.91159,
        stop_lon: 174.82359,
        parent_station: '1-31496',
        platform_code: '1026',
        route_type: 3,
        parent_stop_code: '31496',
        tokens: [
            '10',
            'portman',
            'rd',
            '1026',
        ],
    },
    9232: {
        stop_id: '1-9232',
        stop_name: 'Pukekohe Train Station 1',
        stop_code: '9232',
        location_type: 0,
        stop_lat: -37.20331,
        stop_lon: 174.91015,
        parent_station: '1-134',
        platform_code: '1',
        route_type: 2,
        parent_stop_code: '134',
        tokens: [
            'pukekohe',
            'train',
            'station',
            '1',
            '9232',
        ],
    },
    61156: {
        stop_id: '1-61156',
        stop_name: 'Atkinson Rd/Glen Eden Intermediate',
        stop_code: '61156',
        location_type: 1,
        stop_lat: -36.92548,
        stop_lon: 174.65188,
        parent_station: null,
        platform_code: null,
        route_type: 3,
        parent_stop_code: null,
        tokens: [
            'atkinson',
            'rd/glen',
            'eden',
            'intermediate',
            '61156',
        ],
    },
};

describe('Static - Stops Selectors', () => {
    context('when selecting child stops', () => {
        it('should return a bus', () => {
            const mutatedAllStopsMock = {
                97: allStopsMock[97],
                1026: allStopsMock[1026],
                61156: allStopsMock[61156],
            };
            const childStops = getChildStops.resultFunc(mutatedAllStopsMock, []);
            expect(childStops).to.eql({ 1026: allStopsMock[1026] });
        });

        it('should return a bus and a train', () => {
            const childStops = getChildStops.resultFunc(allStopsMock, []);
            expect(childStops).to.eql({
                1026: allStopsMock[1026],
                9232: allStopsMock[9232],
            });
        });

        it('should return nothing', () => {
            const mutatedAllStopsMock = {
                97: allStopsMock[97],
                61156: allStopsMock[61156],
            };
            const childStops = getChildStops.resultFunc(mutatedAllStopsMock, []);
            expect(childStops).to.eql({});
        });
    });
});
