import { keyBy, get } from 'lodash-es';
import { jsonResponseHandling } from '../fetch';
import { getAllRoutes } from './cc-static';
import { getAllRouteMappings } from './gtfs-realtime';

const { REACT_APP_REALTIME_EVENT_STORE } = process.env;

const fetchOccupancyEvents = async (from = '') => fetch(`${REACT_APP_REALTIME_EVENT_STORE}/analytics/occupancy?from=${from}`, { method: 'GET' })
    .then(response => jsonResponseHandling(response))
    .then(data => data);

export const getOccupancyEvents = async (from = '') => Promise.all([
    fetchOccupancyEvents(from),
    getAllRoutes(),
    getAllRouteMappings(),
]).then((results) => {
    const occupancyDatas = results[0];
    const allRoutes = keyBy(results[1], 'route_id');
    const allRouteMappings = keyBy(results[2], 'oldId');
    return occupancyDatas.map(occupancyData => ({ ...occupancyData, ...allRoutes[get(allRouteMappings[occupancyData.route_id], 'newId', '')] }));
});
