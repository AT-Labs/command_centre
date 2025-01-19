import { isEmpty } from 'lodash-es';
import { createSelector } from 'reselect';
import {
    getShape,
} from './currentTrip';

export const getBoundsToFit = createSelector(getShape, (shape) => {
    let pointsInBounds = [];

    if (!isEmpty(shape)) {
        pointsInBounds = shape;
    }

    return pointsInBounds;
});
