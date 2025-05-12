import React, { useRef } from 'react';
import { Marker } from 'react-leaflet';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';
import PropTypes from 'prop-types';
import { FaExclamation } from 'react-icons/fa';
import './DisruptionMarker.scss';
import { generateUniqueID } from '../../../../utils/helpers';

const getCoordinates = stop => [stop.stopLat, stop.stopLon];

const DisruptionMarker = (({ stop, offset, className, ...props }) => {
    return (
        <Marker
            { ...props }
            key={ generateUniqueID() }
            icon={ new L.DivIcon({
                html: ReactDOMServer.renderToString(
                    <div className="disruption-marker">
                        <div className="icon-container">
                            <FaExclamation color="#D52923" className="icon" />
                        </div>
                        <div className="pin" />
                    </div>,
                ),
                iconAnchor: [14, 44],
                className,
            }) }
            position={ getCoordinates(stop) }
        />
    );
});

DisruptionMarker.propTypes = {
    stop: PropTypes.object.isRequired,
    offset: PropTypes.array,
    className: PropTypes.string,
};

DisruptionMarker.defaultProps = {
    offset: undefined,
    className: undefined,
};

export default DisruptionMarker;
