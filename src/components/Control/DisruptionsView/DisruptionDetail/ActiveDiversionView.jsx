import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { DataGridPro } from '@mui/x-data-grid-pro';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create';
import WarningIcon from '@mui/icons-material/Warning';
import { generateUniqueID } from '../../../../utils/helpers';
import { DIRECTIONS } from '../types';
import CustomMuiDialog from '../../../Common/CustomMuiDialog/CustomMuiDialog';

const createRenderCell = (property = '') => function renderCell({ row }) {
    if (property === 'directionId') {
        return (
            <div>
                {DIRECTIONS[row[property]]}
            </div>
        );
    }
    return (
        <div>
            {row[property]}
        </div>
    );
};

const gridColumns = [
    { field: 'routeVariantId', headerName: 'Route Variant', width: 180, align: 'left', renderCell: createRenderCell('routeVariantId') },
    { field: 'routeVariantName', headerName: 'Route Variant Name', width: 450, align: 'left', renderCell: createRenderCell('routeVariantName') },
    { field: 'directionId', headerName: 'Direction', width: 180, align: 'left', renderCell: createRenderCell('directionId') },
];

const ActiveDiversionView = ({ diversions, expandedRows, toggleExpand, deleteDiversion, incidentNo }) => {
    const getShortRouteId = routeId => routeId.split('-')[0];
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDiversionId, setSelectedDiversionId] = useState(null);

    const handleDeleteRequest = (diversion) => {
        setSelectedDiversionId(`${diversion.diversionId}`);
        setDeleteDialogOpen(true);
    };
    const handleDeleteDiversionConfirm = (selectedDiversionIdToDelete) => {
        deleteDiversion(selectedDiversionIdToDelete);
        setDeleteDialogOpen(false);
    };

    const renderHeader = diversion => (
        <div className="d-flex flex-row">
            <button
                data-testid="expand-button"
                type="button"
                className="expand-button-style"
                onClick={ () => toggleExpand(diversion.diversionId) }
            >
                {expandedRows[diversion.diversionId] ? (
                    <IoIosArrowUp size={ 20 } color="black" />
                ) : (
                    <IoIosArrowDown size={ 20 } color="black" />
                )}
            </button>
            <span className="d-flex flex-row justify-left w-100 align-items-center">
                <span className="ml-3 diversion-row">
                    {`Diversion ${diversion.diversionId}`}
                </span>
                {diversion.diversionRouteVariants?.length > 0 && (
                    <span className="flex-grow-1">
                        Routes
                        {' '}
                        {' '}
                        {diversion.diversionRouteVariants.map(m => getShortRouteId(m.routeId)).join(', ')}
                    </span>
                )}
            </span>
            <span className="d-flex" data-testid="active-diversion-actions">
                {/* eslint-disable-next-line no-console */}
                <IconButton onClick={ () => console.log('Handle edit in another ticket!') } data-testid="edit-diversion-icon-button">
                    <CreateIcon />
                </IconButton>
                <IconButton onClick={ () => handleDeleteRequest(diversion) } data-testid="delete-diversion-icon-button">
                    <DeleteIcon />
                </IconButton>
            </span>
        </div>
    );

    const renderDeleteModal = () => (
        <CustomMuiDialog
            title="Remove diversion"
            isOpen={ deleteDialogOpen }
            onClose={ () => setDeleteDialogOpen(false) }
            footerContent={ <></> }
        >
            <WarningIcon className="icon w-100" style={ { color: '#FFA500', fontSize: '100px' } } />
            <h2 className="text-center">
                {`Are you sure you want to remove diversion ${selectedDiversionId} on disruption ${incidentNo}?`}
            </h2>
            <p className="text-center">
                Removing this diversion will also remove the replacement trips generated for this diversion and reinstate the related replaced trips.
            </p>
            <div className="d-flex justify-content-between pt-3">
                <button data-testid="delete-dialog-cancel-button" type="button" className="btn cc-btn-secondary w-25" onClick={ () => setDeleteDialogOpen(false) }>Cancel</button>
                <button data-testid="delete-dialog-ok-button" type="button" className="btn cc-btn-primary" onClick={ () => handleDeleteDiversionConfirm(selectedDiversionId) }>Remove diversion</button>
            </div>
        </CustomMuiDialog>
    );

    return (
        <div className="diversion-grid scrollable-container" data-testid="active-diversion-view">
            {diversions
                .filter(diversion => diversion.diversionRouteVariants?.length > 0)
                .map((diversion, index, ary) => (
                    <div key={ diversion.diversionId }>
                        {renderHeader(diversion)}
                        {expandedRows[diversion.diversionId] ? (
                            <DataGridPro
                                data-testid="datagrid-pro"
                                getRowId={ row => `${row.diversionId}_${generateUniqueID()}` }
                                rows={ diversion.diversionRouteVariants }
                                disableSelectionOnClick
                                columns={ gridColumns }
                                disableColumnPinning
                                disableColumnSelector
                                autoHeight
                                className="ml-5"
                            />
                        ) : null}
                        {(index < (ary.length - 1)) ? <hr className="hr" /> : null}
                    </div>
                ))}

            { deleteDialogOpen ? renderDeleteModal() : null }
        </div>
    );
};

ActiveDiversionView.propTypes = {
    diversions: PropTypes.array.isRequired,
    expandedRows: PropTypes.object.isRequired,
    toggleExpand: PropTypes.func.isRequired,
    deleteDiversion: PropTypes.func.isRequired,
    incidentNo: PropTypes.string.isRequired,
};

export { ActiveDiversionView, createRenderCell };
