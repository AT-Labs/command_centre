import React from 'react';
import { shallow } from 'enzyme';
import { Button } from 'reactstrap';

import Message from '../../../Common/Message/Message';
import DetailLoader from '../../../../Common/Loader/DetailLoader';

import { NewTripModal } from './NewTripModal';

const componentPropsMock = {
    clearAddTripActionResult: jest.fn(),
    updateEnabledAddTripModal: jest.fn(),
    toggleAddTripModals: jest.fn(),
    goToRoutesView: jest.fn(),
    updateSelectedAddTrip: jest.fn(),
};

const setup = (customProps) => {
    const props = { ...componentPropsMock, ...customProps };
    return shallow(<NewTripModal { ...props } />);
};

describe('<NewTripModal />', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockResponse = {
        isRequesting: false,
        result: {
            tripId: '123',
            routeLongName: 'Test Route',
            startTime: '10:00',
        },
        resultMessage: 'Test error message',
    };

    it('should render the component without errors', () => {
        const wrapper = setup({ response: mockResponse });
        expect(wrapper.exists()).toBe(true);
    });

    it('should render the loading state when isRequesting is true', () => {
        const loadingResponse = {
            ...mockResponse,
            isRequesting: true,
        };
        const wrapper = setup({ response: loadingResponse });
        expect(wrapper.find(DetailLoader)).toHaveLength(1);
        expect(wrapper.find(Message)).toHaveLength(0);
    });

    it('should render the success state when result is truthy', () => {
        const successResponse = {
            ...mockResponse,
            result: {
                tripId: '123',
                routeLongName: 'Test Route',
                startTime: '10:00 AM',
            },
        };
        const wrapper = setup({ response: successResponse });
        expect(wrapper.find(DetailLoader)).toHaveLength(0);
        expect(wrapper.find(Message)).toHaveLength(0);
        expect(wrapper.find('span')).toHaveLength(4);
    });

    it('should render the error state when result is falsy', () => {
        const errorResponse = {
            ...mockResponse,
            result: null,
        };
        const wrapper = setup({ response: errorResponse });
        expect(wrapper.find(DetailLoader)).toHaveLength(0);
        expect(wrapper.find(Message)).toHaveLength(1);
    });

    it('should call the necessary functions when "Close" button is clicked', () => {
        const wrapper = setup({ response: mockResponse });
        wrapper.find(Button).at(1).simulate('click');
        expect(componentPropsMock.clearAddTripActionResult).toHaveBeenCalledTimes(1);
        expect(componentPropsMock.toggleAddTripModals).toHaveBeenCalledWith('isNewTripModalOpen', false);
    });

    it('should call the necessary functions when "View All" button is clicked', () => {
        const wrapper = setup({ response: mockResponse });
        wrapper.find(Button).at(0).simulate('click');
        expect(componentPropsMock.updateEnabledAddTripModal).toHaveBeenCalledWith(false);
        expect(componentPropsMock.clearAddTripActionResult).toHaveBeenCalledTimes(1);
        expect(componentPropsMock.toggleAddTripModals).toHaveBeenCalledWith('isNewTripModalOpen', false);
        expect(componentPropsMock.goToRoutesView).not.toHaveBeenCalled();
        expect(componentPropsMock.updateSelectedAddTrip).toHaveBeenCalledWith(null);
    });

    it('should call the necessary functions and navigate to routes view when "View Details" button is clicked', () => {
        const result = {
            tripId: '123',
            routeType: 'Test Route Type',
            startTime: '10:00',
            status: 'Test Status',
            agencyId: 'Test Agency ID',
            routeShortName: 'Test Route Short Name',
            routeVariantId: 'Test Route Variant ID',
        };
        const successResponse = {
            ...mockResponse,
            result,
        };
        const wrapper = setup({ response: successResponse });
        wrapper.find(Button).at(1).simulate('click');
        expect(componentPropsMock.updateEnabledAddTripModal).toHaveBeenCalledWith(false);
        expect(componentPropsMock.goToRoutesView).toHaveBeenCalledWith(result, {
            routeType: result.routeType,
            startTimeFrom: '10:00',
            tripStatus: result.status,
            agencyId: result.agencyId,
            routeShortName: result.routeShortName,
            routeVariantId: result.routeVariantId,
        });
        expect(componentPropsMock.updateSelectedAddTrip).toHaveBeenCalledWith(null);
        expect(componentPropsMock.clearAddTripActionResult).toHaveBeenCalledTimes(1);
        expect(componentPropsMock.toggleAddTripModals).toHaveBeenCalledWith('isNewTripModalOpen', false);
    });
});
