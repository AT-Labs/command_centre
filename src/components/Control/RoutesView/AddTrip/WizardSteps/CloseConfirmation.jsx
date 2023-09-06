import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import { updateEnabledAddTripModal, updateSelectedAddTrip } from '../../../../../redux/actions/control/routes/trip-instances';

const CloseConfirmation = props => (
    <div className="add-trip__wizard-close-modal-confirmation">
        <div className="row">
            <div className="col text-center">
                <h2>Are you sure you want to close?</h2>
                <div>
                    <span className="d-block mt-3 mb-2">Any information entered will not be saved.</span>
                </div>
            </div>
        </div>
        <footer className="row justify-content-between mt-3">
            <div className="col-5">
                <Button
                    aria-label="Keep editing"
                    className="btn btn-block cc-btn-secondary"
                    onClick={ props.onCloseConfirmation }>
                    Keep editing
                </Button>
            </div>
            <div className="col-5">
                <Button
                    className="btn btn-block cc-btn-primary btn-block"
                    aria-label="Discard changes"
                    onClick={ () => {
                        props.updateEnabledAddTripModal(false);
                        props.updateSelectedAddTrip(null);
                    } }>
                    Discard changes
                </Button>
            </div>
        </footer>
    </div>
);

CloseConfirmation.propTypes = {
    updateEnabledAddTripModal: PropTypes.func.isRequired,
    updateSelectedAddTrip: PropTypes.func.isRequired,
    onCloseConfirmation: PropTypes.func,
};

CloseConfirmation.defaultProps = {
    onCloseConfirmation: () => {},
};

export default connect(
    null,
    {
        updateEnabledAddTripModal, updateSelectedAddTrip,
    },
)(CloseConfirmation);
