import React, { useState, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import moment from 'moment';
import { find, isEmpty } from 'lodash-es';
import { Alert } from 'reactstrap';
import { IconButton } from '@mui/material';
import BorderOuterOutlinedIcon from '@mui/icons-material/BorderOuterOutlined';
import Filters from './Filters/Filters';
import { getTripReplayFilters } from '../../../redux/selectors/control/tripReplays/filters';
import { getTripInfo, getRouteColor, getShape, getStops } from '../../../redux/selectors/control/tripReplays/currentTrip';
import { getPreviousTripReplayFilterValues, getPreviousTripReplayTripValues } from '../../../redux/selectors/control/tripReplays/prevFilterValue';
import {
    getTripReplayHasMore,
    getTripReplayShouldDisplayFilters,
    getTripReplaySingleTripDisplayed, getTripReplayTotalResults,
    getTripReplayTrips,
    getTripReplayRedirected,
} from '../../../redux/selectors/control/tripReplays/tripReplayView';
import '../../Common/OffCanvasLayout/OffCanvasLayout.scss';
import TripSearchResultsList from './SearchResults/SearchResultsList';
import SidePanel from '../../Common/OffCanvasLayout/SidePanel/SidePanel';
import TripDetail from './TripDetail/TripDetail';
import { clearVehicleReplayCurrentReplayDetail, setVehicleViewTabStatus } from '../../../redux/actions/control/vehicleReplays/vehicleReplay';
import { getVehicleEvents, getVehiclePositions, getvehicleViewTabStatus, getFirstEventPosition } from '../../../redux/selectors/control/vehicleReplays/vehicleReplay';
import {
    clearTrips,
    updateTripReplayDisplayFilters,
    updateTripReplayDisplaySingleTrip,
    updateTripReplayRedirected,
} from '../../../redux/actions/control/tripReplays/tripReplayView';
import {
    updateTripReplayFilterData,
    resetTripReplaySearchTerm,
    updateTripReplaySearchTerm,
    updateTripReplayStartTime,
    updateTripReplayEndTime,
    updateTripReplayTimeType,
    handleSearchDateChange,
    search,
} from '../../../redux/actions/control/tripReplays/filters';
import { clearCurrentTrip, selectTrip } from '../../../redux/actions/control/tripReplays/currentTrip';
import VIEW_TYPE from '../../../types/view-types';
import { SERVICE_DATE_FORMAT } from '../../../utils/control/routes';
import BackHeader from '../../Common/BackHeader/BackHeader';
import './TripReplaysView.scss';
import { getBoundsToFit } from '../../../redux/selectors/control/tripReplays/map';
import { Map } from '../../Common/Map/Map';
import { ShapeLayer } from '../../Common/Map/ShapeLayer/ShapeLayer';
import StopThresholdsLayer from '../../Common/Map/StopThresholdsLayer/StopThresholdsLayer';
import StopsReplayLayer from '../../Common/Map/StopsReplayLayer/StopsReplayLayer';
import VehicleReplayStatusLayer from '../../Common/Map/VehicleReplayStatusLayer/VehicleReplayStatusLayer';
import VehiclePositionsReplayLayer from '../../Common/Map/VehiclePositionsReplayLayer/VehiclePositionsReplayLayer';
import StopThresholdCircle from '../../Common/Map/StopThresholdsLayer/StopThresholdCircle';
import { getAllRoutes } from '../../../redux/selectors/static/routes';
import { BUS_TYPE_ID } from '../../../types/vehicle-types';

const TripReplaysView = (props) => {
    const history = useHistory();
    const location = useLocation();

    const { searchFilters, trips, totalResults, hasMore, isSingleTripDisplayed, selectedTripRedirect, prevFilterValues, firstEventPosition, isVehicleViewTabActive,
        eventPositions, vehicletPositions } = props;
    const { searchTerm, searchDate, startTime, endTime, timeType } = searchFilters;
    const [hoveredKeyEvent, setHoveredKeyEvent] = useState();
    const [selectedKeyEventDetail, setSelectedKeyEventDetail] = useState();
    const [selectedKeyEventId, setSelectedKeyEventId] = useState();
    const [selectedKeyEventLatLng, setSelectedKeyEventLatLng] = useState();
    const [inputTripParam, setInputTripParam] = useState();
    // eslint-disable-next-line no-unused-vars
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);
    const [shouldShowMissingDataNotification, setShouldShowMissingDataNotification] = useState(false);
    const [shouldNotificationBeClosed, setShouldNotificationBeClosed] = useState(true);
    const [hideExitCircle, setHideExitCircle] = useState(false);

    const routeId = trips?.[0]?.routeId;
    const routeType = Object.values(props.allRoutes).find(route => route.route_id === routeId)?.route_type || null;

    const handleUrlChange = (inputLocation) => {
        if (inputLocation.pathname !== `/${VIEW_TYPE.MAIN.CONTROL}/${VIEW_TYPE.CONTROL_DETAIL.TRIP_REPLAYS}`) {
            return;
        }
        if (inputLocation.search) {
            const params = new URLSearchParams(inputLocation.search);
            const searchTermParam = params.get('searchTerm');
            if (searchTermParam) {
                const searchTermObj = {
                    type: searchTermParam.split('_')[0],
                    id: searchTermParam.split('_')[1],
                    label: searchTermParam.split('_')[2],
                };
                props.updateTripReplaySearchTerm(searchTermObj);
            }
            const searchDateParam = params.get('searchDate');
            if (searchDateParam) {
                props.handleSearchDateChange(searchDateParam);
            }
            const startTimeParam = params.get('startTime');
            if (startTimeParam) {
                props.updateTripReplayStartTime(startTimeParam);
            }
            const endTimeParam = params.get('endTime');
            if (endTimeParam) {
                props.updateTripReplayEndTime(endTimeParam);
            }
            const timeTypeParam = params.get('timeType');
            if (timeTypeParam) {
                props.updateTripReplayTimeType(timeTypeParam);
            }
            const showResultParam = params.get('showResult');
            if (showResultParam === 'true') {
                props.search();
                props.updateTripReplayDisplayFilters(false);
            } else {
                props.updateTripReplayDisplaySingleTrip(false);
                props.updateTripReplayDisplayFilters(true);
                props.clearTrips();
                props.clearCurrentTrip();
            }
            const tripParam = params.get('trip');
            setInputTripParam(tripParam);
            if (!tripParam) {
                props.updateTripReplayDisplaySingleTrip(false);
                props.clearTrips();
                props.clearCurrentTrip();
            }
        } else {
            props.updateTripReplayDisplaySingleTrip(false);
            props.updateTripReplayDisplayFilters(true);
            props.resetTripReplaySearchTerm();
            props.handleSearchDateChange('');
            props.clearTrips();
            props.clearCurrentTrip();
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

    useEffect(() => {
        if (inputTripParam && trips) {
            const tripId = inputTripParam.split('_')[0];
            const tripStartTimestamp = inputTripParam.split('_')[1];
            const selectedTrip = find(trips, trip => trip.tripId === tripId && moment.unix(tripStartTimestamp).isSame(trip.tripStart));
            if (selectedTrip) {
                props.selectTrip(selectedTrip);
                props.updateTripReplayDisplaySingleTrip(true);
            }
        }
    }, [trips]);

    const isSubmitButtonDisabled = !searchTerm.label || !searchDate;
    useEffect(() => {
        const searchTermParam = searchTerm.type && searchTerm.id ? `${searchTerm.type}_${searchTerm.id}_${searchTerm.label}` : '';
        const showResult = !props.isFiltersViewDisplayed;
        const trip = isSingleTripDisplayed && props.currentTrip ? `${props.currentTrip.tripId}_${moment(props.currentTrip.tripStart).unix()}` : '';
        const urlSearchParams = searchTermParam ? `?${new URLSearchParams({ searchTerm: searchTermParam, searchDate, startTime, endTime, timeType, showResult, trip }).toString()}` : '';
        const fullPath = `/${VIEW_TYPE.MAIN.CONTROL}/${VIEW_TYPE.CONTROL_DETAIL.TRIP_REPLAYS}${urlSearchParams}`;
        if (`${location.pathname}${location.search}` !== fullPath) {
            history.push(fullPath);
        }
    }, [props.isSingleTripDisplayed, props.isFiltersViewDisplayed, isSubmitButtonDisabled]);

    useEffect(() => {
        if (location.search && location.search.includes('startTime') && location.search.includes('endTime')) {
            const params = new URLSearchParams(location.search);
            params.set('startTime', startTime);
            params.set('endTime', endTime);
            history.replace(`${location.pathname}?${params.toString()}`);
        }
    }, [startTime, endTime]);

    useEffect(() => {
        if (location.search && location.search.includes('timeType')) {
            const params = new URLSearchParams(location.search);
            params.set('timeType', timeType);
            history.replace(`${location.pathname}?${params.toString()}`);
        }
    }, [timeType]);

    useEffect(() => {
        if (firstEventPosition) {
            setSelectedKeyEventLatLng([firstEventPosition.position.latitude, firstEventPosition.position.longitude]);
        }
    }, [firstEventPosition]);

    useEffect(() => {
        const today = moment().format(SERVICE_DATE_FORMAT);
        const dueDate = moment('15/08/2021', SERVICE_DATE_FORMAT);
        setShouldShowMissingDataNotification(today <= dueDate && !shouldNotificationBeClosed);
    }, [shouldShowMissingDataNotification, shouldNotificationBeClosed]);

    const handleMouseEnter = (keyEventDetail) => {
        setHoveredKeyEvent(keyEventDetail.id);
    };

    const handleMouseLeave = () => {
        setHoveredKeyEvent(null);
        setSelectedKeyEventLatLng(null);
        setSelectedKeyEventId(null);
    };

    const handleMouseClick = (keyEventDetail) => {
        setSelectedKeyEventId(keyEventDetail.id);
        setSelectedKeyEventDetail(keyEventDetail);
        setTimeout(() => {
            forceUpdate();
        }, []);
    };

    const handleMouseClickTripReplay = (keyEventDetail) => {
        setSelectedKeyEventLatLng(keyEventDetail.latlon);
        handleMouseClick(keyEventDetail);
    };

    const handleMouseClickVehicleReplay = (keyEventDetail) => {
        props.clearCurrentTrip();
        if (keyEventDetail.position.latitude !== null) {
            setSelectedKeyEventLatLng([keyEventDetail.position.latitude, keyEventDetail.position.longitude]);
        }
        handleMouseClick(keyEventDetail);
    };

    const clearSelectedKeyEvent = (shouldClearSelectedKeyEvent) => {
        if (shouldClearSelectedKeyEvent) {
            setSelectedKeyEventDetail(null);
        }
    };

    const handlePopupClose = () => {
        setTimeout(() => {
            forceUpdate();
        }, []);
    };

    const renderResults = () => {
        if (isSingleTripDisplayed) {
            return (
                <TripDetail
                    handleMouseEnter={ handleMouseEnter }
                    handleMouseLeave={ handleMouseLeave }
                    handleMouseClick={ handleMouseClickTripReplay } />
            );
        }
        return (
            <TripSearchResultsList
                trips={ trips }
                totalResults={ totalResults }
                hasMore={ hasMore }
                searchParams={ {
                    searchTerm,
                    date: searchDate,
                    startTime,
                    endTime,
                    timeType,
                } }
                handleMouseEnter={ handleMouseEnter }
                handleMouseLeave={ handleMouseLeave }
                handleMouseClick={ handleMouseClickVehicleReplay }
            />
        );
    };

    const renderMain = () => {
        if (props.isFiltersViewDisplayed) {
            return <Filters />;
        }
        return renderResults();
    };

    const clearVehiclePositionAndResetTabStatus = () => {
        props.clearVehicleReplayCurrentReplayDetail(null, null);
        props.setVehicleViewTabStatus(false);
    };

    const backClick = () => {
        if (props.isRedirected) {
            props.updateTripReplayDisplaySingleTrip(true);
            props.selectTrip(selectedTripRedirect);
            props.search();
            props.updateTripReplayFilterData(prevFilterValues);
            props.updateTripReplayRedirected(false);
            clearVehiclePositionAndResetTabStatus();
        } else if (props.isSingleTripDisplayed) {
            props.updateTripReplayDisplaySingleTrip(false);
        } else {
            props.updateTripReplayDisplayFilters(true);
            props.clearTrips();
            props.clearCurrentTrip();
            clearVehiclePositionAndResetTabStatus();
        }
    };

    const toggleNotification = () => setShouldNotificationBeClosed(true);

    const toggleThresholdView = () => {
        setHideExitCircle(!hideExitCircle);
    };

    return (
        <div className="sidepanel-control-component-view d-flex trip-replay">
            <SidePanel
                isOpen
                isActive
                className="sidepanel-primary-panel"
                toggleButton={ false }>
                { !props.isFiltersViewDisplayed && <BackHeader text={ `Back ${props.isSingleTripDisplayed || props.isRedirected ? '' : 'to Search'}` } onClick={ backClick } /> }
                { renderMain() }
            </SidePanel>
            <Map
                shouldOffsetForSidePanel
                boundsToFit={ props.boundsToFit }
                handlePopupClose={ handlePopupClose }
                center={ selectedKeyEventLatLng }
            >
                <ShapeLayer
                    shapes={ [props.shape] }
                    routeColors={ [props.routeColor] } />
                <StopThresholdCircle
                    stops={ props.stops }
                    routeType={ routeType }
                    hideExitCircle={ hideExitCircle }
                    onToggleExitCircle={ toggleThresholdView } />
                <StopThresholdsLayer
                    route={ props.shape }
                    stops={ props.stops }
                    routeType={ routeType } />
                <StopsReplayLayer
                    stops={ props.stops }
                    selectedKeyEvent={ selectedKeyEventDetail }
                    selectedKeyEventId={ selectedKeyEventId }
                    hoveredKeyEvent={ hoveredKeyEvent }
                    clearSelectedKeyEvent={ clearSelectedKeyEvent } />
                { (isEmpty(trips) || isVehicleViewTabActive) && (
                    <VehicleReplayStatusLayer
                        eventPositions={ eventPositions }
                        vehiclePositions={ vehicletPositions }
                        selectedKeyEvent={ selectedKeyEventDetail }
                        selectedKeyEventId={ selectedKeyEventId }
                        hoveredKeyEvent={ hoveredKeyEvent }
                        clearSelectedKeyEvent={ clearSelectedKeyEvent } />
                )}
                <VehiclePositionsReplayLayer
                    selectedKeyEvent={ selectedKeyEventDetail }
                    selectedKeyEventId={ selectedKeyEventId }
                    hoveredKeyEvent={ hoveredKeyEvent }
                    clearSelectedKeyEvent={ clearSelectedKeyEvent } />
            </Map>
            {routeType === BUS_TYPE_ID && (
                <IconButton className="threshold-button" onClick={ toggleThresholdView }>
                    <BorderOuterOutlinedIcon className="threshold-button-icon" />
                </IconButton>
            )}
            <Alert
                color="warning position-fixed"
                toggle={ toggleNotification }
                isOpen={ shouldShowMissingDataNotification }
            >
                Trips between 16th-21st of June may have missing data
            </Alert>
        </div>
    );
};

TripReplaysView.propTypes = {
    searchFilters: PropTypes.shape({
        searchTerm: PropTypes.object.isRequired,
        searchDate: PropTypes.string,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string.isRequired,
        timeType: PropTypes.string.isRequired,
    }).isRequired,
    trips: PropTypes.array,
    totalResults: PropTypes.number.isRequired,
    hasMore: PropTypes.bool.isRequired,
    isFiltersViewDisplayed: PropTypes.bool.isRequired,
    isSingleTripDisplayed: PropTypes.bool.isRequired,
    isRedirected: PropTypes.bool.isRequired,
    clearTrips: PropTypes.func.isRequired,
    clearVehicleReplayCurrentReplayDetail: PropTypes.func.isRequired,
    updateTripReplayDisplayFilters: PropTypes.func.isRequired,
    updateTripReplayDisplaySingleTrip: PropTypes.func.isRequired,
    clearCurrentTrip: PropTypes.func.isRequired,
    currentTrip: PropTypes.object,
    updateTripReplaySearchTerm: PropTypes.func.isRequired,
    resetTripReplaySearchTerm: PropTypes.func.isRequired,
    handleSearchDateChange: PropTypes.func.isRequired,
    updateTripReplayStartTime: PropTypes.func.isRequired,
    updateTripReplayEndTime: PropTypes.func.isRequired,
    updateTripReplayTimeType: PropTypes.func.isRequired,
    updateTripReplayRedirected: PropTypes.func.isRequired,
    search: PropTypes.func.isRequired,
    selectTrip: PropTypes.func.isRequired,
    firstEventPosition: PropTypes.object,
    selectedTripRedirect: PropTypes.object,
    updateTripReplayFilterData: PropTypes.func.isRequired,
    prevFilterValues: PropTypes.object,
    boundsToFit: PropTypes.array.isRequired,
    shape: PropTypes.array.isRequired,
    routeColor: PropTypes.string,
    stops: PropTypes.array.isRequired,
    eventPositions: PropTypes.array,
    isVehicleViewTabActive: PropTypes.bool,
    vehicletPositions: PropTypes.array,
    setVehicleViewTabStatus: PropTypes.func.isRequired,
    allRoutes: PropTypes.object.isRequired,
};

TripReplaysView.defaultProps = {
    trips: null,
    currentTrip: null,
    firstEventPosition: null,
    selectedTripRedirect: null,
    prevFilterValues: null,
    routeColor: null,
    eventPositions: null,
    vehicletPositions: null,
    isVehicleViewTabActive: false,
};

export default connect(
    state => ({
        searchFilters: getTripReplayFilters(state),
        isFiltersViewDisplayed: getTripReplayShouldDisplayFilters(state),
        isSingleTripDisplayed: getTripReplaySingleTripDisplayed(state),
        isRedirected: getTripReplayRedirected(state),
        trips: getTripReplayTrips(state),
        totalResults: getTripReplayTotalResults(state),
        hasMore: getTripReplayHasMore(state),
        currentTrip: getTripInfo(state),
        firstEventPosition: getFirstEventPosition(state),
        selectedTripRedirect: getPreviousTripReplayTripValues(state),
        prevFilterValues: getPreviousTripReplayFilterValues(state),
        boundsToFit: getBoundsToFit(state),
        shape: getShape(state),
        routeColor: getRouteColor(state),
        stops: getStops(state),
        eventPositions: getVehicleEvents(state),
        vehicletPositions: getVehiclePositions(state),
        isVehicleViewTabActive: getvehicleViewTabStatus(state),
        allRoutes: getAllRoutes(state),
    }),
    {
        updateTripReplayDisplayFilters,
        updateTripReplayDisplaySingleTrip,
        clearVehicleReplayCurrentReplayDetail,
        clearTrips,
        clearCurrentTrip,
        search,
        updateTripReplaySearchTerm,
        resetTripReplaySearchTerm,
        handleSearchDateChange,
        updateTripReplayStartTime,
        updateTripReplayEndTime,
        updateTripReplayTimeType,
        selectTrip,
        updateTripReplayRedirected,
        updateTripReplayFilterData,
        setVehicleViewTabStatus,
    },
)(TripReplaysView);
