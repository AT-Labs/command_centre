import React from 'react';

import moment from 'moment-timezone';
import { FaCalendarDay, FaCarBurst, FaCloudShowersHeavy, FaQuestion, FaRoadCircleExclamation } from 'react-icons/fa6';
import { AiFillCloseCircle, AiTwotoneAlert } from 'react-icons/ai';

import { dateTimeFormat } from '../../../../utils/dateUtils';
import { Category } from '../../../../types/incidents';
import Icon from '../../Icon/Icon';

export const getIconByIncidentCategory = (category, useNewColors) => {
    const color = useNewColors ? 'black' : '#D52923';
    const categoryToIconMapping = {
        [Category.Accidents]: <FaCarBurst color={ color } className="icon" />,
        [Category.WeatherEnvironmentalConditions]: <FaCloudShowersHeavy color={ color } className="icon" />,
        [Category.RoadConditions]: <FaRoadCircleExclamation color={ color } className="icon" />,
        [Category.Emergencies]: <AiTwotoneAlert color={ color } className="icon" />,
        [Category.TrafficCongestion]: <Icon icon={ useNewColors ? 'incident-jam-black' : 'incident-jam' } />,
        [Category.SpecialEvents]: <FaCalendarDay color={ color } className="icon" />,
        [Category.Roadworks]: <Icon icon={ useNewColors ? 'incident-roadwork-black' : 'incident-roadwork' } />,
        [Category.RoadClosed]: <AiFillCloseCircle color={ color } className="icon" />,
        [Category.Unknown]: <FaQuestion color={ color } className="icon" />,
    };
    return categoryToIconMapping[category] ?? <FaQuestion color={ color } className="icon" />;
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
