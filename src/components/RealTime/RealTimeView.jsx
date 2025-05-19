import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useLocation, useHistory } from 'react-router-dom';
import { map, slice, filter, isEqual } from 'lodash-es';
import { getSearchTerms } from '../../redux/selectors/search';
import { addressSelected } from '../../redux/actions/realtime/detail/address';
import { routeChecked } from '../../redux/actions/realtime/detail/route';
import { stopChecked, stopSelected } from '../../redux/actions/realtime/detail/stop';
import { vehicleChecked } from '../../redux/actions/realtime/detail/vehicle';
import { mergeVehicleFilters, startTrackingVehicles } from '../../redux/actions/realtime/vehicles';
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
import VehicleFilters from './VehicleFilters/legacy/VehicleFilters';
import ErrorAlerts from './ErrorAlert/ErrorAlerts';
import Feedback from './Feedback/Feedback';
import { updateRealTimeDetailView } from '../../redux/actions/navigation';
import { addSelectedSearchResult, removeSelectedSearchResult, clearSelectedSearchResult } from '../../redux/actions/realtime/detail/common';
import { formatRealtimeDetailListItemKey, addOffsetToIncident, getDisruptionsUniqueStops } from '../../utils/helpers';
import VIEW_TYPE from '../../types/view-types';
import { updateHoveredEntityKey, updateMapDetails } from '../../redux/actions/realtime/map';
import {
    getBoundsToFit,
    getMaxZoom,
    getShouldOffsetForSidePanel,
    getHoveredEntityKey,
    getMapCenter,
    getMapZoomLevel,
} from '../../redux/selectors/realtime/map';
import { MAP_DATA } from '../../types/map-types';
import {
    getHighlightVehiclePosition,
    getVehiclesFilterShowingTags,
    getVehiclesFilterIsShowingNIS,
    getVehiclesFilterShowingDelay,
    getVehiclesFilterIsShowingUnscheduled,
    getVehiclesFilterShowingOccupancyLevels,
    getVehiclesFilterRouteType,
    getVehiclesFilterAgencyIds,
    getVehiclesFilterIsShowingDirectionInbound,
    getVehiclesFilterIsShowingDirectionOutbound,
    getVehiclesFilterIsShowingSchoolBus,
} from '../../redux/selectors/realtime/vehicles';
import { getChildStops } from '../../redux/selectors/static/stops';
import './RealTimeView.scss';
import { SelectedAddressMarker } from '../Common/Map/SelectedAddressMarker/SelectedAddressMarker';
import TripShapeLayer from '../Common/Map/TripShapeLayer/TripShapeLayer';
import { CarsLayer } from '../Common/Map/CarsLayer/CarsLayer';
import StopsLayer from '../Common/Map/StopsLayer/StopsLayer';
import { HighlightingLayer } from '../Common/Map/HighlightingLayer/HighlightingLayer';
import { SelectedStopsMarker } from '../Common/Map/StopsLayer/SelectedStopsMarker';
import VehicleLayer from '../Common/Map/VehicleLayer/VehicleLayer';
import { CongestionLayer } from '../Common/Map/TrafficLayer/CongestionLayer';
import { IncidentLayer } from '../Common/Map/TrafficLayer/IncidentLayer';
import CongestionFilters from './TrafficFilters/legacy/CongestionFilters';
import EnableIncidentLayerButton from './TrafficFilters/legacy/EnableIncidentLayerButton';
import * as trafficApi from '../../utils/transmitters/traffic-api';
import * as disruptionApi from '../../utils/transmitters/disruption-mgt-api';
import {
    useCongestionLayer,
    useIncidentLayer,
    useNewRealtimeMapFilters,
    useRouteAlertsLayer,
    useCarsRoadworksLayer,
    useDisruptionsLayer,
} from '../../redux/selectors/appSettings';
import { haversineDistance } from '../../utils/map-helpers';
import {
    CONGESTION_REFRESH_INTERVAL,
    CONGESTION_SHAPE_WEIGHT_BOLD,
    CONGESTION_SHAPE_WEIGHT_DEFAULT,
    CONGESTION_ZOOM_LEVEL_THRESHOLD,
    DISRUPTIONS_REFRESH_INTERVAL,
    INCIDENTS_REFRESH_INTERVAL,
    INCIDENTS_SHAPE_WEIGHT,
} from '../../constants/traffic';
import * as incidentsApi from '../../utils/transmitters/incidents-api';
import RealtimeMapFilters from './RealtimeMapFilters/RealtimeMapFilters';
import { Probability } from '../../types/incidents';
import {
    updateSelectedCongestionFilters,
    updateSelectedIncidentFilters,
    updateShowAllRouteAlerts,
    updateShowIncidents,
    updateShowRoadworks,
    updateShowRouteAlerts,
    updateSelectedCars,
    updateSelectedTmpImpacts,
    updateShowDisruptions,
} from '../../redux/actions/realtime/layers';
import {
    getSelectedCongestionFilters, getSelectedIncidentFilters, getShowIncidents, getSelectedRoadworksFilters,
    getShowRouteAlerts, getShowAllRouteAlerts, getSelectedCars, getShowDisruptions, getSelectedDisruptionFilters,
} from '../../redux/selectors/realtime/layers';
import { getAgencies } from '../../redux/selectors/static/agencies';
import {
    isIncidentsQueryValid,
    isRoadworksQueryValid,
    isLiveTrafficQueryValid,
    isMapCenterQueryValid,
    isMapZoomLevelQueryValid,
    isOccupancyLevelsValid,
    isRouteTypeQueryValid,
    isStatusQueryValid,
    isTagsQueryValid, isDisruptionsQueryValid,
} from '../../utils/realtimeMap';
import RouteAlertsLayer from '../Common/Map/TrafficLayer/RouteAlertsLayer';
import { updateUrlFromCarsRoadworksLayer, readUrlToCarsRoadworksLayer } from './TrafficFilters/RoadworksFilterBlock';
import { restoreRouteAlertsStateFromUrl, updateUrlForRouteAlerts } from './TrafficFilters/RouteAlertsFilter';
import CarsDetails from '../Common/Map/CarsLayer/CarsDetails';
import {
    mapFiltersToStatuses,
    readUrlToDisruptionLayer,
    updateUrlFromDisruptionsLayer,
} from './TrafficFilters/DisruptionFilter';
import { DisruptionLayer } from '../Common/Map/TrafficLayer/DisruptionLayer';
import { goToDisruptionSummary } from '../../redux/actions/control/link';
import { useAlertCauses, useAlertEffects } from '../../utils/control/alert-cause-effect';

function RealTimeView(props) {
    const { ADDRESS, ROUTE, STOP, BUS, TRAIN, FERRY } = SEARCH_RESULT_TYPE;
    const [trafficFlows, setTrafficFlows] = useState([]);
    const [mapRadius, setMapRadius] = useState(50);
    const [incidents, setIncidents] = useState([]);
    const [disruptions, setDisruptions] = useState([]);
    const [disruptionStops, setDisruptionStops] = useState([]);
    const abortControllerRef = useRef(null);
    const yesterdayTodayTomorrowFilter = props.selectedRoadworksFilters?.find(item => item.id === 'Yesterday-Today-Tomorrow');

    const causesArray = useAlertCauses();
    const impactsArray = useAlertEffects();

    const fetchIncidentsData = async () => {
        try {
            const data = await incidentsApi.fetchIncidents();
            const filteredData = filter(data, incident => incident.probabilityOfOccurrence !== Probability.Probable);
            const result = map(filteredData, (incident, index) => {
                if (slice(filteredData, index + 1).find(i => i.openlr === incident.openlr && i.situationRecordsId !== incident.situationRecordsId)) {
                    return addOffsetToIncident(incident);
                }
                return incident;
            });
            setIncidents(result);
        } catch (error) {
            setIncidents([]);
        }
    };

    useEffect(() => {
        const realtimeTracker = props.startTrackingVehicles();
        return () => {
            realtimeTracker.stop();
        };
    }, []);

    const shouldFetchTrafficData = () => (
        props.useNewRealtimeMapFilters && props.selectedCongestionFilters.length > 0)
        || (props.useCongestionLayer && props.selectedCongestionFilters.length > 0);

    const fetchTrafficData = async (lat, long, radius, zoom) => {
        try {
            const data = await trafficApi.fetchTrafficFlows(lat, long, radius, zoom > CONGESTION_ZOOM_LEVEL_THRESHOLD);
            setTrafficFlows(data);
        } catch (error) {
            setTrafficFlows([]);
        }
    };

    const shouldFetchDisruptionData = () => (
        props.useNewRealtimeMapFilters && props.selectedDisruptionFilters.length > 0)
        || (props.useDisruptionsLayer && props.selectedDisruptionFilters.length > 0);

    const fetchDisruptionsData = async () => {
        const filters = {
            onlyWithStops: true,
            statuses: mapFiltersToStatuses(props.selectedDisruptionFilters),
        };
        try {
            const data = await disruptionApi.getDisruptionsByFilters(filters);
            setDisruptions(prev => (isEqual(prev, data.disruptions) ? prev : data.disruptions));

            const newStops = getDisruptionsUniqueStops(data.disruptions);
            setDisruptionStops(prev => (isEqual(prev, newStops) ? prev : newStops));
        } catch {
            setDisruptions([]);
            setDisruptionStops([]);
        }
    };

    useEffect(() => {
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const refreshTrafficInterval = setInterval(() => {
            if (shouldFetchTrafficData()) {
                // make sure all the pending calls are cancelled before making the next one
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                const [lat, long] = props.mapCenter;
                fetchTrafficData(lat, long, mapRadius, props.mapZoomLevel);
            }
        }, CONGESTION_REFRESH_INTERVAL);

        return () => {
            clearInterval(refreshTrafficInterval);
        };
    }, [props.selectedCongestionFilters, props.mapCenter, mapRadius]);

    useEffect(() => {
        let refreshIncidentsInterval;
        if ((props.useNewRealtimeMapFilters && props.selectedIncidentFilters?.length > 0) || (props.useIncidentLayer && props.showIncidents)) {
            fetchIncidentsData();
            refreshIncidentsInterval = setInterval(() => {
                fetchIncidentsData();
            }, INCIDENTS_REFRESH_INTERVAL);
        }

        return () => {
            clearInterval(refreshIncidentsInterval);
        };
    }, [props.showIncidents, props.selectedIncidentFilters]);

    useEffect(() => {
        let refreshDisruptionsInterval;
        if (shouldFetchDisruptionData()) {
            fetchDisruptionsData();
            refreshDisruptionsInterval = setInterval(() => {
                fetchDisruptionsData();
            }, DISRUPTIONS_REFRESH_INTERVAL);
        } else {
            setDisruptions([]);
            setDisruptionStops([]);
        }

        return () => {
            clearInterval(refreshDisruptionsInterval);
        };
    }, [props.showDisruptions, props.selectedDisruptionFilters]);

    const onMapViewChanged = (event) => {
        const center = [event.center.lat, event.center.lng];
        const nw = event.bounds.getNorthWest();
        const radius = haversineDistance(center, [nw.lat, nw.lng]);

        if (!isEqual(props.mapCenter, center) || props.mapZoomLevel !== event.zoom) {
            props.updateMapDetails(center, event.zoom);
        }

        if (shouldFetchTrafficData()) {
            setMapRadius(radius);
            fetchTrafficData(event.center.lat, event.center.lng, radius, event.zoom);
        }
    };

    const onCongestionFiltersChanged = (newFilters) => {
        props.updateSelectedCongestionFilters(newFilters);
        if (!trafficFlows || trafficFlows.length === 0) {
            const [lat, long] = props.mapCenter;
            fetchTrafficData(lat, long, mapRadius, props.mapZoomLevel);
        }
    };

    const location = useLocation();
    const history = useHistory();
    const realtimeViewPath = '/';

    const handleUrlChange = (inputLocation) => {
        let routeType = null;
        let agencyIds = null;
        let isShowingNIS = false;
        let isShowingUnscheduled = false;
        let showingDelay = {};
        let showingOccupancyLevels = [];
        let showingTags = [];
        let isShowingDirectionInbound = true;
        let isShowingDirectionOutbound = true;
        let isShowingSchoolBus = false;

        if (inputLocation.pathname !== realtimeViewPath) {
            return;
        }
        if (!inputLocation.search) {
            props.mergeVehicleFilters({
                routeType,
                agencyIds,
                isShowingNIS,
                isShowingUnscheduled,
                showingDelay,
                showingTags,
                showingOccupancyLevels,
                isShowingDirectionInbound,
                isShowingDirectionOutbound,
                isShowingSchoolBus,
            });
            return;
        }

        const searchParams = new URLSearchParams(location.search);

        const tagsQuery = searchParams.get('tags');
        if (isTagsQueryValid(tagsQuery)) {
            showingTags = tagsQuery.split(',');
        }

        const statusQuery = searchParams.get('status');
        const earlyCustomQuery = searchParams.get('earlyCustom');
        const lateCustomQuery = searchParams.get('lateCustom');
        if (isStatusQueryValid(statusQuery, earlyCustomQuery, lateCustomQuery)) {
            const status = statusQuery.split(',');
            const earlyCustom = earlyCustomQuery?.split('-')?.map(Number);
            const lateCustom = lateCustomQuery?.split('-')?.map(Number);
            isShowingNIS = status.includes('notInService');
            isShowingUnscheduled = status.includes('unscheduled');
            showingDelay = {
                ...(status.includes('earlyCustom') && { early: [earlyCustom[0], earlyCustom[1]] }),
                ...(status.includes('earlyMoreThan30') && { early: [30, Infinity] }),
                ...(status.includes('lateCustom') && { late: [lateCustom[0], lateCustom[1]] }),
                ...(status.includes('lateMoreThan30') && { late: [30, Infinity] }),
            };
        }

        const occupancyLevelsQuery = searchParams.get('occupancyLevels');
        if (isOccupancyLevelsValid(occupancyLevelsQuery)) {
            showingOccupancyLevels = occupancyLevelsQuery.split(',');
        }

        const routeTypeQuery = searchParams.get('routeType');
        const agencyIdsQuery = searchParams.get('agencyIds');
        const settingsQuery = searchParams.get('settings');
        if (isRouteTypeQueryValid(routeTypeQuery, agencyIdsQuery, settingsQuery, props.agencies)) {
            routeType = Number(routeTypeQuery);
            if (agencyIdsQuery) {
                agencyIds = agencyIdsQuery.split(',');
            }
            if (settingsQuery) {
                const settings = settingsQuery.split(',');
                isShowingDirectionInbound = settings.includes('inbound');
                isShowingDirectionOutbound = settings.includes('outbound');
                isShowingSchoolBus = settings.includes('schoolBus');
            } else {
                isShowingDirectionInbound = false;
                isShowingDirectionOutbound = false;
                isShowingSchoolBus = false;
            }
        }

        props.mergeVehicleFilters({
            routeType,
            agencyIds,
            isShowingNIS,
            isShowingUnscheduled,
            showingDelay,
            showingTags,
            showingOccupancyLevels,
            isShowingDirectionInbound,
            isShowingDirectionOutbound,
            isShowingSchoolBus,
        });

        const incidentsQuery = searchParams.get('incidents');
        if (isIncidentsQueryValid(incidentsQuery)) {
            props.updateSelectedIncidentFilters(incidentsQuery.split(','));
            props.updateShowIncidents(true);
        }

        if (props.useCarsRoadworksLayer) readUrlToCarsRoadworksLayer(searchParams, isRoadworksQueryValid, props.updateShowRoadworks);
        if (props.useDisruptionsLayer) readUrlToDisruptionLayer(searchParams, isDisruptionsQueryValid, props.updateShowDisruptions);
        if (props.useRouteAlertsLayer) restoreRouteAlertsStateFromUrl(searchParams, props.updateShowRouteAlerts, props.updateShowAllRouteAlerts);

        const liveTrafficQuery = searchParams.get('liveTraffic');
        if (isLiveTrafficQueryValid(liveTrafficQuery)) {
            props.updateSelectedCongestionFilters(liveTrafficQuery.split(','));
        }

        let mapCenter;
        let mapZoomLevel;
        const mapCenterQuery = searchParams.get('mapCenter');
        if (isMapCenterQueryValid(mapCenterQuery)) {
            mapCenter = mapCenterQuery.split(',').map(Number);
        }
        const mapZoomLevelQuery = searchParams.get('mapZoomLevel');
        if (isMapZoomLevelQueryValid(mapZoomLevelQuery)) {
            mapZoomLevel = Number(mapZoomLevelQuery);
        }
        if (mapCenter !== undefined || mapZoomLevel !== undefined) {
            props.updateMapDetails(mapCenter ?? props.mapCenter, mapZoomLevel ?? props.mapZoomLevel);
        }
    };

    useEffect(() => {
        handleUrlChange(location);
        const removeBackListener = history.listen((currentLocation, action) => {
            if (action === 'POP') {
                handleUrlChange(currentLocation);
            }
        });
        return () => {
            removeBackListener();
        };
    }, []);

    const buildQueryParams = () => {
        const searchParams = new URLSearchParams();

        const showingTags = props.showingTags.join(',');
        if (showingTags) {
            searchParams.set('tags', showingTags);
        }

        const status = [];
        if (props.isShowingNIS) {
            status.push('notInService');
        }
        if (props.isShowingUnscheduled) {
            status.push('unscheduled');
        }
        if (props.showingDelay.early) {
            const min = props.showingDelay.early[0];
            const max = props.showingDelay.early[1];
            if (max === Infinity) {
                status.push('earlyMoreThan30');
            } else {
                status.push('earlyCustom');
                searchParams.set('earlyCustom', `${min}-${max}`);
            }
        }
        if (props.showingDelay.late) {
            const min = props.showingDelay.late[0];
            const max = props.showingDelay.late[1];
            if (max === Infinity) {
                status.push('lateMoreThan30');
            } else {
                status.push('lateCustom');
                searchParams.set('lateCustom', `${min}-${max}`);
            }
        }
        if (status.length > 0) {
            searchParams.set('status', status.join(','));
        }

        const showingOccupancyLevels = props.showingOccupancyLevels.join(',');
        if (showingOccupancyLevels) {
            searchParams.set('occupancyLevels', showingOccupancyLevels);
        }

        const { routeType, selectedAgencyIds, isShowingDirectionInbound, isShowingDirectionOutbound, isShowingSchoolBus } = props;
        if (routeType) {
            searchParams.set('routeType', routeType);
            if (selectedAgencyIds && selectedAgencyIds.length > 0) {
                searchParams.set('agencyIds', selectedAgencyIds);
            }
            const settings = {
                inbound: isShowingDirectionInbound,
                outbound: isShowingDirectionOutbound,
                schoolBus: isShowingSchoolBus,
            };
            const isSettingOn = Object.values(settings).find(setting => setting);
            if (isSettingOn) {
                const onSettings = Object.keys(settings).filter(key => settings[key]);
                searchParams.set('settings', onSettings.join(','));
            }
        }

        if (props.selectedIncidentFilters.length > 0) {
            searchParams.set('incidents', props.selectedIncidentFilters.join(','));
        }

        if (useCarsRoadworksLayer) updateUrlFromCarsRoadworksLayer(props.selectedRoadworksFilters, searchParams);
        if (useDisruptionsLayer) updateUrlFromDisruptionsLayer(props.selectedDisruptionFilters, searchParams);

        if (props.useRouteAlertsLayer) updateUrlForRouteAlerts(props.showRouteAlerts, props.showAllRouteAlerts, searchParams);

        if (props.selectedCongestionFilters.length > 0) {
            searchParams.set('liveTraffic', props.selectedCongestionFilters.join(','));
        }

        if (!isEqual(props.mapCenter, MAP_DATA.centerLocation)) {
            searchParams.set('mapCenter', props.mapCenter.join(','));
        }

        if (props.mapZoomLevel !== MAP_DATA.zoomLevel.initial) {
            searchParams.set('mapZoomLevel', props.mapZoomLevel);
        }

        return searchParams.toString();
    };

    useEffect(() => {
        if (location.pathname !== realtimeViewPath) {
            return;
        }
        const queryParams = buildQueryParams();
        const urlSearchParams = queryParams ? `?${queryParams}` : '';
        history.replace(`${location.pathname}${urlSearchParams}`);
    }, [
        props.showingTags,
        props.isShowingNIS,
        props.isShowingUnscheduled,
        props.showingDelay,
        props.showingOccupancyLevels,
        props.routeType,
        props.selectedAgencyIds,
        props.isShowingDirectionInbound,
        props.isShowingDirectionOutbound,
        props.isShowingSchoolBus,
        props.selectedIncidentFilters,
        props.selectedRoadworksFilters,
        props.selectedCongestionFilters,
        props.selectedDisruptionFilters,
        props.showDisruptions,
        props.showRouteAlerts,
        props.showAllRouteAlerts,
        props.mapCenter,
        props.mapZoomLevel,
    ]);

    useEffect(() => {
        const queryParams = buildQueryParams();
        const urlSearchParams = queryParams ? `?${queryParams}` : '';
        const fullPath = `${realtimeViewPath}${urlSearchParams}`;
        if (`${location.pathname}${location.search}` !== fullPath) {
            history.push(fullPath);
        }
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
                    maxZoom={ props.maxZoom }
                    shouldOffsetForSidePanel={ props.shouldOffsetForSidePanel }
                    boundsToFit={ props.boundsToFit }
                    center={ props.mapCenter }
                    zoom={ props.mapZoomLevel }
                    onViewChanged={ onMapViewChanged }
                >
                    { props.useRouteAlertsLayer && (<RouteAlertsLayer />) }
                    { props.useCarsRoadworksLayer && <CarsLayer mapZoomLevel={ props.mapZoomLevel } boundsToFit={ props.boundsToFit } /> }
                    <CongestionLayer
                        data={ trafficFlows }
                        weight={ props.mapZoomLevel > CONGESTION_ZOOM_LEVEL_THRESHOLD ? CONGESTION_SHAPE_WEIGHT_BOLD : CONGESTION_SHAPE_WEIGHT_DEFAULT }
                        filters={ props.selectedCongestionFilters } />
                    { (props.useNewRealtimeMapFilters || (props.useIncidentLayer && props.showIncidents)) && (
                        <IncidentLayer
                            data={ incidents.filter(incident => (props.useNewRealtimeMapFilters ? props.selectedIncidentFilters.includes(incident.type.category) : incident)) }
                            weight={ INCIDENTS_SHAPE_WEIGHT }
                            useNewColors={ props.useDisruptionsLayer }
                        />
                    ) }
                    {(props.useNewRealtimeMapFilters || (props.useDisruptionsLayer && props.showDisruptions)) && (
                        <DisruptionLayer
                            disruptions={ disruptions }
                            stops={ disruptionStops }
                            goToDisruptionSummary={ props.goToDisruptionSummary }
                            impacts={ impactsArray }
                            causes={ causesArray }
                        />
                    )}
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
                { !props.useNewRealtimeMapFilters && <VehicleFilters /> }
                <Feedback />
                { props.useCongestionLayer ? <CongestionFilters selectedFilters={ props.selectedCongestionFilters } onFiltersChanged={ onCongestionFiltersChanged } /> : ''}
                { props.useIncidentLayer ? <EnableIncidentLayerButton isEnabled={ props.showIncidents } onClick={ () => props.updateShowIncidents(!props.showIncidents) } /> : ''}
                { props.useNewRealtimeMapFilters && !props.useCongestionLayer && !props.useIncidentLayer ? (
                    <RealtimeMapFilters
                        useRouteAlerts={ props.useRouteAlertsLayer }
                        onCongestionFiltersChanged={ onCongestionFiltersChanged }
                        selectedCongestionFilters={ props.selectedCongestionFilters }
                        selectedIncidentFilters={ props.selectedIncidentFilters }
                        onIncidentFiltersChanged={ newFilters => props.updateSelectedIncidentFilters(newFilters) }
                    />
                ) : '' }
                { props.useCarsRoadworksLayer && props.selectedCars && (
                    <CarsDetails
                        cars={ props.selectedCars }
                        onClose={ () => {
                            props.updateSelectedCars({ selectedCars: null });
                            props.updateSelectedTmpImpacts({ selectedTmpImpacts: [] });
                        } }
                        onUpdateImpacts={ impacts => props.updateSelectedTmpImpacts({ selectedTmpImpacts: impacts }) }
                        filterByYesterdayTodayTomomorrowDate={ yesterdayTodayTomorrowFilter?.selected } />
                ) }
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
    useCongestionLayer: PropTypes.bool.isRequired,
    useIncidentLayer: PropTypes.bool.isRequired,
    useRouteAlertsLayer: PropTypes.bool.isRequired,
    useCarsRoadworksLayer: PropTypes.bool.isRequired,
    useDisruptionsLayer: PropTypes.bool.isRequired,
    useNewRealtimeMapFilters: PropTypes.bool.isRequired,
    mergeVehicleFilters: PropTypes.func.isRequired,
    showingTags: PropTypes.arrayOf(PropTypes.string).isRequired,
    isShowingNIS: PropTypes.bool.isRequired,
    isShowingUnscheduled: PropTypes.bool.isRequired,
    showingDelay: PropTypes.object.isRequired,
    showingOccupancyLevels: PropTypes.arrayOf(PropTypes.string).isRequired,
    routeType: PropTypes.number,
    selectedAgencyIds: PropTypes.arrayOf(PropTypes.string),
    isShowingDirectionInbound: PropTypes.bool.isRequired,
    isShowingDirectionOutbound: PropTypes.bool.isRequired,
    isShowingSchoolBus: PropTypes.bool.isRequired,
    mapCenter: PropTypes.arrayOf(PropTypes.number).isRequired,
    mapZoomLevel: PropTypes.number.isRequired,
    updateMapDetails: PropTypes.func.isRequired,
    showIncidents: PropTypes.bool.isRequired,
    selectedIncidentFilters: PropTypes.array.isRequired,
    selectedRoadworksFilters: PropTypes.array.isRequired,
    selectedCongestionFilters: PropTypes.array.isRequired,
    selectedDisruptionFilters: PropTypes.array.isRequired,
    showRouteAlerts: PropTypes.bool.isRequired,
    showAllRouteAlerts: PropTypes.bool.isRequired,
    showDisruptions: PropTypes.bool.isRequired,
    updateShowIncidents: PropTypes.func.isRequired,
    updateSelectedIncidentFilters: PropTypes.func.isRequired,
    updateShowRoadworks: PropTypes.func.isRequired,
    updateSelectedCongestionFilters: PropTypes.func.isRequired,
    updateShowRouteAlerts: PropTypes.func.isRequired,
    updateShowAllRouteAlerts: PropTypes.func.isRequired,
    updateShowDisruptions: PropTypes.func.isRequired,
    agencies: PropTypes.array.isRequired,
    selectedCars: PropTypes.object.isRequired,
    updateSelectedCars: PropTypes.func.isRequired,
    updateSelectedTmpImpacts: PropTypes.func.isRequired,
    goToDisruptionSummary: PropTypes.func.isRequired,
};

RealTimeView.defaultProps = {
    vehiclePosition: undefined,
    routeType: null,
    selectedAgencyIds: null,
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
        useCongestionLayer: useCongestionLayer(state),
        useIncidentLayer: useIncidentLayer(state),
        useRouteAlertsLayer: useRouteAlertsLayer(state),
        useCarsRoadworksLayer: useCarsRoadworksLayer(state),
        useDisruptionsLayer: useDisruptionsLayer(state),
        useNewRealtimeMapFilters: useNewRealtimeMapFilters(state),
        showingTags: getVehiclesFilterShowingTags(state),
        showingDelay: getVehiclesFilterShowingDelay(state),
        isShowingNIS: getVehiclesFilterIsShowingNIS(state),
        isShowingUnscheduled: getVehiclesFilterIsShowingUnscheduled(state),
        showingOccupancyLevels: getVehiclesFilterShowingOccupancyLevels(state),
        routeType: getVehiclesFilterRouteType(state),
        selectedAgencyIds: getVehiclesFilterAgencyIds(state),
        isShowingDirectionInbound: getVehiclesFilterIsShowingDirectionInbound(state),
        isShowingDirectionOutbound: getVehiclesFilterIsShowingDirectionOutbound(state),
        isShowingSchoolBus: getVehiclesFilterIsShowingSchoolBus(state),
        mapCenter: getMapCenter(state),
        mapZoomLevel: getMapZoomLevel(state),
        showIncidents: getShowIncidents(state),
        selectedIncidentFilters: getSelectedIncidentFilters(state),
        selectedCongestionFilters: getSelectedCongestionFilters(state),
        selectedRoadworksFilters: getSelectedRoadworksFilters(state),
        selectedDisruptionFilters: getSelectedDisruptionFilters(state),
        showRouteAlerts: getShowRouteAlerts(state),
        showAllRouteAlerts: getShowAllRouteAlerts(state),
        showDisruptions: getShowDisruptions(state),
        agencies: getAgencies(state),
        selectedCars: getSelectedCars(state),
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
        updateHoveredEntityKey,
        stopSelected,
        mergeVehicleFilters,
        updateMapDetails,
        updateShowIncidents,
        updateSelectedIncidentFilters,
        updateShowRoadworks,
        updateSelectedCongestionFilters,
        updateShowRouteAlerts,
        updateShowAllRouteAlerts,
        updateSelectedCars,
        updateSelectedTmpImpacts,
        updateShowDisruptions,
        goToDisruptionSummary,
    },
)(RealTimeView);
