import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { DisruptionPassengerImpactGridModal } from './DisruptionPassengerImpactGridModal';

let wrapper;

const mockProps = {
    disruption: {
        disruptionId: 93831,
        incidentNo: 'DISR093831',
        mode: 'Bus',
        affectedEntities: [
            {
                routeId: 'NX1-203',
                routeShortName: 'NX1',
                routeType: 2,
                type: 'stop',
                directionId: 0,
                stopId: '4911-ecc5b741',
                stopCode: '4901',
                stopName: 'Stop B Hibiscus Coast',
                stopLat: -33.62401,
                stopLon: 171.23608,
            },
            {
                routeId: 'TMKL-201',
                routeShortName: 'TMKK',
                routeType: 3,
                type: 'stop',
            },
        ],
        impact: 'CANCELLATIONS',
        cause: 'BUNKERING_THRUSTERS',
        startTime: '2022-08-03T23:32:00.000Z',
        endTime: '2022-09-03T23:42:00.000Z',
        status: 'cancelled',
        lastUpdatedTime: '2022-09-15T03:58:57.617Z',
        lastUpdatedBy: 'jonathan.nenba@propellerhead.co.nz',
        description: 'test',
        createdBy: 'jonathan.nenba@propellerhead.co.nz',
        createdTime: '2022-08-03T22:17:11.171Z',
        url: 'https://at.govt.nz',
        header: '1',
        feedEntityId: 'be15a97d-0d3b-4c88-b7f0-f7934883be0f',
        uploadedFiles: null,
        createNotification: false,
        exemptAffectedTrips: false,
        version: 1,
        duration: '',
        activePeriods: [
            {
                startTime: 1359568521,
            },
        ],
        recurrencePattern: null,
        recurrent: true,
        workarounds: [],
        passengerCount: 0,
        _links: {
            permissions: [],
        },
    },
    onClose: () => {},
    isOpen: true,
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    return shallow(<DisruptionPassengerImpactGridModal { ...props } />);
};

describe('<DisruptionPassengerImpactGridModal />', () => {
    beforeEach(() => {
        wrapper = setup();
    });

    it('Should render', () => {
        setup();
        expect(wrapper.exists()).equal(true);
    });
});
