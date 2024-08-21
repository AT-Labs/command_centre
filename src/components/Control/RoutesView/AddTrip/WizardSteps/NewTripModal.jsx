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
import { useNextDayTrips } from '../../../../../redux/selectors/appSettings';

export const NewTripModal = (props) => {
    const { isRequesting, result, resultMessage } = props.response;
    const messageText = props.useNextDayTrips ? 'the dates selected' : `today ${moment().format('DD/MM/YYYY')}`;
    const renderContent = () => {
        if (isRequesting) return <DetailLoader />;
        return result && result[0]
            ? (
                <div>
                    <span className="d-block mb-3 font-weight-bold">{ `${result.length} new trip(s) successfully added for ${messageText}` }</span>
                    <span className="d-block mb-2">{ `Route Variant Name: ${result[0].routeLongName}` }</span>
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
                        result && result[0] && (
                            <div className="col-4">
                                <Button
                                    className="btn cc-btn-secondary"
                                    onClick={ () => {
                                        props.clearAddTripActionResult();
                                        props.toggleAddTripModals('isNewTripModalOpen', false);
                                        props.onClose();
                                    } }>
                                    Add more trips
                                </Button>
                            </div>
                        )
                    }
                    <div className={ result ? 'col-8' : 'col-12' }>
                        {result && result[0] ? (
                            <Button
                                className="btn cc-btn-primary btn-block"
                                onClick={ () => {
                                    props.updateEnabledAddTripModal(false);
                                    props.clearAddTripActionResult();
                                    props.toggleAddTripModals('isNewTripModalOpen', false);
                                    props.updateSelectedAddTrip(null);
                                } }>
                                Back to Routes & Trips
                            </Button>
                        )
                            : (
                                <Button
                                    className="btn cc-btn-primary btn-block"
                                    onClick={ () => {
                                        props.clearAddTripActionResult();
                                        props.toggleAddTripModals('isNewTripModalOpen', false);
                                        props.onClose(false);
                                    } }>
                                    Close
                                </Button>
                            )}
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
    updateSelectedAddTrip: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    useNextDayTrips: PropTypes.bool.isRequired,
};

NewTripModal.defaultProps = {
    response: {},
};

export default connect(
    state => ({
        useNextDayTrips: useNextDayTrips(state),
    }),
    {
        clearAddTripActionResult,
        updateEnabledAddTripModal,
        toggleAddTripModals,
        updateSelectedAddTrip,
    },
)(NewTripModal);
