import React from 'react';
import { Label } from 'reactstrap';
import PropTypes from 'prop-types';

export const EntityCheckbox = ({ checked, onChange, label, id }) => (
    <div className="checkbox-container">
        <input
            id={ id }
            type="checkbox"
            checked={ checked }
            onChange={ onChange }
            className="mr-3"
        />
        <Label for={ id } className="font-size-md">{ label }</Label>
    </div>
);

EntityCheckbox.propTypes = {
    id: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
};
