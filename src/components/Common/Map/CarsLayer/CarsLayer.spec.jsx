import React from 'react';
import { render, act } from '@testing-library/react';
import { Map } from 'react-leaflet';
import { CarsLayer, CARS_ZOOM_LEVEL } from './CarsLayer';
import { getAllFeatures } from '../../../../utils/transmitters/cars-api';

jest.mock('../../../../utils/transmitters/cars-api');

describe('CarsLayer', () => {
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
        getAllFeatures.mockResolvedValue(mockFeatures);
        jest.clearAllMocks();
    });

    it('should call car api when zoom level is less than CARS_ZOOM_LEVEL', async () => {
        getAllFeatures.mockResolvedValue([]); // Mock API call returning empty array

        await act(async () => {
            render(
                <Map>
                    <CarsLayer mapZoomLevel={ CARS_ZOOM_LEVEL } />
                </Map>,
            );
        });

        expect(getAllFeatures).toHaveBeenCalled(); // Assert API call happened
    });

    it('should not call car api when zoom level is less than CARS_ZOOM_LEVEL', async () => {
        await act(async () => {
            render(
                <Map>
                    <CarsLayer mapZoomLevel={ CARS_ZOOM_LEVEL - 1 } />
                </Map>,
            );
        });

        expect(getAllFeatures).not.toHaveBeenCalled();
    });
});
