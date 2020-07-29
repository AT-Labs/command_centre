import _ from 'lodash-es';
import { createSelector } from 'reselect';
import { getAllStops as getAllStopsRaw } from '../../static/stops';

export const getAllStops = createSelector(getAllStopsRaw, stops => _.map(stops, stop => ({
    value: stop.stop_code,
    label: `${stop.stop_code} - ${stop.stop_name}`,
})));
