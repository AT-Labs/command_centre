import React from 'react';
import { expect } from 'chai';
import sinon from 'sinon';
import { shallow } from 'enzyme';

import { AllocateVehiclesModal } from './AllocateVehiclesModal';
import TRIP_STATUS_TYPES from '../../../../types/trip-status-types';

let wrapper;
let instance;
let sandbox;

const block1 = {
    operationalBlockRunId: 34652,
    operationalBlockId: '101',
    serviceDate: '2020-11-12',
    version: 0,
    operationalTrips: [
        {
            tripId: '246-850029-19080-2-M202101-c88c7489',
            lineGroupCode: '32',
            lineGroupName: 'AT Metro East',
            startTime: '05:18:00',
            endTime: '06:09:00',
            externalRef: 'M202',
            operationalBlockId: '101',
            routeVariantId: '850029',
            routeId: 'EAST-201',
            routeType: 2,
            routeShortName: 'EAST',
            routeLongName: 'Manukau 1 to Brit 3 Via Panmure',
            status: 'NOT_STARTED',
            delay: 0,
        },
        {
            tripId: '246-850030-22500-2-M205101-53e718b7',
            lineGroupCode: '32',
            lineGroupName: 'AT Metro East',
            startTime: '06:15:00',
            endTime: '07:03:00',
            externalRef: 'M205',
            operationalBlockId: '101',
            routeVariantId: '850030',
            routeId: 'EAST-201',
            routeType: 2,
            routeShortName: 'EAST',
            routeLongName: 'Brit 3 to Manukau 1 Via Panmure',
            status: 'NOT_STARTED',
            delay: 0,
        },
        {
            tripId: '246-850029-26280-2-M226101-c88c7489',
            lineGroupCode: '32',
            lineGroupName: 'AT Metro East',
            startTime: '07:18:00',
            endTime: '08:09:00',
            externalRef: 'M226',
            operationalBlockId: '101',
            routeVariantId: '850029',
            routeId: 'EAST-201',
            routeType: 2,
            routeShortName: 'EAST',
            routeLongName: 'Manukau 1 to Brit 3 Via Panmure',
            status: 'NOT_STARTED',
            delay: 0,
        },
    ],
    trips: 3,
    startTime: '05:18:00',
};

const block2 = {
    operationalBlockRunId: 34677,
    operationalBlockId: '431',
    serviceDate: '2020-11-12',
    version: 0,
    operationalTrips: [
        {
            tripId: '247-810116-19920-2-8W00431-ac183e62',
            lineGroupCode: '31',
            lineGroupName: 'AT Metro West',
            startTime: '05:32:00',
            endTime: '06:37:00',
            externalRef: '8W00',
            operationalBlockId: '431',
            routeVariantId: '810116',
            routeId: 'WEST-201',
            routeType: 2,
            routeShortName: 'WEST',
            routeLongName: 'Brit 2 to Swanson 2 Via Newmarket 1',
            status: 'NOT_STARTED',
            delay: 0,
        },
        {
            tripId: '247-810105-24300-2-8W17431-10ef5f8d',
            lineGroupCode: '31',
            lineGroupName: 'AT Metro West',
            startTime: '06:45:00',
            endTime: '07:54:00',
            externalRef: '8W17',
            operationalBlockId: '431',
            routeVariantId: '810105',
            routeId: 'WEST-201',
            routeType: 2,
            routeShortName: 'WEST',
            routeLongName: 'Swanson 2 to Brit 5 Via Newmarket 2',
            status: 'NOT_STARTED',
            delay: 0,
        },
        {
            tripId: '247-810106-29520-2-8W16431-06f9e27f',
            lineGroupCode: '31',
            lineGroupName: 'AT Metro West',
            startTime: '08:12:00',
            endTime: '09:17:00',
            externalRef: '8W16',
            operationalBlockId: '431',
            routeVariantId: '810106',
            routeId: 'WEST-201',
            routeType: 2,
            routeShortName: 'WEST',
            routeLongName: 'Brit 5 to Swanson 2 Via Newmarket 1',
            status: 'NOT_STARTED',
            delay: 0,
        },
    ],
    trips: 3,
    startTime: '05:32:00',
};

const block3 = {
    operationalBlockRunId: 34674,
    operationalBlockId: '411',
    serviceDate: '2020-11-12',
    version: 0,
    operationalTrips: [
        {
            tripId: '247-810163-18960-2-7W01411-7a1e2c1d',
            lineGroupCode: '31',
            lineGroupName: 'AT Metro West',
            startTime: '05:16:00',
            endTime: '06:14:00',
            externalRef: '7W01',
            operationalBlockId: '411',
            routeVariantId: '810163',
            routeId: 'WEST-201',
            routeType: 2,
            routeShortName: 'WEST',
            routeLongName: 'Henderson To Brit 4 Via Newmarket 2',
            status: 'NOT_STARTED',
            delay: 0,
            vehicles: [
                {
                    id: '50801',
                    label: 'ADL        801',
                    agency: {
                        agencyId: 'AM',
                        agencyName: 'AT Metro',
                        depot: {
                            name: '21',
                        },
                    },
                    attributes: {
                        loweringFloor: true,
                    },
                    capacity: {
                        total: 373,
                        seating: 230,
                        standing: 143,
                    },
                    type: {
                        type: 'Train',
                    },
                    tokens: [
                        'adl',
                        '801',
                    ],
                    blocks: [],
                    labelWithAllocatedBlocks: '',
                },
            ],
        },
        {
            tripId: '247-810101-27300-2-8W27411-fdcdde4c',
            lineGroupCode: '31',
            lineGroupName: 'AT Metro West',
            startTime: '07:35:00',
            endTime: '08:44:00',
            externalRef: '8W27',
            operationalBlockId: '411',
            routeVariantId: '810101',
            routeId: 'WEST-201',
            routeType: 2,
            routeShortName: 'WEST',
            routeLongName: 'Swanson 1 to Brit 5 Via Newmarket 2',
            status: 'NOT_STARTED',
            delay: 0,
            vehicles: [
                {
                    id: '50801',
                    label: 'ADL        801',
                    agency: {
                        agencyId: 'AM',
                        agencyName: 'AT Metro',
                        depot: {
                            name: '21',
                        },
                    },
                    attributes: {
                        loweringFloor: true,
                    },
                    capacity: {
                        total: 373,
                        seating: 230,
                        standing: 143,
                    },
                    type: {
                        type: 'Train',
                    },
                    tokens: [
                        'adl',
                        '801',
                    ],
                    blocks: [],
                    labelWithAllocatedBlocks: '',
                },
            ],
        },
        {
            tripId: '247-810106-31920-2-8W20411-06f9e27f',
            lineGroupCode: '31',
            lineGroupName: 'AT Metro West',
            startTime: '08:52:00',
            endTime: '09:57:00',
            externalRef: '8W20',
            operationalBlockId: '411',
            routeVariantId: '810106',
            routeId: 'WEST-201',
            routeType: 2,
            routeShortName: 'WEST',
            routeLongName: 'Brit 5 to Swanson 2 Via Newmarket 1',
            status: 'NOT_STARTED',
            delay: 0,
            vehicles: [
                {
                    id: '50801',
                    label: 'ADL        801',
                    agency: {
                        agencyId: 'AM',
                        agencyName: 'AT Metro',
                        depot: {
                            name: '21',
                        },
                    },
                    attributes: {
                        loweringFloor: true,
                    },
                    capacity: {
                        total: 373,
                        seating: 230,
                        standing: 143,
                    },
                    type: {
                        type: 'Train',
                    },
                    tokens: [
                        'adl',
                        '801',
                    ],
                    blocks: [],
                    labelWithAllocatedBlocks: '',
                },
            ],
        },
    ],
    trips: 3,
    startTime: '05:16:00',
};

const blocks = [
    block1,
    block2,
    block3,
];

const mockProps = {
    allocateVehicles: () => {},
    assignedTrains: [],
    block: {},
    blocks,
};

const setup = (customProps) => {
    const props = mockProps;
    Object.assign(props, customProps);
    wrapper = shallow(<AllocateVehiclesModal { ...props } />);
    return wrapper;
};

describe('Block allocation: onClick', () => {
    beforeEach(() => { sandbox = sinon.createSandbox(); });
    afterEach(() => { sandbox.restore(); });

    context('When allocating vehicles', () => {
        it('Should trigger the action clearSearchResults', (done) => {
            wrapper = setup({
                allocateVehicles: sandbox.spy(),
                assignedTrains: [],
                block: block1,
                blocks,
            });
            instance = wrapper.instance();
            instance.setState({ isModalOpen: true });
            const vehicles = [
                {
                    id: '50801',
                    label: 'ADL        801',
                    agency: {
                        agencyId: 'AM',
                        agencyName: 'AT Metro',
                        depot: {
                            name: '21',
                        },
                    },
                    attributes: {
                        loweringFloor: true,
                    },
                    capacity: {
                        total: 373,
                        seating: 230,
                        standing: 143,
                    },
                    type: {
                        type: 'Train',
                    },
                    tokens: [
                        'adl',
                        '801',
                    ],
                },
            ];
            instance.setState({ vehicles });
            const allocateVehiclesAction = instance.props.allocateVehicles;
            instance.allocateVehicles();

            setTimeout(() => {
                sandbox.assert.calledOnce(allocateVehiclesAction);
                const operationalTripsvehicles = instance.props.blocks[2].operationalTrips;
                const updatedVehicles = operationalTripsvehicles.map(trip => trip.vehicles);
                expect(updatedVehicles.length).equal(3);
                done();
            });
        });

        it('Should not allocate in progress trips', (done) => {
            block1.operationalTrips[0].status = TRIP_STATUS_TYPES.inProgress;
            wrapper = setup({
                allocateVehicles: sandbox.spy(),
                assignedTrains: [],
                block: block1,
                blocks,
            });
            instance = wrapper.instance();
            instance.setState({ isModalOpen: true });

            const vehicles = [
                {
                    id: '50801',
                    label: 'ADL        801',
                    agency: {
                        agencyId: 'AM',
                        agencyName: 'AT Metro',
                        depot: {
                            name: '21',
                        },
                    },
                    attributes: {
                        loweringFloor: true,
                    },
                    capacity: {
                        total: 373,
                        seating: 230,
                        standing: 143,
                    },
                    type: {
                        type: 'Train',
                    },
                    tokens: [
                        'adl',
                        '801',
                    ],
                },
            ];
            instance.setState({ vehicles });
            const allocateVehiclesAction = instance.props.allocateVehicles;
            instance.allocateVehicles();

            setTimeout(() => {
                sandbox.assert.calledOnce(allocateVehiclesAction);
                const operationalTripsvehicles = instance.props.blocks[2].operationalTrips;
                const updatedVehicles = operationalTripsvehicles.map(trip => trip.vehicles);
                expect(updatedVehicles.length).equal(3);
                done();
            });
        });
    });
});
