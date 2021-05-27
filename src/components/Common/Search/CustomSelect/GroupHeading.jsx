import React from 'react';
import { components } from 'react-select';
import PropTypes from 'prop-types';
import { get } from 'lodash-es';

const GroupHeading = props => (
    <components.GroupHeading { ...props }>
        <div>{ props.children }</div>
        { get(props, 'data.label') && get(props, 'selectProps.options[0].label')
        && props.data.label === props.selectProps.options[0].label && (
            <div>Select</div>
        ) }
    </components.GroupHeading>
);

GroupHeading.propTypes = {
    children: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    selectProps: PropTypes.object.isRequired,
};

export default GroupHeading;
