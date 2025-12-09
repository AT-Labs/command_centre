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
    onSaveDraft: jest.fn(),
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
                expect(wrapper.find(Footer).prop('nextButtonValue')).toEqual('Continue');

                wrapper.setProps({ isEditMode: false });
                expect(wrapper.find(Footer).prop('nextButtonValue')).toEqual('Continue');
            });
        });
    });

    it('should call onStepUpdate and onSubmitDraft when not in edit mode', () => {
        const onSaveDraftSpy = sinon.spy();
        const onStepUpdateSpy = sinon.spy();
        const onSubmitDraftSpy = sinon.spy();
        setup({
            isEditMode: false,
            onSaveDraft: onSaveDraftSpy,
            onStepUpdate: onStepUpdateSpy,
            onSubmitDraft: onSubmitDraftSpy,
        });
        wrapper.find(Footer).prop('onSubmitDraft')();
        expect(onSubmitDraftSpy.calledOnce).toEqual(true);
    });

    it('should call onSubmitUpdate when in edit mode', () => {
        const onSaveDraftSpy = sinon.spy();
        const onSubmitUpdateSpy = sinon.spy();
        setup({
            isEditMode: true,
            onSaveDraft: onSaveDraftSpy,
            onSubmitUpdate: onSubmitUpdateSpy,
        });
        wrapper.find(Footer).prop('onSubmitDraft')();
        expect(onSubmitUpdateSpy.calledOnce).toEqual(true);
        expect(onSaveDraftSpy.called).toEqual(false);
    });

    it('should call onStepUpdate and onSubmitDraft when editMode is undefined', () => {
        const onSaveDraftSpy = sinon.spy();
        const onStepUpdateSpy = sinon.spy();
        const onSubmitDraftSpy = sinon.spy();
        setup({
            isEditMode: undefined,
            onSaveDraft: onSaveDraftSpy,
            onStepUpdate: onStepUpdateSpy,
            onSubmitDraft: onSubmitDraftSpy,
        });
        wrapper.find(Footer).prop('onSubmitDraft')();
        expect(onSubmitDraftSpy.calledOnce).toEqual(true);
    });
});
