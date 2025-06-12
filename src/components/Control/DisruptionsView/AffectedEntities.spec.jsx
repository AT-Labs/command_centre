import { shallow } from 'enzyme';
import React, { useRef } from 'react';
import { keyBy } from 'lodash-es';
import { Button } from 'reactstrap';
import sinon from 'sinon';
import { AffectedEntities } from './AffectedEntities';

let sandbox;
let wrapper;

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useRef: jest.fn(),
}));

const mockUseRef = (ref) => {
    const defaultRef = { current: { clientHeight: 100 } };
    useRef.mockReturnValue(ref || defaultRef);
};

const componentPropsMock = {
    editLabel: 'Edit',
    editAction: () => {},
    isEditDisabled: true,
    affectedEntities: [],
    stopGroups: [],
};

const setup = (customProps) => {
    const props = { ...componentPropsMock };
    Object.assign(props, customProps);
    wrapper = shallow(<AffectedEntities { ...props } />);
    return wrapper;
};

describe('<AffectedEntities />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        mockUseRef();
    });

    afterEach(() => { sandbox.restore(); });

    it('should display edit button', () => {
        wrapper = setup({ isEditDisabled: false });
        expect(wrapper.find(Button).contains('Edit')).toBeTruthy();
    });

    it('should not display edit button', () => {
        wrapper = setup({ isEditDisabled: true });
        expect(wrapper.find(Button).contains('Edit')).toBeFalsy();
    });

    it('should display combined entities', () => {
        const affectedEntities = [
            { routeId: 'route1', routeShortName: '1', type: 'route' },
            { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
            { stopId: 'stop2', stopCode: '2', routeId: 'route2', routeShortName: '2', text: '2', type: 'stop' },
            { stopId: 'stop3', stopCode: '3', routeId: 'route3', routeShortName: '3', text: '3', type: 'stop' },
            { stopId: 'stop3', stopCode: '3', routeId: 'route4', routeShortName: '4', text: '3', type: 'stop' },
            { routeId: 'route5', routeShortName: '5', type: 'route', directionId: 0, stopCode: '4' },
            { routeId: 'route6', routeShortName: '6', type: 'route', directionId: 1, stopCode: '5' },
            { routeId: 'route7', routeShortName: '7', type: 'route', directionId: 0, stopCode: '6' },
            { routeId: 'route7', routeShortName: '7', type: 'route', directionId: 0, stopCode: '7' },
            { routeId: 'route8', routeShortName: '8', type: 'route', directionId: 1, stopCode: '8' },
            { routeId: 'route8', routeShortName: '8', type: 'route', directionId: 1, stopCode: '9' },
        ];
        wrapper = setup({ affectedEntities });
        expect(wrapper.find(Button).contains('View more')).toBeFalsy();
        expect(wrapper.find('ul').children()).toHaveLength(8);
    });

    it('should display combined entities with stop groups', () => {
        const affectedEntities = [
            { routeId: 'route1', routeShortName: '1', type: 'route' },
            { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
            { stopId: 'stop2', stopCode: '2', groupId: 1, text: '2', type: 'stop' },
            { stopId: 'stop3', stopCode: '3', groupId: 1, text: '3', type: 'stop' },
        ];
        const stopGroups = keyBy([{ id: 1, title: 'stop group 1' }], group => group.id);
        wrapper = setup({ affectedEntities, stopGroups });

        expect(wrapper.find('ul').children()).toHaveLength(3);
        const stopgroupDiv = wrapper.find('ul li').at(2).find('div');
        expect(stopgroupDiv.at(0).text()).toEqual('Stop Group - stop group 1');
        expect(stopgroupDiv.at(1).text()).toEqual('Stop 2, 3');
    });
});

describe('View & edit diversions', () => {
    it('should display an amount of 3 diversions when 3 diversions exist', async () => {
        wrapper = setup({
            affectedEntities: [
                { routeId: 'route1', routeShortName: '1', type: 'route' },
                { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
            ],
            diversions: [
                { diversionId: 1, diversionRouteVariants: [], routeId: 'route1' },
                { diversionId: 2, diversionRouteVariants: [], routeId: 'route1' },
                { diversionId: 3, diversionRouteVariants: [], routeId: 'route1' },
            ],
            startTime: '2022-08-03T23:32:00.000Z',
            endTime: '2022-09-03T23:42:00.000Z',
            useDiversion: true,
        });

        const button = wrapper.find('#view-and-edit-diversions-btn');
        const buttonContent = button.dive();
        expect(button.exists()).toBeTruthy();
        expect(buttonContent.text()).toContain('View & edit diversions (3)');
    });

    it('should display an amount of 1 diversion when diversion list is 1', async () => {
        wrapper = setup({
            affectedEntities: [
                { routeId: 'route1', routeShortName: '1', type: 'route' },
                { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
            ],
            diversions: [
                { diversionId: 1, diversionRouteVariants: [], routeId: 'route1' },
            ],
            startTime: '2022-08-03T23:32:00.000Z',
            endTime: '2022-09-03T23:42:00.000Z',
            useDiversion: true,
        });

        const button = wrapper.find('#view-and-edit-diversions-btn');
        const buttonContent = button.dive();
        expect(button.exists()).toBeTruthy();
        expect(buttonContent.text()).toContain('View & edit diversions (1)');
    });

    it('should display an amount of 0 diversions when no diversions exist', async () => {
        wrapper = setup({
            affectedEntities: [
                { routeId: 'route1', routeShortName: '1', type: 'route' },
                { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
            ],
            diversions: [],
            startTime: '2022-08-03T23:32:00.000Z',
            endTime: '2022-09-03T23:42:00.000Z',
            useDiversion: true,
        });

        const button = wrapper.find('#view-and-edit-diversions-btn');
        const buttonContent = button.dive();
        expect(button.exists()).toBeTruthy();
        expect(buttonContent.text()).toContain('View & edit diversions (0)');
    });

    it('should not render the diversions button when useDiversion is false', () => {
        wrapper = setup({
            affectedEntities: [
                { routeId: 'route1', routeShortName: '1', type: 'route' },
                { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
            ],
            diversions: [
                { diversionId: 1, diversionRouteVariants: [], routeId: 'route1' },
                { diversionId: 2, diversionRouteVariants: [], routeId: 'route1' },
                { diversionId: 3, diversionRouteVariants: [], routeId: 'route1' },
            ],
            startTime: '2022-08-03T23:32:00.000Z',
            endTime: '2022-09-03T23:42:00.000Z',
            useDiversion: false,
            viewDiversionsAction: jest.fn(),
        });

        const button = wrapper.find('#view-and-edit-diversions-btn');
        expect(button.exists()).toBeFalsy();
    });

    it('should call viewDiversionsAction when the button is clicked', () => {
        const viewDiversionsAction = jest.fn();
        wrapper = setup({
            affectedEntities: [
                { routeId: 'route1', routeShortName: '1', type: 'route' },
                { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
            ],
            diversions: [
                { diversionId: 1, diversionRouteVariants: [], routeId: 'route1' },
                { diversionId: 2, diversionRouteVariants: [], routeId: 'route1' },
                { diversionId: 3, diversionRouteVariants: [], routeId: 'route1' },
            ],
            startTime: '2022-08-03T23:32:00.000Z',
            endTime: '2022-09-03T23:42:00.000Z',
            useDiversion: true,
            viewDiversionsAction,
        });

        const button = wrapper.find('#view-and-edit-diversions-btn');
        expect(button.exists()).toBeTruthy();
        button.simulate('click');
        expect(viewDiversionsAction).toHaveBeenCalled();
    });
});
