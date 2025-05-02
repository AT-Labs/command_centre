import React from 'react';
import PropTypes from 'prop-types';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { DIRECTIONS } from '../types';
import { generateUniqueID } from '../../../../utils/helpers';

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

const ActiveDiversionView = ({ diversions, expandedRows, toggleExpand }) => {
    const getShortRouteId = routeId => routeId.split('-')[0];

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
            <span className="d-flex flex-row justify-left w-100">
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
        </div>
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
        </div>
    );
};

ActiveDiversionView.propTypes = {
    diversions: PropTypes.array.isRequired,
    expandedRows: PropTypes.object.isRequired,
    toggleExpand: PropTypes.func.isRequired,
};

export { ActiveDiversionView, createRenderCell };
