import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Container, Tooltip } from '@mui/material';
import { GridFooterContainer } from '@mui/x-data-grid-pro';
import { isEmpty } from 'lodash-es';
import CustomDataGrid from '../../../Common/CustomDataGrid/CustomDataGrid';
import { getChildStops, getAllStops } from '../../../../redux/selectors/static/stops';
import { getAllRoutes } from '../../../../redux/selectors/static/routes';
import { getAffectedRoutes, getAffectedStops, getStopsByRoute } from '../../../../redux/selectors/control/disruptions';
import { fetchAndProcessPassengerImpactData, WEEKDAYS } from '../../../../utils/control/disruption-passenger-impact';
import { DISRUPTION_TYPE } from '../../../../types/disruptions-types';
import { STOP_NOT_AVAILABLE } from '../../../../constants/disruptions';

import './PassengerImpactGrid.scss';

const weekdayGridColumns = Object.values(WEEKDAYS).map(weekDay => ({
    field: weekDay.name,
    headerName: weekDay.init,
    width: 50,
}));

const renderCellWithTooltip = params => params.value && (
    <Tooltip title={ params.value }>
        <span className="cel-wrapper">{params.value}</span>
    </Tooltip>
);

const formatParentStopColumn = params => params.row.parentStopCode && `${params.row.parentStopCode}-${params.row.parentStopName}`;

const formatStopColumn = params => (params.row.stopCode && params.row.stopName === STOP_NOT_AVAILABLE ? `[${params.row.stopCode}] ${STOP_NOT_AVAILABLE}` : params.row.stopCode && `${params.row.stopCode}-${params.row.stopName}`);

const PASSENGER_IMPACT_GRID_COLUMNS = {
    [DISRUPTION_TYPE.ROUTES]: [
        {
            field: 'routeShortName',
            headerName: 'Route',
            width: 120,
            renderCell: renderCellWithTooltip,
        },
        {
            field: 'parentStopCode',
            headerName: 'Parent Stop',
            width: 120,
            valueGetter: formatParentStopColumn,
            renderCell: renderCellWithTooltip,
        },
        {
            field: 'stopCode',
            headerName: 'Stop',
            width: 120,
            valueGetter: formatStopColumn,
            renderCell: renderCellWithTooltip,
        },
        ...weekdayGridColumns,
    ],
    [DISRUPTION_TYPE.STOPS]: [
        {
            field: 'parentStopCode',
            headerName: 'Stop',
            width: 120,
            valueGetter: formatParentStopColumn,
            renderCell: renderCellWithTooltip,
        },
        {
            field: 'routeShortName',
            headerName: 'Route',
            width: 120,
            renderCell: renderCellWithTooltip,
        },
        ...weekdayGridColumns,
    ],
};

export const PassengerImpactGrid = (props) => {
    const datagridConfig = {
        density: 'standard',
    };

    const [passengerCountData, setPassengerCountData] = useState({ grid: [], total: 0 });
    const [isLoading, setIsLoading] = useState(true);

    const { affectedRoutes, affectedStops, childStops, disruptionData, onUpdatePassengerImpactState, onUpdatePassengerImpactData, allRoutes, allStops, stopsByRoute } = props;

    const refreshPassengerCountData = async () => {
        const aggregatedPassengerImpactData = await fetchAndProcessPassengerImpactData(
            disruptionData,
            affectedRoutes,
            affectedStops,
            childStops,
            allRoutes,
            allStops,
            stopsByRoute,
        );
        setPassengerCountData(aggregatedPassengerImpactData);
        onUpdatePassengerImpactState(aggregatedPassengerImpactData.grid.length > 0);
        onUpdatePassengerImpactData(aggregatedPassengerImpactData);
        setIsLoading(false);
    };

    useEffect(
        refreshPassengerCountData,
        [affectedRoutes, affectedStops, disruptionData.startDate, disruptionData.startTime, disruptionData.endDate, disruptionData.endTime, disruptionData.disruptionType],
    );

    const customFooter = () => (
        <GridFooterContainer>
            Total Impacted Passenger Count:
            {' '}
            { passengerCountData.total }
        </GridFooterContainer>
    );

    const groupingColDef = {
        headerName: '',
        hideDescendantCount: true,
        valueFormatter: () => '',
        width: 30,
    };

    const disruptionType = disruptionData.disruptionType || (isEmpty(affectedRoutes) && !isEmpty(affectedStops) ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES);

    return (
        <Container className="passenger-imact-grid">
            <h2 className="pl-4 pr-4">Passenger Impact</h2>
            <p className="font-weight-light">Estimates are based on the disruption details and typical passenger counts over the last 90 days.</p>
            <p className="font-weight-light">For recurring disruptions, the estimate is per day rather than over the disruption.</p>
            <CustomDataGrid
                columns={ PASSENGER_IMPACT_GRID_COLUMNS[disruptionType] }
                datagridConfig={ datagridConfig }
                dataSource={ passengerCountData.grid }
                getRowId={ row => row.id }
                toolbar={ () => null }
                updateDatagridConfig={ () => null }
                treeData
                getTreeDataPath={ row => row.path }
                autoHeight={ false }
                gridClassNames=""
                pagination={ false }
                groupingColDef={ groupingColDef }
                customFooter={ customFooter }
                loading={ isLoading }
            />
        </Container>
    );
};

PassengerImpactGrid.propTypes = {
    affectedStops: PropTypes.array,
    affectedRoutes: PropTypes.array,
    allRoutes: PropTypes.object.isRequired,
    allStops: PropTypes.object.isRequired,
    disruptionData: PropTypes.object.isRequired,
    onUpdatePassengerImpactState: PropTypes.func,
    onUpdatePassengerImpactData: PropTypes.func,
    childStops: PropTypes.object.isRequired,
    stopsByRoute: PropTypes.object.isRequired,
};

PassengerImpactGrid.defaultProps = {
    affectedStops: [],
    affectedRoutes: [],
    onUpdatePassengerImpactState: () => null,
    onUpdatePassengerImpactData: () => null,
};

export default connect(state => ({
    affectedStops: getAffectedStops(state),
    affectedRoutes: getAffectedRoutes(state),
    childStops: getChildStops(state),
    allRoutes: getAllRoutes(state),
    allStops: getAllStops(state),
    stopsByRoute: getStopsByRoute(state),
}), null)(PassengerImpactGrid);
