import PropTypes from 'prop-types';
import React, { useRef } from 'react';
import { Circle } from 'react-leaflet';

import IconMarker from '../../../Common/IconMarker/IconMarker';

const SelectAddressMarker = (props) => {
    const circleRef = useRef(null);
    props.getCircleRef(circleRef);

    return (
        <Circle
            ref={ circleRef }
            center={ props.center }
            fillColor="gray"
            stroke={ 0 }
            fillOpacity={ 0.5 }
            radius={ 200 }>
            <IconMarker
                className="cc-address-marker"
                location={ props.center }
                imageName="address"
                size={ 35 } />
        </Circle>
    );
};

SelectAddressMarker.propTypes = {
    getCircleRef: PropTypes.func.isRequired,
    center: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.object,
    ]).isRequired,
};

export default SelectAddressMarker;
