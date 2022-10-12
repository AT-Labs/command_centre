import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import moment from 'moment';
import { SERVICE_DATE_FORMAT } from '../../../../utils/control/routes';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import UpdateStatusModalsBtn from '../Modals/UpdateStatusModalsBtn';
import ModalWithInputField from './ModalWithInputField';
import {
    getAddRecurringCancellationIsLoading,
    getAddRecurringCancellationInputFieldValidation,
} from '../../../../redux/selectors/control/routes/addRecurringCancellations';
import { fetchRoutes } from '../../../../redux/actions/control/routes/routes';
import { getServiceDate } from '../../../../redux/selectors/control/serviceDate';
import { saveRecurringCancellationInDatabase } from '../../../../redux/actions/control/routes/addRecurringCancellations';
import { DATE_FORMAT_DDMMYYYY } from '../../../../utils/dateUtils';

const AddRecurringCancellationModal = (props) => {
    const { className, isModalOpen, permission, isInputFieldValidationSuccess } = props;
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
    const [inputFieldValid, setInputFieldValid] = useState(false);

    useEffect(() => {
        props.fetchRoutes({
            serviceDate: moment(props.serviceDate).format(SERVICE_DATE_FORMAT),
        });
    }, []);

    const resetToInitialValue = () => {
        props.onClose();
        setRecurrenceSetting(recurrenceSettingInitialState);
    };

    useEffect(() => {
        if (!loadingState) {
            resetToInitialValue();
        }
    }, [loadingState]);

    const activeModalProps = {
        className: 'add-modal',
        title: 'Add recurring cancellation',
        mainButtonLabel: 'Add recurring cancellation',
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

    const checkDisabled = () => {
        if (props.isLoading) {
            return true;
        }

        return !(!isFieldEmpty && permission && isInputFieldValidationSuccess);
    };

    const generateModalFooter = () => (
        <>
            <Button
                className={ `${className}-button cc-btn-primary w-100` }
                onClick={ () => props.saveRecurringCancellationInDatabase(recurrenceSetting) }
                disabled={ checkDisabled() }>
                <UpdateStatusModalsBtn label="Add recurring cancellation" isLoading={ props.isLoading } />
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
            <ModalWithInputField
                className={ className }
                allowUpdate={ permission }
                recurringProps={ {
                    onChange: setting => setRecurrenceSetting(prev => ({ ...prev, ...setting })),
                    setting: recurrenceSetting,
                    options: {
                        startDatePickerMinimumDate: moment().format(DATE_FORMAT_DDMMYYYY),
                        endDatePickerMinimumDate: recurrenceSetting.startDate,
                    },
                } }
                inputFieldValid={ {
                    onChange: validity => setInputFieldValid(validity),
                    inputFieldValid,
                } }
            />
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
    isLoading: PropTypes.bool.isRequired,
    isInputFieldValidationSuccess: PropTypes.bool.isRequired,
};

AddRecurringCancellationModal.defaultProps = {
    className: '',
    onClose: () => {},
};

export default connect(
    state => ({
        serviceDate: getServiceDate(state),
        isLoading: getAddRecurringCancellationIsLoading(state),
        isInputFieldValidationSuccess: getAddRecurringCancellationInputFieldValidation(state),
    }),
    { fetchRoutes, saveRecurringCancellationInDatabase },
)(AddRecurringCancellationModal);
