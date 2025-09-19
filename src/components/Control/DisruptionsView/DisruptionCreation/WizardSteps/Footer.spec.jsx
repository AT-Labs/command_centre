import React from 'react';
import { mount } from 'enzyme';
import { Button } from 'reactstrap';
import configureStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import { useDraftDisruptions, useAdditionalFrontendChanges } from '../../../../../redux/selectors/appSettings';
import Footer from './Footer';

let store;

jest.mock('../../../../../redux/selectors/appSettings', () => ({
    useDraftDisruptions: jest.fn(),
    useAdditionalFrontendChanges: jest.fn(),
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
    store = mockStore({ useDraftDisruptions: false, useAdditionalFrontendChanges: false });
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

    it('should render columns with "col-3" when useDraftDisruptions and isDraftOrCreateMode are true', () => {
        useDraftDisruptions.mockReturnValue(true);

        const wrapper = setup({ isDraftOrCreateMode: true });

        expect(wrapper.find('.col-3').length).toBeGreaterThan(0);
        expect(wrapper.find('.col-4').exists()).toBe(false);
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
});
