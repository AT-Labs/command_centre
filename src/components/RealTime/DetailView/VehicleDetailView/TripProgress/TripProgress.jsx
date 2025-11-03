import { some, has } from 'lodash-es';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import './TripProgress.scss';
import { fetchUpcomingStops, fetchPastStops } from '../../../../../redux/actions/realtime/detail/vehicle';
import { getVehicleUpcomingStops, getVehiclePastStops } from '../../../../../redux/selectors/realtime/detail';
import MESSAGE_TYPES from '../../../../../types/detail-message-types';
import AutoRefreshTable from '../../../../Common/AutoRefreshTable/AutoRefreshTable';
import { getColumns } from './columns';

class TripProgress extends PureComponent {
    static propTypes = {
        vehicleId: PropTypes.string.isRequired,
        fetchUpcomingStops: PropTypes.func.isRequired,
        upcomingStops: PropTypes.array,
        fetchPastStops: PropTypes.func.isRequired,
        pastStops: PropTypes.array,
    };

    static defaultProps = {
        upcomingStops: undefined,
        pastStops: undefined,
    };

    render() {
        const { vehicleId, upcomingStops, pastStops } = this.props;
        const hasStopActualTime = some(upcomingStops, stop => has(stop, 'actualTime'));

        return (
            <section className="trip-progress">
                <h4 className="mx-4 mt-4 mb-0">Trip progress:</h4>
                <AutoRefreshTable
                    rows={ pastStops }
                    fetchRows={ () => this.props.fetchPastStops(vehicleId) }
                    columns={ getColumns() }
                    className="trip-progress__past-stops-table px-4 pb-0 pt-3"
                    striped={ false }
                    emptyMessage={ MESSAGE_TYPES.pastStopNotInfo } />
                <div className="trip-progress__current-stop-indicator">
                    <span className="text-uppercase text-white font-weight-bold">Current location</span>
                </div>
                <AutoRefreshTable
                    rows={ upcomingStops }
                    striped={ false }
                    fetchRows={ () => this.props.fetchUpcomingStops(vehicleId) }
                    columns={ getColumns() }
                    className="trip-progress__upcoming-stops-table px-4 pt-0 pb-3"
                    emptyMessage={ MESSAGE_TYPES.upcomingStopNoInfo }
                    noteMessage={ hasStopActualTime ? null : MESSAGE_TYPES.upcomingStopNoPrediction }
                    shouldShowHeader={ false } />
            </section>
        );
    }
}

export default connect(
    state => ({
        upcomingStops: getVehicleUpcomingStops(state),
        pastStops: getVehiclePastStops(state),
    }),
    { fetchUpcomingStops, fetchPastStops },
)(TripProgress);
