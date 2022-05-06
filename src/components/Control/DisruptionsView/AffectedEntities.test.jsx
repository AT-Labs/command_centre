import { expect } from 'chai';
import { mount } from 'enzyme';
import React from 'react';
import _ from 'lodash-es';
import { Provider } from 'react-redux';
import { Button } from 'reactstrap';
import sinon from 'sinon';
import AffectedEntities  from './AffectedEntities';
import configureMockStore from 'redux-mock-store';

let sandbox;
let wrapper;
const mockStore = configureMockStore();
let store;

const componentPropsMock = {
    editLabel: 'Edit',
    editAction: () => {},
    isEditDisabled: true,
    affectedEntities: [],
    stopGroups: [],
};

const setup = (customProps, stopGroups = []) => {
    const props = componentPropsMock;
    Object.assign(props, customProps);
    store = mockStore({ 
        control: {
            dataManagement: {      
                stopGroupsIncludingDeleted: stopGroups, 
            },
        },
    });

    return mount(
        <Provider store={ store }>
            <AffectedEntities { ...props } />
        </Provider>);
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
            { stopId: 'stop1', stopCode: '1', text: '1' },
            { stopId: 'stop2', stopCode: '2', routeId: 'route2', routeShortName: '2', text: '2' },
            { stopId: 'stop3', stopCode: '3', routeId: 'route3', routeShortName: '3', text: '3' },
            { stopId: 'stop3', stopCode: '3', routeId: 'route4', routeShortName: '4', text: '3' },
        ];
        wrapper = setup({ affectedEntities });
        expect(wrapper.find('ul').children()).to.have.lengthOf(4);
    });

    it('should display combined entities with stop groups', () => {
        const affectedEntities = [
            { routeId: 'route1', routeShortName: '1' },
            { stopId: 'stop1', stopCode: '1', text: '1' },
            { stopId: 'stop2', stopCode: '2', groupId: 1, text: '2' },
            { stopId: 'stop3', stopCode: '3', groupId: 1, text: '3' }
        ];
        const stopGroups = _.keyBy([{ id: 1, title: 'stop group 1' }], group => group.id);
        wrapper = setup({ affectedEntities }, stopGroups);

        expect(wrapper.find('ul').children()).to.have.lengthOf(3);
        const stopgroupDiv = wrapper.find('ul li').at(2).find('div');
        expect(stopgroupDiv.at(0).text()).to.equal('Stop Group - stop group 1');
        expect(stopgroupDiv.at(1).text()).to.equal('Stop 2, 3');
    });
});
