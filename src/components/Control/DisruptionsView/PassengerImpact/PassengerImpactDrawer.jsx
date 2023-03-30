import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Button, Box, Paper, Stack, CircularProgress } from '@mui/material';
import Add from '@mui/icons-material/Add';
import Close from '@mui/icons-material/Close';
import PassengerImpactGrid from './PassengerImpactGrid';
import './PassengerImpactDrawer.scss';

export const PassengerImpactDrawer = (props) => {
    const [active, setActive] = useState(false);
    const [loading, setLoading] = useState(true);
    const [passengerImpactAvailable, setPassengerImpactAvailable] = useState(false);

    const toggleActive = () => setActive(!active);

    const buttonLabel = passengerImpactAvailable ? 'Passenger Impact' : 'Passenger Impact not available';

    const handleUpdatePassengerImpactData = async () => {
        setLoading(true);
        await props.onUpdatePassengerImpactData;
        setLoading(false);
    };

    return (
        <div className="passenger-impact-drawer">
            <Paper component={ Stack } direction="column" justifyContent="center" className={ active ? 'open' : 'closed' }>
                <PassengerImpactGrid
                    disruptionData={ props.disruptionData }
                    onUpdatePassengerImpactState={ setPassengerImpactAvailable }
                    onUpdatePassengerImpactData={ handleUpdatePassengerImpactData }
                />
            </Paper>
            <Box className={ `handler-wrap ${!passengerImpactAvailable && 'disabled'}` } direction="column" justifyContent="center">
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
            </Box>
        </div>
    );
};

PassengerImpactDrawer.propTypes = {
    disruptionData: PropTypes.object.isRequired,
    onUpdatePassengerImpactData: PropTypes.func,
};

PassengerImpactDrawer.defaultProps = {
    onUpdatePassengerImpactData: () => null,
};

export default PassengerImpactDrawer;
