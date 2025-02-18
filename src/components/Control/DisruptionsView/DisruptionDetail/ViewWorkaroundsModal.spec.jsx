import React from 'react';
import { expect } from 'chai';
import { shallow } from 'enzyme';
import { ViewWorkaroundsModal } from './ViewWorkaroundsModal';

let wrapper;

const mockProps = {
    disruption: {
        disruptionId: 93839,
        incidentNo: 'DISR093839',
        mode: 'Train',
        affectedEntities: [
            {
                routeId: 'NX2-203',
                routeShortName: 'NX2',
                routeType: 3,
                type: 'stop',
                directionId: 0,
                stopId: '4911-ecc5b741',
                stopCode: '4901',
                stopName: 'Stop A Hibiscus Coast',
                stopLat: -36.62401,
                stopLon: 174.23608,
            },
            {
                routeId: 'TMKL-203',
                routeShortName: 'TMKL',
                routeType: 2,
                type: 'stop',
            },
        ],
        impact: 'CANCELLATIONS',
        cause: 'BUNKERING_THRUSTERS',
        startTime: '2022-08-03T23:12:00.000Z',
        endTime: '2022-09-03T23:12:00.000Z',
        status: 'cancelled',
        lastUpdatedTime: '2022-08-15T03:58:57.617Z',
        lastUpdatedBy: 'jonathan.nenba@propellerhead.co.nz',
        description: '3',
        createdBy: 'jonathan.nenba@propellerhead.co.nz',
        createdTime: '2022-08-03T23:17:11.171Z',
        url: 'https://at.govt.nz',
        header: '1',
        feedEntityId: 'be55a97d-0d3b-4c88-b7f0-f7934883be0f',
        uploadedFiles: null,
        createNotification: true,
        exemptAffectedTrips: true,
        version: 2,
        duration: '',
        activePeriods: [
            {
                startTime: 1659568521,
            },
        ],
        recurrencePattern: null,
        recurrent: false,
        workarounds: [],
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
    return shallow(<ViewWorkaroundsModal { ...props } />);
};

describe('<ViewWorkaroundsModal />', () => {
    beforeEach(() => {
        wrapper = setup();
    });

    it('Should render', () => {
        setup();
        expect(wrapper.exists()).equal(true);
    });
});
