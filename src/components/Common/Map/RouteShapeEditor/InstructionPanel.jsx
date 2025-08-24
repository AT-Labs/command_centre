import React from 'react';
import PropTypes from 'prop-types';

const maneuverToSymbol = (maneuver) => {
    if (maneuver.includes('LEFT')) return 'L';
    if (maneuver.includes('RIGHT')) return 'R';
    return null;
};

const maneuverToText = (maneuver, street) => {
    switch (maneuver) {
    case 'DEPART':
        return `Head northeast on ${street}`;
    case 'ARRIVE':
        return 'You have arrived at your destination';
    case 'WAYPOINT_REACHED':
        return `Continue on ${street}`;
    case 'TURN_LEFT':
        return `Turn left onto ${street}`;
    case 'TURN_RIGHT':
        return `Turn right onto ${street}`;
    default:
        return street ? `Continue on ${street}` : 'Continue';
    }
};

const InstructionPanel = ({ instructions }) => (
    <div style={ { border: '1px solid #ccc', maxWidth: '400px', fontFamily: 'Arial' } }>
        <div style={ { fontWeight: 'bold', fontSize: '18px', padding: '8px', borderBottom: '1px solid #ccc' } }>
            Directions
        </div>
        {instructions.map((inst, index) => {
            const street = inst.nextRoadInfo?.streetName?.text || '';
            const symbol = maneuverToSymbol(inst.maneuver);
            const text = maneuverToText(inst.maneuver, street);

            return (
                <div key={ index } style={ { borderBottom: '1px solid #ccc', padding: '10px' } }>
                    {symbol ? (
                        <div style={ { fontWeight: 'bold' } }>
                            {symbol}
                            {' - '}
                            {street}
                        </div>
                    ) : (
                        <div>{text}</div>
                    )}
                </div>
            );
        })}
    </div>
);

InstructionPanel.propTypes = {
    instructions: PropTypes.array.isRequired,
};

export default InstructionPanel;
