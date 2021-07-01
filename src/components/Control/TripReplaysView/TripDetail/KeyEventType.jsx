import React from 'react';
import PropTypes from 'prop-types';
import { FaList, FaMapMarkerAlt, FaCopy, FaRegDotCircle } from 'react-icons/fa';
import './KeyEventType.scss';

export const EVENT_TYPES = {
    FIRST_STOP: 'Depart first stop',
    STOP: 'At stop',
    SIGN_ON: 'Signed onto trip',
    TRIP_END: 'Trip ended',
};

const renderKeyEventIcon = (type) => {
    switch (type) {
    case EVENT_TYPES.STOP:
        return <FaMapMarkerAlt className="pr-1" />;
    case EVENT_TYPES.SIGN_ON:
        return <FaList className="pr-1" />;
    case EVENT_TYPES.FIRST_STOP:
        return <FaRegDotCircle className="pr-1" />;
    case EVENT_TYPES.TRIP_END:
        return <FaCopy className="pr-1" />;
    default:
        return null;
    }
};

function KeyEventType({ type }) {
    return (
        <div className="key-event-type">
            { renderKeyEventIcon(type)}
            { type }
        </div>
    );
}

KeyEventType.propTypes = {
    type: PropTypes.string.isRequired,
};

export default KeyEventType;
