import PropTypes from 'prop-types';
import React, { useEffect, useState, useRef } from 'react';
import { Button, Box, Paper, Stack, CircularProgress } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';
import { connect } from 'react-redux';
import { isWorkaroundPanelOpen, getDisruptionToWorkaroundEdit } from '../../../../../redux/selectors/control/incidents';
import Footer from './Footer';

import { WorkaroundsForm } from '../../Workaround/WorkaroundsForm';
import { toggleWorkaroundPanel, updateDisruptionToWorkaroundEdit } from '../../../../../redux/actions/control/incidents';
import './WorkaroundPanel.scss';

export const WorkaroundPanel = (props) => {
    const { disruptionToEdit } = props;
    const [active, setActive] = useState(false);
    // const originalWorkaroundRef = useRef({});
    const [loading, setLoading] = useState(true);
    const toggleActive = () => setActive(!active);

    const onSubmit = () => {
        props.toggleWorkaroundPanel(false);
        props.updateDisruptionToWorkaroundEdit({});
    };

    const onClose = () => {
        console.warn('onClose', disruptionToEdit.key);
        props.onWorkaroundUpdate(disruptionToEdit.key, undefined); // todo
        props.toggleWorkaroundPanel(false);
        props.updateDisruptionToWorkaroundEdit({});
    };

    return (
        <div className="workaround-panel">
            <Paper component={ Stack } direction="column" justifyContent="center" className={ props.isWorkaroundPanelOpen ? 'open' : 'closed' }>
                {disruptionToEdit && Object.keys(disruptionToEdit).length > 0 
                    ? (<WorkaroundsForm disruption={ disruptionToEdit } onWorkaroundUpdate={ props.onWorkaroundUpdate } />)
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
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    isWorkaroundPanelOpen: PropTypes.bool,
    disruptionToEdit: PropTypes.object,
    onWorkaroundUpdate: PropTypes.func.isRequired,
    updateDisruptionToWorkaroundEdit: PropTypes.func.isRequired,
};

WorkaroundPanel.defaultProps = {
    isWorkaroundPanelOpen: false,
    disruptionToEdit: {},
};

export default connect(state => ({
    isWorkaroundPanelOpen: isWorkaroundPanelOpen(state),
    disruptionToEdit: getDisruptionToWorkaroundEdit(state),
}), {
    toggleWorkaroundPanel,
    updateDisruptionToWorkaroundEdit,
})(WorkaroundPanel);
