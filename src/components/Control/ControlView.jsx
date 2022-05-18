import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
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
import DisruptionsView from './DisruptionsView';
import AlertsView from './Alerts/AlertsView';
import TripReplaysView from './TripReplaysView/TripReplaysView';
import DataManagement from './DataManagement/DataManagement';
import { getApplicationSettings } from '../../redux/actions/appSettings';

const ControlView = (props) => {
    const isBlocksView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.BLOCKS;
    const isRoutesView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.ROUTES;
    const isStopMessagesView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.STOP_MESSAGES;
    const isAlertsView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.ALERTS;
    const isDisruptionsView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS;
    const isTripReplaysView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.TRIP_REPLAYS;
    const isDataManagementView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.DATA_MANAGEMENT;

    useEffect(() => {
        props.getApplicationSettings();
    }, []);

    return (
        <OffCanvasLayout>
            <Main className="control-view">
                <ErrorBanner />
                <div className={ classNames({ 'p-4': (!isTripReplaysView && !isDisruptionsView) }) }>
                    { isBlocksView && <BlocksView /> }
                    { isRoutesView && <CommonView /> }
                    { isStopMessagesView && <StopMessagesView /> }
                    { isAlertsView && <AlertsView /> }
                    { isDisruptionsView && <DisruptionsView /> }
                    { isTripReplaysView && <TripReplaysView /> }
                    { isDataManagementView && <DataManagement /> }
                </div>
            </Main>
            <SecondarySidePanel />
        </OffCanvasLayout>
    );
};

ControlView.propTypes = {
    activeControlDetailView: PropTypes.string.isRequired,
    getApplicationSettings: PropTypes.func.isRequired,
};

export default connect(
    state => ({
        activeControlDetailView: getActiveControlDetailView(state),
    }),
    {
        getApplicationSettings,
    },
)(ControlView);
