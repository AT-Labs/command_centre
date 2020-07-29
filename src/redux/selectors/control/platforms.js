import _ from 'lodash-es';
import { createSelector } from 'reselect';

export const getPlatformsState = state => _.result(state, 'control.platforms');
export const getPlatforms = createSelector(getPlatformsState, state => _.result(state, 'all'));
