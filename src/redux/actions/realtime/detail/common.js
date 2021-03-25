import moment from 'moment';
import ACTION_TYPE from '../../../action-types';
import { updateVisibleStops } from '../../static/stops';
import { mergeVehicleFilters } from '../vehicles';

export const clearDetail = isReplace => (dispatch) => {
    dispatch(mergeVehicleFilters({ predicate: null }));
    dispatch(updateVisibleStops(null));
    dispatch({
        type: ACTION_TYPE.CLEAR_DETAIL,
        payload: { isReplace: !!isReplace },
    });
};

export const isWithinNextHalfHour = timeString => (timeString ? moment(timeString).isSameOrBefore(moment().add(30, 'minutes')) : false);
export const isWithinPastHalfHour = timeString => (timeString ? moment(timeString).isSameOrAfter(moment().subtract(30, 'minutes')) : false);

export const calculateScheduledAndActualTimes = (stop) => {
    const { arrival, departure, scheduleRelationship } = stop;
    const timeToUse = !arrival || (departure && departure.time) > arrival.time ? departure : arrival;
    const scheduledTime = moment.unix(timeToUse.time).subtract(timeToUse.delay, 's').toISOString();
    let actualTime = scheduleRelationship === 'SCHEDULED' ? moment.unix(timeToUse.time).toISOString() : undefined;
    if (!stop.passed) {
        const expectedDepartureTime = (departure && departure.type === 'PREDICTED') ? moment.unix(departure.time).toISOString() : undefined;
        if (expectedDepartureTime === undefined) {
            // check if last stop, which will not have a departure
            if (departure) {
                // not last stop, set to expectedDepartureTime
                actualTime = expectedDepartureTime;
            } else {
                // last stop, leave as previous behaviour
            }
        } else {
            actualTime = expectedDepartureTime;
        }
    }
    return { scheduledTime, actualTime };
};
