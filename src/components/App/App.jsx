import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { LicenseInfo } from '@mui/x-data-grid-pro';

import { getAuthUser } from '../../auth';
import { startPollingSiteStatus } from '../../redux/actions/activity';
import { startPollingAlerts } from '../../redux/actions/control/alerts';
import { startTrackingVehicleAllocations } from '../../redux/actions/control/blocks';
import { getBuses, getFerries, getTrains } from '../../redux/actions/static/fleet';
import { setCache } from '../../redux/actions/static/cache';
import {
    fetchBlocksViewPermission,
    fetchDisruptionsViewPermission,
    fetchTripReplaysViewPermission,
    fetchAlertsViewPermission,
    fetchRoutesViewPermission,
    fetchStopMessagingViewPermission,
    updateUserProfile,
} from '../../redux/actions/user';
import { hasPrerequisiteDataLoaded, isAnyError } from '../../redux/selectors/activity';
import { getActiveMainView } from '../../redux/selectors/navigation';
import VIEW_TYPE from '../../types/view-types';
import { IS_ALERTS_ENABLED, IS_DISRUPTIONS_ENABLED, IS_TRIP_REPLAYS_ENABLED } from '../../utils/feature-toggles';
import BrowserCompatibilityModal from '../Common/BrowserCompatibilityModal/BrowserCompatibilityModal';
import MaskLoader from '../Common/Loader/MaskLoader';
import ControlView from '../Control/ControlView';
import DashboardView from '../Dashboard/DashboardView';
import AnalyticsView from '../Analytics/AnalyticsView';
import GoogleTagManager from '../GoogleTagManager/GoogleTagManager';
import RealTimeView from '../RealTime/RealTimeView';
import ActivityIndicator from './ActivityIndicator';
import './App.scss';
import Header from './Header/Header';
import ERROR_TYPE from '../../types/error-types';
import { getApplicationSettings } from '../../redux/actions/appSettings';
import 'flatpickr/dist/flatpickr.css';

function App(props) {
    const mainViews = {
        [VIEW_TYPE.MAIN.REAL_TIME]: <RealTimeView />,
        [VIEW_TYPE.MAIN.CONTROL]: <ControlView />,
        [VIEW_TYPE.MAIN.DASHBOARD]: <DashboardView />,
        [VIEW_TYPE.MAIN.ANALYTICS]: <AnalyticsView />,
    };

    const injectTracingSnippet = () => {
        const script = document.createElement('script');
        script.async = true;
        script.src = `/nr/nr-${process.env.NODE_ENV}.js`;
        document.head.appendChild(script);
    };

    const { REACT_APP_MUI_LICENSE } = process.env;

    useEffect(() => {
        LicenseInfo.setLicenseKey(REACT_APP_MUI_LICENSE);
        Promise.all([
            props.getTrains(),
            props.getBuses(),
            props.getFerries(),
            props.setCache(),
        ]).then(() => {
            props.updateUserProfile(getAuthUser());
            props.fetchBlocksViewPermission();
            props.fetchRoutesViewPermission();
            props.fetchStopMessagingViewPermission();
            props.startTrackingVehicleAllocations();
            if (IS_DISRUPTIONS_ENABLED) {
                props.fetchDisruptionsViewPermission();
            }
            if (IS_TRIP_REPLAYS_ENABLED) {
                props.fetchTripReplaysViewPermission();
            }
            if (IS_ALERTS_ENABLED) {
                props.fetchAlertsViewPermission();
                props.startPollingAlerts();
            }
            props.startPollingSiteStatus();
            if (!window.Cypress) {
                injectTracingSnippet();
            }
        });
        props.getApplicationSettings();
    }, []);

    return (
        <div className="app">
            <div>
                <Header />
                {(props.isInitLoading && <MaskLoader error={ props.hasError ? ERROR_TYPE.initial : null } />) || (mainViews[props.activeMainView])}
                <ActivityIndicator />
                <BrowserCompatibilityModal />
            </div>
            {process.env.NODE_ENV !== 'local' && <GoogleTagManager gtmId={ process.env.REACT_APP_GOOGLE_TAG_MANAGER_ID } />}
        </div>
    );
}

App.propTypes = {
    hasError: PropTypes.bool.isRequired,
    isInitLoading: PropTypes.bool.isRequired,
    setCache: PropTypes.func.isRequired,
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
    fetchAlertsViewPermission: PropTypes.func.isRequired,
    startPollingAlerts: PropTypes.func.isRequired,
    fetchTripReplaysViewPermission: PropTypes.func.isRequired,
    getApplicationSettings: PropTypes.func.isRequired,
};

export default connect(state => ({
    hasError: isAnyError(state),
    isInitLoading: !hasPrerequisiteDataLoaded(state),
    activeMainView: getActiveMainView(state),
}), {
    setCache,
    startPollingSiteStatus,
    getTrains,
    getBuses,
    getFerries,
    updateUserProfile,
    fetchRoutesViewPermission,
    fetchBlocksViewPermission,
    fetchStopMessagingViewPermission,
    fetchDisruptionsViewPermission,
    fetchAlertsViewPermission,
    startPollingAlerts,
    startTrackingVehicleAllocations,
    fetchTripReplaysViewPermission,
    getApplicationSettings,
})(App);
