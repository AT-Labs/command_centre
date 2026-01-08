/** @jest-environment jsdom */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import InstructionPanel from './InstructionPanel';

describe('<InstructionPanel />', () => {
    const instructions = [
        {
            maneuver: 'DEPART',
            nextRoadInfo: { streetName: { text: 'Main St' } },
        },
        {
            maneuver: 'DEPART',
            nextRoadInfo: { streetName: { text: '' } },
        },
        {
            maneuver: 'TURN_LEFT',
            nextRoadInfo: { streetName: { text: 'Second Ave' } },
        },
        {
            maneuver: 'ROUNDABOUT_LEFT',
            nextRoadInfo: { streetName: { text: 'Second Roundabout Ave' } },
        },
        {
            maneuver: 'TURN_RIGHT',
            nextRoadInfo: { streetName: { text: 'Third Blvd' } },
        },
        {
            maneuver: 'ROUNDABOUT_RIGHT',
            nextRoadInfo: { streetName: { text: 'Third Roundabout Blvd' } },
        },
        {
            maneuver: 'WAYPOINT_REACHED',
            nextRoadInfo: { streetName: { text: 'Fourth Rd' } },
        },
        {
            maneuver: 'ROUNDABOUT_BACK',
            nextRoadInfo: { streetName: { text: 'Fourth Rd' } },
        },
        {
            maneuver: 'EXIT_ROUNDABOUT',
            nextRoadInfo: { streetName: { text: 'Fourth Rd' } },
        },
        {
            maneuver: 'ROUNDABOUT_STRAIGHT',
            nextRoadInfo: { streetName: { text: 'Fifth Roundabout Ln' } },
        },
        {
            maneuver: 'TURN_RIGHT',
            nextRoadInfo: {
                streetName: { text: '' },
                roadNames: [{ identifier: { text: 'Fallback Street' } }],
            },
        },
        {
            maneuver: 'TURN_LEFT',
            nextRoadInfo: {
                streetName: { text: '' },
                roadNames: [],
            },
        },
        {
            maneuver: 'TURN_RIGHT',
            nextRoadInfo: {
                streetName: { text: '' },
                roadNames: [{ identifier: { text: '' } }],
            },
        },
        {
            maneuver: 'ARRIVE',
            nextRoadInfo: { streetName: { text: 'Sixth Ln' } },
        },
    ];

    it('renders the Directions header', () => {
        render(<InstructionPanel instructions={ instructions } />);
        expect(screen.getByText('Directions')).toBeInTheDocument();
    });

    it('renders all instructions with correct symbols and text', () => {
        render(<InstructionPanel instructions={ instructions } />);
        expect(screen.getByText('Main St as normal')).toBeInTheDocument();
        expect(screen.getByText('L - Second Ave')).toBeInTheDocument();
        expect(screen.getByText('L - Second Roundabout Ave')).toBeInTheDocument();
        expect(screen.getByText('R - Third Blvd')).toBeInTheDocument();
        expect(screen.getByText('R - Third Roundabout Blvd')).toBeInTheDocument();
        expect(screen.getByText('Continue on Fourth Rd')).toBeInTheDocument();
        expect(screen.getByText('Continue on Fifth Roundabout Ln')).toBeInTheDocument();
        expect(screen.getByText('Continue on Sixth Ln')).toBeInTheDocument();
    });

    it('renders instructions with street name from roadNames array if streetName.text is not available', () => {
        render(<InstructionPanel instructions={ instructions } />);
        expect(screen.getByText('R - Fallback Street')).toBeInTheDocument();
    });

    it('renders instructions without street names if both streetName.text and roadNames are not available', () => {
        render(<InstructionPanel instructions={ instructions } />);
        expect(screen.getByText('L - Turn left')).toBeInTheDocument();
        expect(screen.getByText('R - Turn right')).toBeInTheDocument();
    });

    it('renders departure instruction without street names if both streetName.text and roadNames are not available', () => {
        render(<InstructionPanel instructions={ instructions } />);
        expect(screen.getByText('Drive as normal')).toBeInTheDocument();
    });

    it('copies instructions to clipboard when copy icon is clicked', async () => {
        // Mock clipboard
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn(),
            },
        });
        render(<InstructionPanel instructions={ instructions } />);
        const copyIcon = screen.getByLabelText('Copy directions');
        fireEvent.click(copyIcon);

        // The copied text should match the rendered instructions
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
            [
                'Main St as normal',
                'Drive as normal',
                'L - Second Ave',
                'L - Second Roundabout Ave',
                'R - Third Blvd',
                'R - Third Roundabout Blvd',
                'Continue on Fourth Rd',
                'Continue on Fifth Roundabout Ln',
                'R - Fallback Street',
                'L - Turn left',
                'R - Turn right',
                'Continue on Sixth Ln',
            ].join('\n'),
        );
    });
});
