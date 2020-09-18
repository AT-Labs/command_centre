import React from 'react';
import { mount } from 'enzyme';
import { expect } from 'chai';
import { PidInformation } from './PidInformation';

let wrapper;
const props = {
    stopCode: '1023',
    pidMessages: [],
    pidInformation: [],
    stops: {
        1023: {
            stop_code: '1023',
            route_type: 2,
        },
    },
    childStops: {
        1: { stop_code: '1' },
    },
    fetchPidInformation: () => {},
};

const setup = (customProps) => {
    const newProps = Object.assign({}, props, customProps);
    wrapper = mount(<PidInformation { ...newProps } />);
    return wrapper;
};

describe('<PidInformation />', () => {
    beforeEach(() => { wrapper = setup(); });

    it('should render', () => expect(wrapper.exists()).to.equal(true));

    context('Stop messages for virtual PID', () => {
        it('should NOT render stop messages if no pidMessages', () => {
            expect(wrapper.find('.pid-alert')).is.empty;
        });

        it('should render stop messages', () => {
            const pidMessages = [{
                priority: 'normal',
                text: 'test message',
            }];
            wrapper = setup({ pidMessages });
            expect(wrapper.find('.pid-alert')).to.have.lengthOf(1);
        });

        it('should render multiple stop messages', () => {
            const pidMessages = [{
                priority: 'normal',
                text: 'test message',
            }, {
                priority: 'low',
                text: 'message 2',
            }];
            wrapper = setup({ pidMessages });
            expect(wrapper.find('.alert-message').find('li')).to.have.lengthOf(2);
        });
    });

    context('PID information table', () => {
        it('should display platform information if train stop', () => {
            expect(wrapper.find('th')).to.have.lengthOf(6);
        });

        it('should display platform information if parent bus stop', () => {
            const stopCode = '1023';
            const stops = {
                1023: {
                    stop_code: '1023',
                    route_type: 3,
                },
            };
            const childStops = {
                1234: { stop_code: '1234' },
            };
            wrapper = setup({ stopCode, stops, childStops });
            expect(wrapper.find('th')).to.have.lengthOf(6);
        });

        it('should NOT display platform information if child bus stop', () => {
            const stopCode = '1023';
            const stops = {
                1023: {
                    stop_code: '1023',
                    route_type: 3,
                },
            };
            const childStops = {
                1023: { stop_code: '1023' },
            };
            wrapper = setup({ stopCode, stops, childStops });
            expect(wrapper.find('th')).to.have.lengthOf(5);
        });
    });
});
