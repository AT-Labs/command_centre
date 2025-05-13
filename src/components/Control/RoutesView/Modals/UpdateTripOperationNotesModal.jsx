import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { every, isEmpty } from 'lodash-es';
import { Input } from 'reactstrap';

import CustomModal from '../../../Common/CustomModal/CustomModal';
import { bulkUpdateTripsOperationNotes } from '../../../../redux/actions/control/routes/trip-instances';
import { getTripInstancesActionLoading } from '../../../../redux/selectors/control/routes/trip-instances';
import { TRIP_OPERATION_NOTES_MAX_LENGTH } from '../../../../constants/trips';

const UpdateTripOperationNotesModal = React.memo((props) => {
    const { trip, isModalOpen, onClose, actionLoadingStatesByTripId } = props;

    const isTripUpdating = useMemo(
        () => !isEmpty(actionLoadingStatesByTripId) && every(actionLoadingStatesByTripId, value => value === true),
        [actionLoadingStatesByTripId],
    );
    const [operationNotes, setOperationNotes] = useState(trip.operationNotes);
    const [hasUpdateBeenTriggered, setHasUpdateBeenTriggered] = useState(false);
    const isUpdatingOngoing = hasUpdateBeenTriggered && isTripUpdating;
    const hasUpdatingFinished = hasUpdateBeenTriggered && !isTripUpdating;

    const handleAction = useCallback(() => {
        setHasUpdateBeenTriggered(true);
        props.bulkUpdateTripsOperationNotes([trip], 'Operation notes were successfully saved', 'Updating the operation notes has failed.', operationNotes);
    }, [props.bulkUpdateTripsOperationNotes, trip, operationNotes]);

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
            className="update-trip-operation-notes-modal"
            title="Operation Notes(optional)"
            okButton={ {
                onClick: handleAction,
                isDisabled: isUpdatingOngoing,
                label: 'Save',
                className: 'update-trip-operation-notes-modal__ok-btn',
            } }
        >
            <div className="my-2 py-2 text-center">
                <Input id="disruption-detail__notes"
                    className="textarea-no-resize border border-dark"
                    placeholder="Enter operation notes here"
                    type="textarea"
                    value={ operationNotes }
                    onChange={ e => setOperationNotes(e.currentTarget.value) }
                    maxLength={ TRIP_OPERATION_NOTES_MAX_LENGTH }
                    rows={ 5 } />
                <span className="text-muted font-size-sm font-weight-light">
                    The maximum length is
                    {' '}
                    {TRIP_OPERATION_NOTES_MAX_LENGTH}
                    {' '}
                    characters.
                </span>
            </div>
        </CustomModal>
    );
});

UpdateTripOperationNotesModal.propTypes = {
    isModalOpen: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    trip: PropTypes.shape({
        tripId: PropTypes.string,
        routeVariantId: PropTypes.string,
        startTime: PropTypes.string,
        routeLongName: PropTypes.string,
        operationNotes: PropTypes.string,
    }).isRequired,
    bulkUpdateTripsOperationNotes: PropTypes.func.isRequired,
    actionLoadingStatesByTripId: PropTypes.object.isRequired,
};

UpdateTripOperationNotesModal.defaultProps = {
    isModalOpen: false,
};

export default connect(
    state => ({
        actionLoadingStatesByTripId: getTripInstancesActionLoading(state),
    }),
    { bulkUpdateTripsOperationNotes },
)(UpdateTripOperationNotesModal);
