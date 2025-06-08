import PropTypes from 'prop-types';
import React, { useEffect, useState } from 'react';
import { Button, Box, Paper, Stack, CircularProgress } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';
import { connect } from 'react-redux';
import { isWorkaroundPanelOpen } from '../../../../../redux/selectors/control/incidents';
import Footer from './Footer';

import { WorkaroundsForm } from '../../Workaround/WorkaroundsForm';
import { toggleWorkaroundPanel } from '../../../../../redux/actions/control/incidents';
import './WorkaroundPanel.scss';

export const WorkaroundPanel = (props) => {
    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const toggleActive = () => setActive(!active);

    /* useEffect(() => {
        setActive(props.isWorkaroundPanelOpen);
    }, [props.isWorkaroundPanelOpen]); */

    /* const closeDrawer = () => {
        props.toggleWorkaroundDrawer(false);
    }; */

    return (
        <div className="workaround-panel">
            <Paper component={ Stack } direction="column" justifyContent="center" className={ props.isWorkaroundPanelOpen ? 'open' : 'closed' }>
                {/* <WorkaroundsForm disruption={ props.data } onDataUpdate={ props.onDataUpdate } /> */}
                <footer className="row m-0 justify-content-between p-4 position-fixed">
                    <div className="col-4">
                        <Button
                            className="btn cc-btn-link"
                            onClick={ () => props.toggleWorkaroundPanel(false) }>
                            Close
                        </Button>
                    </div>
                    <div className="col-4">
                        <Button
                            className="btn cc-btn-primary btn-block continue"
                            onClick={ () => props.toggleWorkaroundPanel(false) }>
                            Save
                        </Button>
                    </div>
                </footer>
            </Paper>
            {/*  <Box className={ `handler-wrap ${!passengerImpactAvailable && 'disabled'}` } direction="column" justifyContent="center">
                    {!loading && (
                        <div className="button-container">
                            <Button
                                variant="contained"
                                color="secondary"
                                className="handler"
                                startIcon={ active ? <Close /> : <Add /> }
                                onClick={ toggleActive }
                                disabled={ !passengerImpactAvailable }
                            >
                                { buttonLabel }
                            </Button>
                        </div>
                    )}
                    {loading && (
                        <div className="spinner-wrapper">
                            <CircularProgress size={ 50 } className="loading-spinner" />
                        </div>
                    )}
                </Box> */}
        </div>
    );
};

WorkaroundPanel.propTypes = {
    disruption: PropTypes.object.isRequired,
    toggleWorkaroundPanel: PropTypes.func.isRequired,
    isWorkaroundPanelOpen: PropTypes.bool,
};

WorkaroundPanel.defaultProps = {
    isWorkaroundPanelOpen: false,
};

export default connect(state => ({
    isWorkaroundPanelOpen: isWorkaroundPanelOpen(state),
}), {
    toggleWorkaroundPanel,
})(WorkaroundPanel);
