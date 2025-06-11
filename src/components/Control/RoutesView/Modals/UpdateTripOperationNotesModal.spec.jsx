/** @jest-environment jsdom */
import React from 'react';
import { mount } from 'enzyme';
import sinon from 'sinon';
import configureMockStore from 'redux-mock-store';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { Input } from 'reactstrap';
import { act } from 'react-dom/test-utils';
import { TRIP_OPERATION_NOTES_MAX_LENGTH } from '../../../../constants/trips';
import UpdateTripOperationNotesModal from './UpdateTripOperationNotesModal';
import CustomModal from '../../../Common/CustomModal/CustomModal';

const mockStore = configureMockStore([thunk]);

describe('<UpdateTripOperationNotesModal />', () => {
    let wrapper;
    let sandbox;
    let store;
    let defaultProps;
    let trip;
    let onCloseMock;
    let bulkUpdateTripsOperationNotesMock;

    beforeEach(() => {
        sandbox = sinon.createSandbox();
        onCloseMock = jest.fn();
        bulkUpdateTripsOperationNotesMock = jest.fn();

        trip = {
            tripId: 'trip-1',
            routeVariantId: 'variant-1',
            routeLongName: 'Test Route',
            operationNotes: 'Initial note',
        };

        store = mockStore({
            control: {
                routes: {
                    tripInstances: {
                        isActionLoading: {},
                    },
                },
            },
        });

        defaultProps = {
            isModalOpen: true,
            trip,
            onClose: onCloseMock,
            bulkUpdateTripsOperationNotes: bulkUpdateTripsOperationNotesMock,
            actionLoadingStatesByTripId: {},
        };
    });

    afterEach(() => {
        sandbox.restore();
        jest.clearAllMocks();
    });

    const setup = (customProps = {}) => mount(
        <Provider store={ store }>
            <UpdateTripOperationNotesModal { ...defaultProps } { ...customProps } />
        </Provider>,
    );

    it('renders modal with default note and correct props', () => {
        wrapper = setup();
        const input = wrapper.find(Input);
        expect(input.prop('value')).toBe('Initial note');
        expect(wrapper.find(CustomModal).prop('isModalOpen')).toBe(true);
        expect(wrapper.find('#trip-operation-notes-max-length-info').text()).toContain(`The maximum length is ${TRIP_OPERATION_NOTES_MAX_LENGTH}`);
    });

    it('updates internal state when input changes', () => {
        wrapper = setup();
        const newNote = 'Updated operation note';

        act(() => {
            wrapper.find('textarea#trip__operation-notes').props().onChange({
                currentTarget: { value: newNote },
            });
        });

        wrapper.update();
        const input = wrapper.find(Input);
        expect(input.prop('value')).toBe(newNote);
    });

    it('does not crash if modal is closed without update', () => {
        wrapper = setup({ isModalOpen: false });
        expect(wrapper.find(CustomModal).prop('isModalOpen')).toBe(false);
    });
});
