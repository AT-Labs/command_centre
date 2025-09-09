import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Loader from '../Common/Loader/Loader';
import { isLoading } from '../../redux/selectors/activity';

const ActivityIndicator = props => (
    <div>
        { props.isLoading && (
            <div className="activity-loader position-fixed">
                <Loader />
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
