import React from 'react';
import moment from 'moment-timezone';
import { expect } from 'chai';
import sinon from 'sinon';
import { mount } from 'enzyme';
import { ServiceDatePicker } from './ServiceDatePicker';
import DATE_TYPE from '../../../../types/date-types';

let wrapper;
let sandbox;
let updateServiceDateSpy;
let deselectAllTripsSpy;
const yesterdayServiceDateString = moment().subtract(1, 'd').format();
const tomorrowServiceDateString = moment().add(1, 'd').format();
const componentPropsMock = {
    serviceDate: moment().format(),
    updateServiceDate: () => {},
    deselectAllTrips: () => {},
    selectedTrips: [],
};

const setup = (customProps) => {
    const props = componentPropsMock;

    props.updateServiceDate = sandbox.spy();
    props.deselectAllTrips = sandbox.spy();

    Object.assign(props, customProps);
    wrapper = mount(<ServiceDatePicker { ...props } />);

    updateServiceDateSpy = wrapper.instance().props.updateServiceDate;
    deselectAllTripsSpy = wrapper.instance().props.deselectAllTrips;
    return wrapper;
};

describe('<ServiceDatePicker />', () => {
    beforeEach(() => sandbox = sinon.createSandbox());
    afterEach(() => {
        sandbox.restore();
        wrapper.unmount();
    });

    it('should render', () => {
        wrapper = setup();
        expect(wrapper.exists()).to.equal(true);
    });

    describe('When changing service date to yesterday with selected trips', () => {
        
        it('should display modal and on cancel hide modal and do not change date', () => {

            wrapper = setup({ 
                selectedTrips: ['trip1', 'trip2'],
            });

            // check modal is closed
            expect(wrapper.find('CustomModal [isOpen=false]').length).to.equal(1);

            // click button to move to yesterday
            wrapper.find('button').at(0).simulate('click');

            // check modal displayed            
            const modal = wrapper.find('CustomModal [isOpen=true]');
            expect(modal.length).to.equal(1);

            // cancel modal
            modal.find('button').at(0).simulate('click');            

            // check that update was not called
            sandbox.assert.notCalled(updateServiceDateSpy);
            sandbox.assert.notCalled(deselectAllTripsSpy);

            // check modal is not displayed    
            expect(wrapper.find('CustomModal [isOpen=false]').length).to.equal(1);
        });

        it('should display modal and on confirm of modal call to change date', () => {
            wrapper = setup({ 
                selectedTrips: ['trip1', 'trip2'],
            });
                        
            // check modal is closed
            expect(wrapper.find('CustomModal [isOpen=false]').length).to.equal(1);

            // click button to move to yesterday
            wrapper.find('button').at(0).simulate('click');
          
            // check modal displayed            
            const modal = wrapper.find('CustomModal [isOpen=true]');
            expect(modal.length).to.equal(1);

            // confirm modal
            modal.find('button').at(1).simulate('click');            

            // check that update and deselect was called
            sandbox.assert.calledOnce(updateServiceDateSpy);
            sandbox.assert.calledWith(updateServiceDateSpy, yesterdayServiceDateString);
            sandbox.assert.calledOnce(deselectAllTripsSpy);           
            
            // check modal is not displayed    
            expect(wrapper.find('CustomModal [isOpen=false]').length).to.equal(1);
        });
            
    });

    describe('When changing service date to tomorrow with selected trips', () => {
        
        it('should display modal and on cancel hide modal and do not change date', () => {

            wrapper = setup({ 
                selectedTrips: ['trip1', 'trip2'],
            });
            
            // check modal is closed
            expect(wrapper.find('CustomModal [isOpen=false]').length).to.equal(1);

            // click button to move to tomorrow
            wrapper.find('button').at(1).simulate('click');  // ***************** doesn't seem to open modal when clicking on this???
          
            // check modal displayed            
            const modal = wrapper.find('CustomModal [isOpen=true]');
            expect(modal.length).to.equal(1);

            // cancel modal
            modal.find('button').at(0).simulate('click');            

            // check that update was not called
            sandbox.assert.notCalled(updateServiceDateSpy);
            sandbox.assert.notCalled(deselectAllTripsSpy);
            
            // check modal is not displayed    
            expect(wrapper.find('CustomModal [isOpen=false]').length).to.equal(1);
        });

        it('should display modal and on confirm of modal call to change date', () => {
            wrapper = setup({ 
                selectedTrips: ['trip1', 'trip2'],
            });
            
            // check modal is closed
            expect(wrapper.find('CustomModal [isOpen=false]').length).to.equal(1);

            // click button to move to tomorrow
            wrapper.find('button').at(1).simulate('click');  // ***************** doesn't seem to open modal when clicking on this???
          
            // check modal displayed            
            const modal = wrapper.find('CustomModal [isOpen=true]');
            expect(modal.length).to.equal(1);

            // cancel modal
            modal.find('button').at(1).simulate('click');            

            // check that update and deselect was called
            sandbox.assert.calledOnce(updateServiceDateSpy);
            sandbox.assert.calledWith(updateServiceDateSpy, tomorrowServiceDateString);
            sandbox.assert.calledOnce(deselectAllTripsSpy);
            
            // check modal is not displayed    
            expect(wrapper.find('CustomModal [isOpen=false]').length).to.equal(1);
        });
            
    });

    describe('When changing service date without selected trips', () => {
        
        it('should not display modal but call to change date when clicking on previous day service date', () => {
             wrapper = setup({
                 selectedTrips: [],
             });

            // check modal is closed
            expect(wrapper.find('CustomModal [isOpen=false]').length).to.equal(1);

            // click button to move to tomorrow
            wrapper.find('button').at(0).simulate('click');

            // check modal has stayed closed
            expect(wrapper.find('CustomModal [isOpen=false]').length).to.equal(1);

            // check that update was called and deselect was not called
            sandbox.assert.calledOnce(updateServiceDateSpy);
            sandbox.assert.calledWith(updateServiceDateSpy, yesterdayServiceDateString);
            sandbox.assert.notCalled(deselectAllTripsSpy);
        });

        it('should not display modal but call to change date when clicking on next day service date', () => {
            wrapper = setup({
                selectedTrips: [],
            });

           // check modal is closed
           expect(wrapper.find('CustomModal [isOpen=false]').length).to.equal(1);

           // click button to move to tomorrow
           wrapper.find('button').at(1).simulate('click');

           // check modal has stayed closed
           expect(wrapper.find('CustomModal [isOpen=false]').length).to.equal(1);

           // check that update was called and deselect was not called
           sandbox.assert.calledOnce(updateServiceDateSpy);
           sandbox.assert.calledWith(updateServiceDateSpy, tomorrowServiceDateString);
           sandbox.assert.notCalled(deselectAllTripsSpy);
       });
    });
});