import { result, isEmpty } from 'lodash-es';
import { createSelector } from 'reselect';
import {
    getShape,
} from './currentTrip';

export const getMapState = state => result(state, 'control.tripReplays.map');
export const getMapRecenterStatus = createSelector(getMapState, mapState => result(mapState, 'shouldMapBeRecentered'));

export const getBoundsToFit = createSelector(getShape, (shape) => {
    let pointsInBounds = [];

    if (!isEmpty(shape)) {
        pointsInBounds = shape;
    }

    return pointsInBounds;
});
