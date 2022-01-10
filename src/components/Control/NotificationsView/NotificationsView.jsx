import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import moment from 'moment-timezone';
import { Button } from 'reactstrap';
import { IoIosWarning, IoMdMap, IoMdList, IoIosCheckmark } from 'react-icons/io';

import { updateNotificationsFilters, dismissNotification } from '../../../redux/actions/control/notifications';
import { getAllNotifications, getNotificationsFilters } from '../../../redux/selectors/control/notifications';
import { getAgencies } from '../../../redux/selectors/control/agencies';
import { isNotificationDismissPermitted } from '../../../utils/user-permissions';
import ControlTable from '../Common/ControlTable/ControlTable';
import FilterByOperator from '../Common/Filters/FilterByOperator';
// import FilterByMode from '../Common/Filters/FilterByMode'; ========= Temporarily disabled =========
import StandardFilter from '../Common/Filters/StandardFilter';
import FilterByRoute from '../Common/Filters/FitlerByRoute/FilterByRoute';
import { PageInfo, Pagination } from '../../Common/Pagination/Pagination';
import VEHICLE_TYPE from '../../../types/vehicle-types';
import { goToRoutesView } from '../../../redux/actions/control/link';
import { getClosestTimeValueForFilter } from '../../../utils/helpers';
import './Notifications.scss';

const FILTERS = {
    ROUTE: 'route',
    STATUS: 'status',
    OPERATOR: 'operator',
    SEVERITY: 'severity',
    MODE: 'routeType',
};
const STATUS = [
    'Active',
    'Dismissed',
    'Expired',
];
const SEVERITY = [
    'Low',
    'Medium',
    'High',
];
const PAGE_SIZE = 100;
const INIT_STATE = {
    page: 1,
};

export class NotificationsView extends React.Component {
    static propTypes = {
        updateNotificationsFilters: PropTypes.func.isRequired,
        dismissNotification: PropTypes.func.isRequired,
        goToRoutesView: PropTypes.func.isRequired,
        notifications: PropTypes.array,
        filters: PropTypes.object.isRequired,
        operators: PropTypes.array.isRequired,
    }

    static defaultProps = {
        notifications: [],
    }

    constructor(props) {
        super(props);
        this.state = INIT_STATE;

        this.NOTIFICATIONS_COLUMNS = [
            {
                label: '',
                key: '',
                cols: 'control-notifications-view__icon-col pl-3',
                getContent: (row) => {
                    let iconColor = '';
                    if (row[FILTERS.STATUS] === 'Dismissed') iconColor = 'text-at-warning';
                    else if (row[FILTERS.STATUS] === 'Active') iconColor = 'text-at-magenta';
                    else if (row[FILTERS.STATUS] === 'Expired') iconColor = 'text-light';
                    return <IoIosWarning size={ 20 } className={ `${iconColor}` } />;
                },
            },
            {
                label: 'created',
                key: 'createdAt',
                cols: 'col',
                getContent: (row, key) => moment(row[key]).format('DD/MM/YYYY - HH:mm'),
            },
            {
                label: 'route',
                key: 'routeShortName',
                cols: 'col',
            },
            {
                label: 'mode',
                key: FILTERS.MODE,
                cols: 'col',
                getContent: (row, key) => VEHICLE_TYPE[row[key]].type,
            },
            {
                label: 'notification',
                key: 'customMessage',
                cols: 'col',
            },
            {
                label: FILTERS.SEVERITY,
                key: 'severity',
                cols: 'col',
            },
            {
                label: FILTERS.OPERATOR,
                key: FILTERS.OPERATOR,
                cols: 'col',
            },
            {
                label: FILTERS.STATUS,
                key: 'status',
                cols: 'col',
            },
            {
                label: '',
                key: '',
                cols: 'col',
                getContent: row => (
                    <div className="cc-table-actions-col">
                        <Button
                            className="control-notifications-view__map-btn"
                            onClick={ () => {} }>
                            <IoMdMap size={ 25 } className="mr-1" />
                        </Button>
                        <Button
                            className="control-notifications-view__trip-btn"
                            onClick={ () => this.props.goToRoutesView({
                                routeVariantId: row.routeVariantId,
                                routeType: row.routeType,
                                startTime: row.tripStartTime,
                                routeShortName: row.routeShortName,
                                agencyId: row.agencyId,
                                tripStartDate: row.tripStartDate,
                                tripStartTime: row.tripStartTime,
                            }, {
                                routeType: row.routeType,
                                startTimeFrom: getClosestTimeValueForFilter(row.tripStartTime),
                                startTimeTo: '',
                                tripStatus: '',
                                agencyId: '',
                                routeShortName: row.routeShortName,
                                routeVariantId: row.routeVariantId,
                            }) }>
                            <IoMdList size={ 25 } className="mr-1" />
                        </Button>
                        {
                            isNotificationDismissPermitted(row) && (
                                <Button
                                    className="control-notifications-view__dismiss-btn"
                                    onClick={ () => this.props.dismissNotification(row) }>
                                    <IoIosCheckmark size={ 25 } className="mr-1" />
                                </Button>
                            )
                        }
                    </div>
                ),
            },
        ];
    }

    enrichNotifications = () => {
        const { notifications, operators } = this.props;
        return operators.length ? notifications.map(notification => ({
            ...notification,
            operator: _.filter(operators, operator => operator.agencyId === notification.agencyId)[0].agencyName,
        })) : notifications;
    }

    formatFilters = (activeFilters) => {
        const filters = { ...activeFilters };

        if (!_.isEmpty(activeFilters.route)) {
            delete filters.route;
            filters.routeShortName = activeFilters.route;
        }

        if (!_.isEmpty(activeFilters.operator)) {
            delete filters.operator;
            filters.agencyId = activeFilters.operator;
        }

        return filters;
    }

    filterList = () => {
        const enrichedNotifications = this.enrichNotifications();
        const activeFilters = _.pickBy(this.props.filters, _.identity);
        return _.size(activeFilters) ? _.filter(enrichedNotifications, this.formatFilters(activeFilters)) : enrichedNotifications;
    }

    getPageData = () => _.slice(this.filterList(), (this.state.page - 1) * PAGE_SIZE, this.state.page * PAGE_SIZE)

    getTotal = () => this.filterList().length

    render() {
        return (
            <div className="control-notifications-view">
                <h1>Notifications</h1>
                <section className="search-filters bg-at-ocean-tint-10 border border-at-ocean-tint-20 mb-3">
                    <div className="row justify-content-between pt-3 px-3">
                        <div className="col-md-4">
                            <FilterByRoute
                                id="notifications-route-filter"
                                className="control-notifications-view__route-filter"
                                selectedOption={ this.props.filters[FILTERS.ROUTE] }
                                onSelection={ selectedOption => this.props.updateNotificationsFilters({
                                    [FILTERS.ROUTE]: selectedOption.label,
                                }) } />
                        </div>
                    </div>
                    <div className="row justify-content-between pt-3 px-3">
                        <div className="col-md-4">
                            <FilterByOperator
                                id="notifications-operator-filter"
                                className="control-notifications-view__operator-filter"
                                selectedOption={ this.props.filters[FILTERS.OPERATOR] }
                                onSelection={ selectedOption => this.props.updateNotificationsFilters({
                                    [FILTERS.OPERATOR]: selectedOption.value,
                                }) } />
                        </div>
                        <div className="col-md-4">
                            <StandardFilter
                                id="notifications-status-filter"
                                className="control-notifications-view__status-filter"
                                title="Status"
                                placeholder="Select status"
                                selectedOption={ this.props.filters[FILTERS.STATUS] }
                                options={ STATUS }
                                onSelection={ selectedOption => this.props.updateNotificationsFilters({
                                    [FILTERS.STATUS]: selectedOption.value,
                                }) } />
                        </div>
                        <div className="col-md-4">
                            <StandardFilter
                                id="notifications-severity-filter"
                                className="control-notifications-view__severity-filter"
                                title="Severity"
                                placeholder="Select severity"
                                selectedOption={ this.props.filters[FILTERS.SEVERITY] }
                                options={ SEVERITY }
                                onSelection={ selectedOption => this.props.updateNotificationsFilters({
                                    [FILTERS.SEVERITY]: selectedOption.value,
                                }) } />
                        </div>
                        {/*
                            ========= Temporarily disabled =========
                            (when enabled the above siblings' col-md-4 classes should be replaced with col-md-3)
                            <div className="col-md-3 d-flex align-items-center pt-3">
                            <FilterByMode
                                className="control-notifications-mode-filter"
                                selectedOption={ this.props.filters[FILTERS.MODE] }
                                onSelection={ selectedOption => this.props.updateNotificationsFilters({
                                    [FILTERS.MODE]: selectedOption === this.props.filters[FILTERS.MODE] ? 0 : selectedOption,
                                }) } />
                        </div> */}
                    </div>
                </section>
                <ControlTable
                    columns={ this.NOTIFICATIONS_COLUMNS }
                    data={ this.getPageData() }
                    isExpandable={ false } />
                <React.Fragment>
                    <PageInfo
                        currentPage={ this.state.page }
                        itemsPerPage={ PAGE_SIZE }
                        itemsTotal={ this.getTotal() }
                    />
                    <Pagination
                        currentPage={ this.state.page }
                        itemsPerPage={ PAGE_SIZE }
                        itemsTotal={ this.getTotal() }
                        onPageClick={ page => this.setState({ page }) }
                    />
                </React.Fragment>
            </div>
        );
    }
}

export default connect(state => ({
    notifications: getAllNotifications(state),
    filters: getNotificationsFilters(state),
    operators: getAgencies(state),
}),
{
    updateNotificationsFilters,
    dismissNotification,
    goToRoutesView,
})(NotificationsView);
