import React from 'react';
import PropTypes from 'prop-types';
import { capitalize } from 'lodash-es';
import { connect } from 'react-redux';
import { Card, CardHeader } from 'reactstrap';
import { getSelectedSearchResults, getViewDetailKey } from '../../../../redux/selectors/realtime/detail';
import { updateSearchResultCheckStatus, updateViewDetailKey, clearDetail } from '../../../../redux/actions/realtime/detail/common';
import { routeChecked, routeSelected } from '../../../../redux/actions/realtime/detail/route';
import { stopSelected, stopChecked } from '../../../../redux/actions/realtime/detail/stop';
import { vehicleSelected, vehicleChecked } from '../../../../redux/actions/realtime/detail/vehicle';
import { updateRealTimeDetailView } from '../../../../redux/actions/navigation';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import VIEW_TYPE from '../../../../types/view-types';
import ListDetailItem from './ListDetailItem';
import RouteDetailView from '../RouteDetailView/RouteDetailView';


import './ListDetailView.scss';

function ListDetailView(props) {
    const { ROUTE, STOP, BUS, TRAIN, FERRY } = SEARCH_RESULT_TYPE;
    const allSelectedSearchResultList = Object.values(props.allSelectedSearchResults);
    const allSelectedSearchResultKeys = Object.keys(props.allSelectedSearchResults);
    const isCheckAllChecked = !allSelectedSearchResultList.some(searchResultItem => !searchResultItem.checked);
    const toggleDisplayAll = ({ target: { checked } }) => {
        const reducer = (accumulator, key) => {
            accumulator[key] = { checked };
            return accumulator;
        };
        props.updateSearchResultCheckStatus(allSelectedSearchResultKeys.reduce(reducer, {}));
        if (!checked) {
            props.updateViewDetailKey('');
        }
    };

    const toggleEntityCheck = ({ target: { checked } }, entity, checkedFunction) => {
        props.updateSearchResultCheckStatus({ [entity.key]: { checked } });
        if (checked) {
            checkedFunction(entity);
        } else if (props.viewDetailKey === entity.key) {
            props.clearDetail();
            props.updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.LIST);
        }
    };

    const toggleRouteExpand = (entity) => {
        if (props.viewDetailKey !== entity.key) {
            props.routeSelected(entity);
        } else {
            props.clearDetail();
            props.updateRealTimeDetailView(VIEW_TYPE.REAL_TIME_DETAIL.LIST);
        }
    };

    const vehicleItemProps = {
        title: entity => `${capitalize(entity.searchResultType)}  ${entity.label}`,
        onCheckboxChange: (target, entity) => toggleEntityCheck(target, entity, props.vehicleChecked),
        onButtonClick: entity => props.vehicleSelected(entity),
    };

    const detailItemPropsMap = {
        [ROUTE.type]: {
            title: entity => `${capitalize(entity.searchResultType)}  ${entity.route_short_name}`,
            expandable: true,
            expandedLinkText: 'Hide vehicles',
            collapsedLinkText: 'Show vehicles',
            isExpanded: entity => props.viewDetailKey === entity.key,
            cardBody: (<RouteDetailView />),
            onCheckboxChange: (target, entity) => toggleEntityCheck(target, entity, props.routeChecked),
            onButtonClick: toggleRouteExpand,
        },
        [STOP.type]: {
            title: entity => `${capitalize(entity.searchResultType)}  ${entity.stop_id} ${entity.stop_name}`,
            onCheckboxChange: (target, entity) => toggleEntityCheck(target, entity, props.stopChecked),
            onButtonClick: entity => props.stopSelected(entity),
        },
        [BUS.type]: vehicleItemProps,
        [TRAIN.type]: vehicleItemProps,
        [FERRY.type]: vehicleItemProps,
    };

    return (
        <div className="selection-container h-100">
            <Card className="selection-item" key="select-all">
                <CardHeader className="select-all border-top border-bottom-0 rounded-0">
                    <input type="checkbox" className="align-middle selection-item__checkbox" checked={ isCheckAllChecked } onChange={ toggleDisplayAll } /> Show on the map
                </CardHeader>
            </Card>
            {allSelectedSearchResultList.map((entity) => {
                const detailItemProps = detailItemPropsMap[entity.searchResultType];
                return (
                    <ListDetailItem
                        key={ entity.key }
                        checked={ entity.checked }
                        title={ detailItemProps.title(entity) }
                        expandable={ detailItemProps.expandable }
                        expandedLinkText={ detailItemProps.expandedLinkText }
                        collapsedLinkText={ detailItemProps.collapsedLinkText }
                        expanded={ detailItemProps.isExpanded && detailItemProps.isExpanded(entity) }
                        cardBody={ detailItemProps.cardBody }
                        onCheckboxChange={ target => detailItemProps.onCheckboxChange(target, entity) }
                        onButtonClick={ () => detailItemProps.onButtonClick(entity) }
                    />
                );
            })}
        </div>
    );
}

ListDetailView.propTypes = {
    allSelectedSearchResults: PropTypes.object.isRequired,
    updateSearchResultCheckStatus: PropTypes.func.isRequired,
    updateViewDetailKey: PropTypes.func.isRequired,
    viewDetailKey: PropTypes.string,
    clearDetail: PropTypes.func.isRequired,
    routeChecked: PropTypes.func.isRequired,
    routeSelected: PropTypes.func.isRequired,
    updateRealTimeDetailView: PropTypes.func.isRequired,
    stopSelected: PropTypes.func.isRequired,
    stopChecked: PropTypes.func.isRequired,
    vehicleSelected: PropTypes.func.isRequired,
    vehicleChecked: PropTypes.func.isRequired,
};

ListDetailView.defaultProps = {
    viewDetailKey: '',
};

export default connect(
    state => ({
        allSelectedSearchResults: getSelectedSearchResults(state),
        viewDetailKey: getViewDetailKey(state),
    }),
    {
        updateSearchResultCheckStatus,
        updateViewDetailKey,
        routeChecked,
        clearDetail,
        routeSelected,
        updateRealTimeDetailView,
        vehicleSelected,
        vehicleChecked,
        stopSelected,
        stopChecked,
    },
)(ListDetailView);
