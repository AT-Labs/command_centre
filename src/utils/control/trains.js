import { join } from 'lodash-es';

export const styleAssignedTrains = trains => trains.map(
    (train) => {
        let labelWithAllocatedBlocks = '';
        if (train.blocks.length > 0) {
            const blocksToString = join(train.blocks, ', ');
            labelWithAllocatedBlocks += ` Allocated to block ${blocksToString}`;
        }

        return {
            ...train,
            labelWithAllocatedBlocks,
        };
    },
);
