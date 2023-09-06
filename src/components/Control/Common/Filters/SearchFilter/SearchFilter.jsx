import React from 'react';
import PropTypes from 'prop-types';

import OmniSearch from '../../../../OmniSearch/OmniSearch';
import SearchTheme from '../../search-theme';
import './SearchFilter.scss';

const SearchFilter = (props) => {
    const handleInputValueChange = (value) => {
        props.onHandleInputValueChange(value);
        if (!value) props.onClearCallBack();
    };

    return (
        <div>
            { props.label && (
                <label // eslint-disable-line
                    htmlFor="control-filters-search"
                    className="font-size-md font-weight-bold">
                    {props.label}
                </label>
            ) }
            <OmniSearch
                id="control-filters-search"
                inputRef={ props.inputRef }
                theme={ SearchTheme }
                placeholder={ props.placeholder }
                value={ props.value }
                isSelectedValueShown
                searchInCategory={ props.searchInCategory }
                selectionHandlers={ { ...props.selectionHandlers } }
                clearHandlers={ { ...props.clearHandlers } }
                onClearCallBack={ props.onClearCallBack }
                isDisabled={ props.isDisabled }
                isValid={ props.isValid }
                onInputValueChange={ handleInputValueChange }
                inputId={ props.inputId } />
        </div>
    );
};

SearchFilter.propTypes = {
    selectionHandlers: PropTypes.object.isRequired,
    clearHandlers: PropTypes.object.isRequired,
    value: PropTypes.string,
    inputId: PropTypes.string,
    placeholder: PropTypes.string,
    searchInCategory: PropTypes.array.isRequired,
    onClearCallBack: PropTypes.func.isRequired,
    onHandleInputValueChange: PropTypes.func,
    isDisabled: PropTypes.bool,
    isValid: PropTypes.bool,
    inputRef: PropTypes.object,
    label: PropTypes.string,
};

SearchFilter.defaultProps = {
    placeholder: '',
    value: '',
    inputId: '',
    isDisabled: false,
    isValid: true,
    inputRef: {},
    onHandleInputValueChange: () => {},
    label: '',
};

export default SearchFilter;
