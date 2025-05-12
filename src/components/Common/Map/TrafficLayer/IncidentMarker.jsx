import React from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';
import { Marker } from 'react-leaflet';

import { generateUniqueID } from '../../../../utils/helpers';
import './IncidentMarker.scss';
import { getIconByIncidentCategory } from './TrafficHelper';

const IncidentMarker = ({
    location, category, className, useNewColors, ...props
}) => (
    <Marker
        { ...props }
        key={ generateUniqueID() }
        icon={ new L.DivIcon({
            html: ReactDOMServer.renderToString(
                <div className={ `incident-marker ${useNewColors ? 'new-colors' : ''}` }>
                    <div className="icon-container">
                        { getIconByIncidentCategory(category, useNewColors) }
                    </div>
                    <div className="pin" />
                </div>,
            ),
            iconAnchor: [14, 44],
            className,
        }) }
        position={ location } />
);

IncidentMarker.propTypes = {
    location: PropTypes.array.isRequired,
    category: PropTypes.string.isRequired,
    offset: PropTypes.array,
    className: PropTypes.string,
    useNewColors: PropTypes.bool,
};

IncidentMarker.defaultProps = {
    offset: undefined,
    className: undefined,
    useNewColors: false,
};

export default IncidentMarker;
