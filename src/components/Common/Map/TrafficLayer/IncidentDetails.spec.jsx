import React from 'react';
import { shallow } from 'enzyme';

import IncidentDetails from './IncidentDetails';

let wrapper;

const mockProps = {
    incident: {
        openlr: 'C3wiYOXBtyu1IfmT/morRBU=',
        status: 'real',
        features: [],
        situationId: 'TTI-3c6c805c-9022-4a2c-93ba-94667b690416-TTR91072118400149000',
        situationRecordsId: 'TTI-3c6c805c-9022-4a2c-93ba-94667b690416-TTR91072118400149000-1',
        type: {
            name: 'Road Closed',
            description: 'The road is closed to vehicles with the specified characteristics or all, if none defined, in the specified direction.',
            category: 'RoadConditions',
        },
        alertCEventCode: 401,
        from: 'Walker Road',
        to: 'Scenic Drive',
        isPoint: false,
        validity: {
            status: 'active',
            overallStartTime: '2023-02-19T02:00:00Z',
        },
        averageSpeed: null,
        delayTime: null,
    },
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<IncidentDetails { ...props } />);
};

describe('<IncidentDetails />', () => {
    it('Should render', () => {
        wrapper = setup();
        expect(wrapper.exists()).toEqual(true);
    });

    it('should render with new color class when useNewColors is true', () => {
        wrapper = setup({ useNewColors: true });
        expect(wrapper.find('.icon-container.new-color').exists()).toBe(true);
    });

    it('should not render new color class when useNewColors is false', () => {
        wrapper = setup({ useNewColors: false });
        expect(wrapper.find('.icon-container.new-color').exists()).toBe(false);
    });
});
