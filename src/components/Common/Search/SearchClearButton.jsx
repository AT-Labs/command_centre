import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../Icon/Icon';

const SearchClearButton = ({ onClick, label }) => (
    <button
        type="button"
        className="close search__clear position-absolute bg-transparent border-0"
        aria-label={ label }
        onClick={ onClick }>
        <Icon
            aria-hidden="true"
            icon="close" />
    </button>
);

SearchClearButton.propTypes = {
    onClick: PropTypes.func.isRequired,
    label: PropTypes.string,
};

SearchClearButton.defaultProps = {
    label: 'Clear Search Text',
};

export default SearchClearButton;
