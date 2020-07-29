import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { FaCheck, FaRegClock } from 'react-icons/fa';

import Icon from '../../../Common/Icon/Icon';
import VEHICLE_TYPE from '../../../../types/vehicle-types';
import { TripSubIconType } from '../../RoutesView/Types';
import './TripIcon.scss';

const TripIcon = ({ type, className, subIcon }) => {
    if (!type) return null;
    return (
        <div className="trip-icon">
            <Icon icon={ _.get(VEHICLE_TYPE[type], 'type') } className={ `trip-icon__main ${className}` } />
            { subIcon && subIcon === TripSubIconType.onTime && <FaCheck className="text-success" size={ 12 } /> }
            { subIcon && subIcon === TripSubIconType.delayed && <FaRegClock className="text-at-orange" size={ 12 } /> }
        </div>
    );
};

TripIcon.propTypes = {
    type: PropTypes.number.isRequired,
    className: PropTypes.string,
    subIcon: PropTypes.oneOf(_.values(TripSubIconType)),
};

TripIcon.defaultProps = {
    className: '',
    subIcon: null,
};

export default TripIcon;
