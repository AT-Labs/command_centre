import * as React from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { connect } from 'react-redux';
import VehicleStatusView from './VehicleStatusView';
import { getVehicleReplaysTotalResults } from '../../../../redux/selectors/control/vehicleReplay';

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
    const [value, setValue] = React.useState(0);

    const handleChange = (_event, newValue) => {
        setValue(newValue);
    };

    return (
        <section>
            <Box sx={ { borderBottom: 1, borderColor: 'divider' } }>
                <Tabs value={ value } onChange={ handleChange } aria-label="replay tab" variant="fullWidth">
                    <Tab label="Trip View" { ...a11yProps(0) } className="tab" />
                    <Tab label="Vehicle View" { ...a11yProps(1) } className="tab" />
                </Tabs>
            </Box>
            <TabPanel value={ value } index={ 0 }>
                { props.renderTripView() }
            </TabPanel>
            <TabPanel value={ value } index={ 1 }>
                <div className="px-4 mt-3 mb-3">
                    <dd>
                        Showing
                        {' '}
                        { props.vehicleReplaysTotalStatus}
                        {' '}
                        statuses
                    </dd>
                </div>
                <VehicleStatusView />
            </TabPanel>
        </section>
    );
};

ReplaySubTab.propTypes = {
    vehicleReplaysTotalStatus: PropTypes.number,
    renderTripView: PropTypes.func.isRequired,
};

ReplaySubTab.defaultProps = {
    vehicleReplaysTotalStatus: 0,
};

export default connect(
    state => ({
        vehicleReplaysTotalStatus: getVehicleReplaysTotalResults(state),
    }),
)(ReplaySubTab);
