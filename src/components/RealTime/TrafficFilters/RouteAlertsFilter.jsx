import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Input } from 'reactstrap';

import { AiFillWarning } from 'react-icons/ai';
import CustomizedSwitch from '../../Common/Switch/CustomizedSwitch';
import * as routeMonitoringApi from '../../../utils/transmitters/route-monitoring-api';
import './RouteAlertsFilter.scss';
import Search from '../../Common/Search/Search';
import { ROUTE_ALERTS_REFRESH_INTERVAL } from '../../../constants/traffic';
import { getLayersState } from '../../../redux/selectors/realtime/layers';
import { updateShowRouteAlerts, updateShowAllRouteAlerts, updateSelectedRouteAlerts } from '../../../redux/actions/realtime/layers';

export const defaultTheme = {
    container: 'search__autosuggest',
    suggestionsContainer: 'search__dropdown position-absolute',
    suggestionsList: 'search__dropdown-menu m-0 p-0 bg-white h-100',
    suggestion: 'search__dropdown-item suggestion__text px-3 py-3',
    input: 'search__input form-control cc-form-control',
    suggestionHighlighted: 'active bg-at-ocean-tint-10',
    sectionContainer: 'search__section-container bg-white',
    sectionTitle: 'search__section-title border-top px-3 text-right text-uppercase',
};

export const restoreRouteAlertsStateFromUrl = (searchParams, updateShowRouteAlertsDispatcher, updateShowAllRouteAlertsDispatcher) => {
    const showCorridors = searchParams.get('corridors');
    if (showCorridors === 'true') {
        updateShowRouteAlertsDispatcher({
            showRouteAlerts: true,
        });
    }
    const showAllCorridors = searchParams.get('allCorridors');
    if (showAllCorridors === 'true') {
        updateShowAllRouteAlertsDispatcher({
            showAllRouteAlerts: true,
        });
    }
};

export const updateUrlForRouteAlerts = (showRouteAlerts, showAllRouteAlerts, searchParams) => {
    if (showRouteAlerts === true) {
        searchParams.set('corridors', showRouteAlerts);
    }

    if (showAllRouteAlerts === true) {
        searchParams.set('allCorridors', showAllRouteAlerts);
    }
};

const RouteAlertsFilter = () => {
    const { showRouteAlerts, showAllRouteAlerts, selectedRouteAlerts } = useSelector(getLayersState);
    const [routes, setRoutes] = useState([]); // Holds the complete route list for search
    const [searchSuggestions, setSearchSuggestions] = useState([]); // Holds filtered route suggestions
    const [searchQuery, setSearchQuery] = useState('');
    const dispatch = useDispatch();

    const switchAlertHandler = (value) => {
        dispatch(updateShowRouteAlerts({
            showRouteAlerts: value,
        }));
    };

    const switchAllAlertHandler = (value) => {
        dispatch(updateShowAllRouteAlerts({
            showAllRouteAlerts: value,
        }));
    };

    const fetchRoutes = async () => {
        try {
            const data = await routeMonitoringApi.fetchRouteAlerts();
            setRoutes(data);
        } catch (error) {
            setRoutes([]);
        }
    };

    useEffect(() => {
        if (showRouteAlerts) {
            fetchRoutes();
        }
        const refreshRouteAlertsInterval = setInterval(() => {
            if (showRouteAlerts) {
                fetchRoutes();
            }
        }, ROUTE_ALERTS_REFRESH_INTERVAL);

        return () => {
            clearInterval(refreshRouteAlertsInterval);
        };
    }, [showRouteAlerts]);

    useMemo(() => {
        if (searchQuery.trim() && searchQuery.length > 0) {
            const filteredRoutes = routes
                .filter(route => route.routeName.toLowerCase().includes(searchQuery.toLowerCase())).map(route => ({ text: route.routeName, routeId: route.routeId }));
            setSearchSuggestions(filteredRoutes);
        } else {
            setSearchSuggestions([]);
        }
    }, [routes, searchQuery]);

    // Handle route search
    const onSearchRoute = (query) => {
        setSearchQuery(query);
    };

    // Handle route selection
    const onRouteSelected = (selectedRoute) => {
        if (!selectedRouteAlerts.some(route => route.routeId === selectedRoute.routeId)) {
            const updatedSelectedRoutes = [...selectedRouteAlerts, selectedRoute];
            dispatch(updateSelectedRouteAlerts({
                selectedRouteAlerts: updatedSelectedRoutes,
            }));
        }
    };

    // Handle route deselection
    const onRouteDeselected = (routeId) => {
        const updatedSelectedRoutes = selectedRouteAlerts.filter(route => route.routeId !== routeId);
        dispatch(updateSelectedRouteAlerts({
            selectedRouteAlerts: updatedSelectedRoutes,
        }));
    };

    return (
        <div className="alerts-filters-block">
            <div className="layers-sub-title d-flex flex-row justify-content-between align-items-center my-2">
                <h4 className="font-weight-bolder m-0">Corridors</h4>
                <CustomizedSwitch
                    className="alerts-filters-switch"
                    checked={ showRouteAlerts }
                    onChange={ switchAlertHandler }
                />
            </div>
            {showRouteAlerts && (
                <div className="alerts-content">
                    <div className="d-flex flex-column">
                        {/* Route Search Box */}
                        <div className="route-search">
                            <Search
                                suggestions={ [{ category: { label: '' }, items: searchSuggestions }] }
                                placeholder="Search for a corridor..."
                                onSearch={ query => onSearchRoute(query) }
                                onSelection={ onRouteSelected }
                                onClear={ () => setSearchSuggestions([]) }
                                customTheme={ defaultTheme }
                                searchInCategory={ [] }
                                hideClearButton
                                isDisabled={ showAllRouteAlerts }
                            />
                        </div>

                        <div className="show-all-switch d-flex flex-row align-items-center mt-2">
                            <CustomizedSwitch
                                id="show-all-switch"
                                checked={ showAllRouteAlerts }
                                onChange={ switchAllAlertHandler }
                            />
                            <span className="ml-2">Show all corridors (alerts only)</span>
                        </div>

                        {/* Selected Routes */}
                        {!showAllRouteAlerts && selectedRouteAlerts.length > 0 && (
                            <div className="alerts-routes mt-3">
                                {selectedRouteAlerts.map(route => (
                                    <div key={ route.routeId } className="alerts-route-item d-flex flex-row justify-content-between">
                                        <div className="d-flex flex-row align-items-center">
                                            <AiFillWarning className="icon" color="#FFA500" />
                                            <span className="ml-2 sub-title">{route.text}</span>
                                        </div>
                                        <Input
                                            type="checkbox"
                                            size={ 20 }
                                            checked
                                            onChange={ () => onRouteDeselected(route.routeId) }
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default RouteAlertsFilter;
