import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { getActiveControlDetailView, getActiveControlEntityId } from '../../redux/selectors/navigation';
import VIEW_TYPE from '../../types/view-types';
import ErrorBanner from './ErrorBanner/ErrorBanner';
import BlocksView from './BlocksView/BlocksView';
import CommonView from './RoutesView/legacy/CommonView';
import RoutesAndTripsView from './RoutesView/RoutesAndTripsView';
import RecurringCancellationsView from './RoutesView/recurringCancellations/RecurringCancellationsView';
import Main from '../Common/OffCanvasLayout/Main/Main';
import OffCanvasLayout from '../Common/OffCanvasLayout/OffCanvasLayout';
import SecondarySidePanel from '../Common/OffCanvasLayout/SecondarySidePanel/SecondarySidePanel';
import StopMessagesView from './StopMessagingView/StopMessagesView';
import IncidentsView from './IncidentsView';
import DisruptionsView from './DisruptionsView';
import DisruptionDetailView from './DisruptionsView/DisruptionDetailView';
import AlertsView from './Alerts/AlertsView';
import FleetsView from './Fleets/FleetsView';
import TripReplaysView from './TripReplaysView/TripReplaysView';
import DataManagement from './DataManagement/DataManagement';
import NotificationsView from './Notifications/NotificationsView';
import { useRoutesTripsDatagrid } from '../../redux/selectors/appSettings';
import {
    getGroupedByRouteFilter,
    getGroupedByRouteVariantFilter,
} from '../../redux/selectors/control/routes/filters';

const ControlView = (props) => {
    const isBlocksView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.BLOCKS;
    const isRoutesView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.ROUTES;
    const isStopMessagesView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.STOP_MESSAGES;
    const isAlertsView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.ALERTS;
    const isFleetsView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.FLEETS;
    const isDisruptionsView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS;
    const isIncidentsView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.INCIDENTS;
    const isTripReplaysView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.TRIP_REPLAYS;
    const isDataManagementView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.DATA_MANAGEMENT;
    const isNotificationsView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.NOTIFICATIONS;
    const isRecurringCancellationsView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.RECURRING_CANCELLATIONS;
    const isDisruptionDetailsView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS && props.activeControlEntityId;

    const isHeight100Percent = (isRoutesView && props.useRoutesTripsDatagrid && !props.isGroupedByRouteVariant && !props.isGroupedByRoute);

    return (
        <OffCanvasLayout>
            <Main className="control-view">
                <ErrorBanner />
                <div className={ classNames({ 'p-4': ((!isTripReplaysView && !isDisruptionsView && !isIncidentsView)), 'h-100': isHeight100Percent }) }>
                    { isBlocksView && <BlocksView /> }
                    { isRoutesView && !props.useRoutesTripsDatagrid && <CommonView /> }
                    { isRoutesView && props.useRoutesTripsDatagrid && <RoutesAndTripsView /> }
                    { isRecurringCancellationsView && <RecurringCancellationsView /> }
                    { isStopMessagesView && <StopMessagesView /> }
                    { isAlertsView && <AlertsView /> }
                    { isFleetsView && <FleetsView /> }
                    { isIncidentsView && <IncidentsView />}
                    { isDisruptionsView && !isDisruptionDetailsView && <DisruptionsView /> }
                    { isDisruptionDetailsView && <DisruptionDetailView /> }
                    { isTripReplaysView && <TripReplaysView /> }
                    { isDataManagementView && <DataManagement /> }
                    { isNotificationsView && <NotificationsView /> }
                </div>
            </Main>
            <SecondarySidePanel />
        </OffCanvasLayout>
    );
};

ControlView.propTypes = {
    activeControlDetailView: PropTypes.string.isRequired,
    useRoutesTripsDatagrid: PropTypes.bool.isRequired,
    isGroupedByRouteVariant: PropTypes.bool.isRequired,
    isGroupedByRoute: PropTypes.bool.isRequired,
    activeControlEntityId: PropTypes.string,
};

ControlView.defaultProps = {
    activeControlEntityId: '',
};

export default connect(
    state => ({
        activeControlDetailView: getActiveControlDetailView(state),
        useRoutesTripsDatagrid: useRoutesTripsDatagrid(state),
        isGroupedByRouteVariant: getGroupedByRouteVariantFilter(state),
        isGroupedByRoute: getGroupedByRouteFilter(state),
        activeControlEntityId: getActiveControlEntityId(state),
    }),
)(ControlView);
