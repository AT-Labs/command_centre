import React from 'react';
import _ from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { BsArrowRepeat } from 'react-icons/bs';
import Flatpickr from 'react-flatpickr';
import { FormGroup, Label } from 'reactstrap';
import { DATE_FORMAT_DDMMYYYY, getDatePickerOptions } from '../../../../../utils/dateUtils';
import { getRecurringTextWithFrom } from '../../../../../utils/recurrence';
import WeekdayPicker from '../../../Common/WeekdayPicker/WeekdayPicker';
import './RecurrentTripCancellation.scss';

const RecurrentTripCancellation = (props) => {
    const { startDate, endDate, selectedWeekdays } = props.setting;

    const handleStartDateUpdate = (inputStartDate) => {
        props.onChange({ startDate: inputStartDate });
    };

    const handleEndDateUpdate = (inputEndDate) => {
        props.onChange({ endDate: inputEndDate });
    };

    const handleWeekdaysUpdate = (inputSelectedWeekdays) => {
        props.onChange({ selectedWeekdays: inputSelectedWeekdays });
    };

    const datePickerOptions = getDatePickerOptions('today');
    const endDateDatePickerOptions = getDatePickerOptions(startDate);

    return (
        <>
            <div className="row">
                <FormGroup className="position-relative col-6">
                    <Label for="recurrent-trip-cancellation__start-date">
                        <span className="font-size-md font-weight-bold">Start Date</span>
                    </Label>
                    <Flatpickr
                        id="recurrent-trip-cancellation__start-date"
                        className="font-weight-normal cc-form-control form-control"
                        value={ startDate }
                        options={ datePickerOptions }
                        placeholder="Select date"
                        onChange={ date => handleStartDateUpdate(moment(date[0]).format(DATE_FORMAT_DDMMYYYY)) } />
                    <FaRegCalendarAlt
                        className="recurrent-trip-cancellation__icon position-absolute"
                        size={ 22 } />
                </FormGroup>
                <FormGroup className="position-relative col-6">
                    <Label for="recurrent-trip-cancellation__end-date">
                        <span className="font-size-md font-weight-bold">End Date</span>
                    </Label>
                    <Flatpickr
                        id="recurrent-trip-cancellation__end-date"
                        className="font-weight-normal cc-form-control form-control"
                        value={ endDate }
                        options={ endDateDatePickerOptions }
                        placeholder="Select date"
                        onChange={ date => handleEndDateUpdate(moment(date[0]).format(DATE_FORMAT_DDMMYYYY)) } />
                    <FaRegCalendarAlt
                        className="recurrent-trip-cancellation__icon position-absolute"
                        size={ 22 } />
                </FormGroup>
            </div>
            <div className="text-center">
                <FormGroup>
                    <WeekdayPicker
                        selectedWeekdays={ selectedWeekdays }
                        onUpdate={ weekdays => handleWeekdaysUpdate(weekdays) }
                    />
                </FormGroup>
                {!_.isEmpty(selectedWeekdays) && startDate && (
                    <FormGroup>
                        <BsArrowRepeat size={ 22 } />
                        <span className="pl-1">{ getRecurringTextWithFrom('Cancel selected trips', { startDate, selectedWeekdays, endDate }) }</span>
                    </FormGroup>
                )}
            </div>
        </>
    );
};

RecurrentTripCancellation.propTypes = {
    onChange: PropTypes.func,
    setting: PropTypes.shape({
        startDate: PropTypes.string.isRequired,
        endDate: PropTypes.string,
        selectedWeekdays: PropTypes.array.isRequired,
    }).isRequired,
};

RecurrentTripCancellation.defaultProps = {
    onChange: () => {
        // do nothing
    },
};

export default RecurrentTripCancellation;
