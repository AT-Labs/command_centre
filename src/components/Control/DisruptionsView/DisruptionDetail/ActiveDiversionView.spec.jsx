/**
 * @jest-environment jsdom
 */
/* eslint-disable react/prop-types */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DataGridPro } from '@mui/x-data-grid-pro';
import { ActiveDiversionView, createRenderCell } from './ActiveDiversionView';

jest.mock('../types', () => ({
    DIRECTIONS: {
        0: 'Inbound/Anticlockwise',
        1: 'Outbound/Clockwise',
    },
}));

jest.mock('@mui/x-data-grid-pro', () => ({
    DataGridPro: jest.fn(({ columns, rows, className }) => (
        <div data-testid="datagrid-pro" className={ className }>
            {rows.map((row, index) => (
                <div key={ row.diversionId || index } data-testid="datagrid-row">
                    {columns.map(column => (
                        <div key={ column.field } data-testid={ `cell-${column.field}` }>
                            {column.renderCell({ row })}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    )),
}));

const mockDiversions = [
    {
        diversionId: 'DIV123',
        diversionRouteVariants: [
            {
                diversionId: 'DIV123-1',
                routeId: 'NX2203',
                routeVariantId: 'NX2-203-1',
                routeVariantName: 'North Express 2',
                directionId: '0',
            },
            {
                diversionId: 'DIV123-2',
                routeId: 'NX2204',
                routeVariantId: 'NX2-204-1',
                routeVariantName: 'North Express 3',
                directionId: '1',
            },
        ],
    },
    {
        diversionId: 'DIV456',
        diversionRouteVariants: [
            {
                diversionId: 'DIV456-1',
                routeId: 'TMKL-203',
                routeVariantId: 'TMKL-203-1',
                routeVariantName: 'Tamaki Link',
                directionId: '0',
            },
        ],
    },
    {
        diversionId: 'DIV789',
        diversionRouteVariants: [],
    },
    {
        diversionId: 'DIV101',
        diversionRouteVariants: [],
    },
];

describe('<ActiveDiversionView />', () => {
    const defaultExpandedRows = {};
    const mockToggleExpand = jest.fn();

    it('renders the component with diversions', () => {
        render(
            <ActiveDiversionView
                diversions={ mockDiversions }
                expandedRows={ defaultExpandedRows }
                toggleExpand={ mockToggleExpand }
            />,
        );
        expect(screen.getByTestId('active-diversion-view')).toBeInTheDocument();
        expect(screen.getAllByTestId('expand-button').length).toBe(2);
        expect(screen.getAllByRole('separator').length).toBe(1);
    });

    it('should render expand-button', async () => {
        render(
            <ActiveDiversionView
                diversions={ mockDiversions }
                expandedRows={ defaultExpandedRows }
                toggleExpand={ mockToggleExpand }
            />,
        );
        const buttons = await screen.findAllByTestId('expand-button');
        expect(buttons[0]).toBeInTheDocument();
    });

    it('onClick should call toggleExpand and display DataGrid when row is expanded', async () => {
        const expandedRows = { DIV123: true };
        render(
            <ActiveDiversionView
                diversions={ mockDiversions }
                expandedRows={ expandedRows }
                toggleExpand={ mockToggleExpand }
            />,
        );
        const buttons = await screen.findAllByTestId('expand-button');
        const firstButton = buttons[0];

        fireEvent.click(firstButton);
        expect(mockToggleExpand).toHaveBeenCalledWith('DIV123');
        const grid = await screen.findByTestId('datagrid-pro');
        expect(grid).toBeInTheDocument();
        expect(grid).toHaveClass('ml-5');
        expect(screen.getAllByTestId('datagrid-row')).toHaveLength(2);
        expect(screen.getByText('Inbound/Anticlockwise')).toBeInTheDocument();
    });

    it('should render diversionRouteVariants if available', () => {
        render(
            <ActiveDiversionView
                diversions={ mockDiversions }
                expandedRows={ defaultExpandedRows }
                toggleExpand={ mockToggleExpand }
            />,
        );
        expect(screen.getByText('Diversion DIV123')).toBeInTheDocument();
    });

    it('renders diversionRouteVariants correctly in grid columns when expanded', () => {
        const expandedRows = { DIV123: true };
        render(
            <ActiveDiversionView
                diversions={ mockDiversions }
                expandedRows={ expandedRows }
                toggleExpand={ mockToggleExpand }
            />,
        );
        expect(screen.getByText('Diversion DIV123')).toBeInTheDocument();
        expect(screen.getByText('Routes NX2203, NX2204')).toBeInTheDocument();
        expect(screen.getByText('NX2-203-1')).toBeInTheDocument();
        expect(screen.getByText('North Express 2')).toBeInTheDocument();
        expect(screen.getByText('Inbound/Anticlockwise')).toBeInTheDocument();
        expect(screen.getByText('NX2-204-1')).toBeInTheDocument();
        expect(screen.getByText('North Express 3')).toBeInTheDocument();
        expect(screen.getAllByTestId('datagrid-row')).toHaveLength(2);
    });

    it('renders no diversions when all have empty diversionRouteVariants', () => {
        const emptyDiversions = [
            { diversionId: 'DIV789', diversionRouteVariants: [] },
            { diversionId: 'DIV101', diversionRouteVariants: [] },
        ];
        render(
            <ActiveDiversionView
                diversions={ emptyDiversions }
                expandedRows={ defaultExpandedRows }
                toggleExpand={ mockToggleExpand }
            />,
        );
        expect(screen.getByTestId('active-diversion-view')).toBeInTheDocument();
        expect(screen.queryAllByTestId('expand-button')).toHaveLength(0);
        expect(screen.queryByTestId('datagrid-pro')).not.toBeInTheDocument();
        expect(screen.queryAllByRole('separator')).toHaveLength(0);
    });

    describe('getRowId', () => {
        it('returns the diversionId from a row object', () => {
            const getRowId = row => row.diversionId;
            expect(getRowId(mockDiversions[0].diversionRouteVariants[0])).toBe('DIV123-1');
            expect(getRowId(mockDiversions[0].diversionRouteVariants[1])).toBe('DIV123-2');
            expect(getRowId(mockDiversions[1].diversionRouteVariants[0])).toBe('DIV456-1');
        });

        it('is passed to DataGridPro with correct row identification', () => {
            const expandedRows = { DIV123: true };
            render(
                <ActiveDiversionView
                    diversions={ mockDiversions }
                    expandedRows={ expandedRows }
                    toggleExpand={ mockToggleExpand }
                />,
            );
            expect(DataGridPro).toHaveBeenCalledWith(
                expect.objectContaining({
                    getRowId: expect.any(Function),
                    rows: mockDiversions[0].diversionRouteVariants,
                }),
                {},
            );
            const { getRowId } = DataGridPro.mock.calls[0][0];
            expect(getRowId(mockDiversions[0].diversionRouteVariants[0])).toMatch(/^DIV123-1/);
        });
    });

    describe('<ActiveDiversionView />', () => {
        it('should check for diversions, and also filter out diversions without diversionRouteVariants', () => {
            const expandedRows = { DIV123: true, DIV456: true };
            render(
                <ActiveDiversionView
                    diversions={ mockDiversions }
                    expandedRows={ expandedRows }
                    toggleExpand={ mockToggleExpand }
                />,
            );
            const grids = screen.getAllByTestId('datagrid-pro');
            expect(grids).toHaveLength(2);
            expect(screen.getAllByTestId('datagrid-row')).toHaveLength(3);
            expect(screen.getAllByTestId('expand-button')).toHaveLength(2);
            expect(screen.getAllByRole('separator').length).toBe(1);
        });

        it('should check if diversions are empty', () => {
            render(
                <ActiveDiversionView
                    diversions={ [] }
                    expandedRows={ defaultExpandedRows }
                    toggleExpand={ mockToggleExpand }
                />,
            );
            const component = screen.getByTestId('active-diversion-view');
            expect(component.children).toHaveLength(0);
            expect(screen.queryAllByRole('separator')).toHaveLength(0);
        });

        it('should check if rerender is called for datagridpro when rows are expanded', () => {
            const expandedRows = { DIV123: true, DIV456: true };
            render(
                <ActiveDiversionView
                    diversions={ mockDiversions }
                    expandedRows={ expandedRows }
                    toggleExpand={ mockToggleExpand }
                />,
            );
            expect(screen.getAllByTestId('datagrid-pro')).toHaveLength(2);
            expect(screen.getAllByTestId('datagrid-row')).toHaveLength(3);
            expect(screen.getAllByTestId('datagrid-pro')[0]).toHaveClass('ml-5');
        });
    });

    describe('createRenderCell', () => {
        it('creates a renderCell function that renders a single value for routeVariantId', () => {
            const renderCell = createRenderCell('routeVariantId');
            const { container } = render(
                renderCell({ row: { diversionId: 'DIV123-1', routeVariantId: 'NX2-203-1' } }),
            );

            const div = container.querySelector('div');
            expect(div).toHaveTextContent('NX2-203-1');
        });

        it('creates a renderCell function that maps directionId using DIRECTIONS', () => {
            const renderCell = createRenderCell('directionId');
            const { container } = render(
                renderCell({ row: { diversionId: 'DIV123-1', directionId: '1' } }),
            );

            const div = container.querySelector('div');
            expect(div).toHaveTextContent('Outbound/Clockwise');
        });

        it('renders a list with items when view is collapsed & diversionRouteVariants.length > 0', () => {
            render(
                <ActiveDiversionView
                    diversions={ mockDiversions }
                    expandedRows={ defaultExpandedRows }
                    toggleExpand={ mockToggleExpand }
                />,
            );
            fireEvent.click(screen.getAllByTestId('expand-button')[0]);
            fireEvent.click(screen.getAllByTestId('expand-button')[1]);
            expect(mockToggleExpand).toHaveBeenCalledWith('DIV123');
            expect(mockToggleExpand).toHaveBeenCalledWith('DIV456');
            expect(screen.queryAllByTestId('expand-button')[2]).toBeUndefined();
            expect(screen.queryAllByTestId('expand-button')[3]).toBeUndefined();
            expect(mockDiversions[0].diversionRouteVariants.length).toBe(2);
            expect(mockDiversions[1].diversionRouteVariants.length).toBe(1);
        });

        it('renders a list with items when view is expanded & diversionRouteVariants.length > 0', () => {
            const expandedRows = { DIV123: true, DIV456: true };
            render(
                <ActiveDiversionView
                    diversions={ mockDiversions }
                    expandedRows={ expandedRows }
                    toggleExpand={ mockToggleExpand }
                />,
            );
            expect(screen.queryAllByTestId('expand-button')[2]).toBeUndefined();
            expect(screen.queryAllByTestId('expand-button')[3]).toBeUndefined();
            expect(mockDiversions[0].diversionRouteVariants.length).toBe(2);
            expect(mockDiversions[1].diversionRouteVariants.length).toBe(1);
        });

        it('does not render diversions with empty diversionRouteVariants when view is collapsed', () => {
            render(
                <ActiveDiversionView
                    diversions={ mockDiversions }
                    expandedRows={ defaultExpandedRows }
                    toggleExpand={ mockToggleExpand }
                />,
            );
            expect(screen.queryAllByTestId('expand-button')[2]).toBeUndefined();
            expect(screen.queryAllByTestId('expand-button')[3]).toBeUndefined();
            expect(mockDiversions[2].diversionRouteVariants.length).toBe(0);
            expect(mockDiversions[3].diversionRouteVariants.length).toBe(0);
        });

        it('does not display diversions with no diversionRouteVariants', () => {
            const expandedRows = { DIV123: true, DIV456: true };
            render(
                <ActiveDiversionView
                    diversions={ mockDiversions }
                    expandedRows={ expandedRows }
                    toggleExpand={ mockToggleExpand }
                />,
            );
            expect(screen.queryAllByTestId('expand-button')[2]).toBeUndefined();
            expect(screen.queryAllByTestId('expand-button')[3]).toBeUndefined();
            expect(screen.queryByText('Diversion DIV789')).not.toBeInTheDocument();
            expect(screen.queryByText('Diversion DIV101')).not.toBeInTheDocument();
        });
    });
});
