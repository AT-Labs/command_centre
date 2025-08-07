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
    setDisruptionForWorkaroundEdit,
} from '../../../../../redux/actions/control/incidents';
import { isModalOpen } from '../../../../../redux/selectors/activity';

const Cancellation = (props) => {
    const closeCreateIncident = () => {
        props.openCreateIncident(false);
        props.deleteAffectedEntities();
        props.toggleIncidentModals('isCancellationOpen', false);
        props.toggleWorkaroundPanel(false);
        props.updateDisruptionKeyToWorkaroundEdit('');
        props.toggleEditEffectPanel(false);
        props.updateDisruptionKeyToEditEffect('');
        props.setDisruptionForWorkaroundEdit({});
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
                        onClick={ () => props.toggleIncidentModals('isCancellationOpen', false) }>
                        Keep editing
                    </Button>
                </div>
                <div className="col-5">
                    <Button
                        className="btn cc-btn-primary btn-block"
                        onClick={ () => { closeCreateIncident(); } }>
                        Discard changes
                    </Button>
                </div>
            </footer>
        </div>
    );
};

Cancellation.propTypes = {
    toggleIncidentModals: PropTypes.func.isRequired,
    openCreateIncident: PropTypes.func.isRequired,
    deleteAffectedEntities: PropTypes.func.isRequired,
    toggleEditEffectPanel: PropTypes.func.isRequired,
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    updateDisruptionKeyToEditEffect: PropTypes.func.isRequired,
    updateDisruptionKeyToWorkaroundEdit: PropTypes.func.isRequired,
    setDisruptionForWorkaroundEdit: PropTypes.func.isRequired,
};

export default connect(state => ({
    isModalOpen: isModalOpen(state),
}), { toggleIncidentModals,
    openCreateIncident,
    deleteAffectedEntities,
    toggleEditEffectPanel,
    updateDisruptionKeyToEditEffect,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
    setDisruptionForWorkaroundEdit,
})(Cancellation);
