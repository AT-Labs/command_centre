import _ from 'lodash-es';
import { jsonResponseHandling } from '../fetch';

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
const MAPBOX_LIMIT = 4;
const MAPBOX_TYPES = encodeURIComponent('address,locality');
const AUCKLAND_BBOX = encodeURIComponent('174.15698,-37.292765,175.292505,-36.116668');
const SEPARATOR = ', ';

// https://docs.mapbox.com/api/search/geocoding/#forward-geocoding
export const searchAddresses = searchTerms => fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchTerms}.json?&country=NZ&bbox=${AUCKLAND_BBOX}&limit=${MAPBOX_LIMIT}&types=${MAPBOX_TYPES}&access_token=${MAPBOX_ACCESS_TOKEN}`,
)
    .then(response => jsonResponseHandling(response))
    .then(data => _.result(data, 'features').map(f => (
        {
            address: f.place_name.split(SEPARATOR).slice(0, 2).join(SEPARATOR),
            lng: f.center[0],
            lat: f.center[1],
        }
    )));
