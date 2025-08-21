/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import CancellationEffectModal from './CancellationEffectModal';
import {
    toggleIncidentModals,
    setRequestToUpdateEditEffectState,
    setRequestedDisruptionKeyToUpdateEditEffect,
} from '../../../../../redux/actions/control/incidents';

const mockStore = configureStore([thunk]);

jest.useFakeTimers();

jest.mock('../../../../../redux/actions/control/incidents', () => ({
    toggleIncidentModals: jest.fn(),
    setRequestToUpdateEditEffectState: jest.fn(),
    setRequestedDisruptionKeyToUpdateEditEffect: jest.fn(),
}));

describe('ConfirmationEffect Component', () => {
    let store;

    const defaultProps = {
        toggleIncidentModals: jest.fn(),
        setRequestToUpdateEditEffectState: jest.fn(),
        setRequestedDisruptionKeyToUpdateEditEffect: jest.fn(),
        discardChanges: jest.fn(),
    };

    beforeEach(() => {
        toggleIncidentModals.mockImplementation((type, isOpen) => (dispatch) => {
            dispatch({ type: 'MOCK_TOGGLE_INCIDENT_MODALS', payload: { type, isOpen } });
        });
        setRequestToUpdateEditEffectState.mockImplementation(isRequested => (dispatch) => {
            dispatch({ type: 'MOCK_REQUEST_TO_UPDATE_EDIT_EFFECT_STATE', payload: isRequested });
        });
        setRequestedDisruptionKeyToUpdateEditEffect.mockImplementation(disruptionKeyToEditEffect => (dispatch) => {
            dispatch({ type: 'MOCK_SET_REQUESTED_DISRUPTION_KEY_TO__TO_EDIT_EFFECT', payload: disruptionKeyToEditEffect });
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

    it('Renders without crashing and displays modal cancel window', () => {
        render(
            <Provider store={ store }>
                <CancellationEffectModal { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('Are you sure you want to close?')).toBeInTheDocument();
        expect(screen.getByText('Any information entered will not be saved.')).toBeInTheDocument();
    });

    it('Close modal on click on Keep editing', () => {
        render(
            <Provider store={ store }>
                <CancellationEffectModal { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /keep editing/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);
        expect(setRequestedDisruptionKeyToUpdateEditEffect).toHaveBeenCalledWith('');
        expect(setRequestToUpdateEditEffectState).toHaveBeenCalledWith(false);
        expect(toggleIncidentModals).toHaveBeenCalledWith('isCancellationEffectOpen', false);
    });

    it('Close modal on click on Discard changes button and trigger discard changes props', () => {
        render(
            <Provider store={ store }>
                <CancellationEffectModal { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /discard changes/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);
        expect(defaultProps.discardChanges).toHaveBeenCalled();
    });
});
