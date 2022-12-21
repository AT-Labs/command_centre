import { isEmpty, find, has } from 'lodash-es';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';

import { clearSearchResults, search, updateSearchLoading, updateSearchBarFocus } from '../../redux/actions/search';
import { getSearchResults, isSearchLoading } from '../../redux/selectors/search';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';
import Search from '../Common/Search/Search';
import './OmniSearch.scss';

export const defaultTheme = {
    container: 'search__autosuggest',
    suggestionsContainer: 'search__dropdown position-absolute',
    suggestionsList: 'search__dropdown-menu m-0 p-0 bg-white h-100',
    suggestion: 'search__dropdown-item suggestion__text px-3 py-3',
    input: 'search__input w-100 px-5 py-3 border-0 text-secondary bg-primary design-update-temp-placeholder--dark',
    inputOpen: 'search__input--open',
    suggestionHighlighted: 'active bg-at-ocean-tint-10',
    sectionContainer: 'search__section-container bg-white',
    sectionTitle: 'search__section-title border-top px-3 text-right text-uppercase',
};

const CATEGORY_SIZE = 4;

export const getFormattedSearchResults = (searchResults, categories) => {
    const sections = [];
    categories.forEach((type) => {
        const resultsForType = searchResults[type];
        if (!isEmpty(resultsForType)) {
            sections.push({
                category: find(SEARCH_RESULT_TYPE, { type }),
                items: resultsForType.slice(0, CATEGORY_SIZE),
            });
        }
    });

    return sections;
};

export class OmniSearch extends Component {
    static propTypes = {
        searchResults: PropTypes.object.isRequired,
        isSearchLoading: PropTypes.bool.isRequired,
        search: PropTypes.func.isRequired,
        clearSearchResults: PropTypes.func.isRequired,
        updateSearchLoading: PropTypes.func.isRequired,
        searchInCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
        selectionHandlers: PropTypes.object.isRequired,
        clearHandlers: PropTypes.object.isRequired,
        isSelectedValueShown: PropTypes.bool,
        theme: PropTypes.object,
        isIconVisible: PropTypes.bool,
        placeholder: PropTypes.string,
        value: PropTypes.string,
        onInputValueChange: PropTypes.func,
        onClearCallBack: PropTypes.func,
        shouldRenderSuggestions: PropTypes.func,
        isDisabled: PropTypes.bool,
        inputId: PropTypes.string,
        updateSearchBarFocus: PropTypes.func.isRequired,
        onResetCallBack: PropTypes.func,
        multiSearch: PropTypes.bool,
        label: PropTypes.string,
        selectedEntities: PropTypes.object,
        showTags: PropTypes.bool,
        isValid: PropTypes.bool,
        inputRef: PropTypes.object,
    };

    static defaultProps = {
        searchInCategory: null,
        isSelectedValueShown: false,
        theme: defaultTheme,
        isIconVisible: false,
        placeholder: 'Search',
        value: '',
        onInputValueChange: null,
        onClearCallBack: null,
        shouldRenderSuggestions: () => true,
        isDisabled: false,
        inputId: '',
        onResetCallBack: null,
        multiSearch: false,
        label: '',
        selectedEntities: {},
        showTags: true,
        isValid: true,
        inputRef: {},
    };

    handleSelect = (selectedItem) => {
        if (has(selectedItem, 'category.type')) {
            this.props.selectionHandlers[selectedItem.category.type](selectedItem);
        }
        this.props.updateSearchLoading(false);
    };

    handleUnselect = (selectedItem) => {
        if (has(selectedItem, 'category.type')) {
            this.props.clearHandlers[selectedItem.category.type](selectedItem);
        }
    };

    handleClear = (selectedItem) => {
        this.props.clearSearchResults();
        if (selectedItem) this.props.clearHandlers[selectedItem.category.type](selectedItem);
    };

    render() {
        return (
            <div className="omni-search flex-grow-1">
                <Search
                    inputId={ this.props.inputId }
                    inputRef={ this.props.inputRef }
                    isIconVisible={ this.props.isIconVisible }
                    showValue={ this.props.isSelectedValueShown }
                    placeholder={ this.props.placeholder }
                    customTheme={ this.props.theme }
                    suggestions={ getFormattedSearchResults(this.props.searchResults, this.props.searchInCategory) }
                    searchInCategory={ this.props.searchInCategory }
                    isLoading={ this.props.isSearchLoading }
                    onSearch={ this.props.search }
                    onClear={ this.handleClear }
                    onClearCallBack={ this.props.onClearCallBack }
                    onSelection={ this.handleSelect }
                    onUnselection={ this.handleUnselect }
                    value={ this.props.value }
                    onInputValueChange={ this.props.onInputValueChange }
                    onFocus={ () => this.props.updateSearchBarFocus(true) }
                    onBlur={ () => this.props.updateSearchBarFocus(false) }
                    isDisabled={ this.props.isDisabled }
                    onResetCallBack={ this.props.onResetCallBack }
                    multiSearch={ this.props.multiSearch }
                    label={ this.props.label }
                    selectedEntities={ this.props.selectedEntities }
                    shouldRenderSuggestions={ this.props.shouldRenderSuggestions }
                    isValid={ this.props.isValid }
                    showTags={ this.props.showTags } />
            </div>
        );
    }
}

export default connect(
    state => ({
        searchResults: getSearchResults(state),
        isSearchLoading: isSearchLoading(state),
    }),
    {
        search,
        clearSearchResults,
        updateSearchLoading,
        updateSearchBarFocus,
    },
)(OmniSearch);
