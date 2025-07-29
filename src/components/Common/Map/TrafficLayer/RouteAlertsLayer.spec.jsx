import React from 'react';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Map } from 'react-leaflet';
import RouteAlertsLayer, { getColor } from './RouteAlertsLayer';
import * as routeMonitoringApi from '../../../../utils/transmitters/route-monitoring-api';
import { CONGESTION_COLORS } from '../../../../constants/traffic';

const mockStore = configureStore([]);
jest.mock('../../../../utils/transmitters/route-monitoring-api');

describe('RouteAlertsLayer', () => {
    let store;
    beforeAll(() => {
        jest.useFakeTimers();
    });

    beforeEach(() => {
        jest.clearAllMocks();
        store = mockStore({
            realtime: {
                layers: {
                    showRouteAlerts: true,
                    showAllRouteAlerts: true,
                    selectedRouteAlerts: [],
                },
            },
        });
    });

    afterAll(() => {
        jest.useRealTimers();
    });
    it('should call get all route alerts when showAllRouteAlerts is enabled', async () => {
        routeMonitoringApi.fetchRouteAlertDetailsByIds.mockReset();
        await act(async () => {
            render(
                <Provider store={ store }>
                    <Map center={ [0, 0] } zoom={ 10 }>
                        <RouteAlertsLayer />
                    </Map>
                </Provider>,
            );
        });
        expect(routeMonitoringApi.fetchRouteAlertDetailsByIds).not.toHaveBeenCalled();
        expect(routeMonitoringApi.fetchAllRouteAlertDetails).toHaveBeenCalled();
    });

    it('should call get route alerts details by Ids when showAllRouteAlerts is disabled', async () => {
        const routeIds = ['routeA', 'routeB'];
        store = mockStore({
            realtime: {
                layers: {
                    showRouteAlerts: true,
                    showAllRouteAlerts: false,
                    selectedRouteAlerts: routeIds,
                },
            },
        });
        await act(async () => {
            render(
                <Provider store={ store }>
                    <Map center={ [0, 0] } zoom={ 10 }>
                        <RouteAlertsLayer />
                    </Map>
                </Provider>,
            );
        });
        expect(routeMonitoringApi.fetchAllRouteAlertDetails).not.toHaveBeenCalled();
        expect(routeMonitoringApi.fetchRouteAlertDetailsByIds).toHaveBeenCalled();
    });

    it('should not call any api when showAllRouteAlerts is disabled and no selected routes', async () => {
        store = mockStore({
            realtime: {
                layers: {
                    showRouteAlerts: true,
                    showAllRouteAlerts: false,
                    selectedRouteAlerts: [],
                },
            },
        });
        await act(async () => {
            render(
                <Provider store={ store }>
                    <Map center={ [0, 0] } zoom={ 10 }>
                        <RouteAlertsLayer />
                    </Map>
                </Provider>,
            );
        });
        expect(routeMonitoringApi.fetchAllRouteAlertDetails).not.toHaveBeenCalled();
        expect(routeMonitoringApi.fetchRouteAlertDetailsByIds).not.toHaveBeenCalled();
    });

    describe('getColor function logic', () => {
        it('should return GREEN for high speed', () => {
            expect(getColor(0.9)).toBe(CONGESTION_COLORS.GREEN);
        });

        it('should return YELLOW for good speed', () => {
            expect(getColor(0.7)).toBe(CONGESTION_COLORS.YELLOW);
        });

        it('should return ORANGE for medium speed', () => {
            expect(getColor(0.5)).toBe(CONGESTION_COLORS.ORANGE);
        });

        it('should return RED for low speed', () => {
            expect(getColor(0.4)).toBe(CONGESTION_COLORS.RED);
        });

        it('should return MAROON for very low speed', () => {
            expect(getColor(0.39)).toBe(CONGESTION_COLORS.MAROON);
        });
    });
});
