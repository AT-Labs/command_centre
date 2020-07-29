import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import { getActiveRealTimeDetailView } from '../../../redux/selectors/navigation';
import { shouldGetActiveRealTimeDetailView } from '../../../redux/selectors/realtime/detail';
import VIEW_TYPE from '../../../types/view-types';
import RouteDetailView from './RouteDetailView/RouteDetailView';
import StopDetailView from './StopDetailView/StopDetailView';
import VehicleDetailView from './VehicleDetailView/VehicleDetailView';

const DetailView = props => (
    props.shouldShowDetailView && (
        <section className="detail-view flex-grow-1 overflow-y-auto border-top">
            { props.activeRealTimeDetailView === VIEW_TYPE.REAL_TIME_DETAIL.STOP && <StopDetailView /> }
            { props.activeRealTimeDetailView === VIEW_TYPE.REAL_TIME_DETAIL.ROUTE && <RouteDetailView /> }
            { props.activeRealTimeDetailView === VIEW_TYPE.REAL_TIME_DETAIL.VEHICLE && <VehicleDetailView /> }
        </section>
    )
);

DetailView.propTypes = {
    activeRealTimeDetailView: PropTypes.string.isRequired,
    shouldShowDetailView: PropTypes.bool.isRequired,
};

export default connect(
    state => ({
        activeRealTimeDetailView: getActiveRealTimeDetailView(state),
        shouldShowDetailView: shouldGetActiveRealTimeDetailView(state),
    }),
)(DetailView);
