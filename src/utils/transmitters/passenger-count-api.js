import { jsonResponseHandling } from '../fetch';
import HTTP_TYPES from '../../types/http-types';

const { REACT_APP_PASSENGER_COUNT_API } = process.env;
const { POST } = HTTP_TYPES;

export const getPassengerCountData = (affectedEntities) => {
    const url = `${REACT_APP_PASSENGER_COUNT_API}/passenger-count`;
    return fetch(
        url,
        {
            method: POST,
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(affectedEntities),
        },
    ).then(response => jsonResponseHandling(response));
};
