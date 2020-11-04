import React from 'react';
import PropTypes from 'prop-types';
import { uniqueId } from 'lodash-es';
import { Button, ButtonGroup } from 'reactstrap';

const createButton = (onSelection, selectedOption, button) => {
    const { type, label } = button;
    return (
        <Button
            className={ `btn ${selectedOption === type ? 'btn-info' : 'btn-white'} text-capitalize border border-primary` }
            onClick={ () => onSelection(type) }
            key={ uniqueId() }>
            { label || type }
        </Button>
    );
};

const CustomButtonGroup = ({ onSelection, className, selectedOption, buttons }) => (
    <div className={ `btn-group btn-group-toggle ${className}` }>
        <ButtonGroup>
            {buttons.map(button => createButton(onSelection, selectedOption, button))}
        </ButtonGroup>
    </div>
);

CustomButtonGroup.propTypes = {
    buttons: PropTypes.array.isRequired,
    onSelection: PropTypes.func.isRequired,
    selectedOption: PropTypes.string.isRequired,
    className: PropTypes.string,
};

CustomButtonGroup.defaultProps = {
    className: '',
};

export default CustomButtonGroup;
