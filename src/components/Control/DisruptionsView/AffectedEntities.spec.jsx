/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AffectedEntities } from './AffectedEntities';

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useRef: jest.fn(),
}));

jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useRef: jest.fn(() => ({ current: { clientHeight: 100 } })),
}));

describe('<AffectedEntities />', () => {
    afterEach(() => {
        cleanup();
    });

    const defaultProps = {
        affectedEntities: [
            { routeId: 'route1', routeShortName: '1', type: 'route' },
            { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
        ],
        startTime: '2022-08-03T23:32:00.000Z',
        endTime: '2022-09-03T23:42:00.000Z',
        useDiversion: true,
        viewDiversionsAction: jest.fn(),
        isEditDisabled: true,
    };

    it('should display edit button', () => {
        render(<AffectedEntities
            { ...defaultProps }
            affectedEntities={ [
                { routeId: 'route1', routeShortName: '1', type: 'route' },
                { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
            ] }
            isEditDisabled={ false }
        />);
        const editButton = screen.getByText('Edit');
        expect(editButton).toBeInTheDocument();
    });

    it('should not display edit button', () => {
        render(<AffectedEntities
            { ...defaultProps }
            isEditDisabled={ false }
            affectedEntities={ [
                { routeId: 'route1', routeShortName: '1', type: 'route' },
                { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
            ] }
        />);
        const editButton = screen.getByText('Edit');
        expect(editButton).toBeInTheDocument();
    });

    it('should display combined entities', () => {
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
        render(<AffectedEntities
            { ...defaultProps }
            affectedEntities={ affectedEntities }
            isEditDisabled={ false }
        />);

        expect(screen.queryByText('View more')).not.toBeInTheDocument();
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(8);
    });

    it('should display combined entities with stop groups', () => {
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
        render(<AffectedEntities
            stopGroups={ stopGroups }
            affectedEntities={ affectedEntities }
            isEditDisabled={ false }
        />);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3);
        expect(screen.getByText('Stop Group - stop group 1')).toBeInTheDocument();
        expect(screen.getByText('Stop 2, 3')).toBeInTheDocument();
    });
});

describe('View & edit diversions', () => {
    const defaultProps = {
        affectedEntities: [
            { routeId: 'route1', routeShortName: '1', type: 'route' },
            { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
        ],
        startTime: '2022-08-03T23:32:00.000Z',
        endTime: '2022-09-03T23:42:00.000Z',
        useDiversion: true,
        viewDiversionsAction: jest.fn(),
    };

    it('should display an amount of 3 diversions when 3 diversions exist', () => {
        render(
            <AffectedEntities
                { ...defaultProps }
                diversions={ [
                    { diversionId: 1, diversionRouteVariants: [], routeId: 'route1' },
                    { diversionId: 2, diversionRouteVariants: [], routeId: 'route1' },
                    { diversionId: 3, diversionRouteVariants: [], routeId: 'route1' },
                ] }
            />,
        );

        const button = screen.getByTestId('view-and-edit-diversions-btn');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('View & edit diversions (3)');
    });

    it('should display an amount of 1 diversion when diversion list is 1', () => {
        render(
            <AffectedEntities
                { ...defaultProps }
                diversions={ [{ diversionId: 1, diversionRouteVariants: [], routeId: 'route1' }] }
            />,
        );

        const button = screen.getByTestId('view-and-edit-diversions-btn');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('View & edit diversions (1)');
    });

    it('should display an amount of 0 diversions when no diversions exist', () => {
        render(<AffectedEntities { ...defaultProps } diversions={ [] } />);

        const button = screen.getByTestId('view-and-edit-diversions-btn');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('View & edit diversions (0)');
    });

    it('should not render the diversions button when useDiversion is false', () => {
        render(
            <AffectedEntities
                { ...defaultProps }
                useDiversion={ false }
                diversions={ [
                    { diversionId: 1, diversionRouteVariants: [], routeId: 'route1' },
                    { diversionId: 2, diversionRouteVariants: [], routeId: 'route1' },
                    { diversionId: 3, diversionRouteVariants: [], routeId: 'route1' },
                ] }
            />,
        );

        const button = screen.queryByTestId('view-and-edit-diversions-btn');
        expect(button).not.toBeInTheDocument();
    });

    it('should call viewDiversionsAction when the button is clicked', async () => {
        const viewDiversionsAction = jest.fn();
        render(
            <AffectedEntities
                { ...defaultProps }
                diversions={ [
                    { diversionId: 1, diversionRouteVariants: [], routeId: 'route1' },
                    { diversionId: 2, diversionRouteVariants: [], routeId: 'route1' },
                    { diversionId: 3, diversionRouteVariants: [], routeId: 'route1' },
                ] }
                viewDiversionsAction={ viewDiversionsAction }
            />,
        );

        const button = screen.getByTestId('view-and-edit-diversions-btn');
        expect(button).toBeInTheDocument();
        await fireEvent.click(button);
        expect(viewDiversionsAction).toHaveBeenCalled();
    });
});
