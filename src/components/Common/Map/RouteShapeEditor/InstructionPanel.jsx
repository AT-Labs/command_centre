import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Tooltip from '@mui/material/Tooltip';
import './InstructionPanel.scss';
import { TomTomManeuver } from './constants';

const maneuverToSymbol = (maneuver) => {
    if (maneuver === TomTomManeuver.TURN_LEFT || maneuver === TomTomManeuver.ROUNDABOUT_LEFT) return 'L';
    if (maneuver === TomTomManeuver.TURN_RIGHT || maneuver === TomTomManeuver.ROUNDABOUT_RIGHT) return 'R';
    return null;
};

// Extract street name from nextRoadInfo
// Prioritize streetName.text, then roadNames array
const findStreetName = (nextRoadInfo) => {
    if (nextRoadInfo?.streetName?.text) {
        return nextRoadInfo.streetName.text;
    }
    if (nextRoadInfo?.roadNames?.length > 0) {
        return nextRoadInfo?.roadNames?.find(r => r.identifier?.text)?.identifier.text ?? '';
    }
    return '';
};

const maneuverToText = (maneuver, street) => {
    switch (maneuver) {
    case TomTomManeuver.DEPART:
        return street ? `${street} as normal` : 'Drive as normal';
    case TomTomManeuver.TURN_LEFT:
    case TomTomManeuver.ROUNDABOUT_LEFT:
        return street ? `Turn left onto ${street}` : 'Turn left';
    case TomTomManeuver.TURN_RIGHT:
    case TomTomManeuver.ROUNDABOUT_RIGHT:
        return street ? `Turn right onto ${street}` : 'Turn right';
    case TomTomManeuver.WAYPOINT_REACHED:
    case TomTomManeuver.ROUNDABOUT_STRAIGHT:
    case TomTomManeuver.ARRIVE:
    default:
        return street ? `Continue on ${street}` : 'Continue';
    }
};

// Combine symbol and street name for display
// Default to turn left or right if street name is not available
const symbolToText = (symbol, street) => {
    if (street) {
        return `${symbol} - ${street}`;
    }
    switch (symbol) {
    case 'L':
        return 'L - Turn left';
    case 'R':
        return 'R - Turn right';
    default:
        return symbol;
    }
};

// For copying to clipboard
const generateInstructionText = (instruction) => {
    const street = findStreetName(instruction.nextRoadInfo);
    const symbol = maneuverToSymbol(instruction.maneuver);
    return symbol ? symbolToText(symbol, street) : maneuverToText(instruction.maneuver, street);
};

const deduplicateInstructions = (instructions) => {
    if (!Array.isArray(instructions)) return [];
    let prevText = null;
    return instructions.filter((inst) => {
        const nextText = maneuverToText(inst.maneuver, findStreetName(inst.nextRoadInfo));
        const isDuplicate = nextText === prevText;
        prevText = nextText;
        return !isDuplicate;
    });
};

const InstructionPanel = ({ instructions }) => {
    const textRef = useRef();
    const deduplicatedInstructions = deduplicateInstructions(instructions);

    // Generate plain text for all instructions
    const allText = deduplicatedInstructions.map(inst => generateInstructionText(inst)).join('\n');

    const handleCopy = () => {
        navigator.clipboard.writeText(allText);
    };

    return (
        <div className="instructions-panel" style={ { } }>
            <div className="instructions-header">
                <span>Directions</span>
                <Tooltip title="Copy directions" arrow>
                    <ContentCopyIcon
                        onClick={ handleCopy }
                        style={ { cursor: 'pointer', fontSize: 20, marginLeft: 8 } }
                        aria-label="Copy directions"
                    />
                </Tooltip>
            </div>
            <div ref={ textRef } className="instructions-content">
                {deduplicatedInstructions.map((inst) => {
                    const street = findStreetName(inst.nextRoadInfo);
                    const symbol = maneuverToSymbol(inst.maneuver);
                    const text = maneuverToText(inst.maneuver, street);

                    // Use a unique property from inst as key, fallback to JSON string if necessary
                    const key = inst.id || `${inst.maneuver}-${street}`;

                    return (
                        <div key={ key } style={ { borderBottom: '1px solid #ccc', padding: '10px' } }>
                            {symbol ? (
                                <div style={ { fontWeight: 'bold' } }>
                                    {symbolToText(symbol, street)}
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
