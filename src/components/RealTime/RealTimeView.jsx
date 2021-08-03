import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { getSearchTerms } from '../../redux/selectors/search';
import { addressSelected } from '../../redux/actions/realtime/detail/address';
import { routeChecked } from '../../redux/actions/realtime/detail/route';
import { stopChecked } from '../../redux/actions/realtime/detail/stop';
import { vehicleChecked } from '../../redux/actions/realtime/detail/vehicle';
import { startTrackingVehicles } from '../../redux/actions/realtime/vehicles';
import { getStopDetail, getRouteDetail, getVehicleDetail, getClearForReplace, getSelectedSearchResults } from '../../redux/selectors/realtime/detail';
import { getAllocations } from '../../redux/selectors/control/blocks';
import { getRealTimeSidePanelIsOpen, getRealTimeSidePanelIsActive, getShouldShowSearchBox } from '../../redux/selectors/navigation';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';
import Main from '../Common/OffCanvasLayout/Main/Main';
import OffCanvasLayout from '../Common/OffCanvasLayout/OffCanvasLayout';
import SidePanel from '../Common/OffCanvasLayout/SidePanel/SidePanel';
import SecondarySidePanel from '../Common/OffCanvasLayout/SecondarySidePanel/SecondarySidePanel';
import OmniSearch, { defaultTheme } from '../OmniSearch/OmniSearch';
import DetailView from './DetailView/DetailView';
import RealTimeMap from './RealTimeMap/RealTimeMap';
import VehicleFilters from './VehicleFilters/VehicleFilters';
import ErrorAlerts from './ErrorAlert/ErrorAlerts';
import Feedback from './Feedback/Feedback';
import { updateRealTimeDetailView } from '../../redux/actions/navigation';
import { addSelectedSearchResult, removeSelectedSearchResult, clearSelectedSearchResult } from '../../redux/actions/realtime/detail/common';
import { formatRealtimeDetailListItemKey } from '../../utils/helpers';
import VIEW_TYPE from '../../types/view-types';

import './RealTimeView.scss';

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
                <RealTimeMap />
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
    },
)(RealTimeView);
