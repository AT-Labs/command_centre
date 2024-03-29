import React from 'react';
import PropTypes from 'prop-types';
import { uniqueId, isString, map } from 'lodash-es';

import DetailLoader from '../../../Common/Loader/DetailLoader';
import ControlTableRow from './ControlTableRow';
import './ControlTable.scss';

const ControlTable = (props) => {
    const {
        data, columns, isLoading, level,
    } = props;

    const getRowId = rowData => (props.getRowId ? props.getRowId(rowData) : uniqueId('control-table-row'));

    return (
        <div className="control-table">
            { columns.some(col => col.label) && (
                <div className="container-fluid">
                    <div className={ `row control-table-list-heading bg-white text-uppercase font-weight-bold py-1 border-secondary text-muted font-size-sm ${level === 3 ? '' : 'border-top border-left border-right'}` }>
                        { map(columns, column => (
                            <div key={ uniqueId('control-table-head-column') } className={ column.cols }>
                                { (isString(column.label)) ? column.label : column.label() }
                            </div>
                        )) }
                    </div>
                </div>
            ) }
            { isLoading && <div className="container-fluid bg-white py-3 border border-secondary"><DetailLoader centered /></div> }
            { !isLoading && data && data.length > 0 && (
                <ul className="p-0">
                    { data.map(rowData => (
                        <li key={ getRowId(rowData) } data-row-id={ getRowId(rowData) }>
                            <ControlTableRow
                                id={ getRowId(rowData) }
                                columns={ columns }
                                row={ rowData }
                                rowOnClick={ props.rowOnClick }
                                rowActive={ props.rowActive }
                                rowBody={ props.rowBody ? props.rowBody(rowData) : null }
                                rowClassName={ props.rowClassName ? props.rowClassName(rowData) : null }
                                isExpandable={ props.isExpandable }
                                isFocused={ props.rowFocused ? props.rowFocused(rowData) : null }
                                level={ level }
                                renderIcon={ props.renderIcon } />
                        </li>
                    )) }
                </ul>
            ) }
            { !isLoading && !data.length && (
                <div className="container-fluid bg-white py-3 border border-secondary" data-test="no-results">No results</div>
            ) }
        </div>
    );
};

ControlTable.propTypes = {
    data: PropTypes.array.isRequired,
    columns: PropTypes.arrayOf(PropTypes.shape({
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.func]).isRequired,
        key: PropTypes.string.isRequired,
        cols: PropTypes.string.isRequired,
        getContent: PropTypes.func,
    })).isRequired,
    isExpandable: PropTypes.bool,
    isLoading: PropTypes.bool,
    rowOnClick: PropTypes.func,
    getRowId: PropTypes.func,
    rowFocused: PropTypes.func,
    rowActive: PropTypes.oneOfType([PropTypes.func, PropTypes.bool]),
    rowBody: PropTypes.func,
    rowClassName: PropTypes.func,
    level: PropTypes.number,
    renderIcon: PropTypes.func,
};

ControlTable.defaultProps = {
    isLoading: false,
    getRowId: null,
    rowActive: null,
    rowOnClick: null,
    rowFocused: null,
    isExpandable: true,
    level: 1,
    rowBody: null,
    rowClassName: null,
    renderIcon: null,
};

export default ControlTable;
