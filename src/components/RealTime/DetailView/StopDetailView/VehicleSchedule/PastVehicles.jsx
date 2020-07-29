import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { fetchPastVehicles } from '../../../../../redux/actions/realtime/detail/stop';
import { getPastVehicles } from '../../../../../redux/selectors/realtime/detail';
import messageType from '../../../../../types/detail-message-type';
import AutoRefreshTable from '../../../../Common/AutoRefreshTable/AutoRefreshTable';
import { getColumns } from './columns';

class PastVehicles extends PureComponent {
    static propTypes = {
        stopId: PropTypes.string.isRequired,
        fetchPastVehicles: PropTypes.func.isRequired,
        pastVehicles: PropTypes.array,
    };

    static defaultProps = {
        pastVehicles: undefined,
    };

    render() {
        const { stopId, pastVehicles } = this.props;

        return (
            <AutoRefreshTable
                rows={ pastVehicles }
                fetchRows={ () => this.props.fetchPastVehicles(stopId) }
                columns={ getColumns({ isHistorical: true }) }
                className="past-vehicles"
                title="Past Vehicles"
                emptyMessage={ messageType.pastVehicleNotInfo }
            />
        );
    }
}

export default connect(
    state => ({
        pastVehicles: getPastVehicles(state),
    }),
    { fetchPastVehicles },
)(PastVehicles);
