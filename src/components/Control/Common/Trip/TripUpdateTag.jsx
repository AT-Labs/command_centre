import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { IoMdInformationCircle } from 'react-icons/io';
import { IconContext } from 'react-icons';
import { UncontrolledTooltip } from 'reactstrap';

import { formatUnixTime } from '../../../../utils/helpers';
import { TRIP_UPDATE_TYPE } from '../../../../constants/tripReplays';

import './TripUpdateTag.scss';

const TripUpdateTag = ({ className, type, indicatorBar, data, hasIcon, hasTooltip }) => {
    const renderMissedTag = () => (
        <div className="trip-update-tag trip-update-tag--missed">
            MISSED
        </div>
    );

    const renderCanceledTag = () => (
        <>
            <div className="trip-update-tag trip-update-tag--canceled">
                CANCELLED
                { hasIcon && (
                    <IoMdInformationCircle id={ `trip-update-tag--canceled-${data.timestamp}` } className="trip-update-tag__icon" size={ 14 } />
                ) }
            </div>
            { hasTooltip && (
                <UncontrolledTooltip
                    className="trip-update-tag__tooltip"
                    target={ `trip-update-tag--canceled-${data.timestamp}` }
                >
                    { `This trip was cancelled at ${formatUnixTime(data.timestamp)}` }
                </UncontrolledTooltip>
            ) }
        </>
    );

    const renderCopyTripTag = () => (
        <div className="trip-update-tag trip-update-tag--copy-trip">
            COPIED TRIP
        </div>
    );

    const renderSkippedTag = () => (
        <>
            <div className="trip-update-tag trip-update-tag--skipped">
                SKIPPED
                { hasIcon && (
                    <IoMdInformationCircle id={ `trip-update-tag--skipped-${data.timestamp}` } className="trip-update-tag__icon" size={ 14 } />
                ) }
            </div>
            { hasTooltip && (
                <UncontrolledTooltip
                    className="trip-update-tag__tooltip"
                    target={ `trip-update-tag--skipped-${data.timestamp}` }
                >
                    { `This stop was skipped at ${formatUnixTime(data.timestamp)}` }
                </UncontrolledTooltip>
            ) }
        </>
    );

    const renderPlatformChangeTag = () => (
        <>
            <div className="trip-update-tag trip-update-tag--platform-change p-0">
                <div className="trip-update-tag">
                    { `Stop ${data.oldStop.stopCode}` }
                </div>
                <div className="trip-update-tag">
                    { `Stop ${data.newStop.stopCode}` }
                </div>
            </div>
            { hasIcon && (
                <IconContext.Provider value={ { size: '20px', className: 'trip-update-tag--platform-change__icon' } }>
                    <IoMdInformationCircle id={ `trip-update-tag--platform-change-${data.timestamp}` } />
                </IconContext.Provider>
            ) }
            { hasTooltip && (
                <UncontrolledTooltip
                    className="trip-update-tag__tooltip"
                    target={ `trip-update-tag--platform-change-${data.timestamp}` }
                >
                    { `${data.oldStop.stopName} to ${data.newStop.stopName} at ${formatUnixTime(data.timestamp)}` }
                </UncontrolledTooltip>
            ) }
        </>
    );

    const renderTagByType = () => {
        switch (type) {
        case TRIP_UPDATE_TYPE.MISSED:
            return renderMissedTag();
        case TRIP_UPDATE_TYPE.CANCELED:
            return renderCanceledTag();
        case TRIP_UPDATE_TYPE.COPY_TRIP:
            return renderCopyTripTag();
        case TRIP_UPDATE_TYPE.SKIPPED:
            return renderSkippedTag();
        case TRIP_UPDATE_TYPE.PLATFORM_CHANGE:
            return renderPlatformChangeTag();
        default:
            return null;
        }
    };

    return (
        <div
            className={ classNames('d-inline-block', className, {
                'trip-update-tag--indicator-bar': indicatorBar,
            }) }
        >
            { renderTagByType() }
        </div>
    );
};

TripUpdateTag.propTypes = {
    className: PropTypes.string,
    type: PropTypes.string.isRequired,
    indicatorBar: PropTypes.bool,
    data: PropTypes.object,
    hasIcon: PropTypes.bool,
    hasTooltip: PropTypes.bool,
};

TripUpdateTag.defaultProps = {
    className: '',
    indicatorBar: false,
    data: null,
    hasIcon: false,
    hasTooltip: false,
};

export default TripUpdateTag;
