import { isEmpty, findKey, capitalize, pickBy, size } from 'lodash-es';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { FormGroup, FormText, Input, Table } from 'reactstrap';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { FaExclamationTriangle } from 'react-icons/fa';

import UpdateStatusModalsBtn from './UpdateStatusModalsBtn';
import { StopStatus, updateStopsModalTypes } from '../Types';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import ConfirmationModalBody from '../../Common/ConfirmationModal/ConfirmationModalBody';
import { updateSelectedStopsStatus, moveTripToStop, updateDestination } from '../../../../redux/actions/control/routes/trip-instances';
import { getSelectedStopsByTripKey, getSelectedStopsUpdatingState } from '../../../../redux/selectors/control/routes/trip-instances';
import { TRAIN_TYPE_ID } from '../../../../types/vehicle-types';
import { getRailHeadsignsStops } from '../../../../utils/transmitters/cc-static';
import RadioButtons from '../../../Common/RadioButtons/RadioButtons';

const { SKIP, REINSTATE, MOVE_SERVICE, UPDATE_HEADSIGN, SET_NON_STOPPING, SET_FIRST_STOP, SET_LAST_STOP, HIDE_SKIPPED_STOP } = updateStopsModalTypes;

const modalPropsMapping = (data) => {
    const { firstSelectedStop, tripInstance, isUpdatingOnGoing, skipped, notPassed, nonStopping } = data;
    return {
        [SKIP]: {
            stopStatus: skipped,
            className: `${SKIP}-modal`,
            title: `${capitalize(SKIP)} stop(s)`,
            errorMessage: 'stop(s) could not be skipped:',
            successMessage: 'stop(s) successfully skipped',
            confirmationMessage: 'Are you sure you want to skip the selected stops?',
            label: <UpdateStatusModalsBtn label="Skip stop(s)" isLoading={ isUpdatingOnGoing } />,
        },
        [REINSTATE]: {
            stopStatus: notPassed,
            className: `${REINSTATE}-modal`,
            title: `${capitalize(REINSTATE)} stop(s)`,
            errorMessage: 'stop(s) could not be reinstated',
            successMessage: 'stop(s) successfully reinstated',
            confirmationMessage: 'Are you sure you want to reinstate the selected stops?',
            label: <UpdateStatusModalsBtn label="Reinstate stop(s)" isLoading={ isUpdatingOnGoing } />,
        },
        [MOVE_SERVICE]: {
            className: `${MOVE_SERVICE}-modal`,
            title: 'Move current service location',
            label: <UpdateStatusModalsBtn label="Move stop" isLoading={ isUpdatingOnGoing } />,
            successMessage: selectedStop => `Trip ${tripInstance.tripId} has been moved to ${selectedStop.stopName}`,
            confirmationMessage: selectedStop => `Are you sure you wish to move trip '${tripInstance.tripId}' to ${selectedStop.stopName}?`,
        },
        [UPDATE_HEADSIGN]: {
            className: `${UPDATE_HEADSIGN}-modal`,
            title: 'Update destination',
            label: <UpdateStatusModalsBtn label="Update destination" isLoading={ isUpdatingOnGoing } />,
            successMessage: 'Destination updated for the selected stops.',
        },
        [SET_NON_STOPPING]: {
            stopStatus: nonStopping,
            className: `${SET_NON_STOPPING}-modal`,
            title: 'Set non-stopping stop(s)',
            errorMessage: 'stop(s) could not be set to non-stopping',
            successMessage: 'stop(s) successfully set to non-stopping',
            confirmationMessage: 'Are you sure you want to set the selected stops as non-stopping?',
            label: <UpdateStatusModalsBtn label="Set stop(s) as non-stopping" isLoading={ isUpdatingOnGoing } />,
        },
        [SET_FIRST_STOP]: {
            className: `${SET_FIRST_STOP}-modal`,
            title: 'Set first stop',
            confirmationMessage: `Are you sure you want to set stop ${firstSelectedStop.stopCode} as the first stop of this trip?`,
            label: <UpdateStatusModalsBtn label="Set first stop" isLoading={ isUpdatingOnGoing } />,
        },
        [SET_LAST_STOP]: {
            className: `${SET_LAST_STOP}-modal`,
            title: 'Set last stop',
            confirmationMessage: `Are you sure you want to set stop ${firstSelectedStop.stopCode} as the last stop of this trip?`,
            label: <UpdateStatusModalsBtn label="Set last stop" isLoading={ isUpdatingOnGoing } />,
        },
        [HIDE_SKIPPED_STOP]: {
            className: `${HIDE_SKIPPED_STOP}-modal`,
            title: 'Hide skipped stop(s)',
            errorMessage: 'skipped stop(s) could not be hidden',
            successMessage: 'skipped stop(s) successfully hidden',
            confirmationMessage: 'Are you sure you want to hide the selected skipped stops?',
            label: <UpdateStatusModalsBtn label="Hide skipped stop(s)" isLoading={ isUpdatingOnGoing } />,
        },
    };
};

const handleMoveService = (tripInstance, firstSelectedStop, modalProps, activeModal, handlers) => {
    const options = {
        tripId: tripInstance.tripId,
        serviceDate: tripInstance.serviceDate,
        startTime: tripInstance.startTime,
        stopSequence: firstSelectedStop.stopSequence,
    };

    handlers.moveTripToStopHandler(options, modalProps[activeModal].successMessage(firstSelectedStop), tripInstance);
};

const handleUpdateHeadsign = (tripInstance, selectedStops, newDestination, selectedPidCustomization, modalProps, activeModal, handlers) => {
    const options = {
        tripId: tripInstance.tripId,
        serviceDate: tripInstance.serviceDate,
        startTime: tripInstance.startTime,
        stopCodes: Object.values(selectedStops).map(stop => stop.stopCode),
        headsign: selectedPidCustomization !== 'None' ? newDestination + selectedPidCustomization : newDestination,
    };
    if (handlers.onStopUpdatedHandler) {
        handlers.onStopUpdatedHandler({ ...options, action: UPDATE_HEADSIGN });
    } else {
        handlers.updateDestinationHandler(options, modalProps[activeModal].successMessage, tripInstance);
    }
};

const handleSetFirstStop = (tripInstance, firstSelectedStop, handlers, activeModal) => {
    if (handlers.onStopUpdatedHandler) {
        const options = {
            tripId: tripInstance.tripId,
            serviceDate: tripInstance.serviceDate,
            startTime: firstSelectedStop.departureTime,
            stopCodes: Object.values(tripInstance.stops).map(stop => stop.stopCode),
            firstStop: firstSelectedStop,
        };
        handlers.onStopUpdatedHandler({ ...options, action: activeModal });
    }
};

const handleSetLastStop = (tripInstance, firstSelectedStop, handlers, activeModal) => {
    if (handlers.onStopUpdatedHandler) {
        const options = {
            tripId: tripInstance.tripId,
            serviceDate: tripInstance.serviceDate,
            endTime: firstSelectedStop.arrivalTime,
            stopCodes: Object.values(tripInstance.stops).map(stop => stop.stopCode),
            lastStop: firstSelectedStop,
        };
        handlers.onStopUpdatedHandler({ ...options, action: activeModal });
    }
};

const getSkippedOnly = selectedStops => Object.values(selectedStops).filter(
    item => item.status === StopStatus.skipped && item.display === true,
);

const handleUpdateStopVisibilityToFalse = (tripInstance, selectedStops, modalProps, handlers, activeModal) => {
    const skippedOnly = getSkippedOnly(selectedStops);
    handlers?.updateSelectedStopsStatusHandler(
        tripInstance,
        skippedOnly,
        StopStatus.skipped,
        false,
        `${size(skippedOnly)} ${modalProps[activeModal].successMessage}`,
        `${size(skippedOnly)} ${modalProps[activeModal].errorMessage}`,
    );
};

const handleDefaultCase = (tripInstance, selectedStops, modalProps, activeModal, skipped, nonStopping, handlers) => {
    const filterSelectedStopsByModalType = status => ((activeModal === SKIP && status !== skipped)
    || (activeModal === REINSTATE && (status === skipped || status === nonStopping)) || (activeModal === SET_NON_STOPPING && status !== nonStopping));
    const selectedStopsByModalType = pickBy(selectedStops, stop => filterSelectedStopsByModalType(stop.status));

    if (handlers.onStopUpdatedHandler) {
        const options = {
            tripId: tripInstance.tripId,
            serviceDate: tripInstance.serviceDate,
            startTime: tripInstance.startTime,
            stopCodes: Object.values(selectedStopsByModalType).map(stop => stop.stopCode),
            status: modalProps[activeModal].stopStatus,
        };
        handlers.onStopUpdatedHandler({ ...options, action: activeModal });
    } else {
        handlers.updateSelectedStopsStatusHandler(
            tripInstance,
            selectedStopsByModalType,
            modalProps[activeModal].stopStatus,
            true,
            `${size(selectedStopsByModalType)} ${modalProps[activeModal].successMessage}`,
            `${size(selectedStopsByModalType)} ${modalProps[activeModal].errorMessage}`,
        );
    }
};

const onClickHandler = (
    setHasUpdateBeenTriggered,
    activeModal,
    tripData,
    modalProps,
    handlers,
) => {
    setHasUpdateBeenTriggered(true);
    const { tripInstance, selectedStops, firstSelectedStop, selectedPidCustomization, newDestination, skipped, nonStopping } = tripData;

    switch (activeModal) {
    case MOVE_SERVICE:
        handleMoveService(tripInstance, firstSelectedStop, modalProps, activeModal, handlers);
        break;
    case UPDATE_HEADSIGN:
        handleUpdateHeadsign(tripInstance, selectedStops, newDestination, selectedPidCustomization, modalProps, activeModal, handlers);
        break;
    case SET_FIRST_STOP:
        handleSetFirstStop(tripInstance, firstSelectedStop, handlers, activeModal);
        break;
    case SET_LAST_STOP:
        handleSetLastStop(tripInstance, firstSelectedStop, handlers, activeModal);
        break;
    case HIDE_SKIPPED_STOP:
        handleUpdateStopVisibilityToFalse(tripInstance, selectedStops, modalProps, handlers, activeModal);
        break;
    default:
        handleDefaultCase(tripInstance, selectedStops, modalProps, activeModal, skipped, nonStopping, handlers);
    }
};

export const UpdateStopStatusModal = (props) => {
    const { skipped, notPassed, nonStopping } = StopStatus;
    const { isModalOpen, activeModal, tripInstance, areSelectedStopsUpdating } = props;
    const [hasUpdateBeenTriggered, setHasUpdateBeenTriggered] = useState(false);
    const [newDestination, setNewDestination] = useState('');
    const isUpdatingOnGoing = hasUpdateBeenTriggered && areSelectedStopsUpdating;
    const hasUpdatingFinished = hasUpdateBeenTriggered && !areSelectedStopsUpdating;
    const selectedStops = props.selectedStopsByTripKey(tripInstance);
    const firstSelectedStop = !isEmpty(selectedStops) && selectedStops[findKey(selectedStops)];
    const [railHeadsigns, setRailHeadsigns] = useState([]);
    const [selectedPidCustomization, setSelectedPidCustomization] = useState('None');

    useEffect(async () => {
        const railHeadsignsStops = await getRailHeadsignsStops();
        setRailHeadsigns(railHeadsignsStops.map(({ headsign }) => headsign));
    }, []);

    const modalProps = modalPropsMapping({ firstSelectedStop, tripInstance, isUpdatingOnGoing, skipped, notPassed, nonStopping, selectedStops });

    const pidCustomizationOptions = [
        { key: '/N', value: '/N' },
        { key: '/PAN', value: '/PAN' },
        { key: '/LS', value: '/LS' },
        { key: 'None', value: 'None' },
    ];

    const handlePidCustomizationChange = (pidCustomization) => {
        setSelectedPidCustomization(pidCustomization);
    };

    const handleRailDestinationChange = (event) => {
        setNewDestination(event.target.textContent);
    };

    const onClose = () => {
        props.onClose();
        setHasUpdateBeenTriggered(false);
    };

    useEffect(() => { if (hasUpdatingFinished) onClose(); });

    const onClick = () => onClickHandler(
        setHasUpdateBeenTriggered,
        activeModal,
        {
            tripInstance,
            selectedStops,
            firstSelectedStop,
            selectedPidCustomization,
            newDestination,
            skipped,
            nonStopping,
        },
        modalProps,
        {
            moveTripToStopHandler: props.moveTripToStop,
            onStopUpdatedHandler: props.onStopUpdated,
            updateDestinationHandler: props.updateDestination,
            updateSelectedStopsStatusHandler: props.updateSelectedStopsStatus,
        },
    );

    const getModalBody = () => {
        if (activeModal === UPDATE_HEADSIGN) {
            return (
                <>
                    <p className="font-weight-light text-center mb-4">
                        Updating the destination for the selected stop(s) will change the destination on PIDs,
                        Live Departures on AT Mobile & Website and Train Station PA Announcements.
                    </p>
                    <div className="col-12">
                        <FormGroup>
                            { tripInstance.routeType === TRAIN_TYPE_ID && (
                                <>
                                    <FormText className="mb-3">
                                        Select new destination (rail only)
                                    </FormText>
                                    <Autocomplete
                                        id="updateStopStatusModal-headsign__new-headsign"
                                        options={ railHeadsigns }
                                        onChange={ handleRailDestinationChange }
                                        renderInput={ params => <TextField { ...params } label="Enter the new destination" /> }
                                    />
                                    <FormText className="mt-3">
                                        Customise PID (optional for rail)
                                    </FormText>
                                    <RadioButtons
                                        title=""
                                        formGroupClass="update-stop-status-modal__pid-customization mt-3"
                                        checkedKey={ selectedPidCustomization }
                                        itemOptions={ pidCustomizationOptions }
                                        disabled={ false }
                                        onChange={ handlePidCustomizationChange }
                                    />
                                </>
                            )}
                            { tripInstance.routeType !== TRAIN_TYPE_ID && (
                                <>
                                    <Input
                                        id="updateStopStatusModal-headsign__new-headsign"
                                        className="w-100 border border-dark"
                                        placeholder="Enter the new destination"
                                        onChange={ event => setNewDestination(event.target.value) }
                                        value={ newDestination }
                                    />
                                    <FormText>
                                        {newDestination.length}
                                    </FormText>
                                </>
                            )}
                        </FormGroup>
                    </div>
                </>
            );
        }

        if (activeModal === HIDE_SKIPPED_STOP) {
            return (
                <div>
                    <div className="my-2 py-2 text-center">
                        <div className="text-warning w-100 m-2">
                            <FaExclamationTriangle size={ 40 } />
                        </div>
                        <div className="mb-2">
                            Hiding skipped stops will remove it from various channels such as PIDs, rail station announcements, ATM. (only applies for trips today)
                        </div>
                        <div>
                            Are you sure you want to hide the following skipped stops?
                        </div>
                    </div>
                    <Table className="table">
                        <thead>
                            <tr>
                                <th>Stop #</th>
                                <th>Schedule</th>
                                <th>Stop(s)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.values(getSkippedOnly(selectedStops)).map(stop => (
                                <tr key={ stop.stopId }>
                                    <td>{ stop.stopCode }</td>
                                    <td>{ stop.scheduledDepartureTime }</td>
                                    <td>{ stop.stopName }</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>
            );
        }

        return (
            <ConfirmationModalBody
                message={ activeModal === MOVE_SERVICE
                    ? modalProps[activeModal].confirmationMessage(firstSelectedStop)
                    : modalProps[activeModal].confirmationMessage }
            />
        );
    };

    return (
        <CustomModal
            onClose={ onClose }
            isModalOpen={ isModalOpen }
            className="stop-status-update-modal"
            title={ modalProps[activeModal].title }
            okButton={ {
                onClick,
                isDisabled: isUpdatingOnGoing || (activeModal === UPDATE_HEADSIGN && newDestination.trim().length === 0),
                label: modalProps[activeModal].label,
                className: 'top-status-update-modal__ok-btn',
            } }>
            {getModalBody()}
        </CustomModal>
    );
};

UpdateStopStatusModal.propTypes = {
    onClose: PropTypes.func.isRequired,
    isModalOpen: PropTypes.bool.isRequired,
    activeModal: PropTypes.string.isRequired,
    tripInstance: PropTypes.object.isRequired,
    moveTripToStop: PropTypes.func.isRequired,
    selectedStopsByTripKey: PropTypes.func.isRequired,
    areSelectedStopsUpdating: PropTypes.bool.isRequired,
    updateSelectedStopsStatus: PropTypes.func.isRequired,
    updateDestination: PropTypes.func.isRequired,
    onStopUpdated: PropTypes.func,
};

UpdateStopStatusModal.defaultProps = {
    onStopUpdated: undefined,
};

export default connect(state => ({
    areSelectedStopsUpdating: getSelectedStopsUpdatingState(state),
    selectedStopsByTripKey: tripInstance => getSelectedStopsByTripKey(state.control.routes.tripInstances.selectedStops, tripInstance),
}), { updateSelectedStopsStatus, moveTripToStop, updateDestination })(UpdateStopStatusModal);
