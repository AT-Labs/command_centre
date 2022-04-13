import React from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { mount } from 'enzyme';
import { Label } from 'reactstrap';

import CustomMuiDialog from './CustomMuiDialog';

let wrapper;
let cache;

const withCacheProvider = (mycache, children) => (
    <CacheProvider value={ mycache }>
        {children}
    </CacheProvider>
);

const mockProps = {
    title: 'Default Title',
    isOpen: false,
    onClose: jest.fn(),
    children: ['test'],
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    cache = createCache({ key: 'blah' });
    document.body.innerHTML = '<div id="testContainer"></div>';
    const options = {
        attachTo: document.querySelector('#testContainer'),
    };
    wrapper = mount(withCacheProvider(cache, <CustomMuiDialog { ...props } />), options);
};

describe('<CustomMuiDialog />', () => {
    afterEach(() => {
        wrapper.detach();
        cache = null;
        wrapper = null;
        jest.clearAllMocks();
    });

    it('Should render', () => {
        setup();

        expect(wrapper.exists()).toEqual(true);
    });

    it('Should display title', () => {
        setup({ isOpen: true });

        expect(wrapper.find('.modal-header span').at(0).text()).toEqual(mockProps.title);
    });

    it('Should render child element when open', () => {
        setup({
            isOpen: true,
            children: (<Label>Test Child</Label>),
        });

        expect(wrapper.find('Label').at(0).text()).toEqual('Test Child');
    });

    it('Should call close event when closed using title close button', () => {
        setup({
            isOpen: true,
        });

        wrapper.find('.modal-header .close').simulate('click');

        wrapper.update();

        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('Should call close event when closed using footer close button', () => {
        setup({
            isOpen: true,
        });

        const closeButton = wrapper.find('.modal-footer button').at(0);
        expect(closeButton.text()).toEqual('Close');

        closeButton.simulate('click');

        wrapper.update();

        expect(mockProps.onClose).toHaveBeenCalledTimes(1);
    });
});
