/* eslint-disable no-param-reassign */
import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Button } from 'reactstrap';

import '../../../../Common/OffCanvasLayout/OffCanvasLayout.scss';
import '../styles.scss';

import { AiOutlineClose } from 'react-icons/ai';
import Map from './Map';
import SidePanel from '../../../../Common/OffCanvasLayout/SidePanel/SidePanel';
import Wizard from '../../../../Common/wizard/Wizard';
import SelectEntities from '../WizardSteps/SelectEntities';
import SelectAffectedEntities from '../WizardSteps/SelectAffectedEntities';
import SelectDetails from '../WizardSteps/SelectDetails';
import {
    getDisruptionAction,
    isDisruptionCreationOpen,
    isDisruptionCancellationModalOpen,
    getDisruptionStepCreation,
    getAffectedStops,
    getAffectedRoutes,
    getShapes,
    getRouteColors,
} from '../../../../../redux/selectors/control/disruptions';
import {
    createDisruption,
    openCreateDisruption,
    toggleDisruptionModals,
    updateCurrentStep,
} from '../../../../../redux/actions/control/disruptions';
import { buildSubmitBody, momentFromDateTime } from '../../../../../utils/control/disruptions';
import { DEFAULT_IMPACT, DEFAULT_CAUSE, STATUSES } from '../../../../../types/disruptions-types';
import { DATE_FORMAT, TIME_FORMAT } from '../../../../../constants/disruptions';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import Confirmation from '../WizardSteps/Confirmation';
import Cancellation from '../WizardSteps/Cancellation';

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
        this.setState(prevState => ({
            disruptionData: {
                ...prevState.disruptionData,
                [key]: value,
            },
        }));
    }

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
    }

    toggleModal = (modalType, isOpen) => {
        const type = `is${modalType}Open`;
        this.setState({ [type]: isOpen });
        this.props.toggleDisruptionModals(type, isOpen);
    }

    isSubmitDisabled = (disruptionData) => {
        const isEntitiesEmpty = _.isEmpty(disruptionData.affectedEntities);
        const isPropsEmpty = _.some(_.omit(disruptionData,
            ['endDate', 'endTime', 'mode', 'affectedEntities', 'url']), _.isEmpty);
        return isEntitiesEmpty || isPropsEmpty;
    }

    render() {
        const { disruptionData, isConfirmationOpen } = this.state;
        return (
            <div className="sidepanel-control-component-view d-flex">
                <SidePanel
                    isOpen
                    isActive
                    className="sidepanel-primary-panel disruption-creation__sidepanel side-panel__scroll-size"
                    toggleButton={ false }>
                    <div className="disruption-creation__container">
                        <div className="disruption-creation__steps p-4">
                            <ol>
                                <li className={ `position-relative ${this.props.activeStep === 1 ? 'active' : ''}` }>
                                    Search location
                                </li>
                                <li className={ this.props.activeStep === 2 ? 'active' : '' }>
                                    Select routes
                                </li>
                                <li className={ this.props.activeStep === 3 ? 'active' : '' }>
                                    Enter Details
                                </li>
                            </ol>
                        </div>
                        <h2 className="pl-4 pr-4">Create a new Disruption</h2>
                        <Wizard
                            className="disruption-creation__wizard container p-0"
                            data={ disruptionData }
                            response={ this.props.action }
                            isSubmitDisabled={ this.isSubmitDisabled(disruptionData) }
                            onDataUpdate={ this.updateData }
                            onSubmit={ this.onSubmit }>
                            <SelectEntities />
                            <SelectAffectedEntities />
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
                    stops={ this.props.stops }
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
};

CreateDisruption.defaultProps = {
    isCreateOpen: false,
    isCancellationOpen: false,
    activeStep: 1,
    stops: [],
    routes: [],
    shapes: [],
    routeColors: [],
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
}), { createDisruption, openCreateDisruption, toggleDisruptionModals, updateCurrentStep })(CreateDisruption);
