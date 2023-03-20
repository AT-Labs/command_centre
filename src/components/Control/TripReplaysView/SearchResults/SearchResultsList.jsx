import PropTypes from 'prop-types';
import { isNull } from 'lodash-es';
import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import dateTypes from '../../../../types/date-types';
import Icon from '../../../Common/Icon/Icon';
import { getColumns } from './columns';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import AutoRefreshTable from '../../../Common/AutoRefreshTable/AutoRefreshTable';
import {
    getVehicleEventsTotalResults,
    getVehicleEventsHasMore,
    getVehicleEventsDisplayedTotalResults,
    getVehicleEventsAndPositions,
} from '../../../../redux/selectors/control/vehicleReplays/vehicleReplay';
import { clearVehicleReplayCurrentReplayDetail } from '../../../../redux/actions/control/vehicleReplays/vehicleReplay';
import { isTripCanceled } from '../../../../utils/control/tripReplays';
import { selectTrip } from '../../../../redux/actions/control/tripReplays/currentTrip';
import VehicleStatusView from './VehicleStatusView';
import Loader from '../../../Common/Loader/Loader';
import Tab from './Tab';
import './SearchResultsList.scss';

class SearchResultsList extends PureComponent {
    static propTypes = {
        trips: PropTypes.array,
        hasMore: PropTypes.bool,
        totalResults: PropTypes.number,
        handleMouseEnter: PropTypes.func.isRequired,
        handleMouseLeave: PropTypes.func.isRequired,
        handleMouseClick: PropTypes.func.isRequired,
        clearVehicleReplayCurrentReplayDetail: PropTypes.func.isRequired,
        vehicleEventsTotalResult: PropTypes.number,
        searchParams: PropTypes.shape({
            searchTerm: PropTypes.object.isRequired,
            date: PropTypes.string.isRequired,
            startTime: PropTypes.string.isRequired,
            endTime: PropTypes.string.isRequired,
            timeType: PropTypes.string.isRequired,
        }).isRequired,
        selectTrip: PropTypes.func.isRequired,
        hasMoreVehicleStatusAndPositions: PropTypes.bool.isRequired,
        vehicleEvents: PropTypes.array,
        vehicleEventsDisplayedTotalResult: PropTypes.number,
    };

    static defaultProps = {
        hasMore: false,
        totalResults: 0,
        vehicleEventsTotalResult: 0,
        trips: null,
        vehicleEvents: null,
        vehicleEventsDisplayedTotalResult: 0,
    };

    formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const m = moment();
        m.hours(hours);
        m.minutes(minutes);

        return `${m.format('HH:mm')}${hours > 23 ? ' (+1)' : ''}`;
    };

    renderVehicleStatusHeader = (hasMoreVehicleStatusAndPositions, vehicleEventsDisplayedTotalResult, vehicleEventsTotalResult) => (
        <>
            { hasMoreVehicleStatusAndPositions ? (
                <div className="px-4 mt-3 mb-3">
                    Showing
                    {' '}
                    {vehicleEventsDisplayedTotalResult}
                    {' '}
                    of
                    {' '}
                    {vehicleEventsTotalResult}
                    {' '}
                    results. Please refine your search.
                </div>
            ) : (
                <div className="px-4 mt-3 mb-3">
                    <dd>{`Showing ${vehicleEventsDisplayedTotalResult} statuses`}</dd>
                </div>
            )}
        </>
    );

    render() {
        const { trips, hasMore, totalResults, vehicleEventsTotalResult, searchParams: { searchTerm, date, startTime, endTime },
            handleMouseEnter, handleMouseLeave, handleMouseClick, hasMoreVehicleStatusAndPositions, vehicleEvents, vehicleEventsDisplayedTotalResult } = this.props;
        const { type, label } = searchTerm;
        const { BUS, TRAIN, FERRY } = SEARCH_RESULT_TYPE;
        const vehicles = [BUS.type, TRAIN.type, FERRY.type];
        const title = label.split('-');

        const displayTripAndClearVehiclePosition = (trip) => {
            this.props.selectTrip(trip);
            this.props.clearVehicleReplayCurrentReplayDetail();
        };

        const renderHeader = () => (
            <div>
                <p className="text-muted font-weight-normal mb-3 ml-3">
                    Showing results
                    for
                    {' '}
                    {label}
                    {' '}
                    between
                    {' '}
                    {this.formatTime(startTime || '00:00')}
                    {' '}
                    and
                    {' '}
                    {this.formatTime(endTime || '27:59')}
                    {' '}
                    on
                    the
                    {' '}
                    {moment(date).tz(dateTypes.TIME_ZONE).format('Do MMMM Y')}
                </p>
                <h2 className="mx-3 mt-4 mb-0">Select a trip</h2>
            </div>
        );

        const renderResults = () => (
            <div>
                <div className="total-result px-3 mt-3 mb-3">
                    <dd>
                        Showing
                        {' '}
                        { trips.length }
                        {' '}
                        trips
                    </dd>
                </div>
                <AutoRefreshTable
                    rows={ trips }
                    fetchRows={ () => {
                        // noop
                    } }
                    columns={ getColumns(type) }
                    className="trip-progress__past-stops-table pb-0"
                    emptyMessage="No trips found, please try again."
                    onRowClick={ trip => displayTripAndClearVehiclePosition(trip) }
                    hover
                    clickable
                    refresh={ false }
                    isRowStyled={ row => isTripCanceled(row) }
                    rowClassName="trip-replay-progress__fixed-table-row--canceled"
                />
                { hasMore && (
                    <div className="text-muted p-4">
                        Showing
                        {' '}
                        {trips.length}
                        {' '}
                        of
                        {' '}
                        {totalResults}
                        {' '}
                        results. Please refine your search.
                    </div>
                )}
            </div>
        );

        const renderMain = () => {
            if (trips === null) {
                return (
                    <section className="auto-refresh-table">
                        <h4 className="px-4">
                            <Loader className="my-3" />
                        </h4>
                    </section>
                );
            }

            if (vehicles.includes(type) && trips.length === 0) {
                return (
                    <div>
                        { this.renderVehicleStatusHeader(hasMoreVehicleStatusAndPositions, vehicleEventsDisplayedTotalResult, vehicleEventsTotalResult) }
                        <VehicleStatusView
                            handleMouseEnter={ handleMouseEnter }
                            handleMouseLeave={ handleMouseLeave }
                            handleMouseClick={ handleMouseClick } />
                    </div>
                );
            }

            if (vehicles.includes(type) && trips.length > 0) {
                return (
                    <Tab
                        renderTripView={ renderResults }
                        vehicleStatusHeader={
                            !isNull(vehicleEvents)
                                ? this.renderVehicleStatusHeader(hasMoreVehicleStatusAndPositions, vehicleEventsDisplayedTotalResult, vehicleEventsTotalResult) : null
                        }
                        handleMouseEnter={ handleMouseEnter }
                        handleMouseLeave={ handleMouseLeave }
                        handleMouseClick={ handleMouseClick }
                    />
                );
            }
            return renderResults();
        };

        const renderVehicleHeader = () => (
            <div className="px-4">
                <div className="search-query">
                    <div className="icon">
                        <Icon icon={ type } />
                    </div>

                    <h2 className="text-capitalize ml-2">
                        {`Vehicle ${title[0]}`}
                    </h2>
                </div>

                <div className="search-query mb-3">
                    <div className="search-query">
                        <dt className="font-size-md mr-1">
                            Date:
                        </dt>
                        <dd>{ `${moment(date).format('dddd')}, ${moment(date).tz(dateTypes.TIME_ZONE).format('Do MMMM Y')}` }</dd>
                    </div>
                    {startTime && (
                        <div className="search-query">
                            <dt className="font-size-md ml-3 mr-1">Start time: </dt>
                            <dd>{`${startTime}`}</dd>
                        </div>
                    )}
                    {endTime && (
                        <div className="search-query">
                            <dt className="font-size-md ml-3 mr-1">End time: </dt>
                            <dd>{`${endTime}`}</dd>
                        </div>
                    )}
                </div>
            </div>
        );

        return (
            <section className="trip-progress flex-grow-1 overflow-y-auto">
                { (vehicles.includes(type)) ? (
                    renderVehicleHeader()
                ) : (
                    renderHeader()
                )}

                { renderMain() }
            </section>
        );
    }
}

export default connect(
    state => ({
        vehicleEventsTotalResult: getVehicleEventsTotalResults(state),
        vehicleEventsDisplayedTotalResult: getVehicleEventsDisplayedTotalResults(state),
        hasMoreVehicleStatusAndPositions: getVehicleEventsHasMore(state),
        vehicleEvents: getVehicleEventsAndPositions(state),
    }),
    {
        selectTrip,
        clearVehicleReplayCurrentReplayDetail,
    },
)(SearchResultsList);
