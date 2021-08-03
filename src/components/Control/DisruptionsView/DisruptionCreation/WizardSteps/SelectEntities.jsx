/* eslint-disable no-param-reassign */
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { filter } from 'lodash-es';

import PickList from '../../../../Common/PickList/PickList';
import { getAffectedRoutes, getAffectedStops, getDisruptionsLoadingState } from '../../../../../redux/selectors/control/disruptions';
import {
    deleteAffectedEntities,
    updateCurrentStep,
    getRoutesByStop,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
} from '../../../../../redux/actions/control/disruptions';
import SEARCH_RESULT_TYPE from '../../../../../types/search-result-types';

const SelectEntities = (props) => {
    const addKeys = (routes, stops) => {
        const routesModified = routes.map((route) => {
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

    const updateSelectedItems = (selectedItems) => {
        props.onDataUpdate('affectedEntities', selectedItems);
        setAreEntitiesSelected(selectedItems.length > 0);
        setAffectedEntities(selectedItems);
    };

    useEffect(() => {
        const newEntities = addKeys(props.affectedRoutes, props.affectedStops);
        updateSelectedItems(newEntities);
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

    const { ROUTE, STOP } = SEARCH_RESULT_TYPE;

    const entityToItemTransformers = {
        [ROUTE.type]: entity => ({
            routeId: entity.data.route_id,
            routeType: entity.data.route_type,
            routeShortName: entity.data.route_short_name,
            agencyName: entity.data.agency_name,
            agencyId: entity.data.agency_id,
            text: entity.text,
            category: entity.category,
            icon: entity.icon,
            valueKey: 'routeId',
            labelKey: 'routeShortName',
            type: ROUTE.type,
        }),
        [STOP.type]: entity => ({
            stopId: entity.data.stop_id,
            stopName: entity.data.stop_name,
            stopCode: entity.data.stop_code,
            locationType: entity.data.location_type,
            stopLat: entity.data.stop_lat,
            stopLon: entity.data.stop_lon,
            parentStation: entity.data.parent_station,
            platformCode: entity.data.platform_code,
            routeType: entity.data.route_type,
            text: entity.text,
            category: entity.category,
            icon: entity.icon,
            valueKey: 'stopId',
            labelKey: 'stopCode',
            type: STOP.type,
        }),
    };

    const itemToEntityTransformers = {
        [ROUTE.type]: item => ({
            text: item.routeShortName,
            data: {
                route_id: item.routeId,
                route_type: item.routeType,
                route_short_name: item.routeShortName,
                agency_name: item.agencyName,
                agency_id: item.agencyId,
            },
            category: item.category,
            icon: item.icon,
        }),
        [STOP.type]: item => ({
            text: item.text,
            data: {
                stop_id: item.stopId,
                stop_name: item.stopName,
                stop_code: item.stopCode,
                location_type: item.locationType,
                stop_lat: item.stopLat,
                stop_lon: item.stopLon,
                parent_station: item.parentStation,
                platform_code: item.platformCode,
                route_type: item.routeType,
            },
            category: item.category,
            icon: item.icon,
        }),
    };

    return (
        <div className="select_disruption">
            <PickList
                isVerticalLayout
                height={ 100 }
                leftPaneLabel="Search routes or stops"
                leftPanePlaceholder="Enter a route or stop number"
                onChange={ selectedItem => onChange(selectedItem) }
                rightPanelShowSearch={ false }
                rightPaneLabel="Selected routes and stops:"
                rightPaneClassName="cc__picklist-pane-bottom pl-4 pr-4"
                rightPaneShowCheckbox={ false }
                leftPaneClassName="cc__picklist-pane-vertical"
                width="w-100"
                secondPaneHeight="auto"
                deselectRoutes={ !areEntitiesSelected }
                selectedValues={ affectedEntities }
                isLoading={ props.isLoading }
                searchInCategory={ [ROUTE.type, STOP.type] }
                entityToItemTransformers={ entityToItemTransformers }
                itemToEntityTransformers={ itemToEntityTransformers }
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
    deleteAffectedEntities: PropTypes.func.isRequired,
    updateCurrentStep: PropTypes.func,
    getRoutesByStop: PropTypes.func.isRequired,
    updateAffectedStopsState: PropTypes.func.isRequired,
    updateAffectedRoutesState: PropTypes.func.isRequired,
    getRoutesByShortName: PropTypes.func.isRequired,
    affectedRoutes: PropTypes.array.isRequired,
    affectedStops: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
};

SelectEntities.defaultProps = {
    onStepUpdate: () => {},
    onDataUpdate: () => {},
    updateCurrentStep: () => {},
};

export default connect(state => ({
    affectedStops: getAffectedStops(state),
    affectedRoutes: getAffectedRoutes(state),
    isLoading: getDisruptionsLoadingState(state),
}), {
    deleteAffectedEntities,
    updateCurrentStep,
    getRoutesByStop,
    updateAffectedStopsState,
    getRoutesByShortName,
    updateAffectedRoutesState,
})(SelectEntities);
