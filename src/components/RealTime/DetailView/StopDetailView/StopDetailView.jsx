import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { connect } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap';
import classnames from 'classnames';

import { getStopDetail } from '../../../../redux/selectors/realtime/detail';
import Routes from './Routes';
import StopDetails from './StopDetails';
import PastVehicles from './VehicleSchedule/PastVehicles';
import UpcomingVehicles from './VehicleSchedule/UpcomingVehicles';
import PidInformation from './VehicleSchedule/PidInformation';
import './StopDetailView.scss';

const StopDetailView = ({ stopDetail }) => {
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab) => {
        if (activeTab !== tab) setActiveTab(tab);
    };

    if (!stopDetail || !stopDetail.stop_code || !stopDetail.stop_id) return null;

    return (
        <section className="stop-detail-view">
            <StopDetails />

            <Nav tabs className="cc-tabs mb-3">
                <NavItem>
                    <NavLink
                        className={ classnames('cc-nav-link', { active: activeTab === '1' }) }
                        onClick={ () => { toggle('1'); } }
                    >
                        Stop Information
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={ classnames('cc-nav-link', { active: activeTab === '2' }) }
                        onClick={ () => { toggle('2'); } }
                    >
                        PID Information
                    </NavLink>
                </NavItem>
            </Nav>

            <TabContent activeTab={ activeTab }>
                <TabPane tabId="1">
                    <UpcomingVehicles stopId={ stopDetail.stop_id } />
                    <PastVehicles stopId={ stopDetail.stop_id } />
                    <Routes />
                </TabPane>
                <TabPane tabId="2">
                    <PidInformation stopCode={ stopDetail.stop_code } />
                </TabPane>
            </TabContent>
        </section>
    );
};

StopDetailView.propTypes = {
    stopDetail: PropTypes.object,
};

StopDetailView.defaultProps = {
    stopDetail: undefined,
};

export default connect(
    state => ({
        stopDetail: getStopDetail(state),
    }),
)(StopDetailView);
