/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { Map } from 'react-leaflet';
import SelectedStopsDisruptionsMarker from './SelectedStopsDisruptionsMarker';

const mockStore = configureStore([]);
const defaultStops = [
    {
        stop_id: '1',
        stop_code: '1001',
        stop_name: 'Main St',
        stop_lat: 40.1,
        stop_lon: -75.1,
        key: 'stop-1',
    },
    {
        stop_id: '2',
        stop_code: '1002',
        stop_name: 'Second St',
        stop_lat: 40.2,
        stop_lon: -75.2,
        key: 'stop-2',
    },
];

describe('SelectedStopsDisruptionsMarker', () => {
    let store;

    beforeEach(() => {
        store = mockStore({});
    });

    function renderComponent(props = {}) {
        return render(
            <Provider store={ store }>
                <Map center={ [40.1, -75.1] } zoom={ 13 } style={ { height: 400, width: 600 } }>
                    <SelectedStopsDisruptionsMarker
                        stops={ defaultStops }
                        size={ 30 }
                        { ...props }
                    />
                </Map>
            </Provider>,
        );
    }

    it('calls goToDisruptionEditPage when provided and popup is expanded', async () => {
        const goToDisruptionEditPage = jest.fn();
        await act(async () => {
            renderComponent({ popup: true, goToDisruptionEditPage });
        });
        expect(goToDisruptionEditPage).not.toHaveBeenCalled();
    });

    it('does not call goToDisruptionEditPage if popup is not expanded', async () => {
        const goToDisruptionEditPage = jest.fn();
        await act(async () => {
            renderComponent({ popup: true, goToDisruptionEditPage });
        });
        expect(goToDisruptionEditPage).not.toHaveBeenCalled();
    });

    it('renders a marker for each unique stop', async () => {
        await act(async () => {
            renderComponent({ popup: true });
        });
        const markers = document.querySelectorAll('.selected-stop-marker');
        expect(markers.length).toBe(2);
    });

    it('renders no markers if stops array is empty', async () => {
        await act(async () => {
            renderComponent({ stops: [] });
        });
        const markers = document.querySelectorAll('.selected-stop-marker');
        expect(markers.length).toBe(0);
    });
});
