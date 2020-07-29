import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import moment from 'moment';
import { Button } from 'reactstrap';

import CustomModal from '../../../Common/CustomModal/CustomModal';
import Wizard from '../../../Common/wizard/Wizard';
import SelectRoutes from './WizardSteps/SelectRoutes';
import SelectDetails from './WizardSteps/SelectDetails';
import Confirmation from './WizardSteps/Confirmation';
import { createDisruption } from '../../../../redux/actions/control/disruptions';
import { modalStatus } from '../../../../redux/actions/activity';
import { getDisruptionAction } from '../../../../redux/selectors/control/disruptions';
import { DEFAULT_IMPACT, DEFAULT_CAUSE, STATUSES } from '../../../../types/disruptions-types';
import VEHICLE_TYPES from '../../../../types/vehicle-types';
import './styles.scss';
import { DATE_FORMAT, TIME_FORMAT } from '../../../../constants/disruptions';
import { momentFromDateTime } from '../../../../utils/control/disruptions';

const INIT_STATE = {
    startTime: '',
    startDate: '',
    endTime: '',
    endDate: '',
    impact: DEFAULT_IMPACT.value,
    cause: DEFAULT_CAUSE.value,
    affectedRoutes: [],
    mode: '-',
    status: STATUSES.IN_PROGRESS,
    header: '',
    description: '',
    url: '',
};
class DisruptionCreation extends React.Component {
    static propTypes = {
        createDisruption: PropTypes.func.isRequired,
        action: PropTypes.object.isRequired,
        modalStatus: PropTypes.func.isRequired,
    }

    constructor(props) {
        super(props);

        this.state = {
            isOpen: false,
            disruptionData: INIT_STATE,
        };
    }

    toggleModal = (isOpen) => {
        const now = moment();
        this.setState({
            isOpen,
            disruptionData: {
                ...INIT_STATE,
                startTime: isOpen ? now.format(TIME_FORMAT) : INIT_STATE.startTime,
                startDate: now.format(DATE_FORMAT),
            },
        });
        this.props.modalStatus(isOpen);
    }

    updateData = (key, value) => {
        this.setState(prevState => ({
            disruptionData: {
                ...prevState.disruptionData,
                [key]: value,
            },
        }));
    }

    buildSubmitBody = () => {
        const { disruptionData } = this.state;
        const modes = [];
        const camelCaseRoutes = [];
        const startTimeMoment = momentFromDateTime(disruptionData.startDate, disruptionData.startTime);
        let endTimeMoment;
        if (!_.isEmpty(disruptionData.endDate) && !_.isEmpty(disruptionData.endTime)) {
            endTimeMoment = momentFromDateTime(disruptionData.endDate, disruptionData.endTime);
        }

        disruptionData.affectedRoutes.forEach((route) => {
            modes.push(VEHICLE_TYPES[route.route_type].type);
            camelCaseRoutes.push(_.mapKeys(route, (value, key) => _.camelCase(key)));
        });

        return {
            ...disruptionData,
            mode: _.uniq(modes).join(', '),
            affectedRoutes: camelCaseRoutes,
            startTime: startTimeMoment,
            endTime: endTimeMoment,
            status: startTimeMoment.isAfter(moment()) ? STATUSES.NOT_STARTED : STATUSES.IN_PROGRESS,
        };
    }

    onSubmit = () => this.props.createDisruption(this.buildSubmitBody());

    render() {
        const { disruptionData, isOpen } = this.state;
        const isSubmitDisabled = _.some(_.omit(disruptionData,
            ['endDate', 'endTime', 'mode', 'url']), _.isEmpty);

        return (
            <div className="disruption-creation">
                <Button
                    className="cc-btn-primary"
                    onClick={ () => this.toggleModal(true) }>
                    Create a new disruption
                </Button>
                <CustomModal
                    className="disruption-creation__modal cc-modal-standard-width"
                    title="Log a disruption"
                    isModalOpen={ isOpen }
                    onClose={ () => this.toggleModal(false) }>
                    <Wizard
                        className="disruption-creation__wizard container"
                        data={ disruptionData }
                        response={ this.props.action }
                        isSubmitDisabled={ isSubmitDisabled }
                        onStepUpdate={ activeStep => activeStep === null && this.toggleModal(false) }
                        onDataUpdate={ this.updateData }
                        onSubmit={ this.onSubmit }>
                        <SelectRoutes />
                        <SelectDetails />
                        <Confirmation />
                    </Wizard>
                </CustomModal>
            </div>
        );
    }
}

export default connect(state => ({
    action: getDisruptionAction(state),
}),
{ createDisruption, modalStatus })(DisruptionCreation);
