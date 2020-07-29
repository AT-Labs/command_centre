import React from 'react';
import PropTypes from 'prop-types';
import { IoIosArrowDown, IoMdClose } from 'react-icons/io';
import SelectedItemToken from './SelectedItemToken';
import './SelectHead.scss';

const widthPerCharacter = 11;
const offsetPerItem = 5;

class SelectHead extends React.Component {
    static propTypes = {
        theme: PropTypes.object.isRequired,
        disabled: PropTypes.bool,
        shouldShowArrow: PropTypes.bool,
        allSelected: PropTypes.bool,
        withClearButton: PropTypes.bool,
        selectedOptions: PropTypes.array,
        displayProps: PropTypes.object.isRequired,
        onClick: PropTypes.func,
        onClear: PropTypes.func,
        onItemDelete: PropTypes.func,
        onInputChange: PropTypes.func,
        inputRef: PropTypes.object,
    };

    static defaultProps = {
        allSelected: false,
        shouldShowArrow: true,
        disabled: false,
        withClearButton: true,
        selectedOptions: [],
        onClick: () => {},
        onClear: () => {},
        onItemDelete: () => {},
        onInputChange: () => {},
        inputRef: {},
    };

    constructor(props) {
        super(props);
        this.state = {
            inputValue: '',
        };
        this.originRef = React.createRef();
    }

    handleBackspace = (event) => {
        if (!event.currentTarget.value && this.props.selectedOptions.length > 0) {
            this.props.onItemDelete(this.props.selectedOptions[this.props.selectedOptions.length - 1]);
        }
    }

    handleKeyDown = (event) => {
        if (event.which === 0x8) {
            this.handleBackspace(event);
        }
    }

    handleClear = () => {
        this.setState({ inputValue: '' });
        this.props.onClear();
    }

    handleInputChange = (event) => {
        const inputValue = event.target.value;
        this.setState({ inputValue });
        this.props.onInputChange(inputValue);
    }

    renderSearchInput = placeholder => (
        <input
            type="text"
            key="searchInput"
            ref={ this.props.inputRef }
            disabled={ this.props.disabled }
            className="select-head-input border-0 w-100"
            placeholder={ placeholder }
            value={ this.state.inputValue }
            onInput={ this.handleInputChange }
            onKeyDown={ this.handleKeyDown }
        />
    )

    renderSelectedItemTokens = () => {
        if (this.props.selectedOptions.length === 0) {
            return this.renderSearchInput(this.props.displayProps.DEFAULT_PLACEHOLDER);
        }
        if (this.props.allSelected) {
            return this.renderSearchInput(this.props.displayProps.ALL_OPTIONS_ARE_SELECTED);
        }
        const res = [];
        const wrapWidth = this.originRef.current ? this.originRef.current.clientWidth : 0;
        let innerWidth = 0;
        let renderCount = 0;

        const totalOptionsCount = this.props.selectedOptions.length;
        this.props.selectedOptions.forEach((option) => {
            innerWidth += (option.label.length * widthPerCharacter) + offsetPerItem;
            if (innerWidth < wrapWidth) {
                renderCount += 1;
                res.push(<SelectedItemToken option={ option } key={ option.value } onDelete={ this.props.onItemDelete } />);
            }
        });

        if (renderCount === 0) {
            innerWidth = 0;
        }

        let remainCount = totalOptionsCount - renderCount;
        if (remainCount === 1 || renderCount === 0) {
            const option = this.props.selectedOptions[renderCount];
            const remainWidth = (option.label.length * widthPerCharacter) + offsetPerItem + wrapWidth - innerWidth;
            const charactersCanDisplay = remainWidth / widthPerCharacter;
            let { label } = option;
            let truncated = false;
            if (option.label.length - charactersCanDisplay > 2) {
                truncated = true;
                label = `${option.label.substr(0, charactersCanDisplay)}...`;
            }
            res.push(
                <SelectedItemToken option={ { value: option.value, label } } key={ option.value } onDelete={ this.props.onItemDelete } tooltip={ truncated && option.label } />,
            );
            remainCount -= 1;
        }
        if (remainCount > 1) {
            const tooltip = this.props.selectedOptions.slice(renderCount).map(option => option.label).join(', ');
            res.push(<SelectedItemToken color="secondary" option={ { value: 'remainOptions', label: `+${remainCount}` } } key="remainOptions" tooltip={ tooltip } />);
        }
        res.push(this.renderSearchInput());
        return res;
    }

    render = () => (
        <React.Fragment>
            <div
                role="button"
                tabIndex="0"
                className={ `select-head-wrap d-flex ${this.props.theme.input} ${this.props.disabled ? 'disabled' : ''}` }
                onClick={ this.props.onClick }
                onKeyPress={ () => {} }
                ref={ this.originRef }>
                {this.renderSelectedItemTokens()}
            </div>
            { this.props.shouldShowArrow && (
                <IoIosArrowDown
                    className="control-search__icon control-search__icon--down text-info"
                    size={ 20 }
                    role="button"
                    aria-label="Show search results" />
            )}
            {this.props.selectedOptions && this.props.selectedOptions.length > 0 && this.props.withClearButton && (
                <IoMdClose
                    className={ `control-search__icon control-search__icon--clear text-secondary ${this.props.shouldShowArrow ? 'mr-4' : ''}` }
                    size={ 20 }
                    onClick={ this.handleClear }
                    role="button"
                    aria-label="Clear search text" />
            )}
        </React.Fragment>
    );
}

export default SelectHead;
