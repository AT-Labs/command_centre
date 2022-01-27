import _ from 'lodash-es';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { updateTripsStatusModalTypes } from '../../Types';
import UpdateStatusModalsBtn from '../UpdateStatusModalsBtn';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import TRIP_STATUS_TYPES from '../../../../../types/trip-status-types';
import UpdateTripStatusModalContent from './UpdateTripStatusModalContent';
import { ERROR_MESSAGE_TYPE, CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES } from '../../../../../types/message-types';
import { fetchAndUpdateSelectedTrips, collectTripsDataAndUpdateTripsStatus, removeBulkUpdateMessages } from '../../../../../redux/actions/control/routes/trip-instances';
import {
    getSelectedTripInstances,
    getTripInstancesActionResults,
    getTripInstancesActionLoading,
    getBulkUpdateMessagesByType,
} from '../../../../../redux/selectors/control/routes/trip-instances';
import './styles.scss';

const UpdateTripStatusModal = (props) => {
    const [hasModalBeenInit, setHasModalBeenInit] = useState(false);
    const [shouldErrorAlertBeShown, setShouldErrorAlertBeShown] = useState(false);

    const { cancelled, notStarted } = TRIP_STATUS_TYPES;
    const { CANCEL_MODAL, REINSTATE_MODAL } = updateTripsStatusModalTypes;
    const {
        className,
        activeModal,
        isModalOpen,
        selectedTrips,
        bulkUpdateErrorMessages,
        actionLoadingStatesByTripId,
        bulkUpdateConfirmationMessages,
    } = props;

    const areTripsUpdating = _.some(actionLoadingStatesByTripId, Boolean);

    const modalProps = {
        cancel: {
            className: 'cancel-modal',
            title: 'Cancel multiple trips',
            errorMessage: 'trip(s) fail to be updated',
            successMessage: 'Successfully cancelled trip(s)',
            confirmationMessage: 'Are you sure you want to cancel the following trips?',
            label: <UpdateStatusModalsBtn label="Cancel trips" isLoading={ areTripsUpdating } />,
        },
        reinstate: {
            className: 'reinstate-modal',
            title: 'Reinstate multiple trips',
            errorMessage: 'trip(s) fail to be updated',
            successMessage: 'Successfully reinstated trip(s)',
            confirmationMessage: 'Are you sure you want to reinstate the following trips?',
            label: <UpdateStatusModalsBtn label="Reinstate trips" isLoading={ areTripsUpdating } />,
        },
    };

    const activeModalProps = modalProps[activeModal || CANCEL_MODAL];

    const onModalInit = () => {
        props.fetchAndUpdateSelectedTrips();
        setHasModalBeenInit(true);
    };

    const modalOnClose = () => {
        setHasModalBeenInit(false);
        props.removeBulkUpdateMessages(ERROR_MESSAGE_TYPE);
        props.onClose(CANCEL_MODAL);
    };

    useEffect(() => { // eslint-disable-line
        if (!hasModalBeenInit) onModalInit();

        if (isModalOpen) {
            if (bulkUpdateErrorMessages.length) setShouldErrorAlertBeShown(true);
            else setShouldErrorAlertBeShown(false);

            if (bulkUpdateConfirmationMessages.length && !bulkUpdateErrorMessages.length) modalOnClose();
        }
    });

    const filterSelectedTripsByModalType = status => ((activeModal === CANCEL_MODAL && status !== cancelled) || (activeModal === REINSTATE_MODAL && status === cancelled));

    const selectedTripsByModalType = _.pickBy(selectedTrips, trip => filterSelectedTripsByModalType(trip.status));

    const updateTripsStatus = () => {
        const tripStatus = activeModal === CANCEL_MODAL ? cancelled : notStarted;
        props.collectTripsDataAndUpdateTripsStatus(
            selectedTripsByModalType,
            tripStatus,
            modalProps[activeModal].successMessage,
            modalProps[activeModal].errorMessage,
        );
    };

    return (
        <CustomModal
            className={ className }
            onClose={ modalOnClose }
            isModalOpen={ isModalOpen }
            title={ activeModalProps.title }
            okButton={ {
                onClick: updateTripsStatus,
                isDisabled: areTripsUpdating,
                label: activeModalProps.label,
                className: `${className}__ok-button`,
            } }>
            <UpdateTripStatusModalContent
                className={ className }
                selectedTrips={ selectedTripsByModalType }
                shouldErrorAlertBeShown={ shouldErrorAlertBeShown }
                confirmationMessage={ activeModalProps.confirmationMessage }
                errorMessage={ `${bulkUpdateErrorMessages.length} ${activeModalProps.errorMessage}` } />
        </CustomModal>
    );
};

UpdateTripStatusModal.propTypes = {
    className: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    isModalOpen: PropTypes.bool.isRequired,
    activeModal: PropTypes.string.isRequired,
    bulkUpdateErrorMessages: PropTypes.array,
    selectedTrips: PropTypes.object.isRequired,
    bulkUpdateConfirmationMessages: PropTypes.array,
    removeBulkUpdateMessages: PropTypes.func.isRequired,
    fetchAndUpdateSelectedTrips: PropTypes.func.isRequired,
    actionLoadingStatesByTripId: PropTypes.object.isRequired,
    collectTripsDataAndUpdateTripsStatus: PropTypes.func.isRequired,
};

UpdateTripStatusModal.defaultProps = {
    className: '',
    bulkUpdateErrorMessages: [],
    bulkUpdateConfirmationMessages: [],
};

export default connect(
    (state) => {
        const selectedTrips = getSelectedTripInstances(state);
        const actionResults = getTripInstancesActionResults(state);
        const actionLoadingStatesByTripId = getTripInstancesActionLoading(state);

        return {
            selectedTrips,
            actionLoadingStatesByTripId,
            bulkUpdateErrorMessages: getBulkUpdateMessagesByType(
                actionResults,
                selectedTrips,
                ERROR_MESSAGE_TYPE,
                MESSAGE_ACTION_TYPES.bulkStatusUpdate,
            ),
            bulkUpdateConfirmationMessages: getBulkUpdateMessagesByType(
                actionResults,
                selectedTrips,
                CONFIRMATION_MESSAGE_TYPE,
                MESSAGE_ACTION_TYPES.bulkStatusUpdate,
            ),
        };
    },
    { fetchAndUpdateSelectedTrips, collectTripsDataAndUpdateTripsStatus, removeBulkUpdateMessages },
)(UpdateTripStatusModal);
