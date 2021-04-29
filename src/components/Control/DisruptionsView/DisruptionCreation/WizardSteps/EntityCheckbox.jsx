import React from 'react';
import { Label } from 'reactstrap';
import PropTypes from 'prop-types';

export const EntityCheckbox = ({ checked, onChange, label }) => (
    <div className="checkbox-container">
        <input
            type="checkbox"
            checked={ checked }
            onChange={ onChange }
            className="mr-3"
        />
        <Label className="font-size-md">{ label }</Label>
    </div>
);

EntityCheckbox.propTypes = {
    checked: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string.isRequired,
};
