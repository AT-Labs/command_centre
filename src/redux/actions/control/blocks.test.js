import { unset, flatten } from 'lodash-es';
import chai, { expect } from 'chai';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as blockMgtApi from '../../../utils/transmitters/block-mgt-api';
import * as tripMgtApi from '../../../utils/transmitters/trip-mgt-api';
import ACTION_TYPE from '../../action-types';
import {
    deallocateVehiclesFromAllTripsInBlock,
    deallocateVehiclesFromTripSelected,
    deallocateVehiclesFromTripSelectedOnwards,
    enrichBlocksTrips,
    getBlocks,
} from './blocks';

chai.use(sinonChai);

const mockStore = configureMockStore([thunk]);
const store = mockStore({});
let sandbox;
const mockBlocks = {
    _links: {
        permissions: [
            { _rel: 'view' },
            { _rel: 'add' },
            { _rel: 'edit' },
            { _rel: 'cancel' },
        ],
    },
    blocks: [
        {
            operationalBlockRunId: 9548,
            serviceDate: '2019-08-01',
            operationalBlockId: '101',
            operationalTrips: [
                {
                    tripId: '246-850001-18780-2-4200101-1TWRFK',
                    lineGroupCode: '32',
                    lineGroupName: 'AT Metro East',
                    startTime: '05:13:00',
                    endTime: '05:50:00',
                    externalRef: '4200',
                    operationalBlockId: '101',
                    routeVariantId: '850001',
                    routeId: '246-201',
                    routeType: 2,
                    routeShortName: 'EAST',
                    routeLongName: 'Manukau 1 To Brit 3 Via Panmure',
                    status: 'COMPLETED',
                    delay: 0,
                    vehicles: [
                        {
                            id: '50801',
                            label: 'ADL        801',
                            agency: {
                                agencyId: 'VT',
                                agencyName: 'AT Metro',
                                depot: {
                                    name: '21',
                                },
                            },
                            attributes: {
                                loweringFloor: true,
                            },
                            capacity: {},
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
                    tripId: '246-850002-21960-2-4203101-dLTOV',
                    lineGroupCode: '32',
                    lineGroupName: 'AT Metro East',
                    startTime: '06:06:00',
                    endTime: '06:43:00',
                    externalRef: '4203',
                    operationalBlockId: '101',
                    routeVariantId: '850002',
                    routeId: '246-201',
                    routeType: 2,
                    routeShortName: 'EAST',
                    routeLongName: 'Brit 3 To Manukau 2 Via Panmure',
                    status: 'MISSED',
                    delay: 0,
                    vehicles: [
                        {
                            id: '50801',
                            label: 'ADL        801',
                            agency: {
                                agencyId: 'VT',
                                agencyName: 'AT Metro',
                                depot: {
                                    name: '21',
                                },
                            },
                            attributes: {
                                loweringFloor: true,
                            },
                            capacity: {},
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
                    tripId: '246-850003-24660-2-4214101-ZjuVr4',
                    lineGroupCode: '32',
                    lineGroupName: 'AT Metro East',
                    startTime: '06:51:00',
                    endTime: '07:30:00',
                    externalRef: '4214',
                    operationalBlockId: '101',
                    routeVariantId: '850003',
                    routeId: '246-201',
                    routeType: 2,
                    routeShortName: 'EAST',
                    routeLongName: 'Manukau 2 To Brit 3 Via Panmure',
                    status: 'MISSED',
                    delay: 0,
                    vehicles: [
                        {
                            id: '50801',
                            label: 'ADL        801',
                            agency: {
                                agencyId: 'VT',
                                agencyName: 'AT Metro',
                                depot: {
                                    name: '21',
                                },
                            },
                            attributes: {
                                loweringFloor: true,
                            },
                            capacity: {},
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
            startTime: '05:13:00',
            version: 0,
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
                    {
                        _rel: 'cancel',
                    },
                ],
            },
        },
        {
            operationalBlockRunId: 9584,
            serviceDate: '2019-08-01',
            operationalBlockId: '340',
            operationalTrips: [
                {
                    tripId: '254-830001-18780-2-3200340-kq6nR',
                    lineGroupCode: '33',
                    lineGroupName: 'AT Metro South',
                    startTime: '05:13:00',
                    endTime: '05:29:00',
                    externalRef: '3200',
                    operationalBlockId: '340',
                    routeVariantId: '830001',
                    routeId: '254-201',
                    routeType: 2,
                    routeShortName: 'PUK',
                    routeLongName: 'Pukekohe To Papakura 4',
                    status: 'MISSED',
                    delay: 0,
                },
                {
                    tripId: '254-830002-20400-2-3201340-ZX0y0p',
                    lineGroupCode: '33',
                    lineGroupName: 'AT Metro South',
                    startTime: '05:40:00',
                    endTime: '05:56:00',
                    externalRef: '3201',
                    operationalBlockId: '340',
                    routeVariantId: '830002',
                    routeId: '254-201',
                    routeType: 2,
                    routeShortName: 'PUK',
                    routeLongName: 'Papakura 4 To Pukekohe',
                    status: 'MISSED',
                    delay: 0,
                },
                {
                    tripId: '254-830001-21780-2-3204340-kq6nR',
                    lineGroupCode: '33',
                    lineGroupName: 'AT Metro South',
                    startTime: '06:03:00',
                    endTime: '06:19:00',
                    externalRef: '3204',
                    operationalBlockId: '340',
                    routeVariantId: '830001',
                    routeId: '254-201',
                    routeType: 2,
                    routeShortName: 'PUK',
                    routeLongName: 'Pukekohe To Papakura 4',
                    status: 'MISSED',
                    delay: 0,
                },
            ],
            trips: 3,
            startTime: '05:13:00',
            version: 0,
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
                    {
                        _rel: 'cancel',
                    },
                ],
            },
        },
    ],
};

const mockTrips = {
    tripInstances: [
        {
            tripId: '246-850001-18780-2-4200101-1TWRFK',
            status: 'COMPLETED',
            delay: 0,
        },
        {
            tripId: '246-850002-21960-2-4203101-dLTOV',
            status: 'MISSED',
            delay: 0,
        },
        {
            tripId: '246-850003-24660-2-4214101-ZjuVr4',
            status: 'MISSED',
            delay: 0,
        },
        {
            tripId: '254-830001-18780-2-3200340-kq6nR',
            status: 'MISSED',
            delay: 0,
        },
        {
            tripId: '254-830002-20400-2-3201340-ZX0y0p',
            status: 'MISSED',
            delay: 0,
        },
        {
            tripId: '254-830001-21780-2-3204340-kq6nR',
            status: 'MISSED',
            delay: 0,
        },
    ],
};

const enrichedBlocks = [
    {
        operationalBlockRunId: 9548,
        serviceDate: '2019-08-01',
        operationalBlockId: '101',
        operationalTrips: [
            {
                tripId: '246-850001-18780-2-4200101-1TWRFK',
                lineGroupCode: '32',
                lineGroupName: 'AT Metro East',
                startTime: '05:13:00',
                endTime: '05:50:00',
                externalRef: '4200',
                operationalBlockId: '101',
                routeVariantId: '850001',
                routeId: '246-201',
                routeType: 2,
                routeShortName: 'EAST',
                routeLongName: 'Manukau 1 To Brit 3 Via Panmure',
                status: 'COMPLETED',
                delay: 0,
                vehicles: [
                    {
                        id: '50801',
                        label: 'ADL        801',
                        agency: {
                            agencyId: 'VT',
                            agencyName: 'AT Metro',
                            depot: {
                                name: '21',
                            },
                        },
                        attributes: {
                            loweringFloor: true,
                        },
                        capacity: {},
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
                tripId: '246-850002-21960-2-4203101-dLTOV',
                lineGroupCode: '32',
                lineGroupName: 'AT Metro East',
                startTime: '06:06:00',
                endTime: '06:43:00',
                externalRef: '4203',
                operationalBlockId: '101',
                routeVariantId: '850002',
                routeId: '246-201',
                routeType: 2,
                routeShortName: 'EAST',
                routeLongName: 'Brit 3 To Manukau 2 Via Panmure',
                status: 'MISSED',
                delay: 0,
                vehicles: [
                    {
                        id: '50801',
                        label: 'ADL        801',
                        agency: {
                            agencyId: 'VT',
                            agencyName: 'AT Metro',
                            depot: {
                                name: '21',
                            },
                        },
                        attributes: {
                            loweringFloor: true,
                        },
                        capacity: {},
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
                tripId: '246-850003-24660-2-4214101-ZjuVr4',
                lineGroupCode: '32',
                lineGroupName: 'AT Metro East',
                startTime: '06:51:00',
                endTime: '07:30:00',
                externalRef: '4214',
                operationalBlockId: '101',
                routeVariantId: '850003',
                routeId: '246-201',
                routeType: 2,
                routeShortName: 'EAST',
                routeLongName: 'Manukau 2 To Brit 3 Via Panmure',
                status: 'MISSED',
                delay: 0,
                vehicles: [
                    {
                        id: '50801',
                        label: 'ADL        801',
                        agency: {
                            agencyId: 'VT',
                            agencyName: 'AT Metro',
                            depot: {
                                name: '21',
                            },
                        },
                        attributes: {
                            loweringFloor: true,
                        },
                        capacity: {},
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
        startTime: '05:13:00',
        version: 0,
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
                {
                    _rel: 'cancel',
                },
            ],
        },
    },
    {
        operationalBlockRunId: 9584,
        serviceDate: '2019-08-01',
        operationalBlockId: '340',
        operationalTrips: [
            {
                tripId: '254-830001-18780-2-3200340-kq6nR',
                lineGroupCode: '33',
                lineGroupName: 'AT Metro South',
                startTime: '05:13:00',
                endTime: '05:29:00',
                externalRef: '3200',
                operationalBlockId: '340',
                routeVariantId: '830001',
                routeId: '254-201',
                routeType: 2,
                routeShortName: 'PUK',
                routeLongName: 'Pukekohe To Papakura 4',
                status: 'MISSED',
                delay: 0,
            },
            {
                tripId: '254-830002-20400-2-3201340-ZX0y0p',
                lineGroupCode: '33',
                lineGroupName: 'AT Metro South',
                startTime: '05:40:00',
                endTime: '05:56:00',
                externalRef: '3201',
                operationalBlockId: '340',
                routeVariantId: '830002',
                routeId: '254-201',
                routeType: 2,
                routeShortName: 'PUK',
                routeLongName: 'Papakura 4 To Pukekohe',
                status: 'MISSED',
                delay: 0,
            },
            {
                tripId: '254-830001-21780-2-3204340-kq6nR',
                lineGroupCode: '33',
                lineGroupName: 'AT Metro South',
                startTime: '06:03:00',
                endTime: '06:19:00',
                externalRef: '3204',
                operationalBlockId: '340',
                routeVariantId: '830001',
                routeId: '254-201',
                routeType: 2,
                routeShortName: 'PUK',
                routeLongName: 'Pukekohe To Papakura 4',
                status: 'MISSED',
                delay: 0,
            },
        ],
        trips: 3,
        startTime: '05:13:00',
        version: 0,
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
                {
                    _rel: 'cancel',
                },
            ],
        },
    },
];

describe('blocks actions', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
        store.clearActions();
    });

    context('get blocks', () => {
        it('should get all blocks and show loader', async () => {
            const fakeGetBlocks = sandbox.fake.resolves(mockBlocks);
            sandbox.stub(blockMgtApi, 'getOperationalBlockRuns').callsFake(fakeGetBlocks);
            const fakeGetTrips = sandbox.fake.resolves(mockTrips);
            sandbox.stub(tripMgtApi, 'getTrips').callsFake(fakeGetTrips);

            const expectedActions = [
                {
                    type: ACTION_TYPE.UPDATE_CONTROL_BLOCKS_LOADING,
                    payload: {
                        isLoading: true,
                    },
                },
                {
                    type: ACTION_TYPE.UPDATE_BLOCKS_PERMISSIONS,
                    payload: {
                    blocksPermissions: mockBlocks._links.permissions, // eslint-disable-line
                    },
                },
                {
                    type: ACTION_TYPE.FETCH_CONTROL_BLOCKS,
                    payload: {
                        blocks: enrichedBlocks,
                    },
                },
                {
                    type: ACTION_TYPE.UPDATE_CONTROL_BLOCKS_LOADING,
                    payload: {
                        isLoading: false,
                    },
                },
            ];

            await store.dispatch(getBlocks(true));
            expect(store.getActions()).to.eql(expectedActions);
        });

        it('should get all blocks without loader', async () => {
            const fakeGetBlocks = sandbox.fake.resolves(mockBlocks);
            const fakeGetTrips = sandbox.fake.resolves(mockTrips);
            sandbox.stub(blockMgtApi, 'getOperationalBlockRuns').callsFake(fakeGetBlocks);
            sandbox.stub(tripMgtApi, 'getTrips').callsFake(fakeGetTrips);

            const expectedActions = [
                {
                    type: ACTION_TYPE.UPDATE_BLOCKS_PERMISSIONS,
                    payload: {
                    blocksPermissions: mockBlocks._links.permissions, // eslint-disable-line
                    },
                },
                {
                    type: ACTION_TYPE.FETCH_CONTROL_BLOCKS,
                    payload: {
                        blocks: enrichedBlocks,
                    },
                },
            ];
            await store.dispatch(getBlocks());
            expect(store.getActions()).to.eql(expectedActions);
        });

        it('should return enriched blocks', async () => {
            const response = enrichBlocksTrips(mockBlocks.blocks, mockTrips);
            expect(response).to.eql(enrichedBlocks);
        });
    });

    context('deallocate vehicles', () => {
        const mockBlocksClone = JSON.parse(JSON.stringify(mockBlocks));

        const mockCalls = (blocks) => {
            const fakeGetBlocks = sandbox.fake.resolves(blocks);
            const fakeGetTrips = sandbox.fake.resolves(mockTrips);
            const fakeAllocateVehicles = sandbox.fake.resolves({});

            sandbox.stub(blockMgtApi, 'getOperationalBlockRuns').callsFake(fakeGetBlocks);
            sandbox.stub(tripMgtApi, 'getTrips').callsFake(fakeGetTrips);
            sandbox.stub(blockMgtApi, 'allocateVehicles').callsFake(fakeAllocateVehicles);
        };

        const getExpectedActions = expectedBlocks => [
            {
                type: ACTION_TYPE.CLEAR_SEARCH_RESULTS,
            },
            {
                type: ACTION_TYPE.UPDATE_BLOCKS_PERMISSIONS,
                payload: {
                    blocksPermissions: mockBlocks._links.permissions, // eslint-disable-line
                },
            },
            {
                type: ACTION_TYPE.FETCH_CONTROL_BLOCKS,
                payload: {
                    blocks: expectedBlocks,
                },
            },
        ];

        beforeEach(() => {
            mockCalls(mockBlocks);
        });

        it('should deallocate vehicles from selected trip', async () => {
            unset(mockBlocksClone.blocks[0].operationalTrips[0], 'vehicles');
            const expectedActions = getExpectedActions(mockBlocksClone.blocks);
            await store.dispatch(deallocateVehiclesFromTripSelected(
                mockBlocks.blocks[0],
                mockBlocks.blocks[0].operationalTrips[0].externalRef,
            ));
            expect(store.getActions()).to.eql(expectedActions);
        });

        it('should deallocate vehicles from selected trip onwards', async () => {
            unset(mockBlocksClone.blocks[0].operationalTrips[1], 'vehicles');
            unset(mockBlocksClone.blocks[0].operationalTrips[2], 'vehicles');
            const expectedActions = getExpectedActions(mockBlocksClone.blocks);
            await store.dispatch(deallocateVehiclesFromTripSelectedOnwards(
                mockBlocks.blocks[0],
                mockBlocks.blocks[0].operationalTrips[1].externalRef,
            ));
            expect(store.getActions()).to.eql(expectedActions);
        });

        context('when trips are COMPLETED', () => {
            it('shouldnt deallocate vehicles from COMPLETED trips on deallocateVehiclesFromTripSelectedOnwards()', async () => {
                await store.dispatch(deallocateVehiclesFromTripSelectedOnwards(
                    mockBlocks.blocks[0],
                    mockBlocks.blocks[0].operationalTrips[0].externalRef,
                ));

                expect(mockBlocks.blocks[0].operationalTrips[0].vehicles)
                    .to.be.equal(mockBlocks.blocks[0].operationalTrips[0].vehicles);
            });

            it('shouldnt deallocate vehicles from COMPLETED trips on deallocateVehiclesFromAllTripsInBlock()', async () => {
                await store.dispatch(deallocateVehiclesFromAllTripsInBlock(
                    mockBlocks.blocks[0],
                    [
                        flatten(
                            mockBlocks.blocks[0].operationalTrips[0].vehicles,
                            mockBlocks.blocks[1].operationalTrips[0].vehicles,
                        ),
                    ],
                ));

                expect(mockBlocks.blocks[0].operationalTrips[0].vehicles)
                    .to.be.equal(mockBlocks.blocks[0].operationalTrips[0].vehicles);
            });
        });
    });
});
