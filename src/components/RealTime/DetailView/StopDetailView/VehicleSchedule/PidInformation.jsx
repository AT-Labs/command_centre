import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

import { fetchPidInformation } from '../../../../../redux/actions/realtime/detail/stop';
import { getPidMessages, getPidInformation } from '../../../../../redux/selectors/realtime/detail';
import { getAllStops, getChildStops } from '../../../../../redux/selectors/static/stops';
import MESSAGE_TYPES from '../../../../../types/detail-message-types';
import VEHICLE_TYPES from '../../../../../types/vehicle-types';
import AutoRefreshTable from '../../../../Common/AutoRefreshTable/AutoRefreshTable';
import Icon from '../../../../Common/Icon/Icon';
import { getPidColumns } from './columns';
import PidMessages from './PidMessages';
import './PidInformation.scss';

export class PidInformation extends PureComponent {
    static propTypes = {
        stopCode: PropTypes.string.isRequired,
        fetchPidInformation: PropTypes.func.isRequired,
        pidMessages: PropTypes.array,
        pidInformation: PropTypes.array,
        stops: PropTypes.object,
        childStops: PropTypes.object,
    };

    static defaultProps = {
        pidMessages: null,
        pidInformation: null,
        stops: null,
        childStops: null,
    };

    render() {
        const { stopCode, pidMessages, pidInformation, stops, childStops } = this.props;
        const selectedStop = Object.values(stops).find(stop => stop.stop_code === stopCode);
        const isTrainStop = selectedStop.route_type ? VEHICLE_TYPES[selectedStop.route_type].type === 'Train' : false;
        const isFerryStop = selectedStop.route_type ? VEHICLE_TYPES[selectedStop.route_type].type === 'Ferry' : false;
        const isParentBusStop = selectedStop.route_type ? VEHICLE_TYPES[selectedStop.route_type].type === 'Bus' && !childStops[stopCode] : false;
        return (
            <div>
                {pidMessages && (
                    <div className="pid-alert">
                        <Icon icon="alert" className="icon d-inline-block" />
                        <div className="alert-message">
                            <PidMessages messages={ pidMessages } />
                        </div>
                    </div>
                )}
                <AutoRefreshTable
                    rows={ pidInformation }
                    fetchRows={ () => this.props.fetchPidInformation(stopCode) }
                    columns={ getPidColumns({ isTrainStop, isFerryStop, isParentBusStop }) }
                    className="pid-information"
                    emptyMessage={ MESSAGE_TYPES.pidInformationNoInfo } />
            </div>
        );
    }
}

export default connect(
    state => ({
        pidMessages: getPidMessages(state),
        pidInformation: getPidInformation(state),
        stops: getAllStops(state),
        childStops: getChildStops(state),
    }),
    { fetchPidInformation },
)(PidInformation);
