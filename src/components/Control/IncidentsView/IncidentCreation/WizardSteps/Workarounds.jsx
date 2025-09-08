import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Input, Label } from 'reactstrap';
import { isWorkaroundPanelOpen, getDisruptionKeyToWorkaroundEdit, getEditMode } from '../../../../../redux/selectors/control/incidents';
import { toggleIncidentModals,
    updateCurrentStep,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
    setDisruptionForWorkaroundEdit,
} from '../../../../../redux/actions/control/incidents';
import Footer from './Footer';
import { useDraftDisruptions } from '../../../../../redux/selectors/appSettings';
import { useAlertEffects } from '../../../../../utils/control/alert-cause-effect';
import EDIT_TYPE from '../../../../../types/edit-types';
import { STATUSES } from '../../../../../types/disruptions-types';

export const Workarounds = (props) => {
    const disruptions = props.editMode !== EDIT_TYPE.ADD_EFFECT ? props.data.disruptions : [props.newIncidentEffect];
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filteredDisruptions, setFilteredDisruptions] = useState(disruptions || []);
    const onContinue = () => {
        if (props.editMode !== EDIT_TYPE.ADD_EFFECT) {
            props.onStepUpdate(3);
            props.updateCurrentStep(1);
            props.onSubmit();
        } else {
            props.onSubmitUpdate();
        }
    };

    const onSaveDraft = () => {
        if (props.editMode !== EDIT_TYPE.ADD_EFFECT) {
            props.onStepUpdate(3);
            props.onSubmitDraft();
        } else {
            props.onSubmitUpdate();
        }
    };

    const onBack = () => {
        if (props.editMode !== EDIT_TYPE.ADD_EFFECT) {
            props.onStepUpdate(1);
            props.updateCurrentStep(2);
        } else {
            props.onStepUpdate(0);
            props.updateCurrentStep(2);
        }
        props.toggleWorkaroundPanel(false);
    };

    const openWorkaroundPanel = (disruption) => {
        if (props.editMode === EDIT_TYPE.ADD_EFFECT) {
            props.setDisruptionForWorkaroundEdit(disruption);
        }
        props.updateDisruptionKeyToWorkaroundEdit(disruption.key);
        props.toggleWorkaroundPanel(true);
    };

    const impacts = useAlertEffects();

    const getImpactLabel = (value) => {
        const impact = impacts.find(i => i.value === value);
        return impact ? impact.label : value;
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        const term = debouncedSearchTerm.toLowerCase();
        const filtered = disruptions.filter(d => d.impact?.toLowerCase().includes(term)
            || d.affectedEntities?.affectedRoutes?.some(route => route.routeShortName.toLowerCase().includes(term))
            || d.affectedEntities?.affectedStops?.some(stop => stop.text.toLowerCase().includes(term)));
        setFilteredDisruptions(filtered);
    }, [debouncedSearchTerm]);

    useEffect(() => {
        if (props.editMode === EDIT_TYPE.ADD_EFFECT) {
            const term = debouncedSearchTerm.toLowerCase();
            const filtered = [props.newIncidentEffect].filter(d => d.impact?.toLowerCase().includes(term)
                || d.affectedEntities?.affectedRoutes?.some(route => route.routeShortName.toLowerCase().includes(term))
                || d.affectedEntities?.affectedStops?.some(stop => stop.text.toLowerCase().includes(term)));
            setFilteredDisruptions(filtered);
        }
    }, [props.newIncidentEffect]);

    const getNextButton = () => {
        if (props.editMode === EDIT_TYPE.ADD_EFFECT && props.incidentStatus === STATUSES.DRAFT) {
            return 'Save draft';
        }
        return props.editMode !== EDIT_TYPE.ADD_EFFECT ? 'Save' : 'Finish';
    };

    const isSubmitDisabled = props.useDraftDisruptions ? (props.isFinishDisabled && props.editMode !== EDIT_TYPE.ADD_EFFECT) : false;

    return (
        <div>
            <div className="ml-4 mr-4 ">
                <p>Select an effect on the list below to view and manage the Workarounds and Notifications</p>
                <ul className="pl-0 disruption-workarounds-effects">
                    <div>
                        <Label for="disruption-creation__wizard-select-details__header" className="p-lr12-tb6">
                            <span className="font-size-md font-weight-bold">Effects</span>
                        </Label>
                        <Input
                            id="disruption-creation__wizard-select-details__header"
                            className="w-100 workaround-search-input p-lr12-tb6"
                            placeholder="Effects, affected routes and stops"
                            maxLength={ 20 }
                            onChange={ event => setSearchTerm(event.target.value) }
                            value={ searchTerm }
                        />
                    </div>
                    {filteredDisruptions.map(disruption => (
                        <li key={ disruption.key } className={ `disruption-effect-item ${props.disruptionKeyToEdit === disruption.key ? 'active' : ''}` }>
                            <Button
                                className="btn cc-btn-link p-lr12-tb6 m-0"
                                onClick={ () => openWorkaroundPanel(disruption) }>
                                <strong>{getImpactLabel(disruption.impact)}</strong>
                            </Button>
                            {disruption.affectedEntities.affectedRoutes && disruption.affectedEntities.affectedRoutes.length > 0 && (
                                disruption.affectedEntities.affectedRoutes.filter((item, index, self) => index === self.findIndex(i => i.routeShortName === item.routeShortName))
                                    .map(route => (
                                        <p className="p-lr12-tb6 m-0 disruption-effect-item-route" key={ `${disruption.key}_${route.routeId}` }>
                                            Route -
                                            {' '}
                                            {route.routeShortName}
                                        </p>
                                    ))
                            )}
                            {disruption.affectedEntities.affectedStops && disruption.affectedEntities.affectedStops.length > 0 && (
                                disruption.affectedEntities.affectedStops.filter((item, index, self) => index === self.findIndex(i => i.stopId === item.stopId))
                                    .map(stop => (
                                        <p className="p-lr12-tb6 m-0 disruption-effect-item-stop" key={ `${disruption.key}_${stop.stopId}` }>
                                            Stop -
                                            {' '}
                                            {stop.text}
                                        </p>
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
                nextButtonValue={ getNextButton() }
                isDraftOrCreateMode={ props.editMode !== EDIT_TYPE.ADD_EFFECT }
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
    isFinishDisabled: PropTypes.bool,
    useDraftDisruptions: PropTypes.bool,
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    updateDisruptionKeyToWorkaroundEdit: PropTypes.func.isRequired,
    isWorkaroundPanelOpen: PropTypes.bool,
    disruptionKeyToEdit: PropTypes.string,
    editMode: PropTypes.string,
    newIncidentEffect: PropTypes.object,
    setDisruptionForWorkaroundEdit: PropTypes.func.isRequired,
    incidentStatus: PropTypes.string,
};

Workarounds.defaultProps = {
    data: {},
    onStepUpdate: () => { /**/ },
    onSubmitDraft: () => { /**/ },
    onSubmit: () => { /**/ },
    updateCurrentStep: () => { /**/ },
    isFinishDisabled: false,
    useDraftDisruptions: false,
    isWorkaroundPanelOpen: false,
    disruptionKeyToEdit: '',
    editMode: EDIT_TYPE.CREATE,
    newIncidentEffect: {},
    incidentStatus: STATUSES.NOT_STARTED,
};

export default connect(state => ({
    useDraftDisruptions: useDraftDisruptions(state),
    isWorkaroundPanelOpen: isWorkaroundPanelOpen(state),
    disruptionKeyToEdit: getDisruptionKeyToWorkaroundEdit(state),
    editMode: getEditMode(state),
}), { toggleIncidentModals, updateCurrentStep, toggleWorkaroundPanel, updateDisruptionKeyToWorkaroundEdit, setDisruptionForWorkaroundEdit })(Workarounds);
