import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import { toggleIncidentModals,
} from '../../../../../redux/actions/control/incidents';
import { isModalOpen } from '../../../../../redux/selectors/activity';

const ApplyChangesModal = (props) => {
    const keepEditing = () => {
        props.toggleIncidentModals('isPublishAndApplyChangesOpen', false);
    };

    return (

        <div className="disruption-creation__wizard-confirmation">
            <div className="row">
                <div className="col 'd-flex justify-content-center'">
                    <h2>Are you sure you want to apply and publish these disruption changes?</h2>
                    <div>
                        <span className="d-block mt-3 mb-2">Changes will only take effect once applied.</span>
                    </div>
                </div>
            </div>
            <footer className="row justify-content-between mt-3">
                <div className="col-5">
                    <Button
                        className="btn cc-btn-secondary btn-block"
                        onClick={ () => { keepEditing(); } }>
                        Keep editing
                    </Button>
                </div>
                <div className="col-5">
                    <Button
                        className="btn cc-btn-primary btn-block"
                        onClick={ () => { props.publishIncidentChanges(); } }>
                        Apply and Publish
                    </Button>
                </div>
            </footer>
        </div>
    );
};

ApplyChangesModal.propTypes = {
    toggleIncidentModals: PropTypes.func.isRequired,
    publishIncidentChanges: PropTypes.func.isRequired,
};

export default connect(state => ({
    isModalOpen: isModalOpen(state),
}), { toggleIncidentModals,
})(ApplyChangesModal);
