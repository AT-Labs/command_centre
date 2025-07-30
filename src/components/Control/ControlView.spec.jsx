/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import '@testing-library/jest-dom';
import configureStore from 'redux-mock-store';
import ControlView from './ControlView';
import VIEW_TYPE from '../../types/view-types';

const mockStore = configureStore([]);
jest.mock('./IncidentsView', () => () => <div>Incidents</div>);
jest.mock('./DisruptionsView', () => () => <div>Disruptions</div>);
jest.mock('./DisruptionsView/DisruptionDetailView', () => () => <div>Disruption Detail</div>);

describe('ControlView', () => {
    const baseState = {
        navigation: {
            activeControlDetailView: '',
            activeControlEntityId: '',
        },
        appSettings: {
            useRoutesTripsDatagrid: false,
        },
        control: {
            incidents: {
                incidents: [],
                disruptions: [],
                activeIncident: null,
                incidentsSortingParams: { sortBy: 'incidentTitle', order: 'asc' },
                isLoading: false,
            },
            routes: {
                filters: {
                    groupedByRoute: false,
                    groupedByRouteVariant: false,
                },
            },
        },
    };

    it('renders IncidentsView when activeControlDetailView is INCIDENTS', () => {
        const store = mockStore({
            ...baseState,
            navigation: {
                ...baseState.navigation,
                activeControlDetailView: VIEW_TYPE.CONTROL_DETAIL.INCIDENTS,
            },
        });

        render(
            <Provider store={ store }>
                <ControlView />
            </Provider>,
        );

        expect(screen.getByText(/Incidents/i)).toBeInTheDocument();
    });

    it('renders DisruptionsView and not DisruptionDetailView when activeControlDetailView is DISRUPTIONS and no active entity', () => {
        const store = mockStore({
            ...baseState,
            navigation: {
                activeControlDetailView: VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS,
                activeControlEntityId: '',
            },
        });

        render(
            <Provider store={ store }>
                <ControlView />
            </Provider>,
        );

        expect(screen.getByText(/Disruptions/i)).toBeInTheDocument();
        expect(screen.queryByText(/Disruption Detail/i)).not.toBeInTheDocument();
    });

    it('renders DisruptionDetailView when activeControlEntityId is present', () => {
        const store = mockStore({
            ...baseState,
            navigation: {
                activeControlDetailView: VIEW_TYPE.CONTROL_DETAIL.DISRUPTIONS,
                activeControlEntityId: '123',
            },
        });

        render(
            <Provider store={ store }>
                <ControlView />
            </Provider>,
        );

        expect(screen.getByText(/Disruption Detail/i)).toBeInTheDocument();
    });
});
