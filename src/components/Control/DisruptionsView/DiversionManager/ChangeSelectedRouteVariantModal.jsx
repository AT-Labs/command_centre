import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

const ChangeSelectedRouteVariantModal = (props) => {
    const description = 'By selecting another route variant as the base shape, this diversion will be reset.';
    return (
        <div className="add-diversion__change-selected-route-variant-modal">
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
                        aria-label="Confirm"
                        onClick={ props.onConfirmation }>
                        Confirm
                    </Button>
                </div>
            </footer>
        </div>
    );
};

ChangeSelectedRouteVariantModal.propTypes = {
    onConfirmation: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default ChangeSelectedRouteVariantModal;
