/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import ApplyChangesModal from './ApplyChangesModal';
import {
    toggleIncidentModals,
} from '../../../../../redux/actions/control/incidents';

const mockStore = configureStore([thunk]);

jest.useFakeTimers();

jest.mock('../../../../../redux/actions/control/incidents', () => ({
    toggleIncidentModals: jest.fn(),
}));

describe('ApplyChangesModal Component', () => {
    let store;

    const defaultProps = {
        toggleIncidentModals: jest.fn(),
        applyChanges: jest.fn(),
    };

    beforeEach(() => {
        toggleIncidentModals.mockImplementation((type, isOpen) => (dispatch) => {
            dispatch({ type: 'MOCK_TOGGLE_INCIDENT_MODALS', payload: { type, isOpen } });
        });
        store = mockStore({
            control:
                {
                    incidents: {
                        incidents: {},
                        disruptions: [],
                        isLoading: false,
                        affectedEntities: [],
                        isCreateEnabled: false,
                        activeIncident: null,
                        incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                    },
                },
            appSettings: {
                useDisruptionsNotificationsDirectLink: 'true',
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Renders without crashing and displays apply changes modal', () => {
        render(
            <Provider store={ store }>
                <ApplyChangesModal { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('Are you sure you want to apply and save the changes for effect?')).toBeInTheDocument();
        expect(screen.getByText('Changes will only take place once applied.')).toBeInTheDocument();
    });

    it('Close modal on click on Keep editing', () => {
        render(
            <Provider store={ store }>
                <ApplyChangesModal { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /keep editing/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);

        expect(toggleIncidentModals).toHaveBeenCalledWith('isApplyChangesOpen', false);
    });

    it('Close modal on click on Apply and save button and return to disruption tab', () => {
        render(
            <Provider store={ store }>
                <ApplyChangesModal { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /apply and save/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);
        expect(defaultProps.applyChanges).toHaveBeenCalled();
    });
});
