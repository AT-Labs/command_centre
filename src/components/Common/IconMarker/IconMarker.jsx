import React from 'react';
import PropTypes from 'prop-types';
import ReactDOMServer from 'react-dom/server';
import L from 'leaflet';
import { Marker } from 'react-leaflet';

import { generateUniqueID } from '../../../utils/helpers';
import Icon from '../Icon/Icon';

const IconMarker = React.forwardRef(({
    location, imageName, size, offset, className, ...props
}, ref) => (
    <Marker
        { ...props }
        ref={ ref }
        key={ generateUniqueID() }
        icon={ new L.DivIcon({
            html: ReactDOMServer.renderToString(<Icon icon={ imageName } />),
            iconSize: [size, size],
            iconAnchor: offset,
            className,
        }) }
        position={ location } />
));

IconMarker.propTypes = {
    location: PropTypes.array.isRequired,
    imageName: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    offset: PropTypes.array,
    className: PropTypes.string,
};

IconMarker.defaultProps = {
    offset: undefined,
    className: undefined,
};

export default IconMarker;
