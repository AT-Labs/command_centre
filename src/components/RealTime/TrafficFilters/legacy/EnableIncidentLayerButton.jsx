import React from 'react';
import PropTypes from 'prop-types';
import './CongestionFilters.scss';
import { Button, ButtonGroup } from 'reactstrap';

import './EnableIncidentLayerButton.scss';

const EnableIncidentLayerButton = props => (
    <div className="enable-incident-block position-fixed">
        <ButtonGroup>
            <Button
                className={ props.isEnabled ? 'text-white' : 'text-black' }
                size="sm"
                color={ props.isEnabled ? 'bg-at-magenta-tint-5' : 'secondary' }
                active={ props.isEnabled }
                onClick={ props.onClick }>
                Traffic Incidents
            </Button>
        </ButtonGroup>
    </div>
);

EnableIncidentLayerButton.propTypes = {
    isEnabled: PropTypes.bool,
    onClick: PropTypes.func,
};

EnableIncidentLayerButton.defaultProps = {
    isEnabled: false,
    onClick: undefined,
};

export default EnableIncidentLayerButton;
