import React from 'react';
import PropTypes from 'prop-types';
import SelectEntitiesPicklist from '../../SelectEntitiesPicklist';

const SelectStops = props => (
    <div>
        <SelectEntitiesPicklist
            data={ props.data }
            cancelButtonLabel="Back to routes"
            continueButtonLabel="Continue to details"
            onClose={ () => props.onStepUpdate(0) }
            type="stops"
            onDataUpdate={ selectedItem => props.onDataUpdate('affectedStops', selectedItem) }
            onSubmit={ () => props.onStepUpdate(2) } />
    </div>
);
SelectStops.propTypes = {
    data: PropTypes.object,
    onStepUpdate: PropTypes.func,
    onDataUpdate: PropTypes.func,
};

SelectStops.defaultProps = {
    data: {},
    onStepUpdate: () => {},
    onDataUpdate: () => {},
};

export default SelectStops;
