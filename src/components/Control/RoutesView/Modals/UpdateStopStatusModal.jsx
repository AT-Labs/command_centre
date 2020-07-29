import _ from 'lodash-es';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { useState, useEffect } from 'react';

import UpdateStatusModalsBtn from './UpdateStatusModalsBtn';
import { StopStatus, updateStopsModalTypes } from '../Types';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import ConfirmationModalBody from '../../Common/ConfirmationModal/ConfirmationModalBody';
import { updateSelectedStopsStatus, moveTripToStop } from '../../../../redux/actions/control/routes/trip-instances';
import { getSelectedStopsByTripKey, getSelectedStopsUpdatingState } from '../../../../redux/selectors/control/routes/trip-instances';

const UpdateStopStatusModal = (props) => {
    const { skipped, notPassed } = StopStatus;
    const { SKIP, REINSTATE, MOVE_SERVICE } = updateStopsModalTypes;
    const { isModalOpen, activeModal, tripInstance, areSelectedStopsUpdating } = props;
    const [hasUpdateBeenTriggered, setHasUpdateBeenTriggered] = useState(false);
    const isUpdatingOnGoing = hasUpdateBeenTriggered && areSelectedStopsUpdating;
    const hasUpdatingFinished = hasUpdateBeenTriggered && !areSelectedStopsUpdating;
    const selectedStops = props.selectedStopsByTripKey(tripInstance);
    const firstSelectedStop = !_.isEmpty(selectedStops) && selectedStops[_.findKey(selectedStops)];

    const modalProps = {
        [SKIP]: {
            stopStatus: skipped,
            className: `${SKIP}-modal`,
            title: `${_.capitalize(SKIP)} stop(s)`,
            errorMessage: 'stop(s) could not be skipped:',
            successMessage: 'stop(s) successfully skipped',
            confirmationMessage: 'Are you sure you want to skip the selected stops?',
            label: <UpdateStatusModalsBtn label="Skip stop(s)" isLoading={ isUpdatingOnGoing } />,
        },
        [REINSTATE]: {
            stopStatus: notPassed,
            className: `${REINSTATE}-modal`,
            title: `${_.capitalize(REINSTATE)} stop(s)`,
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
        } else {
            const filterSelectedStopsByModalType = status => ((activeModal === SKIP && status !== skipped) || (activeModal === REINSTATE && status === skipped));
            const selectedStopsByModalType = _.pickBy(selectedStops, stop => filterSelectedStopsByModalType(stop.status));

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

    return (
        <CustomModal
            onClose={ onClose }
            isModalOpen={ isModalOpen }
            className="stop-status-update-modal"
            title={ modalProps[activeModal].title }
            okButton={ {
                onClick,
                isDisabled: isUpdatingOnGoing,
                label: modalProps[activeModal].label,
                className: 'top-status-update-modal__ok-btn',
            } }>
            <ConfirmationModalBody
                message={ activeModal === MOVE_SERVICE
                    ? modalProps[activeModal].confirmationMessage(firstSelectedStop)
                    : modalProps[activeModal].confirmationMessage } />
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
};

export default connect(state => ({
    areSelectedStopsUpdating: getSelectedStopsUpdatingState(state),
    selectedStopsByTripKey: tripInstance => getSelectedStopsByTripKey(state.control.routes.tripInstances.selectedStops, tripInstance),
}), { updateSelectedStopsStatus, moveTripToStop })(UpdateStopStatusModal);
