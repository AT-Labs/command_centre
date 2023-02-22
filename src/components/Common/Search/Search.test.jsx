import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { isEqual } from 'lodash-es';

import Search from './Search';
import SearchResultItem from './SearchResultItem';
import SEARCH_RESULT_TYPE from '../../../types/search-result-types';

let wrapper;
let instance;
let sandbox;

const mockProps = {
    suggestions: [],
    isLoading: false,
    onSelection: () => {},
    customTheme: {},
    onSearch: () => {},
    onClear: () => {},
    searchInCategory: [SEARCH_RESULT_TYPE.ADDRESS.type,
        SEARCH_RESULT_TYPE.ROUTE.type,
        SEARCH_RESULT_TYPE.BUS.type,
        SEARCH_RESULT_TYPE.TRAIN.type,
        SEARCH_RESULT_TYPE.FERRY.type,
        SEARCH_RESULT_TYPE.STOP.type,
    ],
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);

    wrapper = shallow(<Search { ...props } />);
    instance = wrapper.instance();
    return wrapper;
};

describe('Search', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('getSuggestionsToDisplay()', () => {
        it('Should return an array saying there are not results', () => {
            instance.setState({ value: 'INN', isPending: false });

            const expectedResponse = [{
                category: { label: '' },
                items: [{
                    text: 'No Results',
                    noResultPlaceHolder: true,
                }],
            }];
            const getSuggestions = instance.getSuggestionsToDisplay();

            expect(isEqual(getSuggestions, expectedResponse)).to.equal(true);
        });

        it('Should return suggestions', () => {
            instance.setState({ value: 'INN', isPending: true });
            wrapper.setProps({
                suggestions: [{
                    category: {
                        icon: '',
                        label: 'Routes',
                        type: 'route',
                    },
                }],
                isLoading: true,
            });

            const getSuggestions = instance.getSuggestionsToDisplay();
            expect(isEqual(getSuggestions, instance.props.suggestions)).to.equal(true);
        });
    });

    context('onSuggestionSelected', () => {
        it('Should set reset value and selected value when "No Results" is selected', () => {
            const suggestion = { noResultPlaceHolder: true };

            instance.onSuggestionSelected(null, { suggestion });

            expect(instance.state.value).to.be.equal('');
            expect(instance.state.selected).to.equal(null);
        });

        it('Should set selected state to the suggestion value', () => {
            const suggestion = {
                category: {
                    icon: 'stop',
                    label: 'Stops',
                    type: 'stop',
                },
                icon: 'stop',
                text: '123 - Fruitvale Rd Train Station',
                data: {
                    location_type: 0,
                    stop_code: '123',
                    stop_id: '0123-20180910114240_v70.21',
                    stop_lat: -36.91067,
                    stop_lon: 174.66707,
                    stop_name: 'Fruitvale Rd Train Station',
                },
            };

            instance.onSuggestionSelected(null, { suggestion });
            expect(isEqual(instance.state.selected, suggestion)).to.equal(true);
            expect(instance.state.value).to.be.equal('');
        });
    });

    context('renderSuggestion', () => {
        it('Should show SearchResultItem', () => {
            const suggestion = [];
            instance.renderSuggestion(suggestion);
            const searchResultItem = shallow(<SearchResultItem />);
            expect(searchResultItem.exists()).to.equal(true);
        });
    });
});
