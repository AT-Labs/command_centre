import React from 'react';
import PropTypes from 'prop-types';
import { capitalize, replace } from 'lodash-es';
import { occupancyStatusToIconSvg } from '../../../types/vehicle-occupancy-status-types';
import Icon from '../../Common/Icon/Icon';

import './OccupancyStatus.scss';

const OccupancyStatus = ({ occupancyStatus }) => (
    <div className="float-right">
        <Icon icon={ occupancyStatusToIconSvg(occupancyStatus) } className="occupancy-icon float-left" />
        { capitalize(replace(occupancyStatus, /[_-]/g, ' ')) }
    </div>
);

OccupancyStatus.propTypes = {
    occupancyStatus: PropTypes.string.isRequired,
};

export default OccupancyStatus;
