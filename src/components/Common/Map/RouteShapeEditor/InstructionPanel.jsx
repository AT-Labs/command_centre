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

const maneuverToText = (maneuver, street) => {
    switch (maneuver) {
    case TomTomManeuver.DEPART:
        return `${street} as normal`;
    case TomTomManeuver.TURN_LEFT:
    case TomTomManeuver.ROUNDABOUT_LEFT:
        return `Turn left onto ${street}`;
    case TomTomManeuver.TURN_RIGHT:
    case TomTomManeuver.ROUNDABOUT_RIGHT:
        return `Turn right onto ${street}`;
    case TomTomManeuver.WAYPOINT_REACHED:
    case TomTomManeuver.ROUNDABOUT_STRAIGHT:
    case TomTomManeuver.ARRIVE:
    default:
        return street ? `Continue on ${street}` : 'Continue';
    }
};

const deduplicateInstructions = (instructions) => {
    if (!Array.isArray(instructions)) return [];
    let prevText = null;
    return instructions.filter((inst) => {
        const nextText = maneuverToText(inst.maneuver, inst.nextRoadInfo?.streetName?.text || '');
        const isDuplicate = nextText === prevText;
        prevText = nextText;
        return !isDuplicate;
    });
};

const InstructionPanel = ({ instructions }) => {
    const textRef = useRef();
    const deduplicatedInstructions = deduplicateInstructions(instructions);

    // Generate plain text for all instructions
    const allText = deduplicatedInstructions.map((inst) => {
        const street = inst.nextRoadInfo?.streetName?.text || '';
        const symbol = maneuverToSymbol(inst.maneuver);
        const text = maneuverToText(inst.maneuver, street);
        return symbol ? `${symbol} - ${street}` : text;
    }).join('\n');

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
                    const street = inst.nextRoadInfo?.streetName?.text || '';
                    const symbol = maneuverToSymbol(inst.maneuver);
                    const text = maneuverToText(inst.maneuver, street);

                    // Use a unique property from inst as key, fallback to JSON string if necessary
                    const key = inst.id || `${inst.maneuver}-${street}`;

                    return (
                        <div key={ key } style={ { borderBottom: '1px solid #ccc', padding: '10px' } }>
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
