import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';

import { reportError } from '../../../../redux/actions/activity';
// eslint-disable-next-line no-unused-vars
import { getDiversion as getDiversionAPI, deleteDiversion as deleteDiversionAPI } from '../../../../utils/transmitters/disruption-mgt-api';
import CustomMuiDialog from '../../../Common/CustomMuiDialog/CustomMuiDialog';
import { ActiveDiversionView } from './ActiveDiversionView';
import { DISRUPTIONS_MESSAGE_TYPE } from '../../../../types/disruptions-types';

const ViewDiversionDetailModal = (props) => {
    const [diversions, setDiversions] = useState(null);
    const [allExpanded, setAllExpanded] = useState(false);
    const dispatch = useDispatch();
    const [refresh, setRefresh] = useState(false);

    useEffect(async () => {
        try {
            // eslint-disable-next-line no-console
            console.log('----getting new diversion or refreshted');
            const data = await getDiversionAPI(props.disruption.disruptionId);
            setDiversions(data);
        } catch (error) {
            dispatch(reportError({ error: { fetchDiversionDetails: error } }, true));
            setDiversions(null);
        }
    }, [refresh]);

    const toggleExpandAll = () => {
        setAllExpanded(!allExpanded);
    };

    const deleteDiversion = async (diversionId) => {
        // eslint-disable-next-line no-console
        console.log(`Deleting diversion with ID: ${diversionId}`);
        // TODO: Enable me when ready for testing:
        // await deleteDiversionAPI(diversionId);
        setRefresh(prevRefresh => !prevRefresh);
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
                            <button type="button" onClick={ props.onClose } className="btn cc-btn-primary btn-block" id="close-btn">Close</button>
                        </div>
                    </div>
                ) }>
                {diversions?.length ? (
                    <button
                        className="expand-all-button-style"
                        data-testid="expand-all-button"
                        type="button"
                        onClick={ toggleExpandAll }
                    >
                        {allExpanded ? 'Collapse All' : 'Expand All'}
                    </button>

                ) : null}
                {diversions?.length
                    ? (
                        <ActiveDiversionView
                            deleteDiversion={ deleteDiversion }
                            diversions={ diversions }
                            allExpanded={ allExpanded }
                            incidentNo={ props.disruption.incidentNo } />
                    )
                    : (
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
