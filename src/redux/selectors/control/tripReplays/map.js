import _ from 'lodash-es';
import { createSelector } from 'reselect';
import {
    getShape,
} from './currentTrip';

export const getMapState = state => _.result(state, 'control.tripReplays.map');
export const getMapRecenterStatus = createSelector(getMapState, mapState => _.result(mapState, 'shouldMapBeRecentered'));

export const getBoundsToFit = createSelector(getShape, (shape) => {
    let pointsInBounds = [];

    if (!_.isEmpty(shape)) {
        pointsInBounds = shape;
    }

    return pointsInBounds;
});
