import moment from 'moment';
import _ from 'lodash-es';
import { getViewPermission } from '../helpers';
import { fetchWithAuthHeader } from '../../auth';
import { jsonResponseHandling } from '../fetch';
import HTTP_TYPES from '../../types/http-types';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';
import { TIME_TYPE } from '../../constants/tripReplays';

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
    const timeType = _.get(searchFilters, 'timeType') || TIME_TYPE.Scheduled;
    let endpoint = '';

    const searchTermType = _.get(searchFilters, 'searchTerm.type');
    const searchTerm = _.get(searchFilters, 'searchTerm.id');

    switch (searchTermType) {
    case SEARCH_RESULT_TYPE.ROUTE.type:
        endpoint = `${REACT_APP_TRIP_REPLAY_API_URL}/routes/${searchTerm}/trips`;
        break;
    case SEARCH_RESULT_TYPE.STOP.type:
        endpoint = `${REACT_APP_TRIP_REPLAY_API_URL}/stops/${searchTerm}/trips`;
        break;
    case SEARCH_RESULT_TYPE.TRIP.type:
        endpoint = `${REACT_APP_TRIP_REPLAY_API_URL}/tripId/${searchTerm}/trips`;
        break;
    default:
        endpoint = `${REACT_APP_TRIP_REPLAY_API_URL}/vehicles/${searchTerm}/trips`;
        break;
    }

    const url = `${endpoint}?serviceDate=${serviceDate}&timeType=${timeType}`
                + `&startDateTime=${startDateTime}&endDateTime=${endDateTime}`;

    return fetchWithAuthHeader(url, { method: 'GET' }).then(response => jsonResponseHandling(response));
};
