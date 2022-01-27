import React from 'react';
import PropTypes from 'prop-types';
import SelectBody from './SelectBody';
import SelectHead from './SelectHead';

const defaultDisplayProps = {
    DEFAULT_PLACEHOLDER: 'Please Select ...',
    ALL_OPTIONS_ARE_SELECTED: 'All items are Selected',
    SELECT_ALL: 'Select all',
};

const defaultTheme = {
    container: 'search__autosuggest position-relative',
    suggestionsContainer: 'search__dropdown position-absolute bg-white border-left border-right border-bottom rounded-bottom',
    suggestionsList: 'search__dropdown-menu m-0 p-0 bg-white h-100',
    suggestion: 'search__dropdown-item suggestion__text px-3 py-3',
    input: 'search__input form-control cc-form-control',
    suggestionHovered: 'bg-at-ocean-tint-10',
};

class TokenMultiSelect extends React.Component {
    static propTypes = {
        theme: PropTypes.object,
        disabled: PropTypes.bool,
        shouldShowArrow: PropTypes.bool,
        withClearButton: PropTypes.bool,
        options: PropTypes.array,
        selectedValues: PropTypes.array,
        onSelectionChange: PropTypes.func,
        displayProps: PropTypes.object,
    };

    static defaultProps = {
        theme: {},
        shouldShowArrow: true,
        disabled: false,
        withClearButton: true,
        options: [],
        selectedValues: [],
        onSelectionChange: () => {},
        displayProps: {},
    };

    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
            inputValue: '',
            selectedValues: props.selectedValues,
            previousPrevPropsSelectedValues: [],
        };
        this.wrapper = React.createRef();
        this.inputRef = React.createRef();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let res = {};
        if (prevState.previousPrevPropsSelectedValues && JSON.stringify(nextProps.selectedValues) !== JSON.stringify(prevState.previousPrevPropsSelectedValues)) {
            res = { selectedValues: nextProps.selectedValues };
        }
        res = Object.assign(res, { previousPrevPropsSelectedValues: nextProps.selectedValues });
        return res;
    }

    handleFocus = () => {
        if (!this.props.disabled) {
            this.setState({ expanded: true });
        }
        return false;
    };

    handleBlur = (e) => {
        if (!e.relatedTarget || !this.wrapper.current.contains(e.relatedTarget)) {
            this.setState({ expanded: false });
        }
    };

    handleItemsClear = () => {
        this.handleInputChange('');
        this.handleSelectionChange([]);
    };

    handleItemDelete = (option) => {
        this.handleSelectionChange(this.state.selectedValues.filter(selectedValues => selectedValues !== option.value));
    };

    handleInputChange = (inputValue) => {
        this.setState({ inputValue });
    };

    handleSelectionChange = (selectedValues) => {
        this.props.onSelectionChange(selectedValues);
        this.setState({ selectedValues });
        this.inputRef.current.focus();
    };

    getDisplayProps = () => ({ ...defaultDisplayProps, ...this.props.displayProps });

    getOption = value => this.props.options.find(option => option.value === value);

    getSelectedOptions = () => this.state.selectedValues.map(value => this.getOption(value));

    render() {
        const { expanded, inputValue } = this.state;
        return (
            <div className={ this.props.theme.container }
                // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                tabIndex="0"
                onFocus={ this.handleFocus }
                onBlur={ this.handleBlur }
                ref={ this.wrapper }>
                <SelectHead
                    theme={ { ...defaultTheme, ...this.props.theme } }
                    selectedOptions={ this.getSelectedOptions() }
                    allSelected={ this.props.options.length === this.state.selectedValues.length }
                    displayProps={ this.getDisplayProps() }
                    disabled={ this.props.disabled }
                    shouldShowArrow={ this.props.shouldShowArrow }
                    withClearButton={ this.props.withClearButton }
                    onItemDelete={ this.handleItemDelete }
                    onClear={ this.handleItemsClear }
                    onInputChange={ this.handleInputChange }
                    inputRef={ this.inputRef }
                />
                { expanded && (
                    <SelectBody
                        theme={ { ...defaultTheme, ...this.props.theme } }
                        options={ this.props.options }
                        filter={ inputValue }
                        selectedValues={ this.state.selectedValues }
                        onSelectionChange={ this.handleSelectionChange }
                        displayProps={ this.getDisplayProps() } />
                )}
            </div>
        );
    }
}

export default TokenMultiSelect;
