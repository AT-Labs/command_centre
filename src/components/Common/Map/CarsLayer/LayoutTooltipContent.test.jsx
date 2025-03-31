import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { LayoutTooltipContent } from './LayoutTooltipContent';

let wrapper;
let sandbox;

const mockDeployments = [
    {
        tmpCode: 'TMP123',
        layoutCode: 'LAY123',
        worksiteAddress: '123 Main Street',
        startDate: '2024-03-01',
        endDate: '2024-03-10',
        jurisdictionId: '1',
        layoutDescription: 'Test Layout',
        tmpDescription: 'Test TMP',
        stmsName: 'John Doe',
        stmsMobile: '1234567890',
        stmsUserId: 'STMS123',
        contractor: 'ABC Contractors',
    },
];

const setup = (customProps) => {
    const props = { deployments: mockDeployments, ...customProps };
    return shallow(<LayoutTooltipContent { ...props } />);
};

describe('<LayoutTooltipContent />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('Check View', () => {
        it('Should render the correct number of deployments', () => {
            expect(wrapper.find('.border')).to.have.lengthOf(mockDeployments.length);
        });

        it('Should display TMP Code correctly', () => {
            expect(wrapper.find('.text-wrap').at(0).text()).to.equal(mockDeployments[0].tmpCode);
        });

        it('Should display Layout Code correctly', () => {
            expect(wrapper.find('.text-wrap').at(1).text()).to.equal(mockDeployments[0].layoutCode);
        });

        it('Should display Worksite Address correctly', () => {
            expect(wrapper.find('.text-wrap').at(2).text()).to.equal(mockDeployments[0].worksiteAddress);
        });
    });
});
