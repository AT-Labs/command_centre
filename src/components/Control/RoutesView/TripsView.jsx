import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import moment from 'moment';

import TripView from './TripView';
import { IS_LOGIN_NOT_REQUIRED } from '../../../auth';
import { isTripCancelPermitted } from '../../../utils/user-permissions';
import { getControlDetailRoutesViewType, getRouteFilters } from '../../../redux/selectors/control/routes/filters';
import { getActiveRoute } from '../../../redux/selectors/control/routes/routes';
import { getActiveRouteVariant, getFilteredRouteVariants } from '../../../redux/selectors/control/routes/routeVariants';
import { mergeRouteFilters } from '../../../redux/actions/control/routes/filters';
import { getServiceDate } from '../../../redux/selectors/control/serviceDate';
import VIEW_TYPE from '../../../types/view-types';
import TRIP_STATUS_TYPES from '../../../types/trip-status-types';
import { TRAIN_TYPE_ID } from '../../../types/vehicle-types';
import { formatTripDelay, SERVICE_DATE_FORMAT, TRIPS_POLLING_INTERVAL } from '../../../utils/control/routes';
import { getTripInstanceId, getTripTimeDisplay, checkIfAllTripsAreSelected } from '../../../utils/helpers';
import ControlTable from '../Common/ControlTable/ControlTable';
import TripIcon from '../Common/Trip/TripIcon';
import SortButton from '../Common/SortButton/SortButton';
import {
    fetchTripInstances, updateActiveTripInstanceId, selectSingleTrip, selectAllTrips,
} from '../../../redux/actions/control/routes/trip-instances';
import {
    RouteFiltersType, RouteType, RouteVariantType, TripInstanceType, TripSubIconType,
} from './Types';
import {
    getActiveTripInstance, getAllTripInstancesList, getTripInstancesLoadingState, getTripInstancesUpdatingState, getSelectedTripsKeys, getAllNotCompletedTrips,
} from '../../../redux/selectors/control/routes/trip-instances';

export const formatStatusColumn = (row) => {
    const trip = row.tripInstance || row;
    const delay = formatTripDelay(_.get(trip, 'delay', 0));
    let status = _.lowerCase(row.status);
    if (row.status === TRIP_STATUS_TYPES.cancelled) {
        status = <span className="text-danger">{status}</span>;
    } else if (delay !== 0) {
        status = <span>{status}: <span className="text-lowercase">{`${Math.abs(delay)} mins ${delay > 0 ? 'delayed' : 'early'}`}</span></span>;
    }
    return status;
};

export const isTripCompleted = tripStatus => tripStatus === TRIP_STATUS_TYPES.completed;
export class TripsView extends React.Component {
    static propTypes = {
        activeRoute: RouteType,
        activeRouteVariant: RouteVariantType,
        activeTripInstance: PropTypes.arrayOf(TripInstanceType),
        tripInstances: PropTypes.arrayOf(TripInstanceType).isRequired,
        isLoading: PropTypes.bool.isRequired,
        isUpdating: PropTypes.bool.isRequired,
        routeVariants: PropTypes.arrayOf(RouteVariantType),
        viewType: PropTypes.string.isRequired,
        filters: RouteFiltersType.isRequired,
        fetchTripInstances: PropTypes.func.isRequired,
        updateActiveTripInstanceId: PropTypes.func.isRequired,
        serviceDate: PropTypes.string.isRequired,
        selectSingleTrip: PropTypes.func.isRequired,
        selectedTrips: PropTypes.array.isRequired,
        selectAllTrips: PropTypes.func.isRequired,
        notCompletedTrips: PropTypes.object.isRequired,
        mergeRouteFilters: PropTypes.func.isRequired,
    }

    static defaultProps = {
        activeRoute: null,
        activeRouteVariant: null,
        activeTripInstance: [],
        routeVariants: [],
    }

    constructor(props) {
        super(props);

        this.intervalId = null;
    }

    componentDidMount = () => {
        if (!this.isTripsOnlyView()) {
            this.retrieveTripInstances(false);

            this.intervalId = setInterval(() => {
                if (!this.props.isLoading && !this.props.isUpdating) {
                    this.retrieveTripInstances(true);
                }
            }, TRIPS_POLLING_INTERVAL);
        }
    }

    componentWillUnmount() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    isRoutesRouteVariantsTripsView = () => this.props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_ROUTE_VARIANTS_TRIPS

    isRouteVariantsTripsView = () => this.props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTE_VARIANTS_TRIPS

    isRoutesTripsView = () => this.props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.ROUTES_TRIPS

    isTripsOnlyView = () => this.props.viewType === VIEW_TYPE.CONTROL_DETAIL_ROUTES.TRIPS

    isTrainMode = () => _.get(this.props.filters, 'routeType') === TRAIN_TYPE_ID

    isSortingEnable = () => this.isTripsOnlyView()

    getSorting = () => _.get(this.props.filters, 'sorting')

    isSortByDelayVisible = () => {
        const tripStatusFilter = _.get(this.props.filters, 'tripStatus');
        return tripStatusFilter === TRIP_STATUS_TYPES.inProgress || tripStatusFilter === TRIP_STATUS_TYPES.completed;
    }

    retrieveTripInstances = (isUpdate) => {
        const variables = {
            serviceDate: moment(this.props.serviceDate).format(SERVICE_DATE_FORMAT),
            ...this.props.filters,
        };
        if (this.isRoutesRouteVariantsTripsView() || this.isRouteVariantsTripsView()) {
            variables.routeVariantIds = [_.get(this.props.activeRouteVariant, 'routeVariantId')];
        }
        if (this.isRoutesTripsView()) {
            const routeVariants = _.filter(this.props.routeVariants, { routeShortName: _.get(this.props.activeRoute, 'routeShortName') });
            variables.routeVariantIds = _.map(routeVariants, item => item.routeVariantId);
        }
        this.props.fetchTripInstances(variables, { isUpdate });
    }

    renderSortableColumnLabel = (columnName, label) => (
        <div className="d-flex align-content-center">
            <SortButton
                className="mr-1"
                active={ this.getSorting() && this.getSorting().sortBy === columnName ? this.getSorting().order : null }
                onClick={ order => this.props.mergeRouteFilters({
                    sorting: {
                        sortBy: columnName,
                        order,
                    },
                }) } />
            <div>{ label }</div>
        </div>
    )

    getRowColumnsConfig = () => {
        const iconCol = {
            label: () => (
                <React.Fragment>
                    <input
                        type="checkbox"
                        className="select-all-trips-checkbox mr-2"
                        disabled={ !moment().isSame(moment(this.props.serviceDate), 'd') }
                        checked={ !this.props.isLoading && checkIfAllTripsAreSelected(Object.keys(this.props.notCompletedTrips), this.props.selectedTrips) }
                        onChange={ this.props.selectAllTrips } />
                    <span>route #</span>
                </React.Fragment>
            ),
            key: 'icon',
            cols: 'col-1',
            getContent: row => this.renderIconColumnContent(row),
        };
        const routeVariantIdCol = { label: 'route #', key: 'routeVariantId', cols: 'col-1' };
        const startTimeCol = {
            label: this.isSortingEnable() ? () => this.renderSortableColumnLabel('startTime', 'start') : 'start',
            key: 'startTime',
            cols: 'col-1',
        };
        const endTimeCol = { label: 'end', key: 'endTime', cols: 'col-1' };
        const statusCol = {
            label: this.isSortingEnable() && this.isSortByDelayVisible() ? () => this.renderSortableColumnLabel('delay', 'status') : 'status',
            key: 'status',
            cols: 'col-3',
            getContent: row => formatStatusColumn(row),
        };
        const routeCol = {
            label: 'route',
            key: 'routeLongName',
            cols: this.isTrainMode() ? 'col-3' : 'col-4',
            getContent: (row) => {
                const routeLongName = _.get(row.tripInstance, 'routeLongName');
                const routeShortName = _.get(row.tripInstance, 'routeShortName');
                return `${routeShortName} ${routeLongName}`;
            },
        };
        const referenceIdCol = { label: 'ref #', key: 'referenceId', cols: 'col-1' };

        const config = [];
        config.push(iconCol);
        config.push(routeVariantIdCol);
        if (this.isTrainMode()) {
            config.push(referenceIdCol);
        }
        config.push(startTimeCol);
        config.push(endTimeCol);
        config.push(statusCol);
        if (this.isRoutesTripsView() || this.isTripsOnlyView()) {
            config.push(routeCol);
        }
        return config;
    }

    handleRowClick = tripInstance => this.props.updateActiveTripInstanceId(getTripInstanceId(tripInstance))

    isRowActive = tripInstance => !_.isEmpty(this.props.activeTripInstance) && !_.isEmpty(
        this.props.activeTripInstance
            .filter(trip => getTripInstanceId(trip) === getTripInstanceId(tripInstance)),
    )

    renderRowBody = tripInstances => <TripView tripInstance={ tripInstances.tripInstance } />

    getRowClassName = (tripInstance) => {
        const status = _.get(tripInstance, 'status', null);
        if (isTripCompleted(status) || status === TRIP_STATUS_TYPES.notStarted) {
            return 'bg-at-ocean-tint-5 text-muted';
        }
        if (status === TRIP_STATUS_TYPES.cancelled) {
            return 'bg-at-ocean-tint-5';
        }
        if (status === TRIP_STATUS_TYPES.missed) {
            return 'bg-at-magenta-tint-5';
        }
        return '';
    }

    removeCompletedTripFromSelectedListAfterUpdate = (tripKey, trip) => this.props.selectSingleTrip({ [tripKey]: trip })

    renderIconColumnContent = (row) => {
        let iconColor = '';
        let subIcon = null;
        const tripKey = getTripInstanceId(row.tripInstance);
        const isCompleted = isTripCompleted(row.tripInstance.status);
        const isTripSelected = _.includes(this.props.selectedTrips, tripKey);
        const isDelayed = formatTripDelay(_.get(row.tripInstance, 'delay')) > 0;
        const isDateServiceToday = moment().isSame(moment(this.props.serviceDate), 'd');
        const isCancelPermitted = IS_LOGIN_NOT_REQUIRED || isTripCancelPermitted(row.tripInstance);
        const shouldCheckboxBeDisabled = !isCancelPermitted || isCompleted || !isDateServiceToday;

        if (row.status === TRIP_STATUS_TYPES.cancelled) {
            iconColor = 'text-danger';
        } else if (row.status === TRIP_STATUS_TYPES.missed) {
            iconColor = 'text-at-magenta';
        } else if (isTripCompleted(row.status)) {
            subIcon = isDelayed ? TripSubIconType.delayed : TripSubIconType.onTime;
        } else if (row.status === TRIP_STATUS_TYPES.inProgress) {
            iconColor = isDelayed ? 'text-at-orange' : 'text-success';
        }

        const shouldCheckboxBeChecked = isTripSelected && !isCompleted;
        const shouldCheckboxBeRemoved = isTripSelected && isCompleted;
        if (shouldCheckboxBeRemoved) this.removeCompletedTripFromSelectedListAfterUpdate(tripKey, row.tripInstance);

        return (
            <React.Fragment>
                <input
                    type="checkbox"
                    key={ tripKey }
                    name={ tripKey }
                    checked={ shouldCheckboxBeChecked }
                    disabled={ shouldCheckboxBeDisabled }
                    className={ `select-trip-checkbox mr-2 select-trip-checkbox__${row.status.toLowerCase()}` }
                    onChange={ event => this.props.selectSingleTrip({ [event.target.name]: row.tripInstance }) } />
                <TripIcon
                    type={ row.routeType }
                    className={ iconColor }
                    subIcon={ subIcon } />
            </React.Fragment>
        );
    }

    render() {
        let tripInstancesFilterPredicate = null;
        let controlTableLevel = 2;

        if (this.isRoutesRouteVariantsTripsView()) {
            tripInstancesFilterPredicate = { routeVariantId: _.get(this.props.activeRouteVariant, 'routeVariantId') };
            controlTableLevel = 3;
        }
        if (this.isRouteVariantsTripsView()) {
            tripInstancesFilterPredicate = { routeVariantId: _.get(this.props.activeRouteVariant, 'routeVariantId') };
            controlTableLevel = 2;
        }
        if (this.isRoutesTripsView()) {
            tripInstancesFilterPredicate = { routeShortName: _.get(this.props.activeRoute, 'routeShortName') };
            controlTableLevel = 2;
        }

        const tripInstances = _.filter(this.props.tripInstances, tripInstancesFilterPredicate);
        const rows = tripInstances.map(tripInstance => ({
            routeVariantId: tripInstance.routeVariantId,
            startTime: getTripTimeDisplay(tripInstance.startTime),
            endTime: getTripTimeDisplay(tripInstance.endTime),
            routeType: tripInstance.routeType,
            status: tripInstance.status,
            routeLongName: tripInstance.routeLongName,
            referenceId: tripInstance.referenceId,
            tripInstance,
        }));

        return (
            <ControlTable
                columns={ this.getRowColumnsConfig() }
                data={ rows }
                getRowId={ row => getTripInstanceId(row.tripInstance) }
                isLoading={ this.props.isLoading }
                rowOnClick={ row => this.handleRowClick(row.tripInstance) }
                rowActive={ row => this.isRowActive(row.tripInstance) }
                rowBody={ this.renderRowBody }
                rowClassName={ this.getRowClassName }
                level={ controlTableLevel } />
        );
    }
}

export default connect(state => ({
    activeRoute: getActiveRoute(state),
    activeRouteVariant: getActiveRouteVariant(state),
    activeTripInstance: getActiveTripInstance(state),
    tripInstances: getAllTripInstancesList(state),
    isLoading: getTripInstancesLoadingState(state),
    isUpdating: getTripInstancesUpdatingState(state),
    routeVariants: getFilteredRouteVariants(state),
    viewType: getControlDetailRoutesViewType(state),
    filters: getRouteFilters(state),
    serviceDate: getServiceDate(state),
    selectedTrips: getSelectedTripsKeys(state),
    notCompletedTrips: getAllNotCompletedTrips(state.control.routes.tripInstances.all),
}), { fetchTripInstances, updateActiveTripInstanceId, selectSingleTrip, selectAllTrips, mergeRouteFilters })(TripsView);
