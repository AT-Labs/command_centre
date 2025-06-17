import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { Button, Box, Paper, Stack, CircularProgress } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';
import { connect } from 'react-redux';
import { isWorkaroundPanelOpen, getDisruptionKeyToWorkaroundEdit } from '../../../../../redux/selectors/control/incidents';
import Footer from './Footer';

import { WorkaroundsForm } from '../../Workaround/WorkaroundsForm';
import { toggleWorkaroundPanel, updateDisruptionKeyToWorkaroundEdit } from '../../../../../redux/actions/control/incidents';
import './WorkaroundPanel.scss';

export const WorkaroundPanel = (props) => {
    const { disruptions, disruptionKeyToEdit } = props;
    const [disruption, setDisruption] = useState(null);
    const formRef = useRef();

    useEffect(() => {
        setDisruption(disruptions.find(d => d.key === disruptionKeyToEdit));
    }, [disruptionKeyToEdit]);

    const onSubmit = () => {
        formRef.current?.saveForm();
        props.toggleWorkaroundPanel(false);
        props.updateDisruptionKeyToWorkaroundEdit('');
    };

    const onClose = () => {
        setDisruption(null);
        formRef.current?.cancelForm();
        props.toggleWorkaroundPanel(false);
        props.updateDisruptionKeyToWorkaroundEdit('');
    };

    return (
        <div className="workaround-panel">
            <Paper component={ Stack } direction="column" justifyContent="center" className={ props.isWorkaroundPanelOpen ? 'open' : 'closed' }>
                {disruption && Object.keys(disruption).length > 0
                    ? (<WorkaroundsForm ref={ formRef } disruption={ disruption } onWorkaroundUpdate={ props.onWorkaroundUpdate } />)
                    : (
                        <div className="spinner-wrapper">
                            <CircularProgress size={ 50 } className="loading-spinner" />
                        </div>
                    )}
                <footer className="row m-0 justify-content-between p-4 position-fixed">
                    <div className="col-4">
                        <Button
                            className="btn cc-btn-link"
                            onClick={ () => onClose() }>
                            Close
                        </Button>
                    </div>
                    <div className="col-4">
                        <Button
                            className="btn cc-btn-primary btn-block continue"
                            onClick={ () => onSubmit() }>
                            Save
                        </Button>
                    </div>
                </footer>
            </Paper>
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
};

WorkaroundPanel.defaultProps = {
    isWorkaroundPanelOpen: false,
    disruptionKeyToEdit: '',
};

export default connect(state => ({
    isWorkaroundPanelOpen: isWorkaroundPanelOpen(state),
    disruptionKeyToEdit: getDisruptionKeyToWorkaroundEdit(state),
}), {
    toggleWorkaroundPanel,
    updateDisruptionKeyToWorkaroundEdit,
})(WorkaroundPanel);
