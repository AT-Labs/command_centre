import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { Polyline, Tooltip } from 'react-leaflet';

import { TmpLayoutPolygon } from './TmpLayoutPolygon';
import { LayoutTooltipContent } from './LayoutTooltipContent';

let wrapper;
let sandbox;

const mockProps = {
    id: 1,
    geometry: {
        coordinates: [
            [10.0, 20.0],
            [30.0, 40.0]
        ]
    },
    deployments: [
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
            contractor: 'ABC Contractors'
        }
    ]
};

const setup = (customProps) => {
    const props = { ...mockProps, ...customProps };
    return shallow(<TmpLayoutPolygon {...props} />);
};

describe('<TmpLayoutPolygon />', () => {
    beforeEach(() => {
        wrapper = setup();
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('Should render', () => expect(wrapper.exists()).to.equal(true));

    context('Check Polyline Rendering', () => {
        it('Should render a Polyline component', () => {
            expect(wrapper.find(Polyline)).to.have.lengthOf(1);
        });

        it('Should pass correct positions to Polyline', () => {
            const polylineProps = wrapper.find(Polyline).props();
            expect(polylineProps.positions).to.deep.equal([
                [20.0, 10.0],
                [40.0, 30.0]
            ]);
        });
    });

    context('Check Tooltip Rendering', () => {
        it('Should render Tooltip with LayoutTooltipContent if deployments exist', () => {
            expect(wrapper.find(Tooltip)).to.have.lengthOf(1);
            expect(wrapper.find(LayoutTooltipContent)).to.have.lengthOf(1);
        });

        it('Should render Tooltip with "No deployments" if no deployments exist', () => {
            wrapper = setup({ deployments: [] });
            expect(wrapper.find(Tooltip)).to.have.lengthOf(1);
            expect(wrapper.find(LayoutTooltipContent)).to.have.lengthOf(0);
            expect(wrapper.find('.container').text()).to.equal('No deployments for this impact');
        });
    });
});
