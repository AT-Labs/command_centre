import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty, size, filter, isNull } from 'lodash-es';
import moment from 'moment-timezone';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ReadMore from '@mui/icons-material/ReadMore';
import { GridFooterContainer, GridFooter } from '@mui/x-data-grid-pro';
import AlertMessage from '../../../Common/AlertMessage/AlertMessage';
import AddRecurringCancellationModal from './AddRecurringCancellationModal';
import RecurringCancellationFooter from './RecurringCancellationFooter';
import CustomDataGrid from '../../../Common/CustomDataGrid/CustomDataGrid';
import {
    retrieveRecurringCancellations,
    updateRecurringCancellationsDatagridConfig,
    checkTripInstance,
    recurringCancellationRedirection,
} from '../../../../redux/actions/control/routes/recurringCancellations';
import { clearStatusMessage } from '../../../../redux/actions/control/routes/addRecurringCancellations';
import { getClosestTimeValueForFilter } from '../../../../utils/helpers';
import {
    getRecurringCancellations,
    getRecurringCancellationsDatagridConfig,
    isRecurringCancellationUpdateAllowed,
    getRecurringCancellationRedirectionStatus,
} from '../../../../redux/selectors/control/routes/recurringCancellations';
import { getAgencies } from '../../../../redux/selectors/control/agencies';
import { getServiceDate } from '../../../../redux/selectors/control/serviceDate';
import { getAddRecurringCancellationMessage } from '../../../../redux/selectors/control/routes/addRecurringCancellations';
import { retrieveAgencies } from '../../../../redux/actions/control/agencies';
import { goToRoutesView } from '../../../../redux/actions/control/link';
import { displayRecurrentDays } from '../../../../utils/recurrence';
import { SERVICE_DATE_FORMAT, PAGE_SIZE } from '../../../../utils/control/routes';
import DATE_TYPE from '../../../../types/date-types';
import { DATE_FORMAT_DDMMYYYY, dateTimeFormat } from '../../../../utils/dateUtils';
import { isRecurringCancellationUpdatePermitted } from '../../../../utils/user-permissions';

import './RecurringCancellationsView.scss';

export const RecurringCancellationsView = (props) => {
    const { recurringCancellations } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [actionState, setActionState] = useState({
        isEdit: false,
        isDelete: false,
        isRedirectionWarning: false,
        isUploadFile: false,
    });
    const [rowData, setRowData] = useState(null);
    const [multipleRowData, setMultipleRowRowData] = useState([]);
    const [selectedRow, setSelectedRow] = React.useState([]);

    const onNewCancellationModalOpen = () => {
        setActionState({
            isEdit: false,
            isDelete: false,
            isRedirectionWarning: false,
            isUploadFile: false,
        });
        setIsOpen(true);
    };

    const openEditModal = (allData) => {
        setActionState({
            isEdit: true,
            isDelete: false,
            isRedirectionWarning: false,
            isUploadFile: false,
        });
        setRowData(allData);
        setIsOpen(true);
    };

    const openDeleteModal = (allData) => {
        setMultipleRowRowData([]);
        setActionState({
            isEdit: false,
            isDelete: true,
            isRedirectionWarning: false,
            isUploadFile: false,
        });
        setRowData(allData);
        setIsOpen(true);
    };

    const openDeleteModalforCheckBox = (allData) => {
        setMultipleRowRowData(allData);
        setActionState({
            isEdit: false,
            isDelete: true,
            isRedirectionWarning: false,
            isUploadFile: false,
        });
        setIsOpen(true);
    };

    const deselectAllRecurringCancellations = () => {
        setSelectedRow([]);
    };

    const openUploadFileModal = () => {
        setActionState({
            isEdit: false,
            isDelete: false,
            isUploadFile: true,
            isRedirectionWarning: false,
        });
        setIsOpen(true);
    };

    const checkTripExistence = (data) => {
        const { routeShortName, routeVariantId, agencyId, routeType, startTime } = data;
        const splitStartTime = startTime.split(':');
        const formattedStartTime = `${splitStartTime[0]}:${splitStartTime[1]}`;
        const tripsArgs = {
            serviceDate: moment(props.serviceDate).format(SERVICE_DATE_FORMAT),
            agencyId,
            depotIds: [],
            routeType,
            isGroupedByRoute: false,
            isGroupedByRouteVariant: false,
            startTimeFrom: formattedStartTime,
            startTimeTo: formattedStartTime,
            tripStatus: '',
            routeShortName,
            routeVariantId,
            trackingStatuses: [],
            sorting: { sortBy: 'startTime', order: 'asc' },
            delayRange: { min: null, max: null },
            page: 1,
            limit: PAGE_SIZE,
        };

        if (routeVariantId) {
            tripsArgs.routeVariantIds = [routeVariantId];
        }
        props.checkTripInstance(tripsArgs, startTime);
    };

    const getActionsButtons = (params) => {
        const { row: { allData } } = params;

        return (
            <>
                <div>
                    <Button
                        size="small"
                        variant="contained"
                        endIcon={ <ReadMore /> }
                        onClick={ () => checkTripExistence(allData) }
                    >
                        View Trip
                    </Button>
                </div>
                { isRecurringCancellationUpdatePermitted(allData) && (
                    <>
                        <div id="recurring-cancellation-edit-button">
                            <IconButton
                                color="default"
                                aria-label="edit"
                                onClick={ () => openEditModal(allData) }
                            >
                                <EditIcon />
                            </IconButton>
                        </div>
                        <div id="recurring-cancellation-delete-button">
                            <IconButton
                                color="error"
                                aria-label="delete"
                                onClick={ () => openDeleteModal(allData) }
                            >
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    </>
                )}
            </>
        );
    };

    useEffect(() => {
        props.retrieveRecurringCancellations();
    }, [props.recurringCancellationMessage]);

    useEffect(() => {
        if (isEmpty(props.operators)) props.retrieveAgencies();
    }, []);

    useEffect(() => {
        const { status, data } = props.redirectionStatus;
        if (status) {
            const trip = {
                routeVariantId: data.routeVariantId,
                routeType: data.routeType,
                startTime: data.startTime,
                routeShortName: data.routeShortName,
                agencyId: data.agencyId,
                tripStartDate: null,
                tripStartTime: null,
            };

            const filterObj = {
                routeType: data.routeType,
                startTimeFrom: getClosestTimeValueForFilter(data.startTime),
                startTimeTo: '',
                tripStatus: data.status,
                agencyId: data.agencyId,
                routeShortName: data.routeShortName,
                routeVariantId: data.routeVariantId,
            };
            props.goToRoutesView(trip, filterObj);
            props.recurringCancellationRedirection(null, null);
        }

        if (status === false) {
            setActionState({
                isEdit: false,
                isDelete: false,
                isRedirectionWarning: true,
            });
            setIsOpen(true);
            props.recurringCancellationRedirection(null, null);
        }
    }, [props.redirectionStatus]);

    const enrichRecurringCancellations = () => {
        const { operators } = props;
        return operators.length
            ? recurringCancellations.map(recurringCancellation => ({
                ...recurringCancellation,
                operator: filter(
                    operators,
                    ope => ope.agencyId === recurringCancellation.agencyId,
                )[0]?.agencyName,
            }))
            : recurringCancellations;
    };

    const getPageData = () => enrichRecurringCancellations().map(recurringCancellation => ({
        id: recurringCancellation.id,
        operator: recurringCancellation.operator,
        route: recurringCancellation.routeShortName,
        routeVariantId: recurringCancellation.routeVariantId,
        startTime: recurringCancellation.startTime,
        cancel_from: moment(recurringCancellation.cancelFrom),
        cancel_to: moment(recurringCancellation.cancelTo),
        recurrence: displayRecurrentDays(recurringCancellation.dayPattern),
        lastUpdated: moment.tz(recurringCancellation.updatedTimestamp, DATE_TYPE.TIME_ZONE),
        updatedBy: recurringCancellation.updatedBy,
        goToRoutesView: props.goToRoutesView,
        allData: recurringCancellation,
    }));

    const getColumns = () => [
        {
            field: 'routeVariantId',
            headerName: 'ROUTE VARIANT',
            width: 150,
        },
        {
            field: 'operator',
            headerName: 'OPERATOR',
            width: 200,
            valueOptions: props.operators?.map(agency => agency.agencyName) || [],
            type: 'singleSelect',
        },
        {
            field: 'route',
            headerName: 'ROUTE',
            width: 150,
        },
        {
            field: 'startTime',
            headerName: 'START TIME',
            width: 150,
        },
        {
            field: 'cancel_from',
            headerName: 'CANCEL FROM',
            width: 150,
            type: 'date',
            valueFormatter: params => params.value.format(DATE_FORMAT_DDMMYYYY),
        },
        {
            field: 'cancel_to',
            headerName: 'CANCEL TO',
            width: 150,
            type: 'date',
            valueFormatter: params => params.value.format(DATE_FORMAT_DDMMYYYY),
        },
        {
            field: 'recurrence',
            headerName: 'RECURRENCE',
            width: 200,
        },
        {
            field: 'lastUpdated',
            headerName: 'LAST UPDATED',
            width: 150,
            type: 'dateTime',
            valueFormatter: params => params.value.format(dateTimeFormat),
        },
        {
            field: 'updatedBy',
            headerName: 'UPDATED BY',
            width: 200,
        },
        {
            field: 'action',
            headerName: 'ACTION',
            width: 200,
            renderCell: getActionsButtons,
        },
    ];

    const renderCustomFooter = () => (
        <GridFooterContainer>
            <RecurringCancellationFooter
                selectedRow={ selectedRow }
                deselectAllRecurringCancellations={ () => deselectAllRecurringCancellations() }
                onClick={ () => openDeleteModalforCheckBox(selectedRow) }
            />
            <GridFooter />
        </GridFooterContainer>
    );

    return (
        <div className="recurring-cancellations-view">
            <div className="recurring-cancellations-view__header mb-3">
                <div>
                    <h1>Recurring Cancellations</h1>
                </div>
                { props.isRecurringCancellationUpdateAllowed && (
                    <div className="d-flex justify-content-end align-items-center">
                        <Button
                            id="upload-recurring-cancellation-file"
                            className="cc-btn-primary mr-2"
                            onClick={ () => openUploadFileModal() }>
                            Upload File
                        </Button>
                        <Button
                            id="add-new-recurring-cancellation-button"
                            className="cc-btn-primary"
                            onClick={ () => onNewCancellationModalOpen() }>
                            Add new cancellation schedule
                        </Button>
                    </div>
                )}
            </div>
            <AddRecurringCancellationModal
                actionState={ actionState }
                rowData={ rowData }
                multipleRowData={ multipleRowData }
                className="update-recurring-cancellation-modal"
                permission={ props.isRecurringCancellationUpdateAllowed }
                isModalOpen={ isOpen }
                onClose={ () => {
                    setIsOpen(false);
                } } />
            <div>
                <div className="fixed-bottom">
                    <>
                        {!isNull(props.recurringCancellationMessage.recurringCancellationId) && (
                            <AlertMessage
                                message={ {
                                    id: `${props.recurringCancellationMessage.recurringCancellationId}`,
                                    type: props.recurringCancellationMessage.resultStatus,
                                    body: props.recurringCancellationMessage.resultMessage,
                                } }
                                onClose={ () => props.clearStatusMessage() }
                            />
                        )}
                    </>
                </div>
                <CustomDataGrid
                    columns={ getColumns() }
                    datagridConfig={ props.recurringCancellationDatagridConfig }
                    dataSource={ getPageData() }
                    updateDatagridConfig={ config => props.updateRecurringCancellationsDatagridConfig(config) }
                    getRowId={ row => row.id }
                    rowCount={ recurringCancellations.length }
                    onChangeSelectedData={ x => setSelectedRow([...x]) }
                    selectionModel={ selectedRow }
                    checkboxSelection={ props.isRecurringCancellationUpdateAllowed }
                    customFooter={ size(selectedRow) > 0 ? renderCustomFooter : undefined }
                />
            </div>
        </div>
    );
};

RecurringCancellationsView.propTypes = {
    goToRoutesView: PropTypes.func.isRequired,
    recurringCancellations: PropTypes.array,
    operators: PropTypes.array.isRequired,
    retrieveAgencies: PropTypes.func.isRequired,
    recurringCancellationDatagridConfig: PropTypes.object.isRequired,
    updateRecurringCancellationsDatagridConfig: PropTypes.func.isRequired,
    retrieveRecurringCancellations: PropTypes.func.isRequired,
    clearStatusMessage: PropTypes.func.isRequired,
    recurringCancellationMessage: PropTypes.object.isRequired,
    isRecurringCancellationUpdateAllowed: PropTypes.bool,
    checkTripInstance: PropTypes.func.isRequired,
    recurringCancellationRedirection: PropTypes.func.isRequired,
    redirectionStatus: PropTypes.object.isRequired,
    serviceDate: PropTypes.string.isRequired,
};

RecurringCancellationsView.defaultProps = {
    recurringCancellations: [],
    isRecurringCancellationUpdateAllowed: false,
};

export default connect(
    state => ({
        recurringCancellations: getRecurringCancellations(state),
        operators: getAgencies(state),
        recurringCancellationDatagridConfig: getRecurringCancellationsDatagridConfig(state),
        recurringCancellationMessage: getAddRecurringCancellationMessage(state),
        isRecurringCancellationUpdateAllowed: isRecurringCancellationUpdateAllowed(state),
        redirectionStatus: getRecurringCancellationRedirectionStatus(state),
        serviceDate: getServiceDate(state),
    }),
    {
        goToRoutesView,
        retrieveAgencies,
        updateRecurringCancellationsDatagridConfig,
        retrieveRecurringCancellations,
        clearStatusMessage,
        checkTripInstance,
        recurringCancellationRedirection,
    },
)(RecurringCancellationsView);
