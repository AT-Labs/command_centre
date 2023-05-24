import { isEmpty, findKey, capitalize, pickBy } from 'lodash-es';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { FormGroup, FormText, Input } from 'reactstrap';

import UpdateStatusModalsBtn from './UpdateStatusModalsBtn';
import { StopStatus, updateStopsModalTypes } from '../Types';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import ConfirmationModalBody from '../../Common/ConfirmationModal/ConfirmationModalBody';
import { updateSelectedStopsStatus, moveTripToStop, updateDestination } from '../../../../redux/actions/control/routes/trip-instances';
import { getSelectedStopsByTripKey, getSelectedStopsUpdatingState } from '../../../../redux/selectors/control/routes/trip-instances';
import { STOP_DESTINATION_MAX_LENGTH } from '../../../../constants/trips';

const UpdateStopStatusModal = (props) => {
    const { skipped, notPassed } = StopStatus;
    const { SKIP, REINSTATE, MOVE_SERVICE, UPDATE_HEADSIGN } = updateStopsModalTypes;
    const { isModalOpen, activeModal, tripInstance, areSelectedStopsUpdating } = props;
    const [hasUpdateBeenTriggered, setHasUpdateBeenTriggered] = useState(false);
    const [newDestination, setNewDestination] = useState('');
    const isUpdatingOnGoing = hasUpdateBeenTriggered && areSelectedStopsUpdating;
    const hasUpdatingFinished = hasUpdateBeenTriggered && !areSelectedStopsUpdating;
    const selectedStops = props.selectedStopsByTripKey(tripInstance);
    const firstSelectedStop = !isEmpty(selectedStops) && selectedStops[findKey(selectedStops)];

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
                headsign: newDestination,
            };
            props.updateDestination(options, modalProps[activeModal].successMessage, tripInstance);
        } else {
            const filterSelectedStopsByModalType = status => ((activeModal === SKIP && status !== skipped) || (activeModal === REINSTATE && status === skipped));
            const selectedStopsByModalType = pickBy(selectedStops, stop => filterSelectedStopsByModalType(stop.status));

            props.updateSelectedStopsStatus(
                tripInstance,
                selectedStopsByModalType,
                modalProps[activeModal].stopStatus,
                modalProps[activeModal].successMessage,
                modalProps[activeModal].errorMessage,
            );
        }
    };

    useEffect(() => { if (hasUpdatingFinished) onClose(); });

    const getModalBody = () => {
        if (activeModal === UPDATE_HEADSIGN) {
            return (
                <>
                    <p className="font-weight-light text-center mb-4">
                        Updating the destination for the selected stops will inform the destination on PIDs & PA announcements.
                    </p>
                    <div className="col-12">
                        <FormGroup>
                            <Input
                                id="updateStopStatusModal-headsign__new-headsign"
                                className="w-100 border border-dark"
                                placeholder="Enter the new destination"
                                maxLength={ STOP_DESTINATION_MAX_LENGTH }
                                onChange={ event => setNewDestination(event.target.value) }
                                value={ newDestination }
                            />
                            <FormText>
                                {newDestination.length}
                                /
                                {STOP_DESTINATION_MAX_LENGTH}
                            </FormText>
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
                isDisabled: isUpdatingOnGoing || (activeModal === UPDATE_HEADSIGN && newDestination.length === 0),
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
};

export default connect(state => ({
    areSelectedStopsUpdating: getSelectedStopsUpdatingState(state),
    selectedStopsByTripKey: tripInstance => getSelectedStopsByTripKey(state.control.routes.tripInstances.selectedStops, tripInstance),
}), { updateSelectedStopsStatus, moveTripToStop, updateDestination })(UpdateStopStatusModal);
