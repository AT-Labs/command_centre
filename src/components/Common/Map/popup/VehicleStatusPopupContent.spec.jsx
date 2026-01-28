/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
// It is required for the tests to work properly
// eslint-disable-next-line no-unused-vars
import moment from 'moment-timezone';
import VehicleStatusPopupContent from './VehicleStatusPopupContent';

const createMockEventDetail = (latitude, longitude) => ({
    type: 'vehiclePosition',
    position: {
        latitude,
        longitude,
        speed: 50.5,
    },
    timestamp: 1760526035,
    tripId: 'TRIP123',
    trip: {
        routeId: 'R1-001',
        startDate: '2026-01-22',
    },
});

describe('VehicleStatusPopupContent', () => {
    describe('formatCoordinate', () => {
        it('should format a valid coordinate with more than 5 decimal places', () => {
            const eventDetail = createMockEventDetail(-36.8484612345678, 174.7633369876543);
            const { container } = render(<VehicleStatusPopupContent eventDetail={ eventDetail } />);

            const locationText = container.textContent;
            expect(locationText).toContain('-36.84846');
            expect(locationText).toContain('174.76333');
        });

        it('should format a valid coordinate with exactly 5 decimal places', () => {
            const eventDetail = createMockEventDetail(-36.84846, 174.76333);
            const { container } = render(<VehicleStatusPopupContent eventDetail={ eventDetail } />);

            const locationText = container.textContent;
            expect(locationText).toContain('-36.84846');
            expect(locationText).toContain('174.76333');
        });

        it('should handle coordinate with less than 5 decimal places', () => {
            const eventDetail = createMockEventDetail(-36.84, 174.76);
            const { container } = render(<VehicleStatusPopupContent eventDetail={ eventDetail } />);

            const locationText = container.textContent;
            expect(locationText).toContain('-36.84');
            expect(locationText).toContain('174.76');
        });

        it('should handle integer coordinate without decimal point', () => {
            const eventDetail = createMockEventDetail(36, 174);
            const { container } = render(<VehicleStatusPopupContent eventDetail={ eventDetail } />);

            const locationText = container.textContent;
            expect(locationText).toContain('36');
            expect(locationText).toContain('174');
        });

        // The following tests cover edge cases for invalid or special coordinate values
        // Fixing bug https://aucklandtransport.visualstudio.com/Digital%20and%20RealTime/_workitems/edit/315760
        it('should return N/A for null coordinates', () => {
            const eventDetail = createMockEventDetail(null, null);
            const { container } = render(<VehicleStatusPopupContent eventDetail={ eventDetail } />);

            const locationText = container.textContent;
            const naMatches = locationText.match(/N\/A/g) || [];
            expect(naMatches.length).toBeGreaterThanOrEqual(2);
        });

        it('should return N/A for undefined coordinates', () => {
            const eventDetail = createMockEventDetail(undefined, undefined);
            const { container } = render(<VehicleStatusPopupContent eventDetail={ eventDetail } />);

            const locationText = container.textContent;
            const naMatches = locationText.match(/N\/A/g) || [];
            expect(naMatches.length).toBeGreaterThanOrEqual(2);
        });

        it('should return N/A for empty string coordinates', () => {
            const eventDetail = createMockEventDetail('', '');
            const { container } = render(<VehicleStatusPopupContent eventDetail={ eventDetail } />);

            const locationText = container.textContent;
            const naMatches = locationText.match(/N\/A/g) || [];
            expect(naMatches.length).toBeGreaterThanOrEqual(2);
        });

        it('should return N/A for zero coordinates', () => {
            const eventDetail = createMockEventDetail(0, 0);
            const { container } = render(<VehicleStatusPopupContent eventDetail={ eventDetail } />);

            const locationText = container.textContent;
            const naMatches = locationText.match(/N\/A/g) || [];
            expect(naMatches.length).toBeGreaterThanOrEqual(2);
        });
    });
});
