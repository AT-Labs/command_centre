import React from 'react';
import sinon from 'sinon';
import { shallow } from 'enzyme';
import { withHooks } from 'jest-react-hooks-shallow';
import Footer from './Footer';
import { SelectDisruptionEntities } from './SelectDisruptionEntities';

let wrapper;
let sandbox;

const defaultState = {
    affectedStops: [],
    affectedRoutes: [],
    isLoading: false,
    findRoutesByStop: {},
    findStopsByRoute: {},
    isEditMode: true,
    disruptionToEdit: null,
    searchResults: {},
    stops: {},
    stopGroups: {},
    data: { disruptionType: 'Routes' },
    onSubmitUpdate: jest.fn(),
    getRoutesByShortName: jest.fn(),
    search: jest.fn(),
    toggleDisruptionModals: jest.fn(),
    updateAffectedRoutesState: jest.fn(),
    updateAffectedStopsState: jest.fn(),
    onDataUpdate: jest.fn(),
    onStepUpdate: jest.fn(),
    deleteAffectedEntities: jest.fn(),
    updateCurrentStep: jest.fn(),
    getRoutesByStop: jest.fn(),
    getStopsByRoute: jest.fn(),
};

function setup(customProps) {
    const props = { ...defaultState };

    Object.assign(props, customProps);

    wrapper = shallow(<SelectDisruptionEntities { ...props } />);
}

describe('<SelectDisruptionEntities />', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });
    afterEach(() => {
        sandbox.restore();
        wrapper = null;
        jest.resetAllMocks();
    });

    describe('initial load', () => {
        it('Should render', () => {
            setup();
            expect(wrapper.exists()).toEqual(true);
        });

        it('should not display anything in the footer', () => {
            setup();
            expect(wrapper.find('footer>*').exists()).toEqual(false);
        });
    });

    describe('When entities are selected the page should render...', () => {
        it('should re-render if props are updated', () => {
            const affectedRoutes = [{ routeId: 'INN-202' }];
            withHooks(() => {
                setup({ affectedRoutes });
                expect(wrapper.find(Footer).exists()).toEqual(true);
                expect(wrapper.find(Footer).prop('nextButtonValue')).toEqual('Save');

                wrapper.setProps({ isEditMode: false });
                expect(wrapper.find(Footer).prop('nextButtonValue')).toEqual('Continue');

                wrapper.setProps({ affectedRoutes: [] });
                expect(wrapper.find(Footer).exists()).toEqual(false);
                expect(wrapper.find('footer').exists()).toEqual(true);
            });
        });
    });
});
