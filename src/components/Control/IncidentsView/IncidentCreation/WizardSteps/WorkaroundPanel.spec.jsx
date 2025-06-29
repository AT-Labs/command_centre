import { shallow } from 'enzyme';
import React from 'react';
import { withHooks } from 'jest-react-hooks-shallow';
import { WorkaroundPanel } from './WorkaroundPanel';
import WorkaroundsForm from '../../Workaround/WorkaroundsForm';

let wrapper;

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
    disruptions: mockDisruptions,
    isWorkaroundPanelOpen: true,
    disruptionKeyToEdit: 'DISR123',
    toggleWorkaroundPanel: jest.fn(),
    onWorkaroundUpdate: jest.fn(),
    updateDisruptionKeyToWorkaroundEdit: jest.fn(),
};

const setup = (customProps) => {
    const props = componentPropsMock;
    Object.assign(props, customProps);
    return shallow(<WorkaroundPanel { ...props } />);
};

describe('<WorkaroundPanel />', () => {
    beforeEach(() => {
        wrapper = setup();
    });

    it('Should render', () => {
        expect(wrapper.exists()).toEqual(true);
        const spinner = wrapper.find('.loading-spinner');
        expect(spinner).toHaveLength(1);
        const closeButton = wrapper.find('.close');
        expect(closeButton).toHaveLength(1);
        const saveButton = wrapper.find('.save');
        expect(saveButton).toHaveLength(1);
    });

    it('Should fire onSubmit when save button is clicked', () => {
        wrapper = setup();
        wrapper.find('.save').props().onClick();
        expect(componentPropsMock.toggleWorkaroundPanel).toHaveBeenCalledWith(false);
        expect(componentPropsMock.updateDisruptionKeyToWorkaroundEdit).toHaveBeenCalledWith('');
    });

    it('Should fire onClose when save button is clicked', () => {
        wrapper = setup();
        wrapper.find('.close').props().onClick();
        expect(componentPropsMock.toggleWorkaroundPanel).toHaveBeenCalledWith(false);
        expect(componentPropsMock.updateDisruptionKeyToWorkaroundEdit).toHaveBeenCalledWith('');
    });

    it('Should rerender WorkaroundsForm after updating disruptionKeyToEdit', () => {
        withHooks(() => {
            wrapper = setup();
            const workaroundsForm = wrapper.find(WorkaroundsForm);
            expect(workaroundsForm.prop('disruption')).toEqual(mockDisruptions[0]);
            wrapper.setProps({ disruptionKeyToEdit: 'DISR321' });
            wrapper.update();
            const updatedWorkaroundsForm = wrapper.find(WorkaroundsForm);
            expect(updatedWorkaroundsForm.prop('disruption')).toEqual(mockDisruptions[1]);
        });
    });
});
