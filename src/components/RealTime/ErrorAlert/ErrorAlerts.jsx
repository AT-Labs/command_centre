import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { Alert } from 'reactstrap';
import ERROR_TYPE from '../../../types/error-types';

import { getError } from '../../../redux/selectors/activity';
import { dismissError } from '../../../redux/actions/activity';

import './ErrorAlerts.scss';

const ErrorAlerts = (props) => {
    const errors = _.compact(_.map(props.error, (value, key) => {
        if (!value) return null;
        return {
            key,
            message: ERROR_TYPE[key] || _.get(value, 'message') || '',
        };
    }));

    if (errors.length === 0) return null;

    return (
        <div className="error-alerts position-fixed mt-3 ml-5">
            {errors.map(item => (
                <Alert
                    isOpen
                    toggle={ () => props.dismissError(item.key) }
                    className="error-alert mb-3"
                    color="danger"
                    key={ item.key }
                    data-test-alert-type={ item.key }>
                    { item.message }
                </Alert>
            ))}
        </div>
    );
};

ErrorAlerts.propTypes = {
    error: PropTypes.object.isRequired,
    dismissError: PropTypes.func.isRequired, // eslint-disable-line
};

export default connect(
    state => ({
        error: getError(state),
    }),
    { dismissError },
)(ErrorAlerts);
