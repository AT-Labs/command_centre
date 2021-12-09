import { expect } from 'chai';
import { shallow } from 'enzyme';
import React from 'react';
import { Button } from 'reactstrap';
import sinon from 'sinon';
import AffectedEntities from './AffectedEntities';

let sandbox;
let wrapper;

const componentPropsMock = {
    editLabel: 'Edit',
    editAction: () => {},
    isEditDisabled: true,
    affectedEntities: [],
};

const setup = (customProps) => {
    const props = componentPropsMock;
    Object.assign(props, customProps);
    wrapper = shallow(<AffectedEntities { ...props } />);
    return wrapper;
};

describe('<AffectedEntities />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('should display edit button', () => {
        wrapper = setup({ isEditDisabled: false });
        expect(wrapper.find(Button).contains('Edit')).to.be.true;
    });

    it('should not display edit button', () => {
        wrapper = setup({ isEditDisabled: true });
        expect(wrapper.find(Button).contains('Edit')).to.be.false;
    });

    it('should display combined entities', () => {
        const affectedEntities = [
            { routeId: 'route1', routeShortName: '1' },
            { stopId: 'stop1', text: '1' },
            { stopId: 'stop2', routeId: 'route2', routeShortName: '2', text: '2' },
            { stopId: 'stop3', routeId: 'route3', routeShortName: '3', text: '3' },
            { stopId: 'stop3', routeId: 'route4', routeShortName: '4', text: '3' },
        ];
        wrapper = setup({ affectedEntities });
        expect(wrapper.find('ul').children()).to.have.lengthOf(4);
    });
});
