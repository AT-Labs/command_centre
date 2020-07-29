import _ from 'lodash-es';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import React, { useState } from 'react';
import { IoIosCloseCircle, IoMdCheckmarkCircle } from 'react-icons/io';

import Message from '../../Common/Message/Message';
import Footer from '../../../Common/Footer/Footer';
import { updateTripsStatusModalTypes } from '../Types';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import UpdateTripStatusModal from '../Modals/UpdateTripStatusModal';
import { MESSAGE_ACTION_TYPES, CONFIRMATION_MESSAGE_TYPE } from '../../../../types/message-types';
import { deselectAllTrips, removeBulkUpdateMessages } from '../../../../redux/actions/control/routes/trip-instances';
import {
    getSelectedTripInstances, getTripInstancesActionResults, getTripInstancesActionLoading, getBulkUpdateMessagesByType,
} from '../../../../redux/selectors/control/routes/trip-instances';
import './styles.scss';

const SelectionToolsFooter = (props) => {
    const [activeModal, setActiveModal] = useState(updateTripsStatusModalTypes.CANCEL_MODAL);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { selectedTrips, actionLoadingStatesByTripId, bulkUpdateConfirmationMessages } = props;
    const lastConfirmationMessages = _.last(bulkUpdateConfirmationMessages);

    const handleModalOnToggle = (activeModalName) => {
        setIsModalOpen(!isModalOpen);
        setActiveModal(activeModalName);
        if (!isModalOpen) props.removeBulkUpdateMessages(CONFIRMATION_MESSAGE_TYPE);
    };

    const checkIfButtonsShouldBeDisabled = () => {
        const getTripsByStatus = comparator => _.filter(selectedTrips, trip => comparator(trip.status, TRIP_STATUS_TYPES.cancelled));
        return {
            isThereACancelledTrip: getTripsByStatus((tripStatus, status) => tripStatus === status).length > 0,
            isThereANotCancelledTrip: getTripsByStatus((tripStatus, status) => tripStatus !== status).length > 0,
        };
    };

    return (
        <Footer className="selection-tools-footer fixed-bottom border-top">
            {
                !isModalOpen
                && bulkUpdateConfirmationMessages.length > 0
                && !_.some(actionLoadingStatesByTripId, Boolean)
                && (
                    <div className="col-12 mt-3">
                        <Message
                            autoDismiss
                            timeout={ 5000 }
                            isDismissible={ false }
                            key={ lastConfirmationMessages.id }
                            onClose={ () => props.removeBulkUpdateMessages(CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES.bulkStatusUpdate) }
                            message={ {
                                id: lastConfirmationMessages.id,
                                type: lastConfirmationMessages.type,
                                body: `${bulkUpdateConfirmationMessages.length} ${lastConfirmationMessages.body}`,
                            } } />
                    </div>
                )
            }
            <ul className="col-12 d-flex align-items-center mt-3 mr-3">
                <li>
                    <span className="selection-tools-footer__trips-amount text-muted">
                        { `${_.size(selectedTrips)} trips selected` }
                    </span>
                </li>
                <li className="border-right mr-3">
                    <Button
                        className="selection-tools-footer__btn-deselect cc-btn-link pb-2"
                        onClick={ props.deselectAllTrips }>
                        Deselect all
                    </Button>
                </li>
                <li>
                    <Button
                        size="sm"
                        className="selection-tools-footer__btn-cancel cc-btn-secondary d-flex align-items-center mr-3"
                        onClick={ () => handleModalOnToggle(updateTripsStatusModalTypes.CANCEL_MODAL) }
                        disabled={ !checkIfButtonsShouldBeDisabled().isThereANotCancelledTrip }>
                        <IoIosCloseCircle size={ 20 } />
                        Cancel
                    </Button>
                </li>
                <li>
                    <Button
                        size="sm"
                        className="selection-tools-footer__btn-reinstate cc-btn-secondary d-flex align-items-center"
                        onClick={ () => handleModalOnToggle(updateTripsStatusModalTypes.REINSTATE_MODAL) }
                        disabled={ !checkIfButtonsShouldBeDisabled().isThereACancelledTrip }>
                        <IoMdCheckmarkCircle size={ 20 } />
                        Reinstate cancelled trip
                    </Button>
                </li>
            </ul>
            <UpdateTripStatusModal
                className="update-trip-status-modal"
                activeModal={ activeModal }
                isModalOpen={ isModalOpen }
                onClose={ handleModalOnToggle } />
        </Footer>
    );
};

SelectionToolsFooter.propTypes = {
    selectedTrips: PropTypes.object.isRequired,
    deselectAllTrips: PropTypes.func.isRequired,
    bulkUpdateConfirmationMessages: PropTypes.array,
    removeBulkUpdateMessages: PropTypes.func.isRequired,
    actionLoadingStatesByTripId: PropTypes.object.isRequired,
};

SelectionToolsFooter.defaultProps = {
    bulkUpdateConfirmationMessages: [],
};

export default connect(state => ({
    selectedTrips: getSelectedTripInstances(state),
    actionResults: getTripInstancesActionResults(state),
    actionLoadingStatesByTripId: getTripInstancesActionLoading(state),
    bulkUpdateConfirmationMessages: getBulkUpdateMessagesByType(
        state.control.routes.tripInstances.actionResults,
        state.control.routes.tripInstances.selected,
        CONFIRMATION_MESSAGE_TYPE,
        MESSAGE_ACTION_TYPES.bulkStatusUpdate,
    ),
}), { deselectAllTrips, removeBulkUpdateMessages })(SelectionToolsFooter);
