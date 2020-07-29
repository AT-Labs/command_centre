import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { getActiveControlDetailView } from '../../redux/selectors/navigation';
import VIEW_TYPE from '../../types/view-types';
import ErrorBanner from './ErrorBanner/ErrorBanner';
import BlocksView from './BlocksView/BlocksView';
import CommonView from './RoutesView/CommonView';
import Main from '../Common/OffCanvasLayout/Main/Main';
import OffCanvasLayout from '../Common/OffCanvasLayout/OffCanvasLayout';
import SecondarySidePanel from '../Common/OffCanvasLayout/SecondarySidePanel/SecondarySidePanel';
import StopMessagesView from './StopMessagingView/StopMessagesView';
import StopGroupsView from './StopMessagingView/StopGroupsView';
import DisruptionsView from './DisruptionsView';
import Notifications from './NotificationsView/NotificationsView';
import TripReplaysView from './TripReplaysView/TripReplaysView';

const ControlView = (props) => {
    const isBlocksView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.BLOCKS;
    const isRoutesView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.ROUTES;
    const isStopMessagesView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.STOP_MESSAGES;
    const isStopGroupView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.STOP_GROUPS;
    const isNotificationsView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.NOTIFICATIONS;
    const isDisruptionsView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS;
    const isTripReplaysView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.TRIP_REPLAYS;

    return (
        <OffCanvasLayout>
            <Main className="control-view">
                <ErrorBanner />
                <div className={ classNames({ 'p-4': !isTripReplaysView }) }>
                    { isBlocksView && <BlocksView /> }
                    { isRoutesView && <CommonView /> }
                    { isStopMessagesView && <StopMessagesView /> }
                    { isStopGroupView && <StopGroupsView /> }
                    { isNotificationsView && <Notifications /> }
                    { isDisruptionsView && <DisruptionsView /> }
                    { isTripReplaysView && <TripReplaysView /> }
                </div>
            </Main>
            <SecondarySidePanel />
        </OffCanvasLayout>
    );
};

ControlView.propTypes = {
    activeControlDetailView: PropTypes.string.isRequired,
};

export default connect(
    state => ({
        activeControlDetailView: getActiveControlDetailView(state),
    }),
    {},
)(ControlView);
