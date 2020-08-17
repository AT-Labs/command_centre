import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import { IoIosWarning } from 'react-icons/io';
import { FormGroup, Input, Label } from 'reactstrap';

import MESSAGING_MODAL_TYPE from '../../../../types/messaging-modal-types';
import { getTimePickerOptions, formatGroupsForPresentation } from '../../../../utils/helpers';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import Picklist from '../../../Common/Picklist/Picklist';
import ControlSearch from '../../Common/ControlSearch/ControlSearch';
import { getAllStops } from '../../../../redux/selectors/control/stopMessaging/stops';
import { dismissError } from '../../../../redux/actions/activity';
import { getError } from '../../../../redux/selectors/activity';
import ModalAlert from '../../BlocksView/BlockModals/ModalAlert';
import { getAllStopGroups, allSystemStopGroups } from '../../../../redux/selectors/control/stopMessaging/stopGroups';
import StandardFilter from '../../Common/Filters/StandardFilter';
import '../../../../../node_modules/flatpickr/dist/flatpickr.css';

const currentDate = () => new Date();
const currentTime = () => moment().format('HH:mm');
const MAX_CHARACTERS = 224;
const PRIORITY_LIST = [
    'low',
    'normal',
    'high',
    'critical',
    'emergency',
];
const OPTIONS = getTimePickerOptions();
const INIT_STATE = {
    stopsAndGroups: [],
    message: '',
    startTime: currentTime(),
    startDate: currentDate(),
    endTime: '',
    endDate: null,
    priority: '',
    hasModalBeenOpen: true,
    isModalOpen: false,
};
export class StopMessageModal extends React.Component {
    static propTypes = {
        isModalOpen: PropTypes.bool.isRequired,
        modalType: PropTypes.string,
        onClose: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        dismissError: PropTypes.func.isRequired,
        error: PropTypes.object,
        allStops: PropTypes.array.isRequired,
        onAction: PropTypes.func.isRequired,
        activeMessage: PropTypes.object, // eslint-disable-line
        stopsGroups: PropTypes.array,
    }

    static defaultProps = {
        error: {},
        modalType: null,
        stopsGroups: [],
        activeMessage: null,
    }

    constructor(props) {
        super(props);

        this.state = INIT_STATE;

        this.datePickerOptions = {
            enableTime: false,
            minDate: 'today',
            dateFormat: 'j F Y',
        };
    }

    static getDerivedStateFromProps(props, state) {
        if (props.activeMessage && state.hasModalBeenOpen) {
            const { activeMessage: { stopsAndGroups, message, priority, startTime, endTime } } = props;

            return {
                stopsAndGroups,
                message,
                priority,
                startDate: moment(startTime).toDate(),
                startTime: moment(startTime).format('HH:mm'),
                endDate: moment(endTime).toDate(),
                endTime: moment(endTime).format('HH:mm'),
                hasModalBeenOpen: false,
            };
        }
        if (!props.isModalOpen) {
            return INIT_STATE;
        }
        return null;
    }

    parseSelectedDate = (date, time) => moment(`${moment(date).format('YYYY-MM-DD')} ${time}`, 'YYYY-MM-DD HH:mm')

    dismissErrorHandler = () => !_.isNull(this.props.error.createStopMessage) && this.props.dismissError('createStopMessage')

    toggleModal = () => {
        this.setState({
            stopsAndGroups: [],
            message: '',
            startTime: currentTime(),
            startDate: currentDate(),
            endTime: '',
            endDate: null,
            priority: '',
            hasModalBeenOpen: true, // eslint-disable-line
            hasSubmitButtonBeenClicked: false,
        }, () => {
            this.props.onClose();
            this.dismissErrorHandler();
        });
    }

    onFormFieldsChange = (name, value) => {
        this.setState({
            [name]: value,
        }, () => this.dismissErrorHandler());
    }

    onDateUpdate = (key, value) => {
        if (!moment(value).isSame(this.state[key])) {
            this.onFormFieldsChange(key, value);
        }
    }

    updateStopMessage = () => {
        if (_.isNull(this.props.error.createStopMessage)) {
            const {
                stopsAndGroups, message, startTime, startDate, endTime, endDate, priority,
            } = this.state;
            const singleStops = stopsAndGroups.filter(selectedItem => !_.isObject(selectedItem.stopGroup));
            const stopGroups = stopsAndGroups.filter(selectedItem => _.isObject(selectedItem.stopGroup))
                .map(group => group.stopGroup);

            const payload = {
                startTime: this.parseSelectedDate(startDate, startTime),
                endTime: this.parseSelectedDate(endDate, endTime),
                message,
                priority,
                stops: singleStops,
                stopGroups,
            };

            this.setState({ hasSubmitButtonBeenClicked: true });

            this.props.onAction(payload)
                .then(() => this.toggleModal())
                .catch(() => {});
        }
    }

    render() {
        const { CREATE, EDIT } = MESSAGING_MODAL_TYPE;
        const { error, isModalOpen, title, allStops, modalType, stopsGroups, activeMessage } = this.props;
        const {
            stopsAndGroups, message, startTime, startDate, endTime, endDate, priority, hasSubmitButtonBeenClicked,
        } = this.state;

        const isStartDatetimeEditAllowed = modalType === EDIT && moment(activeMessage.endTime).isAfter(moment());
        const groups = formatGroupsForPresentation(stopsGroups);
        const allStopsAndGroups = [...allSystemStopGroups, ...allStops, ...groups];
        const startDatetime = this.parseSelectedDate(startDate, startTime);
        const endDatetime = this.parseSelectedDate(endDate, endTime);
        const inputLabelAndPlaceholder = 'Search to select a stop';
        const isMaxCharactersLengthExceeded = message.length > MAX_CHARACTERS;
        const isTimeSelected = _.isDate(startDate) && startTime !== '' && _.isDate(endDate) && endTime !== '';
        const isTimeSelectedValid = startDatetime.isBefore(endDatetime);
        const isSaveButtonDisabled = _.isEmpty(stopsAndGroups)
        || message === ''
        || !_.isNull(error.createStopMessage)
        || isMaxCharactersLengthExceeded
        || !isTimeSelected
        || !isTimeSelectedValid
        || priority === ''
        || hasSubmitButtonBeenClicked;
        return (
            <CustomModal
                className="message-modal cc-modal-standard-width"
                title={ title }
                isModalOpen={ isModalOpen }
                onClose={ this.toggleModal }
                okButton={ {
                    label: 'Save Message',
                    onClick: this.updateStopMessage,
                    isDisabled: isSaveButtonDisabled,
                    className: 'message-modal__save-btn',
                } }>
                <div className="row">
                    <div className="col">
                        <ModalAlert
                            color="danger"
                            isOpen={ !_.isNull(error.createStopMessage) }
                            content={ <span>{ error.createStopMessage }</span> } />
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        <Picklist
                            staticItemList={ allStopsAndGroups }
                            selectedValues={ stopsAndGroups }
                            onChange={ selectedItem => this.setState({ stopsAndGroups: selectedItem }) }
                            minValueLength={ 2 }
                            leftPaneLabel={ `${inputLabelAndPlaceholder}:` }
                            leftPaneClassName="cc__picklist-pane-left"
                            leftPanePlaceholder={ inputLabelAndPlaceholder }
                            rightPaneLabel="Selected stop:"
                            rightPaneClassName="cc__picklist-pane-right"
                            rightPanePlaceholder={ inputLabelAndPlaceholder } />
                    </div>
                </div>
                <div className="row py-3">
                    <div className="col my-3">
                        <Label for="message-text">Message text:</Label>
                        <Input
                            type="textarea"
                            id="message-text"
                            value={ message }
                            className="message-modal__textarea cc-form-control"
                            placeholder="Create custom message"
                            onChange={ event => this.onFormFieldsChange('message', event.target.value) } />
                        {
                            isMaxCharactersLengthExceeded && (
                                <div className="message-modal__textarea-alert cc-modal-field-alert d-flex align-items-end text-danger">
                                    <IoIosWarning size={ 20 } className="mr-1" />
                                    <span>
                                        {`Your message is ${message.length - MAX_CHARACTERS} characters too long`}
                                    </span>
                                </div>
                            )
                        }
                    </div>
                </div>
                <div className="row">
                    <FormGroup tag="fieldset" className="col-6 mb-0">
                        <Label>Start:</Label>
                        <FormGroup className="row no-gutters mb-0">
                            {
                                isStartDatetimeEditAllowed || modalType === CREATE
                                    ? (
                                        <React.Fragment>
                                            <div className="col-5 pr-2">
                                                <ControlSearch
                                                    id="messaging-start-time"
                                                    className="message-modal__start-time"
                                                    data={ OPTIONS }
                                                    pathToProperty="label"
                                                    placeholder="Select time"
                                                    onInputValueChange={ value => this.onFormFieldsChange('startTime', value) }
                                                    onSelection={ selectedOption => this.onFormFieldsChange('startTime', selectedOption.value) }
                                                    value={ startTime } />

                                            </div>
                                            <div className="col-7 message-modal__start-date">
                                                <Flatpickr
                                                    className="form-control cc-form-control"
                                                    value={ startDate }
                                                    options={ {
                                                        ...this.datePickerOptions,
                                                        minDate: moment(_.get(activeMessage, 'startTime', new Date())).format('YYYY-MM-DD'),
                                                        disable: [activeMessage && {
                                                            from: moment(_.get(activeMessage, 'startTime', new Date())).add(1, 'day').format('D MMMM YYYY'),
                                                            to: moment().add(-1, 'day').format('D MMMM YYYY'),
                                                        }],
                                                    } }
                                                    onChange={ date => this.onDateUpdate('startDate', date[0]) } />
                                            </div>
                                        </React.Fragment>
                                    )
                                    : <Input type="text" value={ startDatetime.format('DD/MM/YYYY HH:mm') } disabled />
                            }
                        </FormGroup>

                    </FormGroup>
                    <FormGroup tag="fieldset" className="col-6 mb-0">
                        <Label>End:</Label>
                        <FormGroup className="row no-gutters mb-0">
                            <div className="col-5 pr-2">
                                <ControlSearch
                                    id="messaging-end-time"
                                    className="message-modal__end-time"
                                    data={ OPTIONS }
                                    pathToProperty="label"
                                    placeholder="Select time"
                                    onInputValueChange={ value => this.onFormFieldsChange('endTime', value) }
                                    onSelection={ selectedOption => this.onFormFieldsChange('endTime', selectedOption.value) }
                                    value={ this.state.endTime } />
                            </div>
                            <div className="col-7 message-modal__end-date">
                                <Flatpickr
                                    className="form-control cc-form-control"
                                    value={ endDate }
                                    options={ this.datePickerOptions }
                                    placeholder="Select date"
                                    onChange={ date => this.onDateUpdate('endDate', date[0]) } />
                            </div>
                        </FormGroup>
                    </FormGroup>
                    <div className="col mb-4">
                        {
                            isTimeSelected && !isTimeSelectedValid && (
                                <div className="message-modal__date-alert cc-modal-field-alert d-flex align-items-end text-danger">
                                    <IoIosWarning size={ 20 } className="mr-1" />
                                    <span>
                                        Start date and time must be before end date and time
                                    </span>
                                </div>
                            )
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="col-6">
                        <StandardFilter
                            id="messaging-priority"
                            className="message-modal__priority"
                            title="Priority:"
                            placeholder="Select priority"
                            selectedOption={ priority }
                            options={ PRIORITY_LIST }
                            onSelection={ selectedOption => this.onFormFieldsChange('priority', selectedOption.value) } />
                    </div>
                </div>
            </CustomModal>
        );
    }
}

export default connect(state => ({
    error: getError(state),
    allStops: getAllStops(state),
    stopsGroups: getAllStopGroups(state),
}),
{ dismissError })(StopMessageModal);
