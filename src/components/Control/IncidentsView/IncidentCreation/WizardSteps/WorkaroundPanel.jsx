import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { Button, Paper, Stack, CircularProgress } from '@mui/material';
import { connect } from 'react-redux';
import { getEditMode,
    isWorkaroundPanelOpen,
    getDisruptionKeyToWorkaroundEdit,
    getDisruptionKeyToEditEffect,
    isWorkaroundsNeedsToBeUpdated,
    getDisruptionForWorkaroundEdit,
} from '../../../../../redux/selectors/control/incidents';
import { STATUSES } from '../../../../../types/disruptions-types';

import { WorkaroundsForm } from '../../Workaround/WorkaroundsForm';
import { toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
    setRequireToUpdateWorkaroundsState,
    setDisruptionForWorkaroundEdit,
} from '../../../../../redux/actions/control/incidents';
import EDIT_TYPE from '../../../../../types/edit-types';
import './WorkaroundPanel.scss';

export const WorkaroundPanel = (props) => {
    const { disruptions, disruptionKeyToEdit } = props;
    const [disruption, setDisruption] = useState(null);
    const formRef = useRef();

    useEffect(() => {
        if (props.disruptionForWorkaroundEdit && Object.keys(props.disruptionForWorkaroundEdit).length > 0) { // get disruption from redux for edit flow
            setDisruption(props.disruptionForWorkaroundEdit);
        } else {
            setDisruption(disruptions.find(d => d.key === disruptionKeyToEdit));
        }
    }, [disruptionKeyToEdit]);

    useEffect(() => {
        if (props.isWorkaroundsNeedsToBeUpdated && props.disruptionForWorkaroundEdit && Object.keys(props.disruptionForWorkaroundEdit).length > 0) {
            setDisruption(props.disruptionForWorkaroundEdit);
            props.setRequireToUpdateWorkaroundsState(false);
        }
    }, [props.isWorkaroundsNeedsToBeUpdated]);

    const onSubmit = () => {
        formRef.current?.saveForm();
        props.toggleWorkaroundPanel(false);
        props.updateDisruptionKeyToWorkaroundEdit('');
    };

    const onClose = () => {
        setDisruption(null);
        formRef.current?.cancelForm();
        props.setDisruptionForWorkaroundEdit({});
        props.toggleWorkaroundPanel(false);
        props.updateDisruptionKeyToWorkaroundEdit('');
    };
    return (
        <div className={ `workaround-panel ${props.editMode === EDIT_TYPE.EDIT ? 'edit-flow-workaround-panel' : ''} ${props.isWorkaroundPanelOpen ? '' : 'pointer-event-none'}` }>
            {props.isWorkaroundPanelOpen && (
                <Paper component={ Stack } direction="column" justifyContent="center" className="mui-paper">
                    {disruption && Object.keys(disruption).length > 0
                        ? (
                            <WorkaroundsForm
                                ref={ formRef }
                                disruption={ disruption }
                                onWorkaroundUpdate={ props.onWorkaroundUpdate }
                                onWorkaroundChange={ props.onWorkaroundChange }
                                readOnly={ disruption.status === STATUSES.RESOLVED } />
                        )
                        : (
                            <div className="spinner-wrapper">
                                <CircularProgress size={ 50 } className="loading-spinner" />
                            </div>
                        )}
                    <footer className={ `row m-0 p-4 position-fixed incident-footer-min-height ${props.editMode === EDIT_TYPE.EDIT ? 'justify-content-end' : 'justify-content-between'}` }>
                        {props.editMode !== EDIT_TYPE.EDIT && (
                            <div className="col-4">
                                <Button
                                    className="btn cc-btn-link btn-block close-workaround"
                                    onClick={ () => onClose() }>
                                    Close
                                </Button>
                            </div>
                        )}
                        <div className="col-4">
                            <Button
                                className="btn cc-btn-primary btn-block save-workaround"
                                onClick={ () => onSubmit() }>
                                { (props.editMode !== EDIT_TYPE.EDIT) ? 'Save' : 'Apply'}
                            </Button>
                        </div>
                    </footer>
                </Paper>
            )}
        </div>
    );
};

WorkaroundPanel.propTypes = {
    disruptions: PropTypes.array.isRequired,
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    isWorkaroundPanelOpen: PropTypes.bool,
    disruptionKeyToEdit: PropTypes.string,
    onWorkaroundUpdate: PropTypes.func.isRequired,
    updateDisruptionKeyToWorkaroundEdit: PropTypes.func.isRequired,
    editMode: PropTypes.string,
    isWorkaroundsNeedsToBeUpdated: PropTypes.bool,
    setRequireToUpdateWorkaroundsState: PropTypes.func.isRequired,
    disruptionForWorkaroundEdit: PropTypes.object,
    setDisruptionForWorkaroundEdit: PropTypes.func.isRequired,
    onWorkaroundChange: PropTypes.func.isRequired,
};

WorkaroundPanel.defaultProps = {
    isWorkaroundPanelOpen: false,
    disruptionKeyToEdit: '',
    editMode: EDIT_TYPE.CREATE,
    isWorkaroundsNeedsToBeUpdated: false,
    disruptionForWorkaroundEdit: {},
};

export default connect(state => ({
    isWorkaroundPanelOpen: isWorkaroundPanelOpen(state),
    disruptionKeyToEdit: getDisruptionKeyToWorkaroundEdit(state),
    editMode: getEditMode(state),
    disruptionIncidentNoToEdit: getDisruptionKeyToEditEffect(state),
    isWorkaroundsNeedsToBeUpdated: isWorkaroundsNeedsToBeUpdated(state),
    disruptionForWorkaroundEdit: getDisruptionForWorkaroundEdit(state),
}), {
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
    setRequireToUpdateWorkaroundsState,
    setDisruptionForWorkaroundEdit,
})(WorkaroundPanel);
