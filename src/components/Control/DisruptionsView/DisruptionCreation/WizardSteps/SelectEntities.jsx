/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
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

const SelectEntities = (props) => {
    const addKeys = (routes, stops) => {
        const routesModified = routes.map((route) => {
            if (props.isEditMode && !route.routeType) {
                const foundRoute = props.routes.find(({ routeId }) => routeId === route.routeId);
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
    };

    const [areEntitiesSelected, setAreEntitiesSelected] = useState(false);
    const [affectedEntities, setAffectedEntities] = useState(addKeys(props.affectedRoutes, props.affectedStops));
    const [allRoutesAndStopsEntities, setAllRoutesAndStopsEntities] = useState(addKeys(props.routes, props.stops));

    const filterEntitiesByType = (entities, type) => filter(entities, { type });

    const updateSelectedItems = (selectedItems) => {
        props.onDataUpdate('affectedEntities', selectedItems);
        setAreEntitiesSelected(selectedItems.length > 0);
        setAffectedEntities(selectedItems);
    };

    useEffect(() => {
        const stops = filterEntitiesByType(allRoutesAndStopsEntities, 'stop');
        const routes = filterEntitiesByType(allRoutesAndStopsEntities, 'route');

        const filteredStops = filter(stops, stop => !props.affectedStops.map(affectedStop => affectedStop.routeId).includes(stop.stopId));
        const newEntities = addKeys(props.affectedRoutes, props.affectedStops);
        updateSelectedItems(newEntities);
        setAllRoutesAndStopsEntities([...routes, ...filteredStops]);
    }, [props.affectedRoutes, props.affectedStops]);


    const deselectAllEntities = () => {
        setAreEntitiesSelected(false);
        setAffectedEntities([]);
        props.deleteAffectedEntities();
    };

    const onContinue = () => {
        props.getRoutesByStop(props.affectedStops);
        props.onStepUpdate(1);
        props.updateCurrentStep(2);
    };

    const updateEntities = (selectedItems) => {
        const stops = filter(selectedItems, { type: 'stop' });
        const routes = filter(selectedItems, { type: 'route' });

        props.updateAffectedStopsState(stops);

        if (routes.length !== props.affectedRoutes.length) {
            props.updateAffectedRoutesState(routes);
            props.getRoutesByShortName(routes);
        }
    };

    const onChange = (selectedItems) => {
        updateEntities(selectedItems);
        props.onDataUpdate('affectedEntities', selectedItems);
        setAreEntitiesSelected(selectedItems.length > 0);
        setAffectedEntities(selectedItems);
    };

    const showFooter = () => areEntitiesSelected || affectedEntities.length > 0;

    const isButtonDisabled = () => !showFooter() || props.isLoading;

    return (
        <div className="select_disruption">
            <PickList
                isVerticalLayout
                height={ 100 }
                leftPaneLabel="Search routes or stops"
                leftPanePlaceholder="Enter a route or stop number"
                minValueLength={ 2 }
                onChange={ selectedItem => onChange(selectedItem) }
                rightPanelShowSearch={ false }
                rightPaneLabel="Selected routes and stops:"
                rightPaneClassName="cc__picklist-pane-bottom pl-4 pr-4"
                rightPaneShowCheckbox={ false }
                staticItemList={ allRoutesAndStopsEntities }
                leftPaneClassName="cc__picklist-pane-vertical"
                width="w-100"
                secondPaneHeight="auto"
                deselectRoutes={ !areEntitiesSelected }
                selectedValues={ affectedEntities }
                isLoading={ props.isLoading }
            />
            <footer className="row justify-content-between position-fixed p-4 m-0 disruptions-creation__wizard-footer">
                <div className="col-4">
                    {affectedEntities.length > 0 && (
                        <Button
                            className="btn cc-btn-secondary btn-block"
                            disabled={ isButtonDisabled() }
                            onClick={ deselectAllEntities }>
                            Deselect all
                        </Button>
                    )}
                </div>
                <div className="col-4">
                    {affectedEntities.length > 0 && (
                        <Button
                            className="btn cc-btn-primary btn-block p-2 continue"
                            disabled={ isButtonDisabled() }
                            onClick={ () => onContinue() }>
                            Continue
                        </Button>
                    )}
                </div>
            </footer>
        </div>
    );
};

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
