import React from 'react';
import { mount } from 'enzyme';
import { Button } from 'reactstrap';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { useDraftDisruptions } from '../../../../../redux/selectors/appSettings';
import Footer from './Footer';

let store;

jest.mock('../../../../../redux/selectors/appSettings', () => ({
    useDraftDisruptions: jest.fn(),
}));

const mockStore = configureStore([]);

const mockProps = {
    toggleDisruptionModals: jest.fn(),
    onContinue: jest.fn(),
    onSubmitDraft: jest.fn(),
    onBack: jest.fn(),
    isDraftOrCreateMode: true,
    isSubmitDisabled: false,
    isDraftSubmitDisabled: false,
    nextButtonValue: 'Continue',
};

const setup = (customProps = {}) => {
    store = mockStore({ useDraftDisruptions: false });
    const props = { ...mockProps, ...customProps };
    return mount(
        <Provider store={ store }>
            <Footer { ...props } />
        </Provider>,
    );
};

describe('<Footer />', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render columns with "col-2" when useDraftDisruptions and isDraftOrCreateMode are true', () => {
        useDraftDisruptions.mockReturnValue(true);

        const wrapper = setup({ isDraftOrCreateMode: true });

        expect(wrapper.find('.col-2').length).toBeGreaterThan(0);
        expect(wrapper.find('.col-3').length).toBe(0);
    });

    it('should render "Save draft" block only when useDraftDisruptions and isDraftOrCreateMode are true', () => {
        useDraftDisruptions.mockReturnValue(true);
        const wrapper = setup({ isDraftOrCreateMode: true });

        expect(wrapper.find(Button).filterWhere(btn => btn.text() === 'Save draft').exists()).toBe(true);
    });

    it('should NOT render "Save draft" block when useDraftDisruptions is false', () => {
        useDraftDisruptions.mockReturnValue(false);
        const wrapper = setup({ isDraftOrCreateMode: true });

        expect(wrapper.find(Button).filterWhere(btn => btn.text() === 'Save draft').exists()).toBe(false);
    });

    it('should NOT render "Save draft" block when isDraftOrCreateMode is false', () => {
        useDraftDisruptions.mockReturnValue(true);
        const wrapper = setup({ isDraftOrCreateMode: false });

        expect(wrapper.find(Button).filterWhere(btn => btn.text() === 'Save draft').exists()).toBe(false);
    });

    it('should NOT render "Save draft" div when isDraftOrCreateMode is false and useDraftDisruptions is true', () => {
        useDraftDisruptions.mockReturnValue(true);
        const wrapper = setup({ isDraftOrCreateMode: false });
        expect(wrapper.find('div.col-3.pl-0').filterWhere(div => div.text().includes('Save draft')).exists()).toBe(false);
        expect(wrapper.find('div.col-4.pl-0').filterWhere(div => div.text().includes('Save draft')).exists()).toBe(false);
    });

    describe('Finish Button functionality', () => {
        it('should render Finish button when showFinishButton is true', () => {
            const wrapper = setup({ showFinishButton: true });

            expect(wrapper.find(Button).filterWhere(btn => btn.text() === 'Finish').exists()).toBe(true);
        });

        it('should NOT render Finish button when showFinishButton is false', () => {
            const wrapper = setup({ showFinishButton: false });

            expect(wrapper.find(Button).filterWhere(btn => btn.text() === 'Finish').exists()).toBe(false);
        });

        it('should call onFinish when Finish button is clicked', () => {
            const onFinish = jest.fn();
            const wrapper = setup({ showFinishButton: true, onFinish });

            wrapper.find(Button).filterWhere(btn => btn.text() === 'Finish').simulate('click');

            expect(onFinish).toHaveBeenCalledTimes(1);
        });

        it('should be disabled when isFinishDisabled is true', () => {
            const wrapper = setup({ showFinishButton: true, isFinishDisabled: true });

            const finishButton = wrapper.find(Button).filterWhere(btn => btn.text() === 'Finish');
            expect(finishButton.prop('disabled')).toBe(true);
        });

        it('should NOT be disabled when isFinishDisabled is false', () => {
            const wrapper = setup({ showFinishButton: true, isFinishDisabled: false });

            const finishButton = wrapper.find(Button).filterWhere(btn => btn.text() === 'Finish');
            expect(finishButton.prop('disabled')).toBe(false);
        });

        it('should display custom finishButtonValue when provided', () => {
            const customValue = 'Save';
            const wrapper = setup({ showFinishButton: true, finishButtonValue: customValue });

            expect(wrapper.find(Button).filterWhere(btn => btn.text() === customValue).exists()).toBe(true);
        });

        it('should display default "Finish" text when finishButtonValue is not provided', () => {
            const wrapper = setup({ showFinishButton: true });

            expect(wrapper.find(Button).filterWhere(btn => btn.text() === 'Finish').exists()).toBe(true);
        });

        it('should have correct CSS classes for Finish button', () => {
            const wrapper = setup({ showFinishButton: true });

            const finishButton = wrapper.find(Button).filterWhere(btn => btn.text() === 'Finish');
            expect(finishButton.hasClass('btn')).toBe(true);
            expect(finishButton.hasClass('cc-btn-success')).toBe(true);
            expect(finishButton.hasClass('btn-block')).toBe(true);
        });

        it('should render Finish button in correct column when useDraftDisruptions and isDraftOrCreateMode are true', () => {
            useDraftDisruptions.mockReturnValue(true);
            const wrapper = setup({ showFinishButton: true, isDraftOrCreateMode: true });

            const finishButtonContainer = wrapper.find('div.col-2.pl-0').filterWhere(div => div.find(Button).filterWhere(btn => btn.text() === 'Finish').exists());
            expect(finishButtonContainer.exists()).toBe(true);
        });

        it('should render Finish button in correct column when useDraftDisruptions is false', () => {
            useDraftDisruptions.mockReturnValue(false);
            const wrapper = setup({ showFinishButton: true });

            const finishButtonContainer = wrapper.find('div.col-3.pl-0').filterWhere(div => div.find(Button).filterWhere(btn => btn.text() === 'Finish').exists());
            expect(finishButtonContainer.exists()).toBe(true);
        });
    });
});
