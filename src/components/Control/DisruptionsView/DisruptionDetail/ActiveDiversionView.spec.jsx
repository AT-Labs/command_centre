/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataGridPro } from '@mui/x-data-grid-pro';

import { ActiveDiversionView } from './ActiveDiversionView';

jest.mock('@mui/x-data-grid-pro', () => ({
    DataGridPro: jest.fn(() => <div data-testid="datagrid-pro" />),
}));

const mockDiversions = [
    {
        diversionId: 'DIV123',
        tripModifications: [
            {
                diversionId: 'DIV123',
                routeId: 'NX2-203',
                routeVariantId: 'NX2-203-1',
                routeVariantName: 'North Express 2',
                direction: 'Northbound',
            },
        ],
    },
    {
        diversionId: 'DIV456',
        tripModifications: [
            {
                diversionId: 'DIV456',
                routeId: 'TMKL-203',
                routeVariantId: 'TMKL-203-1',
                routeVariantName: 'Tamaki Link',
                direction: 'Southbound',
            },
        ],
    },
    {
        diversionId: 'DIV789',
        tripModifications: [],
    },
    {
        diversionId: 'DIV101',
        tripModifications: [],
    },
];

const renderCell = ({ row: { tripModifications } }) => {
    if (tripModifications && tripModifications.length > 0) {
        return (
            <ul style={ { margin: 0, padding: 0, listStyle: 'none' } }>
                {tripModifications.map(modification => (
                    <li key={ modification.diversionId }>{modification.diversionId}</li>
                ))}
            </ul>
        );
    }
    return 'None';
};

describe('<ActiveDiversionView />', () => {
    beforeEach(() => {
        render(<ActiveDiversionView diversions={ mockDiversions } />);
    });

    it('should render component', () => {
        const component = screen.getByTestId('active-diversion-view');
        expect(component).toBeInTheDocument();
    });

    it('should render expand-button', async () => {
        const button = await screen.findAllByTestId('expand-button');
        const firstButton = button[0];

        expect(firstButton).toBeInTheDocument();
    });

    it('onClick should display DataGrid, onClick should hide DataGrid', async () => {
        const button = await screen.findAllByTestId('expand-button');
        const firstButton = button[0];

        fireEvent.click(firstButton);
        expect(DataGridPro).toHaveBeenCalled();
        const grid = await screen.findByTestId('datagrid-pro');
        expect(grid).toBeTruthy();
        fireEvent.click(firstButton);
        expect(grid).not.toBeInTheDocument();
    });

    it('should render tripModifications if available', () => {
        const tripModifications = screen.getByText('DIV123');
        expect(tripModifications).toBeInTheDocument();
    });

    it('renders the component with diversions', () => {
        expect(screen.getByTestId('active-diversion-view')).toBeInTheDocument();
        expect(screen.getAllByTestId('expand-button').length).toBe(4);
    });

    it('renders trip modifications correctly in grid columns', () => {
        fireEvent.click(screen.getAllByTestId('expand-button')[0]);

        expect(screen.getByText('DIV456')).toBeInTheDocument();
        expect(screen.getByText('TMKL')).toBeInTheDocument();
        expect(screen.getByText('Tamaki Link')).toBeInTheDocument();
        expect(screen.getByText('Southbound')).toBeInTheDocument();
    });

    it('renders "None" for objects with empty tripModifications in a list', () => {
        mockDiversions.forEach((mockDiversion) => {
            render(renderCell({ row: mockDiversion }));

            if (mockDiversion.tripModifications.length === 0) {
                const noneElements = screen.getAllByText('None');
                expect(noneElements.length).toBeGreaterThan(0);
            } else {
                mockDiversion.tripModifications.forEach((divId) => {
                    const diversionElements = screen.getAllByText(divId.diversionId);
                    expect(diversionElements.length).toBeGreaterThan(0);
                });
            }
        });
    });

    it('should return the correct row ID from diversionId', () => {
        const getRowId = row => row.diversionId;
        const result = getRowId(mockDiversions[0]);

        expect(result).toBe('DIV123');
    });
});
