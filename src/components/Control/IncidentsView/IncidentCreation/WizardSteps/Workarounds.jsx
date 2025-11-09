import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, Input, Label } from 'reactstrap';
import { groupBy, uniqBy } from 'lodash-es';
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
import { DIRECTIONS } from '../../types';

export const Workarounds = (props) => {
    const disruptions = useMemo(() => (
        props.editMode !== EDIT_TYPE.ADD_EFFECT ? props.data.disruptions : [props.newIncidentEffect]
    ), [props.editMode, props.data.disruptions, props.newIncidentEffect]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [filteredDisruptions, setFilteredDisruptions] = useState(disruptions || []);
    const onContinue = () => {
        if (props.editMode !== EDIT_TYPE.ADD_EFFECT) {
            props.onSubmit();
        } else {
            props.onSubmitUpdate();
        }
    };

    const onSaveDraft = () => {
        if (props.editMode !== EDIT_TYPE.ADD_EFFECT) {
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
        props.updateDisruptionKeyToWorkaroundEdit('');
        props.setDisruptionForWorkaroundEdit({});
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

    const getStopsUnderRoute = useCallback((route, affectedEntities) => {
        const stopsFromRoutes = affectedEntities.affectedRoutes
            .filter(item => item.routeId === route.routeId && item.stopCode && item.routeShortName === route.routeShortName);
        const stopsFromStops = (affectedEntities.affectedStops || [])
            .filter(item => item.routeId === route.routeId && item.stopCode);
        return uniqBy(
            [...stopsFromRoutes, ...stopsFromStops],
            item => `${item.stopCode}_${item.directionId || ''}`,
        );
    }, []);

    const getRoutesUnderStop = useCallback((stop, affectedEntities) => {
        const routesFromStops = affectedEntities.affectedStops
            .filter(item => item.stopCode === stop.stopCode && item.routeId && item.stopId === stop.stopId);
        const routesFromRoutes = (affectedEntities.affectedRoutes || [])
            .filter(item => item.stopCode === stop.stopCode && item.routeId);
        return uniqBy([...routesFromStops, ...routesFromRoutes], 'routeId');
    }, []);

    const renderRouteWithStops = useCallback((route, disruptionKey, affectedEntities) => {
        const allStopsUnderRoute = getStopsUnderRoute(route, affectedEntities);
        const stopsByDirection = groupBy(allStopsUnderRoute.filter(stop => stop.directionId !== undefined), 'directionId');
        return (
            <React.Fragment key={ `${disruptionKey}_${route.routeId || route.routeShortName}` }>
                <p className="p-lr12-tb6 m-0 disruption-effect-item-route">
                    Route -
                    {' '}
                    {route.routeShortName}
                </p>
                {Object.keys(stopsByDirection).length > 0 && Object.keys(stopsByDirection).map(directionId => (
                    <p className="p-lr12-tb6 m-0 disruption-effect-item-stop pl-4 font-size-sm" key={ `${disruptionKey}_${route.routeId || route.routeShortName}_${directionId}` }>
                        Stops
                        {' '}
                        {DIRECTIONS[directionId] || `Direction ${directionId}`}
                        :
                        {' '}
                        {stopsByDirection[directionId].map(stop => stop.stopCode).join(', ')}
                    </p>
                ))}
            </React.Fragment>
        );
    }, [getStopsUnderRoute]);

    const renderStopWithRoutes = useCallback((stop, disruptionKey, affectedEntities) => {
        const allRoutesUnderStop = getRoutesUnderStop(stop, affectedEntities);
        return (
            <React.Fragment key={ `${disruptionKey}_${stop.stopId}` }>
                <p className="p-lr12-tb6 m-0 disruption-effect-item-stop">
                    Stop -
                    {' '}
                    {stop.text}
                </p>
                {allRoutesUnderStop.length > 0 && (
                    <p className="p-lr12-tb6 m-0 disruption-effect-item-route pl-4 font-size-sm" key={ `${disruptionKey}_${stop.stopId}_routes` }>
                        Route:
                        {' '}
                        {allRoutesUnderStop.map(route => route.routeShortName).join(', ')}
                    </p>
                )}
            </React.Fragment>
        );
    }, [getRoutesUnderStop]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 1000);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const filteredDisruptionsMemo = useMemo(() => {
        if (!disruptions) {
            return [];
        }
        const term = debouncedSearchTerm.toLowerCase();
        return disruptions.filter(d => d.impact?.toLowerCase().includes(term)
            || d.affectedEntities?.affectedRoutes?.some(route => route.routeShortName.toLowerCase().includes(term))
            || d.affectedEntities?.affectedStops?.some(stop => stop.text.toLowerCase().includes(term)));
    }, [debouncedSearchTerm, disruptions]);

    useEffect(() => {
        setFilteredDisruptions(filteredDisruptionsMemo);
    }, [filteredDisruptionsMemo]);

    const getNextButton = () => {
        if (props.editMode === EDIT_TYPE.ADD_EFFECT && props.incidentStatus === STATUSES.DRAFT) {
            return 'Save draft';
        }
        return props.editMode !== EDIT_TYPE.ADD_EFFECT ? 'Finish' : 'Save';
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
                            <p className="p-lr12-tb6 m-0 bold-text">{disruption.header}</p>
                            <Button
                                className="btn cc-btn-link p-lr12-tb6 m-0 effect-link-btn"
                                onClick={ () => openWorkaroundPanel(disruption) }>
                                <strong>{getImpactLabel(disruption.impact)}</strong>
                            </Button>
                            {disruption.affectedEntities.affectedRoutes && disruption.affectedEntities.affectedRoutes.length > 0 && (
                                disruption.affectedEntities.affectedRoutes
                                    .filter((item, index, self) => index === self.findIndex(i => i.routeShortName === item.routeShortName))
                                    .map(route => renderRouteWithStops(route, disruption.key, disruption.affectedEntities))
                            )}
                            {disruption.affectedEntities.affectedStops && disruption.affectedEntities.affectedStops.length > 0 && (
                                disruption.affectedEntities.affectedStops
                                    .filter((item, index, self) => index === self.findIndex(i => i.stopId === item.stopId))
                                    .map(stop => renderStopWithRoutes(stop, disruption.key, disruption.affectedEntities))
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
