import React from 'react';
import PropTypes from 'prop-types';

import ServiceDatePicker from '../ServiceDatePicker/ServiceDatePicker';

const TableTitle = props => (
    <div role="heading" aria-level="1" className="d-flex no-gutters justify-content-between mb-2">
        <div>
            <h1>{ props.tableTitle }</h1>
        </div>
        <div className="d-flex">
            { props.children }
            <ServiceDatePicker isServiceDatePickerDisabled={ props.isServiceDatePickerDisabled } />
        </div>
    </div>
);

TableTitle.propTypes = {
    tableTitle: PropTypes.string.isRequired,
    isServiceDatePickerDisabled: PropTypes.bool,
    children: PropTypes.node,
};

TableTitle.defaultProps = {
    isServiceDatePickerDisabled: false,
    children: null,
};

export default TableTitle;
