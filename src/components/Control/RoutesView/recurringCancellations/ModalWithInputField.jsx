import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Message from '../../Common/Message/Message';
import RecurrentTripCancellation from '../Modals/UpdateTripStatusModal/RecurrentTripCancellation';
import ModalWithAdditionalInputField from './ModalWithAdditionalInputField';
import ModalWithUploadFile from './ModalWithUploadFIle';
import { displayOperatorPermissionError } from '../../../../redux/actions/control/routes/addRecurringCancellations';

const ModalWithInputField = (props) => {
    const { recurringProps, allowUpdate, isEdit, isUploadFile, recurringFileProps, shouldErrorAlertBeShown } = props;
    const errorMessage = 'You do not have the operator permission for the selected route, select a different route or operator';
    const checkAllowUpdate = () => {
        if (allowUpdate && isEdit) {
            return false;
        }

        return allowUpdate;
    };

    return (
        <>
            { isUploadFile ? (
                <ModalWithUploadFile
                    allowUpdate
                    setting={ recurringFileProps.setting }
                    onChange={ recurringFileProps.onChange }
                />
            ) : (
                <>
                    <ModalWithAdditionalInputField
                        setting={ recurringProps.setting }
                        onChange={ recurringProps.onChange }
                        allowUpdate={ checkAllowUpdate() }
                    />
                    <RecurrentTripCancellation
                        setting={ recurringProps.setting }
                        options={ recurringProps.options }
                        onChange={ recurringProps.onChange }
                        allowUpdate={ allowUpdate }
                    />
                </>
            )}
            {
                shouldErrorAlertBeShown && (
                    <Message
                        message={ {
                            type: 'danger',
                            id: 'auto-fill-failed-alert',
                            body: errorMessage,
                        } }
                        onClose={ () => props.displayOperatorPermissionError(false) }
                    />
                )
            }
        </>
    );
};

ModalWithInputField.propTypes = {
    recurringProps: PropTypes.object.isRequired,
    recurringFileProps: PropTypes.object.isRequired,
    allowUpdate: PropTypes.bool.isRequired,
    isEdit: PropTypes.bool.isRequired,
    isUploadFile: PropTypes.bool.isRequired,
    shouldErrorAlertBeShown: PropTypes.bool.isRequired,
    displayOperatorPermissionError: PropTypes.func.isRequired,
};

export default connect(null, { displayOperatorPermissionError })(ModalWithInputField);
