import React, { useEffect, useRef, useState } from 'react';
import { FeatureGroup, Polyline, Tooltip } from 'react-leaflet';
import { useSelector } from 'react-redux';
import { AiFillWarning } from 'react-icons/ai';
import { generateUniqueID } from '../../../../utils/helpers';
import { CONGESTION_THRESHOLD_LOW, ROUTE_ALERTS_REFRESH_INTERVAL, CONGESTION_THRESHOLD_MEDIUM } from '../../../../constants/traffic';
import './RouteAlertsLayer.scss';
import { formatSeconds } from '../../../../utils/dateUtils';
import * as routeMonitoringApi from '../../../../utils/transmitters/route-monitoring-api';
import { getLayersState } from '../../../../redux/selectors/realtime/layers';

const RouteAlertsLayer = () => {
    const { showRouteAlerts, showAllRouteAlerts, selectedRouteAlerts } = useSelector(getLayersState);
    const [routesData, setRoutesData] = useState([]);
    const abortControllerRef = useRef(null);

    const getColor = (relativeSpeed) => {
        if (relativeSpeed >= CONGESTION_THRESHOLD_LOW) {
            return 'Green';
        }
        if (relativeSpeed >= CONGESTION_THRESHOLD_MEDIUM) {
            return 'Orange';
        }
        return 'Red';
    };

    const fetchRouteAlertData = async (routeIds, fetchAll) => {
        try {
            if (fetchAll) {
                const allData = await routeMonitoringApi.fetchAllRouteAlertDetails();
                const filteredRoutes = allData.map((route) => {
                    const filteredSegments = (route.detailedSegments || []).filter(segment => (segment.currentSpeed / segment.typicalSpeed <= CONGESTION_THRESHOLD_MEDIUM));
                    return {
                        ...route,
                        detailedSegments: filteredSegments,
                    };
                });
                setRoutesData(filteredRoutes);
            } else {
                const data = await routeMonitoringApi.fetchRouteAlertDetailsByIds(routeIds);
                setRoutesData(data);
            }
        } catch (error) {
            setRoutesData([]);
        }
    };

    useEffect(() => {
        const routeIds = selectedRouteAlerts.map(routeAlert => routeAlert.routeId);
        const fetchData = async () => {
            await fetchRouteAlertData(routeIds, showAllRouteAlerts);
        };

        if ((routeIds && routeIds.length > 0) || showAllRouteAlerts) {
            fetchData();
        } else {
            setRoutesData([]);
        }

        const refreshDataInterval = setInterval(() => {
            if ((routeIds && routeIds.length > 0) || showAllRouteAlerts) {
                // make sure all the pending calls are cancelled before making the next one
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
                fetchData();
            }
        }, ROUTE_ALERTS_REFRESH_INTERVAL);

        return () => {
            clearInterval(refreshDataInterval);
        };
    }, [showRouteAlerts, selectedRouteAlerts, showAllRouteAlerts]);

    return showRouteAlerts && routesData
        ? (
            <FeatureGroup>
                { routesData.map(data => data.detailedSegments
                    .map(segment => (
                        <Polyline
                            positions={ segment.shape.map(coordinate => [coordinate.latitude, coordinate.longitude]) }
                            weight={ 5 }
                            color={ getColor(segment.currentSpeed / segment.typicalSpeed) }
                            opacity={ 0.9 }
                            key={ `${segment.segmentId}-${generateUniqueID()}` }
                        >
                            <Tooltip sticky>
                                <div className="route-alert-details-container">
                                    <div className="header">
                                        <div className="icon-container">
                                            <AiFillWarning className="icon" color="#FFA500" />
                                        </div>
                                        <h2 className="title">Alert</h2>
                                    </div>
                                    <div className="details">
                                        <div className="row">
                                            <p>
                                                <strong>
                                                    Corridor:
                                                </strong>
                                                {` ${data.routeName}`}
                                            </p>
                                        </div>
                                        <div className="row">
                                            <p>
                                                <strong>
                                                    Corridor delay:
                                                </strong>
                                                {` ${formatSeconds(data.delayTime)}`}
                                            </p>
                                        </div>
                                        <div className="row">
                                            <p>
                                                <strong>
                                                    Passable?:
                                                </strong>
                                                {` ${data.passable ? 'Yes' : 'No'}`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Tooltip>
                        </Polyline>
                    )))}
            </FeatureGroup>
        )
        : null;
};

export default RouteAlertsLayer;
