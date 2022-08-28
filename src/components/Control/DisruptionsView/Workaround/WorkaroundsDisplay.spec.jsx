import React from 'react';
import { shallow } from 'enzyme';
import { expect } from 'chai';

import WorkaroundsDisplay from './WorkaroundsDisplay';

let wrapper;

const defaultState = {
    disruption: {
        disruptionId: 87892,
        incidentNo: 'DISR087892',
        mode: 'Bus',
        affectedEntities: [
            {
                routeId: 'NX1-203',
                routeShortName: 'NX1',
                routeType: 3,
                type: 'route',
                directionId: 0,
                stopId: '4981-ecc5b741',
                stopCode: '4981',
                stopName: 'Stop A Hibiscus Coast',
                stopLat: -36.62431,
                stopLon: 174.66608,
            },
            {
                routeId: 'TMK-202',
                routeShortName: 'TMK',
                routeType: 3,
                type: 'route',
            },
        ],
        impact: 'NO_SERVICE',
        cause: 'TECHNICAL_PROBLEM',
        startTime: '2022-08-03T23:16:00.000Z',
        endTime: null,
        status: 'in-progress',
        lastUpdatedTime: '2022-08-15T03:59:57.617Z',
        lastUpdatedBy: 'yuchun.yang@propellerhead.co.nz',
        description: '1',
        createdBy: 'yuchun.yang@propellerhead.co.nz',
        createdTime: '2022-08-03T23:17:15.171Z',
        url: '',
        header: '1',
        feedEntityId: 'f1e3946c-1530-406a-a1b7-c432653e9825',
        uploadedFiles: null,
        createNotification: false,
        exemptAffectedTrips: false,
        version: 2,
        duration: '',
        activePeriods: [
            {
                startTime: 1659568560,
            },
        ],
        recurrencePattern: null,
        recurrent: false,
        workarounds: [
            {
                type: 'route',
                stopCode: '4981',
                workaround: 'Workaround to stop 4981',
                routeShortName: 'NX1',
            },
        ],
        _links: {
            permissions: [
                {
                    _rel: 'view',
                },
                {
                    _rel: 'add',
                },
                {
                    _rel: 'edit',
                },
            ],
        },
    },
};

function setup(customProps) {
    const props = { ...defaultState };
    Object.assign(props, customProps);
    wrapper = shallow(<WorkaroundsDisplay { ...props } />);
}

describe('<WorkaroundsDisplay />', () => {
    afterEach(() => {
        wrapper = null;
        jest.resetAllMocks();
    });
    describe('render', () => {
        it('Should render', () => {
            setup();
            expect(wrapper.exists()).equal(true);
        });
    });
    describe('Workarounds is empty', () => {
        it('Check that the empty workarounds message are displayed', () => {
            setup({ disruption: { ...defaultState.disruption, workarounds: [] } });
            expect(wrapper.find('Fragment').render().find('span').html()).equal('No workarounds added for this disruption.');
        });
    });
});
