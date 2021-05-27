import React from 'react';
import { components } from 'react-select';
import PropTypes from 'prop-types';

import CollapseButton from './CollapseButton';
import SearchLoader from '../SearchLoader';

const Control = ({ children, ...props }) => (
    <components.Control { ...props }>
        { children }
        { props.selectProps.loading && (
            <SearchLoader />
        ) }
        <CollapseButton collapseState={ props.selectProps.inputCollapseState } onClick={ props.selectProps.setInputCollapse } />
    </components.Control>
);

Control.propTypes = {
    children: PropTypes.oneOfType([
        PropTypes.array,
        PropTypes.element,
    ]).isRequired,
    selectProps: PropTypes.object.isRequired,
};

export default Control;
