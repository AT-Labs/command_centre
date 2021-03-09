import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { getAuthUser } from '../../auth';
import { startPollingSiteStatus } from '../../redux/actions/activity';
import { startPollingNotifications } from '../../redux/actions/control/notifications';
import { startTrackingVehicleAllocations } from '../../redux/actions/control/blocks';
import { getBuses, getFerries, getTrains } from '../../redux/actions/static/fleet';
import { getRoutes } from '../../redux/actions/static/routes';
import { getStops } from '../../redux/actions/static/stops';
import {
    fetchBlocksViewPermission,
    fetchDisruptionsViewPermission,
    fetchTripReplaysViewPermission,
    fetchNotificationsViewPermission,
    fetchRoutesViewPermission,
    fetchStopMessagingViewPermission,
    updateUserProfile,
} from '../../redux/actions/user';
import { hasPrerequisiteDataLoaded, isAnyError } from '../../redux/selectors/activity';
import { getActiveMainView } from '../../redux/selectors/navigation';
import VIEW_TYPE from '../../types/view-types';
import { IS_NOTIFICATIONS_ENABLED, IS_DISRUPTIONS_ENABLED, IS_TRIP_REPLAYS_ENABLED } from '../../utils/feature-toggles';
import BrowserCompatibilityModal from '../Common/BrowserCompatibilityModal/BrowserCompatibilityModal';
import MaskLoader from '../Common/Loader/MaskLoader';
import ControlView from '../Control/ControlView';
import DashboardView from '../Dashboard/DashboardView';
import GoogleTagManager from '../GoogleTagManager/GoogleTagManager';
import RealTimeView from '../RealTime/RealTimeView';
import ActivityIndicator from './ActivityIndicator';
import './App.scss';
import Header from './Header/Header';
import ERROR_TYPE from '../../types/error-types';

class App extends Component {
    static propTypes = {
        hasError: PropTypes.bool.isRequired,
        isInitLoading: PropTypes.bool.isRequired,
        getStops: PropTypes.func.isRequired,
        getRoutes: PropTypes.func.isRequired,
        startPollingSiteStatus: PropTypes.func.isRequired,
        getTrains: PropTypes.func.isRequired,
        getFerries: PropTypes.func.isRequired,
        getBuses: PropTypes.func.isRequired,
        startTrackingVehicleAllocations: PropTypes.func.isRequired,
        activeMainView: PropTypes.string.isRequired,
        updateUserProfile: PropTypes.func.isRequired,
        fetchRoutesViewPermission: PropTypes.func.isRequired,
        fetchBlocksViewPermission: PropTypes.func.isRequired,
        fetchStopMessagingViewPermission: PropTypes.func.isRequired,
        fetchDisruptionsViewPermission: PropTypes.func.isRequired,
        fetchNotificationsViewPermission: PropTypes.func.isRequired,
        startPollingNotifications: PropTypes.func.isRequired,
        fetchTripReplaysViewPermission: PropTypes.func.isRequired,
    }

    mainViews = {
        [VIEW_TYPE.MAIN.REAL_TIME]: <RealTimeView />,
        [VIEW_TYPE.MAIN.CONTROL]: <ControlView />,
        [VIEW_TYPE.MAIN.DASHBOARD]: <DashboardView />,
    }

    componentDidMount() {
        Promise.all([
            this.props.getTrains(),
            this.props.getBuses(),
            this.props.getFerries(),
            this.props.getStops(),
            this.props.getRoutes(),
        ]).then(() => {
            this.props.updateUserProfile(getAuthUser());
            this.props.fetchBlocksViewPermission();
            this.props.fetchRoutesViewPermission();
            this.props.fetchStopMessagingViewPermission();
            this.props.startTrackingVehicleAllocations();
            if (IS_DISRUPTIONS_ENABLED) {
                this.props.fetchDisruptionsViewPermission();
            }
            if (IS_TRIP_REPLAYS_ENABLED) {
                this.props.fetchTripReplaysViewPermission();
            }
            if (IS_NOTIFICATIONS_ENABLED) {
                this.props.fetchNotificationsViewPermission();
                this.props.startPollingNotifications();
            }
            this.props.startPollingSiteStatus();
        });
    }

    render() {
        const { isInitLoading, hasError, activeMainView } = this.props;
        return (
            <div className="app">
                <div>
                    <Header />
                    {(isInitLoading && <MaskLoader error={ hasError ? ERROR_TYPE.initial : null } />) || (this.mainViews[activeMainView])}
                    <ActivityIndicator />
                    <BrowserCompatibilityModal />
                </div>
                {process.env.NODE_ENV !== 'local' && <GoogleTagManager gtmId={ process.env.REACT_APP_GOOGLE_TAG_MANAGER_ID } />}
            </div>
        );
    }
}

export default connect(state => ({
    hasError: isAnyError(state),
    isInitLoading: !hasPrerequisiteDataLoaded(state),
    activeMainView: getActiveMainView(state),
}), {
    getStops,
    getRoutes,
    startPollingSiteStatus,
    getTrains,
    getBuses,
    getFerries,
    updateUserProfile,
    fetchRoutesViewPermission,
    fetchBlocksViewPermission,
    fetchStopMessagingViewPermission,
    fetchDisruptionsViewPermission,
    fetchNotificationsViewPermission,
    startPollingNotifications,
    startTrackingVehicleAllocations,
    fetchTripReplaysViewPermission,
})(App);
