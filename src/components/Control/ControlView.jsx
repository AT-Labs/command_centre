import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';
import { getActiveControlDetailView, getActiveControlEntityId } from '../../redux/selectors/navigation';
import { updateActiveControlEntityId, updateControlDetailView } from '../../redux/actions/navigation';
import { updateDisruptionKeyToEditEffect } from '../../redux/actions/control/incidents';
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
import EditEffectPanel from './IncidentsView/IncidentCreation/EditIncidentDetails/EditEffectPanel';
import {
    getFilteredDisruptions,
    isEditEffectPanelOpen,
    getDisruptionKeyToEditEffect,
} from '../../redux/selectors/control/incidents';
import { useEditEffectPanel } from '../../redux/selectors/appSettings';
import { toggleEditEffectPanel } from '../../redux/actions/control/incidents';

const ControlViewComponent = (props) => {
    const location = useLocation();

    // Handle URL parameters for routing
    useEffect(() => {
        console.log('🔧 ControlView useEffect - pathname:', location.pathname);
        
        const pathParts = location.pathname.split('/');
        console.log('🔧 Path parts:', pathParts);
        
        // Check if the URL matches the control-incidents pattern with entity ID
        if (pathParts.length === 4 && 
            pathParts[1] === 'control-main-view' && 
            pathParts[2] === 'control-incidents' && 
            pathParts[3] && pathParts[3] !== '') {
            
            const entityId = pathParts[3];
            console.log('🔧 ===== CONTROL-INCIDENTS URL PATTERN MATCHED =====');
            console.log('🔧 Matched control-incidents URL pattern');
            console.log('🔧 Entity ID:', entityId);
            
            if (entityId && entityId !== '') {
                console.log('🔧 Setting control detail view to INCIDENTS');
                // Set the control detail view to INCIDENTS to trigger EditEffectPanel
                props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.INCIDENTS);
                console.log('🔧 Setting active control entity ID:', entityId);
                // Set the active entity ID
                props.updateActiveControlEntityId(entityId);
                console.log('🔧 Setting disruption key to edit effect:', entityId);
                // Set the disruption key to edit effect - use incidentNo format
                const incidentNo = `DISR${entityId}`;
                console.log('🔧 Using incidentNo format:', incidentNo);
                props.updateDisruptionKeyToEditEffect(incidentNo);
                console.log('🔧 URL handling completed');
                console.log('🔧 ===== END CONTROL-INCIDENTS URL HANDLING =====');
            }
        }
        
        // Check if the URL matches the control-disruptions pattern with entity ID
        if (pathParts.length >= 4 && 
            pathParts[1] === 'control-main-view' && 
            pathParts[2] === 'control-disruptions') {
            
            console.log('🔧 Matched control-disruptions URL pattern');
            const entityId = pathParts[3];
            console.log('🔧 Entity ID:', entityId);
            
            if (entityId && entityId !== '') {
                console.log('🔧 Setting control detail view to INCIDENTS');
                // Set the control detail view to INCIDENTS to trigger EditEffectPanel
                props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.INCIDENTS);
                console.log('🔧 Setting active control entity ID:', entityId);
                // Set the active entity ID
                props.updateActiveControlEntityId(entityId);
                console.log('🔧 Setting disruption key to edit effect:', entityId);
                // Set the disruption key to edit effect - use incidentNo format
                const incidentNo = `DISR${entityId}`;
                console.log('🔧 Using incidentNo format:', incidentNo);
                props.updateDisruptionKeyToEditEffect(incidentNo);
                console.log('🔧 URL handling completed');
            }
        }
    }, [location.pathname, props]);

    // Auto-open Edit Effect Panel when we have a disruption to edit
    useEffect(() => {
        console.log('🔧 EditEffectPanel useEffect triggered');
        console.log('🔧 useEditEffectPanel:', props.useEditEffectPanel);
        console.log('🔧 isEditEffectPanelOpen:', props.isEditEffectPanelOpen);
        console.log('🔧 disruptionIncidentNoToEdit:', props.disruptionIncidentNoToEdit);
        console.log('🔧 filteredDisruptions length:', props.filteredDisruptions?.length);
        
        if (props.useEditEffectPanel && 
            props.disruptionIncidentNoToEdit && 
            props.disruptionIncidentNoToEdit !== '' &&
            !props.isEditEffectPanelOpen) {
            
            console.log('🔧 Conditions met for opening EditEffectPanel');
            
            // Find the disruption to edit
            const disruptionToEdit = props.filteredDisruptions?.find(
                d => d.incidentNo === props.disruptionIncidentNoToEdit
            );
            
            console.log('🔧 Found disruption to edit:', disruptionToEdit);
            
            if (disruptionToEdit) {
                console.log('🔧 Setting disruptionIncidentNoToEdit and opening EditEffectPanel');
                props.toggleEditEffectPanel(true); // RE-ENABLED - open when DiversionManager is cancelled
                console.log('🔧 EditEffectPanel opened after DiversionManager cancellation');
            } else {
                console.log('🔧 Disruption not found in filteredDisruptions');
            }
        } else {
            console.log('🔧 Conditions not met for opening EditEffectPanel');
        }
    }, [props.disruptionIncidentNoToEdit, props.filteredDisruptions, props.useEditEffectPanel, props.isEditEffectPanelOpen]);

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
    const isDisruptionDetailsView = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS && !!props.activeControlEntityId;
    const isIncidentsViewWithEntity = props.activeControlDetailView === VIEW_TYPE.CONTROL_DETAIL.INCIDENTS && !!props.activeControlEntityId;

    console.log('🔧 Render state:');
    console.log('🔧 activeControlDetailView:', props.activeControlDetailView);
    console.log('🔧 activeControlEntityId:', props.activeControlEntityId);
    console.log('🔧 isDisruptionDetailsView:', isDisruptionDetailsView);
    console.log('🔧 isIncidentsViewWithEntity:', isIncidentsViewWithEntity);

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
                    { isIncidentsView && !isIncidentsViewWithEntity && <IncidentsView />}
                    { isIncidentsViewWithEntity && <IncidentsView />}
                    { isDisruptionsView && !isDisruptionDetailsView && <DisruptionsView /> }
                    { isDisruptionDetailsView && <IncidentsView /> }
                    { isTripReplaysView && <TripReplaysView /> }
                    { isDataManagementView && <DataManagement /> }
                    { isNotificationsView && <NotificationsView /> }
                </div>
            </Main>
            <SecondarySidePanel />
        </OffCanvasLayout>
    );
};

ControlViewComponent.propTypes = {
    activeControlDetailView: PropTypes.string.isRequired,
    useRoutesTripsDatagrid: PropTypes.bool.isRequired,
    isGroupedByRouteVariant: PropTypes.bool.isRequired,
    isGroupedByRoute: PropTypes.bool.isRequired,
    activeControlEntityId: PropTypes.string,
    updateActiveControlEntityId: PropTypes.func.isRequired,
    updateControlDetailView: PropTypes.func.isRequired,
};

ControlViewComponent.defaultProps = {
    activeControlEntityId: '',
};

const ControlViewWithRouter = (props) => {
    return <ControlViewComponent {...props} />;
};

export default connect(
    state => ({
        activeControlDetailView: getActiveControlDetailView(state),
        useRoutesTripsDatagrid: useRoutesTripsDatagrid(state),
        isGroupedByRouteVariant: getGroupedByRouteVariantFilter(state),
        isGroupedByRoute: getGroupedByRouteFilter(state),
        activeControlEntityId: getActiveControlEntityId(state),
        filteredDisruptions: getFilteredDisruptions(state),
        useEditEffectPanel: useEditEffectPanel(state),
        isEditEffectPanelOpen: isEditEffectPanelOpen(state),
        disruptionIncidentNoToEdit: getDisruptionKeyToEditEffect(state),
    }),
    {
        updateActiveControlEntityId,
        updateControlDetailView,
        updateDisruptionKeyToEditEffect,
        toggleEditEffectPanel,
    }
)(ControlViewWithRouter);
