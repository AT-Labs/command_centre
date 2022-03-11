import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { LoadMore } from './LoadMore';

let wrapper;
let sandbox;

const mockProps = {
    message: 'this is a message.',
    limit: 30,
    total: 200,
    chunkSize: 40,
    isLoading: true,
    onClick: () => {},
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<LoadMore { ...props } />);
};

describe('<LoadMore />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => { sandbox.restore(); });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('Check View', () => {
        it('Should have An Alert component load.', () => {
            expect(wrapper.find('Alert')).to.have.lengthOf(1);
        });

        it('Should have the one button.', () => {
            expect(wrapper.find('button')).to.have.lengthOf(1);
        });

        it('Should have the message displayed.', () => {
            expect(wrapper.find('Alert').find('span').at(1).text()).to.equal(mockProps.message);
        });

        it('Should have Loader component show.', () => {
            expect(wrapper.find('Loader')).to.have.lengthOf(1);
        });

        it('Should not have the Alert component show.', () => {
            wrapper = setup({ chunkSize: 300 })
            expect(wrapper.find('Alert')).to.have.lengthOf(0);
        });

        it('Should not have the Loader component show.', () => {
            wrapper = setup({ isLoading: false })
            expect(wrapper.find('Loader')).to.have.lengthOf(0);
        });
    });

    context('Check Button Behavior.', () => {
        it('Should have the button function triggered.', () => {
            const spyOnClick = sinon.spy();
            wrapper = setup({ onClick: spyOnClick });
            wrapper.find('button').first().simulate('click');
            expect(spyOnClick.calledOnce).to.equal(true);
        });
    });
});