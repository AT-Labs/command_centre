import React, { createRef } from 'react';

import { isEmpty, uniqBy, sortBy, forEach } from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import { AiOutlineClose, AiOutlinePlusCircle } from 'react-icons/ai';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { RRule } from 'rrule';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { DATE_FORMAT, TIME_FORMAT, MAX_NUMBER_OF_ENTITIES } from '../../../../../constants/disruptions';
import { getEntityCounts, generateSelectedText, getShapes, getRouteColors } from '../../../../../utils/control/incidents';
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
    updateEditMode,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
    setDisruptionForWorkaroundEdit,
    toggleEditEffectPanel,
} from '../../../../../redux/actions/control/incidents';
import {
    getAffectedRoutes,
    getAffectedStops,
    getIncidentAction,
    getIncidentStepCreation,
    getIncidentToEdit,
    getEditMode,
    isIncidentCancellationModalOpen,
    isIncidentCreationOpen,
    getBoundsToFit,
    getIncidentsLoadingState,
    isEditEffectPanelOpen,
    isRequiresToUpdateNotes,
    isWorkaroundPanelOpen,
    isApplyChangesModalOpen,
    isPublishAndApplyChangesModalOpen,
    getMapDrawingEntities,
    getDisruptionKeyToEditEffect,
    getCachedShapes,
} from '../../../../../redux/selectors/control/incidents';
import { STATUSES, DISRUPTION_TYPE, INCIDENTS_CREATION_STEPS, getParentChildDefaultSeverity, ALERT_TYPES } from '../../../../../types/disruptions-types';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../../types/disruption-cause-and-effect';
import {
    momentFromDateTime,
    getRecurrenceDates,
    itemToEntityTransformers,
    toCamelCaseKeys,
    generateDisruptionActivePeriods,
    buildIncidentSubmitBody,
    getStatusForEffect,
} from '../../../../../utils/control/disruptions';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import IncidentLimitModal from '../../Modals/IncidentLimitModal';
import '../../../../Common/OffCanvasLayout/OffCanvasLayout.scss';
import SidePanel from '../../../../Common/OffCanvasLayout/SidePanel/SidePanel';
import Wizard from '../../../../Common/wizard/Wizard';
import '../styles.scss';

import Cancellation from '../WizardSteps/Cancellation';
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
import { useGeoSearchRoutesByDisruptionPeriod, useDraftDisruptions } from '../../../../../redux/selectors/appSettings';
import LoadingOverlay from '../../../../Common/Overlay/LoadingOverlay';
import WorkaroundPanel from '../WizardSteps/WorkaroundPanel';
import EditEffectPanel from '../EditIncidentDetails/EditEffectPanel';
import ApplyChangesModal from '../EditIncidentDetails/ApplyChangesModal';
import PublishAndApplyChangesModal from '../EditIncidentDetails/PublishAndApplyChangesModal';

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
    createNotification: false,
    recurrent: false,
    duration: '',
    recurrencePattern: { freq: RRule.WEEKLY },
    disruptionType: DISRUPTION_TYPE.ROUTES,
    severity: getParentChildDefaultSeverity().value,

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
            editableDisruption: {},
            editableWorkarounds: {},
            isEffectsRequiresToUpdate: false,
            isEffectValid: true,
            isEffectForPublishValid: true,
            isEffectUpdated: false,
            newIncidentEffect: {},
            selectedEffect: null,
            isAlertModalOpen: false,
            totalEntities: 0,
            effectToBeCleared: null,
            disruptionToEdit: null,
        };
        this.editEffectPanelRef = createRef();
    }

    isFinishButtonDisabled = () => !this.state.isSelectEntitiesValid || !this.state.isSetDetailsValid;

    onUpdateDetailsValidation = isValid => this.setState({ isSetDetailsValid: isValid });

    onUpdateEntitiesValidation = isValid => this.setState({ isSelectEntitiesValid: isValid });

    setupDataEdit = (requireToUpdateForm) => {
        const { incidentToEdit } = this.props;
        const { incidentData } = this.state;
        const { startTime, endTime, disruptions } = incidentToEdit;
        const routes = disruptions.map(disruption => disruption.affectedEntities.type === 'route').flat();
        const disruptionType = routes.length > 0 ? DISRUPTION_TYPE.ROUTES : DISRUPTION_TYPE.STOPS;

        const disruptionStartTimes = disruptions
            .map(disruption => disruption.startTime)
            .filter(Boolean)
            .map(time => moment(time))
            .filter(m => m.isValid());

        if (incidentToEdit?.startTime) {
            const startTimeMoment = moment(incidentToEdit.startTime);
            if (startTimeMoment.isValid()) {
                disruptionStartTimes.push(startTimeMoment);
            }
        }

        const earliestStartTime = disruptionStartTimes.length > 0
            ? moment.min(disruptionStartTimes)
            : null;

        const updatedDisruptions = disruptions.map((disruption) => {
            const type = disruption.affectedEntities.some(entity => entity.type === 'route') ? DISRUPTION_TYPE.ROUTES : DISRUPTION_TYPE.STOPS;
            const entities = disruption.affectedEntities ?? [];
            return {
                ...disruption,
                ...(disruption.startTime && { startTime: moment(disruption.startTime).format(TIME_FORMAT) }),
                ...(disruption.startTime && { startDate: moment(disruption.startTime).format(DATE_FORMAT) }),
                ...(disruption.endTime && { endTime: moment(disruption.endTime).format(TIME_FORMAT) }),
                ...(disruption.endTime && { endDate: moment(disruption.endTime).format(DATE_FORMAT) }),
                ...{
                    affectedEntities: {
                        affectedStops: entities.filter(entity => entity.type === 'stop'),
                        affectedRoutes: entities.filter(entity => entity.type === 'route'),
                    },
                },
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
                    : ({ modalOpenedTime: (earliestStartTime || moment()).second(0).millisecond(0) })),
                disruptions: [...updatedDisruptions],
            },
            ...(this.props.disruptionIncidentNoToEdit ? { selectedEffect: this.props.disruptionIncidentNoToEdit } : null),
        });

        if (requireToUpdateForm) {
            this.props.setRequireToUpdateIncidentForEditState(false);
            this.setState({ isNotesRequiresToUpdate: true });
        } else {
            const routesToDraw = updatedDisruptions.map(disruption => disruption.affectedEntities.affectedRoutes).flat();
            const stopsToDraw = updatedDisruptions.map(disruption => disruption.affectedEntities.affectedStops).flat();
            this.props.updateAffectedStopsState(sortBy(stopsToDraw, sortedStop => sortedStop.stopCode));
            this.props.updateAffectedRoutesState(routesToDraw);

            if (routesToDraw.length > 0) {
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
        if (this.props.editMode === EDIT_TYPE.EDIT) {
            this.props.updateCurrentStep(1);
            this.setupDataEdit(false);
        } else {
            this.props.updateCurrentStep(1);
            this.setupData();
        }
    }

    drawAffectedEntity() {
        const { incidentToEdit } = this.props;
        if (incidentToEdit?.disruptions?.length > 0) {
            const routesToDraw = incidentToEdit.disruptions.map(disruption => disruption.affectedEntities.filter(entity => entity.type === 'route')).flat();
            const stopsToDraw = incidentToEdit.disruptions.map(disruption => disruption.affectedEntities.filter(entity => entity.type === 'stop')).flat();
            this.props.updateAffectedStopsState(sortBy(stopsToDraw, sortedStop => sortedStop.stopCode));
            this.props.updateAffectedRoutesState(routesToDraw);

            if (routesToDraw.length > 0) {
                this.props.getRoutesByShortName(routesToDraw.slice(0, 10));
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.isRequiresToUpdateNotes && this.props.isRequiresToUpdateNotes) {
            this.setupDataEdit(true); // for updating form on add note
        }

        if (prevProps.incidentToEdit?.disruptions?.length !== this.props.incidentToEdit?.disruptions?.length) {
            this.drawAffectedEntity(); // for redraw affected entity after add effect
        }

        if (prevProps.mapDrawingEntities !== this.props.mapDrawingEntities) {
            if (this.state.editMode === undefined && this.state.selectedEffect) {
                const u = this.state.incidentData.disruptions.map(d => d.key === this.state.selectedEffect);
                if (u.length > 0) {
                    this.setState(prevState => ({
                        incidentData: {
                            ...prevState.incidentData,
                            disruptions: prevState.incidentData.disruptions.map(d => (d.key === prevState.selectedEffect ? {
                                ...d,
                                affectedEntities: {
                                    affectedRoutes: uniqBy([
                                        ...(d.affectedEntities?.affectedRoutes || []),
                                        ...this.props.mapDrawingEntities.filter(e => e.type === 'route'),
                                    ], 'routeId'),
                                    affectedStops: uniqBy([
                                        ...(d.affectedEntities?.affectedStops || []),
                                        ...this.props.mapDrawingEntities.filter(e => e.type === 'stop'),
                                    ], 'stopCode'),
                                },
                            } : d)),
                        },
                    }));
                }
            }

            if (this.state.editMode === EDIT_TYPE.ADD_EFFECTS) {
                this.setState(prevState => ({
                    newIncidentEffect: {
                        ...prevState.newIncidentEffect,
                        affectedEntities: {
                            affectedRoutes: uniqBy([
                                ...(prevState.newIncidentEffect.affectedEntities?.affectedRoutes || []),
                                ...this.props.mapDrawingEntities.filter(e => e.type === 'route'),
                            ], 'routeId'),
                            affectedStops: uniqBy([
                                ...(prevState.newIncidentEffect.affectedEntities?.affectedStops || []),
                                ...this.props.mapDrawingEntities.filter(e => e.type === 'stop'),
                            ], 'stopCode'),
                        },
                    },
                }));
            }
        }
        if (prevProps.disruptionIncidentNoToEdit !== this.props.disruptionIncidentNoToEdit && this.props.editMode === EDIT_TYPE.EDIT) {
            this.setState({
                selectedEffect: this.props.disruptionIncidentNoToEdit,
            });
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

    applyDisruptionChanges = (newDisruption) => {
        const { editableWorkarounds } = this.state;
        this.setState(prevState => ({
            incidentData: { ...prevState.incidentData,
                disruptions: prevState.incidentData.disruptions.map(disruption => (disruption.incidentNo === newDisruption.incidentNo
                    ? {
                        ...disruption,
                        ...newDisruption,
                        ...((this.props.isWorkaroundPanelOpen && editableWorkarounds?.key === newDisruption.incidentNo) && { workarounds: editableWorkarounds.workarounds }),
                    }
                    : disruption)),
            },
            isEffectsRequiresToUpdate: true,
            selectedEffect: null,
        }));
    };

    updateDisruptionWorkaround = (key, newWorkarounds) => {
        if (this.props.editMode === EDIT_TYPE.EDIT) {
            this.setState({
                workaroundsToSync: newWorkarounds,
                isWorkaroundsRequiresToUpdate: true,
            });
        } else if (this.props.editMode === EDIT_TYPE.ADD_EFFECT) {
            this.setState(prevState => ({
                newIncidentEffect: { ...prevState.newIncidentEffect,
                    workarounds: newWorkarounds,
                },
            }));
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
        const { incidentData } = this.state;

        if (!this.validateEntityLimits(incidentData.disruptions)) {
            return;
        }

        this.toggleModal('Confirmation', true);

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

        if (!this.validateEntityLimits(incidentData.disruptions)) {
            return;
        }
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

    validateEntityLimits = (disruptions) => {
        const disruptionList = Array.isArray(disruptions) ? disruptions : [disruptions];

        const hasExceededLimit = disruptionList.some((disruption) => {
            if (disruption?.affectedEntities) {
                const { entitiesCount } = getEntityCounts(disruption);
                if (entitiesCount > MAX_NUMBER_OF_ENTITIES) {
                    this.setState({
                        totalEntities: entitiesCount,
                        isAlertModalOpen: true,
                    });
                    return true;
                }
            }
            return false;
        });

        return !hasExceededLimit;
    };

    onSubmitUpdate = async () => {
        if (!this.validateEntityLimits(this.state.disruptionToEdit)) {
            return;
        }

        const { isEffectUpdated } = this.state;
        if (isEffectUpdated && this.props.isEditEffectPanelOpen) {
            this.props.toggleIncidentModals('isApplyChangesOpen', true);
        } else {
            await this.onSubmitIncidentUpdate();
        }
    };

    onSubmitIncidentUpdate = async () => {
        const { incidentData, editableDisruption, editableWorkarounds, newIncidentEffect } = this.state;
        let updatedDisruption;
        if (this.props.isEditEffectPanelOpen) {
            updatedDisruption = incidentData.disruptions.map(disruption => (disruption.incidentNo === editableDisruption.incidentNo
                ? { ...disruption,
                    ...editableDisruption,
                    ...(this.props.isWorkaroundPanelOpen && editableWorkarounds?.key === disruption.incidentNo ? { workarounds: editableWorkarounds.workarounds } : {}),
                    ...(editableDisruption.note && { notes: [...editableDisruption.notes, ...([{ description: editableDisruption.note }])] }),
                    ...(disruption.status === STATUSES.DRAFT && incidentData.status === STATUSES.NOT_STARTED && { status: STATUSES.NOT_STARTED }),
                }
                : {
                    ...disruption,
                    ...(disruption.note && { notes: [...disruption.notes, ...([{ description: disruption.note }])] }),
                    ...(disruption.status === STATUSES.DRAFT && incidentData.status === STATUSES.NOT_STARTED && { status: STATUSES.NOT_STARTED }),
                }));
        } else {
            updatedDisruption = incidentData.disruptions.map(disruption => ({
                ...disruption,
                ...(disruption.note && { notes: [...disruption.notes, ...([{ description: disruption.note }])] }),
                ...(disruption.status === STATUSES.DRAFT && incidentData.status === STATUSES.NOT_STARTED && { status: STATUSES.NOT_STARTED }),
            }));
        }

        if (this.props.editMode === EDIT_TYPE.ADD_EFFECT && newIncidentEffect.key) {
            updatedDisruption = [
                ...updatedDisruption,
                {
                    ...newIncidentEffect,
                    ...(incidentData.status === STATUSES.DRAFT ? { status: STATUSES.DRAFT } : getStatusForEffect(newIncidentEffect)),
                }];
        }

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
            ...(updatedDisruption && { disruptions: updatedDisruption }),
        };
        this.props.updateIncident(buildIncidentSubmitBody(incident, true), this.props.editMode === EDIT_TYPE.ADD_EFFECT);
        this.clearNewEffectToIncident();
    };

    onPublishUpdate = () => {
        const { isEffectUpdated } = this.state;
        if (isEffectUpdated && this.props.isEditEffectPanelOpen) {
            this.props.toggleIncidentModals('isPublishAndApplyChangesOpen', true);
        } else {
            this.updateData('status', STATUSES.NOT_STARTED);
            setTimeout(() => this.onSubmitIncidentUpdate(), 0);
        }
    };

    onPublishIncidentUpdate = () => {
        this.updateData('status', STATUSES.NOT_STARTED);

        setTimeout(() => this.onSubmitIncidentUpdate(), 0);
        this.props.toggleIncidentModals('isPublishAndApplyChangesOpen', false);
    };

    toggleModal = (modalType, isOpen) => {
        const type = `is${modalType}Open`;
        this.setState({ [type]: isOpen });
        this.props.toggleIncidentModals(type, isOpen);
    };

    closeEffectEditPanel = () => {
        this.props.setRequestedDisruptionKeyToUpdateEditEffect('');
        this.props.setRequestToUpdateEditEffectState(true);
        this.setState({ selectedEffect: null });
    };

    updateNewIncidentEffect = (disruption) => {
        this.setState({
            newIncidentEffect: {
                ...disruption,
            },
        });
    };

    updateSelectedEffect = (key) => {
        this.setState({ selectedEffect: key });
    };

    clearNewEffectToIncident = () => {
        this.setState({
            newIncidentEffect: {},
            selectedEffect: null,
        });
    };

    addNewEffectToIncident = () => {
        this.props.setDisruptionForWorkaroundEdit({});
        this.props.toggleWorkaroundPanel(false);
        this.props.updateDisruptionKeyToWorkaroundEdit('');
        this.props.updateAffectedStopsState([]);
        this.props.updateAffectedRoutesState([]);
        this.props.updateEditMode(EDIT_TYPE.ADD_EFFECT);
        this.props.updateCurrentStep(2);
        this.props.toggleEditEffectPanel(false);
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
                    Add Workarounds
                    <div className="text-muted optional-text">(Optional)</div>
                </li>
            ),
        };

        return (
            <div className="disruption-creation__steps p-4">
                <ol>
                    { this.props.editMode === EDIT_TYPE.CREATE && ([
                        steps[INCIDENTS_CREATION_STEPS.ENTER_DETAILS],
                        steps[INCIDENTS_CREATION_STEPS.ADD_EFFECTS],
                        steps[INCIDENTS_CREATION_STEPS.ADD_WORKAROUNDS],
                    ])}
                    { this.props.editMode === EDIT_TYPE.ADD_EFFECT && ([
                        steps[INCIDENTS_CREATION_STEPS.ADD_EFFECTS],
                        steps[INCIDENTS_CREATION_STEPS.ADD_WORKAROUNDS],
                    ])}
                </ol>
            </div>
        );
    };

    getCurrentDisruption = () => {
        const { editMode } = this.props;
        const { selectedEffect, incidentData, disruptionToEdit, newIncidentEffect } = this.state;

        if (editMode === EDIT_TYPE.CREATE && selectedEffect) {
            return incidentData.disruptions.find(d => d.key === selectedEffect);
        }
        if (editMode === EDIT_TYPE.EDIT && disruptionToEdit) {
            return disruptionToEdit;
        }
        if (editMode === EDIT_TYPE.ADD_EFFECT && !isEmpty(newIncidentEffect)) {
            return newIncidentEffect;
        }
        return null;
    };

    getIncidentType = () => {
        const disruption = this.getCurrentDisruption();
        return disruption?.disruptionType || DISRUPTION_TYPE.ROUTES;
    };

    renderShapeLayer = () => {
        if (this.props.editMode === EDIT_TYPE.EDIT && !this.state.selectedEffect) {
            const { incidentData } = this.state;
            const { shapes, routeColors } = incidentData.disruptions.reduce(
                (accumulator, disruption) => {
                    const { affectedRoutes = [], affectedStops = [] } = disruption.affectedEntities;
                    forEach(affectedRoutes, (route) => {
                        if (!isEmpty(this.props.cachedShapes) && this.props.cachedShapes[route.routeId]) {
                            Object.assign(route, { shapeWkt: this.props.cachedShapes[route.routeId] });
                        }
                    });
                    accumulator.shapes.push(...getShapes(affectedRoutes, affectedStops));
                    accumulator.routeColors.push(...getRouteColors(affectedRoutes, affectedStops));

                    return accumulator;
                },
                { shapes: [], routeColors: [] },
            );
            return <ShapeLayer shapes={ shapes } routeColors={ routeColors } />;
        }

        const disruption = this.getCurrentDisruption();
        if (!disruption?.affectedEntities) return null;

        const { affectedRoutes, affectedStops } = disruption.affectedEntities;

        forEach(affectedRoutes, (route) => {
            if (!isEmpty(this.props.cachedShapes) && this.props.cachedShapes[route.routeId]) {
                Object.assign(route, { shapeWkt: this.props.cachedShapes[route.routeId] });
            }
        });
        const shapes = getShapes(affectedRoutes || [], affectedStops || []);
        const routeColors = getRouteColors(affectedRoutes || [], affectedStops || []);

        return <ShapeLayer shapes={ shapes } routeColors={ routeColors } />;
    };

    renderStopsMarker = () => {
        if (this.props.editMode === EDIT_TYPE.EDIT && !this.state.selectedEffect) {
            const { incidentData } = this.state;
            const stops = [];
            incidentData.disruptions.forEach((disruption) => {
                const { affectedRoutes, affectedStops } = disruption.affectedEntities;
                const r = uniqBy([...(affectedStops || []), ...(affectedRoutes || [])], 'stopCode')
                    .slice(0, 10)
                    .map(stop => itemToEntityTransformers[STOP.type](stop).data);
                stops.push(...r);
            });
            return (
                <SelectedStopsMarker
                    stops={ stops }
                    size={ 28 }
                    tooltip
                    maximumStopsToDisplay={ 200 }
                />
            );
        }

        const disruption = this.getCurrentDisruption();
        if (!disruption?.affectedEntities) return null;

        const { affectedRoutes, affectedStops } = disruption.affectedEntities;

        const stops = uniqBy([...(affectedStops || []), ...(affectedRoutes || [])], 'stopCode')
            .slice(0, 10)
            .map(stop => itemToEntityTransformers[STOP.type](stop).data);

        return (
            <SelectedStopsMarker
                stops={ stops }
                size={ 28 }
                tooltip
                maximumStopsToDisplay={ 200 }
            />
        );
    };

    removeAffectedEntities = () => {
        if (this.props.editMode === EDIT_TYPE.ADD_EFFECT && !isEmpty(this.state.newIncidentEffect)) {
            this.setState(prevState => ({
                newIncidentEffect: {
                    ...prevState.newIncidentEffect,
                    affectedEntities: {
                        affectedRoutes: [],
                        affectedStops: [],
                    },
                },
            }));
        }

        if (this.props.editMode === EDIT_TYPE.EDIT && this.state.selectedEffect && this.editEffectPanelRef.current) {
            this.editEffectPanelRef.current.deleteAffectedEntities();
        }
        this.setState(prevState => ({ effectToBeCleared: prevState.selectedEffect }));
    };

    itemsSelectedText = () => {
        const { disruptionToEdit } = this.state;
        if (!disruptionToEdit) return '';

        const { routesCount, stopsCount } = getEntityCounts(disruptionToEdit);
        return generateSelectedText(routesCount, stopsCount);
    };

    render() {
        const {
            incidentData,
            isConfirmationOpen,
            isNotesRequiresToUpdate,
            isWorkaroundsRequiresToUpdate,
            workaroundsToSync,
            isEffectsRequiresToUpdate,
            isEffectValid,
            isEffectForPublishValid,
            newIncidentEffect,
            isSetDetailsValid } = this.state;
        const renderMainHeading = () => {
            const titleByMode = {
                [EDIT_TYPE.CREATE]: 'Create a new Disruption',
                [EDIT_TYPE.EDIT]: `Disruption #CCD${this.props.incidentToEdit.incidentId}`,
                [EDIT_TYPE.ADD_EFFECT]: `Add Effect on Disruption #CCD${this.props.incidentToEdit.incidentId}`,
            };
            if (this.props.editMode === EDIT_TYPE.ADD_EFFECT) {
                return this.props.activeStep === 2 && <h2 className="pl-4 pr-4 pt-4">{titleByMode[this.props.editMode]}</h2>;
            }
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
                        <div className="disruption-creation__container">
                            {this.renderSteps()}
                            {renderMainHeading()}
                            <Wizard
                                className="disruption-creation__wizard container p-0"
                                data={ incidentData }
                                response={ this.props.action }
                                onDataUpdate={ this.updateData }
                                onSubmit={ this.onSubmit }
                                onSubmitDraft={ useDraftDisruptions && this.onSubmitDraft }>
                                {this.props.editMode !== EDIT_TYPE.ADD_EFFECT && (
                                    <SelectDetails
                                        onUpdateDetailsValidation={ this.onUpdateDetailsValidation }
                                        onSubmitUpdate={ this.onSubmitUpdate }
                                        onDisruptionSelected={ key => this.setState({ selectedEffect: key }) }
                                    />
                                )}
                                <SelectEffects
                                    onUpdateEntitiesValidation={ this.onUpdateEntitiesValidation }
                                    updateNewIncidentEffect={ this.updateNewIncidentEffect }
                                    newIncidentEffect={ newIncidentEffect }
                                    selectedEffect={ this.state.selectedEffect }
                                    updateSelectedEffect={ this.updateSelectedEffect }
                                    onSubmit={ this.onSubmit }
                                    onSubmitUpdate={ this.onSubmitUpdate }
                                    effectAddedHandler={ this.updateSelectedEffect }
                                    effectToBeCleared={ this.state.effectToBeCleared }
                                    effectCleared={ () => this.setState({ effectToBeCleared: null }) }
                                    isDetailsValid={ isSetDetailsValid }
                                />
                                <Workarounds
                                    isFinishDisabled={ useDraftDisruptions ? this.isFinishButtonDisabled() : false }
                                    newIncidentEffect={ newIncidentEffect }
                                    onSubmitUpdate={ this.onSubmitUpdate }
                                    incidentStatus={ incidentData.status } />
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
                                <Cancellation clearNewEffectToIncident={ this.clearNewEffectToIncident } />
                            </CustomModal>
                        </div>
                    )}
                    {this.props.editMode === EDIT_TYPE.EDIT && (
                        <div className="disruption-edit__container">
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
                            {this.props.editMode === EDIT_TYPE.EDIT
                                    && (
                                        <div className="add-effect-button-wrapper pr-4">
                                            <button
                                                type="button"
                                                className={ `add-effect-button ${this.props.incidentToEdit.status === STATUSES.RESOLVED ? 'disabled' : ''}` }
                                                onClick={ () => this.addNewEffectToIncident() }
                                                disabled={ this.props.incidentToEdit.status === STATUSES.RESOLVED }>
                                                <AiOutlinePlusCircle size={ 36 } color={ this.props.incidentToEdit.status === STATUSES.RESOLVED ? '#e9ecef' : '#399CDB' } />
                                                {' '}
                                                Add effect
                                            </button>
                                        </div>
                                    ) }
                            <SelectDetails
                                onUpdateDetailsValidation={ this.onUpdateDetailsValidation }
                                data={ incidentData }
                                response={ this.props.action }
                                onDataUpdate={ this.updateData }
                                onSubmit={ this.onSubmit }
                                onSubmitDraft={ useDraftDisruptions && this.onSubmitDraft }
                                onSubmitUpdate={ this.onSubmitUpdate }
                                isEffectsRequiresToUpdate={ isEffectsRequiresToUpdate }
                                updateIsEffectsRequiresToUpdateState={ () => this.setState({ isEffectsRequiresToUpdate: false }) }
                                isEffectValid={ isEffectValid }
                                isEffectForPublishValid={ isEffectForPublishValid }
                                onDisruptionSelected={ key => this.setState({ selectedEffect: key }) }
                                onPublishUpdate={ this.onPublishUpdate } />
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
                            <CustomModal
                                className="disruption-creation__modal"
                                title="Save Disruption"
                                isModalOpen={ this.props.isApplyChangesOpen }>
                                <ApplyChangesModal applyChanges={ this.onSubmitIncidentUpdate } />
                            </CustomModal>
                            <CustomModal
                                className="disruption-creation__modal"
                                title="Publish Disruption"
                                isModalOpen={ this.props.isPublishAndApplyChangesOpen }>
                                <PublishAndApplyChangesModal publishIncidentChanges={ this.onPublishIncidentUpdate } />
                            </CustomModal>
                        </div>
                    )}
                </SidePanel>
                <WorkaroundPanel
                    disruptions={ incidentData.disruptions }
                    onWorkaroundUpdate={ this.updateDisruptionWorkaround }
                    onWorkaroundChange={ (key, newWorkarounds) => this.setState({
                        editableWorkarounds: {
                            key,
                            workarounds: newWorkarounds,
                        },
                    }) }
                />
                {this.props.editMode === EDIT_TYPE.EDIT && (
                    <EditEffectPanel
                        ref={ this.editEffectPanelRef }
                        disruptions={ incidentData.disruptions }
                        onWorkaroundUpdate={ this.updateDisruptionWorkaround }
                        modalOpenedTime={ incidentData.modalOpenedTime ? moment(incidentData.modalOpenedTime).toISOString() : '' }
                        disruptionRecurrent={ incidentData.recurrent }
                        onDisruptionsUpdate={ this.updateData }
                        isNotesRequiresToUpdate={ isNotesRequiresToUpdate }
                        updateIsNotesRequiresToUpdateState={ () => this.setState({ isNotesRequiresToUpdate: false }) }
                        isWorkaroundsRequiresToUpdate={ isWorkaroundsRequiresToUpdate }
                        updateIsWorkaroundsRequiresToUpdateState={ () => this.setState({ isWorkaroundsRequiresToUpdate: false }) }
                        workaroundsToSync={ workaroundsToSync }
                        updateEditableDisruption={ disruption => this.setState({ editableDisruption: disruption }) }
                        applyDisruptionChanges={ this.applyDisruptionChanges }
                        updateEffectValidationState={ valid => this.setState({ isEffectValid: valid }) }
                        updateIsEffectUpdatedState={ isUpdated => this.setState({ isEffectUpdated: isUpdated }) }
                        updateEffectValidationForPublishState={ valid => this.setState({ isEffectForPublishValid: valid }) }
                        onDisruptionChange={ disruption => this.setState({ disruptionToEdit: disruption }) }
                    />
                )}
                <Map
                    shouldOffsetForSidePanel
                    boundsToFit={ this.props.boundsToFit }
                    isLoading={ this.props.isLoading }
                    className={ `${this.props.isEditEffectPanelOpen ? 'edit-effect-panel-expanded' : ''} ${this.props.isWorkaroundPanelOpen && this.props.isEditEffectPanelOpen ? 'workaround-panel-expanded' : ''}` }
                >
                    { this.renderShapeLayer() }
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
                        } }
                    />
                    <HighlightingLayer stopDetail={ this.props.stopDetail } />
                    { this.renderStopsMarker() }
                    <DrawLayer
                        disabled={
                            !(
                                this.props.editMode === EDIT_TYPE.ADD_EFFECT
                                || (this.props.editMode === EDIT_TYPE.EDIT && this.state.selectedEffect)
                                || (this.props.editMode === EDIT_TYPE.CREATE && this.props.activeStep === 2)
                            )
                        }
                        disruptionType={ this.getIncidentType() }
                        onDrawCreated={ shape => this.props.searchByDrawing(
                            this.getIncidentType(),
                            this.props.useGeoSearchRoutesByDisruptionPeriod && (incidentData.endTime || incidentData.recurrent) ? {
                                ...shape,
                                activePeriods: incidentData.activePeriods.length > 0 ? incidentData.activePeriods : generateDisruptionActivePeriods(incidentData),
                            } : shape,
                        ) }
                        onDrawDeleted={ () => this.removeAffectedEntities() }
                    />
                </Map>
                <Button
                    className="disruption-creation-close-disruptions fixed-top mp-0 border-0 rounded-0"
                    onClick={ () => this.toggleModal('Cancellation', true) }>
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
                <IncidentLimitModal
                    isOpen={ this.state.isAlertModalOpen }
                    onClose={ () => this.setState({ isAlertModalOpen: false }) }
                    totalEntities={ this.state.totalEntities }
                    itemsSelectedText={ this.itemsSelectedText() }
                    maxLimit={ MAX_NUMBER_OF_ENTITIES }
                />
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
    editMode: PropTypes.string,
    updateIncident: PropTypes.func.isRequired,
    incidentToEdit: PropTypes.object,
    openCreateIncident: PropTypes.func.isRequired,
    searchByDrawing: PropTypes.func.isRequired,
    boundsToFit: PropTypes.array.isRequired,
    childStops: PropTypes.object.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    stopDetail: PropTypes.object.isRequired,
    isLoading: PropTypes.bool,
    useGeoSearchRoutesByDisruptionPeriod: PropTypes.bool.isRequired,
    isEditEffectPanelOpen: PropTypes.bool,
    isRequiresToUpdateNotes: PropTypes.bool,
    setRequireToUpdateIncidentForEditState: PropTypes.func.isRequired,
    getRoutesByShortName: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    setRequestToUpdateEditEffectState: PropTypes.func.isRequired,
    setRequestedDisruptionKeyToUpdateEditEffect: PropTypes.func.isRequired,
    isWorkaroundPanelOpen: PropTypes.bool,
    isApplyChangesOpen: PropTypes.bool,
    updateEditMode: PropTypes.func.isRequired,
    isPublishAndApplyChangesOpen: PropTypes.bool,
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    updateDisruptionKeyToWorkaroundEdit: PropTypes.func.isRequired,
    setDisruptionForWorkaroundEdit: PropTypes.func.isRequired,
    mapDrawingEntities: PropTypes.arrayOf(PropTypes.object).isRequired,
    toggleEditEffectPanel: PropTypes.func.isRequired,
    disruptionIncidentNoToEdit: PropTypes.string,
    cachedShapes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

CreateIncident.defaultProps = {
    isCreateOpen: false,
    isCancellationOpen: false,
    activeStep: 1,
    stops: [],
    routes: [],
    editMode: EDIT_TYPE.CREATE,
    incidentToEdit: {},
    isLoading: false,
    isEditEffectPanelOpen: false,
    isRequiresToUpdateNotes: false,
    isWorkaroundPanelOpen: false,
    isApplyChangesOpen: false,
    isPublishAndApplyChangesOpen: false,
    disruptionIncidentNoToEdit: '',
};

export default connect(state => ({
    action: getIncidentAction(state),
    isCreateOpen: isIncidentCreationOpen(state),
    isCancellationOpen: isIncidentCancellationModalOpen(state),
    activeStep: getIncidentStepCreation(state),
    stops: getAffectedStops(state),
    routes: getAffectedRoutes(state),
    editMode: getEditMode(state),
    incidentToEdit: getIncidentToEdit(state),
    boundsToFit: getBoundsToFit(state),
    childStops: getChildStops(state),
    stopDetail: getStopDetail(state),
    isLoading: getIncidentsLoadingState(state),
    useGeoSearchRoutesByDisruptionPeriod: useGeoSearchRoutesByDisruptionPeriod(state),
    useDraftDisruptions: useDraftDisruptions(state),
    isEditEffectPanelOpen: isEditEffectPanelOpen(state),
    isRequiresToUpdateNotes: isRequiresToUpdateNotes(state),
    isWorkaroundPanelOpen: isWorkaroundPanelOpen(state),
    isApplyChangesOpen: isApplyChangesModalOpen(state),
    isPublishAndApplyChangesOpen: isPublishAndApplyChangesModalOpen(state),
    mapDrawingEntities: getMapDrawingEntities(state),
    disruptionIncidentNoToEdit: getDisruptionKeyToEditEffect(state),
    cachedShapes: getCachedShapes(state),
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
    updateEditMode,
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
    setDisruptionForWorkaroundEdit,
    toggleEditEffectPanel,
})(CreateIncident);
