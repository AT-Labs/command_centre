import React from 'react';
import { compact, last } from 'lodash-es';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import Message from '../../Common/Message/Message';
import { removeBulkStopsUpdateMessages, deselectAllStopsByTrip } from '../../../../redux/actions/control/routes/trip-instances';
import { getBulkUpdateErrorMessagesForStops, getSelectedStopsUpdatingState, getBulkUpdateSuccessMessagesForStops } from '../../../../redux/selectors/control/routes/trip-instances';

const StopSelectionMessages = (props) => {
    const { bulkUpdateConfirmationMessages, bulkUpdateErrorMessages, areSelectedStopsUpdating, tripInstance } = props;
    const lastMessagesByType = compact([
        last(bulkUpdateConfirmationMessages),
        last(bulkUpdateErrorMessages),
    ]);

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
                        body: message.body,
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
