import React, { useState, useCallback, useEffect } from 'react';
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
    const [selectedRows, setSelectedRows] = useState([]);

    const effectiveSelectedRows = props.shouldOpenDetailPanel ? selectedRows : [];

    const [currentCellEditParams, setCurrentCellEditParams] = useState(null);

    const getExpandedPanels = useCallback(() => apiRef.current?.getExpandedDetailPanels?.() || [], []);

    const addToExpandedPanels = useCallback((newPanels) => {
        const currentlyExpanded = getExpandedPanels();
        const updatedPanels = [...new Set([...currentlyExpanded, ...newPanels])];
        apiRef.current?.setExpandedDetailPanels?.(updatedPanels);
        return updatedPanels;
    }, [getExpandedPanels]);

    const setExpandedPanels = useCallback((panels) => {
        apiRef.current?.setExpandedDetailPanels?.(panels);
    }, []);

    const findChildRowId = useCallback((targetRowId, visibleRowIds) => visibleRowIds.find(rowId => String(rowId).startsWith(String(targetRowId))
        && rowId !== targetRowId
        && String(rowId).length > String(targetRowId).length), []);

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

    const calculatePageIdx = rowIdx => Math.floor(rowIdx / props.datagridConfig.pageSize);

    const getVisibleRowIds = useCallback(() => {
        if (!apiRef.current) return [];

        if (apiRef.current.getVisibleRowModels) {
            const visibleRowModels = apiRef.current.getVisibleRowModels();
            const visibleRowIds = Array.from(visibleRowModels.keys());
            return visibleRowIds;
        }

        return apiRef.current.getSortedRowIds();
    }, []);

    const scrollToRow = useCallback((targetRowId) => {
        if (!apiRef.current) return;

        const gridElement = apiRef.current.rootElementRef?.current;
        const scrollToDomRow = () => {
            const rowElement = gridElement?.querySelector(`[data-id="${targetRowId}"]`);
            if (rowElement) {
                rowElement.scrollIntoView({
                    block: 'start',
                    inline: 'nearest',
                    behavior: 'smooth',
                });
                return true;
            }
            return false;
        };

        const scrollToVirtualRow = () => {
            const allRowIds = apiRef.current.getSortedRowIds();
            const rowIndex = allRowIds.indexOf(targetRowId);
            if (rowIndex !== -1) {
                apiRef.current.scrollToIndexes({
                    rowIndex,
                    colIndex: 0,
                    behavior: 'smooth',
                });
            }
        };

        if (!scrollToDomRow()) {
            scrollToVirtualRow();
        }
    }, []);

    const displaySelectedDetail = (rowsToSelect, overridePageIdx = false, shouldSetSelectedRows = true) => {
        const idx = apiRef.current.getSortedRowIds().findIndex(rowId => rowId === rowsToSelect[0]);
        const pageIdx = calculatePageIdx(idx);

        if (shouldSetSelectedRows && props.shouldOpenDetailPanel) {
            setTimeout(() => setSelectedRows(rowsToSelect));
        }

        if (overridePageIdx || pageIdx !== props.datagridConfig.page) {
            apiRef.current.setPage(pageIdx);
        }

        setTimeout(() => scrollToRow(rowsToSelect[0]));
    };

    useEffect(() => {
        if (props.stopEditing && currentCellEditParams) {
            apiRef.current.commitCellChange(currentCellEditParams); // This commits the edit
            apiRef.current.setCellMode(currentCellEditParams.id, currentCellEditParams.field, 'view');
        }

        if (props.stopEditing) {
            props.editComplete();
        }
    }, [props.stopEditing]);

    const handleDetailPanelExpansion = useCallback(() => {
        const expandedPanels = props.expandedDetailPanels;
        const hasExpanded = expandedPanels?.length > 0;

        if (!hasExpanded || !apiRef.current) return;

        if (isInitialLoad && props.dataSource.length > 0) {
            if (props.shouldOpenDetailPanel) {
                setExpandedPanels(expandedPanels);
            }
            setIsInitialLoad(false);
            return;
        }

        if (props.shouldOpenDetailPanel) {
            setExpandedPanels(expandedPanels);
        }
    }, [props.expandedDetailPanels, props.dataSource, props.shouldOpenDetailPanel, isInitialLoad, getExpandedPanels, addToExpandedPanels, setExpandedPanels]);

    const handleAutoExpandIncident = useCallback(() => {
        const targetRowId = props.autoExpandActiveIncident;
        if (!targetRowId || !apiRef.current) return;

        const { disruptionToOpen } = props;
        if (disruptionToOpen) {
            if (targetRowId && targetRowId !== disruptionToOpen) {
                apiRef.current.setRowChildrenExpansion(targetRowId, true);
                setTimeout(() => {
                    if (props.shouldOpenDetailPanel) {
                        addToExpandedPanels([disruptionToOpen]);
                        displaySelectedDetail([disruptionToOpen], false, true);
                    } else {
                        displaySelectedDetail([disruptionToOpen], false, false);
                    }
                }, 100);
                return;
            } else {
                if (props.shouldOpenDetailPanel) {
                    addToExpandedPanels([disruptionToOpen]);
                    displaySelectedDetail([disruptionToOpen], false, true);
                } else {
                    displaySelectedDetail([disruptionToOpen], false, false);
                }
                return;
            }
        }

        const openAndScrollTo = (rowId) => {
            if (props.shouldOpenDetailPanel) {
                addToExpandedPanels([rowId]);
                displaySelectedDetail([rowId], false, true);
            } else {
                displaySelectedDetail([rowId], false, false);
            }
        };

        if (!props.treeData) {
            openAndScrollTo(targetRowId);
            return;
        }

        apiRef.current.setRowChildrenExpansion(targetRowId, true);

        setTimeout(() => {
            const visibleRowIds = getVisibleRowIds();
            if (props.scrollToParent) {
                openAndScrollTo(targetRowId);
            } else {
                const isTargetAlreadyChild = visibleRowIds.some(rowId => String(targetRowId).startsWith(String(rowId))
                    && rowId !== targetRowId
                    && String(targetRowId).length > String(rowId).length);

                if (isTargetAlreadyChild) {
                    openAndScrollTo(targetRowId);
                } else {
                    const childRowId = findChildRowId(targetRowId, visibleRowIds);
                    openAndScrollTo(childRowId || targetRowId);
                }
            }
        }, 100);
    }, [
        props.autoExpandActiveIncident,
        props.treeData,
        props.shouldOpenDetailPanel,
        props.scrollToParent,
        props.expandedDetailPanels,
        addToExpandedPanels,
        getVisibleRowIds,
        findChildRowId,
    ]);

    useEffect(() => {
        if (!apiRef.current) return;

        const executeExpansion = () => {
            handleDetailPanelExpansion();
            handleAutoExpandIncident();
        };

        requestAnimationFrame(executeExpansion);
    }, [
        handleDetailPanelExpansion,
        handleAutoExpandIncident,
        props.autoExpandActiveIncident,
        props.expandedDetailPanels,
    ]);

    useEffect(() => {
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

    useEffect(() => {
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

        if (props.shouldOpenDetailPanel) {
            setSelectedRows(updatedIds);
        }
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
                    detailPanelExpandedRowIds={ effectiveSelectedRows }
                    checkboxSelection={ props.checkboxSelection }
                    onSelectionModelChange={ newSelectionModel => props.onChangeSelectedData(newSelectionModel) }
                    selectionModel={ props.selectionModel }
                    keepNonExistentRowsSelected={ props.keepNonExistentRowsSelected }
                    hideFooterSelectedRowCount
                    treeData={ props.treeData }
                    getTreeDataPath={ props.getTreeDataPath }
                    initialState={ props.initialState || {} }
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
    initialState: PropTypes.object,
    autoExpandActiveIncident: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    shouldOpenDetailPanel: PropTypes.bool,
    scrollToParent: PropTypes.bool,
    disruptionToOpen: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
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
    initialState: {},
    autoExpandActiveIncident: null,
    shouldOpenDetailPanel: true,
    scrollToParent: false,
    disruptionToOpen: null,
};

export default CustomDataGrid;
