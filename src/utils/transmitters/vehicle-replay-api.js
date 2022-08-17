import { fetchWithAuthHeader } from '../../auth';
import { jsonResponseHandling } from '../fetch';
import { parseSearchFilter } from '../common/parse-search-filter';

const { REACT_APP_VEHICLE_REPLAY_API_URL } = process.env;

export const getVehicleReplay = (searchFilters) => {
    const searchData = parseSearchFilter(searchFilters);
    const { startDateTime, endDateTime, serviceDate, timeType, searchTerm } = searchData;

    const endpoint = `${REACT_APP_VEHICLE_REPLAY_API_URL}/history/vehicle/${searchTerm}`;

    const url = `${endpoint}?serviceDate=${serviceDate}&timeType=${timeType}`
    + `&startDateTime=${startDateTime}&endDateTime=${endDateTime}`;
    return fetchWithAuthHeader(url, { method: 'GET' }).then(response => jsonResponseHandling(response));
};
