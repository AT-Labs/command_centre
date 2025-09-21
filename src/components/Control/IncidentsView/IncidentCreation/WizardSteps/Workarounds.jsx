import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Input, Label } from 'reactstrap';
import { isEditEnabled, isWorkaroundPanelOpen, getDisruptionKeyToWorkaroundEdit } from '../../../../../redux/selectors/control/incidents';
import { toggleIncidentModals, updateCurrentStep, toggleWorkaroundPanel, updateDisruptionKeyToWorkaroundEdit } from '../../../../../redux/actions/control/incidents';
import Footer from './Footer';
import { useDraftDisruptions } from '../../../../../redux/selectors/appSettings';
import { useAlertEffects } from '../../../../../utils/control/alert-cause-effect';

export const Workarounds = (props) => {
    const { disruptions } = props.data;
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filteredDisruptions, setFilteredDisruptions] = useState(disruptions || []);
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

    const isSubmitDisabled = props.useDraftDisruptions ? (props.isFinishDisabled && !props.isEditMode) : false;

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
                toggleModals={ props.toggleIncidentModals }
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
    disruptionKeyToEdit: PropTypes.string,
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
    disruptionKeyToEdit: '',
};

export default connect(state => ({
    isEditMode: isEditEnabled(state),
    useDraftDisruptions: useDraftDisruptions(state),
    isWorkaroundPanelOpen: isWorkaroundPanelOpen(state),
    disruptionKeyToEdit: getDisruptionKeyToWorkaroundEdit(state),
}), { toggleIncidentModals, updateCurrentStep, toggleWorkaroundPanel, updateDisruptionKeyToWorkaroundEdit })(Workarounds);
