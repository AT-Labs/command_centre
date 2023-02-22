import { result } from 'lodash-es';
import { createSelector } from 'reselect';

export const getPlatformsState = state => result(state, 'control.platforms');
export const getPlatforms = createSelector(getPlatformsState, state => result(state, 'all'));
