import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

const ChangeSelectedTripModal = (props) => {
    const description = props.changeType === 'View'
        ? 'By changing the view type, all changes applied in current trip will be lost.'
        : 'By selecting another trip, all changes applied in current trip will be lost.';
    const confirmButtonText = props.changeType === 'View'
        ? 'Change View'
        : 'Select another trip';
    return (
        <div className="add-trip__change-selected-trip-modal">
            <div className="row">
                <div className="col text-center">
                    <div>
                        <span className="d-block mt-3 mb-2">
                            { description }
                        </span>
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
                        aria-label={ confirmButtonText }
                        onClick={ props.onConfirmation }>
                        { confirmButtonText }
                    </Button>
                </div>
            </footer>
        </div>
    );
};

ChangeSelectedTripModal.propTypes = {
    onConfirmation: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
    changeType: PropTypes.string.isRequired,
};

export default ChangeSelectedTripModal;
