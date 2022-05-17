import React from 'react';
import PropTypes from 'prop-types';
import {
    DataGridPro, GridToolbarExport, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton,
    GridToolbarDensitySelector, useGridApiRef, GRID_DETAIL_PANEL_TOGGLE_COL_DEF, GridLinkOperator,
} from '@mui/x-data-grid-pro';
import DateAdapter from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Overlay from '../Overlay/Overlay';

import './CustomDataGrid.scss';

export const CustomDataGrid = (props) => {
    const apiRef = useGridApiRef();

    const CustomToolbar = toolbarProps => (
        <GridToolbarContainer { ...toolbarProps }>
            <GridToolbarColumnsButton />
            <GridToolbarFilterButton />
            <GridToolbarDensitySelector />
            <GridToolbarExport printOptions={ { disableToolbarButton: true } } />
        </GridToolbarContainer>
    );

    const getColumns = () => {
        if (props.datagridConfig?.columns?.length > 0) return props.datagridConfig.columns;

        if (!props.getDetailPanelContent) return props.columns;

        return [
            ...props.columns,
            {
                ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
                type: 'string',
                headerName: 'EXPAND ROW',
                renderHeader: () => (<span />),
            },
        ];
    };

    const getNoRowsOverlay = () => <Overlay message="No records found." />;

    const getNoResultsOverlay = () => (
        <Overlay message="No results found for the criteria." />
    );

    const dataGridSave = (gridApi) => {
        const data = {
            density: gridApi.state.density.value,
            columns: gridApi.getAllColumns(),
        };
        props.updateDatagridConfig(data);
    };

    React.useEffect(() => {
        const columnVisChangeEvent = apiRef.current.subscribeEvent('columnVisibilityChange', () => {
            dataGridSave(apiRef.current);
        });

        const colOrderChangeEvent = apiRef.current.subscribeEvent('columnOrderChange', () => {
            dataGridSave(apiRef.current);
        });

        const colResizeStopEvent = apiRef.current.subscribeEvent('columnResizeStop', () => {
            dataGridSave(apiRef.current);
        });

        return () => {
            columnVisChangeEvent();
            colOrderChangeEvent();
            colResizeStopEvent();
        };
    }, [apiRef]);

    React.useEffect(() => {
        const stateChangeEvent = apiRef.current.subscribeEvent('stateChange', () => {
            if (props.datagridConfig.density !== apiRef.current.state.density.value) {
                dataGridSave(apiRef.current);
            }
        });

        return () => {
            stateChangeEvent();
        };
    });

    const getDetailPanelHeight = React.useCallback(() => props.detailPanelHeight, [props.detailPanelHeight]);

    return (
        <div className="customDataGrid">
            <LocalizationProvider dateAdapter={ DateAdapter }>
                <DataGridPro
                    components={ {
                        Toolbar: props.toolbar ?? CustomToolbar,
                        NoRowsOverlay: getNoRowsOverlay,
                        NoResultsOverlay: getNoResultsOverlay,
                    } }
                    componentsProps={ {
                        filterPanel: {
                            linkOperators: [GridLinkOperator.And],
                        },
                    } }
                    apiRef={ apiRef }
                    page={ props.datagridConfig.page }
                    pageSize={ props.datagridConfig.pageSize }
                    rowsPerPageOptions={ [15, 25, 50, 100] }
                    onPageSizeChange={ newPageSize => props.updateDatagridConfig({ pageSize: newPageSize }) }
                    rows={ props.dataSource }
                    columns={ getColumns() }
                    sortModel={ props.datagridConfig.sortModel }
                    onSortModelChange={ model => props.updateDatagridConfig({ sortModel: model }) }
                    filterModel={ props.datagridConfig.filterModel }
                    onFilterModelChange={ model => props.updateDatagridConfig({ filterModel: model }) }
                    density={ props.datagridConfig.density }
                    onPinnedColumnsChange={ model => props.updateDatagridConfig({ pinnedColumns: model }) }
                    pinnedColumns={ props.datagridConfig.pinnedColumns }
                    onPageChange={ page => props.updateDatagridConfig({ page }) }
                    pagination
                    getDetailPanelContent={ props.getDetailPanelContent }
                    getDetailPanelHeight={ getDetailPanelHeight }
                    disableSelectionOnClick={ props.disableSelectionOnClick }
                    getRowId={ props.getRowId }
                    filterMode={ props.serverSideData ? 'server' : 'client' }
                    paginationMode={ props.serverSideData ? 'server' : 'client' }
                    sortingMode={ props.serverSideData ? 'server' : 'client' }
                    rowCount={ props.rowCount }
                    getRowClassName={ params => props.getRowClassName(params) }
                />
            </LocalizationProvider>
        </div>
    );
};

CustomDataGrid.propTypes = {
    datagridConfig: PropTypes.object,
    updateDatagridConfig: PropTypes.func.isRequired,
    dataSource: PropTypes.array,
    columns: PropTypes.array,
    toolbar: PropTypes.object,
    getDetailPanelContent: PropTypes.func,
    detailPanelHeight: PropTypes.number,
    disableSelectionOnClick: PropTypes.bool,
    getRowId: PropTypes.func,
    rowCount: PropTypes.number,
    serverSideData: PropTypes.bool,
    getRowClassName: PropTypes.func,
};

CustomDataGrid.defaultProps = {
    dataSource: [],
    datagridConfig: {},
    columns: [],
    toolbar: null,
    getDetailPanelContent: null,
    detailPanelHeight: 300,
    disableSelectionOnClick: true,
    getRowId: null,
    rowCount: 0,
    serverSideData: false,
    getRowClassName: () => '',
};

export default CustomDataGrid;
