import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FaPlus } from 'react-icons/fa';
import { Button } from 'reactstrap';
import { BsPencilSquare } from 'react-icons/bs';
import CustomDataGrid from '../../../Common/CustomDataGrid/CustomDataGrid';
import { getAllBusPriorityThresholds,
    getBusPriorityThresholdsDatagridConfig,
    getIsLoadingBusPriorityThresholds, isBusPriorityEditAllowed } from '../../../../redux/selectors/control/dataManagement/busPriority';
import { getBusPriorityThresholds, saveNewThresholds, updateBusPriorityThresholdsDatagridConfig,
    updateThresholds, deleteThresholds } from '../../../../redux/actions/control/dataManagement';
import BusPriorityThresholdsModal, { UPDATE_TYPE } from './BusPriorityThresholdsModal';

import './BusPriorityThresholds.scss';

const LABEL_PARTITION_KEY = 'Partition Key';
const LABEL_ROW_KEY = 'Row Key';
const LABEL_SCORE = 'Score';
const LABEL_ROUTEID = 'Route';
const LABEL_THRESHOLD = 'Threshold';
const LABEL_SITEID = 'Site Id';
const LABEL_OCCUPANCY = 'Occupancy';

export const BusPriorityThresholdDataGrid = (props) => {
    const [isThresholdsModalOpen, setIsThresholdsModalOpen] = useState(false);
    const [mode, setMode] = useState(UPDATE_TYPE.NEW);
    const [thresholdSet, setThresholdSet] = useState(null);

    useEffect(() => {
        props.getBusPriorityThresholds();
    }, []);

    const openThresholdModal = (update, row = null) => {
        setMode(update);
        if (update !== UPDATE_TYPE.NEW) {
            setThresholdSet({ siteId: row.SiteId, routeId: row.RouteId, occupancy: row.Occupancy });
        } else {
            setThresholdSet(null);
        }

        setIsThresholdsModalOpen(true);
    };

    const isDefaultThresholdSet = row => (!row.SiteId && !row.RouteId && !row.Occupancy);

    const toggleEditModal = (row) => {
        if (!row) return null;

        if (!props.isEditAllowed) {
            return [
                <Tooltip title="View Threshold Set" placement="top-end" key={ `view-${row.rowKey}` }>
                    <IconButton
                        color="default"
                        aria-label="edit"
                        onClick={ () => openThresholdModal(UPDATE_TYPE.VIEW, row) }
                    >
                        <BsPencilSquare />
                    </IconButton>
                </Tooltip>,
            ];
        }

        return [
            <Tooltip title="Edit Threshold Set" placement="top-end" key={ `edit-${row.rowKey}` }>
                <IconButton
                    color="default"
                    aria-label="edit"
                    onClick={ () => openThresholdModal(UPDATE_TYPE.UPDATE, row) }
                >
                    <BsPencilSquare />
                </IconButton>
            </Tooltip>,
            <Tooltip className={ isDefaultThresholdSet(row) ? 'hidden-icon' : '' } title="Delete Threshold Set" placement="top-end" key={ `delete-${row.rowKey}` }>
                <IconButton
                    color="error"
                    aria-label="delete"
                    onClick={ () => openThresholdModal(UPDATE_TYPE.DELETE, row) }
                >
                    <DeleteIcon />
                </IconButton>
            </Tooltip>,
        ];
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
            width: 100,
            type: 'number',
        },
        {
            field: 'Threshold',
            headerName: LABEL_THRESHOLD,
            width: 100,
            type: 'number',
        },
        {
            field: 'RouteId',
            headerName: LABEL_ROUTEID,
            width: 200,
            type: 'string',
        },
        {
            field: 'SiteId',
            headerName: LABEL_SITEID,
            width: 100,
            type: 'string',
        },
        {
            field: 'Occupancy',
            headerName: LABEL_OCCUPANCY,
            width: 150,
            type: 'string',
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

    return (
        <div>
            {
                props.isEditAllowed && (
                    <div className="row pb-2">
                        <div className="col-9 d-flex justify-content-between">
                            <Button
                                className="cc-btn-secondary"
                                onClick={ () => openThresholdModal(UPDATE_TYPE.NEW) }>
                                <FaPlus size={ 20 } className="cc-btn-secondary__icon" />
                                Add New Threshold Set
                            </Button>
                        </div>
                    </div>
                )
            }
            <CustomDataGrid
                gridClassNames="vh-80"
                loading={ props.isLoading }
                columns={ GRID_COLUMNS }
                datagridConfig={ props.datagridConfig }
                dataSource={ props.busPriorityThresholds }
                updateDatagridConfig={ config => props.updateBusPriorityThresholdsDatagridConfig(config) }
                getRowId={ row => row.rowKey }
            />
            { isThresholdsModalOpen && (
                <BusPriorityThresholdsModal
                    isModalOpen={ isThresholdsModalOpen }
                    onClose={ () => {
                        setIsThresholdsModalOpen(false);
                    } }
                    mode={ mode }
                    allThresholds={ props.busPriorityThresholds }
                    saveNewThresholds={ thresholds => props.saveNewThresholds(thresholds) }
                    updateThresholds={ (originalThresholds, thresholds) => props.updateThresholds(originalThresholds, thresholds) }
                    deleteThresholds={ thresholds => props.deleteThresholds(thresholds) }
                    thresholdSet={ thresholdSet }
                />
            ) }
        </div>
    );
};

BusPriorityThresholdDataGrid.propTypes = {
    datagridConfig: PropTypes.object.isRequired,
    busPriorityThresholds: PropTypes.array.isRequired,
    getBusPriorityThresholds: PropTypes.func.isRequired,
    updateBusPriorityThresholdsDatagridConfig: PropTypes.func.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isEditAllowed: PropTypes.bool.isRequired,
    saveNewThresholds: PropTypes.func.isRequired,
    updateThresholds: PropTypes.func.isRequired,
    deleteThresholds: PropTypes.func.isRequired,
};

export default connect(state => ({
    busPriorityThresholds: getAllBusPriorityThresholds(state),
    datagridConfig: getBusPriorityThresholdsDatagridConfig(state),
    isLoading: getIsLoadingBusPriorityThresholds(state),
    isEditAllowed: isBusPriorityEditAllowed(state),
}), {
    getBusPriorityThresholds, updateBusPriorityThresholdsDatagridConfig, saveNewThresholds, updateThresholds, deleteThresholds,
})(BusPriorityThresholdDataGrid);
