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
    onSubmitUpdate: jest.fn(),
    updateCurrentStep: jest.fn(),
    toggleDisruptionModals: jest.fn(),
    onSubmitDraft: jest.fn(),
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

    it('should fire step update and submit when next button is clicked and is not edit mode', () => {
        const footer = wrapper.find(Footer);
        footer.renderProp('onContinue')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(3);
        expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(1);
        expect(componentPropsMock.onSubmit).toHaveBeenCalled();
    });

    it('should fire step update when back button is clicked and is not edit mode', () => {
        const footer = wrapper.find(Footer);
        footer.renderProp('onBack')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(1);
        expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(2);
    });

    it('should fire step update and submit update when next button is clicked and is edit mode', () => {
        wrapper = setup({ isEditMode: true });
        const footer = wrapper.find(Footer);
        footer.renderProp('onContinue')();
        expect(componentPropsMock.onSubmitUpdate).toHaveBeenCalled();
    });

    it('should fire step update when back button is clicked and is edit mode', () => {
        wrapper = setup({ isEditMode: true });
        const footer = wrapper.find(Footer);
        footer.renderProp('onBack')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(0);
        expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(1);
    });

    it('should render editMode', () => {
        expect(wrapper.exists()).toEqual(true);
        const footer = wrapper.find(Footer);
        expect(footer.prop('nextButtonValue')).toEqual('Save');
    });

    it('should call onSubmit and update steps when next button is clicked and not in edit mode', () => {
        const footer = wrapper.find(Footer);
        footer.prop('onContinue')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(3);
        expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(1);
        expect(componentPropsMock.onSubmit).toHaveBeenCalled();
    });

    it('should call onSubmitDraft and update steps when save draft button is clicked and not in edit mode', () => {
        const onSubmitDraftSpy = jest.fn();
        wrapper = setup({
            isEditMode: false,
            onSubmitDraft: onSubmitDraftSpy,
        });
        const footer = wrapper.find(Footer);
        footer.prop('onSubmitDraft')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(3);
        expect(onSubmitDraftSpy).toHaveBeenCalled();
    });

    it('should call onSubmitUpdate when next button is clicked and in edit mode', () => {
        wrapper = setup({ isEditMode: true });
        const footer = wrapper.find(Footer);
        footer.prop('onContinue')();
        expect(componentPropsMock.onSubmitUpdate).toHaveBeenCalled();
    });

    it('should call onStepUpdate and updateCurrentStep when back button is clicked and not in edit mode', () => {
        const footer = wrapper.find(Footer);
        footer.prop('onBack')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(1);
        expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(2);
    });

    it('should call onStepUpdate and updateCurrentStep when back button is clicked and in edit mode', () => {
        wrapper = setup({ isEditMode: true });
        const footer = wrapper.find(Footer);
        footer.prop('onBack')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(0);
        expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(2);
    });

    it('should render with correct next button value in edit mode', () => {
        wrapper = setup({ isEditMode: true });
        const footer = wrapper.find(Footer);
        expect(footer.prop('nextButtonValue')).toEqual('Save');
    });

    it('should call toggleDisruptionModals when toggleModals is called', () => {
        const footer = wrapper.find(Footer);
        footer.prop('toggleModals')();
        expect(componentPropsMock.toggleDisruptionModals).toHaveBeenCalled();
    });

    it('should call onSubmitUpdate when save button is clicked and in edit mode', () => {
        const onSubmitUpdateSpy = jest.fn();
        wrapper = setup({
            isEditMode: true,
            onSubmitUpdate: onSubmitUpdateSpy,
        });
        const footer = wrapper.find(Footer);
        footer.prop('onSubmitDraft')();
        expect(onSubmitUpdateSpy).toHaveBeenCalled();
    });
    it('should set isDraftOrCreateMode to true when not in edit mode', () => {
        wrapper = setup({ isEditMode: false });
        const footer = wrapper.find(Footer);
        expect(footer.prop('isDraftOrCreateMode')).toBe(true);
    });

    it('should set isDraftOrCreateMode to false when in edit mode', () => {
        wrapper = setup({ isEditMode: true });
        const footer = wrapper.find(Footer);
        expect(footer.prop('isDraftOrCreateMode')).toBe(false);
    });
});
