import React from 'react';
import PropTypes from 'prop-types';

export const ExpandableContent = (props) => {
    if (!props.isActive) return null;

    return (
        <div
            id={ props.expandableRegionId }
            className={ `expandable__body ${props.extendClassName}` }
            role="region"
            aria-labelledby={ props.expandableButtonId }
        >
            {props.children}
        </div>
    );
};

ExpandableContent.propTypes = {
    expandableRegionId: PropTypes.string,
    expandableButtonId: PropTypes.string,
    isActive: PropTypes.bool,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
    extendClassName: PropTypes.string,
};

ExpandableContent.defaultProps = {
    expandableRegionId: 'expandable-region',
    expandableButtonId: 'expandable-button',
    isActive: false,
    children: [],
    extendClassName: '',
};

export default ExpandableContent;
