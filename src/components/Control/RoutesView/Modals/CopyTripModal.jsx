import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Input, Label } from 'reactstrap';

import { TripInstanceType } from '../Types';
import CustomModal from '../../../Common/CustomModal/CustomModal';
import { getTripTimeDisplay } from '../../../../utils/helpers';
import { TRAIN_TYPE_ID } from '../../../../types/vehicle-types';

class CopyTripModal extends React.Component {
    static propTypes = {
        tripInstance: TripInstanceType.isRequired,
        isOpen: PropTypes.bool.isRequired,
        onAction: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            startTime: getTripTimeDisplay(this.props.tripInstance.startTime) || '',
            endTime: getTripTimeDisplay(this.props.tripInstance.endTime) || '',
            isActionDisabled: true,
            isStartTimeInvalid: false,
            referenceId: '',
        };
    }

    handleDelayChange = (event) => {
        const { value } = event.target;

        const tripDurationInMinutes = this.calculateDurationInMinutes();

        const isNewStartTimeInvalid = !this.isStartTimeValid(value);
        const newEndTime = isNewStartTimeInvalid ? '-' : this.calculateNewEndTime(value, tripDurationInMinutes);

        this.setState(prevState => ({
            startTime: value,
            endTime: newEndTime,
            isActionDisabled: !this.isMainActionEnabled(value, prevState.referenceId),
            isStartTimeInvalid: isNewStartTimeInvalid,
        }));
    };

    calculateDurationInMinutes() {
        let startTimeAsString = this.props.tripInstance.startTime;
        let endTimeAsString = this.props.tripInstance.endTime;

        const hoursOfStartTime = Number(this.props.tripInstance.startTime.split(':')[0]);
        const hoursOfEndTime = Number(this.props.tripInstance.endTime.split(':')[0]);

        if (hoursOfEndTime > 23 || hoursOfStartTime > 23) {
            const adjustment = Math.max(hoursOfStartTime, hoursOfEndTime) % 23;
            startTimeAsString = `${hoursOfStartTime - adjustment}${this.props.tripInstance.startTime.substring(2, this.props.tripInstance.startTime.length)}`;
            endTimeAsString = `${hoursOfEndTime - adjustment}${this.props.tripInstance.endTime.substring(2, this.props.tripInstance.endTime.length)}`;
        }

        const originalStartTime = moment(startTimeAsString, 'HH:mm:ss');
        const originalEndTime = moment(endTimeAsString, 'HH:mm:ss');

        return originalEndTime.diff(originalStartTime, 'minutes');
    }

    calculateNewEndTime = (newStartTime, durationInMinutes) => {
        const hoursOfTrip = Math.floor(durationInMinutes / 60);
        const minsOfTrip = durationInMinutes % 60;

        const startTimeAsArray = newStartTime.split(':');
        const startTimeHours = parseInt(startTimeAsArray[0], 0);
        const startTimeMin = parseInt(startTimeAsArray[1], 0);

        const endTimeMin = `${((minsOfTrip + startTimeMin) % 60)}`;
        const endTimeHours = `${(hoursOfTrip + startTimeHours + Math.floor((minsOfTrip + startTimeMin) / 60))}`;

        return `${endTimeHours.padStart(2, '0')}:${endTimeMin.padStart(2, '0')}`;
    }

    isMainActionEnabled = (newStartTime, referenceId) => (!this.isReferenceIdRequired() || this.isReferenceIdValid(referenceId)) && this.isStartTimeValid(newStartTime)

    isStartTimeValid = startTime => startTime.match('^(([0-3][0-9])|40):[0-5][0-9]$') && `${startTime}:00` !== this.props.tripInstance.startTime;

    isReferenceIdValid = referenceId => !!referenceId.trim()

    isReferenceIdRequired = () => this.props.tripInstance.routeType === TRAIN_TYPE_ID

    handleReferenceIdChange = (event) => {
        const { value } = event.target;
        this.setState(prevState => ({
            referenceId: value,
            isActionDisabled: !this.isMainActionEnabled(prevState.startTime, value.trim()),
        }));
    }

    render() {
        const { routeLongName, routeShortName } = this.props.tripInstance;
        const label = 'Duplicate trip';

        return (
            <CustomModal
                className=""
                title={ label }
                okButton={ {
                    label,
                    onClick: () => this.props.onAction(`${this.state.startTime}:00`, this.state.referenceId),
                    isDisabled: this.state.isActionDisabled,
                } }
                onClose={ this.props.onClose }
                isModalOpen={ this.props.isOpen }
            >
                <div className="row mb-3">
                    <div className="col">Duplicating trip: {routeShortName} {routeLongName}</div>
                </div>
                <div className="row">
                    <div className={ this.isReferenceIdRequired() ? 'col-4' : 'col-6' }>
                        <Label for="start-time" className="font-weight-bold">Start time</Label>
                        <Input
                            type="text"
                            name="start-time"
                            id="start-time"
                            placeholder={ getTripTimeDisplay(this.props.tripInstance.startTime) }
                            value={ this.state.startTime }
                            onChange={ this.handleDelayChange }
                            invalid={ this.state.isStartTimeInvalid }
                        />
                    </div>
                    <div className={ this.isReferenceIdRequired() ? 'col-3' : 'col-6' }>
                        <Label className="font-weight-bold">End time:</Label>
                        <Input plaintext>{this.state.endTime}</Input>
                    </div>
                    {this.isReferenceIdRequired() && (
                        <div className="col-5">
                            <Label for="reference-id" className="font-weight-bold">Reference ID:</Label>
                            <Input
                                type="text"
                                name="reference-id"
                                id="reference-id"
                                value={ this.state.referenceId }
                                onChange={ this.handleReferenceIdChange }
                            />
                        </div>
                    )}
                </div>
            </CustomModal>
        );
    }
}

export default CopyTripModal;
