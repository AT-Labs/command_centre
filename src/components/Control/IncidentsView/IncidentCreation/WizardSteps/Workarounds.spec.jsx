import { shallow } from 'enzyme';
import React from 'react';
import { withHooks } from 'jest-react-hooks-shallow';
import { Workarounds } from './Workarounds';
import Footer from './Footer';
import EDIT_TYPE from '../../../../../types/edit-types';
import { STATUSES } from '../../../../../types/disruptions-types';

let wrapper;
jest.useFakeTimers();

const mockDisruptions = [
    {
        key: 'DISR123',
        impact: 'CANCELLATION',
        affectedEntities: {
            affectedStops: [],
            affectedRoutes: [{ routeShortName: 'WEST', routeId: 1 }, { routeShortName: 'EAST', routeId: 2 }],
        },
    },
    {
        key: 'DISR321',
        impact: 'Delay',
        affectedEntities: {
            affectedStops: [{ text: '100 test stop', stopId: 100 }, { text: '102 test stop', stopId: 102 }],
            affectedRoutes: [],
        },
    },
];

const componentPropsMock = {
    data: { disruptions: mockDisruptions },
    onStepUpdate: jest.fn(),
    onDataUpdate: jest.fn(),
    onSubmit: jest.fn(),
    onSubmitUpdate: jest.fn(),
    updateCurrentStep: jest.fn(),
    toggleIncidentModals: jest.fn(),
    onSubmitDraft: jest.fn(),
    toggleWorkaroundPanel: jest.fn(),
    updateDisruptionKeyToWorkaroundEdit: jest.fn(),
    isWorkaroundPanelOpen: false,
    disruptionKeyToEdit: '',
    editMode: EDIT_TYPE.CREATE,
    newIncidentEffect: { ...mockDisruptions[0] },
    setDisruptionForWorkaroundEdit: jest.fn(),
    incidentStatus: STATUSES.NOT_STARTED,
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

    it('Should render', () => {
        expect(wrapper.exists()).toEqual(true);
        const footer = wrapper.find(Footer);
        expect(footer.prop('nextButtonValue')).toEqual('Finish');
    });

    it('Should fire submit when next button is clicked and is not add effect mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.CREATE });
        const footer = wrapper.find(Footer);
        footer.renderProp('onContinue')();
        expect(componentPropsMock.onSubmit).toHaveBeenCalled();
    });

    it('Should fire step update when back button is clicked and is not add effect mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.CREATE });
        const footer = wrapper.find(Footer);
        footer.renderProp('onBack')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(1);
        expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(2);
        expect(componentPropsMock.toggleWorkaroundPanel).toHaveBeenCalledWith(false);
    });

    it('Should fire step update and submit update when next button is clicked and is add effect mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.ADD_EFFECT });
        const footer = wrapper.find(Footer);
        footer.renderProp('onContinue')();
        expect(componentPropsMock.onSubmitUpdate).toHaveBeenCalled();
    });

    it('Should fire step update when back button is clicked and is add effect mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.ADD_EFFECT });
        const footer = wrapper.find(Footer);
        footer.renderProp('onBack')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(0);
        expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(2);
        expect(componentPropsMock.toggleWorkaroundPanel).toHaveBeenCalledWith(false);
    });

    it('Should render editMode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.ADD_EFFECT });
        expect(wrapper.exists()).toEqual(true);
        const footer = wrapper.find(Footer);
        expect(footer.prop('nextButtonValue')).toEqual('Save');
    });

    it('Should call onSubmit when next button is clicked and not in add effect mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.CREATE });
        const footer = wrapper.find(Footer);
        footer.prop('onContinue')();
        expect(componentPropsMock.onSubmit).toHaveBeenCalled();
    });

    it('Should call onSubmitDraft when save draft button is clicked and not in add effect mode', () => {
        const onSubmitDraftSpy = jest.fn();
        wrapper = setup({
            editMode: EDIT_TYPE.CREATE,
            onSubmitDraft: onSubmitDraftSpy,
        });
        const footer = wrapper.find(Footer);
        footer.prop('onSubmitDraft')();
        expect(onSubmitDraftSpy).toHaveBeenCalled();
    });

    it('Should call onSubmitUpdate when next button is clicked and in edit mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.ADD_EFFECT });
        const footer = wrapper.find(Footer);
        footer.prop('onContinue')();
        expect(componentPropsMock.onSubmitUpdate).toHaveBeenCalled();
    });

    it('Should call onStepUpdate and updateCurrentStep when back button is clicked and not in add effect mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.CREATE });
        const footer = wrapper.find(Footer);
        footer.prop('onBack')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(1);
        expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(2);
        expect(componentPropsMock.toggleWorkaroundPanel).toHaveBeenCalledWith(false);
    });

    it('Should call onStepUpdate and updateCurrentStep when back button is clicked and in add effect mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.ADD_EFFECT });
        const footer = wrapper.find(Footer);
        footer.prop('onBack')();
        expect(componentPropsMock.onStepUpdate).toHaveBeenCalledWith(0);
        expect(componentPropsMock.updateCurrentStep).toHaveBeenCalledWith(2);
        expect(componentPropsMock.toggleWorkaroundPanel).toHaveBeenCalledWith(false);
    });

    it('Should render with correct next button value in add effect mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.ADD_EFFECT });
        const footer = wrapper.find(Footer);
        expect(footer.prop('nextButtonValue')).toEqual('Save');
    });

    it('Should call onSubmitUpdate when save button is clicked and in add effect mode', () => {
        const onSubmitUpdateSpy = jest.fn();
        wrapper = setup({
            editMode: EDIT_TYPE.ADD_EFFECT,
            onSubmitUpdate: onSubmitUpdateSpy,
        });
        const footer = wrapper.find(Footer);
        footer.prop('onSubmitDraft')();
        expect(onSubmitUpdateSpy).toHaveBeenCalled();
    });
    it('Should set isDraftOrCreateMode to true when not in add effect mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.CREATE });
        const footer = wrapper.find(Footer);
        expect(footer.prop('isDraftOrCreateMode')).toBe(true);
    });

    it('Should set isDraftOrCreateMode to false when in add effect mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.ADD_EFFECT });
        const footer = wrapper.find(Footer);
        expect(footer.prop('isDraftOrCreateMode')).toBe(false);
    });

    it('Should render table with correct disruptions data', () => {
        wrapper = setup({ editMode: EDIT_TYPE.CREATE });
        const routes = wrapper.find('.disruption-effect-item-route');
        const stops = wrapper.find('.disruption-effect-item-stop');
        expect(wrapper.find('Button').length).toBe(2);
        expect(routes).toHaveLength(2);
        expect(stops).toHaveLength(2);
        expect(routes.at(0).text()).toBe('Route - WEST');
        expect(stops.at(0).text()).toBe('Stop - 100 test stop');
    });

    it('Should call toggleWorkaroundPanel when openWorkaroundPanel is called', () => {
        wrapper = setup({ editMode: EDIT_TYPE.CREATE });
        const buttons = wrapper.find('Button');
        buttons.at(0).simulate('click');
        expect(componentPropsMock.updateDisruptionKeyToWorkaroundEdit).toHaveBeenCalledWith(mockDisruptions[0].key);
        expect(componentPropsMock.toggleWorkaroundPanel).toHaveBeenCalledWith(true);
    });

    it('Should rerender effects after updating filtering value', () => {
        withHooks(() => {
            wrapper = setup({ editMode: EDIT_TYPE.CREATE });
            const routes = wrapper.find('.disruption-effect-item-route');
            const stops = wrapper.find('.disruption-effect-item-stop');
            expect(wrapper.find('Button').length).toBe(2);
            expect(routes).toHaveLength(2);
            expect(stops).toHaveLength(2);
            expect(routes.at(0).text()).toBe('Route - WEST');
            expect(stops.at(0).text()).toBe('Stop - 100 test stop');

            wrapper.find('Input#disruption-creation__wizard-select-details__header')
                .props()
                .onChange({ target: { value: 'east' } });
            wrapper.update();
            jest.advanceTimersByTime(2000);
            expect(wrapper.find('Input#disruption-creation__wizard-select-details__header').props().value).toBe('east');
            expect(wrapper.find('Button').length).toBe(1);
            const updatedRoutes = wrapper.find('.disruption-effect-item-route');
            const updatedStops = wrapper.find('.disruption-effect-item-stop');
            expect(updatedRoutes).toHaveLength(2);
            expect(updatedStops).toHaveLength(0);
        });
    });

    it('Should render footer with correct button on draft status for add effect mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.ADD_EFFECT, incidentStatus: STATUSES.DRAFT });
        const footer = wrapper.find(Footer);
        expect(footer.prop('nextButtonValue')).toEqual('Save draft');
    });

    it('Should update disruptions on update newIncidentEffect value', () => {
        withHooks(() => {
            wrapper = setup({ editMode: EDIT_TYPE.ADD_EFFECT });
            wrapper.setProps({ newIncidentEffect: { ...mockDisruptions[1] } });
            const stops = wrapper.find('.disruption-effect-item-stop');
            expect(stops).toHaveLength(2);
            expect(stops.at(0).text()).toBe('Stop - 100 test stop');
        });
    });
});
