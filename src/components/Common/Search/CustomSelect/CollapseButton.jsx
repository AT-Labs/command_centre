import React from 'react';
import PropTypes from 'prop-types';

import { BsCaretDownFill, BsCaretUpFill } from 'react-icons/bs';

import { SEARCH_BAR_INPUT_STATE } from '../constants';

const CollapseButton = ({ onClick, label, collapseState }) => {
    const toggleCollapse = () => (
        collapseState === SEARCH_BAR_INPUT_STATE.COLLAPSED
            ? onClick(SEARCH_BAR_INPUT_STATE.EXPANDED)
            : onClick(SEARCH_BAR_INPUT_STATE.COLLAPSED)
    );

    return (
        <div className="search__collapse">
            { collapseState !== SEARCH_BAR_INPUT_STATE.INITIAL && (
                <button
                    type="button"
                    className="bg-transparent border-0"
                    aria-label={ label }
                    onClick={ toggleCollapse }>
                    { collapseState === SEARCH_BAR_INPUT_STATE.EXPANDED && (
                        <BsCaretUpFill className="selection-item__icon" />
                    )}
                    { collapseState === SEARCH_BAR_INPUT_STATE.COLLAPSED && (
                        <BsCaretDownFill className="selection-item__icon" />
                    )}
                </button>
            ) }
        </div>
    );
};

CollapseButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    label: PropTypes.string,
    collapseState: PropTypes.string.isRequired,
};

CollapseButton.defaultProps = {
    label: 'Collapse Search Bar',
};

export default CollapseButton;
