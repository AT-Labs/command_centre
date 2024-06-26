import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { connect } from 'react-redux';
import { Form, FormGroup, Label, Button } from 'reactstrap';
import { AiFillInfoCircle } from 'react-icons/ai';

import { isEmpty, omit } from 'lodash-es';
import { addTrips, deselectAllStopsByTrip, toggleAddTripModals } from '../../../../../redux/actions/control/routes/trip-instances';
import { getServiceDate } from '../../../../../redux/selectors/control/serviceDate';
import VEHICLE_TYPES, { TRAIN_TYPE_ID } from '../../../../../types/vehicle-types';
import Stops from '../../../Common/Stops/Stops';
import { StopStatus, TripInstanceType, updateStopsModalTypes } from '../../Types';
import { SERVICE_DATE_FORMAT } from '../../../../../utils/control/routes';
import { TIME_PATTERN } from '../../../../../constants/time';
import { convertTimeToMinutes, getDifferenceInMinutes, addMinutesToTime } from '../../../../../utils/helpers';
import TRIP_STATUS_TYPES from '../../../../../types/trip-status-types';

import './NewTripDetails.scss';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import { isNewTripModalOpen, getAddTripAction, getSelectedStopsByTripKey } from '../../../../../redux/selectors/control/routes/trip-instances';
import NewTripModal from './NewTripModal';
import { NewTripsTable } from './NewTripsTable';
import StopSelectionFooter from '../../bulkSelection/StopSelectionFooter';
import { useAddTripStopUpdate, useNonStopping, useRemoveStops } from '../../../../../redux/selectors/appSettings';

const updateStopHeadsign = (stop, headsign) => ({
    ...stop,
    stopHeadsign: headsign,
});

const changePlatform = (stop, newPlatform) => ({
    ...stop,
    platformCode: newPlatform.platform_code,
    stopCode: newPlatform.stop_code,
    stopId: newPlatform.stop_id,
    stopLat: newPlatform.stop_lat,
    stopLon: newPlatform.stop_lon,
    stopName: newPlatform.stop_name,
});

const setNonStopping = stop => ({
    ...stop,
    status: StopStatus.nonStopping,
});

const reinstateStop = stop => ({
    ...stop,
    status: StopStatus.notPassed,
});

export const NewTripDetails = forwardRef((props, ref) => {
    const [isActionDisabled, setIsActionDisabled] = useState(true);
    const [isStopsPreviewOpen, setIsStopsPreviewOpen] = useState(false);
    const [isFormEmpty, setIsFormEmpty] = useState(true);
    const [tripsToAdd, setTripsToAdd] = useState([]);
    const [tripTemplate, setTripTemplate] = useState({
        ...props.tripInstance,
        serviceDate: moment(props.serviceDate).format(SERVICE_DATE_FORMAT),
    });
    const [currentTrip, setCurrentTrip] = useState();
    const [currentTime, setCurrentTime] = useState(new Date());

    useImperativeHandle(ref, () => ({
        shouldShowConfirmationModal: () => !isFormEmpty,
        isFormEmpty: () => isFormEmpty,
    }));

    useEffect(() => {
        setIsActionDisabled(true);
        setTripTemplate({
            ...props.tripInstance,
            serviceDate: moment(props.serviceDate).format(SERVICE_DATE_FORMAT),
        });
        props.deselectAllStopsByTrip({ tripId: null });
        setTripsToAdd([]);
    }, [props.tripInstance]);

    useEffect(() => {
        const secondsUntilNextMinute = 60 - currentTime.getSeconds();

        const intervalId = setInterval(() => {
            setCurrentTime(new Date());
        }, secondsUntilNextMinute * 1000);

        return () => clearInterval(intervalId);
    }, [currentTime]);

    const isReferenceIdRequired = () => tripTemplate.routeType === TRAIN_TYPE_ID;

    const isStartTimeValid = start => (TIME_PATTERN.test(start)
     && convertTimeToMinutes(start) <= convertTimeToMinutes('28:00'))
     && getDifferenceInMinutes(moment().format('HH:mm'), start) >= 0;

    const isReferenceIdValid = refId => !!refId.trim();

    const isTripValid = (start, refId) => (!isReferenceIdRequired() || isReferenceIdValid(refId)) && isStartTimeValid(start);
    const isTripEmpty = (start, refId) => start === '' && refId === '';

    const hasDuplicateStartTime = (trips) => {
        const startTimeSet = new Set();
        let hasDuplicates = false;

        trips.forEach((trip) => {
            if (startTimeSet.has(trip.startTime)) {
                hasDuplicates = true;
            }
            startTimeSet.add(trip.startTime);
        });
        return hasDuplicates;
    };

    const handleStopUpdate = (options) => {
        const updatedStops = tripTemplate.stops.map((stop) => {
            if (!options.stopCodes.includes(stop.stopCode)) {
                return stop;
            }

            setIsFormEmpty(false);

            switch (options.action) {
            case updateStopsModalTypes.UPDATE_HEADSIGN:
                return updateStopHeadsign(stop, options.headsign);
            case updateStopsModalTypes.CHANGE_PLATFORM:
                return changePlatform(stop, options.newPlatform);
            case updateStopsModalTypes.SET_NON_STOPPING:
                return setNonStopping(stop);
            case updateStopsModalTypes.REINSTATE:
                return reinstateStop(stop);
            case updateStopsModalTypes.SET_FIRST_STOP:
                if (stop.stopCode === options.firstStop.stopCode) {
                    tripTemplate.startTime = options.startTime;
                    return {
                        ...stop,
                        firstStop: true,
                        lastStop: false,
                    };
                }
                return {
                    ...stop,
                    firstStop: false,
                };
            case updateStopsModalTypes.SET_LAST_STOP:
                if (stop.stopCode === options.lastStop.stopCode) {
                    tripTemplate.endTime = options.endTime;
                    return {
                        ...stop,
                        firstStop: false,
                        lastStop: true,
                    };
                }
                return {
                    ...stop,
                    lastStop: false,
                };
            default:
                return stop;
            }
        });

        props.deselectAllStopsByTrip({ tripId: null });
        setTripTemplate({ ...tripTemplate, stops: updatedStops });
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

    const mode = VEHICLE_TYPES[tripTemplate.routeType].type;

    const isStartTimeInvalid = () => tripsToAdd.some(trip => !isTripValid(trip.startTime, trip.referenceId)) || hasDuplicateStartTime(tripsToAdd);

    const isReferenceIdsInvalid = () => {
        const referenceIds = new Set();
        return tripsToAdd.some((trip) => {
            if (trip.referenceId) {
                const hasDuplicate = referenceIds.has(trip.referenceId);
                referenceIds.add(trip.referenceId);
                return hasDuplicate;
            }
            return false;
        });
    };

    useEffect(() => {
        setIsFormEmpty(!tripsToAdd.some(trip => !isTripEmpty(trip.startTime, trip.referenceId)));
        setIsActionDisabled(isStartTimeInvalid() || isReferenceIdsInvalid());
    }, [tripsToAdd, currentTime]);

    const getUpdatedStopTimes = (tripInstance, newStartTime) => {
        if (!isStartTimeValid(newStartTime)) {
            return tripTemplate.stops;
        }
        const delayInMinutes = getDifferenceInMinutes(tripInstance.startTime, newStartTime);

        return tripTemplate.stops.map((stop) => {
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

    const onNewTripModalClose = (clearTrips = true) => {
        if (clearTrips) {
            setTripsToAdd([]);
        }
    };

    const getStopsBetweenFirstAndLast = stops => stops.slice(stops.findIndex(stop => stop.firstStop), stops.findIndex(stop => stop.lastStop) + 1);

    const sanitizeStops = stops => getStopsBetweenFirstAndLast(stops).map((stop, index) => ({ ...omit(stop, ['firstStop', 'lastStop']), stopSequence: index + 1 }));

    const createNewTripObject = trip => ({
        tripId: tripTemplate.tripId,
        routeId: tripTemplate.routeId,
        routeShortName: tripTemplate.routeShortName,
        routeType: tripTemplate.routeType,
        routeVariantId: tripTemplate.routeVariantId,
        directionId: tripTemplate.directionId,
        routeLongName: tripTemplate.routeLongName,
        agencyId: tripTemplate.agencyId,
        depotId: tripTemplate.depotId,
        shapeId: tripTemplate.shapeId,
        tripHeadsign: tripTemplate.tripHeadsign,
        serviceDate: tripTemplate.serviceDate,
        referenceId: trip.referenceId,
        endTime: trip.endTime,
        stops: getUpdatedStopTimes(tripTemplate, trip.startTime), // calculate stops for each added trip
        startTime: trip.startTime ? `${trip.startTime}:00` : '', // We only accept HH:mm for startTime input on add trip screen. We need to make sure we also send seconds to backend.
    });

    const showStopsPreview = (trip) => {
        const tripObject = createNewTripObject(trip);
        setCurrentTrip({ ...tripObject, stops: getStopsBetweenFirstAndLast(tripObject.stops).map((stop, index) => ({ ...stop, stopSequence: index + 1 })) });
        setIsStopsPreviewOpen(true);
    };

    const hideStopsPreview = () => {
        setIsStopsPreviewOpen(false);
    };

    const addNewTrips = () => {
        props.addTrips(
            tripsToAdd.map((trip) => {
                const newTrip = createNewTripObject(trip);
                return {
                    ...newTrip,
                    stops: sanitizeStops(newTrip.stops),
                };
            }),
        );
        props.toggleAddTripModals('isNewTripModalOpen', true);
    };

    const shouldStopSelectionFooterBeShown = props.useAddTripStopUpdate && !isEmpty(props.selectedStopsByTripKey(addPermissions(tripTemplate)));

    return tripTemplate && (
        <div className="add-trip-new-trip-details p-3">
            <h3>New Trip Details</h3>
            <span className="text-muted">
                The new trip will have the information presented in this section. Please confirm the trip details.
            </span>
            <div className="add-trip-new-trip-details__content">
                <Form>
                    <div className="pl-3 pt-3">
                        <div className="row">
                            <FormGroup className="d-flex pr-2 pl-2">
                                <Label for="add-trip-new-trip-details__service-date">
                                    <span className="font-size-md font-weight-bold pr-2">Service date:</span>
                                </Label>
                                <div id="add-trip-new-trip-details__service-date">{ `${moment(props.serviceDate).format('DD-MM-YYYY')} (Today)` }</div>
                            </FormGroup>

                            <FormGroup className="d-flex pr-2 pl-2">
                                <Label for="add-trip-new-trip-details__mode">
                                    <span className="font-size-md font-weight-bold pr-2">Mode:</span>
                                </Label>
                                <div id="add-trip-new-trip-details__mode">{ mode }</div>
                            </FormGroup>

                            <FormGroup className="d-flex pr-2 pl-2">
                                <Label for="add-trip-new-trip-details__route-variant">
                                    <span className="font-size-md font-weight-bold pr-2">Route Variant:</span>
                                </Label>
                                <div id="add-trip-new-trip-details__route-variant">{ tripTemplate.routeVariantId }</div>
                            </FormGroup>

                            <FormGroup className="d-flex pr-2 pl-2">
                                <Label for="add-trip-new-trip-details__route-variant-name">
                                    <span className="font-size-md font-weight-bold pr-2">Route Variant name:</span>
                                </Label>
                                <div id="add-trip-new-trip-details__route-variant-name">{ tripTemplate.routeLongName }</div>
                            </FormGroup>
                        </div>
                        <div className="col-12">
                            <Stops
                                tripInstance={ props.useAddTripStopUpdate ? addPermissions(tripTemplate) : tripTemplate }
                                onStopUpdated={ handleStopUpdate }
                                showScheduled={ false }
                                showActuals={ false }
                                hideFooter />
                        </div>
                        <p className="cc-text-orange add-trip-new-trip-details__warning">
                            <AiFillInfoCircle className="add-trip-new-trip-details__warning__icon" />
                            Changes applied to the stops will be applied to all trips in the table.
                        </p>
                        <p>Add the start time and Reference ID for new trip(s). To add multiple trips, select the (+) button.</p>
                        <NewTripsTable
                            tripInstance={ tripTemplate }
                            trips={ tripsToAdd }
                            onAddedTripsChange={ setTripsToAdd }
                            onStopsPreview={ showStopsPreview } />
                    </div>
                </Form>
                { shouldStopSelectionFooterBeShown
                    ? (
                        <StopSelectionFooter
                            tripInstance={ addPermissions(tripTemplate) }
                            onStopUpdated={ handleStopUpdate }
                            showNonStoppingButton={ props.useNonStopping }
                            showRemoveStopsButtons={ props.useRemoveStops }
                        />
                    )
                    : (
                        <footer className="mt-3">
                            <Button
                                id="add-trip-new-trip-details__add-trip"
                                className="btn cc-btn-primary continue ml-3"
                                aria-label="Add Trip"
                                disabled={ isActionDisabled }
                                onClick={ addNewTrips }
                            >
                                Add Trip
                            </Button>
                        </footer>
                    )}
            </div>
            <CustomModal
                className="add-trip-new-trip-details__modal"
                title={ props.action.result ? 'New trip(s) added' : 'Add trip' }
                isModalOpen={ props.isNewTripModalOpen }>
                <NewTripModal response={ props.action } onClose={ onNewTripModalClose } />
            </CustomModal>
            <CustomModal
                className="cc-modal-standard-width add-trip-new-trip-details__preview"
                title="Scheduled Stop Times"
                isModalOpen={ isStopsPreviewOpen }
                onClose={ hideStopsPreview }>
                <Stops
                    tripInstance={ currentTrip }
                    showActuals={ false }
                    hideFooter />
            </CustomModal>
        </div>
    );
});

NewTripDetails.propTypes = {
    tripInstance: TripInstanceType.isRequired,
    serviceDate: PropTypes.string.isRequired,
    addTrips: PropTypes.func.isRequired,
    isNewTripModalOpen: PropTypes.bool.isRequired,
    action: PropTypes.object.isRequired,
    toggleAddTripModals: PropTypes.func.isRequired,
    selectedStopsByTripKey: PropTypes.func.isRequired,
    useAddTripStopUpdate: PropTypes.bool.isRequired,
    deselectAllStopsByTrip: PropTypes.func.isRequired,
    useNonStopping: PropTypes.bool.isRequired,
    useRemoveStops: PropTypes.bool.isRequired,
};

export default connect(state => ({
    serviceDate: getServiceDate(state),
    isNewTripModalOpen: isNewTripModalOpen(state),
    action: getAddTripAction(state),
    selectedStopsByTripKey: tripInstance => getSelectedStopsByTripKey(state.control.routes.tripInstances.selectedStops, tripInstance),
    useAddTripStopUpdate: useAddTripStopUpdate(state),
    useNonStopping: useNonStopping(state),
    useRemoveStops: useRemoveStops(state),
}), { addTrips, toggleAddTripModals, deselectAllStopsByTrip }, null, { forwardRef: true })(NewTripDetails);
