import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { DataGridPro } from '@mui/x-data-grid-pro';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import CreateIcon from '@mui/icons-material/Create';
import WarningIcon from '@mui/icons-material/Warning';
import CustomMuiDialog from '../../../Common/CustomMuiDialog/CustomMuiDialog';

const createRenderCell = (property, extraLiStyles = {}) => function renderCell({ row }) {
    const { tripModifications } = row;
    return (
        <ul>
            {tripModifications.map(modification => (
                <li key={ modification.diversionId } style={ extraLiStyles }>
                    {modification[property]}
                </li>
            ))}
        </ul>
    );
};

const gridColumns = [
    { field: 'routeVariantId', headerName: 'Route Variant', width: 180, renderCell: createRenderCell('routeVariantId') },
    { field: 'routeVariantName', headerName: 'Route Variant Name', width: 250, renderCell: createRenderCell('routeVariantName') },
    { field: 'direction', headerName: 'Direction', width: 180, align: 'right', renderCell: createRenderCell('direction', { textAlign: 'right' }) },
];

const ActiveDiversionView = ({ deleteDiversion, diversions, allExpanded, incidentNo }) => {
    const [expandedRows, setExpandedRows] = useState({});
    const getShortRouteId = routeId => routeId.split('-')[0];
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDiversionId, setSelectedDiversionId] = useState(null);

    const handleDeleteRequest = (diversion) => {
        setSelectedDiversionId(`${diversion.diversionId}`);
        setDeleteDialogOpen(true);
    };
    const handleDeleteDiversionConfirm = (selectedDiversionIdToDelete) => {
        // eslint-disable-next-line no-console
        console.log('TODO: Make delete diversion possible for id:', selectedDiversionIdToDelete);
        deleteDiversion(selectedDiversionIdToDelete);
        setDeleteDialogOpen(false);
    };

    useEffect(() => {
        if (allExpanded) {
            const newExpandedRows = diversions.reduce((acc, diversion) => {
                acc[diversion.diversionId] = true;
                return acc;
            }, {});
            setExpandedRows(newExpandedRows);
        } else {
            setExpandedRows({});
        }
    }, [allExpanded, diversions]);

    const toggleExpand = (diversionId) => {
        setExpandedRows(prev => ({ ...prev, [diversionId]: !prev[diversionId] }));
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
                {diversion.tripModifications?.length > 0 && (
                    <span className="flex-grow-1">
                        Routes
                        {' '}
                        {diversion.tripModifications.map(m => getShortRouteId(m.routeId)).join(', ')}
                    </span>
                )}
            </span>
            <span className="d-flex" data-testid="active-diversion-actions">
                {/* eslint-disable-next-line no-console */}
                <IconButton onClick={ () => console.log('Handle edit in another ticket!') }>
                    <CreateIcon />
                </IconButton>
                <IconButton onClick={ () => handleDeleteRequest(diversion) }>
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
                <button type="button" className="btn cc-btn-secondary w-25" onClick={ () => setDeleteDialogOpen(false) }>Cancel</button>
                <button type="button" className="btn cc-btn-primary" onClick={ () => handleDeleteDiversionConfirm(selectedDiversionId) }>Remove diversion</button>
            </div>
        </CustomMuiDialog>
    );

    return (
        <div className="diversion-grid scrollable-container" data-testid="active-diversion-view">
            {diversions
                .filter(diversion => diversion.tripModifications.length > 0)
                .map(diversion => (
                    <div key={ diversion.diversionId }>
                        {renderHeader(diversion)}
                        {expandedRows[diversion.diversionId] ? (
                            <DataGridPro
                                data-testid="datagrid-pro"
                                getRowId={ row => row.diversionId }
                                rows={ [diversion] }
                                disableSelectionOnClick
                                columns={ gridColumns }
                                disableColumnPinning
                                disableColumnSelector
                                autoHeight
                            />
                        ) : null}
                        <hr className="hr" />
                        { renderDeleteModal() }
                    </div>
                ))}
        </div>
    );
};

ActiveDiversionView.propTypes = {
    deleteDiversion: PropTypes.func.isRequired,
    incidentNo: PropTypes.string.isRequired,
    allExpanded: PropTypes.bool.isRequired,
    diversions: PropTypes.arrayOf(
        PropTypes.shape({
            diversionId: PropTypes.string.isRequired,
            tripModifications: PropTypes.arrayOf(
                PropTypes.shape({
                    diversionId: PropTypes.string.isRequired,
                    routeVariantId: PropTypes.string.isRequired,
                    routeVariantName: PropTypes.string.isRequired,
                    direction: PropTypes.string.isRequired,
                }),
            ).isRequired,
        }),
    ).isRequired,
};

export { ActiveDiversionView };
