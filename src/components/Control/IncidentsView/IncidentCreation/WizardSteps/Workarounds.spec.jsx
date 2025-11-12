import { shallow, mount } from 'enzyme';
import React from 'react';
import { withHooks } from 'jest-react-hooks-shallow';
import { Provider } from 'react-redux';
import configureMockStore from 'redux-mock-store';
import { Workarounds } from './Workarounds';
import Footer from './Footer';
import { SelectedEntitiesRenderer } from './SelectedEntitiesRenderer';
import { useDraftDisruptions } from '../../../../../redux/selectors/appSettings';
import EDIT_TYPE from '../../../../../types/edit-types';
import { STATUSES } from '../../../../../types/disruptions-types';

jest.mock('../../../../../redux/selectors/appSettings', () => ({
    useDraftDisruptions: jest.fn(),
}));

const mockStore = configureMockStore([]);

let wrapper;
jest.useFakeTimers();

const mockDisruptions = [
    {
        key: 'DISR123',
        header: 'Test Disruption 1',
        impact: 'CANCELLATION',
        affectedEntities: {
            affectedStops: [],
            affectedRoutes: [{ routeShortName: 'WEST', routeId: 1 }, { routeShortName: 'EAST', routeId: 2 }],
        },
    },
    {
        key: 'DISR321',
        header: 'Test Disruption 2',
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
        useDraftDisruptions.mockReturnValue(false);
        const store = mockStore({});
        const props = { ...componentPropsMock, editMode: EDIT_TYPE.CREATE };
        wrapper = mount(
            <Provider store={ store }>
                <Workarounds { ...props } />
            </Provider>,
        );

        const disruptionList = wrapper.find('ul.disruption-workarounds-effects');
        expect(disruptionList.find('Button').length).toBe(2);
        
        const selectedEntitiesRenderers = disruptionList.find(SelectedEntitiesRenderer);
        expect(selectedEntitiesRenderers).toHaveLength(2);
        
        const allRoutes = disruptionList.find('.disruption-effect-item-route');
        const allStops = disruptionList.find('.disruption-effect-item-stop');
        
        expect(allRoutes).toHaveLength(2);
        expect(allRoutes.at(0).text()).toBe('Route - WEST');
        
        expect(allStops).toHaveLength(2);
        expect(allStops.at(0).text()).toBe('Stop - 100 test stop');
    });

    it('Should call toggleWorkaroundPanel when openWorkaroundPanel is called', () => {
        wrapper = setup({ editMode: EDIT_TYPE.CREATE });
        const buttons = wrapper.find('Button');
        buttons.at(0).simulate('click');
        expect(componentPropsMock.updateDisruptionKeyToWorkaroundEdit).toHaveBeenCalledWith(mockDisruptions[0].key);
        expect(componentPropsMock.toggleWorkaroundPanel).toHaveBeenCalledWith(true);
    });

    it('Should rerender effects after updating filtering value', () => {
        useDraftDisruptions.mockReturnValue(false);
        const store = mockStore({});
        const props = { ...componentPropsMock, editMode: EDIT_TYPE.CREATE };
        wrapper = mount(
            <Provider store={ store }>
                <Workarounds { ...props } />
            </Provider>,
        );
        let disruptionList = wrapper.find('ul.disruption-workarounds-effects');
        let selectedEntitiesRenderers = disruptionList.find(SelectedEntitiesRenderer);
        expect(disruptionList.find('Button').length).toBe(2);
        expect(selectedEntitiesRenderers).toHaveLength(2);
        
        let allRoutes = disruptionList.find('.disruption-effect-item-route');
        let allStops = disruptionList.find('.disruption-effect-item-stop');
        expect(allRoutes).toHaveLength(2);
        expect(allRoutes.at(0).text()).toBe('Route - WEST');
        expect(allStops).toHaveLength(2);
        expect(allStops.at(0).text()).toBe('Stop - 100 test stop');

        wrapper.find('Input#disruption-creation__wizard-select-details__header')
            .props()
            .onChange({ target: { value: 'east' } });
        wrapper.update();
        jest.advanceTimersByTime(2000);
        wrapper.update();
        expect(wrapper.find('Input#disruption-creation__wizard-select-details__header').props().value).toBe('east');
        
        disruptionList = wrapper.find('ul.disruption-workarounds-effects');
        expect(disruptionList.find('Button').length).toBe(1);
        
        selectedEntitiesRenderers = disruptionList.find(SelectedEntitiesRenderer);
        expect(selectedEntitiesRenderers).toHaveLength(1);
        
        allRoutes = disruptionList.find('.disruption-effect-item-route');
        allStops = disruptionList.find('.disruption-effect-item-stop');
        expect(allRoutes).toHaveLength(2);
        expect(allStops).toHaveLength(0);
    });

    it('Should render footer with correct button on draft status for add effect mode', () => {
        wrapper = setup({ editMode: EDIT_TYPE.ADD_EFFECT, incidentStatus: STATUSES.DRAFT });
        const footer = wrapper.find(Footer);
        expect(footer.prop('nextButtonValue')).toEqual('Save draft');
    });

    it('Should update disruptions on update newIncidentEffect value', () => {
        withHooks(() => {
            useDraftDisruptions.mockReturnValue(false);
            const store = mockStore({});
            const props = { ...componentPropsMock, editMode: EDIT_TYPE.ADD_EFFECT, newIncidentEffect: { ...mockDisruptions[1] } };
            wrapper = mount(
                <Provider store={ store }>
                    <Workarounds { ...props } />
                </Provider>,
            );
            wrapper.update();
            const selectedEntitiesRenderers = wrapper.find(SelectedEntitiesRenderer);
            expect(selectedEntitiesRenderers).toHaveLength(1);
            
            const stops = wrapper.find('.disruption-effect-item-stop');
            expect(stops).toHaveLength(2);
            expect(stops.first().text()).toBe('Stop - 100 test stop');
        });
    });
});
