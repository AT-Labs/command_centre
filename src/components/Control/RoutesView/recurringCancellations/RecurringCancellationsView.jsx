import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import moment from 'moment-timezone';
import Button from '@mui/material/Button';
import ReadMore from '@mui/icons-material/ReadMore';
import CustomDataGrid from '../../../Common/CustomDataGrid/CustomDataGrid';
import { retrieveRecurringCancellations, updateRecurringCancellationsDatagridConfig } from '../../../../redux/actions/control/routes/recurringCancellations';
import { getClosestTimeValueForFilter } from '../../../../utils/helpers';
import {
    getRecurringCancellations,
    getRecurringCancellationsDatagridConfig,
} from '../../../../redux/selectors/control/routes/recurringCancellations';
import { getAgencies } from '../../../../redux/selectors/control/agencies';
import { retrieveAgencies } from '../../../../redux/actions/control/agencies';
import { goToRoutesView } from '../../../../redux/actions/control/link';
import { displayRecurrentDays } from '../../../../utils/recurrence';

import './RecurringCancellationsView.scss';

export const RecurringCancellationsView = (props) => {
    const { recurringCancellations } = props;
    const dateFormat = 'DD/MM/YY hh:mm a';
    const [operatorsList, setOperatorsList] = useState([]);

    const getActionsButtons = (params) => {
        const { row: { routeVariantId, startTime } } = params;

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
                <Button
                    size="small"
                    variant="contained"
                    endIcon={ <ReadMore /> }
                    onClick={ () => props.goToRoutesView(trip, filter) }
                >
                    View Trip
                </Button>
            </>
        );
    };

    const RECURRING_CANCELLATION_COLUMNS = [
        {
            field: 'routeVariantId',
            headerName: 'ROUTE VARIANT',
            width: 150,
        },
        { field: 'operator', headerName: 'OPERATOR', width: 150 },
        {
            field: 'route',
            headerName: 'ROUTE',
            width: 250,
        },
        {
            field: 'startTime',
            headerName: 'START TIME',
            width: 150,
        },
        {
            field: 'cancel_from',
            headerName: 'CANCEL FROM',
            width: 200,
            type: 'dateTime',
            valueFormatter: params => params.value.format(dateFormat),
        },
        {
            field: 'cancel_to',
            headerName: 'CANCEL TO',
            width: 200,
            type: 'dateTime',
            valueFormatter: params => (params.value === '' ? '' : params.value.format(dateFormat)),
        },
        {
            field: 'recurrence',
            headerName: 'RECURRENCE',
            width: 200,
        },
        {
            field: 'action',
            headerName: 'ACTION',
            width: 150,
            renderCell: getActionsButtons,
        },
    ];

    useEffect(() => {
        props.retrieveRecurringCancellations();
    }, []);

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
        id: recurringCancellation.routeVariantId.toString() + recurringCancellation.startTime.toString(),
        operator: recurringCancellation.operator,
        route: recurringCancellation.routeShortName,
        routeVariantId: recurringCancellation.routeVariantId,
        startTime: recurringCancellation.startTime,
        cancel_from: moment(recurringCancellation.cancelFrom),
        cancel_to: recurringCancellation.cancelTo ? moment(recurringCancellation.cancelTo) : '',
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

    return (
        <div className="recurring-cancellations-view">
            <div className="mb-3">
                <h1>Recurring Cancellations</h1>
            </div>
            <CustomDataGrid
                columns={ getColumns() }
                datagridConfig={ props.recurringCancellationDatagridConfig }
                dataSource={ getPageData() }
                updateDatagridConfig={ config => props.updateRecurringCancellationsDatagridConfig(config) }
                getRowId={ row => row.id }
                rowCount={ recurringCancellations.length }
            />
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
};

RecurringCancellationsView.defaultProps = {
    recurringCancellations: [],
};

export default connect(
    state => ({
        recurringCancellations: getRecurringCancellations(state),
        operators: getAgencies(state),
        recurringCancellationDatagridConfig: getRecurringCancellationsDatagridConfig(state),
    }),
    {
        goToRoutesView,
        retrieveAgencies,
        updateRecurringCancellationsDatagridConfig,
        retrieveRecurringCancellations,
    },
)(RecurringCancellationsView);
