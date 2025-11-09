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
            maneuver: 'TURN_LEFT',
            nextRoadInfo: { streetName: { text: 'Second Ave' } },
        },
        {
            maneuver: 'TURN_RIGHT',
            nextRoadInfo: { streetName: { text: 'Third Blvd' } },
        },
        {
            maneuver: 'WAYPOINT_REACHED',
            nextRoadInfo: { streetName: { text: 'Fourth Rd' } },
        },
        {
            maneuver: 'CONTINUE',
            nextRoadInfo: { streetName: { text: 'Fifth Ln' } },
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
        expect(screen.getByText('R - Third Blvd')).toBeInTheDocument();
        expect(screen.getByText('Continue on Fourth Rd')).toBeInTheDocument();
        expect(screen.getByText('Continue on Fifth Ln')).toBeInTheDocument();
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
                'L - Second Ave',
                'R - Third Blvd',
                'Continue on Fourth Rd',
                'Continue on Fifth Ln',
            ].join('\n'),
        );
    });
});
