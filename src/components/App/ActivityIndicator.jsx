import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import LoadingOverlay from '../Common/Overlay/LoadingOverlay';
import { isLoading } from '../../redux/selectors/activity';

const ActivityIndicator = props => (
    <div>
        { props.isLoading && (
            <div>
                <LoadingOverlay />
                <div className="loader position-fixed activity-loader" aria-label="Loading" />
            </div>
        )}
    </div>
);

ActivityIndicator.propTypes = {
    isLoading: PropTypes.bool.isRequired,
};

export default connect(state => ({
    isLoading: isLoading(state),
}))(ActivityIndicator);
