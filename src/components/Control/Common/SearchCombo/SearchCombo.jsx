import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import { FormGroup, Button } from 'reactstrap';

import ControlSearch from '../ControlSearch/ControlSearch';

export class SearchCombo extends React.Component {
    static propTypes = {
        data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
        pathToProperty: PropTypes.string.isRequired,
        pathToEditedPropForSuggestion: PropTypes.string,
        label: PropTypes.string,
        addButtonLabel: PropTypes.string,
        placeholder: PropTypes.string,
        onSelection: PropTypes.func.isRequired,
        maxSearchFields: PropTypes.number,
        focusInputBackOnClickOut: PropTypes.bool, // Refer to control search for details on this prop.
    };

    static defaultProps = {
        pathToEditedPropForSuggestion: '',
        placeholder: '',
        label: '',
        addButtonLabel: '',
        maxSearchFields: 2,
        focusInputBackOnClickOut: false,
    };

    constructor() {
        super();

        this.defaultSearch = {
            key: 'search-0',
            value: {},
        };

        this.state = {
            searchFields: new Map([[this.defaultSearch.key, this.defaultSearch.value]]),
            valuesString: '',
            inputsLength: 1,
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return this.state.valuesString !== nextState.valuesString
    || this.state.inputsLength !== nextState.inputsLength;
    }

    componentDidUpdate() {
        const { searchFields } = this.state;
        const isPopulated = !_.some(Array.from(searchFields.values()), _.isEmpty);
        this.props.onSelection(isPopulated, searchFields);
    }

    getSearchValues = prevState => Array.from(prevState.searchFields.values()).map(searchTerm => JSON.stringify(searchTerm)).join(','); // eslint-disable-line

    onInputValueChange = (search) => {
        this.setState((prevState) => {
            prevState.searchFields.set(search, {});
            return {
                searchFields: prevState.searchFields,
                valuesString: this.getSearchValues(prevState),
            };
        });
    };

    appendSearch() {
        const newSearch = `search-${this.state.searchFields.size}`;
        this.setState((prevState) => {
            prevState.searchFields.set(newSearch, this.defaultSearch.value);
            return {
                searchFields: prevState.searchFields,
                inputsLength: Array.from(prevState.searchFields).length,
            };
        });
    }

    removeSearchAndValues = searchToRemove => this.setState((prevState) => {
        prevState.searchFields.delete(searchToRemove);
        return {
            searchFields: prevState.searchFields,
            inputsLength: Array.from(prevState.searchFields).length,
        };
    });

    renderSearch = (search) => {
        const { searchFields } = this.state;
        return (
            <React.Fragment key={ search }>
                <ControlSearch
                    id={ search }
                    className={ `${searchFields.size <= 1 ? 'col-12' : 'col-11'}` }
                    data={ this.props.data }
                    focusInputBackOnClickOut={ this.props.focusInputBackOnClickOut }
                    getDataToExclude={ () => Array.from(this.state.searchFields.values()) }
                    pathToProperty={ this.props.pathToProperty }
                    pathToEditedPropForSuggestion={ this.props.pathToEditedPropForSuggestion }
                    placeholder={ this.props.placeholder }
                    onInputValueChange={ () => this.onInputValueChange(search) }
                    onSelection={ item => this.setState((prevState) => {
                        prevState.searchFields.set(search, item);
                        return {
                            searchFields: prevState.searchFields,
                            valuesString: this.getSearchValues(prevState),
                        };
                    }) } />
                {
                    search !== this.defaultSearch.key && (
                        <Button
                            className="search-combo__remove cc-btn-remove cc-btn-remove--lg p-0 mt-2 text-at-ocean-tint-10 rounded-circle"
                            color="secondary"
                            tabIndex="0"
                            aria-label="Remove search"
                            onClick={ () => this.removeSearchAndValues(search) }>
                            <span>&times;</span>
                        </Button>
                    )
                }
            </React.Fragment>
        );
    };

    render() {
        const { searchFields } = this.state;
        return (
            <section className="search-combo row">
                <FormGroup tag="fieldset" className="w-100 mb-0">
                    <div className="col-12">
                        <legend className="font-size-md font-weight-bold">{ this.props.label }</legend>
                        <div className="row">
                            { Array.from(searchFields.keys()).map(key => this.renderSearch(key)) }
                        </div>
                    </div>
                </FormGroup>
                {
                    (!_.isEmpty(searchFields.get(this.defaultSearch.key)) && searchFields.size < this.props.maxSearchFields) && (
                        <div className="col">
                            <Button
                                className="search-combo__add mb-3 bg-white border border-info font-weight-bold"
                                color="secondary"
                                tabIndex="0"
                                aria-label="Add another search"
                                onClick={ () => this.appendSearch() }>
                                <span>{ this.props.addButtonLabel }</span>
                            </Button>
                        </div>
                    )
                }

            </section>
        );
    }
}

export default SearchCombo;
