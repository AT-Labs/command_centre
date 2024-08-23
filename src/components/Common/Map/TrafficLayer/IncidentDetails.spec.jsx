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
    beforeEach(() => {
        wrapper = setup();
    });

    it('Should render', () => {
        expect(wrapper.exists()).toEqual(true);
    });
});
