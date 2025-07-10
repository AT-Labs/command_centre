import { pickBy, values, some } from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { Button } from 'reactstrap';

import { updateTripsStatusModalTypes, updateTripsStatusModalOrigins } from '../../Types';
import UpdateStatusModalsBtn from '../UpdateStatusModalsBtn';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import TRIP_STATUS_TYPES from '../../../../../types/trip-status-types';
import { getRecurringTextWithFrom } from '../../../../../utils/recurrence';
import UpdateTripStatusModalContent from './UpdateTripStatusModalContent';
import { ERROR_MESSAGE_TYPE, CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES } from '../../../../../types/message-types';
import {
    fetchAndUpdateSelectedTrips,
    collectTripsDataAndUpdateTripsStatus,
    removeBulkUpdateMessages,
    bulkUpdateTripsDisplay,
} from '../../../../../redux/actions/control/routes/trip-instances';
import {
    getTripInstancesActionResults,
    getTripInstancesActionLoading,
    getBulkUpdateMessagesByType,
    getSelectedTripInstances,
    getTripStatusModalOriginState,
    isTripReccuringUpdateAllowed,
} from '../../../../../redux/selectors/control/routes/trip-instances';
import { getServiceDate } from '../../../../../redux/selectors/control/serviceDate';
import { DATE_FORMAT_DDMMYYYY } from '../../../../../utils/dateUtils';
import { useRecurringCancellations } from '../../../../../redux/selectors/appSettings';
import './styles.scss';

const UpdateTripStatusModal = (props) => {
    const defaultRecurrenceSetting = {
        startDate: moment(props.serviceDate).format(DATE_FORMAT_DDMMYYYY),
        endDate: moment(props.serviceDate).format(DATE_FORMAT_DDMMYYYY),
        selectedWeekdays: [moment(props.serviceDate).isoWeekday() - 1],
        display: true,
    };

    const [hasModalBeenInit, setHasModalBeenInit] = useState(false);
    const [shouldErrorAlertBeShown, setShouldErrorAlertBeShown] = useState(false);
    const [recurrenceSetting, setRecurrenceSetting] = useState(defaultRecurrenceSetting);

    const { cancelled, notStarted } = TRIP_STATUS_TYPES;
    const { CANCEL_MODAL, REINSTATE_MODAL, HIDE_TRIP_MODAL } = updateTripsStatusModalTypes;
    const { className, activeModal, isModalOpen, operateTrips, selectedTrips, actionLoadingStatesByTripId, actionResults, origin } = props;
    const hasSelectedTrips = values(selectedTrips).length > 0;

    const bulkUpdateErrorMessages = getBulkUpdateMessagesByType(actionResults, operateTrips, ERROR_MESSAGE_TYPE, MESSAGE_ACTION_TYPES.bulkStatusUpdate);
    const bulkUpdateConfirmationMessages = getBulkUpdateMessagesByType(actionResults, operateTrips, CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES.bulkStatusUpdate);
    const areTripsUpdating = some(actionLoadingStatesByTripId, Boolean);

    const tripFiltersByModalType = {
        [CANCEL_MODAL]: trip => trip.status !== TRIP_STATUS_TYPES.cancelled,
        [REINSTATE_MODAL]: trip => trip.status === TRIP_STATUS_TYPES.cancelled,
        [HIDE_TRIP_MODAL]: trip => trip.status === TRIP_STATUS_TYPES.cancelled && !!trip.display && (moment(trip.serviceDate).isSame(moment(), 'day')),
    };

    const operateTripsByModalType = pickBy(operateTrips, trip => tripFiltersByModalType[activeModal](trip));
    const modalPropsKey = `${activeModal || CANCEL_MODAL}${values(operateTripsByModalType).length > 1 ? '' : 'Single'}`;

    const modalProps = {
        [CANCEL_MODAL]: {
            className: 'cancel-modal',
            title: 'Cancel multiple trips',
            errorMessage: 'trips fail to be updated',
            successMessage: getRecurringTextWithFrom('successfully cancelled trips', recurrenceSetting),
            confirmationMessage: 'Are you sure you want to cancel the following trips?',
            mainButtonLabel: 'Cancel trips',
        },
        [REINSTATE_MODAL]: {
            className: 'reinstate-modal',
            title: 'Reinstate multiple trips',
            errorMessage: 'trips fail to be updated',
            successMessage: 'successfully reinstated trips',
            confirmationMessage: 'Are you sure you want to reinstate the following trips?',
            mainButtonLabel: 'Reinstate trips',
            recurringReinstateButtonLabel: 'Reinstate trips and remove recurring cancellations',
        },
        [`${CANCEL_MODAL}Single`]: {
            className: 'cancel-modal',
            title: 'Cancel trip',
            errorMessage: 'trip fail to be updated',
            successMessage: getRecurringTextWithFrom(`${origin === updateTripsStatusModalOrigins.FOOTER ? 'successfully' : 'Successfully'} cancelled trip`, recurrenceSetting),
            confirmationMessage: 'Are you sure you want to cancel the following trip?',
            mainButtonLabel: 'Cancel trip',
        },
        [`${REINSTATE_MODAL}Single`]: {
            className: 'reinstate-modal',
            title: 'Reinstate trip',
            errorMessage: 'trip fail to be updated',
            successMessage: `${origin === updateTripsStatusModalOrigins.FOOTER ? 'successfully' : 'Successfully'} reinstated trip`,
            confirmationMessage: ['Are you sure you want to reinstate the following trip? ', <br key="" />,
                `Future trips scheduled to be cancelled on a recurring basis will continue to be cancelled. 
                To reinstate all related trips, please select the option ‘Reinstate 
                and remove recurring cancellations’ or edit the recurrence pattern`,
            ],
            mainButtonLabel: 'Reinstate trip',
            recurringReinstateButtonLabel: 'Reinstate trip and remove recurring cancellations',
        },
        [HIDE_TRIP_MODAL]: {
            className: 'hide-trip-modal',
            title: 'Hide Cancelled Trips',
            errorMessage: 'trips fail to be updated',
            successMessage: 'successfully hid cancelled trips',
            confirmationMessage: [
                'Hiding a cancelled trip will remove it from various channels such as PIDs, rail station announcements, ATM. (only applies for trips today)',
                <br key="" />,
                'Are you sure you want to hide the following cancelled trips?',
            ],
            mainButtonLabel: 'Hide cancellations',
        },
        [`${HIDE_TRIP_MODAL}Single`]: {
            className: 'hide-trip-modal',
            title: 'Hide Cancelled Trip',
            errorMessage: 'trip fail to be updated',
            successMessage: `${origin === updateTripsStatusModalOrigins.FOOTER ? 'successfully' : 'Successfully'} hid cancelled trip`,
            confirmationMessage: [
                'Hiding a cancelled trip will remove it from various channels such as PIDs, rail station announcements, ATM. (only applies for trips today)',
                <br key="" />,
                'Are you sure you want to hide the following cancelled trip?',
            ],
            mainButtonLabel: 'Hide cancellation',
        },
    };

    const activeModalProps = modalProps[modalPropsKey];

    const updateTripsStatus = (isRecurringOperation) => {
        const tripStatus = activeModal === CANCEL_MODAL ? cancelled : notStarted;
        props.collectTripsDataAndUpdateTripsStatus(
            operateTripsByModalType,
            tripStatus,
            activeModalProps.successMessage,
            activeModalProps.errorMessage,
            {
                isRecurringOperation,
                ...recurrenceSetting,
            },
            selectedTrips,
        );
    };

    const isRecurrenceSettingValid = recurrenceSetting.startDate && recurrenceSetting.selectedWeekdays.length;
    const canEditRecurringField = isTripReccuringUpdateAllowed(operateTripsByModalType[Object.keys(operateTripsByModalType)[0]]);

    const handleMainButtonClick = () => {
        if (activeModal === HIDE_TRIP_MODAL) {
            props.bulkUpdateTripsDisplay(operateTripsByModalType, activeModalProps.successMessage, activeModalProps.errorMessage, selectedTrips);
        } else {
            updateTripsStatus(props.useRecurringCancellations && activeModal === CANCEL_MODAL && canEditRecurringField);
        }
        setRecurrenceSetting(defaultRecurrenceSetting);
    };

    const generateModalFooter = (activeModalType, mainButtonLabel, recurringReinstateButtonLabel) => (
        <>
            <Button
                className={ `${className}__ok-button cc-btn-primary w-100` }
                onClick={ handleMainButtonClick }
                disabled={ areTripsUpdating || !isRecurrenceSettingValid }>
                <UpdateStatusModalsBtn label={ mainButtonLabel } isLoading={ areTripsUpdating } />
            </Button>
            { props.useRecurringCancellations && activeModalType === REINSTATE_MODAL && (
                <>
                    <span className="w-100 text-center">or</span>
                    <Button
                        className={ `${className}__extend-button cc-btn-primary w-100` }
                        onClick={ () => updateTripsStatus(true) }
                        disabled={ areTripsUpdating || !canEditRecurringField }>
                        <UpdateStatusModalsBtn label={ recurringReinstateButtonLabel } isLoading={ areTripsUpdating } />
                    </Button>
                </>
            )}
        </>
    );

    const onModalInit = () => {
        props.fetchAndUpdateSelectedTrips(selectedTrips);
        setHasModalBeenInit(true);
    };

    const modalOnClose = () => {
        setHasModalBeenInit(false);
        props.removeBulkUpdateMessages(ERROR_MESSAGE_TYPE);
        props.onClose(CANCEL_MODAL);
    };

    useEffect(() => { // eslint-disable-line
        if (!hasModalBeenInit && hasSelectedTrips) onModalInit();

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
                selectedTrips={ operateTripsByModalType }
                shouldErrorAlertBeShown={ shouldErrorAlertBeShown }
                confirmationMessage={ activeModalProps.confirmationMessage }
                errorMessage={ `${bulkUpdateErrorMessages.length} ${activeModalProps.errorMessage}` }
                recurringProps={ {
                    showRecurring: props.useRecurringCancellations && activeModal === CANCEL_MODAL,
                    onChange: setting => setRecurrenceSetting(prev => ({ ...prev, ...setting })),
                    setting: recurrenceSetting,
                    options: {
                        startDatePickerMinimumDate: moment(props.serviceDate).format(DATE_FORMAT_DDMMYYYY),
                        endDatePickerMinimumDate: recurrenceSetting.startDate,
                    },
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
    selectedTrips: PropTypes.object,
    operateTrips: PropTypes.object.isRequired,
    actionResults: PropTypes.array,
    removeBulkUpdateMessages: PropTypes.func.isRequired,
    fetchAndUpdateSelectedTrips: PropTypes.func.isRequired,
    actionLoadingStatesByTripId: PropTypes.object.isRequired,
    collectTripsDataAndUpdateTripsStatus: PropTypes.func.isRequired,
    serviceDate: PropTypes.string.isRequired,
    origin: PropTypes.string,
    useRecurringCancellations: PropTypes.bool.isRequired,
    bulkUpdateTripsDisplay: PropTypes.func.isRequired,
};

UpdateTripStatusModal.defaultProps = {
    className: '',
    actionResults: [],
    selectedTrips: {},
    origin: updateTripsStatusModalOrigins.FOOTER,
};

export default connect(
    state => ({
        actionLoadingStatesByTripId: getTripInstancesActionLoading(state),
        actionResults: getTripInstancesActionResults(state),
        serviceDate: getServiceDate(state),
        selectedTrips: getSelectedTripInstances(state),
        origin: getTripStatusModalOriginState(state),
        useRecurringCancellations: useRecurringCancellations(state),
    }),
    { fetchAndUpdateSelectedTrips, collectTripsDataAndUpdateTripsStatus, removeBulkUpdateMessages, bulkUpdateTripsDisplay },
)(UpdateTripStatusModal);
