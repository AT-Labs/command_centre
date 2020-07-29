import React from 'react';
import PropTypes from 'prop-types';
import { IconContext } from 'react-icons';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmationModal = props => (
    <React.Fragment>
        <IconContext.Provider value={ { className: 'text-warning w-100 m-2' } }>
            <FaExclamationTriangle size={ 40 } />
        </IconContext.Provider>
        <p className="font-weight-light text-center mb-0">{props.message}</p>
    </React.Fragment>
);

ConfirmationModal.propTypes = {
    message: PropTypes.string.isRequired,
};

export default ConfirmationModal;
