import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import _ from 'lodash-es';

import Icon from '../Icon/Icon';
import SearchResultItem from './SearchResultItem';
import { SearchResultsShape } from './Shapes';
import SearchLoader from './SearchLoader';
import SearchClearButton from './SearchClearButton';

export class Search extends Component {
    static propTypes = {
        suggestions: SearchResultsShape,
        customTheme: PropTypes.object.isRequired,
        isLoading: PropTypes.bool,
        onSearch: PropTypes.func.isRequired,
        onClear: PropTypes.func.isRequired,
        onSelection: PropTypes.func.isRequired,
        onInputValueChange: PropTypes.func,
        showValue: PropTypes.bool,
        isIconVisible: PropTypes.bool,
        placeholder: PropTypes.string.isRequired,
        searchInCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
        value: PropTypes.string,
        onClearCallBack: PropTypes.func,
        isDisabled: PropTypes.bool,
        id: PropTypes.string,
        inputId: PropTypes.string,
    }

    static defaultProps = {
        suggestions: [],
        isLoading: false,
        showValue: false,
        isIconVisible: false,
        value: '',
        onInputValueChange: null,
        onClearCallBack: null,
        isDisabled: false,
        id: '',
        inputId: '',
    }

    static NO_RESULTS = 'No Results';

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            selected: null,
            isPending: false,
        };

        this.debouncedSearch = _.debounce((searchTerms) => {
            this.setState({ isPending: false });
            if (searchTerms) props.onSearch(searchTerms, this.props.searchInCategory);
        }, 350);
    }

    /* eslint-disable react/no-did-update-set-state */
    // https://github.com/airbnb/javascript/issues/1875
    // technically allowed with caveats in particular cases
    // like here (need to mirror prop change to pass it down to autosuggest)
    componentDidUpdate(prevProps) {
        if (this.props.value !== prevProps.value) {
            this.setState({ value: this.props.value });
        }
    }

    onSuggestionsFetchRequested = ({ value }) => this.debouncedSearch(value)

    onSuggestionsClearRequested = () => this.props.onClear()

    onSuggestionSelected = (event, { suggestion }) => {
        if (suggestion.noResultPlaceHolder) {
            this.setState({ value: '', selected: null });
            return;
        }

        const value = this.props.showValue ? suggestion.text : '';
        this.setState({ selected: suggestion, value });
        this.props.onSelection(suggestion);
    }

    getSuggestionValue = suggestion => suggestion.text;

    getSuggestionsToDisplay = () => {
        const { suggestions, isLoading } = this.props;
        const { value, isPending } = this.state;

        if (_.isEmpty(suggestions) && value && !isLoading && !isPending) {
            return [{
                category: {
                    label: '',
                },
                items: [{
                    text: Search.NO_RESULTS,
                    noResultPlaceHolder: true,
                }],
            }];
        }

        return suggestions;
    }

    getSectionSuggestions = section => section.items;

    handleInputChange = (event, { newValue }) => {
        this.setState({ value: newValue, isPending: true });
        if (this.props.onInputValueChange) this.props.onInputValueChange(newValue);
    }

    handleClearButtonClick = () => {
        if (this.props.onClearCallBack) this.props.onClearCallBack();
        this.props.onClear(this.state.selected);
        this.setState({ value: '', selected: null });
    }

    renderSuggestion = suggestion => <SearchResultItem { ...suggestion } />

    renderSectionTitle = section => (section.category.label ? <small>{section.category.label}</small> : null)

    render() {
        const { value } = this.state;
        const inputProps = {
            placeholder: this.props.placeholder,
            onChange: this.handleInputChange,
            onFocus: () => this.setState({ isPending: true }),
            value,
            id: this.props.inputId,
            disabled: this.props.isDisabled,
        };

        return (
            <section className={ `search position-relative ${this.props.isLoading ? 'search--loading' : ''}` }>
                <Autosuggest
                    theme={ this.props.customTheme }
                    id={ this.props.id || 'default' }
                    multiSection
                    suggestions={ this.getSuggestionsToDisplay() }
                    getSectionSuggestions={ this.getSectionSuggestions }
                    onSuggestionsFetchRequested={ this.onSuggestionsFetchRequested }
                    onSuggestionsClearRequested={ this.onSuggestionsClearRequested }
                    onSuggestionSelected={ this.onSuggestionSelected }
                    getSuggestionValue={ this.getSuggestionValue }
                    renderSuggestion={ this.renderSuggestion }
                    renderSectionTitle={ this.renderSectionTitle }
                    inputProps={ inputProps } />
                { this.props.isIconVisible && <Icon className="search__icon position-absolute" icon="search" /> }
                { this.state.value && !this.props.isLoading
                && <SearchClearButton onClick={ this.handleClearButtonClick } /> }
                { this.props.isLoading && <SearchLoader /> }
            </section>
        );
    }
}

export default Search;
