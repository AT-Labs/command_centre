import React from 'react';
import { mount } from 'enzyme';
import IconProvider from './IconProvider';

describe('IconProvider', () => {
    it('should render children with the default context value', () => {
        const ChildComponent = () => <div>Child Component</div>;

        const wrapper = mount(
            <IconProvider>
                <ChildComponent />
            </IconProvider>,
        );

        expect(wrapper.find('ChildComponent').exists()).toBe(true);

        expect(wrapper.find('IconProvider').prop('contextValue')).toEqual({});
    });

    it('should render children with a provided context value', () => {
        const ChildComponent = () => <div>Child Component</div>;
        const customContextValue = { color: 'red', size: '2em' };

        const wrapper = mount(
            <IconProvider contextValue={ customContextValue }>
                <ChildComponent />
            </IconProvider>,
        );

        expect(wrapper.find('ChildComponent').exists()).toBe(true);

        expect(wrapper.find('IconProvider').prop('contextValue')).toEqual(customContextValue);
    });
});
