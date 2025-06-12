import React from 'react';
import PropTypes from 'prop-types';

const AffectedStops = ({ affectedStops }) => (
    <div className="pl-4 pr-4">
        <p>
            <b>Stops affected</b>
        </p>
        {affectedStops.length > 0 ? (
            affectedStops.map(stop => (
                <div key={ stop.stopCode }>
                    <span>
                        {`${stop.stopCode} - ${stop.stopName} (${stop.routeShortName})`}
                    </span>
                </div>
            ))
        ) : (
            <p>No stops affected</p>
        )}
    </div>
);

AffectedStops.propTypes = {
    affectedStops: PropTypes.array.isRequired,
};

export default AffectedStops;
