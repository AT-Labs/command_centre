import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
    DataGridPro, GridToolbarExport, GridToolbarContainer, GridToolbarColumnsButton, GridToolbarFilterButton,
    GridToolbarDensitySelector, useGridApiRef, GRID_DETAIL_PANEL_TOGGLE_COL_DEF, GridLinkOperator,
} from '@mui/x-data-grid-pro';
import DateAdapter from '@mui/lab/AdapterMoment';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import Overlay from '../Overlay/Overlay';

import './CustomDataGrid.scss';
import { DENSITY } from '../../../types/data-grid-types';

export const CustomDataGrid = (props) => {
    const apiRef = useGridApiRef();
    const [selectedRows, setSelectedRows] = useState([]);
    const [currentCellEditParams, setCurrentCellEditParams] = useState(null);

    const CustomToolbar = toolbarProps => (
        <GridToolbarContainer { ...toolbarProps }>
            { props.showStandardToolbarButtons && (
                <>
                    <GridToolbarColumnsButton />
                    <GridToolbarFilterButton />
                    <GridToolbarDensitySelector />
                    <GridToolbarExport printOptions={ { disableToolbarButton: true } } />
                </>
            )}
            { props.toolbarButtons() }
        </GridToolbarContainer>
    );

    const getColumns = () => {
        if (props.datagridConfig?.columns?.length > 0) {
            return props.datagridConfig.columns.map((column) => {
                const foundColumn = props.columns.find(col => column.field === col.field && column.valueOptions !== col.valueOptions);
                if (foundColumn) {
                    const { valueOptions } = foundColumn;
                    return {
                        ...column,
                        valueOptions,
                    };
                }
                return column;
            });
        }

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

    const handleCellEditStart = (params) => {
        setCurrentCellEditParams(params);
    };

    const handleCellEditStop = () => {
        setCurrentCellEditParams(null);
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
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const getRowHeight = () => (props.datagridConfig?.density ? DENSITY[props.datagridConfig.density] : DENSITY.standard);

    const calculateScroll = rowIdx => rowIdx * getRowHeight();
    const calculatePageIdx = rowIdx => Math.floor(rowIdx / props.datagridConfig.pageSize);

    const displaySelectedDetail = (rowsToSelect, overridePageIdx = false) => {
        const idx = apiRef.current.getSortedRowIds().findIndex(rowId => rowId === rowsToSelect[0]);
        const pageIdx = calculatePageIdx(idx);

        setTimeout(() => setSelectedRows(rowsToSelect));

        if (overridePageIdx || pageIdx === props.datagridConfig.page) {
            apiRef.current.setPage(pageIdx);
            setTimeout(() => apiRef.current.scroll({ top: calculateScroll(idx - (pageIdx * props.datagridConfig.pageSize)) }));
        }
    };

    React.useEffect(() => {
        if (props.stopEditing && currentCellEditParams) {
            apiRef.current.commitCellChange(currentCellEditParams); // This commits the edit
            apiRef.current.setCellMode(currentCellEditParams.id, currentCellEditParams.field, 'view');
        }

        if (props.stopEditing) {
            props.editComplete();
        }
    }, [props.stopEditing]);

    React.useEffect(() => {
        if (isInitialLoad && props.dataSource.length > 0 && props.expandedDetailPanels?.length > 0) {
            setTimeout(() => displaySelectedDetail(props.expandedDetailPanels, false));

            setIsInitialLoad(false);
        } else if (props.expandedDetailPanels?.length > 0 && (!selectedRows || !selectedRows.includes(props.expandedDetailPanels[0]))) {
            setTimeout(() => displaySelectedDetail(props.expandedDetailPanels, true));
        }
    }, [props.dataSource, props.expandedDetailPanels]);

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

        const colVisibilityModelChangeEvent = apiRef.current.subscribeEvent('columnVisibilityModelChange', () => {
            dataGridSave(apiRef.current);
        });

        return () => {
            columnVisChangeEvent();
            colOrderChangeEvent();
            colResizeStopEvent();
            colVisibilityModelChangeEvent();
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

    const addServerSideProps = () => (props.serverSideData ? {
        rowCount: props.rowCount,
        filterMode: 'server',
        paginationMode: 'server',
        sortingMode: 'server',
    } : {});

    const expandedRowIdsChanged = (ids) => {
        let updatedIds = ids;

        if (!props.multipleDetailPanelOpen) {
            if (ids.length > 1) {
                updatedIds = [ids[1]];
            }
            if (ids.length === 0) {
                updatedIds = [];
            }
        }

        setSelectedRows(updatedIds);
        props.onRowExpanded(updatedIds);
    };

    return (
        <div className={ `customDataGrid ${props.gridClassNames}` }>
            <LocalizationProvider dateAdapter={ DateAdapter }>
                <DataGridPro
                    { ...addServerSideProps() }
                    components={ {
                        Toolbar: props.toolbar ?? CustomToolbar,
                        NoRowsOverlay: getNoRowsOverlay,
                        NoResultsOverlay: getNoResultsOverlay,
                        Footer: props.customFooter,
                    } }
                    componentsProps={ {
                        filterPanel: {
                            linkOperators: [GridLinkOperator.And],
                        },
                    } }
                    classes={ props.classes }
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
                    pagination={ props.pagination }
                    getDetailPanelContent={ props.getDetailPanelContent }
                    getDetailPanelHeight={ ({ row }) => (props.calculateDetailPanelHeight ? props.calculateDetailPanelHeight(row) : props.detailPanelHeight) }
                    disableSelectionOnClick={ props.disableSelectionOnClick }
                    getRowId={ props.getRowId }
                    getRowClassName={ params => props.getRowClassName(params) }
                    disableVirtualization={ !!props.getDetailPanelContent }
                    onDetailPanelExpandedRowIdsChange={ ids => expandedRowIdsChanged(ids) }
                    detailPanelExpandedRowIds={ selectedRows }
                    checkboxSelection={ props.checkboxSelection }
                    onSelectionModelChange={ newSelectionModel => props.onChangeSelectedData(newSelectionModel) }
                    selectionModel={ props.selectionModel }
                    keepNonExistentRowsSelected={ props.keepNonExistentRowsSelected }
                    hideFooterSelectedRowCount
                    treeData={ props.treeData }
                    getTreeDataPath={ props.getTreeDataPath }
                    autoHeight={ props.autoHeight }
                    groupingColDef={ props.groupingColDef }
                    loading={ props.loading }
                    onCellEditCommit={ props.onCellEditCommit }
                    onCellEditStart={ handleCellEditStart }
                    onCellEditStop={ handleCellEditStop }
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
    toolbar: PropTypes.func,
    getDetailPanelContent: PropTypes.func,
    calculateDetailPanelHeight: PropTypes.func,
    detailPanelHeight: PropTypes.number,
    disableSelectionOnClick: PropTypes.bool,
    getRowId: PropTypes.func,
    rowCount: PropTypes.number,
    serverSideData: PropTypes.bool,
    getRowClassName: PropTypes.func,
    gridClassNames: PropTypes.string,
    multipleDetailPanelOpen: PropTypes.bool,
    expandedDetailPanels: PropTypes.array,
    onRowExpanded: PropTypes.func,
    checkboxSelection: PropTypes.bool,
    onChangeSelectedData: PropTypes.func,
    selectionModel: PropTypes.array,
    keepNonExistentRowsSelected: PropTypes.bool,
    customFooter: PropTypes.func,
    treeData: PropTypes.bool,
    getTreeDataPath: PropTypes.func,
    autoHeight: PropTypes.bool,
    pagination: PropTypes.bool,
    groupingColDef: PropTypes.object,
    loading: PropTypes.bool,
    classes: PropTypes.object,
    onCellEditCommit: PropTypes.func,
    toolbarButtons: PropTypes.func,
    showStandardToolbarButtons: PropTypes.bool,
    stopEditing: PropTypes.bool,
    editComplete: PropTypes.func,
};

CustomDataGrid.defaultProps = {
    dataSource: [],
    datagridConfig: {},
    columns: [],
    toolbar: null,
    getDetailPanelContent: null,
    detailPanelHeight: 300,
    calculateDetailPanelHeight: null,
    disableSelectionOnClick: true,
    getRowId: null,
    rowCount: null,
    serverSideData: false,
    getRowClassName: () => '',
    gridClassNames: 'vh-80',
    multipleDetailPanelOpen: false,
    expandedDetailPanels: [],
    onRowExpanded: () => null,
    checkboxSelection: false,
    onChangeSelectedData: () => null,
    customFooter: undefined,
    treeData: false,
    getTreeDataPath: () => null,
    autoHeight: false,
    pagination: true,
    selectionModel: [],
    groupingColDef: undefined,
    loading: false,
    keepNonExistentRowsSelected: false,
    classes: {},
    onCellEditCommit: () => null,
    toolbarButtons: () => null,
    showStandardToolbarButtons: true,
    stopEditing: false,
    editComplete: () => null,
};

export default CustomDataGrid;
