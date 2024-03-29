import PropTypes from 'prop-types';
import React from 'react';
import Autosuggest from 'react-autosuggest';
import { result, isEmpty, differenceWith, isEqual, filter } from 'lodash-es';
import { IoIosArrowDown, IoMdClose } from 'react-icons/io';

import SearchTheme from '../search-theme';

import './ControlSearch.scss';

class ControlSearch extends React.Component {
    static propTypes = {
        data: PropTypes.oneOfType([PropTypes.array, PropTypes.object, PropTypes.func]).isRequired,
        getDataToExclude: PropTypes.func,
        pathToProperty: PropTypes.string.isRequired,
        pathToEditedPropForSuggestion: PropTypes.string,
        onSelection: PropTypes.func.isRequired,
        onInputValueChange: PropTypes.func,
        placeholder: PropTypes.string,
        withClearButton: PropTypes.bool,
        id: PropTypes.string,
        inputId: PropTypes.string,
        className: PropTypes.string,
        label: PropTypes.string,
        value: PropTypes.string,
        disabled: PropTypes.bool,
        updateOnPropsValueChange: PropTypes.bool,
        shouldRenderSuggestions: PropTypes.func,
        shouldShowArrow: PropTypes.bool,
        isOptional: PropTypes.bool,
        focusInputBackOnClickOut: PropTypes.bool,
        onClose: PropTypes.func,
        // focusInputBackOnClickOut: This prop is meant to give us the flexibility to choose
        // whether we want the input to be focused when you click out of the screen after selection and back.
        // E.g:
        // - Select a value from control search
        // - Click out of the window
        // - Click back on the window but not on control search
    };

    static defaultProps = {
        shouldShowArrow: true,
        shouldRenderSuggestions: null,
        pathToEditedPropForSuggestion: '',
        getDataToExclude: null,
        onInputValueChange: null,
        placeholder: '',
        withClearButton: true,
        className: '',
        inputId: '',
        id: '',
        label: '',
        value: '',
        disabled: false,
        updateOnPropsValueChange: false,
        focusInputBackOnClickOut: false,
        onClose: null,
        isOptional: false,
    };

    constructor(props) {
        super(props);

        this.state = {
            value: props.value,
            selectedSuggestion: null,
            suggestions: [],
        };

        this.autosuggestInputRef = React.createRef();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.updateOnPropsValueChange && nextProps.value === '') {
            this.setState({ value: '', selectedSuggestion: null });
        } else if (!isEmpty(nextProps.value) && this.props.value !== nextProps.value) {
            this.setState({ value: nextProps.value });
        }
    }

    escapeRegexCharacters = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    getSuggestions = (value, reason) => {
        const { data, pathToProperty, pathToEditedPropForSuggestion } = this.props;

        // if the input has not changed (eg combo clicked or key up/down), we want to drop down and show all
        const dataToExclude = (this.props.getDataToExclude) ? this.props.getDataToExclude() : [];
        if (reason !== 'input-changed') {
            const dataFinal = differenceWith(
                data,
                dataToExclude,
                isEqual,
            );
            return dataFinal;
        }
        let dataToExcludeFinal = dataToExclude;
        // if an item is selected by click, we remove it from the data to exclude
        // so that it will appear in the list for selection.
        if (this.state.selectedSuggestion != null) {
            const selectedSuggestionArray = [];
            selectedSuggestionArray.push(this.state.selectedSuggestion);
            dataToExcludeFinal = differenceWith(
                dataToExclude,
                selectedSuggestionArray,
                isEqual,
            );
        }
        const dataFinal = differenceWith(
            data,
            dataToExcludeFinal,
            isEqual,
        );
        const escapedValue = this.escapeRegexCharacters(value.trim()).replace(/  +/g, ' ');
        const regex = new RegExp(`${escapedValue}`, 'i');
        return filter(dataFinal, (each) => {
            let propToSearch = result(each, pathToProperty);
            if (pathToEditedPropForSuggestion) {
                propToSearch = `${propToSearch} ${result(each, pathToEditedPropForSuggestion)}`;
            }
            propToSearch = propToSearch.replace(/  +/g, ' ');
            return regex.test(propToSearch);
        });
    };

    getSuggestionValue = suggestion => result(suggestion, this.props.pathToProperty);

    renderSuggestion = (suggestion) => {
        const label = result(suggestion, this.props.pathToProperty);
        const labelAndAllocatedBlock = result(suggestion, this.props.pathToEditedPropForSuggestion);
        return (
            <span>
                { label }
                <b>{ labelAndAllocatedBlock }</b>
            </span>
        );
    };

    onChange = (event, { newValue }) => {
        this.setState({ value: newValue, selectedSuggestion: null });
        if (this.props.onInputValueChange) this.props.onInputValueChange(newValue);
    };

    onSuggestionSelected = (event, { suggestion }) => {
        this.props.onSelection(suggestion);
        this.setState({ selectedSuggestion: suggestion });
    };

    onSuggestionsFetchRequested = ({ value, reason }) => {
        if (this.props.focusInputBackOnClickOut && reason === 'input-focused' && value) return;
        this.setState({ suggestions: this.getSuggestions(value, reason) });
    };

    onSuggestionsClearRequested = () => this.setState({ suggestions: [] });

    renderInputComponent = inputProps => (
        <>
            <input { ...inputProps } />
            { !this.props.disabled && this.props.shouldShowArrow && (
                <IoIosArrowDown
                    className="control-search__icon control-search__icon--down text-info"
                    size={ 20 }
                    onClick={ () => this.autosuggestInputRef.current.input.focus() }
                    role="button"
                    aria-label="Show search results" />
            )}
            { !this.props.disabled && this.state.value && this.props.withClearButton && (
                <IoMdClose
                    className={ `control-search__icon control-search__icon--clear text-secondary ${this.props.shouldShowArrow ? 'mr-4' : ''}` }
                    size={ 20 }
                    onClick={ () => { this.onChange({}, { newValue: '' }); if (this.props.onClose !== null) this.props.onClose(); } }
                    role="button"
                    aria-label="Clear search text" />
            )}
        </>
    );

    render() {
        const { value, suggestions } = this.state;
        const inputProps = {
            placeholder: this.props.placeholder,
            value,
            onChange: this.onChange,
            id: this.props.inputId,
            disabled: this.props.disabled,
        };

        return (
            <section className={ `control-search ${this.props.className}` }>
                {this.props.label && (
                    <label // eslint-disable-line
                        htmlFor={ this.props.inputId }
                        className="font-size-md font-weight-bold">
                        { this.props.label }
                        {' '}
                        { this.props.isOptional && <small className="text-muted">optional</small> }
                    </label> // eslint-disable-line
                )}
                <Autosuggest
                    ref={ this.autosuggestInputRef }
                    id={ this.props.id || 'default' }
                    theme={ SearchTheme }
                    suggestions={ suggestions }
                    onSuggestionsFetchRequested={ this.onSuggestionsFetchRequested }
                    onSuggestionsClearRequested={ this.onSuggestionsClearRequested }
                    onSuggestionSelected={ this.onSuggestionSelected }
                    getSuggestionValue={ this.getSuggestionValue }
                    shouldRenderSuggestions={ val => (this.props.shouldRenderSuggestions ? this.props.shouldRenderSuggestions(val) : true) }
                    renderSuggestion={ this.renderSuggestion }
                    inputProps={ inputProps }
                    renderInputComponent={ this.renderInputComponent } />
            </section>
        );
    }
}

export default ControlSearch;
