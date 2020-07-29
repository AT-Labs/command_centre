import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { FaCaretRight } from 'react-icons/fa';
import KeyEventType, { EVENT_TYPES } from './KeyEventType';
import './KeyEvent.scss';


function KeyEvent(props) {
    const showMoreInfo = () => {};
    const { type, scheduledTime, time, detail, handleMouseEnter, handleMouseLeave, handleMouseClick, keyEventDetail } = props;
    if (type === EVENT_TYPES.CANCELED || type === EVENT_TYPES.REINSTATED) {
        return (
            <li className="key-event pb-2 pl-3 pr-3 pt-3 border-bottom">
                <div className="row">
                    <div className="col-8">
                        <div className="key-event__header row mb-2">
                            <div className="col-8"><KeyEventType type={ type } /></div>
                        </div>
                    </div>
                    <div className="col-2 offset-2">
                        <div className="text-right font-weight-bold">{time.arrival}</div>
                    </div>
                </div>
            </li>
        );
    }
    return (
        <li className="key-event pb-2 pl-3 pr-3 pt-3 border-bottom"
            onClick={ () => handleMouseClick(keyEventDetail) }
            onKeyDown={ () => handleMouseClick(keyEventDetail) }
            onMouseEnter={ () => handleMouseEnter(keyEventDetail) }
            onMouseLeave={ () => handleMouseLeave() }>
            <div className="row">
                <div className="col-8">
                    <div className="key-event__header row mb-2">
                        <div className="col-8"><KeyEventType type={ type } /></div>
                    </div>
                    <div className="font-weight-bold mb-1">{keyEventDetail.title}</div>
                    {detail && <div className="text-muted">{detail}</div>}
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
                                    className="text-center font-weight-bold">A:{_.has(scheduledTime, 'arrival') ? _.get(scheduledTime, 'arrival') : '-'}
                                </div>
                            )}
                            {props.type !== EVENT_TYPES.TRIP_END
                            && (
                                <div
                                    className="text-center font-weight-bold">D:{_.has(scheduledTime, 'departure') ? _.get(scheduledTime, 'departure') : '-'}
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
                                    className="text-center font-weight-bold">{_.has(time, 'arrival') ? _.get(time, 'arrival') : '-'}
                                </div>
                            )}
                            {props.type !== EVENT_TYPES.TRIP_END
                            && (
                                <div
                                    className="text-center font-weight-bold">{_.has(time, 'departure') ? _.get(time, 'departure') : '-'}
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
    time: PropTypes.object.isRequired,
    detail: PropTypes.string,
    handleMouseEnter: PropTypes.func,
    handleMouseLeave: PropTypes.func,
    handleMouseClick: PropTypes.func,
    keyEventDetail: PropTypes.object,
};

KeyEvent.defaultProps = {
    detail: null,
    scheduledTime: null,
    handleMouseEnter: () => {},
    handleMouseClick: () => {},
    handleMouseLeave: () => {},
    keyEventDetail: null,
};
export default KeyEvent;
