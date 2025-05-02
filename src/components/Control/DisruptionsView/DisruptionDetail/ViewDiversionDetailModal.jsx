import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { reportError } from '../../../../redux/actions/activity';
import { getDiversion as getDiversionAPI } from '../../../../utils/transmitters/disruption-mgt-api';
import CustomMuiDialog from '../../../Common/CustomMuiDialog/CustomMuiDialog';
import { ActiveDiversionView } from './ActiveDiversionView';
import { DISRUPTIONS_MESSAGE_TYPE } from '../../../../types/disruptions-types';

const ViewDiversionDetailModal = (props) => {
    const [diversions, setDiversions] = useState(null);
    const [allExpanded, setAllExpanded] = useState(false);
    const [expandedRows, setExpandedRows] = useState({});
    const dispatch = useDispatch();

    useEffect(() => {
        const fetchDiversions = async () => {
            try {
                const data = await getDiversionAPI(props.disruption.disruptionId);
                setDiversions(data);
            } catch (error) {
                dispatch(reportError({ error: { fetchDiversionDetails: error } }, true));
                setDiversions(null);
            }
        };
        fetchDiversions();
    }, []);

    // Update allExpanded based on whether all rows are expanded
    useEffect(() => {
        if (diversions && diversions.length > 0) {
            const allRowsExpanded = diversions.every(
                diversion => expandedRows[diversion.diversionId],
            );
            setAllExpanded(allRowsExpanded);
        } else {
            setAllExpanded(false);
        }
    }, [expandedRows, diversions]);

    const toggleExpandAll = () => {
        if (allExpanded) {
            setExpandedRows({}); // Collapse all
        } else {
            const newExpandedRows = diversions.reduce((acc, diversion) => {
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

    return (
        <div data-testid="active-diversion-detail">
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
                {diversions?.length ? (
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
                            diversions={ diversions }
                            expandedRows={ expandedRows }
                            toggleExpand={ toggleExpand }
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
    disruption: PropTypes.any.isRequired,
    onClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
};

export { ViewDiversionDetailModal };
