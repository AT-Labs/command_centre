import React, { useState, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import moment from 'moment';
import _ from 'lodash-es';
import Filters from './Filters/Filters';
import { getTripReplayFilters } from '../../../redux/selectors/control/tripReplays/filters';
import { getTripInfo } from '../../../redux/selectors/control/tripReplays/currentTrip';
import {
    getTripReplayHasMore,
    getTripReplayShouldDisplayFilters,
    getTripReplaySingleTripDisplayed, getTripReplayTotalResults,
    getTripReplayTrips,
} from '../../../redux/selectors/control/tripReplays/tripReplayView';
import './TripReplaysView.scss';
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
    handleSearchDateChange,
    search,
} from '../../../redux/actions/control/tripReplays/filters';
import { clearCurrentTrip, selectTrip } from '../../../redux/actions/control/tripReplays/currentTrip';
import VIEW_TYPE from '../../../types/view-types';
import BackHeader from '../../Common/BackHeader/BackHeader';

const TripReplaysView = (props) => {
    const history = useHistory();
    const location = useLocation();

    const { searchFilters, trips, totalResults, hasMore, isSingleTripDisplayed } = props;
    const { searchTerm, searchDate, startTime, endTime } = searchFilters;
    const [hoveredKeyEvent, setHoveredKeyEvent] = useState();
    const [selectedKeyEventDetail, setSelectedKeyEventDetail] = useState();
    const [selectedKeyEventId, setSelectedKeyEventId] = useState();
    const [selectedKeyEventLatLng, setSelectedKeyEventLatLng] = useState();
    const [inputTripParam, setInputTripParam] = useState();
    // eslint-disable-next-line no-unused-vars
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

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
            const selectedTrip = _.find(trips, trip => trip.tripId === tripId && moment.unix(tripStartTimestamp).isSame(trip.tripStart));
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
        const urlSearchParams = searchTermParam ? `?${new URLSearchParams({ searchTerm: searchTermParam, searchDate, startTime, endTime, showResult, trip }).toString()}` : '';
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
                    route: searchTerm.label,
                    date: searchDate,
                    startTime,
                    endTime,
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


    return (
        <div className="control-trip-replays-view d-flex">
            <SidePanel
                isOpen
                isActive
                className="trip-replay-primary-panel"
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
        </div>
    );
};

TripReplaysView.propTypes = {
    searchFilters: PropTypes.shape({
        searchTerm: PropTypes.object.isRequired,
        searchDate: PropTypes.string,
        startTime: PropTypes.string.isRequired,
        endTime: PropTypes.string.isRequired,
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
        selectTrip,
    },
)(TripReplaysView);
