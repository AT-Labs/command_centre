import _ from 'lodash-es';

export const styleAssignedTrains = trains => trains.map(
    (train) => {
        let labelWithAllocatedBlocks = '';
        if (train.blocks.length > 0) {
            const blocksToString = _.join(train.blocks, ', ');
            labelWithAllocatedBlocks += ` Allocated to block ${blocksToString}`;
        }

        return {
            ...train,
            labelWithAllocatedBlocks,
        };
    },
);
