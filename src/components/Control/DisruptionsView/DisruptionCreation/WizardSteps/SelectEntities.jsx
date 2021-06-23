/* eslint-disable no-param-reassign */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { filter } from 'lodash-es';

import PickList from '../../../../Common/PickList/PickList';
import { getMinimalRoutes } from '../../../../../redux/selectors/static/routes';
import { getMinimalStops } from '../../../../../redux/selectors/static/stops';
import { getAffectedRoutes, getAffectedStops, getDisruptionsLoadingState, isEditEnabled } from '../../../../../redux/selectors/control/disruptions';
import {
    deselectAllRoutes,
    deleteAffectedEntities,
    updateCurrentStep,
    getRoutesByStop,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
} from '../../../../../redux/actions/control/disruptions';
import { toCamelCaseKeys } from '../../../../../utils/control/disruptions';

class SelectEntities extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            deselectEntities: false,
            areEntitiesSelected: false,
            affectedEntities: this.addKeys(this.props.affectedRoutes, this.props.affectedStops),
            allRoutesAndStopsEntities: this.addKeys(props.routes, props.stops),
        };
    }

    addKeys = (routes, stops) => {
        const routesModified = routes.map((route) => {
            if (this.props.isEditMode && !route.routeType) {
                const foundRoute = this.props.routes.find(({ routeId }) => routeId === route.routeId);
                route.routeType = foundRoute.routeType;
            }
            route.valueKey = 'routeId';
            route.labelKey = 'routeShortName';
            route.type = 'route';
            return route;
        });
        const stopsModified = stops.map((stop) => {
            stop.valueKey = 'stopId';
            stop.labelKey = 'stopCode';
            stop.type = 'stop';
            return stop;
        });
        return [...routesModified, ...stopsModified];
    }

    deselectAllRoutes = () => {
        this.setState({
            areEntitiesSelected: false,
            deselectEntities: true,
            affectedEntities: [],
        }, this.props.deleteAffectedEntities());
    }

    onContinue = () => {
        this.props.getRoutesByStop(this.props.affectedStops);
        this.props.onStepUpdate(1);
        this.props.updateCurrentStep(2);
    }

    onChange = (selectedItems) => {
        this.updateEntities(selectedItems);
        this.props.onDataUpdate('affectedEntities', selectedItems);
        this.setState({
            areEntitiesSelected: selectedItems.length > 0,
            deselectEntities: selectedItems.length === 0,
            affectedEntities: selectedItems,
        });
    }

    updateEntities = (selectedItems) => {
        const stops = filter(selectedItems, { type: 'stop' });
        const routes = filter(selectedItems, { type: 'route' });

        this.props.updateAffectedStopsState(stops);

        if (routes.length !== this.props.affectedRoutes.length) {
            this.props.updateAffectedRoutesState(routes);
            this.props.getRoutesByShortName(routes);
        }
    }

    showFooter = () => this.state.areEntitiesSelected || this.state.affectedEntities.length > 0;

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
                    staticItemList={ this.state.allRoutesAndStopsEntities }
                    leftPaneClassName="cc__picklist-pane-vertical"
                    width="w-100"
                    secondPaneHeight="auto"
                    deselectRoutes={ this.state.deselectEntities }
                    selectedValues={ this.state.affectedEntities }
                    isLoading={ this.props.isLoading }
                />
                <footer className="row justify-content-between position-fixed p-4 m-0 disruptions-creation__wizard-footer">
                    <div className="col-4">
                        {this.state.affectedEntities.length > 0 && (
                            <Button
                                className="btn cc-btn-secondary btn-block"
                                disabled={ this.isButtonDisabled() }
                                onClick={ this.deselectAllRoutes }>
                                Deselect all
                            </Button>
                        )}
                    </div>
                    <div className="col-4">
                        {this.state.affectedEntities.length > 0 && (
                            <Button
                                className="btn cc-btn-primary btn-block p-2 continue"
                                disabled={ this.isButtonDisabled() }
                                onClick={ () => this.onContinue() }>
                                Continue
                            </Button>
                        )}
                    </div>
                </footer>
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
    getRoutesByStop: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    getRoutesByShortName: PropTypes.func.isRequired,
    affectedRoutes: PropTypes.array.isRequired,
    affectedStops: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    isEditMode: PropTypes.bool.isRequired,
};

SelectEntities.defaultProps = {
    onStepUpdate: () => {},
    onDataUpdate: () => {},
    updateCurrentStep: () => {},
};

export default connect(state => ({
    affectedStops: getAffectedStops(state),
    affectedRoutes: getAffectedRoutes(state),
    routes: toCamelCaseKeys(getMinimalRoutes(state)),
    stops: toCamelCaseKeys(getMinimalStops(state)),
    isLoading: getDisruptionsLoadingState(state),
    isEditMode: isEditEnabled(state),
}), {
    deselectAllRoutes,
    deleteAffectedEntities,
    updateCurrentStep,
    getRoutesByStop,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
})(SelectEntities);
