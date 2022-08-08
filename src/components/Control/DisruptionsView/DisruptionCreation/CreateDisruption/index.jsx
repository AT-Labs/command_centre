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
} from '../../../../../redux/selectors/control/disruptions';
import { useWorkarounds } from '../../../../../redux/selectors/appSettings';
import { DEFAULT_CAUSE, DEFAULT_IMPACT, STATUSES, DISRUPTION_TYPE } from '../../../../../types/disruptions-types';
import { buildSubmitBody, momentFromDateTime, getRecurrenceDates } from '../../../../../utils/control/disruptions';
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
import Map from './Map';
import { parseRecurrencePattern } from '../../../../../utils/recurrence';
import EDIT_TYPE from '../../../../../types/edit-types';

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
};

export class CreateDisruption extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            disruptionData: INIT_STATE,
            isConfirmationOpen: false,
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
        };
        this.props.createDisruption(buildSubmitBody(disruption, this.props.routes, this.props.stops));
    };

    onSubmitUpdate = () => {
        const disruptionRequest = buildSubmitBody(this.props.disruptionToEdit, this.props.routes, this.props.stops);
        this.props.updateDisruption(disruptionRequest);
        this.props.openCreateDisruption(false);
        this.props.toggleDisruptionModals('isConfirmationOpen', true);
    };

    toggleModal = (modalType, isOpen) => {
        const type = `is${modalType}Open`;
        this.setState({ [type]: isOpen });
        this.props.toggleDisruptionModals(type, isOpen);
    };

    render() {
        const { disruptionData, isConfirmationOpen } = this.state;

        const renderMainHeading = () => {
            if (this.props.editMode === EDIT_TYPE.COPY) {
                return <h2 className="pl-4 pr-4">{`Copy Disruption #${this.props.disruptionToEdit.incidentNo}`}</h2>;
            }
            return <h2 className="pl-4 pr-4">Create a new Disruption</h2>;
        };

        return (
            <div className={ `sidepanel-control-component-view d-flex ${this.props.useWorkarounds && 'disruptions-sidepanel-with-workarounds'}` }>
                <SidePanel
                    isOpen
                    isActive
                    className="sidepanel-primary-panel disruption-creation__sidepanel side-panel__scroll-size"
                    toggleButton={ false }>
                    <div className="disruption-creation__container h-100">
                        <div className="disruption-creation__steps p-4">
                            <ol>
                                <li className={ `position-relative ${this.props.activeStep === 1 ? 'active' : ''}` }>
                                    Search routes or stops
                                </li>
                                <li className={ this.props.activeStep === 2 ? 'active' : '' }>
                                    Enter Details
                                </li>
                                { this.props.useWorkarounds && (
                                    <li className={ this.props.activeStep === 3 ? 'active' : '' }>
                                        Add Workarounds
                                    </li>
                                )}
                            </ol>
                        </div>
                        {renderMainHeading()}
                        <Wizard
                            className="disruption-creation__wizard container p-0"
                            data={ disruptionData }
                            response={ this.props.action }
                            onDataUpdate={ this.updateData }
                            onSubmit={ this.onSubmit }>
                            <SelectDisruptionEntities
                                onSubmitUpdate={ this.onSubmitUpdate } />
                            <SelectDetails />
                            { this.props.useWorkarounds && <Workarounds />}
                        </Wizard>
                        <CustomModal
                            className="disruption-creation__modal"
                            title="Log a disruption"
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
                    shapes={ this.props.shapes }
                    stops={ _.uniqBy([...this.props.stops, ...this.props.routes], stop => stop.stopCode) }
                    routeColors={ this.props.routeColors }
                    disruptionType={ disruptionData.disruptionType } />
                <Button
                    className="disruption-creation-close-disruptions fixed-top mp-0 border-0 rounded-0"
                    onClick={ () => this.toggleModal('Cancellation', true) }>
                    Close
                    <AiOutlineClose className="disruption-creation-close" size={ 20 } />
                </Button>
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
}), { createDisruption, openCreateDisruption, toggleDisruptionModals, updateCurrentStep, updateDisruption })(CreateDisruption);
