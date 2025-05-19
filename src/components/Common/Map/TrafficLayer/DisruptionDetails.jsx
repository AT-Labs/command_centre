import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { FaExclamation } from 'react-icons/fa';
import { find } from 'lodash-es';
import { Button, IconButton } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { SEVERITIES, WEEKDAYS } from '../../../../types/disruptions-types';
import './DisruptionDetails.scss';
import {
    formatCreatedUpdatedTime,
    getDurationWithoutSeconds,
    transformIncidentNo,
} from '../../../../utils/control/disruptions';

const DisruptionDetails = (props) => {
    const { disruptions, causes, impacts, goToDisruptionSummary, stopTitle } = props;
    const [index, setIndex] = useState(0);

    const handleNext = () => {
        setIndex(prevIndex => Math.min(prevIndex + 1, disruptions.length - 1));
    };

    const handleBack = () => {
        setIndex(prevIndex => Math.max(prevIndex - 1, 0));
    };

    const getUniqueRouteNames = (disruption) => {
        const routes = disruption?.affectedEntities
            ?.map(entity => entity?.routeShortName?.trim())
            ?.filter(Boolean);

        return routes?.length ? [...new Set(routes)].join(', ') : '-';
    };

    return (
        <div className="disruption-incident-container">
            <div className="header">
                <div className="icon-container">
                    <FaExclamation color="#D52923" className="icon" />
                </div>
                <h2 className="title">Stop Disruption</h2>
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
                            { stopTitle }
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
                        <p>{find(SEVERITIES, { value: disruptions[index].severity })?.label || '-'}</p>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Cause</strong></p>
                        <p>{(find(causes, { value: disruptions[index].cause }))?.label || '-'}</p>
                    </div>
                    <div className="column">
                        <p><strong>Effect</strong></p>
                        <p>{(find(impacts, { value: disruptions[index].impact }))?.label || '-'}</p>
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
                            : (<p>-</p>)}
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
                    <ChevronLeftIcon />
                </IconButton>
                <IconButton
                    onClick={ handleNext }
                    disabled={ index === disruptions.length - 1 }
                    aria-label="Next disruption"
                >
                    <ChevronRightIcon sx={ { fontSize: 20 } } />
                </IconButton>
            </div>
        </div>
    );
};

DisruptionDetails.propTypes = {
    disruptions: PropTypes.array,
    stopTitle: PropTypes.string,
    causes: PropTypes.array,
    impacts: PropTypes.array,
    goToDisruptionSummary: PropTypes.func,
};

DisruptionDetails.defaultProps = {
    disruptions: [],
    stopTitle: '',
    causes: [],
    impacts: [],
    goToDisruptionSummary: undefined,
};

export default DisruptionDetails;
