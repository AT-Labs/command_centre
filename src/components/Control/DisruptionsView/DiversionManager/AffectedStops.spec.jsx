/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import AffectedStops from './AffectedStops';

describe('<AffectedStops />', () => {
    it('renders affected stops when list is not empty', () => {
        const affectedStops = [
            { stopCode: '105', stopName: 'Main St', routeShortName: 'NX1' },
            { stopCode: '106', stopName: 'Second St', routeShortName: 'NX2' },
        ];
        render(<AffectedStops affectedStops={ affectedStops } />);
        expect(screen.getByText('Stops affected')).toBeInTheDocument();
        expect(screen.getByText('105 - Main St (NX1)')).toBeInTheDocument();
        expect(screen.getByText('106 - Second St (NX2)')).toBeInTheDocument();
        expect(screen.queryByText('No stops affected')).not.toBeInTheDocument();
    });

    it('renders "No stops affected" when list is empty', () => {
        render(<AffectedStops affectedStops={ [] } />);
        expect(screen.getByText('Stops affected')).toBeInTheDocument();
        expect(screen.getByText('No stops affected')).toBeInTheDocument();
    });
});
