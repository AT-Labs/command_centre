import React from 'react';
import { shallow } from 'enzyme';
import { act } from 'react-dom/test-utils';
import sinon from 'sinon';
import { Button, IconButton } from '@mui/material';
import DisruptionDetails from './DisruptionDetails';

let wrapper;
let sandbox;
const mockDisruptions = [
    {
        disruptionId: 1,
        header: 'Disruption 1',
        startTime: '2025-03-19T01:22:00.000Z',
        endTime: '2025-03-19T02:22:00.000Z',
        duration: '',
        severity: 'HEADLINE',
        cause: 'CONGESTION',
        impact: 'BUS_STOP_CLOSED',
        recurrent: false,
        notes: [{
            id: '53b16796-381f-49da-a14e-8aaaf2dea4ac',
            description: 'test',
        },
        {
            id: '53b16796-381f-49da-a14e-8aaaf2dea4ab',
            description: 'test 2',
        }],
        affectedEntities: [
            {
                routeId: '105-202',
                routeShortName: '105',
                routeType: 3,
                type: 'route',
            },
            {
                routeId: 'S505-202',
                routeShortName: '505',
                routeType: 3,
                type: 'route',
            },
        ],
        recurrencePattern: { byweekday: [1, 2], dtstart: '2023-10-01T10:00:00Z', until: '2023-12-01T10:00:00Z' },
    },
    {
        disruptionId: 2,
        header: 'Disruption 2',
        startTime: '2025-03-20T01:22:00.000Z',
        endTime: '2025-03-20T02:22:00.000Z',
        duration: '',
        severity: 'MINOR',
        cause: 'ACCIDENT',
        impact: 'DELAY',
        recurrent: true,
        notes: [{ id: 1, description: 'Note 1' }],
        affectedEntities: [],
    },
];

const mockStop = {
    stopCode: '1234',
    stopName: 'Test Stop',
};

const mockCauses = [
    { value: 'CONGESTION', label: 'Congestion' },
    { value: 'ACCIDENT', label: 'Accident' },
];

const mockImpacts = [
    { value: 'BUS_STOP_CLOSED', label: 'Bus Stop Closed' },
    { value: 'DELAY', label: 'Delay' },
];

const mockGoToDisruptionSummary = jest.fn();

const componentPropsMock = {
    disruptions: mockDisruptions,
    stop: mockStop,
    causes: mockCauses,
    impacts: mockImpacts,
    goToDisruptionSummary: mockGoToDisruptionSummary,
};

const setup = (customProps) => {
    const props = {
        ...componentPropsMock,
        ...customProps,
    };
    Object.assign(props, customProps);
    return shallow(<DisruptionDetails { ...props } />);
};

describe('DisruptionDetails Component', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        jest.clearAllMocks();
    });

    it('renders the component with the first disruption', () => {
        wrapper = setup();
        const title = wrapper.find('.title').text();
        expect(title).toBe('Disruption 1');
        expect(wrapper.find('.row strong').at(0).text()).toBe('1234 - Test Stop');
    });

    it('navigates between disruptions', () => {
        wrapper = setup();

        expect(wrapper.find(IconButton).at(0).prop('disabled')).toBe(true);

        act(() => {
            const forwardButton = wrapper.find(IconButton).at(1);
            forwardButton.simulate('click');
        });

        expect(wrapper.find('.title').text()).toBe('Disruption 2');
        expect(wrapper.find(IconButton).at(1).prop('disabled')).toBe(true);

        act(() => {
            const forwardButton = wrapper.find(IconButton).at(0);
            forwardButton.simulate('click');
        });

        expect(wrapper.find('.title').text()).toBe('Disruption 1');
    });

    it('disables the back button on the first disruption', () => {
        wrapper = setup();
        const backButton = wrapper.find(IconButton).at(0);
        expect(backButton.prop('disabled')).toBe(true);
    });

    it('calls goToDisruptionSummary when the button is clicked', () => {
        wrapper = setup();
        const button = wrapper.find(Button).at(0);
        expect(button.exists()).toBe(true);

        act(() => {
            button.simulate('click');
        });

        expect(mockGoToDisruptionSummary).toHaveBeenCalledWith(
            { disruptionId: 1 },
            { setActiveDisruption: true },
        );
    });

    it('redners the component with empty fields', () => {
        const disruption = {
            disruptionId: 2,
            header: 'Disruption 2',
            startTime: '',
            endTime: '',
            duration: '',
            severity: '',
            cause: '',
            impact: '',
            recurrent: undefined,
            notes: [],
            affectedEntities: [],
        };
        wrapper = setup({ disruptions: [disruption] });

        expect(wrapper.find('.column').at(0).find('p').at(1)
            .text()).toBe('-'); // checking startTime
        expect(wrapper.find('.column').at(1).find('p').at(1)
            .text()).toBe('-'); // checking endTime
        expect(wrapper.find('.column').at(2).find('p').at(1)
            .text()).toBe('-'); // checking duration
        expect(wrapper.find('.column').at(3).find('p').at(1)
            .text()).toBe('-'); // checking severity
        expect(wrapper.find('.column').at(4).find('p').at(1)
            .text()).toBe('-'); // checking cause
        expect(wrapper.find('.column').at(5).find('p').at(1)
            .text()).toBe('-'); // checking effect
        expect(wrapper.find('.column').at(6).find('p').at(1)
            .text()).toBe('N'); // checking scheduled
        expect(wrapper.find('.column').at(7).find('p').at(1)
            .text()).toBe('-'); // checking scheduled Period
        expect(wrapper.find('.column').at(8).find('p').at(1)
            .text()).toBe('-'); // checking routes
        expect(wrapper.find('.column').at(9).find('p').at(1)
            .text()).toBe('No notes added to this disruption.'); // checking scheduled Period
    });

    it('redners the component with valid data', () => {
        wrapper = setup();

        expect(wrapper.find('.column').at(0).find('p').at(1)
            .text()).toBeTruthy(); // checking startTime
        expect(wrapper.find('.column').at(1).find('p').at(1)
            .text()).toBeTruthy(); // checking endTime
        expect(wrapper.find('.column').at(2).find('p').at(1)
            .text()).toBeTruthy();// checking duration
        expect(wrapper.find('.column').at(3).find('p').at(1)
            .text()).toBe('4 (Headline)'); // checking severity
        expect(wrapper.find('.column').at(4).find('p').at(1)
            .text()).toBe('Congestion'); // checking cause
        expect(wrapper.find('.column').at(5).find('p').at(1)
            .text()).toBe('Bus Stop Closed'); // checking effect
        expect(wrapper.find('.column').at(6).find('p').at(1)
            .text()).toBe('N'); // checking scheduled
        expect(wrapper.find('.column').at(7).find('p').at(1)
            .text()).toBe('Tu, W'); // checking scheduled Period
        expect(wrapper.find('.column').at(8).find('p').at(1)
            .text()).toBe('105, 505'); // checking routes
        expect(wrapper.find('.column').at(9).find('p').at(1)
            .text()).toBe('test'); // checking first note
        expect(wrapper.find('.column').at(9).find('p').at(2)
            .text()).toBe('test 2'); // checking second note
    });
});
