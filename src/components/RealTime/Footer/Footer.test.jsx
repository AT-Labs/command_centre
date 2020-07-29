import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { Footer } from './Footer';

let wrapper;
let sandbox;
const componentPropsMock = {
    isLoading: false,
    clearDetail: () => {},
    clearSearchResults: () => {},
    updateRealTimeDetailView: () => {},
    shouldGetActiveRealTimeDetailView: false,
};
const setup = (customProps) => {
    const props = componentPropsMock;
    Object.assign(props, customProps);
    wrapper = shallow(<Footer { ...props } />);
    return wrapper;
};

describe('<Footer />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });
    afterEach(() => { sandbox.restore(); });

    it('should render', () => expect(wrapper.exists()).to.equal(true));

    context('Testing handleResetOnClick method', () => {
        it('should trigger two redux actions: clearDetail & clearSearchResults', () => {
            wrapper = setup({
                clearDetail: sandbox.spy(),
                clearSearchResults: sandbox.spy(),
                updateRealTimeDetailView: sandbox.spy(),
            });

            const clearDetailAction = wrapper.instance().props.clearDetail;
            const clearSearchResultsAction = wrapper.instance().props.clearSearchResults;
            const updateRealTimeDetailViewAction = wrapper.instance().props.updateRealTimeDetailView;

            wrapper.instance().handleResetOnClick();
            sandbox.assert.calledOnce(clearDetailAction);
            sandbox.assert.calledOnce(clearSearchResultsAction);
            sandbox.assert.calledOnce(updateRealTimeDetailViewAction);
        });
    });
});
