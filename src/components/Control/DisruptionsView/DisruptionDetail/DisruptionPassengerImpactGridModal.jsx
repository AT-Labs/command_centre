import PropTypes from 'prop-types';
import React from 'react';
import { Button } from 'reactstrap';
import CustomMuiDialog from '../../../Common/CustomMuiDialog/CustomMuiDialog';
import PassengerImpactGrid from '../PassengerImpact/PassengerImpactGrid';

const DisruptionPassengerImpactGridModal = props => (
    <>
        <CustomMuiDialog
            onClose={ props.onClose }
            isOpen={ props.isOpen }
            maxWidth="md"
            footerContent={ (
                <div className="row w-100">
                    <div className="col-md-4 offset-md-4">
                        <Button onClick={ props.onClose } className="btn cc-btn-primary text-white btn-block" id="close-btn">Close</Button>
                    </div>
                </div>
            ) }
        >
            { props.disruption.passengerCount ? (
                <PassengerImpactGrid
                    disruptionData={ props.disruption }
                />
            ) : <div className="text-center pt-4">No Passenger Impact information is available for this disruption</div> }

        </CustomMuiDialog>
    </>
);

DisruptionPassengerImpactGridModal.propTypes = {
    disruption: PropTypes.any.isRequired,
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
};

export { DisruptionPassengerImpactGridModal };
