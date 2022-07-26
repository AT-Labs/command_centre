import { getViewPermission } from '../helpers';
import { fetchWithAuthHeader } from '../../auth';
import { jsonResponseHandling } from '../fetch';
import { parseSearchFilter } from '../common/parse-search-filter';
import HTTP_TYPES from '../../types/http-types';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';

const { REACT_APP_TRIP_REPLAY_API_URL } = process.env;
const { GET } = HTTP_TYPES;

export const getTripReplaysViewPermission = () => getViewPermission(`${REACT_APP_TRIP_REPLAY_API_URL}/view`);

export const getTripById = id => fetchWithAuthHeader(`${REACT_APP_TRIP_REPLAY_API_URL}/trips/${id}`, { method: GET })
    .then(response => jsonResponseHandling(response));

export const getTripReplayTrips = (searchFilters) => {
    const searchData = parseSearchFilter(searchFilters);

    const { startDateTime, endDateTime, serviceDate, timeType, searchTermType, searchTerm } = searchData;

    let endpoint = '';

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
