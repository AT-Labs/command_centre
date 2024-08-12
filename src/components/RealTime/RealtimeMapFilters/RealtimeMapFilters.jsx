import React, { useState } from 'react';
import { Button, ButtonGroup } from 'reactstrap';
import { LuLayers, LuSlidersHorizontal } from 'react-icons/lu';
import PropTypes from 'prop-types';

import VehicleFilters from '../VehicleFilters/VehicleFilters';
import TrafficFilters from '../TrafficFilters/TrafficFilters';

import './RealtimeMapFilters.scss';

const RealtimeMapFilters = (props) => {
    const [isVehicleFiltersBlockExpand, setIsVehicleFiltersBlockExpand] = useState(false);
    const [isTrafficFiltersBlockExpand, setIsTrafficFiltersBlockExpand] = useState(false);

    return (
        <div className="realtime-map-filters-container position-fixed d-flex flex-column align-items-end">
            { !isVehicleFiltersBlockExpand && (
                <ButtonGroup className="d-block">
                    <Button
                        className="vehicle-filters-icon-container"
                        size="sm"
                        color="white"
                        onClick={ () => {
                            if (!isVehicleFiltersBlockExpand) {
                                setIsTrafficFiltersBlockExpand(false);
                            }
                            setIsVehicleFiltersBlockExpand(!isVehicleFiltersBlockExpand);
                        } }>
                        <LuSlidersHorizontal color="text-dark" size={ 22 } />
                    </Button>
                </ButtonGroup>
            ) }
            { isVehicleFiltersBlockExpand && <VehicleFilters isExpand={ isVehicleFiltersBlockExpand } isExpandHandler={ setIsVehicleFiltersBlockExpand } /> }
            { !isTrafficFiltersBlockExpand && (
                <ButtonGroup className="d-block mt-2">
                    <Button
                        className="traffic-filters-icon-container"
                        size="sm"
                        color="white"
                        onClick={ () => {
                            if (!isTrafficFiltersBlockExpand) {
                                setIsVehicleFiltersBlockExpand(false);
                            }
                            setIsTrafficFiltersBlockExpand(!isTrafficFiltersBlockExpand);
                        } }>
                        <LuLayers color="text-dark" size={ 22 } />
                    </Button>
                </ButtonGroup>
            ) }
            { isTrafficFiltersBlockExpand && (
                <TrafficFilters
                    selectedCongestionFilters={ props.selectedCongestionFilters }
                    selectedIncidentFilters={ props.selectedIncidentFilters }
                    onCongestionFiltersChanged={ props.onCongestionFiltersChanged }
                    onIncidentFiltersChanged={ props.onIncidentFiltersChanged }
                    isExpand={ isTrafficFiltersBlockExpand }
                    isExpandHandler={ setIsTrafficFiltersBlockExpand }

                />
            ) }
        </div>
    );
};

RealtimeMapFilters.propTypes = {
    selectedCongestionFilters: PropTypes.array,
    onCongestionFiltersChanged: PropTypes.func,
    selectedIncidentFilters: PropTypes.array,
    onIncidentFiltersChanged: PropTypes.func,
};

RealtimeMapFilters.defaultProps = {
    selectedCongestionFilters: [],
    onCongestionFiltersChanged: undefined,
    selectedIncidentFilters: [],
    onIncidentFiltersChanged: undefined,
};

export default RealtimeMapFilters;
