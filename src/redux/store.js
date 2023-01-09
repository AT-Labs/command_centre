/* eslint-disable no-underscore-dangle */
// import logger from 'redux-logger';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import thunk from 'redux-thunk';
import activity from './reducers/activity';
import blocks from './reducers/control/blocks';
import link from './reducers/control/link';
import alerts from './reducers/control/alerts';
import fleets from './reducers/control/fleets';
import platforms from './reducers/control/platforms';
import addRecurringCancellations from './reducers/control/routes/addRecurringCancellations';
import controlFilters from './reducers/control/routes/filters';
import controlRoutes from './reducers/control/routes/routes';
import controlRouteVariants from './reducers/control/routes/routeVariants';
import controlTripInstances from './reducers/control/routes/trip-instances';
import controlRecurringCancellations from './reducers/control/routes/recurringCancellations';
import serviceDate from './reducers/control/serviceDate';
import stopMessaging from './reducers/control/stopMessaging';
import disruptions from './reducers/control/disruptions';
import navigation from './reducers/navigation';
import detail from './reducers/realtime/detail';
import quickview from './reducers/realtime/quickview';
import map from './reducers/realtime/map';
import vehicles from './reducers/realtime/vehicles';
import search from './reducers/search';
import agencies from './reducers/static/agencies';
import agenciesWithDepots from './reducers/control/agencies';
import fleet from './reducers/static/fleet';
import routes from './reducers/static/routes';
import stops from './reducers/static/stops';
import user from './reducers/user';
import controlTripReplayFilters from './reducers/control/tripReplays/filters';
import controlTripReplayView from './reducers/control/tripReplays/tripReplayView';
import vehicleReplay from './reducers/control/vehicleReplays/vehicleReplay';
import currentTrip from './reducers/control/tripReplays/currentTrip';
import prevFilterValue from './reducers/control/tripReplays/prevFilterValue';
import tripReplaysMap from './reducers/control/tripReplays/map';
import analytics from './reducers/analytics/analytics';
import dataManagement from './reducers/control/dataManagement';
import appSettings from './reducers/appSettings';
import notifications from './reducers/control/notifications';

const middleware = [thunk];
let composeEnhancers = compose;

if (process.env.NODE_ENV !== 'production') {
    // middleware.push(logger); // logs actions & state in console
    composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
}

export default createStore(
    combineReducers({
        static: combineReducers({
            agencies,
            fleet,
            routes,
            stops,
        }),
        realtime: combineReducers({
            vehicles,
            detail,
            map,
            quickview,
        }),
        control: combineReducers({
            agencies: agenciesWithDepots,
            blocks,
            stopMessaging,
            alerts,
            fleets,
            routes: combineReducers({
                addRecurringCancellations,
                filters: controlFilters,
                routes: controlRoutes,
                routeVariants: controlRouteVariants,
                tripInstances: controlTripInstances,
                recurringCancellations: controlRecurringCancellations,
            }),
            tripReplays: combineReducers({
                filters: controlTripReplayFilters,
                tripReplaysView: controlTripReplayView,
                currentTrip,
                prevFilterValue,
                map: tripReplaysMap,
            }),
            vehicleReplays: combineReducers({
                vehicleReplay,
            }),
            link,
            serviceDate,
            platforms,
            disruptions,
            dataManagement,
            notifications,
            vehicleReplay,
        }),
        analytics,
        activity,
        navigation,
        search,
        user,
        appSettings,
    }),
    {},
    composeEnhancers(
        applyMiddleware(...middleware),
    ),
);
