import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash-es';
import { Button, Input, Label } from 'reactstrap';
import { Button as MuiButton, IconButton, Tooltip } from '@mui/material';
import { GridAddIcon, GridMenuIcon } from '@mui/x-data-grid-pro';
import DeleteIcon from '@mui/icons-material/Delete';
import ModalAlert from '../../BlocksView/BlockModals/ModalAlert';

import VEHICLE_OCCUPANCY_STATUS_TYPE from '../../../../types/vehicle-occupancy-status-types';
import CustomMuiDialog from '../../../Common/CustomMuiDialog/CustomMuiDialog';
import CustomDataGrid from '../../../Common/CustomDataGrid/CustomDataGrid';

import './BusPriorityThresholdsModal.scss';

export const UPDATE_TYPE = {
    NEW: 'NEW',
    UPDATE: 'UPDATE',
    DELETE: 'DELETE',
    VIEW: 'VIEW',
};

const BusPriorityThresholdsModal = (props) => {
    const [thresholds, setThresholds] = useState([]);
    const [originalThresholds, setOriginalThresholds] = useState([]);
    const [occupancy, setOccupancy] = useState(null);
    const [siteId, setSiteId] = useState(null);
    const [routeIds, setRouteIds] = useState('');
    const [disableFilters, setDisableFilters] = useState(false);
    const [invalidFilters, setInvalidFilters] = useState(false);
    const [invalidFilterString, setInvalidFilterString] = useState('');
    const [tempRowKey, setTempRowKey] = useState(10000);
    const [canSave, setCanSave] = useState(false);
    const [datagridConfig, setDatagridConfig] = useState({
        columns: [],
        page: 0,
        pageSize: 100,
        sortModel: [{
            field: 'Score',
            sort: 'asc',
        }],
        density: 'standard',
        filterModel: { items: [], linkOperator: 'and' },
    });
    const [updateType, setUpdateType] = useState(UPDATE_TYPE.VIEW);
    const [initialLoad, setInitialLoad] = useState(true);
    const [stopEdit, setStopEdit] = useState(false);
    const [performSave, setPerformSave] = useState(false);

    const resetFilters = () => {
        setOccupancy(null);
        setSiteId(null);
        setRouteIds(null);
        setThresholds([]);
    };

    const hasDuplicates = (itemsToCheck) => {
        const uniqueItems = new Set(itemsToCheck);

        return uniqueItems.size !== itemsToCheck.length;
    };

    const areThresholdsNotIncreasing = (array) => {
        const sortedArray = [...array].sort((a, b) => parseInt(a.Score, 10) - parseInt(b.Score, 10));

        for (let i = 1; i < sortedArray.length; i++) {
            if (parseInt(sortedArray[i].Threshold, 10) <= parseInt(sortedArray[i - 1].Threshold, 10)) {
                return true;
            }
        }

        return false;
    };

    const setInvalidMessage = (filterExists, duplicateScores, duplicateThresholds, hasZeroValues, thresholdsNotIncreasing) => {
        if (filterExists) {
            setInvalidFilterString('A threshold set with these options already exists');
            return;
        }
        if (duplicateScores || duplicateThresholds) {
            setInvalidFilterString('Duplicate scores or thresholds are not allowed');
            return;
        }
        if (hasZeroValues) {
            setInvalidFilterString('Zero values for scores or thresholds are not allowed');
        }
        if (thresholdsNotIncreasing) {
            setInvalidFilterString('Thresholds must increase with Scores and cannot be lower than a previous threshold');
        }
    };

    const updateCanSave = () => {
        if (invalidFilters
            || thresholds.length === 0
            || (updateType === UPDATE_TYPE.NEW && (isEmpty(siteId) && isEmpty(routeIds) && isEmpty(occupancy)))) {
            setCanSave(false);
        } else {
            setCanSave(true);
        }
    };

    const validateFilters = () => {
        const originalRowKeys = new Set(originalThresholds.map(item => item.rowKey));

        // Check that another threshold set does not already exist with the same Occupancy, RouteId and SiteId values as this is not allowed
        // Note: RouteId is checked separately as it can be a comma separated list of routes,
        // so each routeId in this modal needs to be checked against each routeId in the threshold being tested
        const filterExists = updateType !== UPDATE_TYPE.DELETE
            && props.allThresholds.some((threshold) => {
                if (originalRowKeys.has(threshold.rowKey)) {
                    return false;
                }

                let routeMatched = (!threshold.RouteId && !routeIds);

                if (!routeMatched && threshold.RouteId && routeIds) {
                    const thresholdRoutes = threshold.RouteId.split(',').map(item => item.trim());
                    const currentRoutes = routeIds.split(',').map(item => item.trim());

                    routeMatched = currentRoutes.some(item => thresholdRoutes.includes(item));
                }

                const thresholdSiteId = (threshold.SiteId !== undefined && threshold.SiteId !== null && threshold.SiteId !== '') ? parseInt(threshold.SiteId, 10) : null;

                return (threshold.Occupancy === occupancy || (!threshold.Occupancy && !occupancy))
                        && (thresholdSiteId === siteId || (!thresholdSiteId && !siteId))
                        && routeMatched;
            });

        const duplicateScores = hasDuplicates(thresholds.map(row => row.Score));

        const duplicateThresholds = hasDuplicates(thresholds.map(row => row.Threshold));

        const hasZeroValues = thresholds.some(threshold => threshold.Score === 0 || threshold.Threshold === 0);

        const thresholdsNotIncreasing = areThresholdsNotIncreasing(thresholds);

        const isInvalid = (filterExists && thresholds.length > 0) || duplicateScores || duplicateThresholds || hasZeroValues || thresholdsNotIncreasing;

        setInvalidMessage(filterExists, duplicateScores, duplicateThresholds, hasZeroValues, thresholdsNotIncreasing);
        setInvalidFilters(isInvalid);
        updateCanSave();

        return isInvalid;
    };

    const updateThresholds = () => {
        const updatedThresholds = thresholds.map(threshold => ({ ...threshold, RouteId: routeIds, SiteId: siteId, Occupancy: occupancy }));

        setThresholds(updatedThresholds);
    };

    useEffect(() => {
        if (props.thresholdSet != null) {
            const initalThresholds = props.allThresholds.filter((threshold) => {
                const thresholdSiteId = (threshold.SiteId !== undefined && threshold.SiteId !== null && threshold.SiteId !== '')
                    ? parseInt(threshold.SiteId, 10)
                    : null;
                const propSiteId = (props.thresholdSet.siteId !== undefined && props.thresholdSet.siteId !== null && props.thresholdSet.siteId !== '')
                    ? parseInt(props.thresholdSet.siteId, 10)
                    : null;
                return (threshold.Occupancy === props.thresholdSet.occupancy)
                    && (thresholdSiteId === propSiteId)
                    && (threshold.RouteId === props.thresholdSet.routeId);
            });

            setThresholds(initalThresholds);
            setOriginalThresholds(initalThresholds);
            setSiteId(props.thresholdSet.siteId);
            setRouteIds(props.thresholdSet.routeId);
            setOccupancy(props.thresholdSet.occupancy);
        }
        setUpdateType(props.mode);
        setInitialLoad(false);
    }, []);

    useEffect(() => {
        setUpdateType(props.mode);
    }, [props.mode]);

    useEffect(() => {
        if (updateType === UPDATE_TYPE.NEW) {
            setDisableFilters(false);
            validateFilters();
        }

        setDisableFilters(updateType === UPDATE_TYPE.DELETE);
    }, [updateType]);

    useEffect(() => {
        validateFilters();

        if (!initialLoad) {
            updateThresholds();
        }
    }, [occupancy, siteId, routeIds]);

    useEffect(() => {
        validateFilters();
    }, [thresholds]);

    useEffect(() => {
        updateCanSave();
    }, [invalidFilters]);

    const LABEL_PARTITION_KEY = 'Partition Key';
    const LABEL_ROW_KEY = 'Row Key';
    const LABEL_SCORE = 'Score';
    const LABEL_THRESHOLD = 'Threshold';

    const deleteThreshold = (row) => {
        const updatedThresolds = thresholds.filter(threshold => threshold.rowKey !== row.rowKey);

        setThresholds(updatedThresolds);
    };

    const toggleEditModal = (row) => {
        if (updateType === UPDATE_TYPE.NEW || updateType === UPDATE_TYPE.UPDATE) {
            return (
                [
                    <Tooltip title="Delete Threshold" placement="top-end" key={ row.rowKey }>
                        <IconButton
                            color="error"
                            aria-label="delete"
                            onClick={ () => deleteThreshold(row) }
                        >
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>,
                ]
            );
        }

        return ([<div key="no-actions" />]);
    };

    const GRID_COLUMNS = [
        {
            field: 'partitionKey',
            headerName: LABEL_PARTITION_KEY,
            width: 100,
            type: 'string',
            hide: true,
            filterable: false,
        },
        {
            field: 'rowKey',
            headerName: LABEL_ROW_KEY,
            width: 100,
            type: 'string',
            hide: true,
            filterable: false,
        },
        {
            field: 'Score',
            headerName: LABEL_SCORE,
            width: 150,
            type: 'number',
            editable: true,
        },
        {
            field: 'Threshold',
            headerName: LABEL_THRESHOLD,
            width: 150,
            type: 'number',
            editable: true,
        },
        {
            field: 'action',
            headerName: 'ACTION',
            type: 'actions',
            width: 200,
            renderHeader: () => (<span />),
            getActions: params => toggleEditModal(params.row),
            align: 'right',
        },
    ];

    const modalPropsKey = () => {
        switch (updateType) {
        case UPDATE_TYPE.NEW:
            return 'addNewThresholdSet';
        case UPDATE_TYPE.UPDATE:
            return 'updateThresholdSet';
        case UPDATE_TYPE.DELETE:
            return 'deleteThresholdSet';
        default:
            return 'viewThresholdSet';
        }
    };

    const getTempRowKey = () => {
        setTempRowKey(tempRowKey + 1);
        return `NEW${tempRowKey}`;
    };

    const handleAddRow = () => {
        const newRow = {
            partitionKey: '0',
            rowKey: getTempRowKey(),
            Threshold: 0,
            Score: 0,
            SiteId: siteId,
            RouteId: routeIds,
            Occupancy: occupancy,
        };

        setThresholds([...thresholds, newRow]);
    };

    const handleDuplicateSet = () => {
        setOriginalThresholds([]);
        setThresholds(thresholds.map(threshold => ({ ...threshold, rowKey: `NEW${threshold.rowKey}` })));
        setUpdateType(UPDATE_TYPE.NEW);
    };

    const generateOccupancyOptions = () => Object.entries(VEHICLE_OCCUPANCY_STATUS_TYPE).map(([, value]) => (
        <option key={ value } value={ value }>
            { value }
        </option>
    ));

    const onOccupancyChange = (value) => {
        setOccupancy(value);
    };

    const toolBarButtons = () => (
        <>
            { (updateType === UPDATE_TYPE.NEW || updateType === UPDATE_TYPE.UPDATE) && (
                <MuiButton color="primary" startIcon={ <GridAddIcon /> } onClick={ handleAddRow }>
                    Add threshold
                </MuiButton>
            )}
            { updateType === UPDATE_TYPE.UPDATE && (
                <MuiButton color="primary" startIcon={ <GridMenuIcon /> } onClick={ handleDuplicateSet }>
                    Duplicate thresholds
                </MuiButton>
            )}
        </>
    );

    const handleCellEditCommit = (params) => {
        const updatedThresholds = thresholds.map((threshold) => {
            if (threshold.rowKey === params.id) {
                return { ...threshold, [params.field]: params.value.toString() };
            }
            return threshold;
        });

        setThresholds(updatedThresholds);
    };

    const handleRouteIdsBlurOrEnter = () => {
        const updatedRouteIds = routeIds
            .split(',')
            .map(id => id.trim())
            .filter(id => id)
            .sort((a, b) => a - b);

        setRouteIds(updatedRouteIds.join(', '));
    };

    const handleEditComplete = () => setPerformSave(true);

    const renderMainBody = () => (
        <div>
            <div className="row">
                <div className="col">
                    <ModalAlert
                        color="danger"
                        isOpen={ invalidFilters }
                        content={ <span>{ invalidFilterString }</span> } />
                </div>
            </div>
            <div className="row filter-container">
                <div className="filter">
                    <Label for="siteId">
                        <span className="filter-label">Site Id</span>
                    </Label>
                    <Input
                        type="number"
                        id="siteId"
                        disabled={ disableFilters }
                        value={ siteId ?? '' }
                        className="cc-form-control"
                        placeholder="Site Id"
                        onChange={ (event) => {
                            const { value } = event.target;
                            setSiteId(value === '' ? null : parseInt(value, 10));
                        } }
                    />
                </div>
                <div className="filter">
                    <Label for="routeIds">
                        <span className="filter-label">Route Id</span>
                    </Label>
                    <Input
                        id="routeIds"
                        disabled={ disableFilters }
                        value={ routeIds }
                        className="cc-form-control"
                        placeholder="Route Id"
                        onChange={ event => setRouteIds(event.target.value.toUpperCase()) }
                        onBlur={ handleRouteIdsBlurOrEnter }
                        onKeyDown={ (e) => {
                            if (e.key === 'Enter') handleRouteIdsBlurOrEnter();
                        } }
                    />
                </div>
                <div className="filter">
                    <Label for="siteId">
                        <span className="filter-label">Occupancy</span>
                    </Label>
                    <Input type="select"
                        disabled={ disableFilters }
                        id="occupancy"
                        value={ occupancy ?? '' }
                        // invalid={ invalid }
                        onBlur={ e => onOccupancyChange(e.currentTarget.value) }
                        onChange={ e => onOccupancyChange(e.currentTarget.value) }>
                        <option value={ null } />
                        { generateOccupancyOptions() }
                    </Input>
                </div>
            </div>
            <div className="row threshold-grid">
                <CustomDataGrid
                    toolbarButtons={ toolBarButtons }
                    showStandardToolbarButtons={ false }
                    gridClassNames="vh-70"
                    columns={ GRID_COLUMNS }
                    dataSource={ thresholds }
                    getRowId={ row => row.rowKey }
                    datagridConfig={ datagridConfig }
                    updateDatagridConfig={ config => setDatagridConfig({ ...datagridConfig, ...config }) }
                    pagination={ false }
                    onCellEditCommit={ handleCellEditCommit }
                    stopEditing={ stopEdit }
                    editComplete={ handleEditComplete }
                />
            </div>
        </div>
    );

    const closeModal = () => {
        props.onClose();
        resetFilters();
    };

    const modalProps = {
        addNewThresholdSet: {
            className: 'add-modal',
            title: 'Add New Threshold Set',
            mainButtonLabel: 'Add new threshold set',
            onClick: () => {
                setStopEdit(true);
            },
            save: () => {
                props.saveNewThresholds(thresholds);
                closeModal();
            },
            renderBody: renderMainBody(),
        },
        updateThresholdSet: {
            className: 'add-modal',
            title: 'Update Threshold Set',
            mainButtonLabel: 'Update threshold set',
            onClick: () => {
                setStopEdit(true);
            },
            save: () => {
                props.updateThresholds(originalThresholds, thresholds);
                closeModal();
            },
            renderBody: renderMainBody(),
        },
        deleteThresholdSet: {
            className: 'add-modal',
            title: 'Delete Threshold Set',
            mainButtonLabel: 'Delete threshold set',
            onClick: () => {
                props.deleteThresholds(thresholds);
                closeModal();
            },
            renderBody: renderMainBody(),
        },
        viewThresholdSet: {
            className: 'add-modal',
            title: 'View Threshold Set',
            mainButtonLabel: 'View threshold set',
            onClick: () => {
                closeModal();
            },
            renderBody: renderMainBody(),
        },
    };

    const activeModalProps = modalProps[modalPropsKey()];

    useEffect(() => {
        if (performSave && !validateFilters()) {
            activeModalProps.save();
        }

        setPerformSave(false);
        setStopEdit(false);
    }, [performSave]);

    const generateFooter = () => (
        <Button
            className="cc-btn-primary w-100"
            onClick={ activeModalProps.onClick }
            disabled={ !canSave }>
            { activeModalProps.mainButtonLabel }
        </Button>
    );

    return (
        <CustomMuiDialog
            title={ activeModalProps.title }
            onClose={ closeModal }
            isOpen={ props.isModalOpen }
            footerContent={ generateFooter() }>
            { activeModalProps.renderBody }
        </CustomMuiDialog>
    );
};

BusPriorityThresholdsModal.propTypes = {
    allThresholds: PropTypes.array.isRequired,
    mode: PropTypes.string.isRequired,
    isModalOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    saveNewThresholds: PropTypes.func.isRequired,
    updateThresholds: PropTypes.func.isRequired,
    deleteThresholds: PropTypes.func.isRequired,
    thresholdSet: PropTypes.shape({
        siteId: PropTypes.number,
        occupancy: PropTypes.string,
        routeId: PropTypes.string,
    }),
};

BusPriorityThresholdsModal.defaultProps = {
    thresholdSet: null,
};

export default connect()(BusPriorityThresholdsModal);
