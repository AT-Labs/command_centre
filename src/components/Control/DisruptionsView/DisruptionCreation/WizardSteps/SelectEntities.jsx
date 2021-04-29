/* eslint-disable no-param-reassign */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { filter } from 'lodash-es';

import PickList from '../../../../Common/PickList/PickList';
import { getMinimalRoutes } from '../../../../../redux/selectors/static/routes';
import { getMinimalStops } from '../../../../../redux/selectors/static/stops';
import { getAffectedEntities, getDisruptionsLoadingState } from '../../../../../redux/selectors/control/disruptions';
import {
    deselectAllRoutes,
    deleteAffectedEntities,
    updateCurrentStep,
    getRoutesByStop,
    updateAffectedStops,
    getRoutes,
    updateAffectedRoutesState,
} from '../../../../../redux/actions/control/disruptions';

class SelectEntities extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            entitiesToArray: this.addKeys(props.routes, props.stops),
            deselectEntities: false,
            areEntitiesSelected: false,
            setSelectedEntities: this.addKeys(this.props.selectedEntities.affectedRoutes, this.props.selectedEntities.affectedStops),
        };
    }

    addKeys = (routes, stops) => {
        const routesModified = routes.map((route) => {
            route.valueKey = 'route_id';
            route.labelKey = 'route_short_name';
            route.type = 'route';
            return route;
        });
        const stopsModified = stops.map((stop) => {
            stop.valueKey = 'stop_id';
            stop.labelKey = 'stop_code';
            stop.type = 'stop';
            return stop;
        });
        return [...routesModified, ...stopsModified];
    }

    deselectAllRoutes = () => {
        this.setState({
            areEntitiesSelected: false,
            deselectEntities: true,
            setSelectedEntities: [],
        }, this.props.deleteAffectedEntities());
    }

    onContinue = () => {
        this.props.getRoutesByStop(this.props.selectedEntities.affectedStops);
        this.props.onStepUpdate(1);
        this.props.updateCurrentStep(2);
    }

    onChange = (selectedItems) => {
        this.updateEntities(selectedItems);
        this.props.onDataUpdate('affectedEntities', selectedItems);
        this.setState({
            areEntitiesSelected: selectedItems.length > 0,
            deselectEntities: !(selectedItems.length > 0),
            setSelectedEntities: selectedItems,
        });
    }

    updateEntities = (selectedItems) => {
        if (selectedItems.length === 0) {
            this.props.updateAffectedStops([]);
            this.props.updateAffectedRoutesState([]);
            return;
        }

        const stops = filter(selectedItems, { type: 'stop' });
        const routes = filter(selectedItems, { type: 'route' });

        if (routes.length > filter(this.state.setSelectedEntities, { type: 'route' }).length) {
            this.props.getRoutes(routes);
        } else {
            this.props.updateAffectedRoutesState(routes);
        }

        this.props.updateAffectedStops(stops);

        if (routes.length === 0) {
            this.props.updateAffectedRoutesState([]);
        }
    }

    showFooter = () => this.state.areEntitiesSelected || this.state.setSelectedEntities.length > 0;

    isButtonDisabled = () => !this.showFooter() || this.props.isLoading;

    render() {
        return (
            <div className="select_disruption">
                <PickList
                    isVerticalLayout
                    height={ 100 }
                    leftPaneLabel="Search routes or stops"
                    leftPanePlaceholder="Enter a route or stop number"
                    minValueLength={ 2 }
                    onAddingOrRemoving={ this.onAddingOrRemoving }
                    onChange={ selectedItem => this.onChange(selectedItem) }
                    rightPanelShowSearch={ false }
                    rightPaneLabel="Selected routes and stops:"
                    rightPaneClassName="cc__picklist-pane-bottom pl-4 pr-4"
                    rightPaneShowCheckbox={ false }
                    staticItemList={ this.state.entitiesToArray }
                    leftPaneClassName="cc__picklist-pane-vertical"
                    width="w-100"
                    secondPaneHeight="auto"
                    deselectRoutes={ this.state.deselectEntities }
                    selectedValues={ this.state.setSelectedEntities }
                    isLoading={ this.props.isLoading }
                />
                {this.showFooter() && (
                    <footer className="row justify-content-between position-fixed p-4 m-0 select_routes-footer">
                        <div className="col-4">
                            <Button
                                className="btn cc-btn-secondary btn-block"
                                disabled={ this.isButtonDisabled() }
                                onClick={ this.deselectAllRoutes }>
                                Deselect all
                            </Button>
                        </div>
                        <div className="col-4">
                            <Button
                                className="btn cc-btn-primary btn-block p-2 continue"
                                disabled={ this.isButtonDisabled() }
                                onClick={ () => this.onContinue() }>
                                Continue
                            </Button>
                        </div>
                    </footer>
                )}
            </div>
        );
    }
}

SelectEntities.propTypes = {
    onStepUpdate: PropTypes.func,
    onDataUpdate: PropTypes.func,
    routes: PropTypes.array.isRequired,
    stops: PropTypes.array.isRequired,
    deleteAffectedEntities: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func,
    selectedEntities: PropTypes.object,
    getRoutesByStop: PropTypes.func.isRequired,
    updateAffectedStops: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    getRoutes: PropTypes.func.isRequired,
    isLoading: PropTypes.bool,
};

SelectEntities.defaultProps = {
    selectedEntities: {},
    onStepUpdate: () => {},
    onDataUpdate: () => {},
    updateCurrentStep: () => {},
    isLoading: false,
};

export default connect(state => ({
    routes: getMinimalRoutes(state),
    stops: getMinimalStops(state),
    selectedEntities: getAffectedEntities(state),
    isLoading: getDisruptionsLoadingState(state),
}), {
    deselectAllRoutes,
    deleteAffectedEntities,
    updateCurrentStep,
    getRoutesByStop,
    updateAffectedStops,
    getRoutes,
    updateAffectedRoutesState,
})(SelectEntities);
