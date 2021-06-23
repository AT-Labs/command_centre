import React from 'react';
import { connect } from 'react-redux';
import { PropTypes } from 'prop-types';
import { isEmpty, uniqBy, isEqual } from 'lodash-es';
import { FormGroup } from 'reactstrap';

import {
    getAffectedStops,
    getAffectedRoutes,
    getRoutesByStop,
    getDisruptionsLoadingState,
    isEditEnabled,
    getDisruptionAction,
    getDisruptionToEdit,
} from '../../../../../redux/selectors/control/disruptions';
import {
    showAndUpdateAffectedRoutes,
    updateAffectedStopsState,
    toggleDisruptionModals,
    updateCurrentStep,
    openCreateDisruption,
    updateDisruption,
    updateRoutesByStop,
    updateAffectedRoutesState,
} from '../../../../../redux/actions/control/disruptions';
import Footer from './Footer';
import { EntityCheckbox } from './EntityCheckbox';
import Loader from '../../../../Common/Loader/Loader';
import { buildSubmitBody } from '../../../../../utils/control/disruptions';

const ENTITIES_TYPES = {
    SELECTED_ROUTES: 'selectedRoutes',
    SELECTED_STOPS: 'selectedStops',
    SELECTED_ROUTES_BY_STOPS: 'selectedRoutesByStops',
    ROUTE_ID: 'routeId',
    STOP_ID: 'stopId',
};

class SelectAffectedEntities extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedRoutes: this.addKeys(this.props.routes),
            selectedStops: this.addKeys(this.props.stops),
            selectedRoutesByStops: [],
            isSelectedAll: false,
            isModalOpen: false,
        };
    }

    componentDidMount() {
        this.setRoutesByStop();
    }

    componentDidUpdate(prevProps) {
        if (!isEqual(prevProps.routesByStop, this.props.routesByStop)) {
            this.setRoutesByStop();
        }
    }

    addKeys = entities => entities.map((entity) => {
        const newEntity = entity;
        newEntity.checked = true;
        return newEntity;
    })

    setRoutesByStop = () => {
        const routes = Object.values(this.props.routesByStop);
        if (routes.length > 0) {
            const selectedRoutesByStops = uniqBy(routes.flat(), ENTITIES_TYPES.ROUTE_ID);
            const routesIds = this.state.selectedRoutes.map(route => route[ENTITIES_TYPES.ROUTE_ID]);
            selectedRoutesByStops.forEach((selectedRoute) => {
                const currentRoute = selectedRoute;
                currentRoute.checked = !!routesIds.find(id => id === currentRoute[ENTITIES_TYPES.ROUTE_ID]);
            });
            this.setState({ selectedRoutesByStops });
        }
    }

    addOrRemoveRoutes = (entities, isChecked) => {
        this.addOrRemoveEntities(
            ENTITIES_TYPES.SELECTED_ROUTES,
            entities,
            ENTITIES_TYPES.ROUTE_ID,
            isChecked,
        );
        this.addOrRemoveEntities(
            ENTITIES_TYPES.SELECTED_ROUTES_BY_STOPS,
            entities,
            ENTITIES_TYPES.ROUTE_ID,
            isChecked,
        );
    }

    handleOnChangeEntities = (e, entity) => {
        e.persist();
        const isChecked = e.target.checked;
        const asEntities = [entity];
        if (this.isRouteType(entity)) {
            this.addOrRemoveRoutes(asEntities, isChecked);
            this.props.showAndUpdateAffectedRoutes(isChecked
                ? uniqBy([...this.props.routes, ...asEntities])
                : this.removeFromList(this.props.routes, asEntities, ENTITIES_TYPES.ROUTE_ID), true);
        } else {
            this.addOrRemoveEntities(
                ENTITIES_TYPES.SELECTED_STOPS,
                asEntities,
                ENTITIES_TYPES.STOP_ID,
                isChecked,
            );
            this.props.updateAffectedStopsState(isChecked
                ? uniqBy([...this.props.stops, ...asEntities])
                : this.removeFromList(this.props.stops, asEntities, ENTITIES_TYPES.STOP_ID), true);
        }
    }

    addOrRemoveEntities = (stateEntityName, entities, propIdType, isChecked) => {
        this.setState(prevState => ({
            [stateEntityName]: prevState[stateEntityName].map((entity) => {
                const tempEntity = entity;
                if (entities.find(e => e[propIdType] === tempEntity[propIdType])) {
                    tempEntity.checked = isChecked;
                }
                return tempEntity;
            }),
        }));
    }

    isRouteType = entity => Object.keys(entity).includes(ENTITIES_TYPES.ROUTE_ID);

    removeFromList = (items, entities, valueKey) => items.filter(item => !entities.find(entity => entity[valueKey] === item[valueKey]));

    renderRoutesByStop = (stopId) => {
        if (!isEmpty(this.props.routesByStop) && this.props.routesByStop[stopId] && !isEmpty(this.state.selectedRoutesByStops)) {
            return this.props.routesByStop[stopId].map((route) => {
                const currentRoute = this.state.selectedRoutesByStops.find(sr => sr[ENTITIES_TYPES.ROUTE_ID] === route[ENTITIES_TYPES.ROUTE_ID]);
                const isChecked = currentRoute && currentRoute.checked ? currentRoute.checked : false;
                return (
                    <li key={ `${stopId}-${route[ENTITIES_TYPES.ROUTE_ID]}` }>
                        <EntityCheckbox
                            checked={ isChecked }
                            onChange={ (e) => {
                                this.addOrRemoveRoutes([route], e.target.checked);
                                this.props.showAndUpdateAffectedRoutes(e.target.checked
                                    ? uniqBy([...this.props.routes, route])
                                    : this.removeFromList(this.props.routes, [route], ENTITIES_TYPES.ROUTE_ID), true);
                            } }
                            label={ route.routeShortName }
                        />
                    </li>
                );
            });
        }
        return [];
    }

    onSelectAll = (e) => {
        e.persist();
        const isChecked = e.target.checked;
        this.setState({ isSelectedAll: isChecked });

        const routesByStop = this.state.selectedRoutesByStops.filter(entity => entity.checked !== isChecked);
        this.addOrRemoveEntities(ENTITIES_TYPES.SELECTED_ROUTES_BY_STOPS, routesByStop, ENTITIES_TYPES.ROUTE_ID, isChecked);

        const routes = this.state.selectedRoutes.filter(entity => entity.checked !== isChecked);
        this.addOrRemoveEntities(ENTITIES_TYPES.SELECTED_ROUTES, routes, ENTITIES_TYPES.ROUTE_ID, isChecked);

        this.props.showAndUpdateAffectedRoutes(isChecked
            ? uniqBy([...this.props.routes, ...routesByStop, ...routes], ENTITIES_TYPES.ROUTE_ID)
            : this.removeFromList(this.props.routes, this.props.routes, ENTITIES_TYPES.ROUTE_ID), true);

        const stops = this.state.selectedStops.filter(entity => entity.checked !== isChecked);
        this.addOrRemoveEntities(ENTITIES_TYPES.SELECTED_STOPS, stops, ENTITIES_TYPES.STOP_ID, isChecked);
        this.props.updateAffectedStopsState(isChecked
            ? uniqBy([...this.props.stops, ...stops])
            : this.removeFromList(this.props.stops, stops, ENTITIES_TYPES.STOP_ID), true);
    }

    onContinue = () => {
        if (!this.props.isEditMode) {
            this.props.onStepUpdate(2);
            this.props.updateCurrentStep(3);
        } else {
            const disruptionRequest = buildSubmitBody(this.props.disruptionToEdit, this.props.routes, this.props.stops);
            this.props.updateAffectedRoutesState(disruptionRequest.affectedEntities.filter(entity => entity.routeId));
            this.props.updateDisruption(disruptionRequest);
            this.props.openCreateDisruption(false);
            this.props.toggleDisruptionModals('isConfirmationOpen', true);
        }
    }

    onBack = () => {
        if (this.isAllUnselected()) {
            this.props.updateRoutesByStop({}, false);
        }
        this.props.updateCurrentStep(1);
        this.props.onStepUpdate(0);
    }

    isAllSelected = () => {
        const allRouteSelected = !this.state.selectedStops.some(stop => stop.checked === false || stop.checked === undefined);
        const allStopSelected = !this.state.selectedRoutes.some(route => route.checked === false || route.checked === undefined);
        const allRoutesByStops = this.state.selectedRoutesByStops ? !this.state.selectedRoutesByStops.some(route => route.checked === false || route.checked === undefined) : false;
        return allRouteSelected && allStopSelected && allRoutesByStops;
    }

    isAllUnselected = () => {
        const allRouteUnselected = this.state.selectedStops.every(stop => !stop.checked);
        const allStopSelectedUnselected = this.state.selectedRoutes.every(route => !route.checked);
        const allRoutesByStopsUnselected = this.state.selectedRoutesByStops ? this.state.selectedRoutesByStops.every(route => !route.checked) : true;
        return allRouteUnselected && allStopSelectedUnselected && allRoutesByStopsUnselected;
    }

    render() {
        return (
            <div className="select_entities">
                <div className="border-bottom mr-4 ml-4 mt-3 select_entities__subtitle">
                    <h4 className="pt-3">Select affected routes and stops</h4>
                    <div className="mt-3 checkbox-container">
                        <EntityCheckbox
                            checked={ this.isAllSelected() }
                            onChange={ e => this.onSelectAll(e) }
                            label="Select All"
                        />
                    </div>
                </div>
                <div className="p-4">
                    <div>
                        <ul className="p-0">
                            {this.state.selectedRoutes.map(route => (
                                <li className="border-bottom pb-3 pt-3" key={ route[ENTITIES_TYPES.ROUTE_ID] }>
                                    <FormGroup>
                                        <EntityCheckbox
                                            checked={ route.checked }
                                            onChange={ e => this.handleOnChangeEntities(e, route) }
                                            label={ route.routeShortName }
                                        />
                                    </FormGroup>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <ul className="p-0">
                            {!isEmpty(this.state.selectedStops) && this.state.selectedStops.map(stop => (
                                <li className="border-bottom pb-3 pt-3" key={ stop.stopId }>
                                    <FormGroup>
                                        <EntityCheckbox
                                            checked={ stop.checked }
                                            onChange={ e => this.handleOnChangeEntities(e, stop) }
                                            label={ `Stop ${stop.stopCode}` }
                                        />
                                        <ul className="disruption-creation__wizard-select-details__selected-routes p-0 mt-3">
                                            { !this.props.isLoading
                                                ? (this.renderRoutesByStop(stop.stopId)
                                                ) : <Loader className="loader-disruptions loader-disruptions-list position-absolute" />}
                                        </ul>
                                    </FormGroup>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
                <Footer
                    updateCurrentStep={ this.props.updateCurrentStep }
                    onStepUpdate={ this.props.onStepUpdate }
                    toggleDisruptionModals={ this.props.toggleDisruptionModals }
                    nextButtonValue={ this.props.isEditMode ? 'Save' : 'Continue' }
                    onContinue={ this.onContinue }
                    onBack={ () => this.onBack() }
                    isSubmitEnabled={ this.isAllUnselected() } />
            </div>
        );
    }
}

SelectAffectedEntities.propTypes = {
    stops: PropTypes.array,
    routes: PropTypes.array,
    showAndUpdateAffectedRoutes: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    routesByStop: PropTypes.object,
    toggleDisruptionModals: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func.isRequired,
    onStepUpdate: PropTypes.func,
    isLoading: PropTypes.bool,
    updateRoutesByStop: PropTypes.func.isRequired,
    isEditMode: PropTypes.bool,
    openCreateDisruption: PropTypes.func.isRequired,
    updateDisruption: PropTypes.func.isRequired,
    disruptionToEdit: PropTypes.object,
    updateAffectedRoutesState: PropTypes.func.isRequired,
};

SelectAffectedEntities.defaultProps = {
    stops: [],
    routes: [],
    routesByStop: {},
    onStepUpdate: () => {},
    isLoading: false,
    isEditMode: false,
    disruptionToEdit: {},
};

export default connect(state => ({
    stops: getAffectedStops(state),
    routes: getAffectedRoutes(state),
    routesByStop: getRoutesByStop(state),
    isLoading: getDisruptionsLoadingState(state),
    isEditMode: isEditEnabled(state),
    action: getDisruptionAction(state),
    disruptionToEdit: getDisruptionToEdit(state),
}), {
    showAndUpdateAffectedRoutes,
    updateAffectedStopsState,
    toggleDisruptionModals,
    updateCurrentStep,
    openCreateDisruption,
    updateDisruption,
    updateRoutesByStop,
    updateAffectedRoutesState,
})(SelectAffectedEntities);
