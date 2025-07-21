/**
 * @jest-environment jsdom
 */

import React from 'react';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { Header } from './Header';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn().mockReturnValue({ pathname: '/' }),
    useHistory: jest.fn().mockReturnValue({
        push: jest.fn(),
        listen: jest.fn(() => jest.fn()),
    }),
}));

const middlewares = [thunk];
const mockStore = configureStore(middlewares);
const profile = {
    userName: 'tester.test@propellerhead.co.nz',
    name: 'Tester test(EX)',
    roles: [
        'trip_alert_dismisser',
        'disruption_mgmt_admin',
        '360D',
        'block_mgmt_admin',
        'ATMB',
        'BAYES',
        'BFL',
        'ABEXP',
        'AM',
        'RTH',
        'notification_request_admin',
        'trip_replay_reader',
        'stop_messaging_mgmt_admin',
        'trip_mgmt_admin',
        'trip_mgmt_hide_trip_writer',
        'notification_request_writer',
        'EXPNZ',
        'bus_priority_reader',
        'trip_mgmt_add_trip_writer',
        'bus_priority_writer',
        'notification_request_reader',
        'trip_mgmt_recurrent_canceller',
    ],
};

describe('Header Component', () => {
    let store;
    const resetRealtimeToDefault = jest.fn();
    const mockProps = {
        updateMainView: jest.fn(),
        updateControlDetailView: jest.fn(),
        updateActiveControlEntityId: jest.fn(),
        getStopMessagesAndPermissions: jest.fn(() => () => {}),
        resetRealtimeToDefault,
        goToNotificationsView: jest.fn(),
        activeView: 'control-main-view',
        controlActiveView: 'control-blocks-view',
        userPermissions: {},
        useParentChildIncident: false,
        useRecurringCancellationsGridView: false,
        useBusPriorityDataManagement: false,
        activeControlEntityId: null,
        queryParams: null,
        userProfile: { ...profile },
    };

    beforeEach(() => {
        store = mockStore({
            user: {
                profile,
                permissions: {
                    controlRoutesView: true,
                    controlBlocksView: true,
                    controlStopMessagingView: true,
                    controlDisruptionsView: true,
                    controlAlertsView: false,
                    controlTripReplaysView: true,
                    controlFleetsView: true,
                    controlNotificationsView: true,
                    controlBusPriorityView: false,
                },
            },
        });
        jest.clearAllMocks();
    });

    test('renders the header component', () => {
        render(
            <Provider store={ store }>
                <Header { ...mockProps } />
            </Provider>,
        );
        const logoImage = screen.getByRole('img', { name: /at.govt.nz/i });
        expect(logoImage).toBeInTheDocument();
    });

    test('calls resetRealtimeToDefault when logo is clicked', async () => {
        render(
            <Provider store={ store }>
                <Header { ...mockProps } />
            </Provider>,
        );
        const logoImage = screen.getByRole('img', { name: /at.govt.nz/i });
        const logoButton = logoImage.closest('button');

        expect(logoButton).toBeInTheDocument();
        fireEvent.click(logoButton);
        expect(resetRealtimeToDefault).toHaveBeenCalledTimes(1);
    });

    test('renders BLOCKS button if permitted and handles click', () => {
        const props = {
            ...mockProps,
            userPermissions: { controlBlocksView: true },
        };
        render(
            <Provider store={ store }>
                <Header { ...props } />
            </Provider>,
        );
        const blocksButton = screen.getByRole('button', { name: /Block section button/i });
        expect(blocksButton).toBeInTheDocument();
        fireEvent.click(blocksButton);
        expect(props.updateMainView).toHaveBeenCalledWith('control-main-view');
        expect(props.updateControlDetailView).toHaveBeenCalledWith('control-blocks-view');
    });

    test('renders DISRUPTIONS button if permitted and handles click', () => {
        const props = {
            ...mockProps,
            useParentChildIncident: true,
            userPermissions: { controlDisruptionsView: true },
        };

        render(
            <Provider store={ store }>
                <Header { ...props } />
            </Provider>,
        );
        const disruptionsButton = screen.getByRole('button', { name: /Disruption section button/i });
        expect(disruptionsButton).toBeInTheDocument();
        fireEvent.click(disruptionsButton);
        expect(props.updateMainView).toHaveBeenCalledWith('control-main-view');
        expect(props.updateControlDetailView).toHaveBeenCalledWith('control-incidents');
        expect(props.updateActiveControlEntityId).toHaveBeenCalledWith(undefined);
    });

    test('renders MESSAGING button if permitted and handles click', () => {
        const props = {
            ...mockProps,
            userPermissions: { controlStopMessagingView: true },
        };

        render(
            <Provider store={ store }>
                <Header { ...props } />
            </Provider>,
        );
        const messagingButton = screen.getByRole('button', { name: /Messaging section button/i });
        expect(messagingButton).toBeInTheDocument();
        fireEvent.click(messagingButton);
        expect(props.updateMainView).toHaveBeenCalledWith('control-main-view');
        expect(props.updateControlDetailView).toHaveBeenCalledWith('control-messages');
    });

    test('renders NOTIFICATIONS button if permitted and handles click', () => {
        const props = {
            ...mockProps,
            userPermissions: { controlNotificationsView: true },
        };

        render(
            <Provider store={ store }>
                <Header { ...props } />
            </Provider>,
        );
        const notificationsButton = screen.getByRole('button', { name: /Notifications button/i });
        expect(notificationsButton).toBeInTheDocument();
        fireEvent.click(notificationsButton);
        expect(props.goToNotificationsView).toHaveBeenCalledTimes(1);
    });

    test('toggles dropdown on hover', () => {
        const props = {
            ...mockProps,
            userPermissions: { controlRoutesView: true },
        };

        render(
            <Provider store={ store }>
                <Header { ...props } />
            </Provider>,
        );
        const dropdownButton = screen.getByRole('button', { name: /Routes section button/i });
        fireEvent.mouseEnter(dropdownButton);
        fireEvent.mouseLeave(dropdownButton);
    });
});
