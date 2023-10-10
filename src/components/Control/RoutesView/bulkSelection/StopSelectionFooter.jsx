import { size, findKey, filter } from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import React, { useState } from 'react';

import Footer from '../../../Common/Footer/Footer';
import { IS_LOGIN_NOT_REQUIRED } from '../../../../auth';
import { StopStatus, updateStopsModalTypes } from '../Types';
import UpdateStopStatusModal from '../Modals/UpdateStopStatusModal';
import { getSelectedStopsByTripKey } from '../../../../redux/selectors/control/routes/trip-instances';
import { deselectAllStopsByTrip } from '../../../../redux/actions/control/routes/trip-instances';
import { isMoveToStopPermitted, isUpdateStopHeadsignPermitted, isSkipStopPermitted } from '../../../../utils/user-permissions';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';
import { SERVICE_DATE_FORMAT } from '../../../../utils/control/routes';
import { useHeadsignUpdate } from '../../../../redux/selectors/appSettings';

import './styles.scss';

export const StopSelectionFooter = (props) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(updateStopsModalTypes.SKIP);

    const { tripInstance } = props;
    const isBeforeTomorrow = moment(tripInstance.serviceDate).isBefore(moment().add(1, 'days'), 'day');
    const selectedStops = props.selectedStopsByTripKey(tripInstance) || {};
    const isOnlyOneStopSelected = size(selectedStops) === 1;
    const onlySelectedStop = selectedStops && selectedStops[findKey(selectedStops)];
    const isMoveTripToStopPossible = isBeforeTomorrow && isOnlyOneStopSelected && (IS_LOGIN_NOT_REQUIRED || isMoveToStopPermitted(onlySelectedStop));

    const areUpdateHeadsignsPermitted = IS_LOGIN_NOT_REQUIRED || Object.values(selectedStops).every(stop => isUpdateStopHeadsignPermitted(stop));
    const notStartedTrip = tripInstance.status === TRIP_STATUS_TYPES.notStarted;
    const inProgressTrip = tripInstance.status === TRIP_STATUS_TYPES.inProgress;
    const isTripRunningToday = tripInstance.serviceDate === moment().format(SERVICE_DATE_FORMAT)
        || (moment(tripInstance.serviceDate).isBefore(moment(), 'day') && tripInstance.endTime > '24:00:00');
    const isUpdateHeadsignPossible = areUpdateHeadsignsPermitted && isTripRunningToday && (notStartedTrip || inProgressTrip);

    const handleModalOnToggle = (activeModalName) => {
        setIsModalOpen(!isModalOpen);
        setActiveModal(activeModalName);
    };

    const areSkipStopsPermitted = IS_LOGIN_NOT_REQUIRED || Object.values(selectedStops).every(stop => isSkipStopPermitted(stop));
    const areMoveTripToStopsPermitted = IS_LOGIN_NOT_REQUIRED || Object.values(selectedStops).every(stop => isMoveToStopPermitted(stop));

    const checkIfButtonsShouldBeDisabled = () => {
        const getStopsByStatus = comparator => filter(selectedStops, stop => comparator(stop.status, StopStatus.skipped));
        return {
            isThereSkippedStop: getStopsByStatus((stopStatus, status) => stopStatus === status).length > 0,
            isThereANotSkippedStop: getStopsByStatus((stopStatus, status) => stopStatus !== status).length > 0,
        };
    };

    return (
        <Footer className="selection-tools-footer border m-3">
            <ul className="col-12 d-flex align-items-center mt-3 mr-3 pb-3">
                <li>
                    <span className="selection-tools-footer__stops-amount text-muted">
                        { `${size(selectedStops)} stops selected` }
                    </span>
                </li>
                <li className="border-right mr-3">
                    <Button
                        className="selection-tools-footer__btn-deselect cc-btn-link pb-2"
                        onClick={ () => props.deselectAllStopsByTrip(tripInstance) }>
                        Deselect all
                    </Button>
                </li>
                { areSkipStopsPermitted && (
                    <>
                        <li>
                            <Button
                                size="sm"
                                className="selection-tools-footer__btn-skip cc-btn-secondary d-flex align-items-center mr-3"
                                onClick={ () => handleModalOnToggle(updateStopsModalTypes.SKIP) }
                                disabled={ !checkIfButtonsShouldBeDisabled().isThereANotSkippedStop }>
                                Skip stop
                            </Button>
                        </li>
                        <li>
                            <Button
                                size="sm"
                                className="selection-tools-footer__btn-reinstate cc-btn-secondary d-flex align-items-center mr-3"
                                onClick={ () => handleModalOnToggle(updateStopsModalTypes.REINSTATE) }
                                disabled={ !checkIfButtonsShouldBeDisabled().isThereSkippedStop }>
                                Reinstate stop
                            </Button>
                        </li>
                    </>
                ) }
                { areMoveTripToStopsPermitted && (
                    <li>
                        <Button
                            size="sm"
                            className="selection-tools-footer__btn-move-to-stop cc-btn-secondary d-flex align-items-center mr-3"
                            onClick={ () => handleModalOnToggle(updateStopsModalTypes.MOVE_SERVICE) }
                            disabled={ !isMoveTripToStopPossible }>
                            Move service to this stop
                        </Button>
                    </li>
                )}
                { props.useHeadsignUpdate && areUpdateHeadsignsPermitted && (
                    <li>
                        <Button
                            size="sm"
                            className="selection-tools-footer__btn-update-destination cc-btn-secondary d-flex align-items-center"
                            disabled={ !isUpdateHeadsignPossible }
                            onClick={ () => handleModalOnToggle(updateStopsModalTypes.UPDATE_HEADSIGN) }>
                            Update destination
                        </Button>
                    </li>
                ) }
            </ul>
            <UpdateStopStatusModal
                isModalOpen={ isModalOpen }
                activeModal={ activeModal }
                tripInstance={ tripInstance }
                stopUpdatedHandler={ props.stopUpdatedHandler }
                onClose={ () => handleModalOnToggle(updateStopsModalTypes.SKIP) } />
        </Footer>
    );
};

StopSelectionFooter.propTypes = {
    tripInstance: PropTypes.object.isRequired,
    selectedStopsByTripKey: PropTypes.func.isRequired,
    deselectAllStopsByTrip: PropTypes.func.isRequired,
    useHeadsignUpdate: PropTypes.bool.isRequired,
    stopUpdatedHandler: PropTypes.func,
};

StopSelectionFooter.defaultProps = {
    stopUpdatedHandler: undefined,
};

export default connect(state => ({
    selectedStopsByTripKey: tripInstance => getSelectedStopsByTripKey(state.control.routes.tripInstances.selectedStops, tripInstance),
    useHeadsignUpdate: useHeadsignUpdate(state),
}), { deselectAllStopsByTrip })(StopSelectionFooter);
