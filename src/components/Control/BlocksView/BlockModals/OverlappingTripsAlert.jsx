import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash-es';
import ModalAlert from './ModalAlert';

const OverlappingTripsAlert = ({
    overlappingTrips,
}) => {
    const renderOverlappingTripsContent = () => {
        const blockIds = _.keys(overlappingTrips);
        return blockIds.map(blockId => <div key={ blockId }>{blockId} - {overlappingTrips[blockId].map(trip => trip.externalRef).join(', ')}</div>);
    };

    return (
        <ModalAlert
            color="danger"
            isOpen
            content={ (
                <div>
                    <h4>Overlapping trips​</h4>
                    <div>Please deallocate the vehicle from overlapping trips in order to proceed​</div>
                    { renderOverlappingTripsContent() }
                </div>
            ) }
        />
    );
};

OverlappingTripsAlert.propTypes = {
    overlappingTrips: PropTypes.object.isRequired,
};


export default OverlappingTripsAlert;
