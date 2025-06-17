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
            affectedEntities={ [
                { routeId: 'route1', routeShortName: '1', type: 'route' },
                { stopId: 'stop1', stopCode: '1', text: '1', type: 'stop' },
            ] }
            isEditDisabled
        />);
        const editButton = screen.queryByText('Edit');
        expect(editButton).not.toBeInTheDocument();
    });

    it('should display Add Diversion button when use diversion is true and status is not-started', () => {
        render(<AffectedEntities
            { ...defaultProps }
            useDiversion
            disruptionStatus="not-started"
        />);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeInTheDocument();
    });

    it('should display Add Diversion button when use diversion is true and status is in-progress', () => {
        render(<AffectedEntities
            { ...defaultProps }
            useDiversion
            disruptionStatus="in-progress"
        />);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeInTheDocument();
    });

    it('should display Add Diversion button when use diversion is true and status is draft', () => {
        render(<AffectedEntities
            { ...defaultProps }
            useDiversion
            disruptionStatus="draft"
        />);

        const addDiversionButton = screen.getByText('Add Diversion');
        expect(addDiversionButton).toBeInTheDocument();
    });

    it('should not display Add Diversion button when use diversion is false', () => {
        render(<AffectedEntities
            { ...defaultProps }
            useDiversion={ false }
        />);

        const addDiversionButton = screen.queryByText('Add Diversion');
        expect(addDiversionButton).not.toBeInTheDocument();
    });

    it('should not display Add Diversion button when use diversion is true and disruption status is resolved', () => {
        render(<AffectedEntities
            { ...defaultProps }
            useDiversion
            disruptionStatus="resolved"
        />);

        const addDiversionButton = screen.queryByText('Add Diversion');
        expect(addDiversionButton).not.toBeInTheDocument();
    });

    it('should not display Add Diversion button when use diversion is false and disruption status is in-progress', () => {
        render(<AffectedEntities
            { ...defaultProps }
            useDiversion={ false }
            disruptionStatus="in-progress"
        />);

        const addDiversionButton = screen.queryByText('Add Diversion');
        expect(addDiversionButton).not.toBeInTheDocument();
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
    it('should display an amount of 3 diversions when 3 diversions exist', () => {
        render(
            <AffectedEntities
                { ...defaultProps }
                diversions={ [
                    { diversionId: 1, diversionRouteVariants: [], routeId: 'route1' },
                    { diversionId: 2, diversionRouteVariants: [], routeId: 'route1' },
                    { diversionId: 3, diversionRouteVariants: [], routeId: 'route1' },
                ] }
                useDiversion
            />,
        );

        const button = screen.getByText('View & edit diversions (3)');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('View & edit diversions (3)');
    });

    it('should display an amount of 1 diversion when diversion list is 1', () => {
        render(
            <AffectedEntities
                { ...defaultProps }
                diversions={ [{ diversionId: 1, diversionRouteVariants: [], routeId: 'route1' }] }
                useDiversion
            />,
        );

        const button = screen.getByText('View & edit diversions (1)');
        expect(button).toBeInTheDocument();
        expect(button).toHaveTextContent('View & edit diversions (1)');
    });

    it('should display an amount of 0 diversions when no diversions exist', () => {
        render(<AffectedEntities { ...defaultProps } useDiversion diversions={ [] } />);

        const button = screen.getByText('View & edit diversions (0)');
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

        const button = screen.queryByText('View & edit diversions (3)');
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
