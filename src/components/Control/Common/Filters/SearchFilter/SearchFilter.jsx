import React from 'react';
import PropTypes from 'prop-types';

import OmniSearch from '../../../../OmniSearch/OmniSearch';
import SearchTheme from '../../search-theme';
import './SearchFilter.scss';

const SearchFilter = (props) => {
    const handleInputValueChange = (value) => {
        if (!value) props.onClearCallBack();
    };

    return (
        <OmniSearch
            theme={ SearchTheme }
            placeholder={ props.placeholder }
            value={ props.value }
            isSelectedValueShown
            searchInCategory={ props.searchInCategory }
            selectionHandlers={ { ...props.selectionHandlers } }
            clearHandlers={ { ...props.clearHandlers } }
            onClearCallBack={ props.onClearCallBack }
            onInputValueChange={ handleInputValueChange } />
    );
};

SearchFilter.propTypes = {
    selectionHandlers: PropTypes.object.isRequired,
    clearHandlers: PropTypes.object.isRequired,
    value: PropTypes.string.isRequired,
    placeholder: PropTypes.string,
    searchInCategory: PropTypes.array.isRequired,
    onClearCallBack: PropTypes.func.isRequired,
};

SearchFilter.defaultProps = {
    placeholder: '',
};

export default SearchFilter;
