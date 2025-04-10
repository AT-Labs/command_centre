import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { getDiversion as getDiversionAPI } from '../../../../utils/transmitters/disruption-mgt-api';
import CustomMuiDialog from '../../../Common/CustomMuiDialog/CustomMuiDialog';
import { ActiveDiversionView } from './ActiveDiversionView';

const ViewDiversionDetailModal = (props) => {
    const [diversions, setDiversions] = useState(null);

    useEffect(async () => {
        try {
            const data = await getDiversionAPI(props.disruption.disruptionId);
            setDiversions(data);
        } catch (error) {
            setDiversions(null);
        }
    }, [props.disruption.disruptionId]);

    return (
        <div className="active-diversion-detail">
            <CustomMuiDialog
                title={ `Diversions on Disruption ${props.disruption.incidentNo}` }
                onClose={ props.onClose }
                isOpen={ props.isOpen }
                maxWidth="md">
                <ActiveDiversionView diversions={ diversions } />
            </CustomMuiDialog>
        </div>

    );
};

ViewDiversionDetailModal.propTypes = {
    disruption: PropTypes.any.isRequired,
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
};

export { ViewDiversionDetailModal };
