import React from 'react';
import PropTypes from 'prop-types';
import SelectEntitiesPicklist from '../../SelectEntitiesPicklist';

const SelectRoutes = props => (
    <div>
        <SelectEntitiesPicklist
            data={ props.data }
            onClose={ () => props.onStepUpdate(null) }
            continueButtonLabel="Continue to stops"
            type="routes"
            onDataUpdate={ selectedItem => props.onDataUpdate('affectedRoutes', selectedItem) }
            onSubmit={ () => props.onStepUpdate(1) } />
    </div>
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
