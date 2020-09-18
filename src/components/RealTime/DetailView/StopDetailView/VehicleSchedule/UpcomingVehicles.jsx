import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { fetchUpcomingVehicles } from '../../../../../redux/actions/realtime/detail/stop';
import { getUpcomingVehicles } from '../../../../../redux/selectors/realtime/detail';
import MESSAGE_TYPES from '../../../../../types/detail-message-types';
import AutoRefreshTable from '../../../../Common/AutoRefreshTable/AutoRefreshTable';
import { getColumns } from './columns';

export class UpcomingVehicles extends PureComponent {
    static propTypes = {
        stopId: PropTypes.string.isRequired,
        fetchUpcomingVehicles: PropTypes.func.isRequired,
        upcomingVehicles: PropTypes.array,
    };

    static defaultProps = {
        upcomingVehicles: undefined,
    };

    render() {
        const { stopId, upcomingVehicles } = this.props;

        return (
            <AutoRefreshTable
                rows={ upcomingVehicles }
                fetchRows={ () => this.props.fetchUpcomingVehicles(stopId) }
                columns={ getColumns({ isHistorical: false }) }
                className="upcoming-vehicles"
                title="Upcoming Vehicles"
                emptyMessage={ MESSAGE_TYPES.upcomingVehicleNoInfo } />
        );
    }
}

export default connect(
    state => ({
        upcomingVehicles: getUpcomingVehicles(state),
    }),
    { fetchUpcomingVehicles },
)(UpcomingVehicles);
