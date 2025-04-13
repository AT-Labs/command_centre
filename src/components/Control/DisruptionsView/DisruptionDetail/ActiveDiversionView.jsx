import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { DataGridPro } from '@mui/x-data-grid-pro';

const createRenderCell = (property, extraLiStyles = {}) => function renderCell({ row }) {
    const { tripModifications } = row;
    if (tripModifications.length > 0) {
        return (
            <ul style={ { margin: 0, padding: 0, listStyle: 'none' } }>
                {tripModifications.map(modification => (
                    <li key={ modification.diversionId } style={ extraLiStyles }>
                        {modification[property]}
                    </li>
                ))}
            </ul>
        );
    }
    return <span>None</span>;
};

const styles = {
    container: { marginBottom: '20px' },
    header: { display: 'flex', alignItems: 'center', marginBottom: '10px' },
    button: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', marginRight: '10px' },
    routeSpan: { marginLeft: '30px' },
    summary: { textAlign: 'left', fontSize: '14px', color: '#666' },
    summaryRow: { display: 'flex', gap: '20px' },
    totalRows: { textAlign: 'right', marginTop: '10px' },
    hr: { border: 'none', borderTop: '1px solid #ccc', margin: '20px 0' },
};

const gridColumns = [
    { field: 'diversionId', headerName: 'Diversion ID', width: 180, renderCell: createRenderCell('diversionId') },
    { field: 'routeVariantId', headerName: 'Route Variant ID', width: 180, renderCell: createRenderCell('routeVariantId') },
    { field: 'routeVariantName', headerName: 'Route Variant Name', width: 250, renderCell: createRenderCell('routeVariantName') },
    { field: 'direction', headerName: 'Direction', width: 180, align: 'right', renderCell: createRenderCell('direction', { textAlign: 'right' }) },
];

const ActiveDiversionView = ({ diversions }) => {
    const [expandedRows, setExpandedRows] = useState({});

    const getShortRouteId = routeId => (routeId ? routeId.split('-')[0] || routeId : '');

    const toggleExpand = diversionId => setExpandedRows(prev => ({ ...prev, [diversionId]: !prev[diversionId] }));

    const renderHeader = diversion => (
        <div style={ styles.header }>
            <button
                data-testid="expand-button"
                type="button"
                onClick={ () => toggleExpand(diversion.diversionId) }
                style={ styles.button }
            >
                {expandedRows[diversion.diversionId] ? (
                    <IoIosArrowUp size={ 20 } color="black" className="ml-1" />
                ) : (
                    <IoIosArrowDown size={ 20 } color="black" className="ml-1" />
                )}
            </button>
            <span>
                {`${diversion.diversionId} `}
                {diversion.tripModifications?.length > 0 && (
                    <span style={ styles.routeSpan }>
                        {diversion.tripModifications.map((m, i) => (
                            <span key={ m.id }>
                                {getShortRouteId(m.routeId)}
                                {i < diversion.tripModifications.length - 1 && ', '}
                            </span>
                        ))}
                    </span>
                )}
            </span>
        </div>
    );

    const renderSummary = diversion => (
        <div style={ styles.summary }>
            <div style={ styles.summaryRow }>
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
            <div style={ styles.totalRows }>
                Total Rows:
                {diversion.tripModifications.length}
            </div>
            <hr style={ styles.hr } />
        </div>
    );

    return (
        <div data-testid="active-diversion-view">
            {diversions.map(diversion => (
                <div key={ diversion.diversionId } style={ styles.container }>
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
                    ) : renderSummary(diversion)}
                </div>
            ))}
        </div>
    );
};

ActiveDiversionView.propTypes = {
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
