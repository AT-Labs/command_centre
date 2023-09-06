import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Form, FormGroup, Input, Label, Button } from 'reactstrap';

import { addTrip, toggleAddTripModals, updateIsNewTripDetailsFormEmpty } from '../../../../../redux/actions/control/routes/trip-instances';
import { getServiceDate } from '../../../../../redux/selectors/control/serviceDate';
import VEHICLE_TYPES, { TRAIN_TYPE_ID } from '../../../../../types/vehicle-types';
import Stops from '../../../Common/Stops/Stops';
import { TripInstanceType } from '../../Types';
import { SERVICE_DATE_FORMAT } from '../../../../../utils/control/routes';

import './NewTripDetails.scss';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import { isNewTripModalOpen, getAddTripAction } from '../../../../../redux/selectors/control/routes/trip-instances';
import NewTripModal from './NewTripModal';

export const NewTripDetails = (props) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isActionDisabled, setIsActionDisabled] = useState(true);
    const [isStartTimeInvalid, setIsStartTimeInvalid] = useState(false);
    const [referenceId, setReferenceId] = useState('');

    useEffect(() => {
        props.updateIsNewTripDetailsFormEmpty(startTime === '' && referenceId === '');
    }, [startTime, referenceId]);

    useEffect(() => {
        setStartTime('');
        setEndTime('');
        setIsActionDisabled(true);
        setIsStartTimeInvalid(false);
        setReferenceId('');
        props.updateIsNewTripDetailsFormEmpty(true);
    }, [props.tripInstance]);

    const getDelayInMinutes = (originalStartTime, newStartTime) => {
        const startMoment = moment(originalStartTime, 'HH:mm:ss');
        const newStartMoment = moment(newStartTime, 'HH:mm:ss');
        return newStartMoment.diff(startMoment, 'minutes');
    };

    const addMinutesToTime = (timeString, minutesToAdd) => {
        const [hours, minutes, seconds] = timeString.split(':');
        let totalMinutes = Number(hours) * 60 + Number(minutes);
        totalMinutes += minutesToAdd;
        const updatedHours = Math.floor(totalMinutes / 60);
        const updatedMinutes = totalMinutes % 60;
        return [updatedHours, updatedMinutes, seconds]
            .filter(time => time !== undefined)
            .map(time => `${String(time).padStart(2, '0')}`)
            .join(':');
    };

    const isReferenceIdRequired = () => props.tripInstance.routeType === TRAIN_TYPE_ID;

    const isStartTimeValid = start => start.match('^(([0-3][0-9])|40):[0-5][0-9]:[0-5][0-9]$') && getDelayInMinutes(moment().format('HH:mm:ss'), start) >= 10;

    const isReferenceIdValid = refId => !!refId.trim();

    const isMainActionEnabled = (start, refId) => (!isReferenceIdRequired() || isReferenceIdValid(refId)) && isStartTimeValid(start);

    const handleStartTimeChange = (event) => {
        const { value } = event.target;

        const delayInMinutes = getDelayInMinutes(props.tripInstance.startTime, value);

        const isNewStartTimeInvalid = !isStartTimeValid(value);
        const newEndTime = isNewStartTimeInvalid ? '' : addMinutesToTime(props.tripInstance.endTime, delayInMinutes);

        setStartTime(value);
        setEndTime(newEndTime);
        setIsActionDisabled(!isMainActionEnabled(value, referenceId));
        setIsStartTimeInvalid(isNewStartTimeInvalid);
    };

    const handleReferenceIdChange = (event) => {
        const { value } = event.target;
        setReferenceId(value);
        setIsActionDisabled(!isMainActionEnabled(startTime, value.trim()));
    };

    const getUpdatedStopTimes = (tripInstance, newStartTime) => {
        if (!isStartTimeValid(newStartTime)) {
            return tripInstance.stops;
        }
        const delayInMinutes = getDelayInMinutes(tripInstance.startTime, newStartTime);

        return tripInstance.stops.map((stop) => {
            const updatedArrivalTime = addMinutesToTime(stop.scheduledArrivalTime, delayInMinutes);
            const updatedDepartureTime = addMinutesToTime(stop.scheduledDepartureTime, delayInMinutes);
            return {
                ...stop,
                arrivalTime: updatedArrivalTime,
                departureTime: updatedDepartureTime,
                scheduledArrivalTime: updatedArrivalTime,
                scheduledDepartureTime: updatedDepartureTime,
            };
        });
    };

    const mode = VEHICLE_TYPES[props.tripInstance.routeType].type;

    const newTrip = {
        ...props.tripInstance,
        serviceDate: moment(props.serviceDate).format(SERVICE_DATE_FORMAT),
        startTime,
        endTime,
        stops: getUpdatedStopTimes(props.tripInstance, startTime),
        referenceId,
    };

    return props.tripInstance && (
        <div className="add-trip-new-trip-details p-3">
            <h3>New Trip Details</h3>
            <span className="text-muted">
                The new trip will have the information presented in this section. Please confirm the trip details.
            </span>
            <div className="add-trip-new-trip-details__content">
                <Form>
                    <div className="pl-3 pt-3">
                        <div className="row">
                            <FormGroup className="d-flex">
                                <Label for="add-trip-new-trip-details__service-date">
                                    <span className="font-size-md font-weight-bold pr-2">Service date:</span>
                                </Label>
                                <div id="add-trip-new-trip-details__service-date">{ `${moment(props.serviceDate).format('DD-MM-YYYY')} (Today)` }</div>
                            </FormGroup>
                        </div>
                        <div className="row">
                            <FormGroup className="d-flex">
                                <Label for="add-trip-new-trip-details__mode">
                                    <span className="font-size-md font-weight-bold pr-2">Mode:</span>
                                </Label>
                                <div id="add-trip-new-trip-details__mode">{ mode }</div>
                            </FormGroup>
                        </div>
                        <div className="row">
                            <FormGroup className="d-flex">
                                <Label for="add-trip-new-trip-details__route-variant">
                                    <span className="font-size-md font-weight-bold pr-2">Route Variant:</span>
                                </Label>
                                <div id="add-trip-new-trip-details__route-variant">{ props.tripInstance.routeVariantId }</div>
                            </FormGroup>
                        </div>
                        <div className="row">
                            <FormGroup className="d-flex">
                                <Label for="add-trip-new-trip-details__route-variant-name">
                                    <span className="font-size-md font-weight-bold pr-2">Route Variant name:</span>
                                </Label>
                                <div id="add-trip-new-trip-details__route-variant-name">{ props.tripInstance.routeLongName }</div>
                            </FormGroup>
                        </div>
                        <div className="row">
                            <FormGroup className="d-flex">
                                <Label for="add-trip-new-trip-details__start-time">
                                    <span className="font-size-md font-weight-bold pr-2">Start time</span>
                                </Label>
                                <Input
                                    id="add-trip-new-trip-details__start-time"
                                    className="add-trip-new-trip-details__start-time"
                                    placeholder={ props.tripInstance.startTime }
                                    value={ startTime }
                                    onChange={ handleStartTimeChange }
                                    invalid={ isStartTimeInvalid }
                                />
                            </FormGroup>
                            <FormGroup className="d-flex pl-3">
                                <Label for="add-trip-new-trip-details__end-time">
                                    <span className="font-size-md font-weight-bold pr-2">End time:</span>
                                </Label>
                                <div id="add-trip-new-trip-details__end-time">{ endTime }</div>
                            </FormGroup>
                        </div>
                        <div className="row">
                            <FormGroup className="d-flex">
                                <Label for="add-trip-new-trip-details__reference-id">
                                    <span className="font-size-md font-weight-bold pr-2">Reference ID (Optional for bus and ferry)</span>
                                </Label>
                                <Input
                                    id="add-trip-new-trip-details__reference-id"
                                    className="add-trip-new-trip-details__reference-id"
                                    value={ referenceId }
                                    onChange={ handleReferenceIdChange }
                                />
                            </FormGroup>
                        </div>
                        <div className="col-12">
                            <Stops
                                tripInstance={ newTrip }
                                showActuals={ false } />
                        </div>
                    </div>
                </Form>
                <footer className="mt-3">
                    <Button
                        id="add-trip-new-trip-details__add-trip"
                        className="btn cc-btn-primary continue ml-3"
                        aria-label="Add Trip"
                        disabled={ isActionDisabled }
                        onClick={ () => {
                            props.addTrip(newTrip);
                            props.toggleAddTripModals('isNewTripModalOpen', true);
                        } }
                    >
                        Add Trip
                    </Button>
                </footer>
            </div>
            <CustomModal
                className="add-trip-new-trip-details__modal"
                title={ props.action.result ? 'New trip added' : 'Add trip' }
                isModalOpen={ props.isNewTripModalOpen }>
                <NewTripModal response={ props.action } />
            </CustomModal>
        </div>
    );
};

NewTripDetails.propTypes = {
    tripInstance: TripInstanceType.isRequired,
    serviceDate: PropTypes.string.isRequired,
    addTrip: PropTypes.func.isRequired,
    isNewTripModalOpen: PropTypes.bool.isRequired,
    action: PropTypes.object.isRequired,
    toggleAddTripModals: PropTypes.func.isRequired,
    updateIsNewTripDetailsFormEmpty: PropTypes.func.isRequired,
};

export default connect(state => ({
    serviceDate: getServiceDate(state),
    isNewTripModalOpen: isNewTripModalOpen(state),
    action: getAddTripAction(state),
}), { addTrip, toggleAddTripModals, updateIsNewTripDetailsFormEmpty })(NewTripDetails);
