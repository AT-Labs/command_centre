import React from 'react';
import PropTypes from 'prop-types';

import Icon from '../Icon/Icon';

const SearchResultItem = ({ text, icon }) => (
    <div>
        { icon && <Icon className="search__dropdown-item__icon mr-2" icon={ icon } /> }
        <span>
            { text }
        </span>
    </div>
);

SearchResultItem.defaultProps = {
    icon: null,
};

SearchResultItem.propTypes = {
    text: PropTypes.string.isRequired,
    icon: PropTypes.string,
};

export default SearchResultItem;
