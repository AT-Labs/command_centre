import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

const ChangeSelectedTripModal = props => (
    <div className="add-trip__change-selected-trip-modal">
        <div className="row">
            <div className="col text-center">
                <div>
                    <span className="d-block mt-3 mb-2">By selecting another trip, all changes applied in current trip will be lost.</span>
                </div>
            </div>
        </div>
        <footer className="row justify-content-between mt-3">
            <div className="col-5">
                <Button
                    aria-label="Cancel"
                    className="btn btn-block cc-btn-secondary"
                    onClick={ props.onCancel }>
                    Cancel
                </Button>
            </div>
            <div className="col-5">
                <Button
                    className="btn btn-block cc-btn-primary btn-block"
                    aria-label="Select another trip"
                    onClick={ props.onConfirmation }>
                    Select another trip
                </Button>
            </div>
        </footer>
    </div>
);

ChangeSelectedTripModal.propTypes = {
    onConfirmation: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ChangeSelectedTripModal;
