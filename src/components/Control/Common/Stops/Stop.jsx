import PropTypes from 'prop-types';
import React from 'react';
import moment from 'moment';
import _ from 'lodash-es';
import { connect } from 'react-redux';
import { FaCheck } from 'react-icons/fa';
import { UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

import { selectStops, updateTripInstanceStopPlatform } from '../../../../redux/actions/control/routes/trip-instances';
import { getServiceDate } from '../../../../redux/selectors/control/serviceDate';
import { getSelectedStopsByTripKey } from '../../../../redux/selectors/control/routes/trip-instances';
import { getPlatforms } from '../../../../redux/selectors/control/platforms';
import { transformStopName } from '../../../../utils/control/routes';
import { getTripTimeDisplay, getStopKey } from '../../../../utils/helpers';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import { StopStatus, StopType, TripInstanceType } from '../../RoutesView/Types';
import { isChangeStopPermitted, isSkipStopPermitted } from '../../../../utils/user-permissions';
import { IS_LOGIN_NOT_REQUIRED } from '../../../../auth';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';

export class Stop extends React.Component {
    static propTypes = {
        tripInstance: TripInstanceType.isRequired,
        stop: StopType.isRequired,
        isCurrent: PropTypes.bool.isRequired,
        updateTripInstanceStopPlatform: PropTypes.func.isRequired,
        serviceDate: PropTypes.string.isRequired,
        platforms: PropTypes.object.isRequired,
        selectStops: PropTypes.func.isRequired,
        selectedStopsByTripKey: PropTypes.func.isRequired,
        onHover: PropTypes.func.isRequired,
        isStopInSelectionRange: PropTypes.bool,
        lineInteractionClasses: PropTypes.string.isRequired,
    }

    static defaultProps = {
        isStopInSelectionRange: false,
    };

    constructor(props) {
        super(props);

        this.state = {
            isChangePlatformModalOpen: false,
            newPlatform: {},
        };
    }

    isSkipped = () => this.props.stop.status === StopStatus.skipped;

    isNonStoppingStop = () => this.props.stop.status === StopStatus.nonStopping;

    isNotStartedTrip = () => this.props.tripInstance.status === TRIP_STATUS_TYPES.notStarted;

    isInProgressTrip = () => this.props.tripInstance.status === TRIP_STATUS_TYPES.inProgress;

    isMissedTrip = () => this.props.tripInstance.status === TRIP_STATUS_TYPES.missed;

    isStopMutationPossible = () => (this.isNotStartedTrip() || this.isInProgressTrip() || this.isMissedTrip())
        && (moment(this.props.serviceDate).isSame(moment(), 'day') || (moment(this.props.serviceDate).isBefore(moment(), 'day') && this.props.tripInstance.endTime > '24:00:00'));

    isStopSkippingPermitted = () => IS_LOGIN_NOT_REQUIRED || isSkipStopPermitted(this.props.stop);

    isStopMutationPermitted = () => IS_LOGIN_NOT_REQUIRED || isChangeStopPermitted(this.props.stop);

    isSkipStopDisabled = () => this.isSkipped() || !this.isStopSkippingPermitted() || !this.isStopMutationPossible();

    isReinstateStopDisabled = () => !this.isSkipped() || !this.isStopSkippingPermitted() || !this.isStopMutationPossible();

    shouldSelectStopButtonBeDisabled = () => !this.isStopSkippingPermitted() || !this.isStopMutationPossible();

    isChangePlatformDisabled = () => !this.isStopMutationPermitted()
        || !this.isStopMutationPossible()
        || this.getAvailablePlatforms().length < 2;

    showChangePlatformModal = newPlatform => this.setState({ isChangePlatformModalOpen: true, newPlatform });

    hideChangePlatformModal = () => this.setState({ isChangePlatformModalOpen: false, newPlatform: {} });

    handleChangePlatform = () => {
        this.props.updateTripInstanceStopPlatform(
            {
                tripId: this.props.tripInstance.tripId,
                serviceDate: this.props.tripInstance.serviceDate,
                startTime: this.props.tripInstance.startTime,
                stopSequence: this.props.stop.stopSequence,
                stopId: this.state.newPlatform.stopId,
            },
            `Platform for stop #${this.props.stop.stopSequence} has been changed`,
        );
        this.hideChangePlatformModal();
    };

    getStopControlClassNames = () => {
        let stopControlClassNames = 'stop-control';
        if (this.isSkipped() || this.isNonStoppingStop()) { stopControlClassNames += ' stop-control--skipped'; }
        if (this.props.isCurrent) { stopControlClassNames += ' stop-control--current'; }
        if (this.isSkipStopDisabled()) { stopControlClassNames += ' stop-control--disabled'; }
        return stopControlClassNames;
    };

    getAvailablePlatforms = () => _.get(this.props.platforms, `${this.props.stop.parent}.children`, []);

    render() {
        const { stop, tripInstance, isStopInSelectionRange } = this.props;
        const stopKey = getStopKey(stop);
        const selectedStops = this.props.selectedStopsByTripKey(tripInstance);
        const isStopSelected = selectedStops && !_.isEmpty(selectedStops[stopKey]) && selectedStops[stopKey].status;

        if (!stop) return null;

        const actionButtonId = `stop-control-body-action-${stop.stopSequence}`;
        const stopFullName = `${stop.stopCode} - ${transformStopName(stop.stopName)}`;
        const platforms = this.getAvailablePlatforms();

        const isStopNotPassed = stop.status === StopStatus.notPassed;
        let actualOrPredictedStopTime = isStopNotPassed
            ? getTripTimeDisplay(stop.predictedDepartureTime || stop.predictedArrivalTime)
            : getTripTimeDisplay(stop.actualDepartureTime || stop.actualArrivalTime);
        actualOrPredictedStopTime = (this.isSkipped() || this.isNonStoppingStop()) ? '—' : actualOrPredictedStopTime;

        let stopControlActionClassName = 'stop-control__body__actions__action';
        if (isStopSelected) {
            stopControlActionClassName += ' stop-control__body__actions__action--visible stop-control__body__actions__action--selected';
        }
        if (this.shouldSelectStopButtonBeDisabled()) {
            stopControlActionClassName += ' stop-control__body__actions__action--disabled';
        }
        if (!this.isReinstateStopDisabled()) {
            stopControlActionClassName += ' stop-control__body__actions__action--revert';
        }

        return (
            <div className={
                `${this.getStopControlClassNames()} d-flex flex-column justify-content-end flex-grow-1 font-size-sm ${isStopInSelectionRange ? 'stop-control--in-range' : ''}`
            }>
                <div className="d-flex flex-column justify-content-end text-center px-2">
                    { this.isChangePlatformDisabled() && (
                        <div>{transformStopName(stop.stopName) || '—'}</div>
                    )}
                    { !this.isChangePlatformDisabled() && (
                        <UncontrolledDropdown size="sm">
                            <DropdownToggle caret className="text-info bg-transparent border-0">
                                <span className="white-space-normal">{transformStopName(stop.stopName)}</span>
                            </DropdownToggle>
                            <DropdownMenu className="py-1"
                                modifiers={
                                    {
                                        setMaxHeight: {
                                            enabled: true,
                                            order: 890,
                                            fn: data => ({
                                                ...data,
                                                styles: {
                                                    ...data.styles,
                                                    overflow: 'auto',
                                                    maxHeight: '100px',
                                                },
                                            }),
                                        },
                                    }
                                }
                            >
                                {platforms.map(item => (
                                    <DropdownItem
                                        className="btn-sm"
                                        key={ item.stopId }
                                        active={ item.stopId === stop.stopId }
                                        onClick={ () => {
                                            if (item.stopId !== stop.stopId) {
                                                this.showChangePlatformModal(item);
                                            }
                                        } }
                                    >
                                        {transformStopName(item.stopName)}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </UncontrolledDropdown>
                    )}
                    <div className="font-weight-bold mt-1">{stop.stopCode || '—'}</div>
                </div>
                <div className={ `stop-control__body ${this.props.lineInteractionClasses}` }>
                    <div className="stop-control__body__line" />
                    <div className="stop-control__body__actions">
                        <button
                            type="button"
                            aria-controls={ actionButtonId }
                            className="stop-control__body__actions__circle"
                            aria-label={ `Show ${stopFullName} stop actions` }
                            disabled={ this.isSkipStopDisabled() || this.isReinstateStopDisabled() }
                            onClick={ this.isSkipped() ? this.showSkipStopButton : this.showReinstateStopButton }
                            aria-expanded={ !this.state.isSkipStopButtonHidden && !this.state.isReinstateStopButtonHidden } />
                        {
                            !this.shouldSelectStopButtonBeDisabled() && (
                                <button
                                    type="button"
                                    id={ actionButtonId }
                                    className={ stopControlActionClassName }
                                    aria-label={ `Stop ${stopFullName} selected` }
                                    onMouseEnter={ () => this.props.onHover({ stop }) }
                                    onMouseLeave={ () => this.props.onHover(null) }
                                    onClick={ () => this.props.selectStops(tripInstance, stop) }>
                                    { isStopSelected && <FaCheck className="stop-control__body__actions__action__icon" size={ 14 } /> }
                                </button>
                            )
                        }
                    </div>
                    <ConfirmationModal
                        title="Change platform"
                        message={ `Are you sure you wish to change platform for stop #${stop.stopSequence} to ${this.state.newPlatform.stopCode} - ${transformStopName(this.state.newPlatform.stopName)}?` }
                        isOpen={ this.state.isChangePlatformModalOpen }
                        onClose={ this.hideChangePlatformModal }
                        onAction={ this.handleChangePlatform } />
                </div>
                <div className="stop-control__footer text-center">
                    <div>{getTripTimeDisplay(stop.scheduledDepartureTime || stop.departureTime || stop.scheduledArrivalTime || stop.arrivalTime)}</div>
                    <div className={ isStopNotPassed ? 'text-prediction' : 'text-muted' }>
                        { (this.props.tripInstance.status !== TRIP_STATUS_TYPES.cancelled) && actualOrPredictedStopTime }
                    </div>
                </div>
            </div>
        );
    }
}

export default connect(state => ({
    serviceDate: getServiceDate(state),
    platforms: getPlatforms(state),
    selectedStopsByTripKey: tripInstance => getSelectedStopsByTripKey(state.control.routes.tripInstances.selectedStops, tripInstance),
}), { updateTripInstanceStopPlatform, selectStops })(Stop);
