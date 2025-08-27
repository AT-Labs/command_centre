import React, { useEffect, useState } from 'react';
import PropTypes, { object } from 'prop-types';
import { deleteDiversion as deleteDiversionAPI } from '../../../../../utils/transmitters/disruption-mgt-api';
import CustomMuiDialog from '../../../../Common/CustomMuiDialog/CustomMuiDialog';
import { ActiveDiversionView } from '../../../DisruptionsView/DisruptionDetail/ActiveDiversionView';
import { DISRUPTIONS_MESSAGE_TYPE } from '../../../../../types/disruptions-types';
import { DISRUPTION_STATUS } from '../../../DisruptionsView/types';

const editableStatuses = [
    DISRUPTION_STATUS.NOT_STARTED,
    DISRUPTION_STATUS.IN_PROGRESS,
    DISRUPTION_STATUS.DRAFT,
];

const ViewDiversionDetailModal = (props) => {

    const [allExpanded, setAllExpanded] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});

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

    const deleteDiversion = async (diversionId) => {
        await deleteDiversionAPI(diversionId);
        props.setShouldRefetchDiversions(prevRefetch => !prevRefetch);
    };

    const editDiversion = (diversion) => {
        props.onClose();
        props.onEditDiversion(diversion);
    };

    return (
        <div data-testid="active-diversion-detail">
            <CustomMuiDialog
                title={ `Diversions on Disruption ${props.disruption.incidentNo}` }
                onClose={ props.onClose }
                isOpen={ props.isOpen }
                maxWidth="md"
            >
                {props.diversions?.length ? (
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
                            deleteDiversion={ deleteDiversion }
                            editDiversion={ editDiversion }
                            isEditingEnabled={ isEditingEnabled }
                            diversions={ props.diversions }
                            expandedRows={ expandedRows }
                            toggleExpand={ toggleExpand }
                            incidentNo={ props.disruption.incidentNo }
                        />
                    </>
                ) : (
                    <div className="text-center">
                        <span>{DISRUPTIONS_MESSAGE_TYPE.noDiversionsMessage}</span>
                    </div>
                )}
            </CustomMuiDialog>
        </div>
    );
};

ViewDiversionDetailModal.propTypes = {
    diversions: PropTypes.arrayOf(object),
    setShouldRefetchDiversions: PropTypes.func.isRequired,
    disruption: PropTypes.any.isRequired,
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onEditDiversion: PropTypes.func.isRequired,
};

ViewDiversionDetailModal.defaultProps = {
    diversions: [],
};

export { ViewDiversionDetailModal }; 