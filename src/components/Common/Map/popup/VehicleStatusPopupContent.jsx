import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import moment from 'moment';
import { BsKeyFill, BsKey, BsFillLightbulbFill, BsFillLightbulbOffFill, BsFillGeoAltFill } from 'react-icons/bs';
import { TbEngine, TbEngineOff } from 'react-icons/tb';
import { BiLogIn, BiLogOut } from 'react-icons/bi';
import { FaDoorOpen, FaDoorClosed } from 'react-icons/fa';
import DATE_TYPE from '../../../../types/date-types';
import { VEHICLE_POSITION } from '../../../../types/vehicle-types';

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
        vehiclePosition: BsFillGeoAltFill,
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
        vehiclePosition: 'Vehicle Position',
    };

    const getDate = () => {
        if (eventDetail.type === VEHICLE_POSITION && eventDetail.trip) {
            return moment(eventDetail.trip.startDate).format('YYYY-MM-DD');
        }
        if (eventDetail.type !== VEHICLE_POSITION && eventDetail.tripDate) {
            return moment(eventDetail.tripDate).format('YYYY-MM-DD');
        }
        return 'N/A';
    };

    const getTripId = () => {
        if (eventDetail.type === VEHICLE_POSITION && eventDetail.trip) {
            return eventDetail.tripId;
        }
        if (eventDetail.type !== VEHICLE_POSITION && !_.isNull(eventDetail.tripId)) {
            return eventDetail.tripId;
        }
        return 'N/A';
    };

    const eventTime = moment.unix(eventDetail.timestamp).tz(DATE_TYPE.TIME_ZONE).format('HH:mm:ss');
    const IconName = Icons[eventDetail.type];

    const getTime = (time) => {
        const startTime = time.start ? time.start : 'N/A';
        const endTime = time.end ? time.end : 'N/A';
        return `${startTime} - ${endTime}`;
    };

    const formatCoordinate = (coordinate) => {
        const firstHalf = coordinate.toString().split('.')[0];
        const secondHalf = coordinate.toString().split('.')[1];
        const formattedSecondHalf = secondHalf.slice(0, 5);
        return firstHalf.concat('.', formattedSecondHalf);
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
                    { formatCoordinate(eventDetail.position.latitude) }
                    , lon:
                    {' '}
                    { formatCoordinate(eventDetail.position.longitude) }
                </div>
            </div>
            <div className="row">
                <div className="col pb-2">
                    <b>Route:</b>
                    {' '}
                    { !_.isEmpty(eventDetail.routeShortName) ? eventDetail.routeShortName : 'N/A' }
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
                    { getDate() }
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
                    { getTripId() }
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
