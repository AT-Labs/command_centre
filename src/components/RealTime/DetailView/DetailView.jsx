import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash-es';
import { getActiveRealTimeDetailView } from '../../../redux/selectors/navigation';
import { getSelectedSearchResults } from '../../../redux/selectors/realtime/detail';
import { isSearchBarFocus } from '../../../redux/selectors/search';
import { updateRealTimeDetailView } from '../../../redux/actions/navigation';
import { clearDetail } from '../../../redux/actions/realtime/detail/common';
import VIEW_TYPE from '../../../types/view-types';
import StopDetailView from './StopDetailView/StopDetailView';
import VehicleDetailView from './VehicleDetailView/VehicleDetailView';
import ListDetailView from './ListDetailView/ListDetailView';
import BackHeader from '../../Common/BackHeader/BackHeader';
import SearchTips from './SearchTipsView/SearchTips';

import './DetailView.scss';

const backHeaderClassProps = {
    container: 'detail-back-header mb-3 text-left',
    button: 'detail-back-header__header mb-0',
    icon: 'detail-back-header__btn-icon mr-2',
    title: 'detail-back-header__title cc-btn-link font-weight-bold',
};

const DetailView = (props) => {
    const { DEFAULT, LIST, ROUTE, STOP, VEHICLE } = VIEW_TYPE.REAL_TIME_DETAIL;
    const isSearchResultEmpty = isEmpty(props.allSearchResults);
    useEffect(() => {
        if (![STOP, VEHICLE].includes(props.activeRealTimeDetailView)) {
            props.updateRealTimeDetailView(isSearchResultEmpty && !props.isSearchBarFocus ? DEFAULT : LIST);
        }
    }, [props.activeRealTimeDetailView, isSearchResultEmpty, props.isSearchBarFocus]);

    const backToSearch = () => {
        props.clearDetail();
        props.updateRealTimeDetailView(LIST);
    };
    return (
        <div className="detail-view-wrap flex-grow-1 overflow-y-auto d-flex flex-column">
            { [STOP, VEHICLE].includes(props.activeRealTimeDetailView) && <BackHeader text="Back to Search" classProps={ backHeaderClassProps } onClick={ backToSearch } /> }
            <section className={ `detail-view ${([LIST, ROUTE].includes(props.activeRealTimeDetailView) && isSearchResultEmpty) ? 'tips-view' : ''}` }>
                { [LIST, ROUTE].includes(props.activeRealTimeDetailView) && (isSearchResultEmpty ? <SearchTips /> : <ListDetailView />) }
                { props.activeRealTimeDetailView === STOP && <StopDetailView /> }
                { props.activeRealTimeDetailView === VEHICLE && <VehicleDetailView /> }
            </section>
        </div>

    );
};

DetailView.propTypes = {
    activeRealTimeDetailView: PropTypes.string.isRequired,
    clearDetail: PropTypes.func.isRequired,
    updateRealTimeDetailView: PropTypes.func.isRequired,
    allSearchResults: PropTypes.object.isRequired,
    isSearchBarFocus: PropTypes.bool.isRequired,
};

export default connect(
    state => ({
        activeRealTimeDetailView: getActiveRealTimeDetailView(state),
        allSearchResults: getSelectedSearchResults(state),
        isSearchBarFocus: isSearchBarFocus(state),
    }), { clearDetail, updateRealTimeDetailView },
)(DetailView);
