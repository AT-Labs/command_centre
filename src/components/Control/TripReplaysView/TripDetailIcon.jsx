import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { UncontrolledTooltip } from 'reactstrap';
import { FaCalendarPlus } from 'react-icons/fa';

import { TRIP_DETAIL_ICON_TYPE } from '../../../constants/tripReplays';
import './TripDetailIcon.scss';
import Icon from '../../Common/Icon/Icon';

export const TripDetailIcon = ({ className, type, size }) => {
    const renderAddedIcon = () => (
        <div className="trip-detail-icon--added">
            <FaCalendarPlus id="trip-manually-added" className="text-info" size={ size } />
            <UncontrolledTooltip
                className="trip-detail-icon__tooltip"
                target="trip-manually-added"
            >
                Trip manually added
            </UncontrolledTooltip>
        </div>
    );

    const renderDisruptionIcon = () => (
        <div className="trip-detail-icon--disruption">
            <Icon icon="alert" className="alert-icon d-inline-block" />
        </div>
    );

    const renderIconByType = () => {
        switch (type) {
        case TRIP_DETAIL_ICON_TYPE.ADDED:
            return renderAddedIcon();
        case TRIP_DETAIL_ICON_TYPE.DISRUPTION:
            return renderDisruptionIcon();
        default:
            return null;
        }
    };

    return (
        <div className={ classNames('trip-detail-icon d-inline-block', className) }>
            { renderIconByType() }
        </div>
    );
};

TripDetailIcon.propTypes = {
    className: PropTypes.string,
    type: PropTypes.string.isRequired,
    size: PropTypes.number,
};

TripDetailIcon.defaultProps = {
    className: '',
    size: null,
};
