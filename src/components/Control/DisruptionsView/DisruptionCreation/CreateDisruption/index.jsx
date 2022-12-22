import React from 'react';

import _ from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import { AiOutlineClose } from 'react-icons/ai';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { RRule } from 'rrule';
import { DATE_FORMAT, TIME_FORMAT } from '../../../../../constants/disruptions';
import {
    createDisruption,
    openCreateDisruption,
    toggleDisruptionModals,
    updateCurrentStep,
    updateDisruption,
    searchByDrawing,
    updateAffectedStopsState,
} from '../../../../../redux/actions/control/disruptions';
import {
    getAffectedRoutes,
    getAffectedStops,
    getDisruptionAction,
    getDisruptionStepCreation,
    getDisruptionToEdit,
    getRouteColors,
    getShapes,
    getEditMode,
    isDisruptionCancellationModalOpen,
    isDisruptionCreationOpen,
    getBoundsToFit,
    getDisruptionsLoadingState,
} from '../../../../../redux/selectors/control/disruptions';
import { useWorkarounds } from '../../../../../redux/selectors/appSettings';
import { STATUSES, DISRUPTION_TYPE, DISRUPTION_CREATION_STEPS, DEFAULT_SEVERITY, ALERT_TYPES } from '../../../../../types/disruptions-types';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../../types/disruption-cause-and-effect';
import { buildSubmitBody, momentFromDateTime, getRecurrenceDates, itemToEntityTransformers, toCamelCaseKeys } from '../../../../../utils/control/disruptions';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import '../../../../Common/OffCanvasLayout/OffCanvasLayout.scss';
import SidePanel from '../../../../Common/OffCanvasLayout/SidePanel/SidePanel';
import Wizard from '../../../../Common/wizard/Wizard';
import '../styles.scss';
import Cancellation from '../WizardSteps/Cancellation';
import Confirmation from '../WizardSteps/Confirmation';
import SelectDetails from '../WizardSteps/SelectDetails';
import SelectDisruptionEntities from '../WizardSteps/SelectDisruptionEntities';
import Workarounds from '../WizardSteps/Workarounds';
import { parseRecurrencePattern } from '../../../../../utils/recurrence';
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

const INIT_STATE = {
    startTime: '',
    startDate: '',
    endTime: '',
    endDate: '',
    impact: DEFAULT_IMPACT.value,
    cause: DEFAULT_CAUSE.value,
    affectedEntities: [],
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
    passengerCount: [],
};

const { STOP } = SEARCH_RESULT_TYPE;

export class CreateDisruption extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            disruptionData: INIT_STATE,
            isConfirmationOpen: false,
            showAlert: false,
        };
    }

    setupDataCopy = () => {
        const now = moment();

        const copiedData = this.props.disruptionToEdit;

        if (!moment.isMoment(copiedData.startTime)) {
            const startDate = copiedData.startDate ? copiedData.startDate : moment(copiedData.startTime).format(DATE_FORMAT);
            copiedData.startTime = momentFromDateTime(startDate, copiedData.startTime);
        }

        if (moment.isMoment(copiedData.endTime)) {
            copiedData.endDate = now.isAfter(copiedData.endTime) ? '' : copiedData.endTime.format(DATE_FORMAT);
            copiedData.endTime = now.isAfter(copiedData.endTime) ? '' : copiedData.endTime.format(TIME_FORMAT);
        }

        const recurrenceDates = getRecurrenceDates(copiedData.startDate, copiedData.startTime, copiedData.endDate);
        const recurrencePattern = this.props.disruptionToEdit.recurrent ? parseRecurrencePattern(this.props.disruptionToEdit.recurrencePattern) : { freq: RRule.WEEKLY };

        copiedData.startDate = now.isSameOrAfter(copiedData.startTime) ? now.format(DATE_FORMAT) : copiedData.startTime.format(DATE_FORMAT);
        copiedData.startTime = now.isSameOrAfter(copiedData.startTime) ? now.format(TIME_FORMAT) : copiedData.startTime.format(TIME_FORMAT);

        const disruptionType = _.isEmpty(this.props.routes) && !_.isEmpty(this.props.stops) ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES;

        this.setState({
            disruptionData: {
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

    setupDataEdit = () => {
        const { workarounds } = this.props.disruptionToEdit;

        const disruptionType = _.isEmpty(this.props.routes) && !_.isEmpty(this.props.stops) ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES;
        this.setState({
            disruptionData: {
                ...INIT_STATE,
                disruptionType,
                workarounds,
            },
        });
    };

    setupData = () => {
        const now = moment();
        const disruptionType = _.isEmpty(this.props.routes) && !_.isEmpty(this.props.stops) ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES;
        this.setState({
            disruptionData: {
                ...INIT_STATE,
                affectedEntities: [...this.props.routes, ...this.props.stops],
                startTime: this.props.isCreateOpen ? now.format(TIME_FORMAT) : INIT_STATE.startTime,
                startDate: now.format(DATE_FORMAT),
                disruptionType,
            },
        });
    };

    componentDidMount() {
        this.props.updateCurrentStep(1);

        if (this.props.editMode === EDIT_TYPE.COPY) {
            this.setupDataCopy();
        } else if (this.props.editMode === EDIT_TYPE.EDIT) {
            this.setupDataEdit();
        } else {
            this.setupData();
        }
    }

    updateData = (key, value) => {
        const { disruptionData } = this.state;
        let recurrenceDates;
        let recurrencePattern;

        if (['startDate', 'startTime', 'endDate', 'recurrent'].includes(key)) {
            const updatedDisruptionData = { ...disruptionData, [key]: value };
            recurrenceDates = getRecurrenceDates(updatedDisruptionData.startDate, updatedDisruptionData.startTime, updatedDisruptionData.endDate);
            recurrencePattern = disruptionData.recurrent ? parseRecurrencePattern(disruptionData.recurrencePattern) : { freq: RRule.WEEKLY };
        }
        this.setState(prevState => ({
            disruptionData: {
                ...prevState.disruptionData,
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

    onSubmit = () => {
        this.toggleModal('Confirmation', true);
        const { disruptionData } = this.state;

        const startDate = disruptionData.startDate ? disruptionData.startDate : moment(disruptionData.startTime).format(DATE_FORMAT);
        const startTimeMoment = momentFromDateTime(startDate, disruptionData.startTime);

        let endTimeMoment;
        if (!_.isEmpty(disruptionData.endDate) && !_.isEmpty(disruptionData.endTime)) {
            endTimeMoment = momentFromDateTime(disruptionData.endDate, disruptionData.endTime);
        }
        const disruption = {
            ...disruptionData,
            endTime: endTimeMoment,
            startTime: startTimeMoment,
            notes: [],
        };
        this.props.createDisruption(buildSubmitBody(disruption, this.props.routes, this.props.stops, disruptionData.workarounds));
    };

    onSubmitUpdate = () => {
        const { disruptionData } = this.state;
        const disruptionRequest = buildSubmitBody(this.props.disruptionToEdit, this.props.routes, this.props.stops, disruptionData.workarounds);
        this.props.updateDisruption(disruptionRequest);
        this.props.openCreateDisruption(false);
        this.props.toggleDisruptionModals('isConfirmationOpen', true);
    };

    toggleModal = (modalType, isOpen) => {
        const type = `is${modalType}Open`;
        this.setState({ [type]: isOpen });
        this.props.toggleDisruptionModals(type, isOpen);
    };

    renderSteps = () => {
        const steps = {
            [DISRUPTION_CREATION_STEPS.SEARCH_ROUTES_STOPS]: (
                <li key="1" className={ `position-relative ${this.props.activeStep === 1 ? 'active' : ''}` }>
                    Search routes or stops
                </li>
            ),
            [DISRUPTION_CREATION_STEPS.ENTER_DETAILS]: (
                <li key="2" className={ this.props.activeStep === 2 ? 'active' : '' }>
                    Enter Details
                </li>
            ),
            [DISRUPTION_CREATION_STEPS.ADD_WORKAROUNDS]: (
                <li key="3" className={ this.props.activeStep === 3 ? 'active' : '' }>
                    Add Workarounds
                    <div className="text-muted optional-text">(Optional)</div>
                </li>
            ),
        };

        return (
            <div className="disruption-creation__steps p-4">
                <ol>
                    { this.props.editMode !== EDIT_TYPE.EDIT && ([
                        steps[DISRUPTION_CREATION_STEPS.SEARCH_ROUTES_STOPS],
                        steps[DISRUPTION_CREATION_STEPS.ENTER_DETAILS],
                        ...(this.props.useWorkarounds ? [steps[DISRUPTION_CREATION_STEPS.ADD_WORKAROUNDS]] : []),
                    ])}
                    { this.props.editMode === EDIT_TYPE.EDIT && ([
                        steps[DISRUPTION_CREATION_STEPS.SEARCH_ROUTES_STOPS],
                        ...(this.props.useWorkarounds ? [steps[DISRUPTION_CREATION_STEPS.ADD_WORKAROUNDS]] : []),
                        ...(!this.props.useWorkarounds ? [steps[DISRUPTION_CREATION_STEPS.ENTER_DETAILS]] : []),
                    ])}
                </ol>
            </div>
        );
    };

    render() {
        const { disruptionData, isConfirmationOpen } = this.state;
        const renderMainHeading = () => {
            const titleByMode = {
                [EDIT_TYPE.CREATE]: 'Create a new Disruption',
                [EDIT_TYPE.COPY]: `Copy Disruption #${this.props.disruptionToEdit.incidentNo}`,
                [EDIT_TYPE.EDIT]: 'Edit Disruption',
            };
            return <h2 className="pl-4 pr-4">{titleByMode[this.props.editMode]}</h2>;
        };
        return (
            <div className={ `sidepanel-control-component-view d-flex ${this.props.useWorkarounds && 'disruptions-sidepanel-with-workarounds'}` }>
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
                            data={ disruptionData }
                            response={ this.props.action }
                            onDataUpdate={ this.updateData }
                            onSubmit={ this.onSubmit }>
                            <SelectDisruptionEntities onSubmitUpdate={ this.onSubmitUpdate } />
                            <SelectDetails />
                            { this.props.useWorkarounds && (
                                <Workarounds
                                    onSubmitUpdate={ this.onSubmitUpdate } />
                            )}
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
                <Map
                    shouldOffsetForSidePanel
                    boundsToFit={ this.props.boundsToFit }
                    isLoading={ this.props.isLoading }
                >
                    <ShapeLayer
                        shapes={ this.props.shapes }
                        routeColors={ this.props.routeColors } />
                    <StopsLayer
                        childStops={ this.props.activeStep === 1 ? this.props.childStops : undefined }
                        stopDetail={ this.props.stopDetail }
                        focusZoom={ 16 }
                        onStopClick={ (stop) => {
                            if (disruptionData.disruptionType === DISRUPTION_TYPE.ROUTES) {
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
                        stops={ _.uniqBy([...this.props.stops, ...this.props.routes], stop => stop.stopCode).map(stop => itemToEntityTransformers[STOP.type](stop).data) }
                        size={ 28 }
                        tooltip
                        maximumStopsToDisplay={ 200 } />
                    <DrawLayer
                        disruptionType={ disruptionData.disruptionType }
                        onDrawCreated={ shape => this.props.searchByDrawing(disruptionData.disruptionType, shape) }
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
            </div>
        );
    }
}

CreateDisruption.propTypes = {
    createDisruption: PropTypes.func.isRequired,
    action: PropTypes.object.isRequired,
    isCreateOpen: PropTypes.bool,
    toggleDisruptionModals: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func.isRequired,
    isCancellationOpen: PropTypes.bool,
    activeStep: PropTypes.number,
    stops: PropTypes.array,
    routes: PropTypes.array,
    shapes: PropTypes.array,
    editMode: PropTypes.string,
    routeColors: PropTypes.array,
    updateDisruption: PropTypes.func.isRequired,
    disruptionToEdit: PropTypes.object,
    openCreateDisruption: PropTypes.func.isRequired,
    useWorkarounds: PropTypes.bool.isRequired,
    searchByDrawing: PropTypes.func.isRequired,
    boundsToFit: PropTypes.array.isRequired,
    childStops: PropTypes.object.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    stopDetail: PropTypes.object.isRequired,
    isLoading: PropTypes.bool,
};

CreateDisruption.defaultProps = {
    isCreateOpen: false,
    isCancellationOpen: false,
    activeStep: 1,
    stops: [],
    routes: [],
    shapes: [],
    editMode: EDIT_TYPE.CREATE,
    routeColors: [],
    disruptionToEdit: {},
    isLoading: false,
};

export default connect(state => ({
    action: getDisruptionAction(state),
    isCreateOpen: isDisruptionCreationOpen(state),
    isCancellationOpen: isDisruptionCancellationModalOpen(state),
    activeStep: getDisruptionStepCreation(state),
    stops: getAffectedStops(state),
    routes: getAffectedRoutes(state),
    shapes: getShapes(state),
    editMode: getEditMode(state),
    routeColors: getRouteColors(state),
    disruptionToEdit: getDisruptionToEdit(state),
    useWorkarounds: useWorkarounds(state),
    boundsToFit: getBoundsToFit(state),
    childStops: getChildStops(state),
    stopDetail: getStopDetail(state),
    isLoading: getDisruptionsLoadingState(state),
}), {
    createDisruption,
    openCreateDisruption,
    toggleDisruptionModals,
    updateCurrentStep,
    updateDisruption,
    searchByDrawing,
    updateAffectedStopsState,
})(CreateDisruption);
