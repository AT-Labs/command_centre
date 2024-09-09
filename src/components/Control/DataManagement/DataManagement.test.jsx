import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { DataManagement } from './DataManagement';

let wrapper;
let sandbox;

const componentPropsMock = {
    pageSettings: {
        drawerOpen: true,
        selectedIndex: 0,
    },
    updatePageSettings: () => {},
    stopMessagesPermissions: [ { _rel: 'edit' } ]
};

const setup = (customProps) => {
    const props = componentPropsMock;

    Object.assign(props, customProps);
    wrapper = shallow(<DataManagement { ...props } />);

    return wrapper;
};

describe('<DataManagement />', () => {
    beforeEach(() => sandbox = sinon.createSandbox());
    afterEach(() => sandbox.restore());

    it('should render', () => {
        wrapper = setup();
        expect(wrapper.exists()).to.equal(true);
    });

    describe('On first loading', () => {
        
        it('should set the header to the first selected page', () => {

            setup();

            expect(wrapper.find('h1').text()).to.equal('Data Management - Manage Stop Groups');
        });
    });
});
