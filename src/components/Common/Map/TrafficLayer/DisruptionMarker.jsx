import React from 'react';
import { Marker } from 'react-leaflet';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';
import PropTypes from 'prop-types';
import { FaExclamation } from 'react-icons/fa';
import './DisruptionMarker.scss';
import { generateUniqueID } from '../../../../utils/helpers';

const DisruptionMarker = (({ coordinates, className, ...props }) => (
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
        position={ coordinates }
    />
));

DisruptionMarker.propTypes = {
    coordinates: PropTypes.array.isRequired,
    className: PropTypes.string,
};

DisruptionMarker.defaultProps = {
    className: undefined,
};

export default DisruptionMarker;
