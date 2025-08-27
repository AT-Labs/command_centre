import React from 'react';

import { isEmpty, uniqBy, sortBy } from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import { AiOutlineClose } from 'react-icons/ai';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { RRule } from 'rrule';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { DATE_FORMAT, TIME_FORMAT } from '../../../../../constants/disruptions';
import {
    createNewIncident,
    openCreateIncident,
    toggleIncidentModals,
    updateCurrentStep,
    updateIncident,
    searchByDrawing,
    updateAffectedStopsState,
    setRequireToUpdateIncidentForEditState,
    getRoutesByShortName,
    updateAffectedRoutesState,
    setRequestToUpdateEditEffectState,
    setRequestedDisruptionKeyToUpdateEditEffect,
    toggleEditEffectPanel,
    toggleWorkaroundPanel,
    updateDisruptionKeyToEditEffect,
    updateDisruptionKeyToWorkaroundEdit,
} from '../../../../../redux/actions/control/incidents';
import {
    getAffectedRoutes,
    getAffectedStops,
    getIncidentAction,
    getIncidentStepCreation,
    getIncidentToEdit,
    getRouteColors,
    getShapes,
    getEditMode,
    isIncidentCancellationModalOpen,
    isIncidentCreationOpen,
    getBoundsToFit,
    getIncidentsLoadingState,
    isEditEffectPanelOpen,
    isRequiresToUpdateNotes,
    getDisruptionKeyToEditEffect,
} from '../../../../../redux/selectors/control/incidents';
import { STATUSES, DISRUPTION_TYPE, INCIDENTS_CREATION_STEPS, DEFAULT_SEVERITY, ALERT_TYPES } from '../../../../../types/disruptions-types';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../../types/disruption-cause-and-effect';
import {
    momentFromDateTime,
    getRecurrenceDates,
    itemToEntityTransformers,
    toCamelCaseKeys,
    generateDisruptionActivePeriods,
    buildIncidentSubmitBody,
} from '../../../../../utils/control/disruptions';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import '../../../../Common/OffCanvasLayout/OffCanvasLayout.scss';
import SidePanel from '../../../../Common/OffCanvasLayout/SidePanel/SidePanel';
import Wizard from '../../../../Common/wizard/Wizard';
import '../styles.scss';

import Cancellation from '../WizardSteps/Cancellation';
import CloseConfirmation from '../WizardSteps/CloseConfirmation';
import Confirmation from '../WizardSteps/Confirmation';
import SelectDetails from '../WizardSteps/SelectDetails';
import SelectEffects from '../WizardSteps/SelectEffects';
import Workarounds from '../WizardSteps/Workarounds';
import {
    parseRecurrencePattern,
} from '../../../../../utils/recurrence';
import EDIT_TYPE from '../../../../../types/edit-types';
import { Map } from '../../../../Common/Map/Map';
import SEARCH_RESULT_TYPE from '../../../../../types/search-result-types';
import { getChildStops } from '../../../../../redux/selectors/static/stops';
import { getStopDetail } from '../../../../../redux/selectors/realtime/detail';
import AlertMessage from '../../../../Common/AlertMessage/AlertMessage';
import { ShapeLayer } from '../../../../Common/Map/ShapeLayer/ShapeLayer';
import StopsLayer from '../../../../Common/Map/StopsLayer/StopsLayer';
import { HighlightingLayer } from '../../../../Common/Map/HighlightingLayer/HighlightingLayer';
import { SelectedStopsMarker } from '../../../../Common/Map/StopsLayer/SelectedStopsMarker';
import DrawLayer from './DrawLayer';
import { usePassengerImpact, useGeoSearchRoutesByDisruptionPeriod, useDraftDisruptions } from '../../../../../redux/selectors/appSettings';
import LoadingOverlay from '../../../../Common/Overlay/LoadingOverlay';
import WorkaroundPanel from '../WizardSteps/WorkaroundPanel';
import EditEffectPanel from '../EditIncidentDetails/EditEffectPanel';
import { openDiversionManager, updateDiversionMode, updateDiversionToEdit } from '../../../../../redux/actions/control/diversions';
import { getIsDiversionManagerOpen } from '../../../../../redux/selectors/control/diversions';
import DiversionManager from '../../../DisruptionsView/DiversionManager';

const INIT_STATE = {
    startTime: '',
    startDate: '',
    endTime: '',
    endDate: '',
    cause: DEFAULT_CAUSE.value,
    activePeriods: [],
    mode: '-',
    status: STATUSES.NOT_STARTED,
    header: '',
    description: '',
    url: '',
    createNotification: false,
    recurrent: false,
    duration: '',
    recurrencePattern: { freq: RRule.WEEKLY },
    disruptionType: DISRUPTION_TYPE.ROUTES,
    severity: DEFAULT_SEVERITY.value,

    notes: '',
    disruptions: [],
};

const { STOP } = SEARCH_RESULT_TYPE;

export class CreateIncident extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            incidentData: INIT_STATE,
            isConfirmationOpen: false,
            showAlert: false,
            isSetDetailsValid: false,
            isSelectEntitiesValid: false,
            isNotesRequiresToUpdate: false,
            isWorkaroundsRequiresToUpdate: false,
            workaroundsToSync: [],
            isCloseConfirmationOpen: false,
        };
    }

    setupDraftDataCopy = () => {
        const now = moment();
        const copiedData = this.props.incidentToEdit;
        if (!moment.isMoment(copiedData.startTime)) {
            const startDate = copiedData.startDate || '';
            if (startDate && copiedData.startTime) {
                copiedData.startTime = momentFromDateTime(startDate, copiedData.startTime);
            } else {
                copiedData.startTime = '';
            }
        }

        if (moment.isMoment(copiedData.endTime)) {
            copiedData.endDate = moment.isMoment(copiedData.endTime) ? copiedData.endTime.format(DATE_FORMAT) : '';
            copiedData.endTime = moment.isMoment(copiedData.endTime) ? copiedData.endTime.format(TIME_FORMAT) : '';
        }

        const recurrenceDates = getRecurrenceDates(copiedData.startDate, copiedData.startTime, copiedData.endDate);
        const recurrencePattern = this.props.incidentToEdit.recurrent ? parseRecurrencePattern(this.props.incidentToEdit.recurrencePattern) : { freq: RRule.WEEKLY };

        if (moment.isMoment(copiedData.startTime)) {
            copiedData.startDate = now.isSameOrAfter(copiedData.startTime) ? now.format(DATE_FORMAT) : copiedData.startTime.format(DATE_FORMAT);
            copiedData.startTime = now.isSameOrAfter(copiedData.startTime) ? now.format(TIME_FORMAT) : copiedData.startTime.format(TIME_FORMAT);
        }

        const disruptionType = isEmpty(this.props.routes) && !isEmpty(this.props.stops) ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES;

        this.setState({
            incidentData: {
                ...copiedData,
                disruptionId: null,
                ...(recurrenceDates && {
                    recurrencePattern: {
                        ...recurrencePattern,
                        ...recurrenceDates,
                    },
                }),
                status: STATUSES.NOT_STARTED,
                disruptionType,
            },
        });
    };

    setupDataCopy = () => {
        if (this.props.incidentToEdit.status === STATUSES.DRAFT) {
            this.setupDraftDataCopy();
            return;
        }
        const now = moment();

        const copiedData = this.props.incidentToEdit;

        if (!moment.isMoment(copiedData.startTime)) {
            const startDate = copiedData.startDate ? copiedData.startDate : moment(copiedData.startTime).format(DATE_FORMAT);
            copiedData.startTime = momentFromDateTime(startDate, copiedData.startTime);
        }

        if (moment.isMoment(copiedData.endTime)) {
            copiedData.endDate = now.isAfter(copiedData.endTime) ? '' : copiedData.endTime.format(DATE_FORMAT);
            copiedData.endTime = now.isAfter(copiedData.endTime) ? '' : copiedData.endTime.format(TIME_FORMAT);
        }

        const recurrenceDates = getRecurrenceDates(copiedData.startDate, copiedData.startTime, copiedData.endDate);
        const recurrencePattern = this.props.incidentToEdit.recurrent ? parseRecurrencePattern(this.props.incidentToEdit.recurrencePattern) : { freq: RRule.WEEKLY };

        copiedData.startDate = now.isSameOrAfter(copiedData.startTime) ? now.format(DATE_FORMAT) : copiedData.startTime.format(DATE_FORMAT);
        copiedData.startTime = now.isSameOrAfter(copiedData.startTime) ? now.format(TIME_FORMAT) : copiedData.startTime.format(TIME_FORMAT);

        const disruptionType = isEmpty(this.props.routes) && !isEmpty(this.props.stops) ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES;

        this.setState({
            incidentData: {
                ...copiedData,
                disruptionId: null,
                ...(recurrenceDates && {
                    recurrencePattern: {
                        ...recurrencePattern,
                        ...recurrenceDates,
                    },
                }),
                status: STATUSES.NOT_STARTED,
                disruptionType,
                modalOpenedTime: moment().second(0).millisecond(0),
            },
        });
    };

    isFinishButtonDisabled = () => !this.state.isSelectEntitiesValid || !this.state.isSetDetailsValid;

    onUpdateDetailsValidation = isValid => this.setState({ isSetDetailsValid: isValid });

    onUpdateEntitiesValidation = isValid => this.setState({ isSelectEntitiesValid: isValid });

    setupDataEdit = (requireToUpdateForm) => {
        const { incidentToEdit } = this.props;
        const { incidentData } = this.state;
        
        const { startTime, endTime, disruptions } = incidentToEdit;
        
        if (!disruptions || !Array.isArray(disruptions)) {
            return;
        }
        
        const routes = disruptions.map(disruption => disruption.affectedEntities.type === 'route').flat();
        const disruptionType = routes.length > 0 ? DISRUPTION_TYPE.ROUTES : DISRUPTION_TYPE.STOPS;
        const updatedDisruptions = disruptions.map((disruption) => {
            const type = disruption.affectedEntities.some(entity => entity.type === 'route') ? DISRUPTION_TYPE.ROUTES : DISRUPTION_TYPE.STOPS;
            return {
                ...disruption,
                ...(disruption.startTime && { startTime: moment(disruption.startTime).format(TIME_FORMAT) }),
                ...(disruption.startTime && { startDate: moment(disruption.startTime).format(DATE_FORMAT) }),
                ...(disruption.endTime && { endTime: moment(disruption.endTime).format(TIME_FORMAT) }),
                ...(disruption.endTime && { endDate: moment(disruption.endTime).format(DATE_FORMAT) }),
                ...(disruption.affectedEntities.length > 0 && {
                    affectedEntities: {
                        affectedStops: [...disruption.affectedEntities.filter(entity => entity.type === 'stop')],
                        affectedRoutes: [...disruption.affectedEntities.filter(entity => entity.type === 'route')],
                    },
                }),
                disruptionType: type,
                key: disruption.incidentNo,
            };
        });

        this.setState({
            incidentData: {
                ...INIT_STATE,
                disruptionType,
                ...incidentToEdit,
                ...(requireToUpdateForm ? { startTime: incidentData.startTime } : (startTime && { startTime: moment(startTime).format(TIME_FORMAT) })),
                ...(requireToUpdateForm ? { startDate: incidentData.startDate } : (startTime && { startDate: moment(startTime).format(DATE_FORMAT) })),
                ...(requireToUpdateForm ? { endTime: incidentData.endTime } : (endTime && { endTime: moment(endTime).format(TIME_FORMAT) })),
                ...(requireToUpdateForm ? { endDate: incidentData.endDate } : (endTime && { endDate: moment(endTime).format(DATE_FORMAT) })),
                ...(requireToUpdateForm && { header: incidentData.header }),
                ...(requireToUpdateForm && { cause: incidentData.cause }),
                ...(requireToUpdateForm && { status: incidentData.status }),
                ...(requireToUpdateForm && { severity: incidentData.severity }),
                ...(requireToUpdateForm
                    ? { modalOpenedTime: incidentData.modalOpenedTime }
                    : ({ modalOpenedTime: (startTime ? moment(startTime) : moment()).second(0).millisecond(0) })),
                disruptions: [...updatedDisruptions],
            },
        }, () => {
        });

        if (requireToUpdateForm) {
            this.props.setRequireToUpdateIncidentForEditState(false);
            this.setState({ isNotesRequiresToUpdate: true });
        } else {
            const routesToDraw = updatedDisruptions.map(disruption => disruption.affectedEntities.affectedRoutes).flat();
            const stopsToDraw = updatedDisruptions.map(disruption => disruption.affectedEntities.affectedStops).flat();
            this.props.updateAffectedStopsState(sortBy(stopsToDraw, sortedStop => sortedStop.stopCode));

            if (routesToDraw.length > 0) {
                this.props.updateAffectedRoutesState(routesToDraw);
                this.props.getRoutesByShortName(routesToDraw);
            }
        }
    };

    setupData = () => {
        const now = moment();
        const disruptionType = isEmpty(this.props.routes) && !isEmpty(this.props.stops) ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES;
        this.setState({
            incidentData: {
                ...INIT_STATE,
                startTime: this.props.isCreateOpen ? now.format(TIME_FORMAT) : INIT_STATE.startTime,
                startDate: now.format(DATE_FORMAT),
                disruptionType,
                modalOpenedTime: moment().second(0).millisecond(0),
            },
        });
    };

    componentDidMount() {
        if (this.props.editMode === EDIT_TYPE.COPY) {
            this.props.updateCurrentStep(1);
            this.setupDataCopy();
        } else if (this.props.editMode === EDIT_TYPE.EDIT) {
            this.props.updateCurrentStep(1);
            this.setupDataEdit(false);
        } else {
            this.props.updateCurrentStep(1);
            this.setupData();
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isRequiresToUpdateNotes && this.props.isRequiresToUpdateNotes) {
            this.setupDataEdit(true); // for updating form on add note
        }
    }

    updateData = (key, value) => {
        const { incidentData } = this.state;
        let recurrenceDates;
        let recurrencePattern;

        if (['startDate', 'startTime', 'endDate', 'recurrent'].includes(key)) {
            const updatedIncidentData = { ...incidentData, [key]: value };
            recurrenceDates = getRecurrenceDates(updatedIncidentData.startDate, updatedIncidentData.startTime, updatedIncidentData.endDate);
            recurrencePattern = incidentData.recurrent ? parseRecurrencePattern(incidentData.recurrencePattern) : { freq: RRule.WEEKLY };
        }
        this.setState(prevState => ({
            incidentData: {
                ...prevState.incidentData,
                [key]: value,
                ...(recurrenceDates && {
                    recurrencePattern: {
                        ...recurrencePattern,
                        ...recurrenceDates,
                    },
                }),
            },
        }));
    };

    updateDisruptionWorkaround = (key, newWorkarounds) => {
        if (this.props.editMode === EDIT_TYPE.EDIT) {
            this.setState({
                workaroundsToSync: newWorkarounds,
                isWorkaroundsRequiresToUpdate: true,
            });
        } else {
            this.setState(prevState => ({
                incidentData: { ...prevState.incidentData,
                    disruptions: prevState.incidentData.disruptions.map(disruption => (disruption.key === key
                        ? { ...disruption, workarounds: newWorkarounds }
                        : disruption)),
                },
            }));
        }
    };

    onSubmit = async () => {
        this.toggleModal('Confirmation', true);
        const { incidentData } = this.state;

        const startDate = incidentData.startDate ? incidentData.startDate : moment(incidentData.startTime).format(DATE_FORMAT);
        const startTimeMoment = momentFromDateTime(startDate, incidentData.startTime);

        let endTimeMoment;
        if (!isEmpty(incidentData.endDate) && !isEmpty(incidentData.endTime)) {
            endTimeMoment = momentFromDateTime(incidentData.endDate, incidentData.endTime);
        }
        const incident = {
            ...incidentData,
            endTime: endTimeMoment,
            startTime: startTimeMoment,
            notes: [],
        };

        this.props.createNewIncident(buildIncidentSubmitBody(incident, false));
    };

    onSubmitDraft = async () => {
        this.props.updateCurrentStep(1);
        const { incidentData } = this.state;
        const startDate = incidentData.startDate ? incidentData.startDate : moment(incidentData.startTime).format(DATE_FORMAT);
        const startTimeMoment = momentFromDateTime(startDate, incidentData.startTime);
        let endTimeMoment;
        if (!isEmpty(incidentData.endDate) && !isEmpty(incidentData.endTime)) {
            endTimeMoment = momentFromDateTime(incidentData.endDate, incidentData.endTime);
        }

        let recurrencePattern;
        if (incidentData.recurrent) {
            recurrencePattern = {
                freq: incidentData.recurrencePattern.freq,
                byweekday: incidentData.recurrencePattern.byweekday ?? [],
                ...(incidentData.startTime && { dtstart: incidentData.recurrencePattern.dtstart }),
                ...(incidentData.endTime && { until: incidentData.recurrencePattern.until }),
            };
        } else {
            recurrencePattern = incidentData.recurrencePattern;
        }

        if (incidentData.disruptions.length < 1) {
            incidentData.disruptions = [{
                startTime: incidentData.startTime,
                startDate: incidentData.startDate,
                endTime: incidentData.endTime,
                endDate: incidentData.endDate,
                impact: DEFAULT_IMPACT.value,
                cause: incidentData.cause,
                affectedEntities: {
                    affectedRoutes: [],
                    affectedStops: [],
                },
                createNotification: false,
                disruptionType: DISRUPTION_TYPE.ROUTES,
                severity: incidentData.severity,
                recurrent: incidentData.recurrent,
                duration: incidentData.duration,
                recurrencePattern: { ...incidentData.recurrencePattern },
                header: incidentData.header,
            }];
        }

        const incident = {
            ...incidentData,
            endTime: endTimeMoment,
            startTime: startTimeMoment,
            status: STATUSES.DRAFT,
            recurrencePattern,
            notes: [],
        };

        this.props.createNewIncident(buildIncidentSubmitBody(incident, false));
        this.props.openCreateIncident(false);
        this.props.toggleIncidentModals('isConfirmationOpen', true);
    };

    onSubmitUpdate = async () => {
        const { incidentData } = this.state;

        const incidentStartDate = incidentData.startDate ? incidentData.startDate : moment(incidentData.startTime).format(DATE_FORMAT);
        const startTimeMoment = momentFromDateTime(incidentStartDate, incidentData.startTime);

        let endTimeMoment;
        if (!isEmpty(incidentData.endDate) && !isEmpty(incidentData.endTime)) {
            endTimeMoment = momentFromDateTime(incidentData.endDate, incidentData.endTime);
        }
        const incident = {
            ...incidentData,
            endTime: endTimeMoment,
            startTime: startTimeMoment,
            notes: [],
        };

        this.props.updateIncident(buildIncidentSubmitBody(incident, true));
        this.props.openCreateIncident(false);
        this.props.toggleIncidentModals('isConfirmationOpen', true);
    };

    toggleModal = (modalType, isOpen) => {
        const type = `is${modalType}Open`;
        this.setState({ [type]: isOpen });
        this.props.toggleIncidentModals(type, isOpen);
    
        if (!isOpen) {
            const mapElements = document.querySelectorAll('.leaflet-control-container, .leaflet-control-zoom, .leaflet-control-draw, .leaflet-pane, .leaflet-overlay-pane, .leaflet-marker-pane, .leaflet-tooltip-pane, .leaflet-popup-pane');
            mapElements.forEach(element => {
                if (element) {
                    element.style.display = 'none';
                    element.style.visibility = 'hidden';
                    element.style.opacity = '0';
                }
            });
            
            const mapContainer = document.querySelector('.leaflet-container');
            if (mapContainer) {
                mapContainer.style.display = 'none';
                mapContainer.style.visibility = 'hidden';
                mapContainer.style.opacity = '0';
            }
            
            if (this.props.isDiversionManagerOpen) {
                this.props.openDiversionManager(false);
            }
        }
    };

    closeEffectEditPanel = () => {
        
        // Reset diversion manager state
        this.props.openDiversionManager(false);
        this.props.updateDiversionMode(EDIT_TYPE.CREATE);
        this.props.updateDiversionToEdit(null);
        this.props.toggleEditEffectPanel(false);
        this.props.toggleWorkaroundPanel(false);
        this.props.updateDisruptionKeyToEditEffect('');
        this.props.updateDisruptionKeyToWorkaroundEdit('');
        this.props.setRequestedDisruptionKeyToUpdateEditEffect('');
        this.props.setRequestToUpdateEditEffectState(true);
    };

    handleCloseButtonClick = () => {
        this.setState({ isCloseConfirmationOpen: true });
    };

    handleCloseConfirmationClose = () => {
        this.setState({ isCloseConfirmationOpen: false });
    };



    renderSteps = () => {
        const steps = {
            [INCIDENTS_CREATION_STEPS.ENTER_DETAILS]: (
                <li key="1" className={ this.props.activeStep === 1 ? 'active' : '' }>
                    Enter Details
                </li>
            ),
            [INCIDENTS_CREATION_STEPS.ADD_EFFECTS]: (
                <li key="2" className={ `position-relative ${this.props.activeStep === 2 ? 'active' : ''}` }>
                    Add Effects
                </li>
            ),
            [INCIDENTS_CREATION_STEPS.ADD_WORKAROUNDS]: (
                <li key="3" className={ this.props.activeStep === 3 ? 'active' : '' }>
                    { this.props.usePassengerImpact ? 'Workarounds and Passenger Impact' : 'Add Workarounds' }
                    <div className="text-muted optional-text">(Optional)</div>
                </li>
            ),
        };

        return (
            <div className="disruption-creation__steps p-4">
                <ol>
                    { this.props.editMode !== EDIT_TYPE.EDIT && ([
                        steps[INCIDENTS_CREATION_STEPS.ENTER_DETAILS],
                        steps[INCIDENTS_CREATION_STEPS.ADD_EFFECTS],
                        steps[INCIDENTS_CREATION_STEPS.ADD_WORKAROUNDS],
                    ])}
                    { this.props.editMode === EDIT_TYPE.EDIT && ([
                        steps[INCIDENTS_CREATION_STEPS.ADD_EFFECTS],
                        steps[INCIDENTS_CREATION_STEPS.ADD_WORKAROUNDS],
                    ])}
                </ol>
            </div>
        );
    };

    render() {
        const { incidentData, isConfirmationOpen, isNotesRequiresToUpdate, isWorkaroundsRequiresToUpdate, workaroundsToSync } = this.state;
        

        
        const renderMainHeading = () => {
            const titleByMode = {
                [EDIT_TYPE.CREATE]: 'Create a new Disruption',
                [EDIT_TYPE.COPY]: `Copy Disruption #${this.props.incidentToEdit.incidentNo}`,
                [EDIT_TYPE.EDIT]: `Disruption #CCD${this.props.incidentToEdit.incidentId}`,
            };
            return this.props.activeStep === 1 && <h2 className="pl-4 pr-4 pt-4">{titleByMode[this.props.editMode]}</h2>;
        };
        return (
            <div className="sidepanel-control-component-view d-flex">
                { (this.props.isLoading) && (<LoadingOverlay />) }
                <SidePanel
                    isOpen
                    isActive
                    className="sidepanel-primary-panel disruption-creation__sidepanel side-panel__scroll-size"
                    toggleButton={ false }>
                    {this.props.editMode !== EDIT_TYPE.EDIT && (
                        <div className="disruption-creation__container h-100">
                            {this.renderSteps()}
                            {renderMainHeading()}
                            <Wizard
                                className="disruption-creation__wizard container p-0"
                                data={ incidentData }
                                response={ this.props.action }
                                onDataUpdate={ this.updateData }
                                onSubmit={ this.onSubmit }
                                onSubmitDraft={ useDraftDisruptions && this.onSubmitDraft }>
                                                            <SelectDetails
                                onUpdateDetailsValidation={ this.onUpdateDetailsValidation }
                                onSubmitUpdate={ this.onSubmitUpdate } />
                                <SelectEffects
                                    onUpdateEntitiesValidation={ this.onUpdateEntitiesValidation }
                                    onSubmitUpdate={ this.onSubmitUpdate } />
                                <Workarounds
                                    isFinishDisabled={ useDraftDisruptions ? this.isFinishButtonDisabled() : false }
                                    onSubmitUpdate={ this.onSubmitUpdate } />
                            </Wizard>
                            <CustomModal
                                className="disruption-creation__modal"
                                title={ this.props.action.resultIncidentId ? 'Disruption created' : 'Log a disruption' }
                                isModalOpen={ isConfirmationOpen }>
                                <Confirmation response={ this.props.action } />
                            </CustomModal>
                            <CustomModal
                                className="disruption-creation__modal"
                                title="Log a disruption"
                                isModalOpen={ this.props.isCancellationOpen }>
                                <Cancellation />
                            </CustomModal>
                        </div>
                    )}
                    {this.props.editMode === EDIT_TYPE.EDIT && (
                            <div className="disruption-edit__container h-100">
                            <div className="label-with-icon">
                                {renderMainHeading()}
                                {' '}

                                {this.props.isEditEffectPanelOpen
                                    && (
                                        <KeyboardDoubleArrowLeftIcon onClick={ this.closeEffectEditPanel }
                                            className="collapse-icon"
                                            style={ { color: '#399CDB', fontSize: '48px' } } />
                                    )}
                            </div>
                            <SelectDetails
                                onUpdateDetailsValidation={ this.onUpdateDetailsValidation }
                                data={ incidentData }
                                response={ this.props.action }
                                onDataUpdate={ this.updateData }
                                onSubmit={ this.onSubmit }
                                onSubmitDraft={ useDraftDisruptions && this.onSubmitDraft }
                                onSubmitUpdate={ this.onSubmitUpdate } />
                            <CustomModal
                                className="disruption-creation__modal"
                                title={ this.props.action.resultIncidentId ? 'Disruption created' : 'Log a disruption' }
                                isModalOpen={ isConfirmationOpen }>
                                <Confirmation response={ this.props.action } />
                            </CustomModal>
                            <CustomModal
                                className="disruption-creation__modal"
                                title="Log a disruption"
                                isModalOpen={ this.props.isCancellationOpen }>
                                <Cancellation />
                            </CustomModal>
                        </div>
                    )}
                </SidePanel>
                <WorkaroundPanel
                    disruptions={ incidentData.disruptions }
                    onWorkaroundUpdate={ this.updateDisruptionWorkaround }
                />

                {(this.props.editMode === EDIT_TYPE.EDIT || this.props.disruptionIncidentNoToEdit) && this.props.isEditEffectPanelOpen && (
                    <EditEffectPanel
                        disruptions={ incidentData.disruptions }
                        onWorkaroundUpdate={ this.updateDisruptionWorkaround }
                        modalOpenedTime={ incidentData.modalOpenedTime
                            ? moment(incidentData.modalOpenedTime).toISOString()
                            : '' }
                        disruptionRecurrent={ incidentData.recurrent }
                        onDisruptionsUpdate={ this.updateData }
                        isNotesRequiresToUpdate={ isNotesRequiresToUpdate }
                        updateIsNotesRequiresToUpdateState={ () => this.setState({ isNotesRequiresToUpdate: false }) }
                        isWorkaroundsRequiresToUpdate={ isWorkaroundsRequiresToUpdate }
                        updateIsWorkaroundsRequiresToUpdateState={ () => this.setState({ isWorkaroundsRequiresToUpdate: false }) }
                        workaroundsToSync={ workaroundsToSync }
                        disruptionIncidentNoToEdit={ this.props.disruptionIncidentNoToEdit }
                        isEditEffectPanelOpen={ this.props.isEditEffectPanelOpen }
                        toggleEditEffectPanel={ this.props.toggleEditEffectPanel }
                    />
                )}
                {this.props.isDiversionManagerOpen && (
                    (() => {
                        return (
                            <DiversionManager
                                disruption={{
                                    ...this.props.disruptionToEdit,
                                    disruptionId: this.props.disruptionToEdit?.disruptions?.[0]?.disruptionId,              
                                    affectedEntities: (() => {
                                        const affectedEntities = this.props.disruptionToEdit?.disruptions?.[0]?.affectedEntities || [];
                                        return {
                                            affectedRoutes: affectedEntities.filter(entity => entity.type === 'route'),
                                            affectedStops: affectedEntities.filter(entity => entity.type === 'stop')
                                        };
                                    })()
                                }}
                                onCancelled={() => {
                                    this.props.openDiversionManager(false);
                                    this.props.toggleEditEffectPanel(true);
                                    
                                    if (this.props.disruptionIncidentNoToEdit) {
                                        this.props.updateDisruptionKeyToEditEffect(this.props.disruptionIncidentNoToEdit);
                                    }
                                }}
                                onDiversionCreated={() => {
                                    this.props.setRequireToUpdateIncidentForEditState(true);
                                }}
                                editMode={this.props.diversionMode || "CREATE"}
                                isOpen={this.props.isDiversionManagerOpen}
                            />
                        );
                    })()
                )}

                <Map
                    shouldOffsetForSidePanel
                    boundsToFit={ this.props.boundsToFit }
                    isLoading={ this.props.isLoading }
                >
                    <ShapeLayer
                        shapes={ this.props.shapes }
                        routeColors={ this.props.routeColors } />
                    <StopsLayer
                        childStops={ this.props.activeStep === 2 ? this.props.childStops : undefined }
                        stopDetail={ this.props.stopDetail }
                        focusZoom={ 16 }
                        onStopClick={ (stop) => {
                            if (incidentData.disruptionType === DISRUPTION_TYPE.ROUTES) {
                                this.setState({ showAlert: true });
                                return;
                            }
                            this.props.updateAffectedStopsState([...this.props.stops, toCamelCaseKeys(stop)].map(stopEntity => ({
                                ...stopEntity,
                                valueKey: 'stopCode',
                                labelKey: 'stopCode',
                                type: SEARCH_RESULT_TYPE.STOP.type,
                            })));
                        } } />
                    <HighlightingLayer
                        stopDetail={ this.props.stopDetail } />
                    <SelectedStopsMarker
                        stops={ uniqBy([...this.props.stops, ...this.props.routes], stop => stop.stopCode).map(stop => itemToEntityTransformers[STOP.type](stop).data) }
                        size={ 28 }
                        tooltip
                        maximumStopsToDisplay={ 200 } />
                    <DrawLayer
                        disabled={ this.props.activeStep !== 2 }
                        disruptionType={ incidentData.disruptionType }
                        onDrawCreated={ shape => this.props.searchByDrawing(
                            incidentData.disruptionType,
                            this.props.useGeoSearchRoutesByDisruptionPeriod && (incidentData.endTime || incidentData.recurrent) ? {
                                ...shape,
                                activePeriods: incidentData.activePeriods.length > 0 ? incidentData.activePeriods : generateDisruptionActivePeriods(incidentData),
                            } : shape,
                        ) } />
                </Map>
                <Button
                    className="disruption-creation-close-disruptions fixed-top mp-0 border-0 rounded-0"
                    onClick={ this.handleCloseButtonClick }>
                    Close
                    <AiOutlineClose className="disruption-creation-close" size={ 20 } />
                </Button>
                {this.state.showAlert && (
                    <AlertMessage
                        autoDismiss
                        message={ {
                            ...ALERT_TYPES.STOP_SELECTION_DISABLED_ERROR(),
                        } }
                        onClose={ () => this.setState({ showAlert: false }) }
                    />
                )}
                <CustomModal
                    className="disruption-creation__modal"
                    title="Log a disruption"
                    isModalOpen={ this.state.isCloseConfirmationOpen }
                    onClose={ this.handleCloseConfirmationClose }>
                    <CloseConfirmation onClose={ this.handleCloseConfirmationClose } />
                </CustomModal>
            </div>
        );
    }
}

CreateIncident.propTypes = {
    createNewIncident: PropTypes.func.isRequired,
    action: PropTypes.object.isRequired,
    isCreateOpen: PropTypes.bool,
    toggleIncidentModals: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func.isRequired,
    isCancellationOpen: PropTypes.bool,
    activeStep: PropTypes.number,
    stops: PropTypes.array,
    routes: PropTypes.array,
    shapes: PropTypes.array,
    editMode: PropTypes.string,
    routeColors: PropTypes.array,
    updateIncident: PropTypes.func.isRequired,
    incidentToEdit: PropTypes.object,
    openCreateIncident: PropTypes.func.isRequired,
    searchByDrawing: PropTypes.func.isRequired,
    boundsToFit: PropTypes.array.isRequired,
    childStops: PropTypes.object.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    stopDetail: PropTypes.object.isRequired,
    isLoading: PropTypes.bool,
    usePassengerImpact: PropTypes.bool.isRequired,
    useGeoSearchRoutesByDisruptionPeriod: PropTypes.bool.isRequired,
    isEditEffectPanelOpen: PropTypes.bool,
    isRequiresToUpdateNotes: PropTypes.bool,
    setRequireToUpdateIncidentForEditState: PropTypes.func.isRequired,
    getRoutesByShortName: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    setRequestToUpdateEditEffectState: PropTypes.func.isRequired,
    setRequestedDisruptionKeyToUpdateEditEffect: PropTypes.func.isRequired,
    toggleEditEffectPanel: PropTypes.func.isRequired,
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    updateDisruptionKeyToEditEffect: PropTypes.func.isRequired,
    updateDisruptionKeyToWorkaroundEdit: PropTypes.func.isRequired,
    isDiversionManagerOpen: PropTypes.bool,
    openDiversionManager: PropTypes.func.isRequired,
    updateDiversionMode: PropTypes.func.isRequired,
    updateDiversionToEdit: PropTypes.func.isRequired,
    diversionMode: PropTypes.string,
    disruptionToEdit: PropTypes.object,
};

CreateIncident.defaultProps = {
    isCreateOpen: false,
    isCancellationOpen: false,
    activeStep: 1,
    stops: [],
    routes: [],
    shapes: [],
    editMode: EDIT_TYPE.CREATE,
    routeColors: [],
    incidentToEdit: {},
    isLoading: false,
    isEditEffectPanelOpen: false,
    isRequiresToUpdateNotes: false,
    disruptionIncidentNoToEdit: '',
    isDiversionManagerOpen: false,
    diversionMode: 'CREATE',
    disruptionToEdit: {},
};

export default connect(state => ({
    action: getIncidentAction(state),
    isCreateOpen: isIncidentCreationOpen(state),
    isCancellationOpen: isIncidentCancellationModalOpen(state),
    activeStep: getIncidentStepCreation(state),
    stops: getAffectedStops(state),
    routes: getAffectedRoutes(state),
    shapes: getShapes(state),
    editMode: getEditMode(state),
    routeColors: getRouteColors(state),
    incidentToEdit: getIncidentToEdit(state),
    boundsToFit: getBoundsToFit(state),
    childStops: getChildStops(state),
    stopDetail: getStopDetail(state),
    isLoading: getIncidentsLoadingState(state),
    usePassengerImpact: usePassengerImpact(state),
    useGeoSearchRoutesByDisruptionPeriod: useGeoSearchRoutesByDisruptionPeriod(state),
    useDraftDisruptions: useDraftDisruptions(state),
    isEditEffectPanelOpen: isEditEffectPanelOpen(state),
    isRequiresToUpdateNotes: isRequiresToUpdateNotes(state),
            disruptionIncidentNoToEdit: getDisruptionKeyToEditEffect(state),
    isDiversionManagerOpen: getIsDiversionManagerOpen(state),
    diversionMode: state.control?.diversions?.mode || 'CREATE',
    disruptionToEdit: getIncidentToEdit(state),
}), {
    createNewIncident,
    openCreateIncident,
    toggleIncidentModals,
    updateCurrentStep,
    updateIncident,
    searchByDrawing,
    updateAffectedStopsState,
    setRequireToUpdateIncidentForEditState,
    getRoutesByShortName,
    updateAffectedRoutesState,
    setRequestToUpdateEditEffectState,
    setRequestedDisruptionKeyToUpdateEditEffect,
    toggleEditEffectPanel,
    toggleWorkaroundPanel,
    updateDisruptionKeyToEditEffect,
    updateDisruptionKeyToWorkaroundEdit,
    openDiversionManager,
    updateDiversionMode,
    updateDiversionToEdit,
})(CreateIncident);
