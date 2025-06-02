import { capitalize, find, get, filter, some, toNumber } from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { FaCheckCircle, FaRegClock, FaTimesCircle, FaEyeSlash } from 'react-icons/fa';
import { connect } from 'react-redux';
import { IS_LOGIN_NOT_REQUIRED } from '../../../auth';
import { goToBlocksView } from '../../../redux/actions/control/link';
import {
    clearTripInstanceActionResult, copyTrip, moveTripToNextStop, updateTripInstanceDelay, setTripStatusModalOrigin, removeBulkUpdateMessages,
} from '../../../redux/actions/control/routes/trip-instances';
import { getAgencies } from '../../../redux/selectors/control/agencies';
import { getAllocations, getVehicleAllocationLabelByTrip } from '../../../redux/selectors/control/blocks';
import { getTripInstancesActionLoading, getTripInstancesActionResults, getTripStatusModalOriginState } from '../../../redux/selectors/control/routes/trip-instances';
import { getServiceDate } from '../../../redux/selectors/control/serviceDate';
import { getControlBlockViewPermission } from '../../../redux/selectors/user';
import MESSAGE_TYPES, { CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES } from '../../../types/message-types';
import TRIP_STATUS_TYPES from '../../../types/trip-status-types';
import VEHICLE_TYPE, { TRAIN_TYPE_ID } from '../../../types/vehicle-types';
import { formatTripDelay, isTripAdded } from '../../../utils/control/routes';
import { getTripInstanceId, getTripTimeDisplay } from '../../../utils/helpers';
import { isMoveToStopPermitted, isTripCancelPermitted, isTripCopyPermitted, isTripDelayPermitted, isHideCancellationPermitted } from '../../../utils/user-permissions';
import ButtonBar from '../Common/ButtonBar/ButtonBar';
import ConfirmationModal from '../Common/ConfirmationModal/ConfirmationModal';
import Message from '../Common/Message/Message';
import Stops from '../Common/Stops/Stops';
import TripDetails from '../Common/Trip/TripDetails';
import CopyTripModal from './Modals/CopyTripModal';
import SetTripDelayModal from './Modals/SetTripDelayModal';
import UpdateTripStatusModal from './Modals/UpdateTripStatusModal';
import { AgencyType, TripInstanceType, updateTripsStatusModalOrigins, updateTripsStatusModalTypes, TRIP_HOLD_STATUS } from './Types';
import StopSelectionMessages from './bulkSelection/StopSelectionMessages';
import { useHideTrip, useHoldTrip } from '../../../redux/selectors/appSettings';
import UpdateTripHoldModal from './Modals/UpdateTripHoldModal';

export class TripView extends React.Component {
    static propTypes = {
        tripInstance: TripInstanceType.isRequired,
        actionResults: PropTypes.arrayOf(PropTypes.shape({
            id: PropTypes.string.isRequired,
            body: PropTypes.node.isRequired,
            type: PropTypes.oneOf(MESSAGE_TYPES),
            tripId: PropTypes.string,
        })),
        isControlBlockViewPermitted: PropTypes.bool.isRequired,
        agencies: PropTypes.arrayOf(AgencyType),
        actionLoadingStatesByTripId: PropTypes.object.isRequired,
        clearTripInstanceActionResult: PropTypes.func.isRequired,
        updateTripInstanceDelay: PropTypes.func.isRequired,
        copyTrip: PropTypes.func.isRequired,
        moveTripToNextStop: PropTypes.func.isRequired,
        goToBlocksView: PropTypes.func.isRequired,
        serviceDate: PropTypes.string.isRequired,
        vehicleAllocations: PropTypes.object.isRequired,
        tripStatusModalOrigin: PropTypes.string,
        setTripStatusModalOrigin: PropTypes.func.isRequired,
        useHideTrip: PropTypes.bool.isRequired,
        removeBulkUpdateMessages: PropTypes.func.isRequired,
        useHoldTrip: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        actionResults: [],
        agencies: [],
        tripStatusModalOrigin: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            isSetTripStatusModalOpen: false,
            tripStatusModalType: updateTripsStatusModalTypes.CANCEL_MODAL,
            isSetTripDelayModalOpen: false,
            isRemoveTripDelayModalOpen: false,
            isCopyTripModalOpen: false,
            isMoveToNextStopModalOpen: false,
            isTripHoldModalOpen: false,
        };
    }

    getTripDetailsData = (tripInstance) => {
        const vehicleAllocationLabel = getVehicleAllocationLabelByTrip(tripInstance, this.props.vehicleAllocations);
        const agency = find(this.props.agencies, { agencyId: tripInstance.agencyId });
        const depot = agency ? find(agency.depots, { depotId: tripInstance.depotId }) : undefined;
        const tripDelay = (this.props.tripInstance.status === TRIP_STATUS_TYPES.cancelled) ? '—' : `${formatTripDelay(tripInstance.delay)} min` || '—';
        const details = [
            [
                { name: 'Service ID', value: tripInstance.serviceId || '—' },
                { name: 'Vehicle Label', value: vehicleAllocationLabel || tripInstance.vehicleLabel || '—' },
                { name: 'Trip ID', value: tripInstance.tripId || '—' },
                { name: 'Route number', value: tripInstance.routeVariantId || '—' },
            ], [
                { name: 'Mode', value: capitalize(VEHICLE_TYPE[tripInstance.routeType].type) || '—' },
                { name: 'Operator', value: get(agency, 'agencyName') || '—' },
                { name: 'Depot', value: get(depot, 'depotName') || '—' },
                { name: 'Service date', value: moment(tripInstance.serviceDate).format('DD MMM YYYY') || '—' },
            ], [
                { name: 'Start time', value: getTripTimeDisplay(tripInstance.startTime) || '—' },
                { name: 'End time', value: getTripTimeDisplay(tripInstance.endTime) || '—' },
                { name: 'Service type', value: '—' },
                { name: 'Delay', value: tripDelay },
            ],
        ];

        if (tripInstance.routeType === TRAIN_TYPE_ID) {
            details[0].splice(2, 0, { name: 'Block ID', value: tripInstance.blockId || '—' });
            details[1].push({ name: 'External Ref ID', value: tripInstance.referenceId || '—' });
        }

        return details;
    };

    getButtonBarConfig = (tripInstance) => {
        if (moment(this.props.serviceDate).isAfter(moment().add(1, 'days'), 'day')) {
            return [];
        }

        if (moment(this.props.serviceDate).isBefore(moment(), 'day') && tripInstance.endTime < '24:00:00') {
            return [];
        }

        const buttonBarConfig = [];
        const isBeforeTomorrow = moment(this.props.serviceDate).isBefore(moment().add(1, 'days'), 'day');
        const isNotStarted = tripInstance.status === TRIP_STATUS_TYPES.notStarted;
        const isInProgress = tripInstance.status === TRIP_STATUS_TYPES.inProgress;
        const isMissed = tripInstance.status === TRIP_STATUS_TYPES.missed;
        const isCancelled = tripInstance.status === TRIP_STATUS_TYPES.cancelled;
        const isCancelPermitted = IS_LOGIN_NOT_REQUIRED || isTripCancelPermitted(tripInstance);
        const isCancelPossible = isNotStarted || isMissed || isInProgress;
        const isReinstatePossible = isCancelled;
        const isHideTripPermitted = IS_LOGIN_NOT_REQUIRED || isHideCancellationPermitted(tripInstance);
        const isHideCancellationPossible = isCancelled && !!tripInstance.display && moment(tripInstance.serviceDate).isSame(moment(), 'day');
        const isDelayEditPermitted = isBeforeTomorrow && (IS_LOGIN_NOT_REQUIRED || isTripDelayPermitted(tripInstance));
        const isDelayEditPossible = isInProgress || isNotStarted || isMissed;
        const isMoveTripToNextStopPermitted = IS_LOGIN_NOT_REQUIRED || isMoveToStopPermitted(tripInstance);
        const isMoveTripToNextStopPossible = isInProgress || isMissed || isNotStarted;
        const isOnHoldPossible = (isNotStarted || isInProgress) && VEHICLE_TYPE[tripInstance.routeType].type === 'Train';

        if (isCancelPermitted && isCancelPossible) {
            buttonBarConfig.push({
                label: 'Cancel trip',
                icon: <FaTimesCircle className="text-danger" />,
                action: () => {
                    this.props.removeBulkUpdateMessages(CONFIRMATION_MESSAGE_TYPE);
                    this.setState({ isSetTripStatusModalOpen: true });
                    this.setState({ tripStatusModalType: updateTripsStatusModalTypes.CANCEL_MODAL });
                    this.props.setTripStatusModalOrigin(updateTripsStatusModalOrigins.TRIP_VIEW);
                },
            });
        }

        if (isCancelPermitted && isReinstatePossible) {
            buttonBarConfig.push({
                label: 'Reinstate trip',
                icon: <FaCheckCircle className="text-success" />,
                action: () => {
                    this.props.removeBulkUpdateMessages(CONFIRMATION_MESSAGE_TYPE);
                    this.setState({ isSetTripStatusModalOpen: true });
                    this.setState({ tripStatusModalType: updateTripsStatusModalTypes.REINSTATE_MODAL });
                    this.props.setTripStatusModalOrigin(updateTripsStatusModalOrigins.TRIP_VIEW);
                },
            });
        }

        if (this.props.useHideTrip && isHideCancellationPossible && isHideTripPermitted) {
            buttonBarConfig.push({
                label: 'Hide cancellation',
                icon: <FaEyeSlash />,
                action: () => {
                    this.props.removeBulkUpdateMessages(CONFIRMATION_MESSAGE_TYPE);
                    this.setState({ isSetTripStatusModalOpen: true });
                    this.setState({ tripStatusModalType: updateTripsStatusModalTypes.HIDE_TRIP_MODAL });
                    this.props.setTripStatusModalOrigin(updateTripsStatusModalOrigins.TRIP_VIEW);
                },
            });
        }

        if (isDelayEditPermitted && isDelayEditPossible) {
            if (!tripInstance.hasManualDelay) {
                buttonBarConfig.push({
                    label: 'Set trip delay',
                    icon: <FaRegClock className="text-info" />,
                    action: () => this.setState({ isSetTripDelayModalOpen: true }),
                });
            } else {
                buttonBarConfig.push({
                    label: 'Edit trip delay',
                    icon: <FaRegClock className="text-info" />,
                    action: () => this.setState({ isSetTripDelayModalOpen: true }),
                });
                buttonBarConfig.push({
                    label: 'Remove trip delay',
                    icon: <FaRegClock className="text-danger" />,
                    action: () => this.setState({ isRemoveTripDelayModalOpen: true }),
                });
            }
        }

        if (isTripCopyPermitted(tripInstance) && !isTripAdded(tripInstance)) {
            buttonBarConfig.push({
                label: 'Duplicate trip',
                action: () => this.setState({ isCopyTripModalOpen: true }),
            });
        }

        if (this.props.isControlBlockViewPermitted && tripInstance.routeType === TRAIN_TYPE_ID && isBeforeTomorrow) { // Only supports trains at the moment
            buttonBarConfig.push({
                label: 'View in Blocks',
                action: () => this.props.goToBlocksView(tripInstance),
            });
        }

        if (isMoveTripToNextStopPermitted && isMoveTripToNextStopPossible && isBeforeTomorrow) {
            buttonBarConfig.push({
                label: 'Move to next stop',
                action: () => this.setState({ isMoveToNextStopModalOpen: true }),
            });
        }

        if (isCancelPermitted && this.props.useHoldTrip && isOnHoldPossible) {
            buttonBarConfig.push({
                label: tripInstance.onHold ? 'Release trip' : 'Hold trip',
                action: () => {
                    this.setState({ isTripHoldModalOpen: true });
                    this.props.setTripStatusModalOrigin(updateTripsStatusModalOrigins.TRIP_VIEW);
                },
            });
        }

        return buttonBarConfig;
    };

    render() {
        const { tripInstance, actionResults, actionLoadingStatesByTripId, tripStatusModalOrigin } = this.props;
        const { bulkStopStatusUpdate } = MESSAGE_ACTION_TYPES;
        const { tripId } = tripInstance;
        const tripInstanceId = getTripInstanceId(tripInstance);
        const buttonBarConfig = this.getButtonBarConfig(tripInstance);
        const tripActionResults = filter(actionResults, item => item.tripId === tripInstanceId);
        const isTripActionLoading = actionLoadingStatesByTripId[tripInstanceId] || false;
        const isBulkStopSelectionMessage = some(tripActionResults, { actionType: bulkStopStatusUpdate });

        return (
            <div className="trip-view">
                { buttonBarConfig.length !== 0 && <ButtonBar buttons={ buttonBarConfig } isLoading={ isTripActionLoading } /> }

                { isBulkStopSelectionMessage && <StopSelectionMessages tripInstance={ tripInstance } /> }

                {
                    !isBulkStopSelectionMessage && tripStatusModalOrigin !== updateTripsStatusModalOrigins.FOOTER && tripActionResults.map(message => (
                        <Message
                            key={ message.id }
                            message={ message }
                            onClose={ () => this.props.clearTripInstanceActionResult(message.id) } />
                    ))
                }

                <TripDetails data={ this.getTripDetailsData(tripInstance) } />

                <Stops tripInstance={ tripInstance } />

                <UpdateTripStatusModal
                    className="update-trip-status-modal"
                    operateTrips={ { [tripInstanceId]: tripInstance } }
                    activeModal={ this.state.tripStatusModalType }
                    isModalOpen={ this.state.isSetTripStatusModalOpen }
                    onClose={ () => {
                        this.setState({ isSetTripStatusModalOpen: false });
                    } } />

                <UpdateTripHoldModal
                    isModalOpen={ this.state.isTripHoldModalOpen }
                    trip={ tripInstance }
                    onClose={ () => { this.setState({ isTripHoldModalOpen: false }); } }
                    action={ tripInstance.onHold ? TRIP_HOLD_STATUS.RELEASE : TRIP_HOLD_STATUS.HOLD }
                />

                <SetTripDelayModal
                    tripInstance={ tripInstance }
                    isOpen={ this.state.isSetTripDelayModalOpen }
                    onClose={ () => this.setState({ isSetTripDelayModalOpen: false }) }
                    onAction={ (delay) => {
                        const options = {
                            tripId: tripInstance.tripId,
                            serviceDate: tripInstance.serviceDate,
                            startTime: tripInstance.startTime,
                            delay: toNumber(delay),
                        };
                        this.props.updateTripInstanceDelay(options, `Delay for trip ${tripId} has been updated`);
                        this.setState({ isSetTripDelayModalOpen: false });
                    } }
                />

                <ConfirmationModal
                    title="Remove trip delay"
                    message={ `Are you sure you wish to remove the delay from trip ${tripId}?` }
                    isOpen={ this.state.isRemoveTripDelayModalOpen }
                    onClose={ () => this.setState({ isRemoveTripDelayModalOpen: false }) }
                    onAction={ () => {
                        const options = {
                            tripId: tripInstance.tripId,
                            serviceDate: tripInstance.serviceDate,
                            startTime: tripInstance.startTime,
                            delay: 0,
                        };
                        this.props.updateTripInstanceDelay(options, `Delay for trip ${tripId} has been removed`);
                        this.setState({ isRemoveTripDelayModalOpen: false });
                    } }
                />

                <CopyTripModal
                    tripInstance={ tripInstance }
                    isOpen={ this.state.isCopyTripModalOpen }
                    onClose={ () => this.setState({ isCopyTripModalOpen: false }) }
                    onAction={ (startTime, referenceId) => {
                        const options = {
                            tripId: tripInstance.tripId,
                            serviceDate: tripInstance.serviceDate,
                            startTime: tripInstance.startTime,
                            newStartTime: startTime,
                            referenceId,
                        };
                        this.props.copyTrip(options, `Trip ${tripId} has been duplicated`);
                        this.setState({ isCopyTripModalOpen: false });
                    } }
                />

                <ConfirmationModal
                    title="Move to next stop"
                    message={ `Are you sure you wish to move trip '${tripId}' to the next stop?` }
                    isOpen={ this.state.isMoveToNextStopModalOpen }
                    onClose={ () => this.setState({ isMoveToNextStopModalOpen: false }) }
                    onAction={ () => {
                        const options = {
                            tripId: tripInstance.tripId,
                            serviceDate: tripInstance.serviceDate,
                            startTime: tripInstance.startTime,
                        };
                        this.props.moveTripToNextStop(options, `Trip ${tripId} has been moved to next stop`);
                        this.setState({ isMoveToNextStopModalOpen: false });
                    } }
                />
            </div>
        );
    }
}

export default connect(state => ({
    actionResults: getTripInstancesActionResults(state),
    agencies: getAgencies(state),
    actionLoadingStatesByTripId: getTripInstancesActionLoading(state),
    serviceDate: getServiceDate(state),
    isControlBlockViewPermitted: getControlBlockViewPermission(state),
    vehicleAllocations: getAllocations(state),
    tripStatusModalOrigin: getTripStatusModalOriginState(state),
    useHideTrip: useHideTrip(state),
    useHoldTrip: useHoldTrip(state),
}), { clearTripInstanceActionResult, updateTripInstanceDelay, goToBlocksView, copyTrip, moveTripToNextStop, setTripStatusModalOrigin, removeBulkUpdateMessages })(TripView);
