import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { connect } from 'react-redux';
import VehicleStatusView from './VehicleStatusView';
import { getVehicleEventsDisplayedTotalResults } from '../../../../redux/selectors/control/vehicleReplays/vehicleReplay';
import { clearCurrentTrip } from '../../../../redux/actions/control/tripReplays/currentTrip';
import { setVehicleViewTabStatus } from '../../../../redux/actions/control/vehicleReplays/vehicleReplay';
import { getTripReplayRedirected } from '../../../../redux/selectors/control/tripReplays/tripReplayView';

const TabPanel = (props) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={ value !== index }
            id={ `simple-tabpanel-${index}` }
            aria-labelledby={ `simple-tab-${index}` }
            { ...other }
        >
            {value === index && (
                <div>{ children }</div>
            )}
        </div>
    );
};

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

TabPanel.defaultProps = {
    children: null,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

const ReplaySubTab = (props) => {
    const { handleMouseEnter, handleMouseLeave, handleMouseClick } = props;
    const [value, setValue] = React.useState(0);

    useEffect(() => {
        if (value === 1) {
            props.clearCurrentTrip();
            props.setVehicleViewTabStatus(true);
        }
    }, [value]);

    useEffect(() => {
        if (props.isRedirected) {
            setValue(1);
        }
    }, []);

    const handleChange = (_event, newValue) => {
        setValue(newValue);
    };

    return (
        <section>
            <Box sx={ { borderBottom: 1, borderColor: 'divider' } }>
                <Tabs value={ value } onChange={ handleChange } aria-label="replay tab" variant="fullWidth">
                    <Tab label="Trip View" { ...a11yProps(0) } className="replay-tab" />
                    <Tab label="Vehicle View" { ...a11yProps(1) } className="replay-tab" />
                </Tabs>
            </Box>
            <TabPanel value={ value } index={ 0 }>
                { props.renderTripView() }
            </TabPanel>
            <TabPanel value={ value } index={ 1 }>
                { props.vehicleStatusHeader }
                <VehicleStatusView
                    handleMouseEnter={ handleMouseEnter }
                    handleMouseLeave={ handleMouseLeave }
                    handleMouseClick={ handleMouseClick } />
            </TabPanel>
        </section>
    );
};

ReplaySubTab.propTypes = {
    vehicleEventsTotalResult: PropTypes.number.isRequired,
    renderTripView: PropTypes.func.isRequired,
    vehicleStatusHeader: PropTypes.object,
    handleMouseEnter: PropTypes.func.isRequired,
    handleMouseLeave: PropTypes.func.isRequired,
    handleMouseClick: PropTypes.func.isRequired,
    clearCurrentTrip: PropTypes.func.isRequired,
    setVehicleViewTabStatus: PropTypes.func.isRequired,
    isRedirected: PropTypes.bool,
};

ReplaySubTab.defaultProps = {
    isRedirected: false,
    vehicleStatusHeader: null,
};

export default connect(
    state => ({
        vehicleEventsTotalResult: getVehicleEventsDisplayedTotalResults(state),
        isRedirected: getTripReplayRedirected(state),
    }),
    {
        clearCurrentTrip,
        setVehicleViewTabStatus,
    },
)(ReplaySubTab);
