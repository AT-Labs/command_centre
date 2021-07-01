import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import dateTypes from '../../../../types/date-types';
import { getColumns } from './columns';
import AutoRefreshTable from '../../../Common/AutoRefreshTable/AutoRefreshTable';
import { selectTrip } from '../../../../redux/actions/control/tripReplays/currentTrip';
import { isTripCanceled } from '../../../../utils/control/tripReplays';
import './SearchResultsList.scss';

class SearchResultsList extends PureComponent {
    static propTypes = {
        trips: PropTypes.array,
        hasMore: PropTypes.bool,
        totalResults: PropTypes.number,
        searchParams: PropTypes.shape({
            route: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
            startTime: PropTypes.string.isRequired,
            endTime: PropTypes.string.isRequired,
        }).isRequired,
        selectTrip: PropTypes.func.isRequired,
    };

    static defaultProps = {
        hasMore: false,
        totalResults: 0,
        trips: null,
    };

    formatTime = (time) => {
        const [hours, minutes] = time.split(':');
        const m = moment();
        m.hours(hours);
        m.minutes(minutes);

        return `${m.format('HH:mm')}${hours > 23 ? ' (+1)' : ''}`;
    }

    render() {
        const { trips, hasMore, totalResults, searchParams: { route, date, startTime, endTime } } = this.props;

        return (
            <section className="trip-progress flex-grow-1 overflow-y-auto">
                <p className="text-muted font-weight-normal mb-3 ml-3">
                    Showing results
                    for {route} between {this.formatTime(startTime || '00:00')} and {this.formatTime(endTime || '27:59')} on
                    the {moment(date).tz(dateTypes.TIME_ZONE).format('Do MMMM Y')}
                </p>

                <h2 className="mx-3 mt-4 mb-0">Select a trip</h2>
                <AutoRefreshTable
                    rows={ trips }
                    fetchRows={ () => {} }
                    columns={ getColumns() }
                    className="trip-progress__past-stops-table pb-0 pt-3"
                    emptyMessage="No trips found, please try again."
                    onRowClick={ trip => this.props.selectTrip(trip) }
                    hover
                    clickable
                    refresh={ false }
                    isRowStyled={ row => isTripCanceled(row) }
                    rowClassName="trip-replay-progress__fixed-table-row--canceled"
                />
                { hasMore && <div className="text-muted p-4">Showing {trips ? trips.length : 0} of {totalResults} results. Please refine your search.</div>}

            </section>
        );
    }
}

export default connect(
    () => ({}),
    {
        selectTrip,
    },
)(SearchResultsList);
