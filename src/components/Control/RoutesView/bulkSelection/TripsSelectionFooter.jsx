import { last, filter, size, some, values } from 'lodash-es';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import React, { useState } from 'react';
import { IoIosCloseCircle, IoMdCheckmarkCircle, IoMdEyeOff } from 'react-icons/io';
import moment from 'moment';

import Message from '../../Common/Message/Message';
import Footer from '../../../Common/Footer/Footer';
import { updateTripsStatusModalTypes, updateTripsStatusModalOrigins } from '../Types';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import UpdateTripStatusModal from '../Modals/UpdateTripStatusModal';
import { MESSAGE_ACTION_TYPES, CONFIRMATION_MESSAGE_TYPE } from '../../../../types/message-types';
import { deselectAllTrips, removeBulkUpdateMessages, setTripStatusModalOrigin } from '../../../../redux/actions/control/routes/trip-instances';
import {
    getSelectedTripInstances, getTripInstancesActionResults, getTripInstancesActionLoading, getBulkUpdateMessagesByType, getTripStatusModalOriginState,
} from '../../../../redux/selectors/control/routes/trip-instances';
import { useHideTrip, useBulkStopsUpdate } from '../../../../redux/selectors/appSettings';
import './styles.scss';
import { isHideCancellationPermitted } from '../../../../utils/user-permissions';
import UpdateTripStopsModal from '../Modals/UpdateTripStopsModal';

const SelectionToolsFooter = (props) => {
    const [activeModal, setActiveModal] = useState(updateTripsStatusModalTypes.CANCEL_MODAL);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkUpdateTripStopsModalOpen, setIsBulkUpdateTripStopsModalOpen] = useState(false);
    const [bulkUpdateTripStopsConfirmationMessage, setBulkUpdateTripStopsConfirmationMessage] = useState('');

    const { selectedTrips, actionLoadingStatesByTripId, actionResults, tripStatusModalOrigin } = props;

    const bulkUpdateConfirmationMessages = getBulkUpdateMessagesByType(actionResults, selectedTrips, CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES.bulkStatusUpdate);
    const lastBulkConfirmationMessage = last(bulkUpdateConfirmationMessages);

    const handleModalOnToggle = (activeModalName) => {
        setIsModalOpen(!isModalOpen);
        setActiveModal(activeModalName);
        if (activeModalName) props.setTripStatusModalOrigin(updateTripsStatusModalOrigins.FOOTER);
        if (!isModalOpen) props.removeBulkUpdateMessages(CONFIRMATION_MESSAGE_TYPE);
    };

    const handleBulkUpdateStopsModalOnToggle = (result) => {
        setIsBulkUpdateTripStopsModalOpen(!isBulkUpdateTripStopsModalOpen);
        if (result && result.actionType === 'success') {
            setBulkUpdateTripStopsConfirmationMessage(result.message);
        }
    };

    const ifCancelButtonShouldBeDisabled = filter(selectedTrips, trip => trip.status !== TRIP_STATUS_TYPES.cancelled).length <= 0;

    const ifReinsteButtonShouldBeDisabled = filter(selectedTrips, trip => trip.status === TRIP_STATUS_TYPES.cancelled).length <= 0;

    const ifHideTripsButtonShouldBeDisabled = filter(selectedTrips, trip => (
        trip.status === TRIP_STATUS_TYPES.cancelled
        && !!trip.display
        && (moment(trip.serviceDate).isSame(moment(), 'day'))
        && isHideCancellationPermitted(trip)
    )).length <= 0;

    const ifUpdateStopsButtonShouldBeEnabled = () => {
        const trips = values(selectedTrips);
        if (trips.length === 0) {
            return false;
        }
        // Get the routeVariantId of the first selected trip
        const { routeVariantId } = trips[0];

        // Check if the selected trips have the same routeVariantId as the first one
        // Check if all the selected trips are not started
        return trips.every(trip => (moment(trip.serviceDate).isSame(moment(), 'day')) && trip.routeVariantId === routeVariantId && trip.status === TRIP_STATUS_TYPES.notStarted);
    };

    return (
        <Footer className="selection-tools-footer fixed-bottom border-top on-top">
            {
                tripStatusModalOrigin === updateTripsStatusModalOrigins.FOOTER
                && !isModalOpen
                && !isBulkUpdateTripStopsModalOpen
                && bulkUpdateConfirmationMessages.length > 0
                && !some(actionLoadingStatesByTripId, Boolean)
                && (
                    <div className="col-12 mt-3">
                        <Message
                            autoDismiss
                            timeout={ 5000 }
                            isDismissible={ false }
                            key={ lastBulkConfirmationMessage.id }
                            onClose={ () => props.removeBulkUpdateMessages(CONFIRMATION_MESSAGE_TYPE, MESSAGE_ACTION_TYPES.bulkStatusUpdate) }
                            message={ {
                                id: lastBulkConfirmationMessage.id,
                                type: lastBulkConfirmationMessage.type,
                                body: `${bulkUpdateConfirmationMessages.length} ${lastBulkConfirmationMessage.body}`,
                            } } />
                    </div>
                )
            }
            {
                bulkUpdateTripStopsConfirmationMessage && (
                    <div className="col-12 mt-3">
                        <Message
                            autoDismiss
                            timeout={ 5000 }
                            isDismissible={ false }
                            key="bulk-update-trip-stops-result"
                            onClose={ () => setBulkUpdateTripStopsConfirmationMessage('') }
                            message={ {
                                id: 'bulk-update-trip-stops-result',
                                type: 'success',
                                body: bulkUpdateTripStopsConfirmationMessage,
                            } } />
                    </div>
                )
            }
            <ul className="col-12 d-flex align-items-center mt-3 mr-3">
                <li>
                    <span className="selection-tools-footer__trips-amount text-muted">
                        { `${size(selectedTrips)} trips selected` }
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
                        disabled={ ifCancelButtonShouldBeDisabled }>
                        <IoIosCloseCircle size={ 20 } />
                        Cancel
                    </Button>
                </li>
                <li>
                    <Button
                        size="sm"
                        className="selection-tools-footer__btn-reinstate cc-btn-secondary d-flex align-items-center mr-3"
                        onClick={ () => handleModalOnToggle(updateTripsStatusModalTypes.REINSTATE_MODAL) }
                        disabled={ ifReinsteButtonShouldBeDisabled }>
                        <IoMdCheckmarkCircle size={ 20 } />
                        Reinstate cancelled trip
                    </Button>
                </li>
                {
                    props.useHideTrip && (
                        <li>
                            <Button
                                size="sm"
                                className="selection-tools-footer__btn-hide cc-btn-secondary d-flex align-items-center mr-3"
                                onClick={ () => handleModalOnToggle(updateTripsStatusModalTypes.HIDE_TRIP_MODAL) }
                                disabled={ ifHideTripsButtonShouldBeDisabled }>
                                <IoMdEyeOff size={ 20 } />
                                Hide cancellation
                            </Button>
                        </li>
                    )
                }
                {
                    props.useBulkStopsUpdate && (
                        <li>
                            <Button
                                size="sm"
                                className="selection-tools-footer__btn-update cc-btn-secondary d-flex align-items-center"
                                onClick={ () => handleBulkUpdateStopsModalOnToggle() }
                                disabled={ !ifUpdateStopsButtonShouldBeEnabled() }>
                                Update Stops
                            </Button>
                        </li>
                    )
                }
            </ul>
            <UpdateTripStatusModal
                className="update-trip-status-modal"
                activeModal={ activeModal }
                isModalOpen={ isModalOpen }
                operateTrips={ selectedTrips }
                onClose={ handleModalOnToggle } />
            { isBulkUpdateTripStopsModalOpen ? (
                <UpdateTripStopsModal
                    className="update-trip-stops-modal"
                    operateTrips={ selectedTrips }
                    onClose={ handleBulkUpdateStopsModalOnToggle } />
            ) : '' }
        </Footer>
    );
};

SelectionToolsFooter.propTypes = {
    selectedTrips: PropTypes.object.isRequired,
    deselectAllTrips: PropTypes.func.isRequired,
    removeBulkUpdateMessages: PropTypes.func.isRequired,
    actionLoadingStatesByTripId: PropTypes.object.isRequired,
    actionResults: PropTypes.array.isRequired,
    tripStatusModalOrigin: PropTypes.string,
    setTripStatusModalOrigin: PropTypes.func.isRequired,
    useHideTrip: PropTypes.bool.isRequired,
    useBulkStopsUpdate: PropTypes.bool.isRequired,
};

SelectionToolsFooter.defaultProps = {
    tripStatusModalOrigin: null,
};

export default connect(state => ({
    selectedTrips: getSelectedTripInstances(state),
    actionResults: getTripInstancesActionResults(state),
    actionLoadingStatesByTripId: getTripInstancesActionLoading(state),
    tripStatusModalOrigin: getTripStatusModalOriginState(state),
    useHideTrip: useHideTrip(state),
    useBulkStopsUpdate: useBulkStopsUpdate(state),
}), { deselectAllTrips, removeBulkUpdateMessages, setTripStatusModalOrigin })(SelectionToolsFooter);
