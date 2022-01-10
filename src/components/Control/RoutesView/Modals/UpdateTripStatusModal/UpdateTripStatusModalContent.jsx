import React from 'react';
import PropTypes from 'prop-types';

import Message from '../../../Common/Message/Message';
import CancelReinstateTripsModalTable from './UpdateTripStatusModalTable';
import ConfirmationModalBody from '../../../Common/ConfirmationModal/ConfirmationModalBody';

const UpdateTripStatusModalContent = (props) => {
    const { className, confirmationMessage, errorMessage, shouldErrorAlertBeShown, selectedTrips } = props;

    return (
        <React.Fragment>
            <div className={ `${className}-confirmation-message mb-4` }>
                <ConfirmationModalBody message={ confirmationMessage } />
            </div>
            <div className="update-trip-status-modal__table-wrapper mb-3">
                <CancelReinstateTripsModalTable selectedTrips={ selectedTrips } />
            </div>
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
        </React.Fragment>
    );
};

UpdateTripStatusModalContent.propTypes = {
    className: PropTypes.string,
    errorMessage: PropTypes.string,
    confirmationMessage: PropTypes.string,
    selectedTrips: PropTypes.object.isRequired,
    shouldErrorAlertBeShown: PropTypes.bool.isRequired,
};

UpdateTripStatusModalContent.defaultProps = {
    className: '',
    errorMessage: '',
    confirmationMessage: '',
};

export default UpdateTripStatusModalContent;
