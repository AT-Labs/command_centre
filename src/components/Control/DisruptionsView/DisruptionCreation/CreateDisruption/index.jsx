/* eslint-disable no-param-reassign */
import _ from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
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
    isDisruptionCancellationModalOpen,
    isDisruptionCreationOpen,
} from '../../../../../redux/selectors/control/disruptions';
import { DEFAULT_CAUSE, DEFAULT_IMPACT, STATUSES } from '../../../../../types/disruptions-types';
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
import Map from './Map';

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
};

class CreateDisruption extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            disruptionData: INIT_STATE,
            isConfirmationOpen: false,
        };
    }

    componentDidMount() {
        this.props.updateCurrentStep(1);
        const now = moment();
        this.setState({
            disruptionData: {
                ...INIT_STATE,
                affectedEntities: [...this.props.routes, ...this.props.stops],
                startTime: this.props.isCreateOpen ? now.format(TIME_FORMAT) : INIT_STATE.startTime,
                startDate: now.format(DATE_FORMAT),
            },
        });
    }

    updateData = (key, value) => {
        const { disruptionData } = this.state;
        let recurrenceDates;
        if (['startDate', 'startTime', 'endDate'].includes(key)) {
            const updatedDisruptionData = { ...disruptionData, [key]: value };
            recurrenceDates = getRecurrenceDates(updatedDisruptionData.startDate, updatedDisruptionData.startTime, updatedDisruptionData.endDate);
        }
        this.setState(prevState => ({
            disruptionData: {
                ...prevState.disruptionData,
                [key]: value,
                ...(recurrenceDates && { recurrencePattern: {
                    ...prevState.disruptionData.recurrencePattern,
                    ...recurrenceDates,
                } }),
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
        return (
            <div className="sidepanel-control-component-view d-flex">
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
                            </ol>
                        </div>
                        <h2 className="pl-4 pr-4">Create a new Disruption</h2>
                        <Wizard
                            className="disruption-creation__wizard container p-0"
                            data={ disruptionData }
                            response={ this.props.action }
                            onDataUpdate={ this.updateData }
                            onSubmit={ this.onSubmit }>
                            <SelectDisruptionEntities
                                onSubmitUpdate={ this.onSubmitUpdate } />
                            <SelectDetails />
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
                    stops={ _.uniqBy(this.props.stops, stop => stop.stopId) }
                    routeColors={ this.props.routeColors } />
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
    routeColors: PropTypes.array,
    updateDisruption: PropTypes.func.isRequired,
    disruptionToEdit: PropTypes.object,
    openCreateDisruption: PropTypes.func.isRequired,
};

CreateDisruption.defaultProps = {
    isCreateOpen: false,
    isCancellationOpen: false,
    activeStep: 1,
    stops: [],
    routes: [],
    shapes: [],
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
    routeColors: getRouteColors(state),
    disruptionToEdit: getDisruptionToEdit(state),
}), { createDisruption, openCreateDisruption, toggleDisruptionModals, updateCurrentStep, updateDisruption })(CreateDisruption);
