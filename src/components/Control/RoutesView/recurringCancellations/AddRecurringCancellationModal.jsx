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
} from '../../../../redux/selectors/control/routes/addRecurringCancellations';
import { fetchRoutes } from '../../../../redux/actions/control/routes/routes';
import { getServiceDate } from '../../../../redux/selectors/control/serviceDate';
import { saveRecurringCancellationInDatabase, deleteRecurringCancellationInDatabase } from '../../../../redux/actions/control/routes/addRecurringCancellations';
import { DATE_FORMAT_DDMMYYYY } from '../../../../utils/dateUtils';

const AddRecurringCancellationModal = (props) => {
    const { className, isModalOpen, permission, rowData, isInputFieldValidationSuccess } = props;
    const { isEdit, isDelete } = props.actionState;
    const loadingState = props.isLoading;
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

    const modalProps = {
        addRecurringCancellation: {
            className: 'add-modal',
            title: 'Add recurring cancellation',
            mainButtonLabel: 'Add recurring cancellation',
            onClick: () => props.saveRecurringCancellationInDatabase({ ...recurrenceSetting }),
            disabled: !(!isFieldEmpty && permission && isInputFieldValidationSuccess),
        },
        editRecurringCancellation: {
            className: 'edit-modal',
            title: 'Edit recurring cancellation',
            mainButtonLabel: 'Edit recurring cancellation',
            onClick: () => props.saveRecurringCancellationInDatabase({ ...recurrenceSetting, id: rowData.id }),
            disabled: !(!isFieldEmpty && permission),
        },
        deleteRecurringCancellation: {
            className: 'delete-modal',
            title: 'Delete recurring cancellation',
            errorMessage: 'trip fail to be updated',
            confirmationMessage: ['Are you sure you want to remove the recurring cancellation ?', <br />,
                `Trips for today or tomorrow may have already processed this cancellation. 
                To manually reinstate those trips, check Routes & Trips.`,
            ],
            mainButtonLabel: 'Delete recurring cancellation',
            onClick: () => props.deleteRecurringCancellationInDatabase(rowData.id),
            disabled: props.isLoading,
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
            { isDelete ? (
                <div>
                    <ConfirmationModalBody
                        message={ activeModalProps.confirmationMessage } />
                </div>
            ) : (
                <ModalWithInputField
                    isEdit={ isEdit }
                    className={ className }
                    allowUpdate={ permission }
                    recurringProps={ {
                        onChange: setting => setRecurrenceSetting(prev => ({ ...prev, ...setting })),
                        setting: recurrenceSetting,
                        options: {
                            startDatePickerMinimumDate: _.isNull(recurrenceSetting.startDate) ? moment().format(DATE_FORMAT_DDMMYYYY) : recurrenceSetting.startDate,
                            endDatePickerMinimumDate: _.isNull(recurrenceSetting.startDate) ? recurrenceSetting.startDate : recurrenceSetting.endDate,
                        },
                    } }
                />
            )}
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
    isLoading: PropTypes.bool.isRequired,
    rowData: PropTypes.object,
    actionState: PropTypes.object.isRequired,
    isInputFieldValidationSuccess: PropTypes.bool.isRequired,
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
    }),
    { fetchRoutes, saveRecurringCancellationInDatabase, deleteRecurringCancellationInDatabase },
)(AddRecurringCancellationModal);
