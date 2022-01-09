import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { FormGroup, Label, Input } from 'reactstrap';
import { mergeRouteFilters } from '../../../../redux/actions/control/routes/filters';
import {
    getTripStatusFilter,
    getTrackingStatusesFilter,
} from '../../../../redux/selectors/control/routes/filters';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';

export const TrackingStatus = {
    TRACKING: 'TRACKING',
    STOPPED: 'STOPPED',
    LOST_TRACKING: 'LOST_TRACKING',
    NOT_TRACKING: 'NOT_TRACKING',
};

export const allTrackingStatuses = [TrackingStatus.TRACKING, TrackingStatus.LOST_TRACKING, TrackingStatus.STOPPED, TrackingStatus.NOT_TRACKING];

export class FilterByTrackingStatus extends React.Component {
    static propTypes = {
        mergeRouteFilters: PropTypes.func.isRequired,
        tripStatus: PropTypes.string.isRequired,
        trackingStatuses: PropTypes.array.isRequired,
    };

    handleTrackingStatusChange = (trackingStatus, checked) => {
        const trackingStatuses = _.clone(this.props.trackingStatuses.length ? this.props.trackingStatuses : allTrackingStatuses);
        if (checked) {
            trackingStatuses.splice(trackingStatuses.indexOf(trackingStatus), 1);
        } else if (!trackingStatuses.includes(trackingStatus)) {
            trackingStatuses.push(trackingStatus);
        }

        this.props.mergeRouteFilters({ trackingStatuses: trackingStatuses.length === allTrackingStatuses.length ? [] : trackingStatuses });
    };

    isDisabled = () => this.props.tripStatus !== TRIP_STATUS_TYPES.inProgress;

    isChecked = status => this.props.trackingStatuses.length > 0 && !this.props.trackingStatuses.includes(status) && !this.isDisabled();

    render() {
        return (
            <div>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            disabled={ this.isDisabled() }
                            checked={ this.isChecked(TrackingStatus.TRACKING) }
                            onChange={ event => this.handleTrackingStatusChange(TrackingStatus.TRACKING, event.target.checked) }
                        />
                        <span className="font-weight-light">Hide tracked vehicles</span>
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            disabled={ this.isDisabled() }
                            checked={ this.isChecked(TrackingStatus.LOST_TRACKING) }
                            onChange={ event => this.handleTrackingStatusChange(TrackingStatus.LOST_TRACKING, event.target.checked) }
                        />
                        <span className="font-weight-light">Hide untracked vehicles</span>
                    </Label>
                </FormGroup>
            </div>
        );
    }
}

export default connect(
    state => ({
        tripStatus: getTripStatusFilter(state),
        trackingStatuses: getTrackingStatusesFilter(state),
    }),
    { mergeRouteFilters },
)(FilterByTrackingStatus);
