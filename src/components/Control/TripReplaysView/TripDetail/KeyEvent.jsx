import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { has, get } from 'lodash-es';
import { FaCaretRight } from 'react-icons/fa';
import { RiMapPinTimeFill } from 'react-icons/ri';
import { UncontrolledTooltip } from 'reactstrap';
import classNames from 'classnames';
import KeyEventType, { EVENT_TYPES } from './KeyEventType';
import Icon from '../../../Common/Icon/Icon';
import { occupancyStatusToIconSvg } from '../../../../types/vehicle-occupancy-status-types';
import './KeyEvent.scss';
import TripUpdateTag from '../../Common/Trip/TripUpdateTag';
import { TRIP_UPDATE_TYPE } from '../../../../constants/tripReplays';

function KeyEvent(props) {
    const showMoreInfo = () => {};
    const { type, scheduledTime, time, detail, handleMouseEnter, handleMouseLeave, handleMouseClick, keyEventDetail } = props;

    return (
        <li
            className={ classNames('key-event pb-2 pl-3 pr-3 pt-3 border-bottom', {
                'key-event--canceled': keyEventDetail.isCanceled || keyEventDetail.skippedData,
            }) }
            onClick={ () => handleMouseClick(keyEventDetail) }
            onKeyDown={ () => handleMouseClick(keyEventDetail) }
            onMouseEnter={ () => handleMouseEnter(keyEventDetail) }
            onMouseLeave={ () => handleMouseLeave() }
        >
            <div className="row">
                <div className="col-8">
                    <div className="key-event__header row mb-2">
                        <div className="col-8">
                            <KeyEventType type={ type } />
                            { keyEventDetail.occupancyStatus && (
                                <Icon className="icon d-inline-block ml-2" icon={ occupancyStatusToIconSvg(keyEventDetail.occupancyStatus) } />
                            ) }
                            { keyEventDetail.timepoint === 1 && (
                                <Fragment>
                                    <RiMapPinTimeFill id={ `timepoint-${keyEventDetail.id}` } className="icon d-inline-block ml-2 text-at-orange" size="24px" />
                                    <UncontrolledTooltip target={ `timepoint-${keyEventDetail.id}` }>Timepoint Stop</UncontrolledTooltip>
                                </Fragment>
                            ) }
                            { keyEventDetail.skippedData && (
                                <TripUpdateTag
                                    className="d-inline-block ml-2"
                                    type={ TRIP_UPDATE_TYPE.SKIPPED }
                                    data={ keyEventDetail.skippedData }
                                    hasIcon
                                    hasTooltip />
                            ) }
                        </div>
                    </div>
                    <div className="font-weight-bold mb-1">{keyEventDetail.title}</div>
                    {detail && <div className="text-muted">{detail}</div>}
                    { keyEventDetail.plaformChangeData && (
                        <TripUpdateTag
                            type={ TRIP_UPDATE_TYPE.PLATFORM_CHANGE }
                            data={ keyEventDetail.plaformChangeData }
                            hasIcon
                            hasTooltip />
                    ) }
                    <div className="mt-2">
                        <button type="button"
                            className="key-event__more-info pl-0 font-weight-bold"
                            onClick={ showMoreInfo }>See more information<FaCaretRight />
                        </button>
                    </div>
                </div>
                <div className="col-2">
                    {props.type !== EVENT_TYPES.SIGN_ON && (
                        <div>
                            <div className="text-left font-weight-bold">Scheduled</div>
                            {props.type !== EVENT_TYPES.FIRST_STOP
                            && (
                                <div
                                    className="text-left font-weight-bold">A:{has(scheduledTime, 'arrival') ? get(scheduledTime, 'arrival') : '-'}
                                </div>
                            )}
                            {props.type !== EVENT_TYPES.TRIP_END
                            && (
                                <div
                                    className="text-left font-weight-bold">D:{has(scheduledTime, 'departure') ? get(scheduledTime, 'departure') : '-'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="col-2">
                    {props.type === EVENT_TYPES.SIGN_ON && <div className="text-right font-weight-bold">{time}</div>}
                    {props.type !== EVENT_TYPES.SIGN_ON && (
                        <div>
                            <div className="text-left font-weight-bold">Actual</div>
                            {props.type !== EVENT_TYPES.FIRST_STOP
                            && (
                                <div
                                    className="text-left font-weight-bold">{has(time, 'arrival') ? get(time, 'arrival') : '-'}
                                </div>
                            )}
                            {props.type !== EVENT_TYPES.TRIP_END
                            && (
                                <div
                                    className="text-left font-weight-bold">{has(time, 'departure') ? get(time, 'departure') : '-'}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>


        </li>
    );
}

KeyEvent.propTypes = {
    type: PropTypes.string.isRequired,
    scheduledTime: PropTypes.object,
    time: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]).isRequired,
    detail: PropTypes.string,
    handleMouseEnter: PropTypes.func.isRequired,
    handleMouseLeave: PropTypes.func.isRequired,
    handleMouseClick: PropTypes.func.isRequired,
    keyEventDetail: PropTypes.object.isRequired,
};

KeyEvent.defaultProps = {
    detail: null,
    scheduledTime: null,
};
export default KeyEvent;
