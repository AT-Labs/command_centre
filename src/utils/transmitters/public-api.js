import _ from 'lodash-es';
import { jsonResponseHandling } from '../fetch';

const AT_PUBLIC_API_URL = process.env.REACT_APP_AT_PUBLIC_API_URL;
const AT_PUBLIC_API_KEY = process.env.REACT_APP_AT_PUBLIC_API_KEY;

export const searchAddresses = searchTerms => fetch(
    `${AT_PUBLIC_API_URL}public-restricted/geocode/forward?query=${searchTerms}&subscription-key=${AT_PUBLIC_API_KEY}&sortAlgorithm=standard&limitAlgorithm=5_per_category&resultType=address`,
    { method: 'GET' },
)
    .then(response => jsonResponseHandling(response))
    .then(data => _.result(data, 'response.addresses', []));

export const reverseGeocode = (lat, lng) => fetch(
    `${AT_PUBLIC_API_URL}public-restricted/geocode/reverse?lat=${lat}&lng=${lng}&subscription-key=${AT_PUBLIC_API_KEY}`,
    { method: 'GET' },
)
    .then(response => jsonResponseHandling(response))
    .then(data => _.result(data, 'response.addresses', []));
