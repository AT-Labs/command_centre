import React from 'react';
import { shallow } from 'enzyme';

import IncidentDetails from './IncidentDetails';

let wrapper;

const mockProps = {
    incident: {
        // To test this component can render with optional fields
    },
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<IncidentDetails { ...props } />);
};

describe('<IncidentDetails />', () => {
    beforeEach(() => {
        wrapper = setup();
    });

    it('Should render', () => {
        expect(wrapper.exists()).toEqual(true);
    });
});
