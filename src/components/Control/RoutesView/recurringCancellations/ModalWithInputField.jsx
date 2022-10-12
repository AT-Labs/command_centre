import React from 'react';
import PropTypes from 'prop-types';
import RecurrentTripCancellation from '../Modals/UpdateTripStatusModal/RecurrentTripCancellation';
import ModalWithAdditionalInputField from './ModalWithAdditionalInputField';

const ModalWithInputField = (props) => {
    const { recurringProps, allowUpdate } = props;
    return (
        <>
            <ModalWithAdditionalInputField
                setting={ recurringProps.setting }
                onChange={ recurringProps.onChange }
            />
            <RecurrentTripCancellation
                setting={ recurringProps.setting }
                options={ recurringProps.options }
                onChange={ recurringProps.onChange }
                allowUpdate={ allowUpdate }
            />
        </>
    );
};

ModalWithInputField.propTypes = {
    recurringProps: PropTypes.object.isRequired,
    allowUpdate: PropTypes.bool.isRequired,
};

export default ModalWithInputField;
