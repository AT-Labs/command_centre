import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Autosuggest from 'react-autosuggest';
import { debounce, isEmpty } from 'lodash-es';
import { BsExclamationCircle } from 'react-icons/bs';
import Icon from '../Icon/Icon';
import SearchResultItem from './SearchResultItem';
import { SearchResultsShape } from './Shapes';
import SearchLoader from './SearchLoader';
import SearchClearButton from './SearchClearButton';
import CustomSelect from './CustomSelect/CustomSelect';
import { SEARCH_BAR_INPUT_STATE } from './constants';
import './Search.scss';

export class Search extends Component {
    static propTypes = {
        suggestions: SearchResultsShape,
        customTheme: PropTypes.object.isRequired,
        isLoading: PropTypes.bool,
        onSearch: PropTypes.func.isRequired,
        onClear: PropTypes.func.isRequired,
        onSelection: PropTypes.func.isRequired,
        onUnselection: PropTypes.func,
        onInputValueChange: PropTypes.func,
        showValue: PropTypes.bool,
        isIconVisible: PropTypes.bool,
        placeholder: PropTypes.string.isRequired,
        searchInCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
        value: PropTypes.string,
        onClearCallBack: PropTypes.func,
        shouldRenderSuggestions: PropTypes.func,
        isDisabled: PropTypes.bool,
        id: PropTypes.string,
        inputId: PropTypes.string,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        onResetCallBack: PropTypes.func,
        multiSearch: PropTypes.bool,
        label: PropTypes.string,
        selectedEntities: PropTypes.object,
        showTags: PropTypes.bool,
        isValid: PropTypes.bool,
    };

    static defaultProps = {
        suggestions: [],
        isLoading: false,
        showValue: false,
        isIconVisible: false,
        value: '',
        onInputValueChange: null,
        onClearCallBack: null,
        shouldRenderSuggestions: () => true,
        isDisabled: false,
        id: '',
        inputId: '',
        onFocus: null,
        onBlur: null,
        onResetCallBack: null,
        multiSearch: false,
        label: '',
        onUnselection: null,
        selectedEntities: {},
        showTags: true,
        isValid: true,
    };

    static NO_RESULTS = 'No Results';

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            selected: null,
            isPending: false,
            focus: false,
            inputCollapseState: SEARCH_BAR_INPUT_STATE.INITIAL,
            multiValue: '',
            searchPerformed: false,
        };

        this.debouncedSearch = debounce((searchTerms) => {
            this.setState({ isPending: false, searchPerformed: true });
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

    onSuggestionsFetchRequested = ({ value }) => this.debouncedSearch(value);

    onSuggestionsClearRequested = () => this.props.onClear();

    onSuggestionSelected = (event, { suggestion }) => {
        if (suggestion.noResultPlaceHolder) {
            this.setState({ value: '', selected: null });
            return;
        }

        const value = this.props.showValue ? suggestion.text : '';
        this.setState({ selected: suggestion, value });
        this.props.onSelection(suggestion);
    };

    getSuggestionValue = suggestion => suggestion.text;

    getSuggestionsToDisplay = () => {
        const { suggestions, isLoading } = this.props;
        const { value, isPending } = this.state;

        if (isEmpty(suggestions) && value && !isLoading && !isPending) {
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
    };

    getSectionSuggestions = section => section.items;

    handleInputChange = (event, { newValue }) => {
        this.setState({ value: newValue, isPending: true });
        if (this.props.onInputValueChange) this.props.onInputValueChange(newValue);
    };

    handleInputChangeMultiSelect = (multiValue, reason) => {
        if (reason.action === 'set-value'
            || reason.action === 'input-blur'
            || reason.action === 'menu-close') {
            return;
        }
        if (multiValue) {
            this.setState({ multiValue, isPending: true });
            this.debouncedSearch(multiValue);
        } else {
            this.setState({ multiValue, searchPerformed: false });
            this.props.onClear();
        }
    };

    handleChange = (selected, reason) => {
        this.setState({ multiValue: '' });
        switch (reason.action) {
        case 'select-option':
            this.props.onSelection(reason.option);
            break;
        case 'deselect-option':
            if (this.props.onUnselection) this.props.onUnselection(reason.option);
            break;
        case 'pop-value':
        case 'remove-value':
            if (this.props.showTags && this.props.onUnselection && reason.removedValue) {
                this.props.onUnselection(reason.removedValue);
            }
            break;
        default:
        }
    };

    handleClearButtonClick = () => {
        if (this.props.onClearCallBack) this.props.onClearCallBack();
        this.props.onClear(this.state.selected);
        this.setState({ value: '', selected: null });
    };

    renderSuggestion = suggestion => <SearchResultItem { ...suggestion } />;

    renderSectionTitle = section => (section.category.label ? <small>{section.category.label}</small> : null);

    handleFocus = () => {
        this.setState({ focus: true });
        if (this.props.onFocus) this.props.onFocus();
    };

    handleBlur = () => {
        this.setState({ multiValue: '', focus: false, searchPerformed: false });
        if (this.props.onBlur) this.props.onBlur();
        this.props.onClear();
    };

    handleResetButtonClick = () => {
        this.setState({ multiValue: '', inputCollapseState: SEARCH_BAR_INPUT_STATE.INITIAL });
        if (this.props.onResetCallBack) this.props.onResetCallBack();
        this.props.onClear();
    };

    setInputCollapse = (value) => {
        this.setState({ inputCollapseState: value });
    };

    menuIsOpen = () => this.state.focus && this.state.searchPerformed;

    getMultiSelectSuggestions = () => {
        const { suggestions } = this.props;

        return suggestions.map(section => ({
            label: section.category.label,
            options: section.items,
        }));
    };

    getSelectedEntities = () => Object.values(this.props.selectedEntities);

    render() {
        const { value, focus, inputCollapseState, multiValue } = this.state;
        const inputProps = {
            placeholder: this.props.placeholder,
            onChange: this.handleInputChange,
            onFocus: this.handleFocus,
            onBlur: this.handleBlur,
            value,
            id: this.props.inputId,
            disabled: this.props.isDisabled,
        };

        return (
            <section className={ `search position-relative ${this.props.isLoading ? 'search--loading' : ''}` }>
                { !this.props.multiSearch && (
                    <Autosuggest
                        theme={ this.props.customTheme }
                        id={ this.props.id || 'default' }
                        multiSection
                        shouldRenderSuggestions={ this.props.shouldRenderSuggestions }
                        suggestions={ this.getSuggestionsToDisplay() }
                        getSectionSuggestions={ this.getSectionSuggestions }
                        onSuggestionsFetchRequested={ this.onSuggestionsFetchRequested }
                        onSuggestionsClearRequested={ this.onSuggestionsClearRequested }
                        onSuggestionSelected={ this.onSuggestionSelected }
                        getSuggestionValue={ this.getSuggestionValue }
                        renderSuggestion={ this.renderSuggestion }
                        renderSectionTitle={ this.renderSectionTitle }
                        inputProps={ inputProps } />
                ) }
                { this.props.multiSearch && (
                    <CustomSelect
                        className="react-select__container"
                        classNamePrefix="react-select"
                        isClearable={ false }
                        isMulti={ this.props.multiSearch }
                        onInputChange={ this.handleInputChangeMultiSelect }
                        onChange={ this.handleChange }
                        onFocus={ this.handleFocus }
                        onBlur={ this.handleBlur }
                        options={ this.getMultiSelectSuggestions() }
                        getOptionLabel={ option => option.text }
                        getOptionValue={ option => option.text }
                        placeholder={ this.props.placeholder }
                        hideSelectedOptions={ false }
                        closeMenuOnSelect={ false }
                        openMenuOnClick={ false }
                        isSearchable
                        inputCollapseState={ inputCollapseState }
                        setInputCollapse={ this.setInputCollapse }
                        label={ this.props.label }
                        onReset={ this.props.onResetCallBack ? this.handleResetButtonClick : null }
                        focus={ focus }
                        value={ this.getSelectedEntities() }
                        menuIsOpen={ this.menuIsOpen() }
                        noOptionsMessage={ () => Search.NO_RESULTS }
                        inputValue={ multiValue }
                        loading={ this.props.isLoading }
                        filterOption={ () => true }
                        controlShouldRenderValue={ this.props.showTags } />
                ) }
                { this.props.isIconVisible && <Icon className="search__icon position-absolute" icon="search" /> }
                { this.props.isValid && !this.props.isDisabled && this.state.value && !this.props.isLoading && !this.props.multiSearch
                && <SearchClearButton onClick={ this.handleClearButtonClick } /> }
                { this.props.isLoading && !this.props.multiSearch && <SearchLoader /> }
                { !this.props.isValid && <BsExclamationCircle className="search__alert position-absolute" size={ 16 } color="#dc3545" />}
            </section>
        );
    }
}

export default Search;
