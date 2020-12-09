import _ from 'lodash-es';
import { createSelector } from 'reselect';
import { getAllStops as getAllStopsRaw } from '../../static/stops';
import { formatStopLabel } from '../../../../utils/helpers';

export const getAllStops = createSelector(getAllStopsRaw, stops => _.map(stops, stop => ({
    value: stop.stop_code,
    label: formatStopLabel(stop),
})));
