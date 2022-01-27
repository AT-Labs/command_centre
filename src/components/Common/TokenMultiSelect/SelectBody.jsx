import React from 'react';
import _ from 'lodash-es';
import PropTypes from 'prop-types';
import { ListGroup } from 'reactstrap';
import SelectItem from './SelectItem';

const SELECT_ALL_VALUE = '_all';

class SelectBody extends React.Component {
    static propTypes = {
        theme: PropTypes.object.isRequired,
        options: PropTypes.array,
        selectedValues: PropTypes.array,
        onSelectionChange: PropTypes.func,
        displayProps: PropTypes.object.isRequired,
        filter: PropTypes.string,
    };

    static defaultProps = {
        options: [],
        selectedValues: [],
        onSelectionChange: () => {},
        filter: '',
    };

    constructor(props) {
        super(props);
        this.state = {
            filter: props.filter,
            optionsForSelection: props.options,
            previousPrevPropsOptions: props.options,
        };
        this.wrapper = undefined;
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        let res = {};
        if (prevState.previousPrevPropsOptions && JSON.stringify(nextProps.options) !== JSON.stringify(prevState.previousPrevPropsOptions)) {
            res = { optionsForSelection: nextProps.options };
        }
        res = Object.assign(res, { previousPrevPropsOptions: nextProps.options });
        if (prevState.filter !== nextProps.filter) {
            res = Object.assign(res, { filter: nextProps.filter });
        }
        return res;
    }

    isFilterSet = () => this.state.filter && this.state.filter.trim().length;

    getFilteredOptions = () => {
        const { filter, optionsForSelection } = this.state;
        if (this.isFilterSet()) {
            return optionsForSelection.filter(option => option.label.toLowerCase().indexOf(filter.toLowerCase()) > -1);
        }
        return optionsForSelection;
    };

    getSelectedValuesInFilter = () => {
        if (this.isFilterSet()) {
            return _.intersection(this.props.selectedValues, this.getFilteredOptions().map(option => option.value));
        }
        return this.props.selectedValues;
    };

    getSelectedValuesOutOfFilter = () => {
        if (this.isFilterSet()) {
            return _.difference(this.props.selectedValues, this.getFilteredOptions().map(option => option.value));
        }
        return [];
    };

    compareArrays = (firstArray, secondArray) => firstArray.sort().join() === secondArray.sort().join();

    isOptionChecked = (value) => {
        if (value === SELECT_ALL_VALUE) {
            return this.getFilteredOptions().length > 0 && this.compareArrays(this.getSelectedValuesInFilter(), this.getFilteredOptions().map(option => option.value));
        }
        return _.includes(this.props.selectedValues, value);
    };

    handleSelectionChange = (event) => {
        const optionValue = event.target.value;
        const optionChecked = event.target.checked;
        let newSelectedValuesInFilter = [];
        if (optionValue === SELECT_ALL_VALUE) {
            newSelectedValuesInFilter = optionChecked ? this.getFilteredOptions().map(option => option.value) : [];
        } else if (optionChecked) {
            newSelectedValuesInFilter = [...this.getSelectedValuesInFilter(), optionValue];
        } else {
            newSelectedValuesInFilter = this.getSelectedValuesInFilter().filter(selectedValues => selectedValues !== optionValue);
        }
        this.props.onSelectionChange([...this.getSelectedValuesOutOfFilter(), ...newSelectedValuesInFilter]);
    };

    renderSelectItems = () => [{ value: SELECT_ALL_VALUE, label: this.props.displayProps.SELECT_ALL }]
        .concat(this.getFilteredOptions()).map(
            option => (
                <SelectItem option={ option }
                    theme={ this.props.theme }
                    key={ `SelectItem_${option.value}` }
                    checked={ this.isOptionChecked(option.value) }
                    onSelectionChange={ this.handleSelectionChange } />
            ),
        );

    render() {
        return (
            <div className={ this.props.theme.suggestionsContainer }>
                <ListGroup className={ this.props.theme.suggestionsList }>
                    { this.renderSelectItems() }
                </ListGroup>
            </div>
        );
    }
}

export default SelectBody;
