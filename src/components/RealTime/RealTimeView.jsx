import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import _ from 'lodash-es';

import { getSearchTerms } from '../../redux/selectors/search';
import { addressSelected } from '../../redux/actions/realtime/detail/address';
import { routeSelected } from '../../redux/actions/realtime/detail/route';
import { stopSelected } from '../../redux/actions/realtime/detail/stop';
import { vehicleSelected } from '../../redux/actions/realtime/detail/vehicle';
import { startTrackingVehicles } from '../../redux/actions/realtime/vehicles';
import { shouldGetActiveRealTimeDetailView, getStopDetail, getRouteDetail, getVehicleDetail, getClearForReplace } from '../../redux/selectors/realtime/detail';
import { getAllocations } from '../../redux/selectors/control/blocks';
import { getRealTimeSidePanelIsOpen, getRealTimeSidePanelIsActive } from '../../redux/selectors/navigation';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';
import Main from '../Common/OffCanvasLayout/Main/Main';
import OffCanvasLayout from '../Common/OffCanvasLayout/OffCanvasLayout';
import SidePanel from '../Common/OffCanvasLayout/SidePanel/SidePanel';
import SecondarySidePanel from '../Common/OffCanvasLayout/SecondarySidePanel/SecondarySidePanel';
import Footer from './Footer/Footer';
import OmniSearch, { defaultTheme } from '../OmniSearch/OmniSearch';
import DetailView from './DetailView/DetailView';
import RealTimeMap from './RealTimeMap/RealTimeMap';
import VehicleFilters from './VehicleFilters/VehicleFilters';
import ErrorAlerts from './ErrorAlert/ErrorAlerts';
import Feedback from './Feedback/Feedback';

import { getAllRoutes } from '../../redux/selectors/static/routes';
import { getFleetState } from '../../redux/selectors/static/fleet';
import { getAllStops } from '../../redux/selectors/static/stops';
import { updateRealTimeDetailView } from '../../redux/actions/navigation';
import { clearDetail } from '../../redux/actions/realtime/detail/common';
import { clearSearchResults } from '../../redux/actions/search';
import VIEW_TYPE from '../../types/view-types';

import './RealTimeView.scss';

function RealTimeView(props) {
    const { ADDRESS, ROUTE, STOP, BUS, TRAIN, FERRY } = SEARCH_RESULT_TYPE;
    const location = useLocation();
    const history = useHistory();
    const [inputSelectedVehicle, setInputSelectedVehicle] = useState();

    const handleUrlChange = (inputLocation) => {
        setInputSelectedVehicle();
        if (inputLocation.pathname === '/') {
            props.clearDetail();
            props.clearSearchResults();
            props.updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.DEFAULT);
            return;
        }
        const paths = inputLocation.pathname.split('/');
        const selectedEntityType = paths[2];
        const selectedEntityId = paths[3];
        let selectedEntity;
        switch (selectedEntityType) {
        case ROUTE.type:
            selectedEntity = props.allRoutes[_.toUpper(selectedEntityId)] || _.find(props.allRoutes, route => route.route_short_name === _.toUpper(selectedEntityId));
            props.routeSelected(selectedEntity);
            break;
        case 'vehicle':
            selectedEntity = props.allVehicles[selectedEntityId];
            setInputSelectedVehicle(selectedEntity);
            break;
        case STOP.type:
            selectedEntity = props.allStops[selectedEntityId];
            props.stopSelected(selectedEntity);
            break;
        default:
            break;
        }
    };

    useEffect(() => {
        const realtimeTracker = props.startTrackingVehicles();
        handleUrlChange(location);
        const removeBackListener = history.listen((currentLocation, action) => {
            if (action === 'POP') {
                handleUrlChange(currentLocation);
            }
        });
        return () => {
            realtimeTracker.stop();
            removeBackListener();
        };
    }, []);

    useEffect(() => {
        if (inputSelectedVehicle && props.allAllocations) {
            props.vehicleSelected(inputSelectedVehicle);
        }
    }, [props.allAllocations, inputSelectedVehicle]);

    useEffect(() => {
        let selectedEntityType;
        let selectedEntityId;
        if (props.selectedRoute.route_short_name) {
            selectedEntityType = ROUTE.type;
            selectedEntityId = props.selectedRoute.route_short_name;
        } else if (props.selectedStop.stop_code) {
            selectedEntityType = STOP.type;
            selectedEntityId = props.selectedStop.stop_code;
        } else if (props.selectedVehicle.id) {
            selectedEntityType = 'vehicle';
            selectedEntityId = props.selectedVehicle.id;
        }

        if (selectedEntityType && selectedEntityId) {
            const locationToPush = `/${VIEW_TYPE.MAIN.REAL_TIME}/${selectedEntityType}/${selectedEntityId}`;
            if (locationToPush !== location.pathname) {
                history.push(locationToPush);
            }
        } else if (!props.isClearForReplace && location.pathname !== '/') {
            history.push('/');
        }
    }, [props.selectedRoute.route_short_name, props.selectedStop.stop_code, props.selectedVehicle.id, props.isClearForReplace]);

    return (
        <OffCanvasLayout>
            <SidePanel
                isOpen={ props.isSidePanelOpen }
                isActive={ props.isSidePanelActive }
                className="real-time-primary-panel">
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
                        [STOP.type]: ({ data }) => props.stopSelected(data),
                        [ROUTE.type]: ({ data }) => props.routeSelected(data),
                        [BUS.type]: ({ data }) => props.vehicleSelected(data),
                        [TRAIN.type]: ({ data }) => props.vehicleSelected(data),
                        [FERRY.type]: ({ data }) => props.vehicleSelected(data),
                    } }
                    clearHandlers={ {
                        [ADDRESS.type]: () => props.addressSelected({}),
                        [STOP.type]: _.noop,
                        [ROUTE.type]: _.noop,
                        [BUS.type]: _.noop,
                        [TRAIN.type]: _.noop,
                        [FERRY.type]: _.noop,
                    } } />
                { props.shouldShowDetailView && (
                    <React.Fragment>
                        <DetailView />
                        <Footer />
                    </React.Fragment>
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
    stopSelected: PropTypes.func.isRequired,
    routeSelected: PropTypes.func.isRequired,
    vehicleSelected: PropTypes.func.isRequired,
    shouldShowDetailView: PropTypes.bool.isRequired,
    startTrackingVehicles: PropTypes.func.isRequired,
    searchTerms: PropTypes.string.isRequired,
    isSidePanelOpen: PropTypes.bool.isRequired,
    isSidePanelActive: PropTypes.bool.isRequired,
    allRoutes: PropTypes.object.isRequired,
    allVehicles: PropTypes.object.isRequired,
    allStops: PropTypes.object.isRequired,
    allAllocations: PropTypes.object.isRequired,
    clearDetail: PropTypes.func.isRequired,
    clearSearchResults: PropTypes.func.isRequired,
    updateRealTimeDetailView: PropTypes.func.isRequired,
    selectedStop: PropTypes.object.isRequired,
    selectedRoute: PropTypes.object.isRequired,
    selectedVehicle: PropTypes.object.isRequired,
    isClearForReplace: PropTypes.bool.isRequired,
};

export default connect(
    state => ({
        shouldShowDetailView: shouldGetActiveRealTimeDetailView(state),
        isSidePanelOpen: getRealTimeSidePanelIsOpen(state),
        isSidePanelActive: getRealTimeSidePanelIsActive(state),
        searchTerms: getSearchTerms(state),
        allRoutes: getAllRoutes(state),
        allVehicles: getFleetState(state),
        allStops: getAllStops(state),
        selectedStop: getStopDetail(state),
        selectedRoute: getRouteDetail(state),
        selectedVehicle: getVehicleDetail(state),
        isClearForReplace: getClearForReplace(state),
        allAllocations: getAllocations(state),
    }), { addressSelected, stopSelected, routeSelected, startTrackingVehicles, vehicleSelected, clearDetail, clearSearchResults, updateRealTimeDetailView },
)(RealTimeView);
