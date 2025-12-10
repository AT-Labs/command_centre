import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Alert } from 'reactstrap';
import DetailLoader from '../../../../Common/Loader/DetailLoader';
import {
    clearDisruptionActionResult,
    updateActiveIncident,
    openCreateIncident,
    deleteAffectedEntities,
    updateIncidentsSortingParams,
    clearActiveIncident,
    toggleIncidentModals,
} from '../../../../../redux/actions/control/incidents';
import { isModalOpen } from '../../../../../redux/selectors/activity';
import { getEditMode } from '../../../../../redux/selectors/control/incidents';
import { goToNotificationsView } from '../../../../../redux/actions/control/link';
import { useDisruptionsNotificationsDirectLink } from '../../../../../redux/selectors/appSettings';
import EDIT_TYPE from '../../../../../types/edit-types';

const Confirmation = (props) => {
    const { isRequesting, resultIncidentId, resultMessage, resultCreateNotification, resultStatus } = props.response;
    const { editMode, isDisruptionsNotificationsDirectLinkEnabled } = props;

    const isCreateMode = editMode === EDIT_TYPE.CREATE;
    const isEditMode = editMode === EDIT_TYPE.EDIT;
    const isSuccess = resultStatus !== 'danger' && resultIncidentId;
    const isError = resultStatus === 'danger';

    const handleClose = () => {
        props.clearDisruptionActionResult();
        props.toggleIncidentModals('isConfirmationOpen', false);
        props.openCreateIncident(false);
        props.deleteAffectedEntities();
    };

    const handleViewAll = () => {
        handleClose();
    };

    const getErrorContent = () => {
        if (isCreateMode) {
            return resultMessage || 'Failed to create disruption';
        }

        if (isEditMode) {
            return resultMessage || 'Failed to update disruption';
        }

        return '';
    };

    const handleViewDetails = () => {
        props.clearDisruptionActionResult();
        props.toggleIncidentModals('isConfirmationOpen', false);
        props.openCreateIncident(false);
        props.deleteAffectedEntities();
        props.updateIncidentsSortingParams({});

        if (!props.isModalOpen && resultIncidentId) {
            props.clearActiveIncident();
            setTimeout(() => props.updateActiveIncident(resultIncidentId), 0);
        }
    };

    const handleKeepEditing = () => {
        props.clearDisruptionActionResult();
        props.toggleIncidentModals('isConfirmationOpen', false);
    };

    const handleViewNotifications = () => {
        props.openCreateIncident(false);
        props.deleteAffectedEntities();
        props.toggleIncidentModals('isConfirmationOpen', false);
        props.goToNotificationsView({
            version: props.response.resultIncidentVersion ?? 1,
            incidentId: props.response.resultIncidentId,
            source: 'DISR',
            new: true,
        });
    };

    const renderContent = () => {
        if (isRequesting) {
            return <DetailLoader />;
        }

        if (isError) {
            return (
                <Alert
                    isOpen
                    className="error-alert mb-3 text-center"
                    color="danger">
                    {getErrorContent()}
                </Alert>
            );
        }

        if (isSuccess) {
            return (
                <>
                    <h2>New disruption has been created</h2>
                    <div>
                        <span className="d-block mt-3 mb-2">{resultMessage}</span>
                        {resultCreateNotification && (
                            <span className="d-block mt-3 mb-2">Draft stop message has been created</span>
                        )}
                        <br />
                        <span>Please ensure you update the created disruption with new information as it becomes available.</span>
                    </div>
                </>
            );
        }

        return null;
    };

    const renderFooterButtons = () => {
        if (isRequesting) return null;

        if (isError) {
            return (
                <>
                    <div className="col-6">
                        <Button
                            className="btn cc-btn-primary btn-block"
                            onClick={ handleViewAll }>
                            {isDisruptionsNotificationsDirectLinkEnabled ? 'View all disruptions' : 'View all'}
                        </Button>
                    </div>
                    <div className="col-6">
                        <Button
                            className="btn cc-btn-primary btn-block"
                            onClick={ handleKeepEditing }>
                            Keep editing
                        </Button>
                    </div>
                </>
            );
        }

        if (isSuccess && isDisruptionsNotificationsDirectLinkEnabled) {
            return (
                <>
                    <div className="col-12 mb-4">
                        <Button
                            className="btn cc-btn-primary btn-block"
                            onClick={ handleViewAll }>
                            View all disruptions
                        </Button>
                    </div>
                    <div className="col-6">
                        <Button
                            className="btn cc-btn-primary btn-block"
                            onClick={ handleViewDetails }>
                            View disruption details
                        </Button>
                    </div>
                    <div className="col-6">
                        <Button
                            className="btn cc-btn-primary btn-block"
                            onClick={ handleViewNotifications }>
                            View notifications
                        </Button>
                    </div>
                </>
            );
        }

        if (isSuccess) {
            return (
                <>
                    <div className="col-4">
                        <Button
                            className="btn cc-btn-primary btn-block"
                            onClick={ handleViewAll }>
                            View all
                        </Button>
                    </div>
                    <div className="col-8">
                        <Button
                            className="btn cc-btn-primary btn-block"
                            onClick={ handleViewDetails }>
                            View and add more information
                        </Button>
                    </div>
                </>
            );
        }

        return null;
    };

    return (
        <div className="disruption-creation__wizard-confirmation">
            <div className="row">
                <div className={ `col ${isRequesting ? 'd-flex justify-content-center' : ''}` }>
                    {renderContent()}
                </div>
            </div>
            <footer className="row justify-content-between mt-3">
                {renderFooterButtons()}
            </footer>
        </div>
    );
};

Confirmation.propTypes = {
    response: PropTypes.object,
    clearDisruptionActionResult: PropTypes.func.isRequired,
    updateActiveIncident: PropTypes.func.isRequired,
    isModalOpen: PropTypes.bool.isRequired,
    openCreateIncident: PropTypes.func.isRequired,
    deleteAffectedEntities: PropTypes.func.isRequired,
    goToNotificationsView: PropTypes.func.isRequired,
    isDisruptionsNotificationsDirectLinkEnabled: PropTypes.bool.isRequired,
    updateIncidentsSortingParams: PropTypes.func.isRequired,
    clearActiveIncident: PropTypes.func.isRequired,
    toggleIncidentModals: PropTypes.func.isRequired,
    editMode: PropTypes.string.isRequired,
};

Confirmation.defaultProps = {
    response: {},
};

export default connect(
    state => ({
        isModalOpen: isModalOpen(state),
        isDisruptionsNotificationsDirectLinkEnabled: useDisruptionsNotificationsDirectLink(state),
        editMode: getEditMode(state),
    }),
    {
        clearDisruptionActionResult,
        updateActiveIncident,
        openCreateIncident,
        deleteAffectedEntities,
        goToNotificationsView,
        updateIncidentsSortingParams,
        clearActiveIncident,
        toggleIncidentModals,
    },
)(Confirmation);
