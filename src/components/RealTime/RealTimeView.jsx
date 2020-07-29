import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';

import { getSearchTerms } from '../../redux/selectors/search';
import { addressSelected } from '../../redux/actions/realtime/detail/address';
import { routeSelected } from '../../redux/actions/realtime/detail/route';
import { stopSelected } from '../../redux/actions/realtime/detail/stop';
import { vehicleSelected } from '../../redux/actions/realtime/detail/vehicle';
import { startTrackingVehicles } from '../../redux/actions/realtime/vehicles';
import { shouldGetActiveRealTimeDetailView } from '../../redux/selectors/realtime/detail';
import { getRealTimeSidePanelIsOpen, getRealTimeSidePanelIsActive } from '../../redux/selectors/navigation';
import SEARCH_RESULT_TYPE from '../../types/search-result-types';
import Main from '../Common/OffCanvasLayout/Main/Main';
import OffCanvasLayout from '../Common/OffCanvasLayout/OffCanvasLayout';
import SidePanel from '../Common/OffCanvasLayout/SidePanel/SidePanel';
import SecondarySidePanel from '../Common/OffCanvasLayout/SecondarySidePanel/SecondarySidePanel';
import Footer from './Footer/Footer';
import OmniSearch, { defaultTheme } from '../OmniSearch/OmniSearch';
import DetailView from './DetailView/DetailView';
import RealTimeMap from './RealTimeMap/RealTimeMap';
import VehicleFilters from './VehicleFilters/VehicleFilters';
import ErrorAlerts from './ErrorAlert/ErrorAlerts';
import Feedback from './Feedback/Feedback';

import './RealTimeView.scss';

class RealTimeView extends PureComponent {
    static propTypes = {
        addressSelected: PropTypes.func.isRequired,
        stopSelected: PropTypes.func.isRequired,
        routeSelected: PropTypes.func.isRequired,
        vehicleSelected: PropTypes.func.isRequired,
        shouldShowDetailView: PropTypes.bool.isRequired,
        startTrackingVehicles: PropTypes.func.isRequired,
        searchTerms: PropTypes.string.isRequired,
        isSidePanelOpen: PropTypes.bool.isRequired,
        isSidePanelActive: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);

        this.realtimeTracker = null;
    }

    componentDidMount = () => {
        this.realtimeTracker = this.props.startTrackingVehicles();
    }

    componentWillUnmount = () => {
        if (!_.isEmpty(this.realtimeTracker)) {
            this.realtimeTracker.stop();
        }
    }

    render() {
        const { ADDRESS, ROUTE, STOP, BUS, TRAIN, FERRY } = SEARCH_RESULT_TYPE;
        return (
            <OffCanvasLayout>
                <SidePanel
                    isOpen={ this.props.isSidePanelOpen }
                    isActive={ this.props.isSidePanelActive }
                    className="real-time-primary-panel">
                    <OmniSearch
                        theme={
                            {
                                ...defaultTheme,
                                input: 'search__input form-control cc-form-control',
                            }
                        }
                        value={ this.props.searchTerms }
                        placeholder="Search the map"
                        searchInCategory={ [ROUTE.type, STOP.type, ADDRESS.type, BUS.type, TRAIN.type, FERRY.type] }
                        selectionHandlers={ {
                            [ADDRESS.type]: ({ data }) => this.props.addressSelected(data),
                            [STOP.type]: ({ data }) => this.props.stopSelected(data),
                            [ROUTE.type]: ({ data }) => this.props.routeSelected(data),
                            [BUS.type]: ({ data }) => this.props.vehicleSelected(data),
                            [TRAIN.type]: ({ data }) => this.props.vehicleSelected(data),
                            [FERRY.type]: ({ data }) => this.props.vehicleSelected(data),
                        } }
                        clearHandlers={ {
                            [ADDRESS.type]: () => this.props.addressSelected({}),
                            [STOP.type]: _.noop,
                            [ROUTE.type]: _.noop,
                            [BUS.type]: _.noop,
                            [TRAIN.type]: _.noop,
                            [FERRY.type]: _.noop,
                        } } />
                    { this.props.shouldShowDetailView && (
                        <React.Fragment>
                            <DetailView />
                            <Footer />
                        </React.Fragment>
                    )}
                </SidePanel>
                <Main className="real-time-view d-flex">
                    <RealTimeMap />
                    <ErrorAlerts />
                    <VehicleFilters />
                    <Feedback />
                </Main>
                <SecondarySidePanel />
            </OffCanvasLayout>
        );
    }
}

export default connect(
    state => ({
        shouldShowDetailView: shouldGetActiveRealTimeDetailView(state),
        isSidePanelOpen: getRealTimeSidePanelIsOpen(state),
        isSidePanelActive: getRealTimeSidePanelIsActive(state),
        searchTerms: getSearchTerms(state),
    }), { addressSelected, stopSelected, routeSelected, startTrackingVehicles, vehicleSelected },
)(RealTimeView);
