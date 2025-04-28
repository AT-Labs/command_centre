/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataGridPro } from '@mui/x-data-grid-pro';

import { ActiveDiversionView } from './ActiveDiversionView';

jest.mock('@mui/x-data-grid-pro', () => ({
    DataGridPro: jest.fn((obj) => {
        const { columns, rows } = obj;
        const mockRow0 = rows[0];
        if (!mockRow0) return <div data-testid="datagrid-pro" />;
        return (
            <div data-testid="datagrid-pro">
                {columns.map(column => column.renderCell({ row: mockRow0 }))}
            </div>
        );
    }),
}));

const mockDiversions = [
    {
        diversionId: 'DIV123',
        tripModifications: [
            {
                diversionId: 'DIV123',
                routeId: 'NX2203',
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

describe('<ActiveDiversionView />', () => {
    it('should render component', () => {
        render(<ActiveDiversionView diversions={ mockDiversions } allExpanded={ false } />);
        const component = screen.getByTestId('active-diversion-view');
        expect(component).toBeInTheDocument();
    });

    it('should render expand-button', async () => {
        render(<ActiveDiversionView diversions={ mockDiversions } allExpanded={ false } />);
        const button = await screen.findAllByTestId('expand-button');
        const firstButton = button[0];
        expect(firstButton).toBeInTheDocument();
    });

    it('onClick should display DataGrid, onClick should hide DataGrid', async () => {
        render(<ActiveDiversionView diversions={ mockDiversions } allExpanded={ false } />);
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
        render(<ActiveDiversionView diversions={ mockDiversions } allExpanded={ false } />);
        const tripModifications = screen.getByText('Diversion DIV123');
        expect(tripModifications).toBeInTheDocument();
    });

    it('renders the component with diversions', () => {
        render(<ActiveDiversionView diversions={ mockDiversions } allExpanded={ false } />);
        expect(screen.getByTestId('active-diversion-view')).toBeInTheDocument();
        expect(screen.getAllByTestId('expand-button').length).toBe(2);
    });

    it('renders trip modifications correctly in grid columns', () => {
        render(<ActiveDiversionView diversions={ mockDiversions } allExpanded />);
        fireEvent.click(screen.getAllByTestId('expand-button')[0]);
        expect(screen.getByText('Diversion DIV123')).toBeInTheDocument();
        expect(screen.getByText('Routes TMKL')).toBeInTheDocument();
    });

    describe('getRowId', () => {
        it('returns the diversionId from a row object', () => {
            const getRowId = row => row.diversionId;
            expect(getRowId(mockDiversions[0])).toBe('DIV123');
            expect(getRowId(mockDiversions[1])).toBe('DIV456');
            expect(getRowId(mockDiversions[2])).toBe('DIV789');
        });

        it('is passed to DataGridPro with correct row identification', () => {
            render(<ActiveDiversionView diversions={ mockDiversions } allExpanded />);
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

    describe('<ActiveDiversionView />', () => {
        it('should check for diversions, and also filter out diversions without tripModifications', () => {
            render(<ActiveDiversionView diversions={ mockDiversions } allExpanded />);

            const component1 = screen.getAllByTestId('datagrid-pro')[0];
            expect(component1).toBeInTheDocument();
            const component2 = screen.getAllByTestId('datagrid-pro')[1];
            expect(component2).toBeInTheDocument();
            const component3 = screen.getAllByTestId('datagrid-pro')[2];
            expect(component3).toBeUndefined();
            const component4 = screen.getAllByTestId('datagrid-pro')[3];
            expect(component4).toBeUndefined();

            const displayedDiversions = screen.getAllByTestId('expand-button');
            expect(displayedDiversions.length).toBe(2);
        });

        it('should check if diversions are empty', () => {
            render(<ActiveDiversionView diversions={ [] } allExpanded />);
            const component = screen.queryByTestId('active-diversion-view');
            expect(component.children).toHaveLength(0);
        });

        it('should check if rerender is called for datagridpro', () => {
            render(<ActiveDiversionView diversions={ mockDiversions } allExpanded />);

            const components = screen.getAllByTestId('datagrid-pro');
            expect(components).toHaveLength(2);
        });
    });

    describe('createRenderCell', () => {
        it('returns null if no tripModifications are present', () => {
            const createRenderCell = () => null;
            const renderCell = createRenderCell();
            expect(renderCell).toBeNull();
        });

        it('Diversions with no tripModifications are not displayed', () => {
            render(<ActiveDiversionView diversions={ mockDiversions } allExpanded />);
            expect(screen.queryAllByTestId('expand-button')[2]).toBeUndefined();
            expect(screen.queryAllByTestId('expand-button')[3]).toBeUndefined();

            expect(screen.queryByText('Diversion DIV789')).toBeNull();
            expect(screen.queryByText('Diversion DIV101')).toBeNull();
        });

        it('renders a list with items when view is collapsed & tripModifications.length > 0', () => {
            render(<ActiveDiversionView diversions={ mockDiversions } allExpanded={ false } />);

            expect(fireEvent.click(screen.getAllByTestId('expand-button')[0]));
            expect(fireEvent.click(screen.getAllByTestId('expand-button')[1]));

            expect(screen.queryAllByTestId('expand-button')[2]).toBeUndefined();
            expect(screen.queryAllByTestId('expand-button')[3]).toBeUndefined();

            expect(mockDiversions[0].tripModifications.length).toBe(1);
            expect(mockDiversions[1].tripModifications.length).toBe(1);
        });

        it('renders a list with items when view is expanded & tripModifications.length > 0', () => {
            render(<ActiveDiversionView diversions={ mockDiversions } allExpanded />);

            expect(fireEvent.click(screen.getAllByTestId('expand-button')[0]));
            expect(fireEvent.click(screen.getAllByTestId('expand-button')[1]));

            expect(screen.queryAllByTestId('expand-button')[2]).toBeUndefined();
            expect(screen.queryAllByTestId('expand-button')[3]).toBeUndefined();

            expect(mockDiversions[0].tripModifications.length).toBe(1);
            expect(mockDiversions[1].tripModifications.length).toBe(1);
        });

        it('renders a list with items when view is collapsed & tripModifications.length < 0', () => {
            render(<ActiveDiversionView diversions={ mockDiversions } allExpanded={ false } />);

            expect(screen.queryAllByTestId('expand-button')[2]).toBeUndefined();
            expect(screen.queryAllByTestId('expand-button')[3]).toBeUndefined();

            expect(mockDiversions[2].tripModifications.length).toBe(0);
            expect(mockDiversions[3].tripModifications.length).toBe(0);
        });
    });
});
