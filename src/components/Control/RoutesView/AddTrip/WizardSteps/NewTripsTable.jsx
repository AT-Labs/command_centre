import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { uniqueId } from 'lodash-es';
import { Input, Button, FormGroup, FormFeedback } from 'reactstrap';
import { AiOutlinePlusCircle, AiOutlineMinusCircle, AiOutlineSearch, AiFillInfoCircle } from 'react-icons/ai';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import { TripInstanceType } from '../../Types';
import { TIME_PATTERN } from '../../../../../constants/time';
import { getTripTimeDisplay, convertTimeToMinutes } from '../../../../../utils/helpers';
import './NewTripsTable.scss';
import DATE_TYPE from '../../../../../types/date-types';

export const NewTripsTable = (props) => {
    const maxTrips = 30;
    const dateTooltipText = 'Trip(s) cannot be added with a past start time for today\'s date';

    const getDelayInMinutes = (originalStartTime, newStartTime) => convertTimeToMinutes(newStartTime) - convertTimeToMinutes(originalStartTime);

    const addMinutesToTime = (timeString, minutesToAdd) => {
        const [hours, minutes, seconds] = timeString.split(':');
        let totalMinutes = Number(hours) * 60 + Number(minutes);
        totalMinutes += minutesToAdd;
        const updatedHours = Math.floor(totalMinutes / 60);
        const updatedMinutes = totalMinutes % 60;
        return [updatedHours, updatedMinutes, seconds]
            .filter(time => time !== undefined)
            .map(time => `${String(time).padStart(2, '0')}`)
            .join(':');
    };

    const isStartTimeValid = start => (TIME_PATTERN.test(start)
     && convertTimeToMinutes(start) <= convertTimeToMinutes('28:00'))
     && getDelayInMinutes(moment().format('HH:mm'), start) >= 0;

    const addRow = () => {
        const newRow = {
            id: uniqueId(),
            startTime: '',
            endTime: '',
            referenceId: '',
        };
        props.onAddedTripsChange([...props.trips, newRow]);
    };

    const handleDateChange = (id, value) => {
        const updatedAddedTrips = props.trips.map((row) => {
            if (row.id !== id) {
                return row;
            }
            return {
                ...row,
                date: value,
            };
        });
        props.onAddedTripsChange(updatedAddedTrips);
    };

    const getCheckedDays = (isToday, isTomorrow, id) => {
        const row = props.trips.find(item => item.id === id);
        if (row) {
            const isNewStartTimeValid = row.startTime !== '' ? isStartTimeValid(row.startTime) : false;
            let selectedDays = '';
            if (isToday && isTomorrow) {
                selectedDays = isNewStartTimeValid ? DATE_TYPE.TODAYANDTOMORROW : DATE_TYPE.TOMORROW;
            } else if (isToday) {
                selectedDays = DATE_TYPE.TODAY;
            } else if (isTomorrow) {
                selectedDays = DATE_TYPE.TOMORROW;
            }
            if (selectedDays !== row.date) {
                handleDateChange(id, selectedDays);
            }
            return selectedDays;
        }
        return row;
    };

    const isDateValid = (id) => {
        const row = props.trips.find(item => item.id === id);
        if (row) {
            return row.date?.length > 0 && row.date !== '';
        }
        return false;
    };

    const referenceIdValid = (id, ref) => !props.trips.find(row => row.id !== id && row.referenceId === ref);

    const removeRow = (id) => {
        const updatedAddedTrips = props.trips.filter(row => row.id !== id);
        props.onAddedTripsChange(updatedAddedTrips);
    };

    const onStopsPreviewClicked = (id) => {
        const selectedTrip = props.trips.find(row => row.id === id);
        props.onStopsPreview(selectedTrip);
    };

    const handleStartTimeChange = (id, value) => {
        const updatedAddedTrips = props.trips.map((row) => {
            if (row.id !== id) {
                return row;
            }
            const isNewStartTimeInvalid = !isStartTimeValid(value);
            const newEndTime = (isNewStartTimeInvalid && !props.useNextDayTrips && !props.tomorrowTripChecked)
                ? '' : addMinutesToTime(props.tripInstance.endTime, getDelayInMinutes(props.tripInstance.startTime, value));
            return {
                ...row,
                startTime: value,
                endTime: newEndTime,
            };
        });
        props.onAddedTripsChange(updatedAddedTrips);
        if (props.useNextDayTrips) {
            getCheckedDays(props.todayTripChecked, props.tomorrowTripChecked, id);
        }
    };

    const handleReferenceIdChange = (id, value) => {
        const updatedAddedTrips = props.trips.map((row) => {
            if (row.id !== id) {
                return row;
            }
            return {
                ...row,
                referenceId: value,
            };
        });
        props.onAddedTripsChange(updatedAddedTrips);
    };

    const isStartTimeRepeated = startTime => startTime && props.trips.filter(addedTrip => addedTrip.startTime === startTime).length > 1;

    if (!props.trips.length) {
        addRow();
    }

    const isTimeInvalid = (startTime, id) => {
        const row = props.trips.find(item => item.id === id);
        if (props.useNextDayTrips && row.date === DATE_TYPE.TOMORROW) {
            return !(TIME_PATTERN.test(startTime) && !isStartTimeRepeated(startTime) && convertTimeToMinutes(startTime) <= convertTimeToMinutes('28:00'));
        }
        return (!isStartTimeValid(startTime) || isStartTimeRepeated(startTime));
    };

    useEffect(() => {
        const updatedAddedTrips = props.trips.map((row) => {
            const newEndTime = !isStartTimeValid(row.startTime) ? '' : addMinutesToTime(props.tripInstance.endTime, getDelayInMinutes(props.tripInstance.startTime, row.startTime));
            return {
                ...row,
                endTime: newEndTime,
            };
        });
        props.onAddedTripsChange(updatedAddedTrips);
    }, [props.tripInstance]);

    return (
        <div>
            <div className="add-trips-table-container d-flex">
                <br />
                {props.trips.length < maxTrips && (
                    <Button title="Add a new trip" className="add-trips-table-container__add-button" onClick={ addRow }>
                        <AiOutlinePlusCircle />
                    </Button>
                )}
                <div className="add-trips-table">
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>START TIME</TableCell>
                                <TableCell>END TIME</TableCell>
                                <TableCell>REFERENCE ID</TableCell>
                                { props.useNextDayTrips && (
                                    <TableCell>
                                        <Tooltip title={ dateTooltipText } placement="top-end" className="add-trips-table__tooltip">
                                            <span>
                                                <AiFillInfoCircle className="cc-text-orange add-trips-table__warning__icon" />
                                                DATE
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                )}
                                <TableCell>ACTIONS</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {props.trips.map(row => (
                                <TableRow key={ row.id }>
                                    <TableCell>
                                        <Input
                                            id="add-trips-table__start-time"
                                            className="add-trips-table__start-time"
                                            placeholder={ getTripTimeDisplay(props.tripInstance.startTime) }
                                            value={ row.startTime }
                                            onChange={ e => handleStartTimeChange(row.id, e.target.value) }
                                            invalid={ isTimeInvalid(row.startTime, row.id) }
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div id="add-trips-table__end-time">{ row.endTime ? getTripTimeDisplay(row.endTime) : '' }</div>
                                    </TableCell>
                                    <TableCell>
                                        <FormGroup className="add-trips-table__reference-id-group">
                                            <Input
                                                id="add-trips-table__reference-id"
                                                className="add-trips-table__reference-id"
                                                value={ row.referenceId }
                                                onChange={ e => handleReferenceIdChange(row.id, e.target.value) }
                                                invalid={ row.referenceId && !referenceIdValid(row.id, row.referenceId) }
                                            />
                                            <FormFeedback>Reference Id should be unique</FormFeedback>
                                        </FormGroup>
                                    </TableCell>
                                    { props.useNextDayTrips && (
                                        <TableCell>
                                            <Input
                                                id="add-trips-table__date"
                                                className="add-trips-table__date"
                                                value={ getCheckedDays(props.todayTripChecked, props.tomorrowTripChecked, row.id) }
                                                readOnly
                                                onChange={ e => handleDateChange(row.id, e.target.value) }
                                                invalid={ !isDateValid(row.id) }
                                            />
                                            <FormFeedback>Today\Tomorrow selection required</FormFeedback>
                                        </TableCell>
                                    )}
                                    <TableCell>
                                        <Button title="View scheduled stop times" className="add-trips-table__preview-button" onClick={ () => onStopsPreviewClicked(row.id) }>
                                            <AiOutlineSearch />
                                        </Button>
                                        { props.trips.length > 1 && (
                                            <Button title="Remove" className="add-trips-table__remove-button" onClick={ () => removeRow(row.id) }>
                                                <AiOutlineMinusCircle />
                                            </Button>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {props.trips.some(addedTrip => isStartTimeRepeated(addedTrip.startTime)) && (
                <span className="text-danger add-trips-table__start-time-repeated">Trip start time cannot be repeated</span>
            )}
        </div>
    );
};

NewTripsTable.propTypes = {
    tripInstance: TripInstanceType.isRequired,
    trips: PropTypes.array.isRequired,
    onAddedTripsChange: PropTypes.func.isRequired,
    onStopsPreview: PropTypes.func.isRequired,
    useNextDayTrips: PropTypes.bool.isRequired,
    todayTripChecked: PropTypes.bool.isRequired,
    tomorrowTripChecked: PropTypes.bool.isRequired,
};

NewTripsTable.defaultProps = {
};
