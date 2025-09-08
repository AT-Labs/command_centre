import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';

const maneuverToSymbol = (maneuver) => {
    if (maneuver.includes('TURN_LEFT')) return 'L';
    if (maneuver.includes('TURN_RIGHT')) return 'R';
    return null;
};

const maneuverToText = (maneuver, street) => {
    switch (maneuver) {
    case 'DEPART':
        return `Diversion starts on ${street}`;
        /*
    case 'ARRIVE':
        return 'You have arrived at your destination';
        */
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

const InstructionPanel = ({ instructions }) => {
    const textRef = useRef();

    // Generate plain text for all instructions
    const allText = instructions.map((inst) => {
        const street = inst.nextRoadInfo?.streetName?.text || '';
        const symbol = maneuverToSymbol(inst.maneuver);
        const text = maneuverToText(inst.maneuver, street);
        return symbol ? `${symbol} - ${street}` : text;
    }).join('\n');

    const handleCopy = () => {
        navigator.clipboard.writeText(allText);
    };

    return (
        <div style={ { border: '1px solid #ccc', maxWidth: '400px', fontFamily: 'Arial' } }>
            <div style={
                { fontWeight: 'bold', fontSize: '18px', padding: '8px', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }
            }>
                <span>Directions</span>
                <Tooltip title="Copy directions" arrow>
                    <ContentCopyIcon
                        onClick={ handleCopy }
                        style={ { cursor: 'pointer', fontSize: 20, marginLeft: 8 } }
                        aria-label="Copy directions"
                    />
                </Tooltip>
            </div>
            <div ref={ textRef }>
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
        </div>
    );
};

InstructionPanel.propTypes = {
    instructions: PropTypes.array.isRequired,
};

export default InstructionPanel;
