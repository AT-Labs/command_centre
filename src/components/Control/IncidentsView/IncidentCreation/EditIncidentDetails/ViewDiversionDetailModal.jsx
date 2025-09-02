import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import CustomMuiDialog from '../../../../Common/CustomMuiDialog/CustomMuiDialog';
import { ActiveDiversionView } from '../../../DisruptionsView/DisruptionDetail/ActiveDiversionView';
import { DISRUPTIONS_MESSAGE_TYPE } from '../../../../../types/disruptions-types';
import { DISRUPTION_STATUS } from '../../../DisruptionsView/types';
import AlertMessage from '../../../../Common/AlertMessage/AlertMessage';
import { CONFIRMATION_MESSAGE_TYPE } from '../../../../../types/message-types';
import { deleteDiversion } from '../../../../../redux/actions/control/diversions';

const editableStatuses = [
    DISRUPTION_STATUS.NOT_STARTED,
    DISRUPTION_STATUS.IN_PROGRESS,
    DISRUPTION_STATUS.DRAFT,
];

const ViewDiversionDetailModal = (props) => {
    const [allExpanded, setAllExpanded] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const [notification, setNotification] = useState(null);
    const [isDeletingDiversion, setIsDeletingDiversion] = useState(false);
    const [deletingDiversionId, setDeletingDiversionId] = useState(null);

    const isEditingEnabled = editableStatuses.includes(props.disruption.status);

    // Update allExpanded based on whether all rows are expanded
    useEffect(() => {
        if (props.diversions?.length) {
            const allRowsExpanded = props.diversions.every(
                diversion => expandedRows[diversion.diversionId],
            );
            setAllExpanded(allRowsExpanded);
        } else {
            setAllExpanded(false);
        }
    }, [expandedRows, props.diversions]);

    const toggleExpandAll = () => {
        if (allExpanded) {
            setExpandedRows({}); // Collapse all
        } else {
            const newExpandedRows = props.diversions.reduce((acc, diversion) => {
                acc[diversion.diversionId] = true;
                return acc;
            }, {});
            setExpandedRows(newExpandedRows); // Expand all
        }
        // allExpanded will be updated by the useEffect
    };

    const toggleExpand = (diversionId) => {
        setExpandedRows(prev => ({
            ...prev,
            [diversionId]: !prev[diversionId],
        }));
    };

    const handleDeleteDiversion = async (diversionId) => {
        // Prevent multiple deletion attempts
        if (isDeletingDiversion) {
            return;
        }

        try {
            setIsDeletingDiversion(true);
            setDeletingDiversionId(diversionId);

            // Use Redux action instead of direct API call
            await props.deleteDiversion(diversionId, props.disruption.disruptionId);

            // Show success notification
            setNotification({
                id: `diversion-deleted-${diversionId}`,
                body: `Diversion ${diversionId} has been successfully deleted`,
                type: CONFIRMATION_MESSAGE_TYPE,
            });

            // Auto-hide notification after 3 seconds
            setTimeout(() => {
                setNotification(null);
            }, 3000);
        } catch (error) {
            // Show error notification
            setNotification({
                id: `diversion-delete-error-${diversionId}`,
                body: `Failed to delete diversion ${diversionId}: ${error.message || 'Unknown error'}`,
                type: 'error',
            });

            // Auto-hide error notification after 5 seconds
            setTimeout(() => {
                setNotification(null);
            }, 5000);
        } finally {
            // Always reset loading state
            setIsDeletingDiversion(false);
            setDeletingDiversionId(null);
        }
    };

    const editDiversion = (diversion) => {
        props.onClose();
        props.onEditDiversion(diversion);
    };

    const closeNotification = () => {
        setNotification(null);
    };

    // Auto-refresh diversions when shouldRefetchDiversions changes
    useEffect(() => {
        if (props.setShouldRefetchDiversions) {
            // This will trigger a refresh in the parent component
        }
    }, [props.setShouldRefetchDiversions]);

    return (
        <div data-testid="active-diversion-detail">
            {notification && (
                <AlertMessage
                    message={ notification }
                    onClose={ closeNotification }
                    autoDismiss
                    dismissTimeout={ 3000 }
                />
            )}
            <CustomMuiDialog
                title={`Diversions on Disruption ${props.disruption.incidentNo}`}
                onClose={props.onClose}
                isOpen={props.isOpen}
                maxWidth="md"
                footerContent={ (
                    <div className="row w-100">
                        <div className="col-md-4 offset-md-4">
                            <button
                                type="button"
                                onClick={ props.onClose }
                                className="btn cc-btn-primary btn-block"
                                id="close-btn"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) }
            >
                {props.isLoadingDiversions && (
                    <div className="text-center">
                        <span>Loading diversions...</span>
                    </div>
                )}
                {!props.isLoadingDiversions && props.diversions && props.diversions.length > 0 && (
                    <>
                        <button
                            className="expand-all-button-style"
                            data-testid="expand-all-button"
                            type="button"
                            onClick={toggleExpandAll}
                        >
                            {allExpanded ? 'Collapse All' : 'Expand All'}
                        </button>
                        <ActiveDiversionView
                            deleteDiversion={handleDeleteDiversion}
                            editDiversion={editDiversion}
                            isEditingEnabled={isEditingEnabled}
                            diversions={props.diversions}
                            expandedRows={expandedRows}
                            toggleExpand={toggleExpand}
                            incidentNo={props.disruption.incidentNo}
                            isDeletingDiversion={isDeletingDiversion}
                            deletingDiversionId={deletingDiversionId}
                        />
                    </>
                )}
                {!props.isLoadingDiversions && (!props.diversions || props.diversions.length === 0) && (
                    <div className="text-center">
                        <span>{DISRUPTIONS_MESSAGE_TYPE.noDiversionsMessage}</span>
                    </div>
                )}
            </CustomMuiDialog>
        </div>
    );
};

ViewDiversionDetailModal.propTypes = {
    disruption: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onEditDiversion: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    setShouldRefetchDiversions: PropTypes.func.isRequired,
    diversions: PropTypes.array,
    isLoadingDiversions: PropTypes.bool,
    deleteDiversion: PropTypes.func.isRequired,
};

ViewDiversionDetailModal.defaultProps = {
    diversions: [],
    isLoadingDiversions: false,
    deleteDiversion: () => {},
};

const mapDispatchToProps = dispatch => ({
    deleteDiversion: (diversionId, disruptionId) => dispatch(deleteDiversion(diversionId, disruptionId)),
});

export default connect(null, mapDispatchToProps)(ViewDiversionDetailModal);
export { ViewDiversionDetailModal };
