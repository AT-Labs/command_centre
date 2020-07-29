import React from 'react';
import PropTypes from 'prop-types';
import SelectRoutesPicklist from '../../SelectRoutesPicklist';

const SelectRoutes = props => (
    <SelectRoutesPicklist
        data={ props.data }
        onClose={ () => props.onStepUpdate(null) }
        onDataUpdate={ selectedItem => props.onDataUpdate('affectedRoutes', selectedItem) }
        onSubmit={ () => props.onStepUpdate(1) } />
);
SelectRoutes.propTypes = {
    data: PropTypes.object,
    onStepUpdate: PropTypes.func,
    onDataUpdate: PropTypes.func,
};

SelectRoutes.defaultProps = {
    data: {},
    onStepUpdate: () => {},
    onDataUpdate: () => {},
};

export default SelectRoutes;
