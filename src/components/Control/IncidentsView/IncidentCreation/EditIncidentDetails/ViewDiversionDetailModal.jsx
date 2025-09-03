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
            setExpandedRows({});
        } else {
            const newExpandedRows = props.diversions.reduce((acc, diversion) => {
                acc[diversion.diversionId] = true;
                return acc;
            }, {});
            setExpandedRows(newExpandedRows);
        }
    };

    const toggleExpand = (diversionId) => {
        setExpandedRows(prev => ({
            ...prev,
            [diversionId]: !prev[diversionId],
        }));
    };

    const handleDeleteDiversion = async (diversionId) => {
        if (isDeletingDiversion) {
            return;
        }

        try {
            setIsDeletingDiversion(true);
            setDeletingDiversionId(diversionId);

            await props.deleteDiversion(diversionId, props.disruption.disruptionId);

            setNotification({
                id: `diversion-deleted-${diversionId}`,
                body: `Diversion ${diversionId} has been successfully deleted`,
                type: CONFIRMATION_MESSAGE_TYPE,
            });

            setTimeout(() => {
                setNotification(null);
            }, 3000);
        } catch (error) {
            setNotification({
                id: `diversion-delete-error-${diversionId}`,
                body: `Failed to delete diversion ${diversionId}: ${error.message || 'Unknown error'}`,
                type: 'error',
            });

            setTimeout(() => {
                setNotification(null);
            }, 5000);
        } finally {
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

    useEffect(() => {
        if (props.setShouldRefetchDiversions) {

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
                title={ `Diversions on Disruption ${props.disruption.incidentNo}` }
                onClose={ props.onClose }
                isOpen={ props.isOpen }
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
                            onClick={ toggleExpandAll }
                        >
                            {allExpanded ? 'Collapse All' : 'Expand All'}
                        </button>
                        <ActiveDiversionView
                            deleteDiversion={ handleDeleteDiversion }
                            editDiversion={ editDiversion }
                            isEditingEnabled={ isEditingEnabled }
                            diversions={ props.diversions }
                            expandedRows={ expandedRows }
                            toggleExpand={ toggleExpand }
                            incidentNo={ props.disruption.incidentNo }
                            isDeletingDiversion={ isDeletingDiversion }
                            deletingDiversionId={ deletingDiversionId }
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
