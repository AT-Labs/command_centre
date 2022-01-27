import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { EVENT_TYPES } from './KeyEventType';
import KeyEvent from './KeyEvent';

let wrapper;
let sandbox;

const defaultKeyEventDetail = {
    id: 'stopCode_1',
    latlon: [1, 1],
    title: 'stopCode_1',
    type: EVENT_TYPES.STOP,
    timepoint: 0,
};

const componentPropsMock = {
    type: EVENT_TYPES.STOP,
    scheduledTime: {
        arrival: '05:50:00',
        departure: '05:50:00',
    },
    time: {
        arrival: '05:50:00',
        departure: '05:50:00',
    },
    detail: '',
    handleMouseEnter: () => { },
    handleMouseLeave: () => { },
    handleMouseClick: () => { },
    keyEventDetail: defaultKeyEventDetail,
};
const setup = (customProps) => {
    const props = {};
    Object.assign(props, componentPropsMock, customProps);
    document.body.innerHTML = '<div id="testContainer"></div>';
    const options = {
        attachTo: document.querySelector('#testContainer'),
    };
    wrapper = mount(<KeyEvent { ...props } />, options);
};

describe('<KeyEvent />', () => {
    beforeEach(() => { sandbox = sinon.createSandbox(); });
    afterEach(() => { sandbox.restore(); wrapper.detach(); });

    describe('Timepoint', () => {
        it('Should display timepoint icon if timepoint == 1', () => {
            setup({ keyEventDetail: { ...defaultKeyEventDetail, timepoint: 1 } });
            expect(wrapper.html()).to.contain('timepoint-stopCode_1');
        });

        it('Should not display timepoint icon if timepoint != 1', () => {
            setup();
            expect(wrapper.html()).not.to.contain('timepoint-stopCode_1');
        });
    });
});
