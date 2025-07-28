import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import { toggleIncidentModals,
    openCreateIncident,
    deleteAffectedEntities,
    toggleEditEffectPanel,
    updateDisruptionKeyToEditEffect,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
    setRequestedDisruptionKeyToUpdateEditEffect,
    setRequestToUpdateEditEffectState,
} from '../../../../../redux/actions/control/incidents';
import { getRequestedDisruptionKeyToUpdateEditEffect } from '../../../../../redux/selectors/control/incidents';
import { isModalOpen } from '../../../../../redux/selectors/activity';

const CancellationEffect = (props) => {
    const discardChanges = () => {
        if (props.newDisruptionKeyToUpdateEditEffect === '') { // discard change and close edit effect panel
            props.toggleWorkaroundPanel(false);
            props.toggleEditEffectPanel(false);
        }
        props.updateDisruptionKeyToEditEffect(props.newDisruptionKeyToUpdateEditEffect);
        props.updateDisruptionKeyToWorkaroundEdit(props.newDisruptionKeyToUpdateEditEffect);
        props.setRequestedDisruptionKeyToUpdateEditEffect('');
        props.setRequestToUpdateEditEffectState(false);
        props.toggleIncidentModals('isCancellationEffectOpen', false);
    };

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
                        onClick={ () => { discardChanges(); } }>
                        Discard changes
                    </Button>
                </div>
            </footer>
        </div>
    );
};

CancellationEffect.propTypes = {
    toggleIncidentModals: PropTypes.func.isRequired,
    toggleEditEffectPanel: PropTypes.func.isRequired,
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    updateDisruptionKeyToEditEffect: PropTypes.func.isRequired,
    updateDisruptionKeyToWorkaroundEdit: PropTypes.func.isRequired,
    newDisruptionKeyToUpdateEditEffect: PropTypes.string.isRequired,
    setRequestToUpdateEditEffectState: PropTypes.func.isRequired,
    setRequestedDisruptionKeyToUpdateEditEffect: PropTypes.func.isRequired,
};

export default connect(state => ({
    isModalOpen: isModalOpen(state),
    newDisruptionKeyToUpdateEditEffect: getRequestedDisruptionKeyToUpdateEditEffect(state),
}), { toggleIncidentModals,
    openCreateIncident,
    deleteAffectedEntities,
    toggleEditEffectPanel,
    updateDisruptionKeyToEditEffect,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
    setRequestToUpdateEditEffectState,
    setRequestedDisruptionKeyToUpdateEditEffect,
})(CancellationEffect);
