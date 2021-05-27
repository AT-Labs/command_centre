import { result } from 'lodash-es';
import { createSelector } from 'reselect';
import { getRouteDetail } from './detail';

export const getQuickviewState = state => result(state, 'realtime.quickview');
export const getTripUpdates = createSelector(getQuickviewState, quickviewState => quickviewState.tripUpdates);

export const getActiveRouteVehiclesDelay = createSelector(
    getTripUpdates,
    getRouteDetail,
    (tripUpdates, routeDetail) => {
        const delays = {};
        if (routeDetail.routes) {
            routeDetail.routes.forEach((routeVariants) => {
                routeVariants.vehicles.forEach((vehicle) => {
                    delays[vehicle.id] = result(tripUpdates[vehicle.id], 'delay');
                });
            });
        }
        return delays;
    },
);
