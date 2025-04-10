/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

const createRenderCell = (property, extraLiStyles = {}) => function renderCell({ row }) {
    const { tripModifications } = row;
    if (tripModifications.length > 0) {
        return (
            <ul style={ { margin: 0, padding: 0, listStyle: 'none' } }>
                {tripModifications.map(modification => (
                    <li key={ modification.diversionId } style={ extraLiStyles }>
                        {modification[property]}
                    </li>
                ))}
            </ul>
        );
    }
    return <span>None</span>;
};

describe('<ActiveDiversionView />', () => {
    it('should render component', () => {
        render(<ActiveDiversionView diversions={ mockDiversions } />);
        const component = screen.getByTestId('active-diversion-view');
        expect(component).toBeInTheDocument();
    });

    it('should render expand-button', async () => {
        render(<ActiveDiversionView diversions={ mockDiversions } />);
        const button = await screen.findAllByTestId('expand-button');
        const firstButton = button[0];
        expect(firstButton).toBeInTheDocument();
    });

    it('onClick should display DataGrid, onClick should hide DataGrid', async () => {
        render(<ActiveDiversionView diversions={ mockDiversions } />);
        const button = await screen.findAllByTestId('expand-button');
        const firstButton = button[0];

        fireEvent.click(firstButton);
        expect(DataGridPro).toHaveBeenCalled();
        const grid = await screen.findByTestId('datagrid-pro');
        expect(grid).toBeTruthy();
        fireEvent.click(firstButton);
        expect(screen.queryByTestId('datagrid-pro')).not.toBeInTheDocument();
    });

    it('should render tripModifications if available', () => {
        render(<ActiveDiversionView diversions={ mockDiversions } />);
        const tripModifications = screen.getByText('DIV123');
        expect(tripModifications).toBeInTheDocument();
    });

    it('renders the component with diversions', () => {
        render(<ActiveDiversionView diversions={ mockDiversions } />);
        expect(screen.getByTestId('active-diversion-view')).toBeInTheDocument();
        expect(screen.getAllByTestId('expand-button').length).toBe(4);
    });

    it('renders trip modifications correctly in grid columns', () => {
        render(<ActiveDiversionView diversions={ mockDiversions } />);
        fireEvent.click(screen.getAllByTestId('expand-button')[0]);
        expect(screen.getByText('DIV456')).toBeInTheDocument();
        expect(screen.getByText('TMKL')).toBeInTheDocument();
        expect(screen.getByText('Tamaki Link')).toBeInTheDocument();
        expect(screen.getByText('Southbound')).toBeInTheDocument();
    });

    describe('getRowId', () => {
        it('returns the diversionId from a row object', () => {
            const getRowId = row => row.diversionId;
            expect(getRowId(mockDiversions[0])).toBe('DIV123');
            expect(getRowId(mockDiversions[1])).toBe('DIV456');
            expect(getRowId(mockDiversions[2])).toBe('DIV789');
        });

        it('is passed to DataGridPro with correct row identification', () => {
            render(<ActiveDiversionView diversions={ mockDiversions } />);
            fireEvent.click(screen.getAllByTestId('expand-button')[0]);
            expect(DataGridPro).toHaveBeenCalledWith(
                expect.objectContaining({
                    getRowId: expect.any(Function),
                    rows: [mockDiversions[0]],
                }),
                {},
            );
            const { getRowId } = DataGridPro.mock.calls[0][0];
            expect(getRowId(mockDiversions[0])).toBe('DIV123');
        });
    });

    describe('createRenderCell', () => {
        let renderCell;

        beforeEach(() => {
            renderCell = createRenderCell('diversionId');
        });

        it('destructures row and executes true branch when tripModifications.length > 0', () => {
            const { container } = render(renderCell({ row: mockDiversions[0] }));
            const ul = container.querySelector('ul');
            expect(ul).toBeInTheDocument();
            const liElements = within(ul).getAllByRole('listitem');
            expect(liElements).toHaveLength(1);
            expect(within(ul).getByText('DIV123')).toBeInTheDocument();
            expect(screen.queryByText('None')).not.toBeInTheDocument();
        });

        it('destructures row and executes false branch when tripModifications.length === 0', () => {
            const { container } = render(renderCell({ row: mockDiversions[2] }));
            expect(screen.getByText('None')).toBeInTheDocument();
            expect(container.querySelector('ul')).not.toBeInTheDocument(); // No <ul>
            expect(container.querySelector('span')).toBeInTheDocument();
        });
    });
});
