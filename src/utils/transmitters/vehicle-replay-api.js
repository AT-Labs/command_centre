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

export const getVehiclePosition = (searchFilters) => {
    const { startDateTime, endDateTime, searchTerm } = parseSearchFilter(searchFilters);
    const { skip, page, limit } = searchFilters;
    const endpoint = `${REACT_APP_VEHICLE_REPLAY_API_URL}/vehicle/position/${searchTerm}`;

    const url = `${endpoint}?startDateTime=${startDateTime}&endDateTime=${endDateTime}`
        + `&skip=${skip}&page=${page}&limit=${limit}`;
    return fetchWithAuthHeader(url, { method: 'GET' }).then(response => jsonResponseHandling(response));
};
