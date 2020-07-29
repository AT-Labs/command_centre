import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup } from 'reactstrap';

import VEHICLE_TYPE, { TRAIN_TYPE_ID, BUS_TYPE_ID, FERRY_TYPE_ID } from '../../../../types/vehicle-types';

export const DEFAULT_ROUTE_TYPE = BUS_TYPE_ID;

const FilterByMode = ({ onSelection, className, selectedOption }) => {
    const createButton = type => (
        <Button
            className={ `btn ${selectedOption === type ? 'btn-info' : 'btn-white'} text-capitalize border border-primary` }
            onClick={ () => onSelection(type) }>
            { VEHICLE_TYPE[type].type }
        </Button>
    );

    return (
        <div
            className={ `btn-group btn-group-toggle ${className}` }>
            <ButtonGroup>
                { createButton(BUS_TYPE_ID) }
                { createButton(TRAIN_TYPE_ID) }
                { createButton(FERRY_TYPE_ID) }
            </ButtonGroup>
        </div>
    );
};

FilterByMode.propTypes = {
    onSelection: PropTypes.func.isRequired,
    selectedOption: PropTypes.number.isRequired,
    className: PropTypes.string,
};

FilterByMode.defaultProps = {
    className: '',
};

export default FilterByMode;
