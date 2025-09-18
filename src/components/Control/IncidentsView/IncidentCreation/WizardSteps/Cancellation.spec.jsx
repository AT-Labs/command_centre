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
    updateEditMode,
    updateCurrentStep,
} from '../../../../../redux/actions/control/incidents';
import EDIT_TYPE from '../../../../../types/edit-types';
import { getEditMode } from '../../../../../redux/selectors/control/incidents';

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
    updateEditMode: jest.fn(),
    updateCurrentStep: jest.fn(),
}));

jest.mock('../../../../../redux/actions/control/link', () => ({
    goToNotificationsView: jest.fn(),
}));

jest.mock('../../../../../redux/selectors/control/incidents');

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
        clearNewEffectToIncident: jest.fn(),
        editMode: EDIT_TYPE.CREATE,
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
        updateEditMode.mockImplementation(mode => (dispatch) => {
            dispatch({ type: 'MOCK_UPDATE_EDIT_MODE', payload: mode });
        });
        updateCurrentStep.mockImplementation(currentStep => (dispatch) => {
            dispatch({ type: 'MOCK_CURRENT_STEP', payload: currentStep });
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
        getEditMode.mockReturnValue(EDIT_TYPE.CREATE);
        render(
            <Provider store={ store }>
                <Cancellation { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('Are you sure you want to close?')).toBeInTheDocument();
        expect(screen.getByText('Any information entered will not be saved.')).toBeInTheDocument();
    });

    it('Close modal on click on Keep editing', () => {
        getEditMode.mockReturnValue(EDIT_TYPE.CREATE);
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
        getEditMode.mockReturnValue(EDIT_TYPE.CREATE);
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

    it('Close modal on click on Discard changes button for add effect flow and return to edit flow', () => {
        getEditMode.mockReturnValue(EDIT_TYPE.ADD_EFFECT);
        render(
            <Provider store={ store }>
                <Cancellation { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /discard changes/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);
        expect(defaultProps.clearNewEffectToIncident).toHaveBeenCalled();
        expect(updateEditMode).toHaveBeenCalledWith(EDIT_TYPE.EDIT);
        expect(updateCurrentStep).toHaveBeenCalledWith(1);
        expect(toggleIncidentModals).toHaveBeenCalledWith('isCancellationOpen', false);
    });
});
