import React from 'react';
import PropTypes from 'prop-types';

import Message from '../../../Common/Message/Message';
import CancelReinstateTripsModalTable from './UpdateTripStatusModalTable';
import ConfirmationModalBody from '../../../Common/ConfirmationModal/ConfirmationModalBody';
import RecurrentTripCancellation from './RecurrentTripCancellation';

const UpdateTripStatusModalContent = (props) => {
    const { className, confirmationMessage, errorMessage, shouldErrorAlertBeShown, selectedTrips, recurringProps } = props;

    return (
        <>
            <div className={ `${className}-confirmation-message mb-4` }>
                <ConfirmationModalBody message={ confirmationMessage } />
            </div>
            <div className="update-trip-status-modal__table-wrapper mb-3">
                <CancelReinstateTripsModalTable selectedTrips={ selectedTrips } />
            </div>
            {
                recurringProps.showRecurring && (
                    <RecurrentTripCancellation setting={ recurringProps.setting } options={ recurringProps.options } onChange={ recurringProps.onChange } />
                )
            }
            {
                shouldErrorAlertBeShown && (
                    <Message
                        autoDismiss={ false }
                        isDismissible={ false }
                        message={ {
                            type: 'danger',
                            id: `${className}-completed-alert`,
                            body: errorMessage,
                        } } />
                )
            }
        </>
    );
};

UpdateTripStatusModalContent.propTypes = {
    className: PropTypes.string,
    errorMessage: PropTypes.string,
    confirmationMessage: PropTypes.string,
    selectedTrips: PropTypes.object.isRequired,
    shouldErrorAlertBeShown: PropTypes.bool.isRequired,
    recurringProps: PropTypes.object.isRequired,
};

UpdateTripStatusModalContent.defaultProps = {
    className: '',
    errorMessage: '',
    confirmationMessage: '',
};

export default UpdateTripStatusModalContent;
