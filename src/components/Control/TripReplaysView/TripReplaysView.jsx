import React, { useState, useReducer } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Filters from './Filters/Filters';
import { getTripReplayFilters } from '../../../redux/selectors/control/tripReplays/filters';
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
import BackHeader from '../../Common/BackHeader/BackHeader';
import { clearTrips, updateTripReplayDisplayFilters } from '../../../redux/actions/control/tripReplays/tripReplayView';
import { clearCurrentTrip } from '../../../redux/actions/control/tripReplays/currentTrip';

const TripReplaysView = (props) => {
    const { searchFilters, trips, totalResults, hasMore, isSingleTripDisplayed } = props;
    const { searchTerm, searchDate, startTime, endTime } = searchFilters;
    const [hoveredKeyEvent, setHoveredKeyEvent] = useState();
    const [selectedKeyEventDetail, setSelectedKeyEventDetail] = useState();
    const [selectedKeyEventId, setSelectedKeyEventId] = useState();
    const [selectedKeyEventLatLng, setSelectedKeyEventLatLng] = useState();
    // eslint-disable-next-line no-unused-vars
    const [ignored, forceUpdate] = useReducer(x => x + 1, 0);

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
        props.updateTripReplayDisplayFilters(true);
        props.clearTrips();
        props.clearCurrentTrip();
    };

    return (
        <div className="control-trip-replays-view d-flex">
            <SidePanel
                isOpen
                isActive
                className="trip-replay-primary-panel"
                toggleButton={ false }>
                { !props.isFiltersViewDisplayed && <BackHeader text="Back to search" onClick={ backClick } /> }
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
    clearCurrentTrip: PropTypes.func.isRequired,
};

TripReplaysView.defaultProps = {
    trips: null,
};

export default connect(
    state => ({
        searchFilters: getTripReplayFilters(state),
        isFiltersViewDisplayed: getTripReplayShouldDisplayFilters(state),
        isSingleTripDisplayed: getTripReplaySingleTripDisplayed(state),
        trips: getTripReplayTrips(state),
        totalResults: getTripReplayTotalResults(state),
        hasMore: getTripReplayHasMore(state),
    }),
    {
        updateTripReplayDisplayFilters,
        clearTrips,
        clearCurrentTrip,
    },
)(TripReplaysView);
