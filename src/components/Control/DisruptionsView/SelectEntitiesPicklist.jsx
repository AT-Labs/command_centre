import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { Button } from 'reactstrap';

import PickList from '../../Common/PickList/PickList';
import { getAllRoutes } from '../../../redux/selectors/static/routes';
import { getAllStops } from '../../../redux/selectors/static/stops';

const SelectEntitiesPicklist = props => (
    <div className="disruption-creation__wizard-select-routes">
        <div className="row my-3">
            <div className="col">
                <PickList
                    staticItemList={ props.type === 'routes' ? props.allRoutes : props.stops }
                    selectedValues={ props.data[props.type === 'routes' ? 'affectedRoutes' : 'affectedStops'] }
                    valueKey={ props.type === 'routes' ? 'route_id' : 'stop_id' }
                    labelKey={ props.type === 'routes' ? 'route_short_name' : 'stop_code' }
                    onChange={ selectedItem => props.onDataUpdate(selectedItem) }
                    minValueLength={ 1 }
                    leftPaneLabel={ `Find ${props.type}` }
                    leftPaneClassName="cc__picklist-pane-left"
                    leftPanePlaceholder={ `Search ${props.type}:` }
                    rightPanelShowSearch={ false }
                    rightPaneLabel={ `Selected ${props.type}:` }
                    rightPaneClassName="cc__picklist-pane-right" />
            </div>
        </div>
        <footer className="row justify-content-between">
            <div className="col-4">
                <Button
                    className="btn cc-btn-secondary btn-block"
                    onClick={ () => props.onClose() }>
                    { props.cancelButtonLabel}
                </Button>
            </div>
            <div className="col-4">
                <Button
                    className="btn cc-btn-secondary btn-block"
                    onClick={ () => props.onSubmit() }>
                    { props.continueButtonLabel}
                </Button>
            </div>
        </footer>
    </div>
);

SelectEntitiesPicklist.propTypes = {
    data: PropTypes.object,
    onDataUpdate: PropTypes.func,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    allRoutes: PropTypes.array.isRequired,
    stops: PropTypes.array.isRequired,
    cancelButtonLabel: PropTypes.string,
    continueButtonLabel: PropTypes.string,
    type: PropTypes.string,
};

SelectEntitiesPicklist.defaultProps = {
    data: {},
    onClose: () => {},
    onSubmit: () => {},
    onDataUpdate: () => {},
    cancelButtonLabel: 'Cancel and close',
    continueButtonLabel: 'Continue',
    type: 'routes',
};

const minimalRoutes = (state) => {
    const allRoutes = getAllRoutes(state);
    return _.map(allRoutes, route => _.pick(route, ['route_id', 'route_short_name', 'route_type']));
};
const minimalStops = (state) => {
    const allStops = getAllStops(state);
    return _.map(allStops, v => _.pick(v, ['stop_id', 'stop_code']));
};

export default connect(state => ({
    allRoutes: minimalRoutes(state),
    stops: minimalStops(state),
}))(SelectEntitiesPicklist);
