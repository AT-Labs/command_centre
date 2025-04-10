import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { DataGridPro } from '@mui/x-data-grid-pro';

const ActiveDiversionView = (props) => {
    const [expandedRows, setExpandedRows] = useState({});

    const getShortRouteId = (routeId) => {
        if (!routeId) return '';
        const parts = routeId.split('-');
        return parts.length > 1 ? parts[0] : routeId;
    };

    const toggleExpand = (diversionId) => {
        setExpandedRows(prev => ({
            ...prev,
            [diversionId]: !prev[diversionId],
        }));
    };

    const gridColumns = [
        {
            field: 'diversionId',
            headerName: 'Diversion ID',
            width: 180,
            renderCell: ({ row: { tripModifications } }) => {
                if (tripModifications.length > 0) {
                    return (
                        <ul style={ { margin: 0, padding: 0, listStyle: 'none' } }>
                            { tripModifications.map(modification => (
                                <li key={ modification.diversionId }>{ modification.diversionId }</li>
                            ))}
                        </ul>
                    );
                }
                return 'None';
            },
        },
        {
            field: 'routeVariantId',
            headerName: 'Route Variant ID',
            width: 180,
            renderCell: ({ row: { tripModifications } }) => {
                if (tripModifications.length > 0) {
                    return (
                        <ul style={ { margin: 0, padding: 0, listStyle: 'none' } }>
                            {tripModifications.map(modification => (
                                <li key={ modification.diversionId }>{ modification.routeVariantId }</li>
                            ))}
                        </ul>
                    );
                }
                return 'None';
            },
        },
        {
            field: 'routeVariantName',
            headerName: 'Route Variant Name',
            width: 250,
            renderCell: ({ row: { tripModifications } }) => {
                if (tripModifications.length > 0) {
                    return (
                        <ul style={ { margin: 0, padding: 0, listStyle: 'none' } }>
                            {tripModifications.map(modification => (
                                <li key={ modification.diversionId }>{ modification.routeVariantName }</li>
                            ))}
                        </ul>
                    );
                }
                return 'None';
            },
        },
        {
            field: 'direction',
            headerName: 'Direction',
            width: 180,
            align: 'right',
            renderCell: ({ row: { tripModifications } }) => {
                if (tripModifications.length > 0) {
                    return (
                        <ul style={ { margin: 0, padding: 0, listStyle: 'none' } }>
                            {tripModifications.map(modification => (
                                <li style={ { textAlign: 'right' } } key={ modification.diversionId }>{ modification.direction }</li>
                            ))}
                        </ul>
                    );
                }
                return 'None';
            },
        },
    ];

    return (
        <div data-testid="active-diversion-view">
            {props.diversions.map(diversion => (
                <div key={ diversion.diversionId } style={ { marginBottom: '20px' } }>
                    <div style={ { display: 'flex', alignItems: 'center', marginBottom: '10px' } }>
                        <button
                            data-testid="expand-button"
                            type="button"
                            onClick={ () => toggleExpand(diversion.diversionId) }
                            style={ {
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                fontSize: '16px',
                                marginRight: '10px',
                            } }>
                            {expandedRows[diversion.diversionId]
                                ? <IoIosArrowDown size={ 20 } color="black" className="ml-1" />
                                : <IoIosArrowUp size={ 20 } color="black" className="ml-1" />}
                        </button>
                        <span>
                            {`${diversion.diversionId} `}
                            <span style={ { marginLeft: '30px' } }>
                                {diversion.tripModifications?.length > 0 && (
                                    <span>
                                        {diversion.tripModifications.map((modification, index) => (
                                            <span key={ modification.id }>
                                                {getShortRouteId(modification.routeId)}
                                                {index < diversion.tripModifications.length - 1 && ', '}
                                            </span>
                                        ))}
                                    </span>
                                )}
                            </span>
                        </span>
                    </div>
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
                    ) : (
                        <div style={ { textAlign: 'left', fontSize: '14px', color: '#666' } }>
                            <div style={ { display: 'flex', gap: '20px' } }>
                                <span>
                                    <strong>Direction:</strong>
                                    {' '}
                                    {diversion.tripModifications?.[0]?.direction || 'None'}
                                </span>
                                <span>
                                    <strong>Route Variant Name:</strong>
                                    {' '}
                                    {diversion.tripModifications?.[0]?.routeVariantName || 'None'}
                                </span>
                            </div>
                            <div style={ { textAlign: 'right', marginTop: '10px' } }>
                                Total Rows:
                                {diversion.tripModifications.length}
                            </div>
                            <hr style={ { border: 'none', borderTop: '1px solid #ccc', margin: '20px 0' } } />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

ActiveDiversionView.propTypes = {
    diversions: PropTypes.array.isRequired,
};

export { ActiveDiversionView };
