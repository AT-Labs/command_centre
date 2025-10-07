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
    clearActiveIncident } from '../../../../../redux/actions/control/incidents';
import { goToNotificationsView } from '../../../../../redux/actions/control/link';

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
        useDisruptionsNotificationsDirectLink: true,
        updateIncidentsSortingParams: jest.fn(),
        clearActiveIncident: jest.fn(),
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

    it('Close modal on click on View disruption details button', () => {
        render(
            <Provider store={ store }>
                <Confirmation { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /view disruption details/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);

        expect(openCreateIncident).toHaveBeenCalledWith(false);
        expect(deleteAffectedEntities).toHaveBeenCalled();
        expect(updateIncidentsSortingParams).toHaveBeenCalledWith({});
        expect(clearActiveIncident).toHaveBeenCalledWith();
        jest.advanceTimersByTime(100);
        expect(updateActiveIncident).toHaveBeenCalledWith('123', false);
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
        expect(goToNotificationsView).toHaveBeenCalled();
    });
});
