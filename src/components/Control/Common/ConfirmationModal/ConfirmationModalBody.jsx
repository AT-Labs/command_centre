import React from 'react';
import PropTypes from 'prop-types';
import { IconContext } from 'react-icons';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmationModal = props => (
    <>
        <IconContext.Provider value={ { className: 'text-warning w-100 m-2' } }>
            <FaExclamationTriangle size={ 40 } />
        </IconContext.Provider>
        <p className="font-weight-light text-center mb-0">{props.message}</p>
    </>
);

ConfirmationModal.propTypes = {
    message: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.array,
    ]).isRequired,
};

export default ConfirmationModal;
