import React from 'react';

import { isEmpty, uniqBy } from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import { AiOutlineClose } from 'react-icons/ai';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { RRule } from 'rrule';
import { DATE_FORMAT, TIME_FORMAT } from '../../../../../constants/disruptions';
import {
    createIncident,
    openCreateIncident,
    toggleIncidentModals,
    updateCurrentStep,
    updateIncident,
    searchByDrawing,
    updateAffectedStopsState,
    updateIncidentToEdit,
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
} from '../../../../../redux/selectors/control/incidents';
import { STATUSES, DISRUPTION_TYPE, INCIDENTS_CREATION_STEPS, DEFAULT_SEVERITY, ALERT_TYPES } from '../../../../../types/disruptions-types';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../../types/disruption-cause-and-effect';
import {
    buildSubmitBody,
    momentFromDateTime,
    getRecurrenceDates,
    itemToEntityTransformers,
    toCamelCaseKeys,
    generateDisruptionActivePeriods,
} from '../../../../../utils/control/disruptions';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
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
import PassengerImpactDrawer from '../../PassengerImpact/PassengerImpactDrawer';
import { usePassengerImpact, useGeoSearchRoutesByDisruptionPeriod, useDraftDisruptions } from '../../../../../redux/selectors/appSettings';
import LoadingOverlay from '../../../../Common/Overlay/LoadingOverlay';
import WorkaroundPanel from '../WizardSteps/WorkaroundPanel';

const INIT_STATE = {
    startTime: '',
    startDate: '',
    endTime: '',
    endDate: '',
    impact: DEFAULT_IMPACT.value,
    cause: DEFAULT_CAUSE.value,
    affectedEntities: [],
    activePeriods: [],
    mode: '-',
    status: STATUSES.NOT_STARTED,
    header: '',
    description: '',
    url: '',
    createNotification: false,
    exemptAffectedTrips: false,
    recurrent: false,
    duration: '',
    recurrencePattern: { freq: RRule.WEEKLY },
    disruptionType: DISRUPTION_TYPE.ROUTES,
    severity: DEFAULT_SEVERITY.value,
    passengerCount: undefined,

    causeTitle: '',
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
                affectedEntities: [...this.props.routes, ...this.props.stops],
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
                affectedEntities: [...this.props.routes, ...this.props.stops],
                status: STATUSES.NOT_STARTED,
                disruptionType,
            },
        });
    };

    isFinishButtonDisabled = () => !this.state.isSelectEntitiesValid || !this.state.isSetDetailsValid;

    onUpdateDetailsValidation = isValid => this.setState({ isSetDetailsValid: isValid });

    onUpdateEntitiesValidation = isValid => this.setState({ isSelectEntitiesValid: isValid });

    setupDataEdit = () => {
        const { incidentToEdit } = this.props;
        const { startTime, endTime } = incidentToEdit;

        const disruptionType = isEmpty(this.props.routes) && !isEmpty(this.props.stops) ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES;
        this.setState({
            incidentData: {
                ...INIT_STATE,
                disruptionType,
                ...incidentToEdit,
                ...(startTime && { startTime: startTime.toISOString() }),
                ...(endTime && { endTime: endTime.toISOString() }),
            },
        });
    };

    setupData = () => {
        const now = moment();
        const disruptionType = isEmpty(this.props.routes) && !isEmpty(this.props.stops) ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES;
        this.setState({
            incidentData: {
                ...INIT_STATE,
                affectedEntities: [...this.props.routes, ...this.props.stops],
                startTime: this.props.isCreateOpen ? now.format(TIME_FORMAT) : INIT_STATE.startTime,
                startDate: now.format(DATE_FORMAT),
                disruptionType,
            },
        });
    };

    componentDidMount() {
        if (this.props.editMode === EDIT_TYPE.COPY) {
            this.props.updateCurrentStep(1);
            this.setupDataCopy();
        } else if (this.props.editMode === EDIT_TYPE.EDIT) {
            this.props.updateCurrentStep(2);
            this.setupDataEdit();
        } else {
            this.props.updateCurrentStep(1);
            this.setupData();
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
        if (key === 'disruptions') {
            console.error('updateData disruptions', value);
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

    onSubmit = async () => {
        this.toggleModal('Confirmation', true);
        const { incidentData } = this.state;

        const startDate = incidentData.startDate ? incidentData.startDate : moment(incidentData.startTime).format(DATE_FORMAT);
        const startTimeMoment = momentFromDateTime(startDate, incidentData.startTime);

        let endTimeMoment;
        if (!isEmpty(incidentData.endDate) && !isEmpty(incidentData.endTime)) {
            endTimeMoment = momentFromDateTime(incidentData.endDate, incidentData.endTime);
        }
        const disruption = {
            ...incidentData,
            endTime: endTimeMoment,
            startTime: startTimeMoment,
            notes: [],
        };
        console.error('onSubmit incidentData', incidentData);
        console.warn('onSubmit incidentData', buildSubmitBody(disruption, this.props.routes, this.props.stops, incidentData.workarounds));
        // this.props.createIncident(buildSubmitBody(disruption, this.props.routes, this.props.stops, incidentData.workarounds)); // TODO
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

        const disruption = {
            ...incidentData,
            endTime: endTimeMoment,
            startTime: startTimeMoment,
            status: STATUSES.DRAFT,
            recurrencePattern,
            notes: [],
        };
        // this.props.createIncident(buildSubmitBody(disruption, this.props.routes, this.props.stops, incidentData.workarounds)); // TODO
        this.props.openCreateIncident(false);
        this.props.toggleIncidentModals('isConfirmationOpen', true);
    };

    onSubmitUpdate = async () => {
        const { incidentData } = this.state;
        const incidentRequest = buildSubmitBody(this.props.incidentToEdit, this.props.routes, this.props.stops, incidentData.workarounds);
        this.props.updateIncident(incidentRequest);
        this.props.openCreateIncident(false);
        this.props.toggleIncidentModals('isConfirmationOpen', true);
    };

    toggleModal = (modalType, isOpen) => {
        const type = `is${modalType}Open`;
        this.setState({ [type]: isOpen });
        this.props.toggleIncidentModals(type, isOpen);
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
        const { incidentData, isConfirmationOpen } = this.state;
        const renderMainHeading = () => {
            const titleByMode = {
                [EDIT_TYPE.CREATE]: 'Create a new Disruption',
                [EDIT_TYPE.COPY]: `Copy Disruption #${this.props.incidentToEdit.incidentNo}`,
                [EDIT_TYPE.EDIT]: 'Edit Disruption',
            };
            return this.props.activeStep === 1 && <h2 className="pl-4 pr-4">{titleByMode[this.props.editMode]}</h2>;
        };
        return (
            <div className="sidepanel-control-component-view d-flex">
                { (this.props.isLoading) && (<LoadingOverlay />) }
                <SidePanel
                    isOpen
                    isActive
                    className="sidepanel-primary-panel disruption-creation__sidepanel side-panel__scroll-size"
                    toggleButton={ false }>
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
                            {this.props.editMode !== EDIT_TYPE.EDIT && (<SelectDetails onUpdateDetailsValidation={ this.onUpdateDetailsValidation } />)}
                            <SelectEffects
                                onUpdateEntitiesValidation={ this.onUpdateEntitiesValidation }
                                onSubmitUpdate={ this.onSubmitUpdate } />
                            <Workarounds
                                isFinishDisabled={ useDraftDisruptions ? this.isFinishButtonDisabled() : false }
                                onSubmitUpdate={ this.onSubmitUpdate } />
                        </Wizard>
                        <CustomModal
                            className="disruption-creation__modal"
                            title={ this.props.action.resultDisruptionId ? 'Disruption created' : 'Log a disruption' }
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
                </SidePanel>
                <WorkaroundPanel
                    disruptionData={ this.state.incidentData }
                    onUpdatePassengerImpactData={ ({ total }) => {
                        this.updateData('passengerCount', total);
                        this.props.updateIncidentToEdit({ ...this.props.incidentToEdit, passengerCount: total });
                    } }
                />
                { this.props.activeStep === 3 && this.props.usePassengerImpact && (
                    <PassengerImpactDrawer
                        disruptionData={ this.state.incidentData }
                        onUpdatePassengerImpactData={ ({ total }) => {
                            this.updateData('passengerCount', total);
                            this.props.updateIncidentToEdit({ ...this.props.incidentToEdit, passengerCount: total });
                        } }
                    />
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
            </div>
        );
    }
}

CreateIncident.propTypes = {
    createIncident: PropTypes.func.isRequired,
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
    updateIncidentToEdit: PropTypes.func.isRequired,
    usePassengerImpact: PropTypes.bool.isRequired,
    useGeoSearchRoutesByDisruptionPeriod: PropTypes.bool.isRequired,
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
}), {
    createIncident,
    openCreateIncident,
    toggleIncidentModals,
    updateCurrentStep,
    updateIncident,
    searchByDrawing,
    updateAffectedStopsState,
    updateIncidentToEdit,
})(CreateIncident);
