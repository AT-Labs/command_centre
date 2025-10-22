import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';

const CreateDiversionWithoutMergeModal = (props) => {
    const description = 'The automatic generated detour has not been saved.'
        + ' To save the auto-generated detour please click "Apply auto-generation" in the map before proceeding with diversion creation or modification.'
        + ' Do you wish to create or update the diversion and discard the automatic generated detour?';
    return (
        <div className="add-diversion__create-diversion-without-merge-modal">
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

CreateDiversionWithoutMergeModal.propTypes = {
    onConfirmation: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
};

export default CreateDiversionWithoutMergeModal;
