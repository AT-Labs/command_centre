import React from 'react';
import PropTypes from 'prop-types';

import Loader from '../../../Common/Loader/Loader';

const UpdateStatusModalsBtn = props => (
    <React.Fragment>
        <span>{ props.label }</span>
        {
            props.isLoading && (
                <div className="cc-standard-loader-wrapper float-right">
                    <Loader />
                </div>
            )
        }
    </React.Fragment>
);

UpdateStatusModalsBtn.propTypes = {
    label: PropTypes.string.isRequired,
    isLoading: PropTypes.bool.isRequired,
};

export default UpdateStatusModalsBtn;
