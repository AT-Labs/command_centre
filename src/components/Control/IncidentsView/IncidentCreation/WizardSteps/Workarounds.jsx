import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { isEditEnabled, isWorkaroundPanelOpen } from '../../../../../redux/selectors/control/incidents';
import { toggleIncidentModals, updateCurrentStep, toggleWorkaroundPanel, updateDisruptionKeyToWorkaroundEdit } from '../../../../../redux/actions/control/incidents';
import Footer from './Footer';
import { useDraftDisruptions } from '../../../../../redux/selectors/appSettings';
import { useAlertEffects } from '../../../../../utils/control/alert-cause-effect';

export const Workarounds = (props) => {
    const { disruptions } = props.data;
    const onContinue = () => {
        if (!props.isEditMode) {
            props.onStepUpdate(3);
            props.updateCurrentStep(1);
            props.onSubmit();
        } else {
            props.onSubmitUpdate();
        }
    };

    const onSaveDraft = () => {
        if (!props.isEditMode) {
            props.onStepUpdate(3);
            props.onSubmitDraft();
        } else {
            props.onSubmitUpdate();
        }
    };

    const onBack = () => {
        if (!props.isEditMode) {
            props.onStepUpdate(1);
            props.updateCurrentStep(2);
        } else {
            props.onStepUpdate(0);
            props.updateCurrentStep(2);
        }
        props.toggleWorkaroundPanel(false);
    };

    const openWorkaroundPanel = (disruption) => {
        props.updateDisruptionKeyToWorkaroundEdit(disruption.key);
        props.toggleWorkaroundPanel(true);
    };

    const impacts = useAlertEffects();

    const getImpactLabel = (value) => {
        const impact = impacts.find(i => i.value === value);
        return impact ? impact.label : value;
    };

    const isSubmitDisabled = props.useDraftDisruptions ? (props.isFinishDisabled && !props.isEditMode) : false;

    return (
        <div>
            {/* <WorkaroundsForm disruption={ props.data } onDataUpdate={ props.onDataUpdate } /> */}
            <div className="ml-4 mr-4 ">
                <p>Select an effect on the list below to view and manage the Workarounds and Notifications</p>
                <ul className="pl-0 disruption-workarounds-effects">
                    {disruptions.map(disruption => (
                        <li key={ disruption.key } className="disruption-effect-item">
                            <Button
                                className="btn cc-btn-link p-1 m-0"
                                onClick={ () => openWorkaroundPanel(disruption) }>
                                {disruption.key}
                            </Button>
                            <p className="p-1 m-0"><strong>{getImpactLabel(disruption.impact)}</strong></p>
                            {disruption.affectedEntities.affectedRoutes && disruption.affectedEntities.affectedRoutes.length > 0 && (
                                disruption.affectedEntities.affectedRoutes.map(route => (
                                    <p className="p-1 m-0" key={ `${disruption.id}_${route.routeId}` }>Route - {route.routeShortName}</p>
                                ))
                            )}
                            {disruption.affectedEntities.affectedStops && disruption.affectedEntities.affectedStops.length > 0 && (
                                disruption.affectedEntities.affectedStops.map(stop => (
                                    <p className="p-1 m-0" key={ `${disruption.id}_${stop.stopId}` }>Stop {stop.text}</p>
                                ))
                            )}
                        </li>
                    ))}
                </ul>
            </div>
            <Footer
                updateCurrentStep={ props.updateCurrentStep }
                onStepUpdate={ props.onStepUpdate }
                toggleIncidentModals={ props.toggleIncidentModals }
                isSubmitDisabled={ isSubmitDisabled || props.isWorkaroundPanelOpen }
                nextButtonValue={ props.isEditMode ? 'Save' : 'Finish' }
                isDraftOrCreateMode={ !props.isEditMode }
                onContinue={ () => onContinue() }
                onSubmitDraft={ () => onSaveDraft() }
                onBack={ () => onBack() } />
        </div>
    );
};

Workarounds.propTypes = {
    data: PropTypes.object,
    onStepUpdate: PropTypes.func,
    onSubmit: PropTypes.func,
    onSubmitDraft: PropTypes.func,
    toggleIncidentModals: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func,
    onSubmitUpdate: PropTypes.func.isRequired,
    isEditMode: PropTypes.bool,
    isFinishDisabled: PropTypes.bool,
    useDraftDisruptions: PropTypes.bool,
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    updateDisruptionKeyToWorkaroundEdit: PropTypes.func.isRequired,
    isWorkaroundPanelOpen: PropTypes.bool,
};

Workarounds.defaultProps = {
    data: {},
    onStepUpdate: () => { /**/ },
    onSubmitDraft: () => { /**/ },
    onSubmit: () => { /**/ },
    updateCurrentStep: () => { /**/ },
    isEditMode: false,
    isFinishDisabled: false,
    useDraftDisruptions: false,
    isWorkaroundPanelOpen: false,
};

export default connect(state => ({
    isEditMode: isEditEnabled(state),
    useDraftDisruptions: useDraftDisruptions(state),
    isWorkaroundPanelOpen: isWorkaroundPanelOpen(state),
}), { toggleIncidentModals, updateCurrentStep, toggleWorkaroundPanel, updateDisruptionKeyToWorkaroundEdit })(Workarounds);
