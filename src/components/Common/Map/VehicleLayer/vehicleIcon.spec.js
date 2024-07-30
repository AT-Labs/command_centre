import { UNSCHEDULED_TAG } from '../../../../types/vehicle-types';
import { getVehicleIcon } from './vehicleIcon';

describe('vehicleIcon', () => {
    it('should return icon with empty route name and unscheduled class for vehicle with UNSCHEDULED route', () => {
        const vehicle = {
            id: '59253',
            vehicle: {
                position: {
                    latitude: -36.881771666666666,
                    longitude: 174.78580666666667,
                    bearing: 317,
                    odometer: 331884613,
                    speed: 4.722222222222222,
                },
                timestamp: '1721271497',
                vehicle: {
                    id: '59253',
                },
                occupancyStatus: 'EMPTY',
                tags: [UNSCHEDULED_TAG],
                route: {
                    route_id: UNSCHEDULED_TAG,
                    route_type: 3,
                    extended_route_type: 3,
                    route_short_name: UNSCHEDULED_TAG,
                    agency_name: '',
                    agency_id: '',
                    route_color: null,
                    route_text_color: null,
                    tokens: [],
                },
            },
        };

        const result = getVehicleIcon(vehicle, 'op-highlight');

        expect(result.options.html).toEqual(expect.stringContaining('vehicle-type-bus unscheduled  op-highlight'));
        expect(result.options.html).toEqual(expect.stringContaining('<div class="vehicle-marker-route-name"></div>'));
    });
});
