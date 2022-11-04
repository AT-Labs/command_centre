import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import moment from 'moment-timezone';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ReadMore from '@mui/icons-material/ReadMore';
import AlertMessage from '../../../Common/AlertMessage/AlertMessage';
import AddRecurringCancellationModal from './AddRecurringCancellationModal';
import RecurringCancellationFooter from './RecurringCancellationFooter';
import CustomDataGrid from '../../../Common/CustomDataGrid/CustomDataGrid';
import { retrieveRecurringCancellations, updateRecurringCancellationsDatagridConfig } from '../../../../redux/actions/control/routes/recurringCancellations';
import { clearStatusMessage } from '../../../../redux/actions/control/routes/addRecurringCancellations';
import { getClosestTimeValueForFilter } from '../../../../utils/helpers';
import {
    getRecurringCancellations,
    getRecurringCancellationsDatagridConfig,
    isRecurringCancellationUpdateAllowed,
} from '../../../../redux/selectors/control/routes/recurringCancellations';
import { getAgencies } from '../../../../redux/selectors/control/agencies';
import { getAddRecurringCancellationMessage } from '../../../../redux/selectors/control/routes/addRecurringCancellations';
import { retrieveAgencies } from '../../../../redux/actions/control/agencies';
import { goToRoutesView } from '../../../../redux/actions/control/link';
import { displayRecurrentDays } from '../../../../utils/recurrence';
import { DATE_FORMAT_DDMMYYYY } from '../../../../utils/dateUtils';

import './RecurringCancellationsView.scss';

export const RecurringCancellationsView = (props) => {
    const { recurringCancellations } = props;
    const [isOpen, setIsOpen] = useState(false);
    const [actionState, setActionState] = useState({
        isEdit: false,
        isDelete: false,
        isUploadFile: false,
    });
    const [rowData, setRowData] = useState(null);
    const [multipleRowData, setMultipleRowRowData] = useState([]);
    const [selectedRow, setSelectedRow] = React.useState([]);
    const [operatorsList, setOperatorsList] = useState([]);

    const onNewCancellationModalOpen = () => {
        setActionState({
            isEdit: false,
            isDelete: false,
            isUploadFile: false,
        });
        setIsOpen(true);
    };

    const openEditModal = (allData) => {
        setActionState({ isEdit: true, isDelete: false, isUploadFile: false });
        setRowData(allData);
        setIsOpen(true);
    };

    const openDeleteModal = (allData) => {
        setActionState({ isEdit: false, isDelete: true, isUploadFile: false });
        setRowData(allData);
        setIsOpen(true);
    };

    const openDeleteModalforCheckBox = (allData) => {
        setMultipleRowRowData(allData);
        setActionState({ isEdit: false, isDelete: true, isUploadFile: false });
        setIsOpen(true);
    };

    const deselectAllRecurringCancellations = () => {
        setSelectedRow([]);
    };

    const openUploadFileModal = () => {
        setActionState({ isEdit: false, isDelete: false, isUploadFile: true });
        setIsOpen(true);
    };

    const getActionsButtons = (params) => {
        const { row: { routeVariantId, startTime, allData } } = params;

        const trip = {
            routeVariantId,
            routeType: null,
            startTime,
            routeShortName: null,
            agencyId: null,
            tripStartDate: null,
            tripStartTime: null,
        };

        const filter = {
            routeType: null,
            startTimeFrom: getClosestTimeValueForFilter(startTime),
            startTimeTo: '',
            tripStatus: '',
            agencyId: '',
            routeShortName: null,
            routeVariantId,
        };

        return (
            <>
                <div>
                    <Button
                        size="small"
                        variant="contained"
                        endIcon={ <ReadMore /> }
                        onClick={ () => props.goToRoutesView(trip, filter) }
                    >
                        View Trip
                    </Button>
                </div>
                { props.isRecurringCancellationUpdateAllowed && (
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

    const RECURRING_CANCELLATION_COLUMNS = [
        {
            field: 'routeVariantId',
            headerName: 'ROUTE VARIANT',
            width: 150,
        },
        { field: 'operator', headerName: 'OPERATOR', width: 200 },
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
            field: 'action',
            headerName: 'ACTION',
            width: 200,
            renderCell: getActionsButtons,
        },
    ];

    useEffect(() => {
        props.retrieveRecurringCancellations();
    }, [props.recurringCancellationMessage]);

    useEffect(() => {
        const operators = [];
        if (_.isEmpty(props.operators)) props.retrieveAgencies();
        props.operators.forEach(element => operators.push(element.agencyName));
        setOperatorsList(operators);
    }, [props.operators]);

    const enrichRecurringCancellations = () => {
        const { operators } = props;
        return operators.length
            ? recurringCancellations.map(recurringCancellation => ({
                ...recurringCancellation,
                operator: _.filter(
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
        goToRoutesView: props.goToRoutesView,
        allData: recurringCancellation,
    }));

    const getColumns = () => {
        if (props.recurringCancellationDatagridConfig.columns.length > 0) return props.recurringCancellationDatagridConfig.columns;

        const operatorColumn = RECURRING_CANCELLATION_COLUMNS.find(
            column => column.field === 'operator',
        );

        const operatorColIndex = RECURRING_CANCELLATION_COLUMNS.findIndex(
            col => col.field === 'operator',
        );

        RECURRING_CANCELLATION_COLUMNS[operatorColIndex] = {
            ...operatorColumn,
            valueOptions: operatorsList,
            type: 'singleSelect',
        };

        return RECURRING_CANCELLATION_COLUMNS;
    };

    const renderCustomFooter = () => (
        <RecurringCancellationFooter
            selectedRow={ selectedRow }
            deselectAllRecurringCancellations={ () => deselectAllRecurringCancellations() }
            onClick={ () => openDeleteModalforCheckBox(selectedRow) }
        />
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
                        {!_.isNull(props.recurringCancellationMessage.recurringCancellationId) && (
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
                    selectedRow={ selectedRow }
                    checkboxSelection={ props.isRecurringCancellationUpdateAllowed }
                    customFooter={ renderCustomFooter }
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
    }),
    {
        goToRoutesView,
        retrieveAgencies,
        updateRecurringCancellationsDatagridConfig,
        retrieveRecurringCancellations,
        clearStatusMessage,
    },
)(RecurringCancellationsView);
