import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { dateTimeFormat, formatSeconds } from '../../../../utils/dateUtils';
import './IncidentDetails.scss';
import { parseIncidentEndTime, getIconByIncidentCategory, parseValidityStatus } from './TrafficHelper';

const IncidentDetails = props => (
    <div className="traffic-incident-container">
        <div className="header">
            <div className="icon-container">
                { getIconByIncidentCategory(props.incident?.type?.category) }
            </div>

            <h2 className="title">{props.incident?.type?.name}</h2>
        </div>
        <div className="details">
            <div className="row">
                <p>
                    <strong>
                        {props.incident?.type?.category}
                        :
                    </strong>
                    {` ${props.incident?.type?.description}`}
                </p>
            </div>
            <div className="row">
                <div className="column">
                    <p><strong>Start time</strong></p>
                    <p>{moment(props.incident?.validity?.overallStartTime).format(dateTimeFormat)}</p>
                </div>
                <div className="column">
                    <p><strong>End time</strong></p>
                    <p>{parseIncidentEndTime(props.incident?.validity?.overallEndTime)}</p>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <p><strong>Delay time</strong></p>
                    <p>{formatSeconds(props.incident?.delayTime) || '-'}</p>
                </div>
                <div className="column">
                    <p><strong>Average speed</strong></p>
                    <p>{`${props.incident?.averageSpeed || '-'} km/h`}</p>
                </div>
            </div>
            <div className="row">
                <div className="column">
                    <p><strong>Status</strong></p>
                    <p>{parseValidityStatus(props.incident?.validity?.status)}</p>
                </div>
                <div className="column">
                    <p><strong>Probability of occurrence</strong></p>
                    <p>{props.incident?.probabilityOfOccurrence || '-'}</p>
                </div>
            </div>
        </div>
    </div>
);

IncidentDetails.propTypes = {
    incident: PropTypes.isRequired,
};

export default IncidentDetails;
