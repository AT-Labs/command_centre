import { shallow } from 'enzyme';
import React from 'react';
import sinon from 'sinon';
import { SelectDetails } from './SelectDetails';
import Footer from './Footer';

let sandbox;
let wrapper;

const componentPropsMock = {
    data: {},
    onStepUpdate: jest.fn(),
    onDataUpdate: jest.fn(),
    onSubmit: jest.fn(),
    updateCurrentStep: jest.fn(),
    stops: [],
    routes: [],
    toggleDisruptionModals: jest.fn(),
};

const setup = (customProps) => {
    const props = componentPropsMock;
    Object.assign(props, customProps);
    return shallow(<SelectDetails { ...props } />);
};

describe('<SelectDetails />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
        sandbox.useFakeTimers(new Date('2022-03-01T06:00:00.000Z'));
        wrapper = setup();
    });

    afterEach(() => sandbox.restore());

    it('should render', () => {
        expect(wrapper.exists()).toEqual(true);
    });

    describe('submit button', () => {
        let data;
        let stops;
        let routes;

        beforeEach(() => {
            data = {
                startTime: '06:00',
                startDate: '09/03/2022',
                endTime: '06:00',
                endDate: '10/03/2022',
                impact: 'NO_SERVICE',
                cause: 'TECHNICAL_PROBLEM',
                mode: '-',
                status: 'not-started',
                header: 'Title',
                description: 'Description',
                url: 'https://at.govt.nz',
                createNotification: false,
                recurrent: true,
                duration: '2',
                recurrencePattern: {
                    freq: 2,
                    dtstart: new Date('2022-03-09T06:00:00.000Z'),
                    until: new Date('2022-03-10T06:00:00.000Z'),
                    byweekday: [0],
                },
            };
            stops = [{ stopCode: '105' }];
            routes = [{ routeId: 'AIR-221' }];
        });

        it('should be disabled when there are no affected entities', () => {
            wrapper = setup({ data, stops: [], routes: [] });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when startTime is empty', () => {
            data.startTime = '';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when startDate is empty', () => {
            data.startDate = '';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when impact is empty', () => {
            data.impact = '';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when cause is empty', () => {
            data.cause = '';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when header is empty', () => {
            data.header = '';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when description is empty', () => {
            data.description = '';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when disruption is recurrent and end date is empty', () => {
            data.recurrent = true;
            data.endDate = '';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when disruption is not recurrent, end date is not empty and end time is empty', () => {
            data.recurrent = false;
            data.endTime = '';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when disruption is recurrent and duration is empty', () => {
            data.recurrent = true;
            data.duration = '';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when disruption is recurrent and no weekday is selected', () => {
            data.recurrent = true;
            data.recurrencePattern.byweekday = [];
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when url is invalid', () => {
            data.url = 'url';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when startTime is invalid', () => {
            data.startTime = '0600';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when startDate is invalid', () => {
            data.startDate = '09-03-2022';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when endTime is invalid', () => {
            data.endTime = '0600';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when endDate is invalid', () => {
            data.endDate = '10-03-2022';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should be disabled when duration is invalid', () => {
            data.duration = '36';
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(true);
        });

        it('should not be disabled when disruption is not recurrent, all required fields are set and valid', () => {
            data.recurrent = false;
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(false);
        });

        it('should not be disabled when disruption is recurrent, all required fields are set and valid', () => {
            data.recurrent = true;
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('isSubmitDisabled')).toEqual(false);
        });

        it('with useWorkarounds off: should fire submit when next button is clicked', () => {
            data.recurrent = false;
            wrapper = setup({ data, stops, routes });
            const footer = wrapper.find(Footer);
            expect(footer.prop('nextButtonValue')).toEqual('Finish');
            footer.renderProp('onContinue')();
            expect(componentPropsMock.onSubmit).toHaveBeenCalled();
        });

        it('with useWorkarounds on: should fire step update when next button is clicked', () => {
            data.recurrent = false;
            wrapper = setup({ data, stops, routes, useWorkarounds: true });
            const footer = wrapper.find(Footer);
            expect(footer.prop('nextButtonValue')).toEqual('Continue');
            footer.renderProp('onContinue')();
            expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(2);
            expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(3);
        });
    });
});
