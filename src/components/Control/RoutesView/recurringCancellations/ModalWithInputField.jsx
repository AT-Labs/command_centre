import React from 'react';
import PropTypes from 'prop-types';
import RecurrentTripCancellation from '../Modals/UpdateTripStatusModal/RecurrentTripCancellation';
import ModalWithAdditionalInputField from './ModalWithAdditionalInputField';
import ModalWithUploadFile from './ModalWithUploadFIle';

const ModalWithInputField = (props) => {
    const { recurringProps, allowUpdate, isEdit, isUploadFile, recurringFileProps } = props;
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
        </>
    );
};

ModalWithInputField.propTypes = {
    recurringProps: PropTypes.object.isRequired,
    recurringFileProps: PropTypes.object.isRequired,
    allowUpdate: PropTypes.bool.isRequired,
    isEdit: PropTypes.bool.isRequired,
    isUploadFile: PropTypes.bool.isRequired,
};

export default ModalWithInputField;
