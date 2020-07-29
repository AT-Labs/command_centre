import React from 'react';
import PropTypes from 'prop-types';
import { Button, Badge, UncontrolledTooltip } from 'reactstrap';
import './SelectedItemToken.scss';

const SelectedItemToken = ({ option, tooltip, color, onDelete }) => (
    <React.Fragment>
        <Badge id={ `selectedItemToken_${option.value}` } color={ color } role="button" className="d-flex mr-1">
            { option.label }
            { onDelete && <Button close size="sm" className="ml-1" onClick={ () => onDelete(option) } /> }
        </Badge>
        { tooltip && <UncontrolledTooltip placement="bottom" target={ `selectedItemToken_${option.value}` }>{ tooltip }</UncontrolledTooltip> }
    </React.Fragment>
);

SelectedItemToken.propTypes = {
    option: PropTypes.object.isRequired,
    tooltip: PropTypes.string,
    color: PropTypes.string,
    onDelete: PropTypes.func,
};

SelectedItemToken.defaultProps = {
    color: 'info',
    tooltip: '',
    onDelete: undefined,
};

export default SelectedItemToken;
