import { connect } from 'react-redux';
import React, { useEffect } from 'react';
import { isEmpty } from 'lodash-es';
import moment from 'moment';
import PropTypes from 'prop-types';
import { FaRegCalendarAlt } from 'react-icons/fa';
import { BsArrowRepeat } from 'react-icons/bs';
import Flatpickr from 'react-flatpickr';
import { FormGroup, Label, Input } from 'reactstrap';
import { DATE_FORMAT_DDMMYYYY, getDatePickerOptions } from '../../../../../utils/dateUtils';
import { getRecurringTextWithFrom } from '../../../../../utils/recurrence';
import WeekdayPicker from '../../../Common/WeekdayPicker/WeekdayPicker';
import { useHideTrip, useTripCauseCancellation } from '../../../../../redux/selectors/appSettings';
import { useAlertCauses } from '../../../../../utils/control/alert-cause-effect';

import './RecurrentTripCancellation.scss';

const RecurrentTripCancellation = (props) => {
    const { startDate, endDate, selectedWeekdays, causeCancellation } = props.setting;
    const { startDatePickerMinimumDate, endDatePickerMinimumDate } = props.options;
    const { allowUpdate, allowHideTrip } = props;

    const causes = useAlertCauses();

    useEffect(() => {
        if (startDate && endDate && moment(startDate, DATE_FORMAT_DDMMYYYY).isAfter(moment(endDate, DATE_FORMAT_DDMMYYYY))) {
            props.onChange({ endDate: '' });
        }
    }, [startDate, endDate]);

    const handleStartDateUpdate = (inputStartDate) => {
        props.onChange({ startDate: inputStartDate });
    };

    const handleEndDateUpdate = (inputEndDate) => {
        props.onChange({ endDate: inputEndDate });
    };

    const handleWeekdaysUpdate = (inputSelectedWeekdays) => {
        props.onChange({ selectedWeekdays: inputSelectedWeekdays });
    };

    const handleHideTrip = (event) => {
        props.onChange({ display: !event.currentTarget.checked });
    };

    const handleTripCauseCancellation = (value) => {
        props.onChange({ causeCancellation: value });
    };

    const datePickerOptions = getDatePickerOptions(startDatePickerMinimumDate);
    const endDateDatePickerOptions = getDatePickerOptions(endDatePickerMinimumDate);

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
                        onChange={ date => handleStartDateUpdate(date[0] ? moment(date[0]).format(DATE_FORMAT_DDMMYYYY) : '') }
                        disabled={ !allowUpdate } />
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
                        onChange={ date => handleEndDateUpdate(date[0] ? moment(date[0]).format(DATE_FORMAT_DDMMYYYY) : '') }
                        disabled={ !allowUpdate } />
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
                        disabled={ !allowUpdate }
                    />
                </FormGroup>
                {!isEmpty(selectedWeekdays) && startDate && (
                    <FormGroup>
                        <BsArrowRepeat size={ 22 } />
                        <span className="pl-1">{ getRecurringTextWithFrom('Cancel selected trips', { startDate, selectedWeekdays, endDate }) }</span>
                    </FormGroup>
                )}
            </div>
            {props.useTripCauseCancellation && (
                <div>
                    <FormGroup className="position-relative">
                        <Label for="ecurrent-trip-cancellation__cause">
                            <span className="font-size-md font-weight-bold">
                                Cause
                            </span>
                            (Optional)
                        </Label>
                        <Input
                            type="select"
                            className="w-100 border border-dark disruption-creation__wizard-select-details__select position-relative"
                            id="recurrent-trip-cancellation__cause"
                            value={ causeCancellation }
                            onChange={ e => handleTripCauseCancellation(
                                e.currentTarget.value,
                            ) }
                        >
                            {causes.map((item) => {
                                if (item.label !== undefined) {
                                    return (
                                        <option
                                            key={ item.label }
                                            value={ item.value || '' }
                                        >
                                            {item.label}
                                        </option>
                                    );
                                }
                                return (
                                    <option key={ item } value={ item }>
                                        {item}
                                    </option>
                                );
                            })}
                        </Input>
                    </FormGroup>
                </div>
            )}
            {
                props.useHideTrip && allowHideTrip && (
                    <div className="text-center">
                        <FormGroup className="recurrent-trip-cancellation__checkbox">
                            <Input
                                type="checkbox"
                                className="ml-0"
                                disabled={ !allowUpdate }
                                onChange={ handleHideTrip }
                            />
                            <span className="pl-2">Hide cancelled trip (only applies for today&apos;s trips)</span>
                        </FormGroup>
                    </div>
                )
            }
        </>
    );
};

RecurrentTripCancellation.propTypes = {
    onChange: PropTypes.func,
    setting: PropTypes.shape({
        startDate: PropTypes.string.isRequired,
        endDate: PropTypes.string,
        selectedWeekdays: PropTypes.array.isRequired,
        causeCancellation: PropTypes.string.isRequired,
    }).isRequired,
    options: PropTypes.shape({
        startDatePickerMinimumDate: PropTypes.string.isRequired,
        endDatePickerMinimumDate: PropTypes.string.isRequired,
    }).isRequired,
    allowUpdate: PropTypes.bool,
    allowHideTrip: PropTypes.bool.isRequired,
    useHideTrip: PropTypes.bool.isRequired,
    useTripCauseCancellation: PropTypes.bool.isRequired,
};

RecurrentTripCancellation.defaultProps = {
    onChange: () => {
        // do nothing
    },
    allowUpdate: false,
};

export default connect(
    state => ({
        useHideTrip: useHideTrip(state),
        useTripCauseCancellation: useTripCauseCancellation(state),
    }),
    null,
)(RecurrentTripCancellation);
