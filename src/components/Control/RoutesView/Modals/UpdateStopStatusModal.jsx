import { isEmpty, findKey, capitalize, pickBy } from 'lodash-es';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { FormGroup, FormText, Input } from 'reactstrap';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

import UpdateStatusModalsBtn from './UpdateStatusModalsBtn';
import { StopStatus, updateStopsModalTypes } from '../Types';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import ConfirmationModalBody from '../../Common/ConfirmationModal/ConfirmationModalBody';
import { updateSelectedStopsStatus, moveTripToStop, updateDestination } from '../../../../redux/actions/control/routes/trip-instances';
import { getSelectedStopsByTripKey, getSelectedStopsUpdatingState } from '../../../../redux/selectors/control/routes/trip-instances';
import { TRAIN_TYPE_ID } from '../../../../types/vehicle-types';
import { getRailHeadsignsStops } from '../../../../utils/transmitters/cc-static';
import RadioButtons from '../../../Common/RadioButtons/RadioButtons';

export const UpdateStopStatusModal = (props) => {
    const { skipped, notPassed, nonStopping } = StopStatus;
    const { SKIP, REINSTATE, MOVE_SERVICE, UPDATE_HEADSIGN, SET_NON_STOPPING } = updateStopsModalTypes;
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

    const modalProps = {
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
    };

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

    const onClick = () => {
        setHasUpdateBeenTriggered(true);

        if (activeModal === MOVE_SERVICE) {
            const options = {
                tripId: tripInstance.tripId,
                serviceDate: tripInstance.serviceDate,
                startTime: tripInstance.startTime,
                stopSequence: firstSelectedStop.stopSequence,
            };

            props.moveTripToStop(options, modalProps[activeModal].successMessage(firstSelectedStop), tripInstance);
        } else if (activeModal === UPDATE_HEADSIGN) {
            const options = {
                tripId: tripInstance.tripId,
                serviceDate: tripInstance.serviceDate,
                startTime: tripInstance.startTime,
                stopCodes: Object.values(selectedStops).map(stop => stop.stopCode),
                headsign: selectedPidCustomization !== 'None' ? newDestination + selectedPidCustomization : newDestination,
            };
            if (props.onStopUpdated) {
                props.onStopUpdated({ ...options, action: UPDATE_HEADSIGN });
            } else {
                props.updateDestination(options, modalProps[activeModal].successMessage, tripInstance);
            }
        } else {
            const filterSelectedStopsByModalType = status => ((activeModal === SKIP && status !== skipped)
            || (activeModal === REINSTATE && status === skipped) || (activeModal === SET_NON_STOPPING && status !== nonStopping));
            const selectedStopsByModalType = pickBy(selectedStops, stop => filterSelectedStopsByModalType(stop.status));

            if (props.onStopUpdated) {
                const options = {
                    tripId: tripInstance.tripId,
                    serviceDate: tripInstance.serviceDate,
                    startTime: tripInstance.startTime,
                    stopCodes: Object.values(selectedStopsByModalType).map(stop => stop.stopCode),
                    status: modalProps[activeModal].stopStatus,
                };
                props.onStopUpdated({ ...options, action: activeModal });
            } else {
                props.updateSelectedStopsStatus(
                    tripInstance,
                    selectedStopsByModalType,
                    modalProps[activeModal].stopStatus,
                    modalProps[activeModal].successMessage,
                    modalProps[activeModal].errorMessage,
                );
            }
        }
    };

    useEffect(() => { if (hasUpdatingFinished) onClose(); });

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
