import { fetchWithAuthHeader } from '../../auth';
import { jsonResponseHandling } from '../fetch';

const { REACT_APP_REALTIME_TRAFFIC_API_URL } = process.env;

export const fetchTrafficFlows = async (lat, long, radius, detailed) => fetchWithAuthHeader(
    `${REACT_APP_REALTIME_TRAFFIC_API_URL}/traffic/flows?long=${long}&lat=${lat}&radius=${radius}&detailed=${detailed}`,
    {
        method: 'GET',
    },
).then(response => jsonResponseHandling(response));

export const calculateRoute = async points => fetchWithAuthHeader(
    `${REACT_APP_REALTIME_TRAFFIC_API_URL}/routing/directions/calculate`,
    {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            points,
            apiVersion: 2,
            instructionsType: 'coded',
            guidanceVersion: 2,
            language: 'en-US',
            instructionPhonetics: 'LHP',
            instructionRoadShieldReferences: 'all',
        }),
    },
).then(response => jsonResponseHandling(response));
