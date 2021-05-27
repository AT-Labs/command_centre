import React from 'react';
import { components } from 'react-select';
import PropTypes from 'prop-types';

import ResetButton from './ResetButton';

const SelectContainer = ({ children, ...props }) => (
    <components.SelectContainer { ...props }>
        { props.selectProps.label && (props.selectProps.focus || props.selectProps.inputValue || props.selectProps.value.length !== 0) && (
            <span className="search__label">{ props.selectProps.label }</span>
        ) }
        { children }
        { props.selectProps.onReset && props.selectProps.value.length !== 0 && (
            <ResetButton onClick={ props.selectProps.onReset } />
        ) }
    </components.SelectContainer>
);

SelectContainer.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.element,
    ]).isRequired,
    selectProps: PropTypes.object.isRequired,
};

export default SelectContainer;
