import React from 'react';
import { shallow, mount } from 'enzyme';
import { expect } from 'chai';
import sinon from 'sinon';
import Wizard from './Wizard';

const MockStep = () => <div>Step</div>;

const mockProps = {
    className: 'custom-class',
    data: { testData: 'value' },
    response: { testResponse: 'response' },
    onSubmit: sinon.spy(),
    onSubmitDraft: sinon.spy(),
    onStepUpdate: sinon.spy(),
    onDataUpdate: sinon.spy(),
};

describe('<Wizard />', () => {
    let defaultProps;

    beforeEach(() => {
        defaultProps = { ...mockProps };
    });

    it('should render without crashing and wrap child', () => {
        const wrapper = shallow(
            <Wizard { ...defaultProps }>
                {React.Children.toArray(<MockStep />)}
            </Wizard>,
        );

        expect(wrapper.exists()).to.be.true; // eslint-disable-line
        expect(wrapper.find('section').hasClass('wizard')).to.be.true; // eslint-disable-line
        expect(wrapper.find('section').hasClass('container')).to.be.true; // eslint-disable-line
        expect(wrapper.find('section').hasClass('custom-class')).to.be.true; // eslint-disable-line
        const child = wrapper.find(MockStep);
        expect(child).to.have.lengthOf(1);
    });

    it('should call onStepUpdate when step changes', () => {
        const wrapper = mount(
            <Wizard { ...defaultProps }>
                {React.Children.toArray(<MockStep />)}
                {React.Children.toArray(<MockStep />)}
            </Wizard>,
        );

        wrapper.instance().onStepUpdate(1);
        wrapper.update();

        expect(wrapper.state('activeStep')).to.equal(1);
        expect(wrapper.state('prevStep')).to.equal(0);
        expect(defaultProps.onStepUpdate.calledOnceWith(1)).to.be.true; // eslint-disable-line
    });

    it('should show the correct step based on activeStep state', () => {
        const wrapper = mount(
            <Wizard { ...defaultProps }>
                {React.Children.toArray(<MockStep />)}
                {React.Children.toArray(<MockStep />)}
            </Wizard>,
        );

        expect(wrapper.find(MockStep)).to.have.lengthOf(1);
        wrapper.instance().onStepUpdate(1);
        wrapper.update();
        expect(wrapper.find(MockStep)).to.have.lengthOf(1);
    });

    it('should call onDataUpdate when invoked from child', () => {
        const wrapper = mount(
            <Wizard { ...defaultProps }>
                {React.Children.toArray(<MockStep />)}
            </Wizard>,
        );

        const injectedOnDataUpdate = wrapper.find(MockStep).prop('onDataUpdate');
        injectedOnDataUpdate('wizardInstance', 'key', 'value');

        expect(defaultProps.onDataUpdate.calledOnceWith('wizardInstance', 'key', 'value')).to.be.true; // eslint-disable-line
    });

    it('should handle multiple children and render only active step', () => {
        const wrapper = mount(
            <Wizard { ...defaultProps }>
                {React.Children.toArray(<MockStep />)}
                {React.Children.toArray(<MockStep />)}
                {React.Children.toArray(<MockStep />)}
            </Wizard>,
        );

        expect(wrapper.find(MockStep)).to.have.lengthOf(1);

        wrapper.instance().onStepUpdate(2);
        wrapper.update();

        expect(wrapper.find(MockStep)).to.have.lengthOf(1);
    });

    it('should handle empty children gracefully', () => {
        const wrapper = shallow(
            <Wizard { ...defaultProps }>
                {null}
                {React.Children.toArray(<MockStep />)}
                {false}
            </Wizard>,
        );

        expect(wrapper.find(MockStep)).to.have.lengthOf(1);
    });
});
