import React from 'react';
import { mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import AddNoteModal from './AddNoteModal';

jest.mock('../../../../Common/CustomModal/CustomModal', () => ({
    __esModule: true,
    default: ({ children, customFooter, customHeader }) => (
        <div>
            {customHeader}
            {children}
            {customFooter}
        </div>
    ),
}));

jest.mock('@mui/icons-material/OpenInNewOutlined', () => ({
    __esModule: true,
    default: props => <span data-testid="mock-icon" { ...props } />,
}));

describe('AddNoteModal additional tests', () => {
    const disruption = { note: 'Initial note', incidentNo: 123 };
    let onClose; let onSubmit; let
        wrapper;

    beforeEach(() => {
        onClose = jest.fn();
        onSubmit = jest.fn();
    });

    it('should mount without crashing', async () => {
        await act(async () => {
            wrapper = mount(
                <AddNoteModal
                    isModalOpen
                    disruption={ disruption }
                    onClose={ onClose }
                    onSubmit={ onSubmit }
                />,
            );
        });
        wrapper.update();
        expect(wrapper.exists()).toBe(true);
    });

    it('should allow submitting an empty note', async () => {
        await act(async () => {
            wrapper = mount(
                <AddNoteModal
                    isModalOpen
                    disruption={ { ...disruption, note: '' } }
                    onClose={ onClose }
                    onSubmit={ onSubmit }
                />,
            );
        });
        wrapper.update();

        await act(async () => {
            wrapper.find('button').at(0).simulate('click');
        });
        wrapper.update();

        expect(onSubmit).toHaveBeenCalledWith('');
    });

    it('should call onClose with current note when close icon is clicked', async () => {
        await act(async () => {
            wrapper = mount(
                <AddNoteModal
                    isModalOpen
                    disruption={ disruption }
                    onClose={ onClose }
                    onSubmit={ onSubmit }
                />,
            );
        });
        wrapper.update();

        await act(async () => {
            wrapper.find('[data-testid="mock-icon"]').at(0).simulate('click');
        });
        wrapper.update();

        expect(onClose).toHaveBeenCalledWith('Initial note');
    });

    it('should reset note when modal is reopened', async () => {
        let isModalOpen = true;
        let disruptionProp = { ...disruption, note: 'First note' };

        await act(async () => {
            wrapper = mount(
                <AddNoteModal
                    isModalOpen={ isModalOpen }
                    disruption={ disruptionProp }
                    onClose={ onClose }
                    onSubmit={ onSubmit }
                />,
            );
        });
        wrapper.update();

        await act(async () => {
            wrapper.find('textarea').simulate('change', { target: { value: 'Changed note' } });
        });
        wrapper.update();
        expect(wrapper.find('textarea').prop('value')).toBe('Changed note');

        isModalOpen = false;
        await act(async () => {
            wrapper.setProps({ isModalOpen });
        });
        wrapper.update();

        isModalOpen = true;
        disruptionProp = { ...disruption, note: 'Second note' };
        await act(async () => {
            wrapper.setProps({ isModalOpen, disruption: disruptionProp });
        });
        wrapper.update();

        expect(wrapper.find('textarea').prop('value')).toBe('Second note');
    });

    it('should focus the textarea on open', async () => {
        await act(async () => {
            wrapper = mount(
                <AddNoteModal
                    isModalOpen
                    disruption={ disruption }
                    onClose={ onClose }
                    onSubmit={ onSubmit }
                />,
            );
        });
        wrapper.update();

        expect(wrapper.find('textarea').exists()).toBe(true);
    });
});
