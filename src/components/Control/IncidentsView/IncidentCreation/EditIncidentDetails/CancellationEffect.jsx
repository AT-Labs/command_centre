import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import { toggleIncidentModals,
    setRequestedDisruptionKeyToUpdateEditEffect,
    setRequestToUpdateEditEffectState,
} from '../../../../../redux/actions/control/incidents';
import { isModalOpen } from '../../../../../redux/selectors/activity';

const CancellationEffect = (props) => {
    const keepEditing = () => {
        props.setRequestedDisruptionKeyToUpdateEditEffect('');
        props.setRequestToUpdateEditEffectState(false);
        props.toggleIncidentModals('isCancellationEffectOpen', false);
    };

    return (

        <div className="disruption-creation__wizard-confirmation">
            <div className="row">
                <div className="col 'd-flex justify-content-center'">
                    <h2>Are you sure you want to close?</h2>
                    <div>
                        <span className="d-block mt-3 mb-2">Any information entered will not be saved.</span>
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
                        onClick={ () => { props.discardChanges(); } }>
                        Discard changes
                    </Button>
                </div>
            </footer>
        </div>
    );
};

CancellationEffect.propTypes = {
    toggleIncidentModals: PropTypes.func.isRequired,
    setRequestToUpdateEditEffectState: PropTypes.func.isRequired,
    setRequestedDisruptionKeyToUpdateEditEffect: PropTypes.func.isRequired,
    discardChanges: PropTypes.func.isRequired,
};

export default connect(state => ({
    isModalOpen: isModalOpen(state),
}), { toggleIncidentModals,
    setRequestToUpdateEditEffectState,
    setRequestedDisruptionKeyToUpdateEditEffect,
})(CancellationEffect);
