import React from 'react';
import { components } from 'react-select';
import PropTypes from 'prop-types';
import { Label, Input } from 'reactstrap';

const Option = props => (
    <components.Option { ...props }>
        <Label for={ `checkbox_${props.value}` }>{ props.value }</Label>
        <Input
            id={ `checkbox_${props.value}` }
            type="checkbox"
            checked={ props.isSelected }
            onChange={ () => null }
        />
    </components.Option>
);

Option.propTypes = {
    value: PropTypes.string.isRequired,
    isSelected: PropTypes.bool.isRequired,
};

export default Option;
