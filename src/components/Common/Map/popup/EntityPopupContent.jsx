import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'lodash-es';
import { MdWest } from 'react-icons/md';
import IconButton from '@mui/material/IconButton';
import DisruptionDetails from '../TrafficLayer/DisruptionDetails';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';
import { routeSelected } from '../../../../redux/actions/realtime/detail/route';
import { stopSelected } from '../../../../redux/actions/realtime/detail/stop';
import { updateHoveredEntityKey } from '../../../../redux/actions/realtime/map';
import { getViewDetailKey } from '../../../../redux/selectors/realtime/detail';
import './EntityPopupContent.scss';

export const EntityPopupContent = ({
    entity,
    causes,
    impacts,
    goToDisruptionEditPage,
    goToIncidentEditPage,
    onExpandPopup,
    onCollapsePopup,
    isExpanded,
    useParentChildIncident,
}) => {
    const dispatch = useDispatch();
    const currentDetailKey = useSelector(getViewDetailKey);

    const handleViewDetails = (data) => {
        dispatch(updateHoveredEntityKey(''));
        if (data.searchResultType === SEARCH_RESULT_TYPE.ROUTE.type) {
            dispatch(routeSelected(data));
        } else if (data.searchResultType === SEARCH_RESULT_TYPE.STOP.type) {
            dispatch(stopSelected(data));
        }
    };

    const handleShowDisruptions = () => {
        if (onExpandPopup) onExpandPopup();
    };

    const handleHideDisruptions = () => {
        if (onCollapsePopup) onCollapsePopup();
    };

    const renderRoutePopupContent = () => {
        const activeRouteVariants = Array.isArray(entity.routes)
            ? entity.routes.filter(routeVariant => Array.isArray(routeVariant.vehicles) && routeVariant.vehicles.length)
            : [];
        return (
            <div>
                <div className="entity-popup-title">{`Route ${entity.route_short_name}`}</div>
                {
                    !isEmpty(activeRouteVariants) && activeRouteVariants.map((route) => {
                        const runningVehicles = ` (${route.vehicles.length} running vehicle${route.vehicles.length > 1 ? 's' : ''})`;
                        return (
                            <div className="entity-popup-content"
                                key={ route.routeVariantName }>
                                {`${route.routeVariantName}${runningVehicles}`}
                            </div>
                        );
                    })
                }
                {
                    isEmpty(activeRouteVariants) && (
                        <div className="entity-popup-content">No vehicles are running</div>)
                }
            </div>
        );
    };

    const renderStopPopupContent = () => (
        <div>
            <div className="entity-popup-title">{`Stop ${entity.stop_code}`}</div>
            <div className="entity-popup-content">{entity.stop_name}</div>
        </div>
    );

    if (isExpanded && entity.searchResultType === SEARCH_RESULT_TYPE.STOP.type) {
        return (
            <div className="entity-disruption-popup">
                <IconButton
                    onClick={ handleHideDisruptions }
                    aria-label="Back"
                    className="entity-popup-back-btn"
                >
                    <MdWest size={ 20 } />
                </IconButton>
                <DisruptionDetails
                    disruptions={ entity.disruptions }
                    stopCode={ entity.stop_code }
                    stopName={ entity.stop_name }
                    impacts={ impacts }
                    causes={ causes }
                    goToDisruptionEditPage={ goToDisruptionEditPage }
                    goToIncidentEditPage={ goToIncidentEditPage }
                    useParentChildIncident={ useParentChildIncident }
                />
            </div>
        );
    }

    return (
        <>
            {entity.searchResultType === SEARCH_RESULT_TYPE.ROUTE.type && renderRoutePopupContent()}
            {entity.searchResultType === SEARCH_RESULT_TYPE.STOP.type && renderStopPopupContent()}
            {(!currentDetailKey || currentDetailKey !== entity.key) && (
                <div>
                    <Button className="cc-btn-secondary w-100" onClick={ () => handleViewDetails(entity) }>
                        View details
                    </Button>
                    {entity?.disruptions?.length > 0 && entity.searchResultType === SEARCH_RESULT_TYPE.STOP.type && (
                        <Button className="cc-btn-secondary w-100 mt-2" onClick={ handleShowDisruptions }>
                            View Disruption details
                        </Button>
                    )}
                </div>
            )}
        </>
    );
};

EntityPopupContent.propTypes = {
    entity: PropTypes.object.isRequired,
    causes: PropTypes.array,
    impacts: PropTypes.array,
    goToDisruptionEditPage: PropTypes.func,
    goToIncidentEditPage: PropTypes.func,
    onExpandPopup: PropTypes.func.isRequired,
    onCollapsePopup: PropTypes.func.isRequired,
    isExpanded: PropTypes.bool.isRequired,
    useParentChildIncident: PropTypes.bool,
};

EntityPopupContent.defaultProps = {
    causes: [],
    impacts: [],
    goToDisruptionEditPage: () => {},
    goToIncidentEditPage: () => {},
    useParentChildIncident: false,
};
