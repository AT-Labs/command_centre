import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaExclamation } from 'react-icons/fa';
import { find } from 'lodash-es';
import { Button, IconButton } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIos';
import { SEVERITIES, WEEKDAYS } from '../../../../types/disruptions-types';
import './DisruptionDetails.scss';
import {
    formatCreatedUpdatedTime,
    getDurationWithoutSeconds,
    transformIncidentNo,
} from '../../../../utils/control/disruptions';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../../../types/disruption-cause-and-effect';

const DisruptionDetails = (props) => {
    const { disruptions, stop, causes, impacts, goToDisruptionSummary } = props;
    const [index, setIndex] = useState(0);

    const handleNext = () => {
        setIndex(prevIndex => Math.min(prevIndex + 1, disruptions.length - 1));
    };

    const handleBack = () => {
        setIndex(prevIndex => Math.max(prevIndex - 1, 0));
    };

    const getUniqueRouteNames = (disruption) => {
        if (!disruption?.affectedEntities?.length) return '-';
        const routes = [...new Set(
            disruption.affectedEntities
                .map(entity => entity?.routeShortName)
                .filter(routeShortName => routeShortName && routeShortName.trim() !== ''),
        )].join(', ');

        return routes.length > 0 ? routes : '-';
    };

    return (
        <div className="disruption-incident-container">
            <div className="header">
                <div className="icon-container">
                    <FaExclamation color="#D52923" className="icon" />
                </div>
                <h2 className="title">{disruptions[index].header}</h2>
            </div>
            <div className="details">
                <div className="row">
                    <p>
                        <Button
                            onClick={ () => goToDisruptionSummary(
                                { disruptionId: disruptions[index].disruptionId },
                                { setActiveDisruption: true },
                            ) }
                            style={ { color: 'black', textDecoration: 'underline', fontWeight: 'bold', padding: '0' } }
                            variant="text"
                        >
                            {transformIncidentNo(disruptions[index].disruptionId)}
                        </Button>
                        {`: ${disruptions[index].header}`}
                    </p>
                </div>
                <div className="row">
                    <p>
                        <strong>
                            { `${stop.stopCode} - ${stop.stopName}` }
                        </strong>
                    </p>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Start time</strong></p>
                        <p>{disruptions[index]?.startTime ? formatCreatedUpdatedTime(disruptions[index]?.startTime) : '-'}</p>
                    </div>
                    <div className="column">
                        <p><strong>End time</strong></p>
                        <p>{disruptions[index]?.endTime ? formatCreatedUpdatedTime(disruptions[index]?.endTime) : '-'}</p>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Duration</strong></p>
                        <p>{disruptions[index]?.duration ? getDurationWithoutSeconds(disruptions[index]) : '-'}</p>
                    </div>
                    <div className="column">
                        <p><strong>Severity</strong></p>
                        <p>{find(SEVERITIES, { value: disruptions[index].severity ?? '-' }).label}</p>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Cause</strong></p>
                        <p>{(find(causes, { value: disruptions[index].cause }) ?? DEFAULT_CAUSE).label ?? '-'}</p>
                    </div>
                    <div className="column">
                        <p><strong>Effect</strong></p>
                        <p>{(find(impacts, { value: disruptions[index].impact }) ?? DEFAULT_IMPACT).label ?? '-'}</p>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Scheduled?</strong></p>
                        <p>{disruptions[index]?.recurrent ? 'Y' : 'N'}</p>
                    </div>
                    <div className="column">
                        <p><strong>Scheduled Period</strong></p>
                        { disruptions[index]?.recurrencePattern?.byweekday?.length > 0 ? (
                            <p>{disruptions[index].recurrencePattern.byweekday.map(day => WEEKDAYS[day]).join(', ')}</p>
                        )
                            : ('-')}
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Routes</strong></p>
                        <p>{getUniqueRouteNames(disruptions[index])}</p>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Internal Notes</strong></p>
                        {disruptions[index]?.notes?.length > 0 ? (
                            disruptions[index].notes.map(note => (
                                <p key={ note.id }>{note.description}</p>
                            ))
                        ) : (
                            <p>No notes added to this disruption.</p>
                        )}
                    </div>
                </div>
            </div>
            <div className="footer">
                <IconButton
                    onClick={ handleBack }
                    disabled={ index === 0 }
                    aria-label="Previous disruption"
                >
                    <ArrowBackIosNewIcon />
                </IconButton>
                <IconButton
                    onClick={ handleNext }
                    disabled={ index === disruptions.length - 1 }
                    aria-label="Next disruption"
                >
                    <ArrowForwardIosIcon />
                </IconButton>
            </div>
        </div>
    );
};

DisruptionDetails.propTypes = {
    disruptions: PropTypes.array,
    stop: PropTypes.object,
    causes: PropTypes.array,
    impacts: PropTypes.array,
    goToDisruptionSummary: PropTypes.func,
};

DisruptionDetails.defaultProps = {
    disruptions: [],
    stop: undefined,
    causes: [],
    impacts: [],
    goToDisruptionSummary: undefined,
};

export default DisruptionDetails;
