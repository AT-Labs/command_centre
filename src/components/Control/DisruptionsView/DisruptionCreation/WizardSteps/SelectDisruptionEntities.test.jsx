import React from 'react';
import _ from 'lodash-es';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { SelectDisruptionEntities } from './SelectDisruptionEntities';

let wrapper;
let sandbox;

const defaultState = {
    affectedStops: [],
    affectedRoutes: [],
    isLoading: false,
    findRoutesByStop: [],
    isEditMode: true,
    disruptionToEdit: null,
    searchResults: {},
    stops: {},
    stopGroups: [],
    data: { disruptionType: 'Routes' },
};

const stopGroups = _.keyBy([{
    id: 1,
    title: 'Stop Group 1',
    stops: [{
        stopId: '1381',
        value: 'test',
    }]
}], group => group.id);

const stops = [
    {
        stopId: "111-fd1c9e8c",
        stopName: "Test Stop 1",
        stopCode: "111",
        locationType: 0,
        stopLat: -36.94659,
        stopLon: 174.83358,
        parentStation: null,
        platformCode: null,
        routeType: null,
        text: "111 - Test Stop 1",
        category: {
            type: "stop",
            icon: "stop",
            label: "Stops"
        },
        icon: "stop",
        valueKey: "stopId",
        labelKey: "stopCode",
        type: "stop",
    },{
    stopId: "222-fd1c9e8c",
    stopName: "Test Stop 2",
    stopCode: "222",
    locationType: 0,
    stopLat: -36.94659,
    stopLon: 174.83358,
    parentStation: null,
    platformCode: null,
    routeType: null,
    text: "222 - Test Stop 2",
    category: {
        type: "stop",
        icon: "stop",
        label: "Stops"
    },
    icon: "stop",
    valueKey: "stopId",
    labelKey: "stopCode",
    type: "stop",
}];

const stopsFromStopGroup = [
    {
        stopId: "333-fd1c9e8c",
        stopName: "Test Stop 3",
        stopCode: "333",
        locationType: 0,
        stopLat: -36.94659,
        stopLon: 174.83358,
        parentStation: null,
        platformCode: null,
        routeType: null,
        text: "333 - Test Stop 3",        
        icon: "stop",
        valueKey: "stopId",
        labelKey: "stopCode",
        type: "stop",
        groupId: 1,
    },{
        stopId: "444-fd1c9e8c",
        stopName: "Test Stop 4",
        stopCode: "444",
        locationType: 0,
        stopLat: -36.94659,
        stopLon: 174.83358,
        parentStation: null,
        platformCode: null,
        routeType: null,
        text: "444 - Test Stop 4",    
        icon: "stop",
        valueKey: "stopId",
        labelKey: "stopCode",
        type: "stop",
        groupId: 1,
}];

const routes = [{
    routeId: "INN-202",
    routeShortName: "INN",
    routeType: 3
}]

const setup = (customProps) => {
    const props = { ...defaultState };

    Object.assign(props, customProps);
    
    wrapper = shallow(<SelectDisruptionEntities { ...props } />);
};

describe('<SelectDisruptionEntities />', () => {
    beforeEach(() => { 
        sandbox = sinon.createSandbox(); 
        
    });
    afterEach(() => {
        sandbox.restore();
        wrapper = null;
    });

    describe('initial load', () => {
        it('Should render', () => {
            setup();
            expect(wrapper.exists()).to.equal(true);
        })

        it('should not display anything in the footer', () => {
            setup();
            expect(wrapper.find('footer>*').isEmpty()).to.equal(true);
        });
    });

    describe('When entities are selected the page should render...', () => {
        
        const findSelectionItems = () => wrapper.find('.selection-container .selection-item');
        const findRouteItemHeaderText = (selectedItem) => selectedItem.find('.selection-item-header').text()
        const findStopItemHeaderText = (selectedItem) => selectedItem.find('.selection-item .picklist__list-btn').text();

        // unable to test this until enzyme shallow wrappers can use hooks (useEffect)
        it.skip('should display footer with two buttons', () => {
            setup({ affectedRoutes: routes });

           // expect(wrapper.find('footer>*').isEmpty()).to.equal(false);
           //  expect(wrapper.find('footer button').length).to.equal(2);
        });

        it('should display a selected route', () => {
            setup({ affectedRoutes: routes });

            const selectedItems = findSelectionItems();
            
            expect(selectedItems.length).to.equal(1);
            expect(findRouteItemHeaderText(selectedItems.at(0))).to.contains('Route INN');
        });

        // the 3 following tests are now reliant on hook tests as the affectedStops property is split in the useEffect hook and the render no longer uses this
        it.skip('should display a selected stop', () => {
            setup({ affectedStops: stops });

            const selectedItems = findSelectionItems();
            
            expect(selectedItems.length).to.equal(2);
            expect(findStopItemHeaderText(selectedItems.at(0))).to.contains('Stop 111 - Test Stop 1');
            expect(findStopItemHeaderText(selectedItems.at(1))).to.contains('Stop 222 - Test Stop 2');
        });

        it.skip('should display a selected stop group', () => {
            setup({ 
                affectedStops: stopsFromStopGroup,
                stopGroups: stopGroups,
            });

            const selectedItems = findSelectionItems();
            expect(selectedItems.length).to.equal(1);
            expect(findStopItemHeaderText(selectedItems.at(0))).to.contains('Stop Group - Stop Group 1');
        });

        it.skip('should display all stops when stop group is expanded', () => {
            setup({ 
                affectedStops: stopsFromStopGroup,
                stopGroups: stopGroups,
            });

            const selectedItems = findSelectionItems();
            selectedItems.at(0).find('ExpandableSummary>div>Button').at(0).simulate('click');

            wrapper.update();

            const groupStopEntityCheckbox = findSelectionItems().at(0).find('.select_entities EntityCheckbox');
            expect(groupStopEntityCheckbox.length).to.equal(2);
            expect(groupStopEntityCheckbox.at(0).prop('label')).to.equal('Stop 333 - Test Stop 3');
            expect(groupStopEntityCheckbox.at(1).prop('label')).to.equal('Stop 444 - Test Stop 4');
        });
    });
});