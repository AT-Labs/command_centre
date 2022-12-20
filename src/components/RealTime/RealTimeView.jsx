import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getSearchTerms } from '../../redux/selectors/search';
import { addressSelected } from '../../redux/actions/realtime/detail/address';
import { routeChecked } from '../../redux/actions/realtime/detail/route';
import { stopChecked, stopSelected } from '../../redux/actions/realtime/detail/stop';
import { vehicleChecked } from '../../redux/actions/realtime/detail/vehicle';
import { startTrackingVehicles } from '../../redux/actions/realtime/vehicles';
import {
    getStopDetail,
    getRouteDetail,
    getVehicleDetail,
    getClearForReplace,
    getSelectedSearchResults,
    getAddressDetail,
    getViewDetailKey,
    getVisibleEntities,
    getCheckedStops,
    getVisibleStops,
} from '../../redux/selectors/realtime/detail';
import { getAllocations } from '../../redux/selectors/control/blocks';
import { getRealTimeSidePanelIsOpen, getRealTimeSidePanelIsActive, getShouldShowSearchBox } from '../../redux/selectors/navigation';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';
import Main from '../Common/OffCanvasLayout/Main/Main';
import OffCanvasLayout from '../Common/OffCanvasLayout/OffCanvasLayout';
import SidePanel from '../Common/OffCanvasLayout/SidePanel/SidePanel';
import SecondarySidePanel from '../Common/OffCanvasLayout/SecondarySidePanel/SecondarySidePanel';
import OmniSearch, { defaultTheme } from '../OmniSearch/OmniSearch';
import DetailView from './DetailView/DetailView';
import { Map } from '../Common/Map/Map';
import VehicleFilters from './VehicleFilters/VehicleFilters';
import ErrorAlerts from './ErrorAlert/ErrorAlerts';
import Feedback from './Feedback/Feedback';
import { updateRealTimeDetailView } from '../../redux/actions/navigation';
import { addSelectedSearchResult, removeSelectedSearchResult, clearSelectedSearchResult } from '../../redux/actions/realtime/detail/common';
import { formatRealtimeDetailListItemKey } from '../../utils/helpers';
import VIEW_TYPE from '../../types/view-types';
import { recenterMap, updateHoveredEntityKey } from '../../redux/actions/realtime/map';
import { getBoundsToFit, getMaxZoom, getShouldOffsetForSidePanel, getHoveredEntityKey, getMapRecenterStatus } from '../../redux/selectors/realtime/map';
import { MAP_DATA } from '../../types/map-types';
import { getHighlightVehiclePosition } from '../../redux/selectors/realtime/vehicles';
import { getChildStops } from '../../redux/selectors/static/stops';

import './RealTimeView.scss';
import { SelectedAddressMarker } from '../Common/Map/SelectedAddressMarker/SelectedAddressMarker';
import { TripShapeLayer } from '../Common/Map/TripShapeLayer/TripShapeLayer';
import StopsLayer from '../Common/Map/StopsLayer/StopsLayer';
import { HighlightingLayer } from '../Common/Map/HighlightingLayer/HighlightingLayer';
import { SelectedStopsMarker } from '../Common/Map/StopsLayer/SelectedStopsMarker';
import VehicleLayer from '../Common/Map/VehicleLayer/VehicleLayer';

function RealTimeView(props) {
    const { ADDRESS, ROUTE, STOP, BUS, TRAIN, FERRY } = SEARCH_RESULT_TYPE;

    useEffect(() => {
        const realtimeTracker = props.startTrackingVehicles();
        return () => {
            realtimeTracker.stop();
        };
    }, []);

    return (
        <OffCanvasLayout>
            <SidePanel
                isOpen={ props.isSidePanelOpen }
                isActive={ props.isSidePanelActive }
                className="real-time-primary-panel">
                { props.shouldShowSearchBox && (
                    <OmniSearch
                        theme={
                            {
                                ...defaultTheme,
                                input: 'search__input form-control cc-form-control',
                            }
                        }
                        value={ props.searchTerms }
                        placeholder="Search the map"
                        searchInCategory={ [ROUTE.type, STOP.type, ADDRESS.type, BUS.type, TRAIN.type, FERRY.type] }
                        selectionHandlers={ {
                            [ADDRESS.type]: ({ data }) => props.addressSelected(data),
                            [STOP.type]: (entity) => {
                                props.updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.LIST);
                                const stop = {
                                    ...entity.data,
                                    ...entity,
                                    searchResultType: STOP.type,
                                    key: formatRealtimeDetailListItemKey(STOP.type, entity.data.stop_id),
                                    checked: true,
                                };
                                props.addSelectedSearchResult(stop);
                                props.stopChecked(stop);
                            },
                            [ROUTE.type]: (entity) => {
                                props.updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.LIST);
                                const route = {
                                    ...entity.data,
                                    ...entity,
                                    searchResultType: ROUTE.type,
                                    key: formatRealtimeDetailListItemKey(ROUTE.type, entity.data.route_id),
                                    checked: true,
                                };
                                props.addSelectedSearchResult(route);
                                props.routeChecked(route);
                            },
                            [BUS.type]: (entity) => {
                                props.updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.LIST);
                                const vehicle = {
                                    ...entity.data,
                                    ...entity,
                                    searchResultType: BUS.type,
                                    key: formatRealtimeDetailListItemKey(BUS.type, entity.data.id),
                                    checked: true,
                                };
                                props.addSelectedSearchResult(vehicle);
                                props.vehicleChecked(vehicle);
                            },
                            [TRAIN.type]: (entity) => {
                                props.updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.LIST);
                                const vehicle = {
                                    ...entity.data,
                                    ...entity,
                                    searchResultType: TRAIN.type,
                                    key: formatRealtimeDetailListItemKey(TRAIN.type, entity.data.id),
                                    checked: true,
                                };
                                props.addSelectedSearchResult(vehicle);
                                props.vehicleChecked(vehicle);
                            },
                            [FERRY.type]: (entity) => {
                                props.updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.LIST);
                                const vehicle = {
                                    ...entity.data,
                                    ...entity,
                                    searchResultType: FERRY.type,
                                    key: formatRealtimeDetailListItemKey(FERRY.type, entity.data.id),
                                    checked: true,
                                };
                                props.addSelectedSearchResult(vehicle);
                                props.vehicleChecked(vehicle);
                            },
                        } }
                        clearHandlers={ {
                            [ADDRESS.type]: () => props.addressSelected({}),
                            [STOP.type]: (entity) => {
                                const stop = { key: formatRealtimeDetailListItemKey(STOP.type, entity.data.stop_id) };
                                props.removeSelectedSearchResult(stop);
                            },
                            [ROUTE.type]: (entity) => {
                                const route = { key: formatRealtimeDetailListItemKey(ROUTE.type, entity.data.route_id) };
                                props.removeSelectedSearchResult(route);
                            },
                            [BUS.type]: (entity) => {
                                const vehicle = { key: formatRealtimeDetailListItemKey(BUS.type, entity.data.id) };
                                props.removeSelectedSearchResult(vehicle);
                            },
                            [TRAIN.type]: (entity) => {
                                const vehicle = { key: formatRealtimeDetailListItemKey(TRAIN.type, entity.data.id) };
                                props.removeSelectedSearchResult(vehicle);
                            },
                            [FERRY.type]: (entity) => {
                                const vehicle = { key: formatRealtimeDetailListItemKey(FERRY.type, entity.data.id) };
                                props.removeSelectedSearchResult(vehicle);
                            },
                        } }
                        multiSearch
                        onResetCallBack={ () => {
                            props.addressSelected({});
                            props.clearSelectedSearchResult();
                        } }
                        label="Search route, stop or vehicle"
                        selectedEntities={ props.allSearchResults } />
                )}
                { props.isSidePanelActive && (
                    <DetailView />
                )}
            </SidePanel>
            <Main className="real-time-view d-flex">
                <Map
                    recenterMap={ props.recenterMap }
                    maxZoom={ props.maxZoom }
                    shouldOffsetForSidePanel={ props.shouldOffsetForSidePanel }
                    boundsToFit={ props.boundsToFit }
                    center={ props.shouldMapBeRecentered ? MAP_DATA.centerLocation : null }
                >
                    <SelectedAddressMarker address={ props.selectedAddress } />
                    <TripShapeLayer
                        visibleEntities={ props.visibleEntities }
                        currentDetailKey={ props.currentDetailKey }
                        hoveredEntityKey={ props.hoveredEntityKey }
                        updateHoveredEntityKey={ props.updateHoveredEntityKey } />
                    <StopsLayer
                        visibleStops={ props.visibleStops }
                        childStops={ props.childStops }
                        stopDetail={ props.selectedStop }
                        focusZoom={ 17 }
                        onStopClick={ (stop) => {
                            const { selectedStop } = props;
                            if (selectedStop && selectedStop.stop_id !== stop.stop_id) {
                                props.stopSelected({
                                    ...stop,
                                    searchResultType: SEARCH_RESULT_TYPE.STOP.type,
                                    key: formatRealtimeDetailListItemKey(SEARCH_RESULT_TYPE.STOP.type, stop.stop_id),
                                });
                            }
                        } } />
                    <HighlightingLayer
                        vehiclePosition={ props.vehiclePosition }
                        stopDetail={ props.selectedStop } />
                    <SelectedStopsMarker
                        stops={ props.stops }
                        onPopupOpen={ stop => props.updateHoveredEntityKey(stop.key) }
                        onPopupClose={ props.updateHoveredEntityKey }
                        size={ 26 }
                        popup />
                    <VehicleLayer />
                </Map>
                <ErrorAlerts />
                <VehicleFilters />
                <Feedback />
            </Main>
            <SecondarySidePanel />
        </OffCanvasLayout>
    );
}

RealTimeView.propTypes = {
    addressSelected: PropTypes.func.isRequired,
    routeChecked: PropTypes.func.isRequired,
    stopChecked: PropTypes.func.isRequired,
    vehicleChecked: PropTypes.func.isRequired,
    shouldShowSearchBox: PropTypes.bool.isRequired,
    startTrackingVehicles: PropTypes.func.isRequired,
    searchTerms: PropTypes.string.isRequired,
    isSidePanelOpen: PropTypes.bool.isRequired,
    isSidePanelActive: PropTypes.bool.isRequired,
    updateRealTimeDetailView: PropTypes.func.isRequired,
    addSelectedSearchResult: PropTypes.func.isRequired,
    removeSelectedSearchResult: PropTypes.func.isRequired,
    clearSelectedSearchResult: PropTypes.func.isRequired,
    allSearchResults: PropTypes.object.isRequired,
    recenterMap: PropTypes.func.isRequired,
    maxZoom: PropTypes.number.isRequired,
    shouldOffsetForSidePanel: PropTypes.bool.isRequired,
    boundsToFit: PropTypes.array.isRequired,
    selectedAddress: PropTypes.object.isRequired,
    vehiclePosition: PropTypes.object,
    selectedStop: PropTypes.object.isRequired,
    visibleEntities: PropTypes.array.isRequired,
    currentDetailKey: PropTypes.string.isRequired,
    hoveredEntityKey: PropTypes.string.isRequired,
    updateHoveredEntityKey: PropTypes.func.isRequired,
    stops: PropTypes.array.isRequired,
    visibleStops: PropTypes.array.isRequired,
    childStops: PropTypes.object.isRequired,
    stopSelected: PropTypes.func.isRequired,
    shouldMapBeRecentered: PropTypes.bool.isRequired,
};

RealTimeView.defaultProps = {
    vehiclePosition: undefined,
};

export default connect(
    state => ({
        shouldShowSearchBox: getShouldShowSearchBox(state),
        isSidePanelOpen: getRealTimeSidePanelIsOpen(state),
        isSidePanelActive: getRealTimeSidePanelIsActive(state),
        searchTerms: getSearchTerms(state),
        selectedStop: getStopDetail(state),
        selectedRoute: getRouteDetail(state),
        selectedVehicle: getVehicleDetail(state),
        isClearForReplace: getClearForReplace(state),
        allAllocations: getAllocations(state),
        allSearchResults: getSelectedSearchResults(state),
        maxZoom: getMaxZoom(state),
        shouldOffsetForSidePanel: getShouldOffsetForSidePanel(state),
        boundsToFit: getBoundsToFit(state),
        selectedAddress: getAddressDetail(state),
        vehiclePosition: getHighlightVehiclePosition(state),
        visibleEntities: getVisibleEntities(state),
        currentDetailKey: getViewDetailKey(state),
        hoveredEntityKey: getHoveredEntityKey(state),
        stops: getCheckedStops(state),
        childStops: getChildStops(state),
        visibleStops: getVisibleStops(state),
        shouldMapBeRecentered: getMapRecenterStatus(state),
    }),
    {
        addressSelected,
        routeChecked,
        stopChecked,
        vehicleChecked,
        startTrackingVehicles,
        updateRealTimeDetailView,
        addSelectedSearchResult,
        removeSelectedSearchResult,
        clearSelectedSearchResult,
        recenterMap,
        updateHoveredEntityKey,
        stopSelected,
    },
)(RealTimeView);
