import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';

import Loader from '../../../Common/Loader/Loader';
import './LoadMore.scss';

export const LoadMore = (props) => {
    const { limit, total, chunkSize, isLoading, message } = props;
    const isMaxed = !isLoading && (total < limit);

    if (!limit || !total || isMaxed) return null;

    return (
        <nav aria-label="Page navigation" className="d-flex flex-column align-items-center my-3">
            {(total >= chunkSize * 2) && (
                <Alert color="secondary" className="col-6 col-xl-4 border-0 text-center">
                    <span><strong>Performance may slow down</strong></span><br />
                    <span>{ message }</span>
                </Alert>
            )}
            <button
                type="button"
                className="border-0 bg-at-shore-tint-30 text-primary btn my-3"
                disabled={ !!isLoading }
                onClick={ props.onClick }
            >
                <strong>Load {chunkSize} more</strong>
            </button>
            {isLoading && (
                <div className="load-more__loader">
                    <Loader />
                </div>
            )}
        </nav>
    );
};

LoadMore.propTypes = {
    message: PropTypes.string,
    limit: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    chunkSize: PropTypes.number.isRequired,
    isLoading: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

LoadMore.defaultProps = {
    message: `We noticed you are loading a large number of trips.
    This may affect the performance of this system.
    We recommend using the filters at the top of the screen to help find the information you need.`,
};
