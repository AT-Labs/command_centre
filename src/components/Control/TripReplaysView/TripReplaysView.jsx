import React, { useState, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import moment from 'moment';
import { find } from 'lodash-es';
import { Alert } from 'reactstrap';
import Filters from './Filters/Filters';
import { getTripReplayFilters } from '../../../redux/selectors/control/tripReplays/filters';
import { getTripInfo } from '../../../redux/selectors/control/tripReplays/currentTrip';
import {
    getTripReplayHasMore,
    getTripReplayShouldDisplayFilters,
    getTripReplaySingleTripDisplayed, getTripReplayTotalResults,
    getTripReplayTrips,
} from '../../../redux/selectors/control/tripReplays/tripReplayView';
import '../../Common/OffCanvasLayout/OffCanvasLayout.scss';
import TripSearchResultsList from './SearchResults/SearchResultsList';
import SidePanel from '../../Common/OffCanvasLayout/SidePanel/SidePanel';
import HistoricalMap from './Map/Map';
import TripDetail from './TripDetail/TripDetail';
import { clearTrips, updateTripReplayDisplayFilters, updateTripReplayDisplaySingleTrip } from '../../../redux/actions/control/tripReplays/tripReplayView';
import {
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

const TripReplaysView = (props) => {
    const history = useHistory();
    const location = useLocation();

    const { searchFilters, trips, totalResults, hasMore, isSingleTripDisplayed } = props;
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
        setSelectedKeyEventLatLng(keyEventDetail.latlon);
        setSelectedKeyEventId(keyEventDetail.id);
        setSelectedKeyEventDetail(keyEventDetail);
        setTimeout(() => {
            forceUpdate();
        }, []);
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
                    handleMouseClick={ handleMouseClick } />
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
            />
        );
    };

    const renderMain = () => {
        if (props.isFiltersViewDisplayed) {
            return <Filters />;
        }
        return renderResults();
    };

    const backClick = () => {
        if (props.isSingleTripDisplayed) {
            props.updateTripReplayDisplaySingleTrip(false);
        } else {
            props.updateTripReplayDisplayFilters(true);
            props.clearTrips();
            props.clearCurrentTrip();
        }
    };

    const toggleNotification = () => setShouldNotificationBeClosed(true);

    return (
        <div className="sidepanel-control-component-view d-flex trip-replay">
            <SidePanel
                isOpen
                isActive
                className="sidepanel-primary-panel"
                toggleButton={ false }>
                { !props.isFiltersViewDisplayed && <BackHeader text={ `Back to ${props.isSingleTripDisplayed ? 'Result' : 'Search'}` } onClick={ backClick } /> }
                { renderMain() }
            </SidePanel>
            <HistoricalMap
                shouldOffsetForSidePanel
                hoveredKeyEvent={ hoveredKeyEvent }
                selectedKeyEventId={ selectedKeyEventId }
                selectedKeyEvent={ selectedKeyEventDetail }
                handlePopupClose={ handlePopupClose }
                clearSelectedKeyEvent={ clearSelectedKeyEvent }
                center={ selectedKeyEventLatLng } />
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
    clearTrips: PropTypes.func.isRequired,
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
    search: PropTypes.func.isRequired,
    selectTrip: PropTypes.func.isRequired,
};

TripReplaysView.defaultProps = {
    trips: null,
    currentTrip: null,
};

export default connect(
    state => ({
        searchFilters: getTripReplayFilters(state),
        isFiltersViewDisplayed: getTripReplayShouldDisplayFilters(state),
        isSingleTripDisplayed: getTripReplaySingleTripDisplayed(state),
        trips: getTripReplayTrips(state),
        totalResults: getTripReplayTotalResults(state),
        hasMore: getTripReplayHasMore(state),
        currentTrip: getTripInfo(state),
    }),
    {
        updateTripReplayDisplayFilters,
        updateTripReplayDisplaySingleTrip,
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
    },
)(TripReplaysView);
