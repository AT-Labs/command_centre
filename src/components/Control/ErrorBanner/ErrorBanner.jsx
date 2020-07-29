import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert } from 'reactstrap';

import { getBannerError } from '../../../redux/selectors/activity';
import { setBannerError } from '../../../redux/actions/activity';

const ErrorBanner = (props) => {
    if (!props.error) return null;

    return (
        <div className="error-modal">
            <Alert
                isOpen
                toggle={ () => props.setBannerError(null) }
                className="rounded-0 border-top-0 border-left-0 border-right-0 mb-0"
                color="danger"
                data-test-alert-type="bannerError">
                { props.error }
            </Alert>
        </div>
    );
};

ErrorBanner.propTypes = {
    error: PropTypes.string,
    setBannerError: PropTypes.func.isRequired,
};

ErrorBanner.defaultProps = {
    error: null,
};

export default connect(
    state => ({
        error: getBannerError(state),
    }),
    { setBannerError },
)(ErrorBanner);
