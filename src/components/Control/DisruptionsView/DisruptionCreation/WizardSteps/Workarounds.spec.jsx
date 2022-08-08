import { shallow } from 'enzyme';
import React from 'react';
import { Workarounds } from './Workarounds';
import Footer from './Footer';

let wrapper;

const componentPropsMock = {
    data: {},
    onStepUpdate: jest.fn(),
    onDataUpdate: jest.fn(),
    onSubmit: jest.fn(),
    updateCurrentStep: jest.fn(),
    toggleDisruptionModals: jest.fn(),
};

const setup = (customProps) => {
    const props = componentPropsMock;
    Object.assign(props, customProps);
    return shallow(<Workarounds { ...props } />);
};

describe('<Workarounds />', () => {
    beforeEach(() => {
        wrapper = setup();
    });

    it('should render', () => {
        expect(wrapper.exists()).toEqual(true);
        const footer = wrapper.find(Footer);
        expect(footer.prop('nextButtonValue')).toEqual('Finish');
    });

    it('should fire step update and submit when next button is clicked', () => {
        const footer = wrapper.find(Footer);
        footer.renderProp('onContinue')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(3);
        expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(1);
        expect(componentPropsMock.onSubmit).toHaveBeenCalled();
    });

    it('should fire step update when back button is clicked', () => {
        const footer = wrapper.find(Footer);
        footer.renderProp('onBack')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(1);
        expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(2);
    });
});
