import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import moment from 'moment';
import Flatpickr from 'react-flatpickr';
import { IoIosWarning } from 'react-icons/io';
import { FormGroup, Input, Label } from 'reactstrap';

import { getTimePickerOptions, formatGroupsForPresentation } from '../../../../utils/helpers';
import MESSAGING_MODAL_TYPE from '../../../../types/messaging-modal-types';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import PickList from '../../../Common/PickList/PickList';
import ControlSearch from '../../Common/ControlSearch/ControlSearch';
import { getAllStops } from '../../../../redux/selectors/control/stopMessaging/stops';
import { dismissError } from '../../../../redux/actions/activity';
import { getError } from '../../../../redux/selectors/activity';
import ModalAlert from '../../BlocksView/BlockModals/ModalAlert';
import { getAllStopGroups, allSystemStopGroups } from '../../../../redux/selectors/control/dataManagement/stopGroups';
import StandardFilter from '../../Common/Filters/StandardFilter';
import RecurrenceFieldRow from './RecurrenceFieldRow';
import 'flatpickr/dist/flatpickr.css';
import STOP_MESSAGE_TYPE from '../../../../types/stop-messages-types';

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
const STATUS_LIST = [
    STOP_MESSAGE_TYPE.STATUS.DRAFT.toLowerCase(),
    STOP_MESSAGE_TYPE.STATUS.ACTIVE.toLowerCase(),
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
    status: STOP_MESSAGE_TYPE.STATUS.ACTIVE.toLowerCase(),
    hasModalBeenOpen: true,
    isModalOpen: false,
    recurrence: {
        weeks: 0,
        days: [
            moment().weekday(),
        ],
        isValid: true,
    },
};
const RECURRENCE_VALIDITY_DEPENDANT_FIELDS = ['startDate', 'endTime'];

export class StopMessageModal extends React.Component {
    static propTypes = {
        isModalOpen: PropTypes.bool.isRequired,
        onClose: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        dismissError: PropTypes.func.isRequired,
        error: PropTypes.object,
        allStops: PropTypes.array.isRequired,
        onAction: PropTypes.func.isRequired,
        activeMessage: PropTypes.object, // eslint-disable-line
        stopsGroups: PropTypes.array,
        modalType: PropTypes.string,
    };

    static defaultProps = {
        error: {},
        stopsGroups: [],
        activeMessage: null,
        modalType: '',
    };

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
            const { activeMessage: { stopsAndGroups, message, priority, status, startTime, endTime, isCurrent } } = props;
            const startDatetime = moment(startTime);
            return {
                stopsAndGroups,
                message: message || '',
                priority: priority || '',
                status: status || INIT_STATE.status,
                startDate: startDatetime.toDate(),
                startTime: startDatetime.format('HH:mm'),
                endDate: (isCurrent && endTime) ? moment(endTime).toDate() : null,
                endTime: (isCurrent && endTime) ? moment(endTime).format('HH:mm') : '',
                recurrence: INIT_STATE.recurrence,
                hasModalBeenOpen: false,
            };
        }
        if (!props.isModalOpen) {
            return INIT_STATE;
        }
        return null;
    }

    parseSelectedDate = (date, time) => moment(`${moment(date).format('YYYY-MM-DD')} ${time}`, 'YYYY-MM-DD HH:mm');

    dismissErrorHandler = () => !_.isNull(this.props.error.createStopMessage) && this.props.dismissError('createStopMessage');

    toggleModal = () => {
        this.setState({
            stopsAndGroups: [],
            message: '',
            startTime: currentTime(),
            startDate: currentDate(),
            endTime: '',
            endDate: null,
            priority: '',
            status: INIT_STATE.status,
            hasModalBeenOpen: true, // eslint-disable-line
            hasSubmitButtonBeenClicked: false,
            recurrence: INIT_STATE.recurrence,
        }, () => {
            this.props.onClose();
            this.dismissErrorHandler();
        });
    };

    updateRecurrenceErrorMessage = () => {
        const mostFutureDate = this.getMostFutureRecurrentDate();
        const isRecurrenceValid = mostFutureDate && mostFutureDate.isAfter(Date.now());
        this.setState(prevState => ({
            recurrence: {
                ...prevState.recurrence,
                isValid: isRecurrenceValid,
            },
        }));
    };

    getMostFutureRecurrentDate = () => {
        const { recurrence, startDate, endTime } = this.state;
        const mostFutureDateTime = this.parseSelectedDate(startDate, endTime);
        if (!mostFutureDateTime.isValid()) {
            return null;
        }

        if (!recurrence.days.length) {
            return null;
        }
        const mostFutureDay = _.max(recurrence.days);
        mostFutureDateTime.add(recurrence.weeks - 1, 'w').weekday(mostFutureDay);
        return mostFutureDateTime;
    };

    onRecurrenceUpdate = (update) => {
        this.setState(prevState => ({
            recurrence: {
                ...prevState.recurrence,
                ...update,
            },
        }), this.updateRecurrenceErrorMessage);
    };

    onFormFieldsChange = (name, value) => {
        this.setState({ [name]: value }, () => {
            this.dismissErrorHandler();
            if (this.hasRecurrence() && RECURRENCE_VALIDITY_DEPENDANT_FIELDS.includes(name)) {
                this.updateRecurrenceErrorMessage();
            }
        });
    };

    onDateUpdate = (key, value) => {
        if (value) {
            const date = moment(value);
            if (!date.isSame(this.state[key])) {
                this.onFormFieldsChange(key, value);
            }
        } else {
            this.onFormFieldsChange(key, null);
        }
    };

    hasRecurrence = () => !!this.state.recurrence.weeks;

    getEndDateTime = () => {
        const { startDate, endTime, endDate } = this.state;
        // With recurrence multi-day selection is not allowed so we use startDate for start and end.
        return this.parseSelectedDate(this.hasRecurrence() ? startDate : endDate, endTime);
    };

    updateStopMessage = () => {
        if (!_.isNull(this.props.error.createStopMessage)) {
            return;
        }
        const {
            stopsAndGroups, message, startTime, startDate, priority, status, recurrence,
        } = this.state;
        const singleStops = stopsAndGroups.filter(selectedItem => !_.isObject(selectedItem.stopGroup));
        const stopGroups = stopsAndGroups.filter(selectedItem => _.isObject(selectedItem.stopGroup))
            .map(group => group.stopGroup);

        const payload = {
            startTime: this.parseSelectedDate(startDate, startTime),
            endTime: this.getEndDateTime(),
            message,
            priority,
            status,
            stops: singleStops,
            stopGroups,
        };

        this.setState({ hasSubmitButtonBeenClicked: true });

        this.props.onAction(payload, recurrence.weeks ? recurrence : null)
            .then(() => this.toggleModal())
            .catch(() => {});
    };

    render() {
        const { error, isModalOpen, title, allStops, stopsGroups, activeMessage, modalType } = this.props;
        const {
            stopsAndGroups, message, startTime, startDate, endTime, endDate, priority, status, recurrence, hasSubmitButtonBeenClicked,
        } = this.state;

        const groups = formatGroupsForPresentation(stopsGroups);
        const allStopsAndGroups = [...allSystemStopGroups, ...allStops, ...groups];
        const startDatetime = this.parseSelectedDate(startDate, startTime);
        const inputLabelAndPlaceholder = 'Search to select a stop';
        const isMaxCharactersLengthExceeded = message.length > MAX_CHARACTERS;
        const endDatetime = this.getEndDateTime();
        const hasRecurrence = this.hasRecurrence();
        const isEditing = modalType === MESSAGING_MODAL_TYPE.EDIT;
        const isStartTimeSelected = _.isDate(startDate) && startTime !== '';
        const isEndDateAndTimeBothSelected = _.isDate(endDate) && endTime !== '';
        const isEndDateAndTimeSelectedPartly = !!_.isDate(endDate) !== !!endTime;
        const isEndDateTimeOptional = status === STOP_MESSAGE_TYPE.STATUS.DRAFT.toLowerCase();
        const isEndTimeValid = (isEndDateTimeOptional && !isEndDateAndTimeSelectedPartly) || isEndDateAndTimeBothSelected || (hasRecurrence && endTime !== '');
        const now = moment();
        const isTimeSelectedValid = !isEndDateAndTimeBothSelected || (startDatetime.isBefore(endDatetime) && endDatetime.isAfter(now));

        const isSaveButtonDisabled = _.isEmpty(stopsAndGroups)
            || message === ''
            || !_.isNull(error.createStopMessage)
            || isMaxCharactersLengthExceeded
            || !isStartTimeSelected
            || !isEndTimeValid
            || !isTimeSelectedValid
            || priority === ''
            || status === ''
            || hasSubmitButtonBeenClicked
            || (hasRecurrence && !recurrence.isValid);

        const isStartDateAfterEndDate = ((!hasRecurrence && isStartTimeSelected && isEndDateAndTimeBothSelected) || (hasRecurrence && isStartTimeSelected))
            && startDatetime.isSameOrAfter(endDatetime);
        const isEndDateInThePast = !isStartDateAfterEndDate && isEndDateAndTimeBothSelected && endDatetime.isBefore(now);

        const isRecurrenceDaySelected = (hasRecurrence && recurrence.days.length === 0);

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
                        <PickList
                            staticItemList={ allStopsAndGroups }
                            selectedValues={ stopsAndGroups }
                            onChange={ selectedItem => this.setState({ stopsAndGroups: selectedItem }) }
                            minValueLength={ 2 }
                            leftPaneLabel={ `${inputLabelAndPlaceholder}:` }
                            leftPaneClassName="cc__picklist-pane-left"
                            leftPanePlaceholder={ inputLabelAndPlaceholder }
                            rightPaneLabel="Selected stop:"
                            rightPaneClassName="cc__picklist-pane-right"
                            rightPanePlaceholder={ inputLabelAndPlaceholder }
                            valueKey="value"
                            labelKey="label" />
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
                            <>
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
                                            minDate: moment.min(moment(), moment(_.get(activeMessage, 'startTime', new Date()))).format('YYYY-MM-DD'),
                                            disable: [activeMessage && {
                                                from: moment(_.get(activeMessage, 'startTime', new Date())).add(1, 'day').format('D MMMM YYYY'),
                                                to: moment().add(-1, 'day').format('D MMMM YYYY'),
                                            }],
                                        } }
                                        onChange={ date => this.onDateUpdate('startDate', date[0]) } />
                                </div>
                            </>
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
                            {!recurrence.weeks && (
                                <div className="col-7 message-modal__end-date">
                                    <Flatpickr
                                        className="form-control cc-form-control"
                                        value={ endDate }
                                        options={ {
                                            ...this.datePickerOptions,
                                            minDate: moment(startDate).format('YYYY-MM-DD'),
                                        } }
                                        placeholder="Select date"
                                        onChange={ date => this.onDateUpdate('endDate', date[0]) } />
                                </div>
                            )}
                        </FormGroup>
                    </FormGroup>
                </div>
                {!isEditing && <RecurrenceFieldRow recurrence={ recurrence } onUpdate={ this.onRecurrenceUpdate } />}
                <div className="col mb-4">
                    {isEndDateInThePast && (
                        <div className="message-modal__date-alert cc-modal-field-alert d-flex align-items-end text-danger">
                            <IoIosWarning size={ 20 } className="mr-1" />
                            <span>
                                End date and time is in the past but should be equal or greater than now
                            </span>
                        </div>
                    )}
                    {isStartDateAfterEndDate && (
                        <div className="message-modal__date-alert cc-modal-field-alert d-flex align-items-end text-danger">
                            <IoIosWarning size={ 20 } className="mr-1" />
                            <span>
                                Start date and time must be before end date and time
                            </span>
                        </div>
                    )}
                    {isRecurrenceDaySelected && (
                        <div className="message-modal__date-alert cc-modal-field-alert d-flex align-items-end text-danger">
                            <IoIosWarning size={ 20 } className="mr-1" />
                            <span>
                                Please select at least one recurring day
                            </span>
                        </div>
                    )}
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
                    <div className="col-6">
                        <StandardFilter
                            id="messaging-status"
                            className="message-modal__status"
                            title="Status:"
                            placeholder="Select status"
                            selectedOption={ status }
                            options={ STATUS_LIST }
                            onSelection={ selectedOption => this.onFormFieldsChange('status', selectedOption.value) } />
                    </div>
                </div>
            </CustomModal>
        );
    }
}

export default connect(
    state => ({
        error: getError(state),
        allStops: getAllStops(state),
        stopsGroups: getAllStopGroups(state),
    }),
    { dismissError },
)(StopMessageModal);
