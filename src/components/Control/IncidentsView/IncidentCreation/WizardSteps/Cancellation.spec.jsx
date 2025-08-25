/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Cancellation from './Cancellation';
import {
    toggleIncidentModals,
    openCreateIncident,
    deleteAffectedEntities,
    toggleEditEffectPanel,
    toggleWorkaroundPanel,
    updateDisruptionKeyToEditEffect,
    updateDisruptionKeyToWorkaroundEdit,
    setDisruptionForWorkaroundEdit,
} from '../../../../../redux/actions/control/incidents';

const mockStore = configureStore([thunk]);

jest.useFakeTimers();

jest.mock('../../../../../redux/actions/control/incidents', () => ({
    toggleIncidentModals: jest.fn(),
    openCreateIncident: jest.fn(),
    deleteAffectedEntities: jest.fn(),
    toggleEditEffectPanel: jest.fn(),
    toggleWorkaroundPanel: jest.fn(),
    updateDisruptionKeyToEditEffect: jest.fn(),
    updateDisruptionKeyToWorkaroundEdit: jest.fn(),
    setDisruptionForWorkaroundEdit: jest.fn(),
}));

jest.mock('../../../../../redux/actions/control/link', () => ({
    goToNotificationsView: jest.fn(),
}));

describe('Confirmation Component', () => {
    let store;

    const defaultProps = {
        toggleIncidentModals: jest.fn(),
        openCreateIncident: jest.fn(),
        deleteAffectedEntities: jest.fn(),
        toggleEditEffectPanel: jest.fn(),
        toggleWorkaroundPanel: jest.fn(),
        updateDisruptionKeyToEditEffect: jest.fn(),
        updateDisruptionKeyToWorkaroundEdit: jest.fn(),
        setDisruptionForWorkaroundEdit: jest.fn(),
    };

    beforeEach(() => {
        openCreateIncident.mockImplementation(isCreateEnabled => (dispatch) => {
            dispatch({ type: 'MOCK_OPEN_INCIDENT', payload: isCreateEnabled });
        });
        deleteAffectedEntities.mockImplementation(() => (dispatch) => {
            dispatch({ type: 'MOCK_DELETE_AFFECTED_ENTITIES',
                payload: {
                    activeStep: 2,
                    showSelectedRoutes: false,
                    affectedEntities: {
                        affectedRoutes: [],
                        affectedStops: [],
                    },
                    stopsByRoute: {},
                    routesByStop: {},
                } });
        });
        toggleIncidentModals.mockImplementation((type, isOpen) => (dispatch) => {
            dispatch({ type: 'MOCK_TOGGLE_INCIDENT_MODALS', payload: { type, isOpen } });
        });
        toggleWorkaroundPanel.mockImplementation(isWorkaroundOpen => (dispatch) => {
            dispatch({ type: 'MOCK_TOGGLE_WORKAROUND_PANEL', payload: isWorkaroundOpen });
        });
        updateDisruptionKeyToWorkaroundEdit.mockImplementation(disruptionKeyToWorkaroundEdit => (dispatch) => {
            dispatch({ type: 'MOCK_DISRUPTION_KEY_TO_WORKAROUND_EDIT', payload: disruptionKeyToWorkaroundEdit });
        });
        toggleEditEffectPanel.mockImplementation(isEditEffectPanelOpen => (dispatch) => {
            dispatch({ type: 'MOCK_TOGGLE_EDIT_EFFECT_PANEL', payload: isEditEffectPanelOpen });
        });
        updateDisruptionKeyToEditEffect.mockImplementation(disruptionKeyToEditEffect => (dispatch) => {
            dispatch({ type: 'MOCK_UPDATE_DISRUPTION_KEY_TO_EDIT_EFFECT', payload: disruptionKeyToEditEffect });
        });
        setDisruptionForWorkaroundEdit.mockImplementation(disruptionForWorkaroundEdit => (dispatch) => {
            dispatch({ type: 'MOCK_DISRUPTION_FOR_WORKAROUND_EDIT', payload: disruptionForWorkaroundEdit });
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
                <Cancellation { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('Are you sure you want to close?')).toBeInTheDocument();
        expect(screen.getByText('Any information entered will not be saved.')).toBeInTheDocument();
    });

    it('Close modal on click on Keep editing', () => {
        render(
            <Provider store={ store }>
                <Cancellation { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /keep editing/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);

        expect(toggleIncidentModals).toHaveBeenCalledWith('isCancellationOpen', false);
    });

    it('Close modal on click on Discard changes button and return to disruption tab', () => {
        render(
            <Provider store={ store }>
                <Cancellation { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /discard changes/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);
        expect(openCreateIncident).toHaveBeenCalledWith(false);
        expect(deleteAffectedEntities).toHaveBeenCalled();
        expect(toggleIncidentModals).toHaveBeenCalledWith('isCancellationOpen', false);
        expect(toggleWorkaroundPanel).toHaveBeenCalledWith(false);
        expect(updateDisruptionKeyToWorkaroundEdit).toHaveBeenCalledWith('');
        expect(toggleEditEffectPanel).toHaveBeenCalledWith(false);
        expect(updateDisruptionKeyToEditEffect).toHaveBeenCalledWith('');
        expect(setDisruptionForWorkaroundEdit).toHaveBeenCalledWith({});
    });
});
