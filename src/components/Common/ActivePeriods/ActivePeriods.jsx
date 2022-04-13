import React from 'react';
import PropTypes from 'prop-types';
import {
    DataGridPro, GridToolbarContainer, GridToolbarDensitySelector, GridToolbarFilterButton,
} from '@mui/x-data-grid-pro';
import moment from 'moment-timezone';
import DATE_TYPE from '../../../types/date-types';

import './ActivePeriods.scss';
import Overlay from '../Overlay/Overlay';

const ActivePeriods = (props) => {
    const dateFormat = 'DD/MM/YYYY HH:mm';
    const gridColumns = [
        {
            field: 'startTime',
            headerName: 'Start',
            type: 'dateTime',
            flex: 1,
            valueFormatter: params => moment(params.value).tz(DATE_TYPE.TIME_ZONE).format(dateFormat),
            valueGetter: params => moment.unix(params.value).toDate(),
        },
        {
            field: 'endTime',
            headerName: 'End',
            type: 'dateTime',
            flex: 1,
            valueFormatter: params => moment(params.value).tz(DATE_TYPE.TIME_ZONE).format(dateFormat),
            valueGetter: params => moment.unix(params.value).toDate(),
        },
    ];

    const CustomToolbar = () => (
        <GridToolbarContainer>
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
        </GridToolbarContainer>
    );

    const getNoResultsOverlay = () => (
        <Overlay message="No results found for the selected criteria." />
    );

    return (
        <div className="active-periods-view">
            <DataGridPro
                components={ {
                    Toolbar: CustomToolbar,
                    NoResultsOverlay: getNoResultsOverlay,
                } }
                getRowId={ row => row.id ?? row.startTime }
                rows={ props.activePeriods }
                disableSelectionOnClick
                columns={ gridColumns }
                disableColumnPinning
                disableColumnSelector
            />
        </div>
    );
};

ActivePeriods.propTypes = {
    activePeriods: PropTypes.array.isRequired,
};

export default ActivePeriods;
