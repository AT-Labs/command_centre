import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { mount } from 'enzyme';
import Feedback from './Feedback';
import { useNewRealtimeMapFilters } from '../../../redux/selectors/appSettings';

jest.mock('../../../redux/selectors/appSettings');

const mockStore = configureStore([]);

describe('Feedback component', () => {
    let store;

    beforeEach(() => {
        store = mockStore({
            appSettings: {
                useNewRealtimeMapFilters: true,
            },
        });
    });

    it('should render the feedback button with rounded-top class when useNewRealtimeMapFilters is true', () => {
        useNewRealtimeMapFilters.mockReturnValue(true);

        const wrapper = mount(
            <Provider store={ store }>
                <Feedback />
            </Provider>,
        );
        expect(wrapper.find('.feedback-btn-bottom.rounded-top').exists()).toBe(true);
        expect(wrapper.find('span').text()).toContain('Give feedback');
    });

    it('should render the feedback button with rounded-0 class when useNewRealtimeMapFilters is false', () => {
        useNewRealtimeMapFilters.mockReturnValue(false);

        const wrapper = mount(
            <Provider store={ store }>
                <Feedback />
            </Provider>,
        );
        expect(wrapper.find('a').hasClass('feedback-btn')).toBe(true);
        expect(wrapper.find('span').text()).toBe('Give feedback');
    });

    it('should include the icon when useNewRealtimeMapFilters is true', () => {
        useNewRealtimeMapFilters.mockReturnValue(true);

        const wrapper = mount(
            <Provider store={ store }>
                <Feedback />
            </Provider>,
        );

        expect(wrapper.find('svg').exists()).toBe(true);
        expect(wrapper.find('span').text()).toContain('Give feedback');
    });

    it('should not include the icon when useNewRealtimeMapFilters is false', () => {
        useNewRealtimeMapFilters.mockReturnValue(false);

        const wrapper = mount(
            <Provider store={ store }>
                <Feedback />
            </Provider>,
        );
        expect(wrapper.find('svg').exists()).toBe(false);
    });
});
