import ACTION_TYPE from '../../../action-types';
import { updateSearchTerms } from '../../search';

export const addressSelected = address => (dispatch) => {
    dispatch({
        type: ACTION_TYPE.UPDATE_SELECTED_ADDRESS,
        payload: {
            address,
        },
    });
    dispatch(updateSearchTerms(address.address));
};
