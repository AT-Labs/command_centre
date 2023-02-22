import React from 'react';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { Provider } from 'react-redux';
import { expect } from 'chai';
import sinon from 'sinon';
import moment from 'moment';
import { mount } from 'enzyme';
import StopMessageModal from './StopMessageModal';

global.Node = document.defaultView.Node;
global.HTMLElement = document.defaultView.HTMLElement;

let wrapper;
let sandbox;

const mockStore = configureMockStore([thunk]);
let store;

const cache = createCache({ key: 'blah' });

const componentPropsMock = {
    title: '',
    isModalOpen: true,
    modalType: 'create',
    activeMessage: null,
    onAction: () => { },
    onClose: () => { },
};
const defaultState = {};

const setup = (customProps, customState) => {
    const props = {};
    const state = {};
    Object.assign(props, componentPropsMock, customProps);
    Object.assign(state, defaultState, customState);
    store = mockStore({
        'control.stopMessaging': state,
        activity: { error: { createStopMessage: null } },
    });
    document.body.innerHTML = '<div id="testContainer"></div>';
    const options = {
        attachTo: document.querySelector('#testContainer'),
        context: { store },
    };
    wrapper = mount(<CacheProvider value={ cache }><Provider store={ store }><StopMessageModal { ...props } /></Provider></CacheProvider>, options);
};

// skipped due to issue with passing props to wrapper needs to be solved with new mocha
describe('<StopMessageModal />', () => {
    beforeEach(() => { sandbox = sinon.createSandbox(); });
    afterEach(() => {
        sandbox.restore();
        wrapper.detach();
    });

    describe('End date time validation', () => {
        describe('When create message', () => {
            it('End date time can be null when message status is draft', () => {
                setup({
                    activeMessage: {
                        stopsAndGroups: [{ value: 'stop-1', label: 'Stop 1' }],
                        message: 'not null msg',
                        priority: 'low',
                        startTime: moment().format(),
                        status: 'draft',
                    },
                });
                const saveBtn = wrapper.find('.message-modal__save-btn').at(1);
                expect(saveBtn.props().disabled).to.equal(false);
            });

            it('End date time can not be null when message status is not draft', () => {
                setup({
                    activeMessage: {
                        stopsAndGroups: [{ value: 'stop-1', label: 'Stop 1' }],
                        message: 'not null msg',
                        priority: 'low',
                        startTime: moment().format(),
                        status: 'active',
                    },
                });
                const saveBtn = wrapper.find('.message-modal__save-btn').at(1);
                expect(saveBtn.props().disabled).to.equal(true);
            });

            it('End date and end time can not be part null', () => {
                setup({
                    activeMessage: {
                        stopsAndGroups: [{ value: 'stop-1', label: 'Stop 1' }],
                        message: 'not null msg',
                        priority: 'low',
                        startTime: moment().format(),
                    },
                });
                const endTimeElement = wrapper.find('#messaging-end-time').at(0);
                endTimeElement.find('input').simulate('change', { target: { value: '23:00' } });
                const saveBtn = wrapper.find('.message-modal__save-btn').at(1);
                expect(saveBtn.props().disabled).to.equal(true);
            });
        });

        describe('When edit message', () => {
            it('End date time can be null when message status is draft', () => {
                setup({
                    modalType: 'edit',
                    activeMessage: {
                        stopsAndGroups: [{ value: 'stop-1', label: 'Stop 1' }],
                        message: 'not null msg',
                        priority: 'low',
                        startTime: moment().format(),
                        status: 'draft',
                    },
                });
                const saveBtn = wrapper.find('.message-modal__save-btn').at(1);
                expect(saveBtn.props().disabled).to.equal(false);
            });

            it('End date time can not be null when message status is not draft', () => {
                setup({
                    modalType: 'edit',
                    activeMessage: {
                        stopsAndGroups: [{ value: 'stop-1', label: 'Stop 1' }],
                        message: 'not null msg',
                        priority: 'low',
                        startTime: moment().format(),
                        status: 'active',
                    },
                });
                const saveBtn = wrapper.find('.message-modal__save-btn').at(1);
                expect(saveBtn.props().disabled).to.equal(true);
            });
        });
    });
});
