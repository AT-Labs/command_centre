import React from 'react';
import { render, act } from '@testing-library/react';
import { Map } from 'react-leaflet';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { CarsLayer, CARS_ZOOM_LEVEL } from './CarsLayer';
import { getAllFeatures } from '../../../../utils/transmitters/cars-api';

const mockStore = configureStore([]);
jest.mock('../../../../utils/transmitters/cars-api');

describe('CarsLayer', () => {
    let store;
    const mockFeatures = [
        {
            geometry: {
                type: 'Polygon',
                coordinates: [[[-36.8484597, 174.7633315], [-36.8484597, 174.7633315]]],
            },
            properties: {
                WorksiteName: 'Test Worksite',
            },
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        getAllFeatures.mockResolvedValue(mockFeatures);
        store = mockStore({
            realtime: {
                layers: {
                    showRoadworks: true,
                    selectedRoadworksFilters: [],
                },
            },
        });
    });

    it('should call car api when zoom level is less than CARS_ZOOM_LEVEL', async () => {
        getAllFeatures.mockResolvedValue([]); // Mock API call returning empty array

        await act(async () => {
            render(
                <Provider store={ store }>
                    <Map>
                        <CarsLayer mapZoomLevel={ CARS_ZOOM_LEVEL } />
                    </Map>
                </Provider>,
            );
        });

        expect(getAllFeatures).toHaveBeenCalled(); // Assert API call happened
    });

    it('should not call car api when zoom level is less than CARS_ZOOM_LEVEL', async () => {
        await act(async () => {
            render(
                <Provider store={ store }>
                    <Map>
                        <CarsLayer mapZoomLevel={ CARS_ZOOM_LEVEL - 1 } />
                    </Map>
                </Provider>
                ,
            );
        });

        expect(getAllFeatures).not.toHaveBeenCalled();
    });
});
