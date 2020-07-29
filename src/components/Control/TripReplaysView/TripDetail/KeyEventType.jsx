import React from 'react';
import PropTypes from 'prop-types';
import { FaList, FaMapMarkerAlt, FaCopy, FaRegDotCircle, FaCross, FaBackward } from 'react-icons/fa';
import './KeyEventType.scss';
import classNames from 'classnames';

export const EVENT_TYPES = {
    FIRST_STOP: 'Depart first stop',
    STOP: 'At stop',
    SIGN_ON: 'Signed onto trip',
    TRIP_END: 'Trip ended',
    CANCELED: 'Trip canceled',
    REINSTATED: 'Trip reinstated',
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
    case EVENT_TYPES.CANCELED:
        return <FaCross className="pr-d" />;
    case EVENT_TYPES.REINSTATED:
        return <FaBackward className="pr-d" />;
    default:
        return null;
    }
};

function KeyEventType({ type }) {
    return (
        <div className={ classNames('key-event-type', {
            'key-event-type--canceled': type === EVENT_TYPES.CANCELED,
            'key-event-type--reinstated': type === EVENT_TYPES.REINSTATED,
        }) }>
            { renderKeyEventIcon(type)}
            { type }
        </div>
    );
}

KeyEventType.propTypes = {
    type: PropTypes.string.isRequired,
};

export default KeyEventType;
