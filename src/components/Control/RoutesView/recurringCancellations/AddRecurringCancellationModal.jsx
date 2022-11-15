import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import moment from 'moment';
import { SERVICE_DATE_FORMAT } from '../../../../utils/control/routes';
import ConfirmationModalBody from '../../Common/ConfirmationModal/ConfirmationModalBody';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import UpdateStatusModalsBtn from '../Modals/UpdateStatusModalsBtn';
import ModalWithInputField from './ModalWithInputField';
import {
    getAddRecurringCancellationIsLoading,
    getAddRecurringCancellationInputFieldValidation,
    getAddRecurringCancellationOperatorErrorDisplay,
} from '../../../../redux/selectors/control/routes/addRecurringCancellations';
import { fetchRoutes } from '../../../../redux/actions/control/routes/routes';
import { getServiceDate } from '../../../../redux/selectors/control/serviceDate';
import {
    saveRecurringCancellationInDatabase,
    deleteRecurringCancellationInDatabase,
    uploadFileRecurringCancellation,
    displayOperatorPermissionError,
} from '../../../../redux/actions/control/routes/addRecurringCancellations';
import { DATE_FORMAT_DDMMYYYY } from '../../../../utils/dateUtils';

const AddRecurringCancellationModal = (props) => {
    const { className, isModalOpen, permission, rowData, isInputFieldValidationSuccess, multipleRowData, shouldDisplayError } = props;
    const { isEdit, isDelete, isUploadFile, isRedirectionWarning } = props.actionState;
    const loadingState = props.isLoading;
    const recurrenceFileUploadInitialState = {
        csvFile: '',
        operator: '',
    };
    const [recurrenceFileSetting, setRecurrenceFileSetting] = useState(recurrenceFileUploadInitialState);
    const recurrenceSettingInitialState = {
        startDate: moment().format(DATE_FORMAT_DDMMYYYY),
        endDate: moment().format(DATE_FORMAT_DDMMYYYY),
        selectedWeekdays: [moment().isoWeekday() - 1],
        routeVariant: '',
        startTime: '',
        operator: '',
        route: '',
    };
    const [recurrenceSetting, setRecurrenceSetting] = useState(recurrenceSettingInitialState);

    useEffect(() => {
        props.fetchRoutes({
            serviceDate: moment(props.serviceDate).format(SERVICE_DATE_FORMAT),
        });
    }, []);

    useEffect(() => {
        if (rowData) {
            setRecurrenceSetting({
                startDate: moment(rowData.cancelFrom).format(DATE_FORMAT_DDMMYYYY),
                endDate: moment(rowData.cancelTo).format(DATE_FORMAT_DDMMYYYY),
                selectedWeekdays: JSON.parse(rowData.dayPattern),
                routeVariant: rowData.routeVariantId,
                startTime: rowData.startTime,
                operator: rowData.agencyId,
                route: rowData.routeShortName ? rowData.routeShortName : '',
            });
        }
    }, [rowData]);

    const resetToInitialValue = () => {
        props.onClose();
        props.displayOperatorPermissionError(false);
        setRecurrenceFileSetting(recurrenceFileUploadInitialState);
        setRecurrenceSetting(recurrenceSettingInitialState);
    };

    useEffect(() => {
        if (!loadingState) {
            resetToInitialValue();
        }
    }, [loadingState]);

    const modalPropsKey = () => {
        if (isDelete) {
            return 'deleteRecurringCancellation';
        }
        if (isEdit) {
            return 'editRecurringCancellation';
        }
        if (isUploadFile) {
            return 'uploadFileRecurringCancellation';
        }
        if (isRedirectionWarning) {
            return 'displayRedirectionWarning';
        }
        return 'addRecurringCancellation';
    };

    const isFieldEmpty = _.some([
        recurrenceSetting.startDate,
        recurrenceSetting.endDate,
        recurrenceSetting.selectedWeekdays,
        recurrenceSetting.routeVariant,
        recurrenceSetting.startTime,
        recurrenceSetting.operator,
        recurrenceSetting.route,
    ], _.isEmpty);

    const renderMainBody = () => (
        <ModalWithInputField
            isUploadFile={ isUploadFile }
            isEdit={ isEdit }
            className={ className }
            allowUpdate={ permission }
            shouldErrorAlertBeShown={ shouldDisplayError }
            recurringProps={ {
                onChange: setting => setRecurrenceSetting(prev => ({ ...prev, ...setting })),
                setting: recurrenceSetting,
                options: {
                    startDatePickerMinimumDate: moment(rowData?.cancelFrom).format(DATE_FORMAT_DDMMYYYY),
                    endDatePickerMinimumDate: recurrenceSetting.startDate,
                },
            } }
            recurringFileProps={ {
                onChange: setting => setRecurrenceFileSetting(prev => ({ ...prev, ...setting })),
                setting: recurrenceFileSetting,
            } }
        />
    );

    const modalProps = {
        addRecurringCancellation: {
            className: 'add-modal',
            title: 'Add recurring cancellation',
            mainButtonLabel: 'Add recurring cancellation',
            onClick: () => props.saveRecurringCancellationInDatabase({ ...recurrenceSetting }),
            disabled: !(!isFieldEmpty && permission && isInputFieldValidationSuccess),
            renderBody: renderMainBody(),
        },
        editRecurringCancellation: {
            className: 'edit-modal',
            title: 'Edit recurring cancellation',
            mainButtonLabel: 'Edit recurring cancellation',
            onClick: () => props.saveRecurringCancellationInDatabase({ ...recurrenceSetting, id: rowData.id }),
            disabled: !(!isFieldEmpty && permission),
            renderBody: renderMainBody(),
        },
        deleteRecurringCancellation: {
            className: 'delete-modal',
            title: 'Delete recurring cancellation',
            errorMessage: 'trip fail to be updated',
            mainButtonLabel: 'Delete recurring cancellation',
            onClick: () => props.deleteRecurringCancellationInDatabase(_.isEmpty(multipleRowData) ? rowData.id : multipleRowData),
            disabled: props.isLoading,
            renderBody: (
                <div>
                    <ConfirmationModalBody
                        message={ ['Are you sure you want to remove the recurring cancellation ?', <br />,
                            `Trips for today or tomorrow may have already processed this cancellation. 
                            To manually reinstate those trips, check Routes & Trips.`] }
                    />
                </div>
            ),
        },
        displayRedirectionWarning: {
            className: 'redirection-warning-modal',
            title: 'Trip does not exist',
            mainButtonLabel: 'OK',
            onClick: () => props.onClose(),
            disabled: false,
            renderBody: (<p className="font-weight-light text-center mb-0">The trip that you are trying to view does not exist for today’s timetable</p>),
        },
        uploadFileRecurringCancellation: {
            className: 'upload-file-modal',
            title: 'Upload file',
            mainButtonLabel: 'Upload file',
            onClick: () => props.uploadFileRecurringCancellation(recurrenceFileSetting),
            disabled: !(!_.isEmpty(recurrenceFileSetting.operator) && !_.isEmpty(recurrenceFileSetting.csvFile.name)),
            renderBody: renderMainBody(),
        },
    };

    const activeModalProps = modalProps[modalPropsKey()];

    const generateModalFooter = () => (
        <>
            <Button
                className={ `${className}-button cc-btn-primary w-100` }
                onClick={ activeModalProps.onClick }
                disabled={ props.isLoading ? true : activeModalProps.disabled }>
                <UpdateStatusModalsBtn label={ activeModalProps.mainButtonLabel } isLoading={ props.isLoading } />
            </Button>
        </>
    );

    return (
        <CustomModal
            className={ className }
            onClose={ resetToInitialValue }
            isModalOpen={ isModalOpen }
            title={ activeModalProps.title }
            customFooter={ generateModalFooter() }>
            { activeModalProps.renderBody }
        </CustomModal>
    );
};
AddRecurringCancellationModal.propTypes = {
    className: PropTypes.string,
    onClose: PropTypes.func,
    isModalOpen: PropTypes.bool.isRequired,
    permission: PropTypes.bool.isRequired,
    serviceDate: PropTypes.string.isRequired,
    fetchRoutes: PropTypes.func.isRequired,
    saveRecurringCancellationInDatabase: PropTypes.func.isRequired,
    deleteRecurringCancellationInDatabase: PropTypes.func.isRequired,
    displayOperatorPermissionError: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    rowData: PropTypes.object,
    actionState: PropTypes.object.isRequired,
    isInputFieldValidationSuccess: PropTypes.bool.isRequired,
    multipleRowData: PropTypes.array.isRequired,
    uploadFileRecurringCancellation: PropTypes.func.isRequired,
    shouldDisplayError: PropTypes.bool.isRequired,
};

AddRecurringCancellationModal.defaultProps = {
    className: '',
    rowData: null,
    onClose: () => {},
};

export default connect(
    state => ({
        serviceDate: getServiceDate(state),
        isLoading: getAddRecurringCancellationIsLoading(state),
        isInputFieldValidationSuccess: getAddRecurringCancellationInputFieldValidation(state),
        shouldDisplayError: getAddRecurringCancellationOperatorErrorDisplay(state),
    }),
    {
        fetchRoutes,
        saveRecurringCancellationInDatabase,
        deleteRecurringCancellationInDatabase,
        uploadFileRecurringCancellation,
        displayOperatorPermissionError,
    },
)(AddRecurringCancellationModal);
