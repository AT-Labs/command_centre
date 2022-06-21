import { shallow } from 'enzyme';
import React, { useRef } from 'react';
import _ from 'lodash-es';
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

    it('should show collapse arrow button if scrollHeight > clientHeight', () => {
        mockUseRef({ current: { scrollHeight: 110, clientHeight: 100 } });
        const affectedEntities = [
            { routeId: 'route1', routeShortName: '1' },
            { stopId: 'stop1', stopCode: '1', text: '1' },
            { stopId: 'stop2', stopCode: '2', routeId: 'route2', routeShortName: '2', text: '2' },
            { stopId: 'stop3', stopCode: '3', routeId: 'route3', routeShortName: '3', text: '3' },
            { stopId: 'stop3', stopCode: '3', routeId: 'route4', routeShortName: '4', text: '3' },
        ];
        wrapper = setup({ affectedEntities });
        expect(wrapper.find(Button).contains('View more')).toBeTruthy();
    });

    it('should display combined entities', () => {
        const affectedEntities = [
            { routeId: 'route1', routeShortName: '1' },
            { stopId: 'stop1', stopCode: '1', text: '1' },
            { stopId: 'stop2', stopCode: '2', routeId: 'route2', routeShortName: '2', text: '2' },
            { stopId: 'stop3', stopCode: '3', routeId: 'route3', routeShortName: '3', text: '3' },
            { stopId: 'stop3', stopCode: '3', routeId: 'route4', routeShortName: '4', text: '3' },
        ];
        wrapper = setup({ affectedEntities });
        expect(wrapper.find(Button).contains('View more')).toBeFalsy();
        expect(wrapper.find('ul').children()).toHaveLength(4);
    });

    it('should display combined entities with stop groups', () => {
        const affectedEntities = [
            { routeId: 'route1', routeShortName: '1' },
            { stopId: 'stop1', stopCode: '1', text: '1' },
            { stopId: 'stop2', stopCode: '2', groupId: 1, text: '2' },
            { stopId: 'stop3', stopCode: '3', groupId: 1, text: '3' },
        ];
        const stopGroups = _.keyBy([{ id: 1, title: 'stop group 1' }], group => group.id);
        wrapper = setup({ affectedEntities, stopGroups });

        expect(wrapper.find('ul').children()).toHaveLength(3);
        const stopgroupDiv = wrapper.find('ul li').at(2).find('div');
        expect(stopgroupDiv.at(0).text()).toEqual('Stop Group - stop group 1');
        expect(stopgroupDiv.at(1).text()).toEqual('Stop 2, 3');
    });
});
