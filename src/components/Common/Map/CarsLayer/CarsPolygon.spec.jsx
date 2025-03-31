/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CarsPolygon, HOVER_COLOR, DEFAULT_COLOR } from './CarsPolygon';
import '@testing-library/jest-dom';

jest.mock('react-leaflet', () => ({
    // eslint-disable-next-line react/prop-types
    Polygon: ({ children, ...props }) => (
        <div data-testid="polygon" { ...props }>
            {children}
        </div>
    ),
    // eslint-disable-next-line react/prop-types
    Tooltip: ({ children, ...props }) => (
        <div data-testid="tooltip" { ...props }>
            {children}
        </div>
    ),
}));

jest.mock('./CarsTooltipContent', () => ({
    // eslint-disable-next-line react/prop-types
    CarsTooltipContent: ({ properties }) => (
        <div data-testid="tooltip-content">
            {JSON.stringify(properties)}
        </div>
    ),
}));

describe('CarsPolygon', () => {
    const mockProps = {
        id: '1',
        geometry: {
            coordinates: [[-36.8485, 174.7633], [-36.8400, 174.7800], [-36.8600, 174.7500], [-36.8485, 174.7633]],
        },
        properties: {
            WorksiteName: 'Test Worksite',
            WorksiteCode: 'AT-W187480',
        },
        showTooltip: true,
    };

    it('should render without crashing', () => {
        render(<CarsPolygon { ...mockProps } />);
        expect(screen.getByTestId('polygon')).toBeInTheDocument();
    });

    it('should render the tooltip with correct content', () => {
        render(<CarsPolygon { ...mockProps } />);
        expect(screen.getByTestId('tooltip')).toBeInTheDocument();
        expect(screen.getByTestId('tooltip-content')).toHaveTextContent(JSON.stringify(mockProps.properties));
    });

    it('should change color on hover', () => {
        render(<CarsPolygon { ...mockProps } />);
        const polygon = screen.getByTestId('polygon');

        // Initial color
        expect(polygon).toHaveAttribute('color', DEFAULT_COLOR);

        // Simulate mouseover
        fireEvent.mouseOver(polygon);
        expect(polygon).toHaveAttribute('color', HOVER_COLOR);
        expect(polygon).toHaveAttribute('fillColor', DEFAULT_COLOR);

        // Simulate mouseout
        fireEvent.mouseOut(polygon);
        expect(polygon).toHaveAttribute('color', DEFAULT_COLOR);
        expect(polygon).toHaveAttribute('fillColor', DEFAULT_COLOR);
    });
});
