/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AffectedEntities } from './AffectedEntities';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useRef: jest.fn(() => ({ current: { clientHeight: 100 } })),
}));

const defaultProps = {
    affectedEntities: [
        { routeId: 'route5', routeShortName: '5', routeType: 3, type: 'route' },
        { routeId: 'route6', routeShortName: '6', routeType: 3, type: 'route' },
        { routeId: 'route7', routeShortName: '7', routeType: 3, type: 'route' },
        { routeId: 'route8', routeShortName: '8', routeType: 3, type: 'route' },
    ],
    startTime: '2022-08-03T23:32:00.000Z',
    endTime: '2022-08-04T23:32:00.000Z',
};

describe('<AffectedEntities />', () => {
    afterEach(() => {
        cleanup();
    });

    it('should display edit button', () => {
        render(
            <AffectedEntities
                { ...defaultProps }
                isEditDisabled={ false }
            />,
        );
        const editButton = screen.getByText('Edit');
        expect(editButton).toBeInTheDocument();
    });

    it('should not display edit button', () => {
        render(
            <AffectedEntities
                { ...defaultProps }
                isEditDisabled
            />,
        );
        const editButton = screen.queryByText('Edit');
        expect(editButton).not.toBeInTheDocument();
    });

    describe('Add Diversion button', () => {
        test.each([
            {
                useDiversion: true,
                disruptionStatus: 'not-started',
                display: true,
                description: 'Should display Add Diversion when useDiversion is true and status is not-started',
            },
            {
                useDiversion: true,
                disruptionStatus: 'in-progress',
                display: true,
                description: 'Should display Add Diversion when useDiversion is true and status is in-progress',
            },
            {
                useDiversion: true,
                disruptionStatus: 'draft',
                display: true,
                description: 'Should display Add Diversion when useDiversion is true and status is draft',
            },
            {
                useDiversion: false,
                disruptionStatus: 'in-progress',
                display: false,
                description: 'Should not display Add Diversion when useDiversion is false',
            },
            {
                useDiversion: true,
                disruptionStatus: 'resolved',
                display: false,
                description: 'Should not display Add Diversion when useDiversion is true and status is resolved',
            },
            {
                useDiversion: false,
                disruptionStatus: 'in-progress',
                display: false,
                description: 'Should not display Add Diversion when useDiversion is false and status is in-progress',
            },
        ])('$description', ({ useDiversion, disruptionStatus, display }) => {
            render(
                <AffectedEntities
                    { ...defaultProps }
                    useDiversion={ useDiversion }
                    disruptionStatus={ disruptionStatus }
                />,
            );
            const addDiversionButton = screen.queryByText('Add Diversion');
            if (display) {
                expect(addDiversionButton).toBeInTheDocument();
            } else {
                expect(addDiversionButton).not.toBeInTheDocument();
            }
        });

        it.skip('Should not display Add Diversion when useDiversion is true, status is not-started and endTime is null', async () => {
            const startTime = '2022-08-03T23:32:00.000Z';
            const endTime = null;
            render(
                <AffectedEntities
                    affectedEntities={ defaultProps.affectedEntities }
                    useDiversion
                    disruptionStatus="not-started"
                    isEditDisabled={ false }
                    startTime={ startTime }
                    endTime={ endTime }
                />,
            );
            const addDiversionButton = screen.queryByText('Add Diversion');
            expect(addDiversionButton).not.toBeInTheDocument();
        });

        it('Should not display Add Diversion when useDiversion is true, status is not-started and routeType is not bus', async () => {
            const affectedEntities = [
                { routeId: 'route5', routeShortName: '5', routeType: 2, type: 'route' },
                { routeId: 'route6', routeShortName: '6', routeType: 1, type: 'route' },
            ];
            render(
                <AffectedEntities
                    affectedEntities={ affectedEntities }
                    useDiversion
                    disruptionStatus="not-started"
                    isEditDisabled={ false }
                    startTime={ defaultProps.startTime }
                    endTime={ defaultProps.endTime }
                />,
            );
            const addDiversionButton = screen.queryByText('Add Diversion');
            expect(addDiversionButton).not.toBeInTheDocument();
        });
    });

    it('Should display combined entities', () => {
        const affectedEntities = [
            { routeId: 'route1', routeShortName: '1', type: 'route' },
            { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
            { stopId: 'stop2', stopCode: '2', routeId: 'route2', routeShortName: '2', text: '2', type: 'stop' },
            { stopId: 'stop3', stopCode: '3', routeId: 'route3', routeShortName: '3', text: '3', type: 'stop' },
            { stopId: 'stop3', stopCode: '3', routeId: 'route4', routeShortName: '4', text: '3', type: 'stop' },
            { routeId: 'route5', routeShortName: '5', type: 'route', directionId: 0, stopCode: '4' },
            { routeId: 'route6', routeShortName: '6', type: 'route', directionId: 1, stopCode: '5' },
            { routeId: 'route7', routeShortName: '7', type: 'route', directionId: 0, stopCode: '6' },
            { routeId: 'route7', routeShortName: '7', type: 'route', directionId: 0, stopCode: '7' },
            { routeId: 'route8', routeShortName: '8', type: 'route', directionId: 1, stopCode: '8' },
            { routeId: 'route8', routeShortName: '8', type: 'route', directionId: 1, stopCode: '9' },
        ];
        render(
            <AffectedEntities
                { ...defaultProps }
                affectedEntities={ affectedEntities }
                isEditDisabled={ false }
            />,
        );

        expect(screen.queryByText('View more')).not.toBeInTheDocument();
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(8);
    });

    it('Should display combined entities with stop groups', () => {
        const stopGroups = [{ id: 1, title: 'stop group 1' }].reduce((acc, group) => {
            acc[group.id] = group;
            return acc;
        }, {});
        const affectedEntities = [
            { routeId: 'route1', routeShortName: '1', type: 'route' },
            { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
            { stopId: 'stop2', stopCode: '2', groupId: 1, text: '2', type: 'stop' },
            { stopId: 'stop3', stopCode: '3', groupId: 1, text: '3', type: 'stop' },
        ];
        render(
            <AffectedEntities
                stopGroups={ stopGroups }
                affectedEntities={ affectedEntities }
                isEditDisabled={ false }
            />,
        );

        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
        expect(screen.getByText('Stop Group - stop group 1')).toBeInTheDocument();
        expect(screen.getByText('Stop 2, 3')).toBeInTheDocument();
    });
});

describe('View & edit diversions', () => {
    test.each([
        {
            diversions: [
                { diversionId: 1, diversionRouteVariants: [], routeId: 'route1' },
                { diversionId: 2, diversionRouteVariants: [], routeId: 'route1' },
                { diversionId: 3, diversionRouteVariants: [], routeId: 'route1' },
            ],
            useDiversion: true,
            expectedText: 'View & edit diversions (3)',
            display: true,
            description: 'Should display (3) when 3 diversions exist',
        },
        {
            diversions: [{ diversionId: 1, diversionRouteVariants: [], routeId: 'route1' }],
            useDiversion: true,
            expectedText: 'View & edit diversions (1)',
            display: true,
            description: 'Should display (1) when 1 diversion exists',
        },
        {
            diversions: [],
            useDiversion: true,
            expectedText: 'View & edit diversions (0)',
            display: true,
            description: 'Should display (0) when no diversions exist',
        },
        {
            diversions: [
                { diversionId: 1, diversionRouteVariants: [], routeId: 'route1' },
                { diversionId: 2, diversionRouteVariants: [], routeId: 'route1' },
                { diversionId: 3, diversionRouteVariants: [], routeId: 'route1' },
            ],
            useDiversion: false,
            expectedText: 'View & edit diversions (3)',
            display: false,
            description: 'Should not display (3) when useDiversion is false',
        },
    ])('$description', ({ diversions, useDiversion, expectedText, display }) => {
        render(
            <AffectedEntities
                { ...defaultProps }
                diversions={ diversions }
                useDiversion={ useDiversion }
            />,
        );
        const button = screen.queryByText(expectedText);
        if (display) {
            expect(button).toBeInTheDocument();
            expect(button).toHaveTextContent(expectedText);
        } else {
            expect(button).not.toBeInTheDocument();
        }
    });

    it('should call viewDiversionsAction when the button is clicked', async () => {
        const viewDiversionsAction = jest.fn();
        render(
            <AffectedEntities
                { ...defaultProps }
                diversions={ [
                    { diversionId: 1, diversionRouteVariants: [], routeId: 'route1' },
                    { diversionId: 2, diversionRouteVariants: [], routeId: 'route1' },
                ] }
                viewDiversionsAction={ viewDiversionsAction }
                useDiversion
            />,
        );

        const button = screen.getByText('View & edit diversions (2)');
        expect(button).toBeInTheDocument();
        await fireEvent.click(button);
        expect(viewDiversionsAction).toHaveBeenCalled();
    });
});
