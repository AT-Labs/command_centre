import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Message from '../../Common/Message/Message';
import { removeBulkStopsUpdateMessages, deselectAllStopsByTrip } from '../../../../redux/actions/control/routes/trip-instances';
import { CONFIRMATION_MESSAGE_TYPE } from '../../../../types/message-types';
import { getBulkUpdateErrorMessagesForStops, getSelectedStopsUpdatingState, getBulkUpdateSuccessMessagesForStops } from '../../../../redux/selectors/control/routes/trip-instances';

const StopSelectionMessages = (props) => {
    const { bulkUpdateConfirmationMessages, bulkUpdateErrorMessages, areSelectedStopsUpdating, tripInstance } = props;
    const lastMessagesByType = _.compact([
        _.last(bulkUpdateConfirmationMessages),
        _.last(bulkUpdateErrorMessages),
    ]);

    const getMessageBody = (type, body) => `${type === CONFIRMATION_MESSAGE_TYPE ? bulkUpdateConfirmationMessages.length : bulkUpdateErrorMessages.length} ${body}`;

    return lastMessagesByType.length > 0 && !areSelectedStopsUpdating
        ? lastMessagesByType.map(message => (
            <div className="col-12 mt-3" key={ message.id }>
                <Message
                    autoDismiss
                    timeout={ 5000 }
                    isDismissible={ false }
                    onClose={ () => props.removeBulkStopsUpdateMessages(tripInstance) }
                    message={ {
                        id: message.id,
                        type: message.type,
                        body: getMessageBody(message.type, message.body),
                    } } />
            </div>
        ))
        : null;
};

StopSelectionMessages.propTypes = {
    bulkUpdateErrorMessages: PropTypes.array,
    bulkUpdateConfirmationMessages: PropTypes.array,
    removeBulkStopsUpdateMessages: PropTypes.func.isRequired,
    areSelectedStopsUpdating: PropTypes.bool.isRequired,
};

StopSelectionMessages.defaultProps = {
    bulkUpdateErrorMessages: [],
    bulkUpdateConfirmationMessages: [],
};

export default connect(state => ({
    // Regarding the next two lines, refer to selectors/trip-instances.js -> ABOUT REMOVING SELECTED STOPS AFTER UPDATE
    bulkUpdateConfirmationMessages: getBulkUpdateSuccessMessagesForStops(state),
    bulkUpdateErrorMessages: getBulkUpdateErrorMessagesForStops(state),
    areSelectedStopsUpdating: getSelectedStopsUpdatingState(state),
}), { removeBulkStopsUpdateMessages, deselectAllStopsByTrip })(StopSelectionMessages);
