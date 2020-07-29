import moment from 'moment';
import _ from 'lodash-es';
import { getViewPermission } from '../helpers';
import { fetchWithAuthHeader } from '../../auth';
import { jsonResponseHandling } from '../fetch';
import HTTP_TYPES from '../../types/http-types';

const { REACT_APP_TRIP_REPLAY_API_URL } = process.env;
const { GET } = HTTP_TYPES;

const parseSelectedDate = (date, time) => moment(date)
    .add(time.substring(0, 2), 'hours')
    .add(time.substring(3), 'minutes')
    .toISOString();

export const getTripReplaysViewPermission = () => getViewPermission(`${REACT_APP_TRIP_REPLAY_API_URL}/view`);

export const getTripById = id => fetchWithAuthHeader(`${REACT_APP_TRIP_REPLAY_API_URL}/trips/${id}`, { method: GET })
    .then(response => jsonResponseHandling(response));

export const getTripReplayTrips = (searchFilters) => {
    const startTime = _.get(searchFilters, 'startTime') || '00:00';
    const endTime = _.get(searchFilters, 'endTime') || '27:59';
    const startDateTime = parseSelectedDate(searchFilters.searchDate, startTime);
    const endDateTime = parseSelectedDate(searchFilters.searchDate, endTime);
    const serviceDate = moment(searchFilters.searchDate).format('YYYYMMDD');
    const searchTermType = _.get(searchFilters, 'searchTerm.type') === 'route' ? 'routeShortName' : 'vehicleId';
    const searchTerm = _.get(searchFilters, 'searchTerm.id');
    const url = `${REACT_APP_TRIP_REPLAY_API_URL}/trips?${searchTermType}=${searchTerm}&startDateTime=${startDateTime}&endDateTime=${endDateTime}&serviceDate=${serviceDate}`;

    return fetchWithAuthHeader(
        url, { method: 'GET' },
    ).then(response => jsonResponseHandling(response));
};
