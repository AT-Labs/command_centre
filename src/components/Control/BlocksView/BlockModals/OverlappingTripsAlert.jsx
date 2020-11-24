import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import ModalAlert from './ModalAlert';

const OverlappingTripsAlert = ({
    overlappingBlocks,
}) => {
    const renderOverlappingTripsContent = () => {
        const blockIds = _.keys(overlappingBlocks);
        return blockIds.map(blockId => <div key={ blockId }>{blockId} - {overlappingBlocks[blockId].map(trip => trip.externalRef).join(', ')}</div>);
    };

    return (
        <ModalAlert
            color="warning"
            isOpen
            content={ (
                <div>
                    <h4>Overlapping trips​</h4>
                    <div>Allocating this vehicle will automatically deallocate it from the following trips.</div>
                    { renderOverlappingTripsContent() }
                </div>
            ) }
        />
    );
};

OverlappingTripsAlert.propTypes = {
    overlappingBlocks: PropTypes.object.isRequired,
};


export default OverlappingTripsAlert;
