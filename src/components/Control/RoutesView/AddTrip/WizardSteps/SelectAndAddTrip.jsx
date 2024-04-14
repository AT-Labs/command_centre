import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import { IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import { getGridStringOperators } from '@mui/x-data-grid-pro';
import moment from 'moment';
import { uniqueId } from 'lodash-es';
import { Button } from 'reactstrap';
import { FaArrowLeft, FaTimes } from 'react-icons/fa';

import CustomDataGrid from '../../../../Common/CustomDataGrid/CustomDataGrid';
import RenderCellExpand from '../../../Alerts/RenderCellExpand/RenderCellExpand';
import Message from '../../../Common/Message/Message';
import { getTripTimeDisplay, getTimePickerOptions } from '../../../../../utils/helpers';

import { searchTrip } from '../../../../../utils/transmitters/trip-mgt-api';
import { getAddTripDatagridConfig, getSelectedAddTrip } from '../../../../../redux/selectors/control/routes/trip-instances';
import { updateAddTripDatagridConfig, updateSelectedAddTrip, updateEnabledAddTripModal } from '../../../../../redux/actions/control/routes/trip-instances';
import { TIME_FORMAT_HHMM, TIME_FORMAT_HHMMSS, DATE_FORMAT_GTFS, DATE_FORMAT_DDMMYYYY } from '../../../../../utils/dateUtils';
import { ERROR_MESSAGE_TYPE } from '../../../../../types/message-types';
import { DIRECTIONS } from '../../../DisruptionsView/types';
import { DATE_FORMAT } from '../../../../../constants/disruptions';
import NewTripDetails from './NewTripDetails';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import ChangeSelectedTripModal from './ChangeSelectedTripModal';
import CloseConfirmation from './CloseConfirmation';
import { OPERATORS } from '../../../../../constants/datagrid';
import { dateOperators } from '../../../../../utils/control/routes';
import RadioButtons from '../../../../Common/RadioButtons/RadioButtons';
import { viewRadioOptions } from '../../Types';
import { useRouteView } from '../../../../../redux/selectors/appSettings';

const drawerWidthOpen = '700px';
const drawerWidthClose = '200px';

const openedMixin = theme => ({
    width: drawerWidthOpen,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = theme => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: drawerWidthClose,
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(0, 1),
    justifyContent: 'flex-end',
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: prop => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidthOpen,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        height: '100%',
        zIndex: '1',
        ...(open && {
            ...openedMixin(theme),
            '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
            ...closedMixin(theme),
            '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const ViewType = {
    Route: 'Route',
    Trip: 'Trip',
};

export const SelectAndAddTrip = (props) => {
    const [loading, setLoading] = useState(false);
    const [viewType, setViewType] = useState(props.useRouteView ? ViewType.Route : ViewType.Trip);
    const [trips, setTrips] = useState([]);
    const [tripsTotal, setTripsTotal] = useState(0);
    const [requestError, setRequestError] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [isChangeSelectedTripModalOpen, setIsChangeSelectedTripModalOpen] = useState(false);
    const [isChangeViewModalOpen, setIsChangeViewModalOpen] = useState(false);
    const [selectedAddTrip, setSelectedAddTrip] = useState(null);
    const [isCloseConfirmationOpen, setIsCloseConfirmationOpen] = useState(false);

    const newTripDetailsRef = useRef(null);

    const parseTripInstance = tripInstance => (
        {
            id: tripInstance.tripId,
            tripId: tripInstance.tripId,
            routeVariant: tripInstance.routeVariantId,
            routeVariantName: tripInstance.routeLongName,
            startTime: getTripTimeDisplay(tripInstance.startTime),
            endTime: getTripTimeDisplay(tripInstance.endTime),
            tripInstance,
        }
    );

    const groupByRouteVariantId = (tripsToGroup) => {
        const groupedTripsMap = tripsToGroup.reduce((acc, trip) => {
            if (!acc.has(trip.routeVariantId)) {
                acc.set(trip.routeVariantId, trip);
            }
            return acc;
        }, new Map());

        return Array.from(groupedTripsMap.values());
    };

    const fieldNameMappings = (field) => {
        const fieldMappings = {
            routeVariantName: 'routeLongName',
            routeVariant: 'routeVariantId',
        };
        return fieldMappings[field] || field;
    };

    useEffect(async () => {
        const { page, pageSize, sortModel, filterModel } = props.datagridConfig;
        const { route, agency, serviceDateFrom, serviceDateTo, directionId } = props.data;
        let { startTimeFrom, startTimeTo } = props.data;
        let routeVariantNameContains;
        let routeVariantNameEquals;

        filterModel?.items.forEach((filter) => {
            const { value, columnField, operatorValue } = filter;

            if (value && columnField === 'startTime' && operatorValue === OPERATORS.onOrAfter) {
                startTimeFrom = value;
            }

            if (value && columnField === 'startTime' && operatorValue === OPERATORS.onOrBefore) {
                startTimeTo = value;
            }

            if (value && columnField === 'routeVariantName' && operatorValue === OPERATORS.contains) {
                routeVariantNameContains = value;
            }

            if (value && columnField === 'routeVariantName' && operatorValue === OPERATORS.equals) {
                routeVariantNameEquals = value;
            }
        });

        const payload = {
            page: page + 1,
            limit: pageSize,
            routeId: route.routeId,
            ...(agency.agencyId && { agencyId: agency.agencyId }),
            ...(serviceDateFrom && { serviceDateFrom: moment(serviceDateFrom, DATE_FORMAT_DDMMYYYY).format(DATE_FORMAT_GTFS) }),
            ...(serviceDateTo && { serviceDateTo: moment(serviceDateTo, DATE_FORMAT_DDMMYYYY).format(DATE_FORMAT_GTFS) }),
            ...(startTimeFrom && { startTimeFrom: moment(startTimeFrom, TIME_FORMAT_HHMM).format(TIME_FORMAT_HHMMSS) }),
            ...(startTimeTo && { startTimeTo: moment(startTimeTo, TIME_FORMAT_HHMM).format(TIME_FORMAT_HHMMSS) }),
            ...(sortModel.length > 0 && { sorting: { sortBy: fieldNameMappings(sortModel[0].field), order: sortModel[0].sort } }),
            ...(routeVariantNameContains && { routeVariantNameContains }),
            ...(routeVariantNameEquals && { routeVariantNameEquals }),
            directionId,
        };
        try {
            setLoading(true);

            if (viewType === ViewType.Trip) {
                // Trip View
                const result = await searchTrip(payload);
                if (result?.trips && result?.totalCount) {
                    setTrips(result.trips);
                    setTripsTotal(Number(result.totalCount));
                    if (result.trips.length > 0) {
                        props.updateSelectedAddTrip(parseTripInstance(result.trips[0]));
                    } else {
                        props.updateSelectedAddTrip(null);
                    }
                }
            } else if (viewType === ViewType.Route) {
                // Route View
                // Get all the trips for the query using the existing endpoint.
                // 1000 limit should return all the trips for a given route and direction.
                // The call is fast enough, and normally no need to call second time as one page is enough to show the result
                // grouped by variant id for the same route.
                const result = await searchTrip({ ...payload, page: 1, limit: 1000 });
                if (result?.trips && result?.totalCount) {
                    const tripsForRouteView = groupByRouteVariantId(result.trips);
                    setTrips(tripsForRouteView);
                    setTripsTotal(tripsForRouteView.length);
                    if (tripsForRouteView.length > 0) {
                        props.updateSelectedAddTrip(parseTripInstance(tripsForRouteView[0]));
                    } else {
                        props.updateSelectedAddTrip(null);
                    }
                }
            }
        } catch (e) {
            setRequestError(true);
        } finally {
            setLoading(false);
        }
    }, [props.datagridConfig.pageSize, props.datagridConfig.page, props.datagridConfig.sortModel, props.datagridConfig.filterModel, viewType]);

    const getActionsButtons = params => (
        <IconButton aria-label="open"
            onClick={ () => {
                const selectedTrip = parseTripInstance(params.row.tripInstance);
                if (newTripDetailsRef.current?.isFormEmpty()) {
                    props.updateSelectedAddTrip(selectedTrip);
                } else {
                    setSelectedAddTrip(selectedTrip);
                    setIsChangeSelectedTripModalOpen(true);
                }
            } }>
            <KeyboardArrowRight />
        </IconButton>
    );

    const GRID_COLUMNS = viewType === ViewType.Route ? [
        {
            field: 'routeVariant',
            headerName: 'ROUTE VARIANT',
            width: 150,
            type: 'string',
            renderCell: RenderCellExpand,
            filterable: false,
        },
        {
            field: 'routeVariantName',
            headerName: 'ROUTE VARIANT NAME',
            width: 480,
            type: 'string',
            renderCell: RenderCellExpand,
            filterOperators: getGridStringOperators().filter(
                operator => operator.value === 'equals' || operator.value === 'contains',
            ),
        },
        {
            field: 'actions',
            type: 'actions',
            width: 50,
            renderCell: getActionsButtons,
        },
    ] : [
        {
            field: 'routeVariant',
            headerName: 'ROUTE VARIANT',
            width: 150,
            type: 'string',
            renderCell: RenderCellExpand,
            filterable: false,
        },
        {
            field: 'routeVariantName',
            headerName: 'ROUTE VARIANT NAME',
            width: 260,
            type: 'string',
            renderCell: RenderCellExpand,
            filterOperators: getGridStringOperators().filter(
                operator => operator.value === 'equals' || operator.value === 'contains',
            ),
        },
        {
            field: 'startTime',
            headerName: 'START TIME',
            width: 110,
            type: 'string',
            renderCell: RenderCellExpand,
            valueOptions: getTimePickerOptions(28),
            filterOperators: dateOperators,
        },
        {
            field: 'endTime',
            headerName: 'END TIME',
            width: 110,
            type: 'string',
            renderCell: RenderCellExpand,
            filterable: false,
        },
        {
            field: 'actions',
            type: 'actions',
            width: 50,
            renderCell: getActionsButtons,
        },
    ];

    const getBackgroundColor = row => (row.id === props.selectedTrip?.tripId ? 'bg-selected-trip' : '');

    const rows = trips.map(tripInstance => parseTripInstance(tripInstance));

    const renderSearchSummary = () => {
        const { startTimeFrom, startTimeTo, serviceDateFrom, serviceDateTo, directionId, route } = props.data;
        return (
            <span className="d-flex flex-column align-items-start mb-2">
                <span className="text-muted">
                    Showing results for
                    {' '}
                    {route.routeShortName }
                    {' '}
                    { DIRECTIONS[directionId] }
                    {' '}
                    { startTimeFrom && `starting from ${startTimeFrom} `}
                    { startTimeTo && `to ${startTimeTo} `}
                    { serviceDateFrom && `from the ${moment(serviceDateFrom, DATE_FORMAT).format('Do MMMM YYYY')} `}
                    { serviceDateTo && `to the ${moment(serviceDateTo, DATE_FORMAT).format('Do MMMM YYYY')} `}
                </span>
            </span>
        );
    };

    const renderViewRadioButtons = () => (
        <div>
            <RadioButtons
                { ...viewRadioOptions(viewType, 'add-trip__wizard-view-type') }
                disabled={ false }
                checkedKey={ viewType }
                onChange={ (checkedButtonKey) => {
                    if (newTripDetailsRef.current?.isFormEmpty()) {
                        setViewType(checkedButtonKey);
                        props.updateAddTripDatagridConfig({ page: 0, pageSize: 15, sortModel: [], columns: [] });
                    } else {
                        setIsChangeViewModalOpen(true);
                    }
                } }
            />
        </div>
    );

    const toggleDrawerView = () => setDrawerOpen(!drawerOpen);

    const handleClose = () => {
        if (newTripDetailsRef.current?.shouldShowConfirmationModal()) {
            setIsCloseConfirmationOpen(true);
        } else {
            props.updateEnabledAddTripModal(false);
            props.updateSelectedAddTrip(null);
        }
    };

    return (
        <div>
            <div className="p-3 m-3 select-add-trip-section overflow-auto">
                <div className="d-flex justify-content-between">
                    <div>
                        <Button
                            aria-label="Back to search"
                            className="btn cc-btn-link p-0"
                            onClick={ () => {
                                props.updateSelectedAddTrip(null);
                                props.updateAddTripDatagridConfig({ page: 0, pageSize: 15 });
                                props.onStepUpdate(0);
                            } }>
                            <FaArrowLeft className="mr-2" />
                            Back to search
                        </Button>
                    </div>
                    <div>
                        <Button
                            aria-label="Close"
                            className="btn cc-btn-primary"
                            onClick={ handleClose }
                            disabled={ loading }>
                            Close
                            <FaTimes className="ml-2" />
                        </Button>
                    </div>
                </div>
                { props.header }
                {renderSearchSummary()}
                { props.useRouteView ? renderViewRadioButtons() : '' }
                { requestError && (
                    <Message
                        message={ {
                            id: uniqueId('message_'),
                            type: ERROR_MESSAGE_TYPE,
                            body: 'An error occurs when trying to search for trips.',
                        } }
                    />
                ) }
                <div className="row search-result-block">
                    <Box className="pt-2" sx={ { display: 'flex', width: '100%' } }>
                        <Drawer variant="permanent" open={ drawerOpen }>
                            { props.selectedTrip && (
                                <DrawerHeader open={ drawerOpen }>
                                    <IconButton onClick={ toggleDrawerView }>
                                        { drawerOpen ? <ChevronLeftIcon /> : <ChevronRightIcon /> }
                                    </IconButton>
                                </DrawerHeader>
                            ) }
                            <CustomDataGrid
                                gridClassNames="vh-60"
                                columns={ GRID_COLUMNS }
                                dataSource={ rows }
                                datagridConfig={ props.datagridConfig }
                                loading={ loading }
                                getRowClassName={ getBackgroundColor }
                                updateDatagridConfig={ config => props.updateAddTripDatagridConfig(config) }
                                rowCount={ tripsTotal }
                                toolbar={ () => null }
                                serverSideData
                            />
                        </Drawer>
                        <Box className="add-trip-new-trip-details__container" sx={ { width: `calc(100% - ${drawerOpen ? drawerWidthOpen : drawerWidthClose})` } }>
                            { !loading && props.selectedTrip?.tripInstance && (
                                <NewTripDetails
                                    ref={ newTripDetailsRef }
                                    tripInstance={ props.selectedTrip.tripInstance }
                                />
                            ) }
                        </Box>
                    </Box>
                </div>
                <CustomModal
                    className="change-selected-trip-modal"
                    title="Change Selected Trip"
                    isModalOpen={ isChangeSelectedTripModalOpen }>
                    <ChangeSelectedTripModal
                        changeType="Trip"
                        onConfirmation={ () => {
                            props.updateSelectedAddTrip(selectedAddTrip);
                            setIsChangeSelectedTripModalOpen(false);
                        } }
                        onCancel={ () => setIsChangeSelectedTripModalOpen(false) }
                    />
                </CustomModal>
                <CustomModal
                    className="change-view-modal"
                    title="Change View"
                    isModalOpen={ isChangeViewModalOpen }>
                    <ChangeSelectedTripModal
                        changeType="View"
                        onConfirmation={ () => {
                            setViewType(viewType === ViewType.Route ? ViewType.Trip : ViewType.Route);
                            setIsChangeViewModalOpen(false);
                        } }
                        onCancel={ () => setIsChangeViewModalOpen(false) }
                    />
                </CustomModal>
                <CustomModal
                    className="close-add-trip__modal"
                    title="Add Trip"
                    isModalOpen={ isCloseConfirmationOpen }>
                    <CloseConfirmation onCloseConfirmation={ () => setIsCloseConfirmationOpen(false) } />
                </CustomModal>
            </div>
        </div>
    );
};

SelectAndAddTrip.propTypes = {
    data: PropTypes.object,
    onStepUpdate: PropTypes.func,
    datagridConfig: PropTypes.object.isRequired,
    selectedTrip: PropTypes.object,
    updateAddTripDatagridConfig: PropTypes.func.isRequired,
    updateSelectedAddTrip: PropTypes.func.isRequired,
    header: PropTypes.node,
    updateEnabledAddTripModal: PropTypes.func.isRequired,
    useRouteView: PropTypes.bool.isRequired,
};

SelectAndAddTrip.defaultProps = {
    onStepUpdate: () => { /**/ },
    data: {},
    selectedTrip: null,
    header: null,
};

export default connect(state => ({
    datagridConfig: getAddTripDatagridConfig(state),
    selectedTrip: getSelectedAddTrip(state),
    useRouteView: useRouteView(state),
}), { updateAddTripDatagridConfig, updateSelectedAddTrip, updateEnabledAddTripModal })(SelectAndAddTrip);
