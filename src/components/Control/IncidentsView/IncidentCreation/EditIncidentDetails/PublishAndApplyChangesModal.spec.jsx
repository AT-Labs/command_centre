/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PublishAndApplyChangesModal from './PublishAndApplyChangesModal';
import {
    toggleIncidentModals,
} from '../../../../../redux/actions/control/incidents';

const mockStore = configureStore([thunk]);

jest.useFakeTimers();

jest.mock('../../../../../redux/actions/control/incidents', () => ({
    toggleIncidentModals: jest.fn(),
}));

describe('PublishAndApplyChangesModal Component', () => {
    let store;

    const defaultProps = {
        toggleIncidentModals: jest.fn(),
        publishIncidentChanges: jest.fn(),
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

    it('Renders without crashing and displays publish and apply changes modal', () => {
        render(
            <Provider store={ store }>
                <PublishAndApplyChangesModal { ...defaultProps } />
            </Provider>,
        );

        expect(screen.getByText('Are you sure you want to apply and publish these disruption changes?')).toBeInTheDocument();
        expect(screen.getByText('Changes will only take effect once applied.')).toBeInTheDocument();
    });

    it('Close modal on click on Keep editing', () => {
        render(
            <Provider store={ store }>
                <PublishAndApplyChangesModal { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /keep editing/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);

        expect(toggleIncidentModals).toHaveBeenCalledWith('isPublishAndApplyChangesOpen', false);
    });

    it('Close modal on click on Apply and save button and return to disruption tab', () => {
        render(
            <Provider store={ store }>
                <PublishAndApplyChangesModal { ...defaultProps } />
            </Provider>,
        );
        const button = screen.getByRole('button', { name: /apply and publish/i });
        expect(button).not.toBeNull();
        fireEvent.click(button);
        expect(defaultProps.publishIncidentChanges).toHaveBeenCalled();
    });
});
