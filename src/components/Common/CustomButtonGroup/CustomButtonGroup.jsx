import React from 'react';
import PropTypes from 'prop-types';
import { uniqueId } from 'lodash-es';
import { Button, ButtonGroup } from 'reactstrap';

const createButton = (onSelection, selectedOptions, button) => {
    const { type, label } = button;
    return (
        <Button
            className={ `btn ${selectedOptions.includes(type) ? 'btn-info' : 'btn-white'} text-capitalize border border-primary` }
            onClick={ () => onSelection(type) }
            key={ uniqueId() }>
            { label || type }
        </Button>
    );
};

const CustomButtonGroup = ({ onSelection, className, selectedOptions, buttons }) => (
    <div className={ `btn-group btn-group-toggle ${className}` }>
        <ButtonGroup>
            {buttons.map(button => createButton(onSelection, selectedOptions, button))}
        </ButtonGroup>
    </div>
);

CustomButtonGroup.propTypes = {
    buttons: PropTypes.array.isRequired,
    onSelection: PropTypes.func.isRequired,
    selectedOptions: PropTypes.arrayOf(PropTypes.string).isRequired,
    className: PropTypes.string,
};

CustomButtonGroup.defaultProps = {
    className: '',
};

export default CustomButtonGroup;
