import _ from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';

import { updateTripsStatusModalTypes } from '../../Types';
import UpdateStatusModalsBtn from '../UpdateStatusModalsBtn';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import TRIP_STATUS_TYPES from '../../../../../types/trip-status-types';
import { getRecurringTextWithFrom } from '../../../../../utils/recurrence';
import UpdateTripStatusModalContent from './UpdateTripStatusModalContent';
import { ERROR_MESSAGE_TYPE, CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES } from '../../../../../types/message-types';
import { fetchAndUpdateSelectedTrips, collectTripsDataAndUpdateTripsStatus, removeBulkUpdateMessages } from '../../../../../redux/actions/control/routes/trip-instances';
import {
    getTripInstancesActionResults,
    getTripInstancesActionLoading,
    getBulkUpdateMessagesByType,
} from '../../../../../redux/selectors/control/routes/trip-instances';
import { DATE_FORMAT_DDMMYYYY } from '../../../../../utils/dateUtils';
import './styles.scss';

const UpdateTripStatusModal = (props) => {
    const [hasModalBeenInit, setHasModalBeenInit] = useState(false);
    const [shouldErrorAlertBeShown, setShouldErrorAlertBeShown] = useState(false);
    const [recurrenceSetting, setRecurrenceSetting] = useState({
        startDate: moment().format(DATE_FORMAT_DDMMYYYY),
        endDate: '',
        selectedWeekdays: [0, 1, 2, 3, 4, 5, 6],
    });

    const { cancelled, notStarted } = TRIP_STATUS_TYPES;
    const { CANCEL_MODAL, REINSTATE_MODAL } = updateTripsStatusModalTypes;
    const { className, activeModal, isModalOpen, selectedTrips, actionLoadingStatesByTripId, actionResults } = props;

    const bulkUpdateErrorMessages = getBulkUpdateMessagesByType(actionResults, selectedTrips, ERROR_MESSAGE_TYPE, MESSAGE_ACTION_TYPES.bulkStatusUpdate);
    const bulkUpdateConfirmationMessages = getBulkUpdateMessagesByType(actionResults, selectedTrips, CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES.bulkStatusUpdate);
    const areTripsUpdating = _.some(actionLoadingStatesByTripId, Boolean);
    const filterSelectedTripsByModalType = status => ((activeModal === CANCEL_MODAL && status !== cancelled) || (activeModal === REINSTATE_MODAL && status === cancelled));
    const selectedTripsByModalType = _.pickBy(selectedTrips, trip => filterSelectedTripsByModalType(trip.status));
    const modalPropsKey = `${activeModal || CANCEL_MODAL}${_.values(selectedTripsByModalType).length > 1 ? '' : 'Single'}`;

    const modalProps = {
        cancel: {
            className: 'cancel-modal',
            title: 'Cancel multiple trips',
            errorMessage: 'trips fail to be updated',
            successMessage: getRecurringTextWithFrom('successfully cancelled trips', recurrenceSetting),
            confirmationMessage: 'Are you sure you want to cancel the following trips?',
            mainButtonLabel: 'Cancel trips',
        },
        reinstate: {
            className: 'reinstate-modal',
            title: 'Reinstate multiple trips',
            errorMessage: 'trips fail to be updated',
            successMessage: 'Successfully reinstated trips',
            confirmationMessage: 'Are you sure you want to reinstate the following trips?',
            mainButtonLabel: 'Reinstate trips',
            recurringReinstateButtonLabel: 'Reinstate trips and remove recurring cancellations',
        },
        cancelSingle: {
            className: 'cancel-modal',
            title: 'Cancel trip',
            errorMessage: 'trip fail to be updated',
            successMessage: getRecurringTextWithFrom('successfully cancelled trip', recurrenceSetting),
            confirmationMessage: 'Are you sure you want to cancel the following trip?',
            mainButtonLabel: 'Cancel trip',
        },
        reinstateSingle: {
            className: 'reinstate-modal',
            title: 'Reinstate trip',
            errorMessage: 'trip fail to be updated',
            successMessage: 'successfully reinstated trip',
            confirmationMessage: 'Are you sure you want to reinstate the following trip?',
            mainButtonLabel: 'Reinstate trip',
            recurringReinstateButtonLabel: 'Reinstate trip and remove recurring cancellations',
        },
    };

    const activeModalProps = modalProps[modalPropsKey];

    const updateTripsStatus = (isRecurringOperation) => {
        const tripStatus = activeModal === CANCEL_MODAL ? cancelled : notStarted;
        props.collectTripsDataAndUpdateTripsStatus(
            selectedTripsByModalType,
            tripStatus,
            activeModalProps.successMessage,
            activeModalProps.errorMessage,
            {
                isRecurringOperation,
                ...recurrenceSetting,
            },
        );
    };

    const generateModalFooter = (activeModalType, mainButtonLabel, recurringReinstateButtonLabel) => (
        <>
            <Button
                className={ `${className}__ok-button cc-btn-primary w-100` }
                onClick={ () => updateTripsStatus(activeModalType === CANCEL_MODAL) }
                disabled={ areTripsUpdating }>
                <UpdateStatusModalsBtn label={ mainButtonLabel } isLoading={ areTripsUpdating } />
            </Button>
            {activeModalType === REINSTATE_MODAL && (
                <>
                    <span className="w-100 text-center">or</span>
                    <Button
                        className={ `${className}__extend-button cc-btn-primary w-100` }
                        onClick={ () => updateTripsStatus(true) }
                        disabled={ areTripsUpdating }>
                        <UpdateStatusModalsBtn label={ recurringReinstateButtonLabel } isLoading={ areTripsUpdating } />
                    </Button>
                </>
            )}
        </>
    );

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

    return (
        <CustomModal
            className={ className }
            onClose={ modalOnClose }
            isModalOpen={ isModalOpen }
            title={ activeModalProps.title }
            customFooter={ generateModalFooter(activeModal, activeModalProps.mainButtonLabel, activeModalProps.recurringReinstateButtonLabel) }>
            <UpdateTripStatusModalContent
                className={ className }
                selectedTrips={ selectedTripsByModalType }
                shouldErrorAlertBeShown={ shouldErrorAlertBeShown }
                confirmationMessage={ activeModalProps.confirmationMessage }
                errorMessage={ `${bulkUpdateErrorMessages.length} ${activeModalProps.errorMessage}` }
                recurringProps={ {
                    showRecurring: activeModal === CANCEL_MODAL,
                    onChange: setting => setRecurrenceSetting(prev => ({ ...prev, ...setting })),
                    setting: recurrenceSetting,
                } }
            />
        </CustomModal>
    );
};

UpdateTripStatusModal.propTypes = {
    className: PropTypes.string,
    onClose: PropTypes.func.isRequired,
    isModalOpen: PropTypes.bool.isRequired,
    activeModal: PropTypes.string.isRequired,
    selectedTrips: PropTypes.object.isRequired,
    actionResults: PropTypes.array,
    removeBulkUpdateMessages: PropTypes.func.isRequired,
    fetchAndUpdateSelectedTrips: PropTypes.func.isRequired,
    actionLoadingStatesByTripId: PropTypes.object.isRequired,
    collectTripsDataAndUpdateTripsStatus: PropTypes.func.isRequired,
};

UpdateTripStatusModal.defaultProps = {
    className: '',
    actionResults: [],
};

export default connect(
    state => ({
        actionLoadingStatesByTripId: getTripInstancesActionLoading(state),
        actionResults: getTripInstancesActionResults(state),
    }),
    { fetchAndUpdateSelectedTrips, collectTripsDataAndUpdateTripsStatus, removeBulkUpdateMessages },
)(UpdateTripStatusModal);
