import sinon from 'sinon';
import chai, { expect } from 'chai';
import sinonChai from 'sinon-chai';

import * as blocksUtils from './blocks';
import TRIP_STATUS_TYPES from '../../types/trip-status-types';

chai.use(sinonChai);
let sandbox;

describe('blocks actions', () => {
    const vehicles = [{
        blocks: [
            '101',
        ],
        id: '50681',
        label: 'ADK        681',
    }];

    const trip1 = {
        id: 1,
        tripId: 'trip_id_1',
        routeId: '254',
        routeType: 2,
        routeShortName: 'PUK',
        routeLongName: 'Pukekohe To Papakura 4',
        lineGroupCode: '33',
        lineGroupName: 'AT Metro South',
        startTime: '20:00:00',
        endTime: '20:40:00',
        externalRef: '1',
        status: TRIP_STATUS_TYPES.notStarted,
    };

    const trip2 = {
        id: 2,
        tripId: 'trip_id_2',
        routeId: '254',
        routeType: 2,
        routeShortName: 'PUK',
        routeLongName: 'Pukekohe To Papakura 4',
        lineGroupCode: '33',
        lineGroupName: 'AT Metro South',
        startTime: '22:00:00',
        endTime: '22:55:00',
        externalRef: '2',
        status: TRIP_STATUS_TYPES.notStarted,
    };

    const trip3 = {
        id: 3,
        tripId: 'trip_id_3',
        routeId: '246',
        routeType: 2,
        routeShortName: 'EAST',
        routeLongName: 'Manukau 1 To Brit 3 Via Panmure',
        lineGroupCode: '32',
        lineGroupName: 'AT Metro East',
        startTime: '21:00:00',
        endTime: '22:40:00',
        externalRef: '3',
        vehicles,
        status: TRIP_STATUS_TYPES.notStarted,
    };

    const trip4 = {
        id: 4,
        tripId: 'trip_id_4',
        routeId: '246',
        routeType: 2,
        routeShortName: 'EAST',
        routeLongName: 'Manukau 1 To Brit 3 Via Panmure',
        lineGroupCode: '32',
        lineGroupName: 'AT Metro East',
        startTime: '22:50:00',
        endTime: '24:40:00',
        externalRef: '4',
        vehicles,
        status: TRIP_STATUS_TYPES.notStarted,
    };

    const currentOperateBlock = {
        operationalBlockRunId: 340,
        serviceDate: '2019-02-07',
        operationalBlockId: '340',
        operationalTrips: [trip1, trip2],
        trips: 2,
        startTime: '20:00:00',
        version: 0,
    };

    const block1 = {
        operationalBlockRunId: 101,
        serviceDate: '2019-02-07',
        operationalBlockId: '101',
        operationalTrips: [trip3],
        trips: 1,
        startTime: '21:00:00',
        version: 0,
    };

    const block2 = {
        operationalBlockRunId: 102,
        serviceDate: '2019-02-07',
        operationalBlockId: '102',
        operationalTrips: [trip4],
        trips: 1,
        startTime: '22:50:00',
        version: 0,
    };

    const allBlocks = [
        block1,
        block2,
        currentOperateBlock,
    ];

    const clone = obj => JSON.parse(JSON.stringify(obj));

    beforeEach(() => { sandbox = sinon.createSandbox(); });

    afterEach(() => { sandbox.restore(); });

    it('Overlapping trips: should return all trips that overlapped with all trips in current block if no selected trip', () => {
        const overlappingTrips = blocksUtils.getOverlappingTrips(allBlocks, currentOperateBlock, vehicles, null);
        expect(overlappingTrips).to.eql({ [`${block1.operationalBlockId}`]: [trip3], [`${block2.operationalBlockId}`]: [trip4] });
    });

    it('Overlapping trips: should return empty if there are no trips overlapped with selected trip', () => {
        const overlappingTrips = blocksUtils.getOverlappingTrips(allBlocks, currentOperateBlock, vehicles, [trip1]);
        expect(overlappingTrips).to.eql({});
    });

    it('Overlapping trips: should return all trips that overlapped with selected trip', () => {
        const overlappingTrips = blocksUtils.getOverlappingTrips(allBlocks, currentOperateBlock, vehicles, [trip2]);
        expect(overlappingTrips).to.eql({ [`${block1.operationalBlockId}`]: [trip3], [`${block2.operationalBlockId}`]: [trip4] });
    });

    it('Overlapping trips: should return trips that overlapped if allocate the same vehicle to current block', () => {
        const currentOperateBlockCopy = clone(currentOperateBlock);
        currentOperateBlockCopy.operationalTrips[1].startTime = '20:30:00';
        currentOperateBlockCopy.operationalTrips[1].endTime = '20:50:00';
        const overlappingTrips = blocksUtils.getOverlappingTrips(allBlocks, currentOperateBlockCopy, vehicles, null);

        expect(overlappingTrips).to.eql({ [`${currentOperateBlock.operationalBlockId}`]: currentOperateBlockCopy.operationalTrips });
    });

    it('Overlapping trips: should not calculate with completed trips', () => {
        const allBlocksCopy = clone(allBlocks);
        allBlocksCopy[0].operationalTrips[0].status = TRIP_STATUS_TYPES.completed;
        const overlappingTrips = blocksUtils.getOverlappingTrips(allBlocksCopy, currentOperateBlock, vehicles, null);
        expect(overlappingTrips).to.eql({ [`${block2.operationalBlockId}`]: [trip4] });
    });

    it('Overlapping trips: should not calculate with cancelled trips', () => {
        const allBlocksCopy = clone(allBlocks);
        allBlocksCopy[0].operationalTrips[0].status = TRIP_STATUS_TYPES.cancelled;
        const overlappingTrips = blocksUtils.getOverlappingTrips(allBlocksCopy, currentOperateBlock, vehicles, null);
        expect(overlappingTrips).to.eql({ [`${block2.operationalBlockId}`]: [trip4] });
    });
});
