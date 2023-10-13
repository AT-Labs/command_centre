import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Form, FormGroup, Input, Label, Button } from 'reactstrap';

import { isEmpty } from 'lodash-es';
import { addTrips, deselectAllStopsByTrip, toggleAddTripModals, updateIsNewTripDetailsFormEmpty } from '../../../../../redux/actions/control/routes/trip-instances';
import { getServiceDate } from '../../../../../redux/selectors/control/serviceDate';
import VEHICLE_TYPES, { TRAIN_TYPE_ID } from '../../../../../types/vehicle-types';
import Stops from '../../../Common/Stops/Stops';
import { TripInstanceType, updateStopsModalTypes } from '../../Types';
import { SERVICE_DATE_FORMAT } from '../../../../../utils/control/routes';
import { TIME_PATTERN } from '../../../../../constants/time';
import { getTripTimeDisplay, convertTimeToMinutes } from '../../../../../utils/helpers';
import TRIP_STATUS_TYPES from '../../../../../types/trip-status-types';

import './NewTripDetails.scss';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import { isNewTripModalOpen, getAddTripAction, getSelectedStopsByTripKey } from '../../../../../redux/selectors/control/routes/trip-instances';
import NewTripModal from './NewTripModal';
import StopSelectionFooter from '../../bulkSelection/StopSelectionFooter';
import { useAddTripStopUpdate } from '../../../../../redux/selectors/appSettings';

export const NewTripDetails = (props) => {
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isActionDisabled, setIsActionDisabled] = useState(true);
    const [isStartTimeInvalid, setIsStartTimeInvalid] = useState(false);
    const [referenceId, setReferenceId] = useState('');
    const [isFormEmpty, setIsFormEmpty] = useState(true);
    const [stops, setStops] = useState(props.tripInstance.stops);

    useEffect(() => {
        setIsFormEmpty(startTime === '' && referenceId === '');
    }, [startTime, referenceId]);

    useEffect(() => {
        props.updateIsNewTripDetailsFormEmpty(isFormEmpty);
    }, [isFormEmpty]);

    useEffect(() => {
        setStartTime('');
        setEndTime('');
        setIsActionDisabled(true);
        setIsStartTimeInvalid(false);
        setReferenceId('');
        setStops(props.tripInstance.stops);
        props.updateIsNewTripDetailsFormEmpty(true);
        props.deselectAllStopsByTrip({ tripId: null });
    }, [props.tripInstance]);

    const getDelayInMinutes = (originalStartTime, newStartTime) => convertTimeToMinutes(newStartTime) - convertTimeToMinutes(originalStartTime);

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

    const isStartTimeValid = start => (TIME_PATTERN.test(start)
     && convertTimeToMinutes(start) <= convertTimeToMinutes('28:00'))
     && getDelayInMinutes(moment().format('HH:mm'), start) >= 10;

    const isReferenceIdValid = refId => !!refId.trim();

    const isMainActionEnabled = (start, refId) => (!isReferenceIdRequired() || isReferenceIdValid(refId)) && isStartTimeValid(start);

    const handleStartTimeChange = (event) => {
        const { value } = event.target;
        const isNewStartTimeInvalid = !isStartTimeValid(value);
        const newEndTime = isNewStartTimeInvalid ? '' : addMinutesToTime(props.tripInstance.endTime, getDelayInMinutes(props.tripInstance.startTime, value));

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

    const handleStopUpdate = (options) => {
        setStops(stops.map((stop) => {
            if (options.stopCodes.includes(stop.stopCode)) {
                setIsFormEmpty(false);
                if (options.action === updateStopsModalTypes.UPDATE_HEADSIGN) {
                    return { ...stop, stopHeadsign: options.headsign };
                }
                if (options.action === updateStopsModalTypes.CHANGE_PLATFORM) {
                    return {
                        ...stop,
                        platformCode: options.newPlatform.platform_code,
                        stopCode: options.newPlatform.stop_code,
                        stopId: options.newPlatform.stop_id,
                        stopLat: options.newPlatform.stop_lat,
                        stopLon: options.newPlatform.stop_lon,
                        stopName: options.newPlatform.stop_name,
                    };
                }
            }
            return stop;
        }));
    };

    // This method add temporary permissions to the stops so that stops are editable in the Stops component.
    const addPermissions = trip => ({
        ...trip,
        tripId: null, // set the trip id to null so the stops component knows it is a new trip.
        stops: trip.stops.map(stop => ({
            ...stop,
            _links: {
                permissions: [
                    {
                        _rel: 'update_headsign',
                    },
                    {
                        _rel: 'change',
                    },
                ],
            },
        })),
        status: TRIP_STATUS_TYPES.notStarted,
    });

    const getUpdatedStopTimes = (tripInstance, newStartTime) => {
        if (!isStartTimeValid(newStartTime)) {
            return stops;
        }
        const delayInMinutes = getDelayInMinutes(tripInstance.startTime, newStartTime);

        return stops.map((stop) => {
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
        serviceDate: moment(props.serviceDate).format(SERVICE_DATE_FORMAT),
        tripId: props.tripInstance.tripId,
        routeId: props.tripInstance.routeShortName,
        routeShortName: props.tripInstance.routeShortName,
        routeType: props.tripInstance.routeType,
        routeVariantId: props.tripInstance.routeVariantId,
        directionId: props.tripInstance.directionId,
        routeLongName: props.tripInstance.routeLongName,
        agencyId: props.tripInstance.agencyId,
        depotId: props.tripInstance.depotId,
        stops: getUpdatedStopTimes(props.tripInstance, startTime),
        shapeId: props.tripInstance.shapeId,
        tripHeadsign: props.tripInstance.tripHeadsign,
        startTime: startTime ? `${startTime}:00` : '', // We only accept HH:mm for startTime input on add trip screen. We need to make sure we also send seconds to backend.
        endTime,
        referenceId,
    };

    const shouldStopSelectionFooterBeShown = props.useAddTripStopUpdate && !isEmpty(props.selectedStopsByTripKey(addPermissions(newTrip)));

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
                                    placeholder={ getTripTimeDisplay(props.tripInstance.startTime) }
                                    value={ startTime }
                                    onChange={ handleStartTimeChange }
                                    invalid={ isStartTimeInvalid }
                                />
                            </FormGroup>
                            <FormGroup className="d-flex pl-3">
                                <Label for="add-trip-new-trip-details__end-time">
                                    <span className="font-size-md font-weight-bold pr-2">End time:</span>
                                </Label>
                                <div id="add-trip-new-trip-details__end-time">{ endTime ? getTripTimeDisplay(endTime) : '' }</div>
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
                                tripInstance={ props.useAddTripStopUpdate ? addPermissions(newTrip) : newTrip }
                                stopUpdatedHandler={ handleStopUpdate }
                                showActuals={ false }
                                hideFooter />
                        </div>
                    </div>
                </Form>
                { shouldStopSelectionFooterBeShown
                    ? (
                        <StopSelectionFooter tripInstance={ addPermissions(newTrip) } stopUpdatedHandler={ handleStopUpdate } />
                    )
                    : (
                        <footer className="mt-3">
                            <Button
                                id="add-trip-new-trip-details__add-trip"
                                className="btn cc-btn-primary continue ml-3"
                                aria-label="Add Trip"
                                disabled={ isActionDisabled }
                                onClick={ () => {
                                    props.addTrips([newTrip]);
                                    props.toggleAddTripModals('isNewTripModalOpen', true);
                                } }
                            >
                                Add Trip
                            </Button>
                        </footer>
                    )}
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
    addTrips: PropTypes.func.isRequired,
    isNewTripModalOpen: PropTypes.bool.isRequired,
    action: PropTypes.object.isRequired,
    toggleAddTripModals: PropTypes.func.isRequired,
    updateIsNewTripDetailsFormEmpty: PropTypes.func.isRequired,
    selectedStopsByTripKey: PropTypes.func.isRequired,
    useAddTripStopUpdate: PropTypes.bool.isRequired,
    deselectAllStopsByTrip: PropTypes.func.isRequired,
};

export default connect(state => ({
    serviceDate: getServiceDate(state),
    isNewTripModalOpen: isNewTripModalOpen(state),
    action: getAddTripAction(state),
    selectedStopsByTripKey: tripInstance => getSelectedStopsByTripKey(state.control.routes.tripInstances.selectedStops, tripInstance),
    useAddTripStopUpdate: useAddTripStopUpdate(state),
}), { addTrips, toggleAddTripModals, updateIsNewTripDetailsFormEmpty, deselectAllStopsByTrip })(NewTripDetails);
