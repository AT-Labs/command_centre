import PropTypes from 'prop-types';
import React from 'react';
import { isEmpty } from 'lodash-es';

import { DISRUPTION_TYPE } from '../../../../types/disruptions-types';
import WorkaroundsForm from './WorkaroundsForm';

export const WorkaroundsDisplay = (props) => {
    const { disruption } = props;
    const affectedStops = disruption.affectedEntities.filter(entity => entity.type === 'stop');
    const affectedRoutes = disruption.affectedEntities.filter(entity => entity.type === 'route' || (entity.routeId && isEmpty(entity.stopCode)));
    const disruptionType = isEmpty(affectedRoutes) && !isEmpty(affectedStops) ? DISRUPTION_TYPE.STOPS : DISRUPTION_TYPE.ROUTES;
    return (
        <>
            {disruption.workarounds && disruption.workarounds.length > 0 && (
                <WorkaroundsForm
                    readOnly
                    disruption={ {
                        disruptionType,
                        affectedEntities: disruption.affectedEntities,
                        workarounds: disruption.workarounds,
                    } } />
            )}
            {(!disruption.workarounds || (disruption.workarounds && disruption.workarounds.length === 0)) && (
                <div className="text-center">
                    <span>No workarounds added for this disruption.</span>
                </div>
            )}
        </>
    );
};

WorkaroundsDisplay.propTypes = {
    disruption: PropTypes.any.isRequired,
};

export default WorkaroundsDisplay;
