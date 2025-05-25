import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'reactstrap';

import CustomMuiDialog from '../../../Common/CustomMuiDialog/CustomMuiDialog';
import WorkaroundsDisplay from '../../DisruptionsView/Workaround/WorkaroundsDisplay';

const ViewWorkaroundsModal = props => (
    <CustomMuiDialog
        title={ `Workarounds for Disruption #${props.disruption.incidentNo}` }
        onClose={ props.onClose }
        isOpen={ props.isOpen }
        maxWidth="md"
        footerContent={ (
            <div className="row w-100">
                <div className="col-md-4 offset-md-4">
                    <Button onClick={ props.onClose } className="btn cc-btn-primary btn-block" id="close-btn">Close</Button>
                </div>
            </div>
        ) }
    >
        <WorkaroundsDisplay disruption={ props.disruption } />
    </CustomMuiDialog>
);

ViewWorkaroundsModal.propTypes = {
    disruption: PropTypes.any.isRequired,
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
};

export { ViewWorkaroundsModal };
