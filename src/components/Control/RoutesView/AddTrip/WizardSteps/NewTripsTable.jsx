import moment from 'moment-timezone';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { uniqueId } from 'lodash-es';
import { Input, Button, FormGroup, FormFeedback } from 'reactstrap';
import { AiOutlinePlusCircle, AiOutlineMinusCircle, AiOutlineSearch } from 'react-icons/ai';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { TripInstanceType } from '../../Types';
import { TIME_PATTERN } from '../../../../../constants/time';
import { getTripTimeDisplay, convertTimeToMinutes } from '../../../../../utils/helpers';
import './NewTripsTable.scss';

export const NewTripsTable = (props) => {
    const maxTrips = 30;

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
            const newEndTime = isNewStartTimeInvalid ? '' : addMinutesToTime(props.tripInstance.endTime, getDelayInMinutes(props.tripInstance.startTime, value));
            return {
                ...row,
                startTime: value,
                endTime: newEndTime,
            };
        });
        props.onAddedTripsChange(updatedAddedTrips);
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
                                            invalid={ !isStartTimeValid(row.startTime) || isStartTimeRepeated(row.startTime) }
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
};

NewTripsTable.defaultProps = {
};
