import moment from 'moment-timezone';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';

import Message from '../../../Common/Message/Message';
import DetailLoader from '../../../../Common/Loader/DetailLoader';
import {
    clearAddTripActionResult,
    updateEnabledAddTripModal,
    toggleAddTripModals,
    updateSelectedAddTrip,
} from '../../../../../redux/actions/control/routes/trip-instances';
import { goToRoutesView } from '../../../../../redux/actions/control/link';
import { getClosestTimeValueForFilter } from '../../../../../utils/helpers';

export const NewTripModal = (props) => {
    const { isRequesting, result, resultMessage } = props.response;
    const renderContent = () => {
        if (isRequesting) return <DetailLoader />;
        return result
            ? (
                <div>
                    <span className="d-block mb-3 font-weight-bold">{ `New trip was successfully added for today ${moment().format('DD/MM/YYYY')}` }</span>
                    <span className="d-block mb-2">{ `Trip ID: ${result.tripId}` }</span>
                    <span className="d-block mb-2">{ `Route Variant Name: ${result.routeLongName}` }</span>
                    <span className="d-block mb-2">{ `Start time: ${result.startTime}` }</span>
                </div>
            )
            : (
                <Message
                    autoDismiss={ false }
                    isDismissible={ false }
                    message={ {
                        id: 'new-trip-fail-message',
                        body: resultMessage,
                        type: 'danger',
                    } } />
            );
    };

    return (
        <div className="add-trip-new-trip-details__new-trip-modal">
            <div className="row">
                <div className={ `col ${isRequesting ? 'd-flex justify-content-center' : ''}` }>
                    { renderContent() }
                </div>
            </div>
            { !isRequesting && (
                <footer className="row justify-content-between mt-3">
                    {
                        result && (
                            <div className="col-4">
                                <Button
                                    className="btn cc-btn-secondary"
                                    onClick={ () => {
                                        props.updateEnabledAddTripModal(false);
                                        props.clearAddTripActionResult();
                                        props.toggleAddTripModals('isNewTripModalOpen', false);
                                        props.updateSelectedAddTrip(null);
                                    } }>
                                    View All
                                </Button>
                            </div>
                        )
                    }
                    <div className={ result ? 'col-8' : 'col-12' }>
                        <Button
                            className="btn cc-btn-primary btn-block"
                            onClick={ () => {
                                if (result) {
                                    props.updateEnabledAddTripModal(false);
                                    props.goToRoutesView(result, {
                                        routeType: result.routeType,
                                        startTimeFrom: getClosestTimeValueForFilter(result.startTime),
                                        tripStatus: result.status,
                                        agencyId: result.agencyId,
                                        routeShortName: result.routeShortName,
                                        routeVariantId: result.routeVariantId,
                                    });
                                    props.updateSelectedAddTrip(null);
                                }
                                props.clearAddTripActionResult();
                                props.toggleAddTripModals('isNewTripModalOpen', false);
                            } }>
                            { result ? 'View Details' : 'Close' }
                        </Button>
                    </div>
                </footer>
            )}
        </div>
    );
};

NewTripModal.propTypes = {
    response: PropTypes.object,
    clearAddTripActionResult: PropTypes.func.isRequired,
    updateEnabledAddTripModal: PropTypes.func.isRequired,
    toggleAddTripModals: PropTypes.func.isRequired,
    goToRoutesView: PropTypes.func.isRequired,
    updateSelectedAddTrip: PropTypes.func.isRequired,
};

NewTripModal.defaultProps = {
    response: {},
};

export default connect(
    null,
    {
        clearAddTripActionResult,
        updateEnabledAddTripModal,
        toggleAddTripModals,
        goToRoutesView,
        updateSelectedAddTrip,
    },
)(NewTripModal);
