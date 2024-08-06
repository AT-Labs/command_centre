import React from 'react';

import moment from 'moment-timezone';
import { FaCarBurst, FaCloudShowersHeavy, FaRoadCircleExclamation, FaCalendarDay, FaQuestion } from 'react-icons/fa6';
import { AiTwotoneAlert, AiFillWarning } from 'react-icons/ai';

import { dateTimeFormat } from '../../../../utils/dateUtils';
import { Category } from '../../../../types/incidents';
import Icon from '../../Icon/Icon';

export const getIconByIncidentCategory = (category) => {
    const categoryToIconMapping = {
        [Category.Accidents]: <FaCarBurst color="#D52923" className="icon" />,
        [Category.WeatherEnvironmentalConditions]: <FaCloudShowersHeavy color="#D52923" className="icon" />,
        [Category.RoadConditions]: <FaRoadCircleExclamation color="#D52923" className="icon" />,
        [Category.Emergencies]: <AiTwotoneAlert color="#D52923" className="icon" />,
        [Category.TrafficJams]: <Icon icon="incident-jam" />,
        [Category.SpecialEvents]: <FaCalendarDay color="#D52923" className="icon" />,
        [Category.EnvironmentalHazards]: <AiFillWarning color="#D52923" className="icon" />,
        [Category.RoadMaintenance]: <Icon icon="incident-roadwork" />,
        [Category.Unknown]: <FaQuestion color="#D52923" className="icon" />,
    };
    return categoryToIconMapping[category] ?? <FaQuestion color="#D52923" className="icon" />;
};

export const parseIncidentEndTime = (endTime) => {
    if (!endTime || !moment(endTime).isValid() || moment(endTime).isSame(moment(), 'minute')) {
        return 'Unknown';
    }
    return moment(endTime).format(dateTimeFormat);
};

export const parseValidityStatus = (validityStatus) => {
    if (validityStatus === 'definedByValidityTimeSpec') {
        return 'Valid until incident end time';
    }
    return validityStatus;
};
