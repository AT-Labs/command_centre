import React, { useEffect, useState } from 'react';
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
import * as ccStatic from '../../../../utils/transmitters/cc-static';
import Loader from '../../Loader/Loader';

const DisruptionDetails = (props) => {
    const { disruptions, causes, impacts, goToDisruptionEditPage, stopCode, stopName } = props;
    const [index, setIndex] = useState(0);
    const [fetchedRoutes, setFetchedRoutes] = useState('-');
    const [loadingRoutes, setLoadingRoutes] = useState(false);

    const getRouteNamesByStopCode = (disruption) => {
        if (!Array.isArray(disruption?.affectedEntities) || !stopCode) return '-';
        const routes = disruption.affectedEntities
            .filter(entity => entity?.stopCode === stopCode && entity?.routeShortName)
            .map(entity => entity.routeShortName.trim());
        return routes.length ? [...new Set(routes)].join(', ') : null;
    };

    useEffect(() => {
        let isMounted = true;
        const needsFetch = disruptions.some(
            disruption => getRouteNamesByStopCode(disruption) === null,
        );
        if (needsFetch && stopCode) {
            setLoadingRoutes(true);
            ccStatic.getRoutesByStop(stopCode)
                .then((data) => {
                    if (!isMounted) return;
                    setFetchedRoutes(
                        data?.length
                            ? [...new Set(data.map(route => route.route_short_name))].join(', ')
                            : '-',
                    );
                })
                .catch(() => {
                    if (!isMounted) return;
                    setFetchedRoutes('-');
                })
                .finally(() => {
                    if (!isMounted) return;
                    setLoadingRoutes(false);
                });
        }
        return () => {
            isMounted = false;
        };
    }, [disruptions, stopCode]);

    const handleNext = () => {
        setIndex(prevIndex => Math.min(prevIndex + 1, disruptions.length - 1));
    };

    const handleBack = () => {
        setIndex(prevIndex => Math.max(prevIndex - 1, 0));
    };

    const getStopTitle = () => {
        if (stopCode && stopName) {
            return `${stopCode} - ${stopName}`;
        }
        return '-';
    };

    const currentDisruption = disruptions[index];

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
                            onClick={ () => goToDisruptionEditPage(
                                { disruptionId: currentDisruption.disruptionId },
                                { setActiveDisruption: true },
                            ) }
                            style={ {
                                color: 'black',
                                textDecoration: 'underline',
                                fontWeight: 'bold',
                                padding: '0',
                            } }
                            variant="text"
                        >
                            {transformIncidentNo(currentDisruption.disruptionId)}
                        </Button>
                        {`: ${currentDisruption.header}`}
                    </p>
                </div>
                <div className="row">
                    <p>
                        <strong>{getStopTitle()}</strong>
                    </p>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Start time</strong></p>
                        <p>{currentDisruption?.startTime ? formatCreatedUpdatedTime(currentDisruption?.startTime) : '-'}</p>
                    </div>
                    <div className="column">
                        <p><strong>End time</strong></p>
                        <p>{currentDisruption?.endTime ? formatCreatedUpdatedTime(currentDisruption?.endTime) : '-'}</p>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Duration</strong></p>
                        <p>{getDurationWithoutSeconds(currentDisruption)}</p>
                    </div>
                    <div className="column">
                        <p><strong>Severity</strong></p>
                        <p>{find(SEVERITIES, { value: currentDisruption.severity })?.label || '-'}</p>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Cause</strong></p>
                        <p>{find(causes, { value: currentDisruption.cause })?.label || '-'}</p>
                    </div>
                    <div className="column">
                        <p><strong>Effect</strong></p>
                        <p>{find(impacts, { value: currentDisruption.impact })?.label || '-'}</p>
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Scheduled?</strong></p>
                        <p>{currentDisruption?.recurrent ? 'Y' : 'N'}</p>
                    </div>
                    <div className="column">
                        <p><strong>Scheduled Period</strong></p>
                        {currentDisruption?.recurrencePattern?.byweekday?.length > 0 ? (
                            <p>{currentDisruption.recurrencePattern.byweekday.map(day => WEEKDAYS[day]).join(', ')}</p>
                        ) : (<p>-</p>)}
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Routes</strong></p>
                        {
                            loadingRoutes
                                ? <span><Loader className="loader--small" /></span>
                                : <span>{getRouteNamesByStopCode(currentDisruption) ?? fetchedRoutes ?? '-'}</span>
                        }
                    </div>
                </div>
                <div className="row">
                    <div className="column">
                        <p><strong>Internal Notes</strong></p>
                        {currentDisruption?.notes?.length > 0 ? (
                            <p>{currentDisruption.notes[currentDisruption.notes.length - 1].description}</p>
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
    stopCode: PropTypes.string,
    stopName: PropTypes.string,
    causes: PropTypes.array,
    impacts: PropTypes.array,
    goToDisruptionEditPage: PropTypes.func,
};

DisruptionDetails.defaultProps = {
    disruptions: [],
    stopCode: '',
    stopName: '',
    causes: [],
    impacts: [],
    goToDisruptionEditPage: undefined,
};

export default DisruptionDetails;
