import React from 'react';
import { Label } from 'reactstrap';
import PropTypes from 'prop-types';

export const EntityCheckbox = ({ checked, onChange, label, id, disabled }) => (
    <div className="checkbox-container">
        <input
            id={ id }
            type="checkbox"
            checked={ checked }
            onChange={ onChange }
            className="mr-3"
            disabled={ disabled }
        />
        <Label for={ id } className="font-size-md">{ label }</Label>
    </div>
);

EntityCheckbox.propTypes = {
    id: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func,
    label: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
};

EntityCheckbox.defaultProps = {
    disabled: false,
    onChange: null,
};
