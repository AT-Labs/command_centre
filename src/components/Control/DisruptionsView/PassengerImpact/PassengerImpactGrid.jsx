import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { Container } from '@mui/material';
import { GridFooterContainer } from '@mui/x-data-grid-pro';
import CustomDataGrid from '../../../Common/CustomDataGrid/CustomDataGrid';
import { getChildStops, getAllStops } from '../../../../redux/selectors/static/stops';
import { getAllRoutes } from '../../../../redux/selectors/static/routes';
import { getAffectedRoutes, getAffectedStops } from '../../../../redux/selectors/control/disruptions';
import { PASSENGER_IMPACT_GRID_COLUMNS, fetchAndProcessPassengerImpactData } from '../../../../utils/control/disruption-passenger-impact';
import './PassengerImpactGrid.scss';

export const PassengerImpactGrid = (props) => {
    const datagridConfig = {
        density: 'standard',
    };

    const [passengerCountData, setPassengerCountData] = useState({ grid: [], total: 0 });

    const { affectedRoutes, affectedStops, childStops, disruptionData, onUpdatePassengerImpactState, onUpdatePassengerImpactData, allRoutes, allStops } = props;

    const refreshPassengerCountData = async () => {
        const aggregatedPassengerImpactData = await fetchAndProcessPassengerImpactData(disruptionData, affectedRoutes, affectedStops, childStops, allRoutes, allStops);
        setPassengerCountData(aggregatedPassengerImpactData);
        onUpdatePassengerImpactState(aggregatedPassengerImpactData.grid.length > 0);
        onUpdatePassengerImpactData(aggregatedPassengerImpactData);
    };

    useEffect(
        refreshPassengerCountData,
        [affectedRoutes, affectedStops, disruptionData.startDate, disruptionData.startTime, disruptionData.endDate, disruptionData.endTime, disruptionData.disruptionType],
    );

    const customFooter = () => (
        <GridFooterContainer>
            Total Impacted Passenger Count:
            { passengerCountData.total }
        </GridFooterContainer>
    );

    const groupingColDef = {
        headerName: '',
        hideDescendantCount: true,
        valueFormatter: () => '',
        width: 30,
    };

    return (
        <Container className="passenger-imact-grid">
            <h2 className="pl-4 pr-4">Passenger Impact</h2>
            <p className="font-weight-light">Estimates are based on the disruption details and typical passenger counts over the last 90 days.</p>
            <p className="font-weight-light">For recurring disruptions, the estimate is per day rather than over the disruption.</p>
            <CustomDataGrid
                columns={ PASSENGER_IMPACT_GRID_COLUMNS[disruptionData.disruptionType] }
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
}), null)(PassengerImpactGrid);
