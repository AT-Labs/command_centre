import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Alert, Button } from 'reactstrap';
import { IoIosWarning } from 'react-icons/io';
import { goToRoutesView } from '../../../redux/actions/control/link';
import { isAlertDismissPermitted } from '../../../utils/user-permissions';
import { dismissAlert } from '../../../redux/actions/control/alerts';
import { getClosestTimeValueForFilter } from '../../../utils/helpers';

const AlertPanel = props => (
    <Alert className="mt-1 mb-0 border-0 bg-at-yellow-tint-20 text-body">
        <div className="row">
            <div className="col-2">
                <IoIosWarning size={ 30 } />
            </div>
            <div className="col-10">
                <h4>{ props.customTitle}</h4>
                <span>{ props.message }</span>
            </div>
        </div>
        <div className="row pt-3">
            <div className="col-10 offset-md-2 d-flex justify-content-between">
                <Button
                    className="cc-btn-link p-0 text-body"
                    onClick={ () => props.goToRoutesView({
                        routeVariantId: props.routeVariantId,
                        routeType: props.routeType,
                        startTime: props.tripStartTime,
                        routeShortName: props.routeShortName,
                        agencyId: props.agencyId,
                        tripStartDate: props.tripStartDate,
                        tripStartTime: props.tripStartTime,
                    }, {
                        routeType: props.routeType,
                        startTimeFrom: getClosestTimeValueForFilter(props.tripStartTime),
                        startTimeTo: '',
                        tripStatus: '',
                        agencyId: '',
                        routeShortName: props.routeShortName,
                        routeVariantId: props.routeVariantId,
                    }) }>
                    <span>View trip</span>
                </Button>
                {
                    isAlertDismissPermitted(props.links) && (
                        <Button
                            className="cc-btn-link p-0 text-body"
                            onClick={ () => props.dismissAlert(props.id) }>
                            <span>Dismiss</span>
                        </Button>
                    )
                }
            </div>
        </div>
    </Alert>
);

AlertPanel.propTypes = {
    id: PropTypes.string.isRequired,
    customTitle: PropTypes.string.isRequired,
    message: PropTypes.object.isRequired,
    routeVariantId: PropTypes.string.isRequired,
    routeType: PropTypes.number.isRequired,
    routeShortName: PropTypes.string.isRequired,
    agencyId: PropTypes.string.isRequired,
    tripStartDate: PropTypes.string.isRequired,
    tripStartTime: PropTypes.string.isRequired,
    goToRoutesView: PropTypes.func.isRequired,
    dismissAlert: PropTypes.func.isRequired,
    links: PropTypes.object.isRequired,
};

export default connect(null, {
    goToRoutesView,
    dismissAlert,
})(AlertPanel);
