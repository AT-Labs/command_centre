/**
 * @jest-environment jsdom
 */
import React, { useRef } from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { shallow } from 'enzyme';
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
    editAction: () => { },
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

const defaultProps = {
    affectedEntities: [
        { routeId: 'route5', routeShortName: '5', routeType: 3, type: 'route' },
        { routeId: 'route6', routeShortName: '6', routeType: 3, type: 'route' },
        { routeId: 'route7', routeShortName: '7', routeType: 3, type: 'route' },
        { routeId: 'route8', routeShortName: '8', routeType: 3, type: 'route' },
    ],
    startTime: '2022-08-03T23:32:00.000Z',
    endTime: '2022-08-04T23:32:00.000Z',
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

    it('should display Add Diversion button when use diversion is true and status is not-started', () => {
        render(<AffectedEntities
            { ...defaultProps }
            useDiversion
            disruptionStatus="not-started"
        />);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeInTheDocument();
    });

    it('should display Add Diversion button when use diversion is true and status is in-progress', () => {
        render(<AffectedEntities
            { ...defaultProps }
            useDiversion
            disruptionStatus="in-progress"
        />);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeInTheDocument();
    });

    it('should display Add Diversion button when use diversion is true and status is draft', () => {
        render(<AffectedEntities
            { ...defaultProps }
            useDiversion
            disruptionStatus="draft"
        />);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeInTheDocument();
    });

    it('should not display Add Diversion button when use diversion is false', () => {
        render(<AffectedEntities
            { ...defaultProps }
            useDiversion={ false }
        />);

        const addDiversionButton = screen.queryByText('Add Diversion');
        expect(addDiversionButton).not.toBeInTheDocument();
    });

    it('should not display Add Diversion button when use diversion is true and disruption status is resolved', () => {
        render(<AffectedEntities
            { ...defaultProps }
            useDiversion
            disruptionStatus="resolved"
        />);

        const addDiversionButton = screen.queryByText('Add Diversion');
        expect(addDiversionButton).not.toBeInTheDocument();
    });

    it('should not display Add Diversion button when use diversion is false and disruption status is in-progress', () => {
        render(<AffectedEntities
            { ...defaultProps }
            useDiversion={ false }
            disruptionStatus="in-progress"
        />);

        const addDiversionButton = screen.queryByText('Add Diversion');
        expect(addDiversionButton).not.toBeInTheDocument();
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
