import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';

import { LastNoteView } from './LastNoteView';

let wrapper;

const mockProps = {
    id: 'note-1',
    label: 'Last Note',
    note: {
        id: '9d1ae55b-67ca-413c-9f18-69a0d7e579f7',
        createdBy: 'jonathan.nenba@propellerhead.co.nz',
        createdTime: '2022-10-05T14:03:58.340Z',
        description: 'test the disruption notes feature',
    },
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<LastNoteView { ...props } />);
};

describe('<LastNoteView />', () => {
    beforeEach(() => {
        wrapper = setup();
    });

    it('Should render', () => {
        setup();
        expect(wrapper.exists()).equal(true);
    });
});
