import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import moment from 'moment';
import { BsKeyFill, BsKey, BsFillLightbulbFill, BsFillLightbulbOffFill } from 'react-icons/bs';
import { TbEngine, TbEngineOff } from 'react-icons/tb';
import { BiLogIn, BiLogOut } from 'react-icons/bi';
import { FaDoorOpen, FaDoorClosed } from 'react-icons/fa';

function VehicleStatusPopupContent({ eventDetail }) {
    const Icons = {
        signOn: BiLogIn,
        signOff: BiLogOut,
        keyOn: BsKeyFill,
        keyOff: BsKey,
        engineOn: TbEngine,
        engineOff: TbEngineOff,
        doorOpen: FaDoorOpen,
        doorClosed: FaDoorClosed,
        stoppingLightOn: BsFillLightbulbFill,
        stoppingLightOff: BsFillLightbulbOffFill,
    };

    const Titles = {
        signOn: 'Sign On',
        signOff: 'Sign Off',
        keyOn: 'Key On',
        keyOff: 'Key Off',
        engineOn: 'Engine On',
        engineOff: 'Engine Off',
        doorOpen: 'Door Open',
        doorClosed: 'Door Closed',
        stoppingLightOn: 'Stopping Light On',
        stoppingLightOff: 'Stopping Light Off',
    };

    const tripDate = moment(eventDetail.tripDate).format('YYYY-MM-DD');
    const eventTime = moment(eventDetail.timestamp).format('HH:mm:ss');
    const IconName = Icons[eventDetail.type];

    const getTime = (time) => {
        const startTime = time.start ? time.start : 'N/A';
        const endTime = time.end ? time.end : 'N/A';
        return `${startTime} - ${endTime}`;
    };

    return (
        <div>
            <div className="row align-items-baseline">
                <div className="col">
                    <h2>
                        <IconName size={ 22 } className="mr-2" />
                        <b>{Titles[eventDetail.type]}</b>
                    </h2>
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Location:</b>
                    {' '}
                    lat:
                    {' '}
                    { eventDetail.position.latitude }
                    , lon:
                    {' '}
                    { eventDetail.position.longitude }
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Speed:</b>
                    {' '}
                    { eventDetail.position.speed ? Math.round(eventDetail.position.speed * 100) / 100 : 'N/A' }
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Date:</b>
                    {' '}
                    { eventDetail.tripDate ? tripDate : 'N/A'}
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Time:</b>
                    {' '}
                    { eventDetail.timestamp ? eventTime : 'N/A' }
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Trip ID:</b>
                    {' '}
                    { !_.isNull(eventDetail.tripId) ? eventDetail.tripId : 'N/A' }
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Actual Trip time:</b>
                    {' '}
                    { eventDetail.actual ? getTime(eventDetail.actual) : 'N/A'}
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Scheduled Trip time:</b>
                    {' '}
                    { eventDetail.scheduled ? getTime(eventDetail.scheduled) : 'N/A'}
                </div>
            </div>
        </div>
    );
}

VehicleStatusPopupContent.propTypes = {
    eventDetail: PropTypes.object.isRequired,
};

export default VehicleStatusPopupContent;
