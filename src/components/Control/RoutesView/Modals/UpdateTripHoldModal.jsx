import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Table } from 'reactstrap';
import { connect } from 'react-redux';
import { every, isEmpty } from 'lodash-es';

import CustomModal from '../../../Common/CustomModal/CustomModal';
import { bulkUpdateTripsOnHold } from '../../../../redux/actions/control/routes/trip-instances';
import { getTripInstancesActionLoading } from '../../../../redux/selectors/control/routes/trip-instances';
import { TRIP_HOLD_STATUS } from '../Types';

const UpdateTripHoldModal = React.memo((props) => {
    const { trip, isModalOpen, action, onClose, actionLoadingStatesByTripId } = props;
    const { tripId, routeVariantId, startTime, routeLongName } = trip;

    const isTripUpdating = useMemo(
        () => !isEmpty(actionLoadingStatesByTripId) && every(actionLoadingStatesByTripId, value => value === true),
        [actionLoadingStatesByTripId],
    );

    const [hasUpdateBeenTriggered, setHasUpdateBeenTriggered] = useState(false);
    const isUpdatingOngoing = hasUpdateBeenTriggered && isTripUpdating;
    const hasUpdatingFinished = hasUpdateBeenTriggered && !isTripUpdating;

    const actionLabel = action === TRIP_HOLD_STATUS.HOLD ? 'Hold' : 'Release';

    const getSuccessMessage = useCallback(() => (action === TRIP_HOLD_STATUS.HOLD ? `Trip ${tripId} has been put on hold` : `Hold for trip ${tripId} has been removed`
    ), [action, tripId]);

    const getErrorMessage = useCallback(() => (action === TRIP_HOLD_STATUS.HOLD ? `Trip ${tripId} has not been put on hold` : `Hold for trip ${tripId} has not been removed`
    ), [action, tripId]);

    const handleAction = useCallback(() => {
        setHasUpdateBeenTriggered(true);
        props.bulkUpdateTripsOnHold([trip], getSuccessMessage(), getErrorMessage(), action === TRIP_HOLD_STATUS.HOLD);
    }, [props.bulkUpdateTripsOnHold, trip, getSuccessMessage, getErrorMessage, action]);

    const handleClose = useCallback(() => {
        onClose();
        setHasUpdateBeenTriggered(false);
    }, [onClose]);

    useEffect(() => {
        if (hasUpdatingFinished) {
            handleClose();
        }
    }, [hasUpdatingFinished, handleClose]);

    return (
        <CustomModal
            onClose={ handleClose }
            isModalOpen={ isModalOpen }
            className="update-trip-hold-modal"
            title={ `${actionLabel} trip` }
            okButton={ {
                onClick: handleAction,
                isDisabled: isUpdatingOngoing,
                label: `${actionLabel} trip`,
                className: 'update-trip-hold-modal__ok-btn',
            } }
        >
            <div className="my-2 py-2 text-center">
                <div className="text-warning w-100 m-2">
                    <FaExclamationTriangle size={ 40 } />
                </div>
                <div className="mb-2">
                    Are you sure you want to
                    {' '}
                    <strong>{action}</strong>
                    {' '}
                    the following trip?
                </div>
            </div>

            <Table className="table">
                <thead>
                    <tr>
                        <th>Route variant</th>
                        <th>Start time</th>
                        <th>Route variant name</th>
                    </tr>
                </thead>
                <tbody>
                    <tr key={ tripId }>
                        <td>{routeVariantId}</td>
                        <td>{startTime}</td>
                        <td>{routeLongName}</td>
                    </tr>
                </tbody>
            </Table>
        </CustomModal>
    );
});

UpdateTripHoldModal.propTypes = {
    isModalOpen: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    action: PropTypes.oneOf([TRIP_HOLD_STATUS.HOLD, TRIP_HOLD_STATUS.RELEASE]).isRequired,
    trip: PropTypes.shape({
        tripId: PropTypes.string,
        routeVariantId: PropTypes.string,
        startTime: PropTypes.string,
        routeLongName: PropTypes.string,
    }).isRequired,
    bulkUpdateTripsOnHold: PropTypes.func.isRequired,
    actionLoadingStatesByTripId: PropTypes.object.isRequired,
};

UpdateTripHoldModal.defaultProps = {
    isModalOpen: false,
};

export default connect(
    state => ({
        actionLoadingStatesByTripId: getTripInstancesActionLoading(state),
    }),
    { bulkUpdateTripsOnHold },
)(UpdateTripHoldModal);
