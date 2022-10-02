import React from 'react';
import { shallow } from 'enzyme';

import { CustomCollapse } from './CustomCollapse';

let wrapper;

const mockProps = {
    children: [],
    height: 'small',
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<CustomCollapse { ...props }>{props.children}</CustomCollapse>);
};

describe('<CustomCollapse />', () => {
    beforeEach(() => {
        jest.restoreAllMocks();
        jest.resetAllMocks();
    });
    it('Should render', () => expect(setup().exists()).toEqual(true));

    describe('Check View', () => {
        it('Should show the basic content without overflow', () => {
            wrapper = setup({
                children: 'this is just a basic content',
            });
            expect(wrapper.find('.btn').length).toEqual(0);
        });

        it('Should show the view more button when the content overflow', () => {
            const useRefSpy = jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: {
                clientHeight: 122,
                scrollHeight: 10,
            } });
            wrapper = setup({
                heightSmall: true,
                children: `Lorem ipsum dolor sit amet, consectetur adipiscing elit,\n
                    sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.\n
                    Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex \n
                    ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate\n 
                    velit esse cillum dolore eu fugiat nulla pariatur.\n
                    Excepteur sint occaecat cupidatat non proident, \n 
                    sunt in culpa qui officia deserunt mollit anim id est laborum.`,
            });
            expect(useRefSpy).toBeCalledTimes(1);
            expect(wrapper.find('Collapse').length).toEqual(1);
            expect(wrapper.find('Button').contains('View more')).toBeTruthy();
        });
    });
});
