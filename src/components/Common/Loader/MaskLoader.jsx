import PropTypes from 'prop-types';
import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import Loader from './Loader';
import './Loader.scss';

const MaskLoader = ({ error }) => (
    <div className="mask-loader bg-white fixed-top h-100 w-100">
        <div className="d-flex justify-content-center align-items-center h-100">
            {(error && (
                <h3><FaExclamationTriangle color="red" size="24px" /> <span className="p-1">{error} </span></h3>
            )) || (
                <div className="mask-loader__loader-container">
                    <Loader />
                </div>
            )}
        </div>
    </div>
);

MaskLoader.propTypes = {
    error: PropTypes.string,
};

MaskLoader.defaultProps = {
    error: null,
};

export default MaskLoader;
