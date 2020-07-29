import PropTypes from 'prop-types';
import React from 'react';

import './Expandable.scss';

export const Expandable = (props) => {
    const {
        isActive, level, id, onToggle, className, children, ...rest
    } = props;
    const expandableButtonId = `expandable-button-${id}`;
    const expandableRegionId = `expandable-body-${id}`;

    const childProps = {
        expandableRegionId,
        expandableButtonId,
        isActive,
        onToggle,
    };

    const childrenWithProps = React.Children.map(children, child => React.cloneElement(child, childProps));
    return (
        <div
            className={ `expandable expandable--level-${level} ${isActive ? 'expandable--is-active' : ''} ${className}` }
            { ...rest }
        >
            {childrenWithProps}
        </div>
    );
};

Expandable.propTypes = {
    id: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
    ]).isRequired,
    level: PropTypes.number,
    isActive: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    className: PropTypes.string,
    children: PropTypes.arrayOf(PropTypes.element),
};

Expandable.defaultProps = {
    level: 1,
    className: '',
    children: [],
};
