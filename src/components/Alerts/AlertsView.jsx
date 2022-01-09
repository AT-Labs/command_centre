import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { DataGrid } from '@mui/x-data-grid';

import './AlertsView.scss';

const rows = [
    { id: 1, col1: 'Hello', col2: 'World' },
    { id: 2, col1: 'DataGridPro', col2: 'is Awesome' },
    { id: 3, col1: 'MUI', col2: 'is Amazing' },
];

const columns = [
    { field: 'col1', headerName: 'Column 1', width: 150 },
    { field: 'col2', headerName: 'Column 2', width: 150 },
];

const AlertsView = () => (
    <section id="analytics" className="analytics-view">
        <div className="p-4">
            <h1>Alerts</h1>
            <h5 className="font-normal">Section description here!</h5>
            <div style={ { height: 300, width: '100%' } }>
                <DataGrid rows={ rows } columns={ columns } />
            </div>
        </div>
    </section>
);

export default connect(null, null)(AlertsView);
