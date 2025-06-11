import { expect } from 'chai';
import React from 'react';

import { FaCarBurst, FaCloudShowersHeavy, FaRoadCircleExclamation, FaCalendarDay, FaQuestion } from 'react-icons/fa6';
import { AiTwotoneAlert, AiFillCloseCircle } from 'react-icons/ai';
import Icon from '../../Icon/Icon';
import {
    parseIncidentEndTime,
    getIconByIncidentCategory,
} from './TrafficHelper';
import { Category } from '../../../../types/incidents';

describe('parseIncidentEndTime', () => {
    it('should return Unknown when end time is undifined', () => {
        expect(parseIncidentEndTime(undefined)).to.equal('Unknown');
    });

    it('should return Unknown when end time is invalid', () => {
        expect(parseIncidentEndTime('invalid date')).to.equal('Unknown');
    });

    it('should return Unknown when end time is equal to current date', () => {
        const currentDate = '2024-07-17T02:30:37.000Z';
        Date.now = jest.fn(() => new Date(currentDate));
        expect(parseIncidentEndTime(currentDate)).to.equal('Unknown');
    });
});

describe('getIconNameByIncidentCategory', () => {
    it('should return the correct icon name for each category', () => {
        expect(getIconByIncidentCategory(Category.Accidents)).to.deep.equal(<FaCarBurst color="#D52923" className="icon" />);
        expect(getIconByIncidentCategory(Category.WeatherEnvironmentalConditions)).to.deep.equal(<FaCloudShowersHeavy color="#D52923" className="icon" />);
        expect(getIconByIncidentCategory(Category.RoadConditions)).to.deep.equal(<FaRoadCircleExclamation color="#D52923" className="icon" />);
        expect(getIconByIncidentCategory(Category.Emergencies)).to.deep.equal(<AiTwotoneAlert color="#D52923" className="icon" />);
        expect(getIconByIncidentCategory(Category.TrafficCongestion)).to.deep.equal(<Icon icon="incident-jam" />);
        expect(getIconByIncidentCategory(Category.SpecialEvents)).to.deep.equal(<FaCalendarDay color="#D52923" className="icon" />);
        expect(getIconByIncidentCategory(Category.Roadworks)).to.deep.equal(<Icon icon="incident-roadwork" />);
        expect(getIconByIncidentCategory(Category.RoadClosed)).to.deep.equal(<AiFillCloseCircle color="#D52923" className="icon" />);
        expect(getIconByIncidentCategory(Category.Unknown)).to.deep.equal(<FaQuestion color="#D52923" className="icon" />);
    });

    it('should return "default icon" for an undefined category', () => {
        expect(getIconByIncidentCategory('NonExistentCategory')).to.deep.equal(<FaQuestion color="#D52923" className="icon" />);
    });
});
