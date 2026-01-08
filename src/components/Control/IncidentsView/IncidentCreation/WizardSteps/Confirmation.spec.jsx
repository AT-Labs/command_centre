/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Confirmation from './Confirmation';
import {
    updateActiveIncident,
    openCreateIncident,
    deleteAffectedEntities,
    updateIncidentsSortingParams,
    clearActiveIncident,
    toggleIncidentModals,
    clearDisruptionActionResult } from '../../../../../redux/actions/control/incidents';
import { goToNotificationsView } from '../../../../../redux/actions/control/link';
import EDIT_TYPE from '../../../../../types/edit-types';

const mockStore = configureStore([thunk]);

jest.useFakeTimers();

const action = {
    resultIncidentId: '123',
    isRequesting: false,
    resultStatus: 'success',
    resultMessage: 'Test result message',
    resultCreateNotification: false,
    isCopied: false,
};

jest.mock('../../../../../redux/actions/control/incidents', () => ({
    clearDisruptionActionResult: jest.fn(),
    updateActiveIncident: jest.fn(),
    openCreateIncident: jest.fn(),
    deleteAffectedEntities: jest.fn(),
    updateDisruptionsDatagridConfig: jest.fn(),
    updateIncidentsSortingParams: jest.fn(),
    clearActiveIncident: jest.fn(),
    toggleIncidentModals: jest.fn(),
}));

jest.mock('../../../../../redux/actions/control/link', () => ({
    goToNotificationsView: jest.fn(),
}));

describe('Confirmation Component', () => {
    let store;

    const defaultProps = {
        response: { ...action },
        clearDisruptionActionResult: jest.fn(),
        updateActiveIncident: jest.fn(),
        isModalOpen: true,
        openCreateIncident,
        deleteAffectedEntities: jest.fn(),
        goToNotificationsView: jest.fn(),
        isDisruptionsNotificationsDirectLinkEnabled: true,
        updateIncidentsSortingParams: jest.fn(),
        clearActiveIncident: jest.fn(),
        toggleIncidentModals: jest.fn(),
    };

    beforeEach(() => {
        clearDisruptionActionResult.mockImplementation(() => (dispatch) => {
            dispatch({ type: 'MOCK_CLEAR_DISRUPTION_ACTION_RESULT', payload: null });
        });
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
        updateIncidentsSortingParams.mockImplementation(sortingParams => (dispatch) => {
            dispatch({ type: 'MOCK_UPDATE_SORTING_PARAMS', payload: { sortingParams } });
        });
        clearActiveIncident.mockImplementation(() => (dispatch) => {
            dispatch({ type: 'MOCK_CLEAR_ACTIVE_INCIDENT', payload: null });
        });
        updateActiveIncident.mockImplementation(activeIncidentId => (dispatch) => {
            dispatch({ type: 'MOCK_MOCK_UPDATE_ACTIVE_INCIDENT', payload: activeIncidentId });
        });
        goToNotificationsView.mockImplementation(queryOarams => (dispatch) => {
            dispatch({ type: 'MOCK_GO_TO_NOTIFICATIONS', payload: queryOarams });
        });
        toggleIncidentModals.mockImplementation((modalType, isOpen) => (dispatch) => {
            dispatch({ type: 'MOCK_TOGGLE_INCIDENT_MODALS', payload: { modalType, isOpen } });
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
                        editMode: EDIT_TYPE.EDIT,
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

    it('Renders without crashing and displays modal success window', () => {
        render(
            <Provider store={ store }>
                <Confirmation { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('New disruption has been created')).toBeInTheDocument();
        expect(screen.getByText(action.resultMessage)).toBeInTheDocument();
    });

    it('Close modal on click on View all disruptions button', () => {
        render(
            <Provider store={ store }>
                <Confirmation { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /view all disruptions/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);

        expect(openCreateIncident).toHaveBeenCalledWith(false);
        expect(deleteAffectedEntities).toHaveBeenCalled();
    });

    it('Close modal on click on View all Disruptions button', () => {
        render(
            <Provider store={ store }>
                <Confirmation { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /view all disruptions/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);

        expect(openCreateIncident).toHaveBeenCalledWith(false);
        expect(deleteAffectedEntities).toHaveBeenCalled();
    });

    it('Close modal on click on View notifications button', () => {
        render(
            <Provider store={ store }>
                <Confirmation { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /view notifications/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);

        expect(openCreateIncident).toHaveBeenCalledWith(false);
        expect(deleteAffectedEntities).toHaveBeenCalled();
        expect(goToNotificationsView).toHaveBeenCalledWith({
            version: 1,
            incidentId: '123',
            source: 'DISR',
            new: true,
        });
        expect(toggleIncidentModals).toHaveBeenCalledWith('isConfirmationOpen', false);
    });

    it('should pass correct query params to goToNotificationsView with resultIncidentVersion', () => {
        const propsWithVersion = {
            ...defaultProps,
            response: {
                ...action,
                resultIncidentVersion: 5,
                resultIncidentId: '456',
            },
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithVersion } />
            </Provider>,
        );

        const button = screen.getByRole('button', { name: /view notifications/i });
        fireEvent.click(button);

        expect(goToNotificationsView).toHaveBeenCalledWith({
            version: 5,
            incidentId: '456',
            source: 'DISR',
            new: true,
        });
    });

    it('should use default version 1 when resultIncidentVersion is not provided', () => {
        const propsWithoutVersion = {
            ...defaultProps,
            response: {
                ...action,
                resultIncidentVersion: null,
                resultIncidentId: '789',
            },
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithoutVersion } />
            </Provider>,
        );

        const button = screen.getByRole('button', { name: /view notifications/i });
        fireEvent.click(button);

        expect(goToNotificationsView).toHaveBeenCalledWith({
            version: 1,
            incidentId: '789',
            source: 'DISR',
            new: true,
        });
    });

    it('should display error message when resultMessage is present', () => {
        const errorMessage = 'Failed to update disruption INC123. The following disruptions failed: DISR001, DISR002.';
        const propsWithError = {
            ...defaultProps,
            response: {
                isRequesting: false,
                resultIncidentId: null,
                resultMessage: errorMessage,
                resultStatus: 'danger',
            },
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithError } />
            </Provider>,
        );

        const message = screen.getByText(errorMessage);
        expect(message).toBeInTheDocument();
    });

    it('should display default error message when resultMessage is not present', () => {
        const propsWithError = {
            ...defaultProps,
            response: {
                isRequesting: false,
                resultIncidentId: null,
                resultMessage: null,
                resultStatus: 'danger',
            },
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithError } />
            </Provider>,
        );

        const message = screen.getByText('Failed to update disruption');
        expect(message).toBeInTheDocument();
    });

    it('should display error message for partial error', () => {
        store = mockStore({
            ...store.getState(),
            control: {
                ...store.getState().control,
                incidents: {
                    ...store.getState().control.incidents,
                    editMode: EDIT_TYPE.CREATE,
                },
            },
        });

        const propsWithError = {
            ...defaultProps,
            response: {
                isRequesting: false,
                resultIncidentId: null,
                resultMessage: 'Failed to create disruption. The following disruptions failed: DISR001',
                resultStatus: 'danger',
            },
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithError } />
            </Provider>,
        );

        const message = screen.getByText('Failed to create disruption. The following disruptions failed: DISR001');
        expect(message).toBeInTheDocument();
    });

    it('should display loader when isRequesting is true', () => {
        const propsWithLoading = {
            ...defaultProps,
            response: {
                isRequesting: true,
                resultIncidentId: null,
                resultMessage: null,
                resultStatus: null,
            },
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithLoading } />
            </Provider>,
        );

        expect(screen.getByLabelText('Loading data')).toBeInTheDocument();
    });

    it('should render View disruption details button when direct link is enabled', () => {
        const propsWithDirectLink = {
            ...defaultProps,
            isDisruptionsNotificationsDirectLinkEnabled: true,
            response: {
                ...action,
                resultStatus: 'success',
                resultIncidentId: '123',
            },
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithDirectLink } />
            </Provider>,
        );

        const button = screen.getByRole('button', { name: /view disruption details/i });
        expect(button).toBeInTheDocument();

        const viewAllButton = screen.getByRole('button', { name: /view all disruptions/i });
        expect(viewAllButton).toBeInTheDocument();

        const viewNotificationsButton = screen.getByRole('button', { name: /view notifications/i });
        expect(viewNotificationsButton).toBeInTheDocument();
    });

    it('should render View and add more information button when direct link is disabled', () => {
        store = mockStore({
            ...store.getState(),
            appSettings: {
                useDisruptionsNotificationsDirectLink: 'false',
            },
        });

        const propsWithoutDirectLink = {
            ...defaultProps,
            response: {
                ...action,
                resultStatus: 'success',
                resultIncidentId: '123',
            },
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithoutDirectLink } />
            </Provider>,
        );

        const button = screen.getByRole('button', { name: /view and add more information/i });
        expect(button).toBeInTheDocument();

        const viewAllButton = screen.getByRole('button', { name: /^view all$/i });
        expect(viewAllButton).toBeInTheDocument();
    });

    it('should handle View and add more information button click', () => {
        store = mockStore({
            ...store.getState(),
            appSettings: {
                useDisruptionsNotificationsDirectLink: 'false',
            },
        });

        const propsWithoutDirectLink = {
            ...defaultProps,
            response: {
                ...action,
                resultStatus: 'success',
                resultIncidentId: '123',
            },
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithoutDirectLink } />
            </Provider>,
        );

        const button = screen.getByRole('button', { name: /view and add more information/i });
        fireEvent.click(button);

        jest.runAllTimers();

        expect(clearDisruptionActionResult).toHaveBeenCalled();
        expect(toggleIncidentModals).toHaveBeenCalledWith('isConfirmationOpen', false);
        expect(openCreateIncident).toHaveBeenCalledWith(false);
        expect(deleteAffectedEntities).toHaveBeenCalled();
        expect(updateIncidentsSortingParams).toHaveBeenCalledWith({});
        expect(clearActiveIncident).toHaveBeenCalled();
        expect(updateActiveIncident).toHaveBeenCalledWith('123');
    });

    it('should handle View disruption details button click', () => {
        render(
            <Provider store={ store }>
                <Confirmation { ...defaultProps } />
            </Provider>,
        );

        const button = screen.getByRole('button', { name: /view disruption details/i });
        fireEvent.click(button);

        jest.runAllTimers();

        expect(clearDisruptionActionResult).toHaveBeenCalled();
        expect(toggleIncidentModals).toHaveBeenCalledWith('isConfirmationOpen', false);
        expect(openCreateIncident).toHaveBeenCalledWith(false);
        expect(deleteAffectedEntities).toHaveBeenCalled();
        expect(updateIncidentsSortingParams).toHaveBeenCalledWith({});
        expect(clearActiveIncident).toHaveBeenCalled();
        expect(updateActiveIncident).toHaveBeenCalledWith('123');
    });

    it('should handle Keep editing button click when error occurs', () => {
        const propsWithError = {
            ...defaultProps,
            response: {
                isRequesting: false,
                resultIncidentId: null,
                resultMessage: 'Error message',
                resultStatus: 'danger',
            },
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithError } />
            </Provider>,
        );

        const button = screen.getByRole('button', { name: /keep editing/i });
        fireEvent.click(button);

        expect(clearDisruptionActionResult).toHaveBeenCalled();
        expect(toggleIncidentModals).toHaveBeenCalledWith('isConfirmationOpen', false);
    });

    it('should display draft notification message when resultCreateNotification is true', () => {
        const propsWithNotification = {
            ...defaultProps,
            response: {
                ...action,
                resultCreateNotification: true,
            },
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithNotification } />
            </Provider>,
        );

        expect(screen.getByText('Draft stop message has been created')).toBeInTheDocument();
    });

    it('should not call updateActiveIncident when isModalOpen is false', () => {
        const propsWithModalClosed = {
            ...defaultProps,
            isModalOpen: false,
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithModalClosed } />
            </Provider>,
        );

        const button = screen.getByRole('button', { name: /view disruption details/i });
        fireEvent.click(button);

        jest.runAllTimers();

        expect(updateActiveIncident).toHaveBeenCalledWith('123');
    });

    it('should not call updateActiveIncident when resultIncidentId is null', () => {
        const propsWithoutIncidentId = {
            ...defaultProps,
            response: {
                ...action,
                resultIncidentId: null,
            },
        };

        render(
            <Provider store={ store }>
                <Confirmation { ...propsWithoutIncidentId } />
            </Provider>,
        );

        expect(screen.queryByText('New disruption has been created')).not.toBeInTheDocument();
    });

    it('should render null when no valid state is present', () => {
        const propsWithNoState = {
            ...defaultProps,
            response: {
                isRequesting: false,
                resultIncidentId: null,
                resultMessage: null,
                resultStatus: null,
            },
        };

        const { container } = render(
            <Provider store={ store }>
                <Confirmation { ...propsWithNoState } />
            </Provider>,
        );

        expect(container.querySelector('.disruption-creation__wizard-confirmation')).toBeInTheDocument();
        expect(container.querySelector('.col').textContent).toBe('');
    });
});
