import PropTypes from 'prop-types';
import React from 'react';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';

export const ExpandableSummary = (props) => {
    const {
        isActive, children, onToggle, expandableButtonId, expandableRegionId, className, displayToggleButton, expandClassName,
    } = props;
    return (
        <div
            className={ `expandable__header ${className}` }
            role="button"
            aria-expanded={ isActive.toString() }
        >
            <div className={ `expandable__header__expand ${expandClassName}` }>
                {children}
                {displayToggleButton && (
                    <button
                        type="button"
                        className="expandable__header__expand-button"
                        onClick={ onToggle }
                        aria-controls={ expandableRegionId }
                        id={ expandableButtonId }
                    >
                        {isActive ? <IoIosArrowUp className="text-info" size={ 20 } /> : <IoIosArrowDown className="text-info" size={ 20 } />}
                    </button>
                )}
            </div>
        </div>
    );
};

ExpandableSummary.propTypes = {
    expandableRegionId: PropTypes.string,
    expandableButtonId: PropTypes.string,
    isActive: PropTypes.bool,
    onToggle: PropTypes.func,
    children: PropTypes.oneOfType([
        PropTypes.arrayOf(PropTypes.node),
        PropTypes.node,
    ]),
    className: PropTypes.string,
    displayToggleButton: PropTypes.bool,
    expandClassName: PropTypes.string,
};

ExpandableSummary.defaultProps = {
    expandableRegionId: 'expandable-region',
    expandableButtonId: 'expandable-button',
    isActive: false,
    onToggle: () => {},
    children: [],
    className: '',
    displayToggleButton: true,
    expandClassName: '',
};

export default ExpandableSummary;
