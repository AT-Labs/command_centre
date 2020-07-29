import parse from 'wellknown';

export const getJsonFromWkt = wkt => parse(wkt).coordinates.map(coors => [
    coors[1],
    coors[0],
]);
