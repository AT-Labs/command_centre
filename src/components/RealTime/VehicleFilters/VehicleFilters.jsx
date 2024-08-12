import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, Input, Fade, FormGroup, Label } from 'reactstrap';
import { LuX, LuRotateCcw } from 'react-icons/lu';

import Icon from '../../Common/Icon/Icon';
import { VEHICLE_OCCUPANCY_STATUS_TYPE, occupancyStatusToIconSvg, VEHICLE_OCCUPANCY_STATUS_DESCRIPTIONS } from '../../../types/vehicle-occupancy-status-types';
import VEHICLE_TYPE, { TRAIN_TYPE_ID, BUS_TYPE_ID, FERRY_TYPE_ID } from '../../../types/vehicle-types';
import {
    getVehiclesFilterRouteType,
    getVehiclesFilterShowingOccupancyLevels,
} from '../../../redux/selectors/realtime/vehicles';
import { mergeVehicleFilters } from '../../../redux/actions/realtime/vehicles';
import VehicleFilterByOperator from './VehicleFilterByOperator';
import VehicleFilterByDirection from './VehicleFilterByDirection';
import VehicleFilterByDelay from './VehicleFilterByDelay/VehicleFilterByDelay';
import VehicleFilterByTag from './VehicleFilterByTag';

import './VehicleFilters.scss';

const VehicleFilters = (props) => {
    const toggleRouteTypeFilter = (newRouteType) => {
        const routeType = newRouteType === props.routeType ? null : newRouteType;
        props.mergeVehicleFilters({ routeType });
    };

    const createButton = type => (
        <Button
            onClick={ () => toggleRouteTypeFilter(type) }
            tabIndex="0"
            size="lg"
            active={ props.routeType === type }>
            { VEHICLE_TYPE[type].type }
        </Button>
    );

    const handleOccupancyLevel = (e) => {
        const { showingOccupancyLevels } = props;
        const { name, checked } = e.target;
        const occupancyLevels = checked ? showingOccupancyLevels.concat(name) : showingOccupancyLevels.filter(level => level !== name);
        props.mergeVehicleFilters({ showingOccupancyLevels: occupancyLevels });
    };

    const clearVehicleFilters = () => props.mergeVehicleFilters({
        routeType: null,
        isShowingNIS: false,
        isShowingUnscheduled: false,
        showingDelay: {},
        showingOccupancyLevels: [],
        showingTags: [],
    });

    return (
        <Fade in={ props.isExpand }>
            <div className="vehicle-filters-container bg-white border rounded p-3">
                <div className="vehicle-filters-title d-flex flex-row justify-content-between mb-3">
                    <h2 className="font-weight-bold">Filters</h2>
                    <LuX
                        id="close-vehicle-filters"
                        color="#3f9db5"
                        size={ 28 }
                        onClick={ () => props.isExpandHandler(false) }
                        style={ { cursor: 'pointer' } }
                    />
                </div>
                <div>
                    <div className="vehicle-filters-type mb-2">
                        <ButtonGroup className="btn-group--filter-by-route-type">
                            {createButton(BUS_TYPE_ID)}
                            {createButton(TRAIN_TYPE_ID)}
                            {createButton(FERRY_TYPE_ID)}
                        </ButtonGroup>
                    </div>
                    {!!props.routeType && (
                        <>
                            <div className="operators-filters mb-2">
                                <VehicleFilterByOperator className="d-flex flex-row align-items-center py-1 m-0" />
                            </div>
                            <div className="direction-filters mb-2">
                                <div className="sub-title font-weight-bolder mb-2">Settings</div>
                                <VehicleFilterByDirection className="d-flex flex-row align-items-center py-1 m-0" />
                            </div>
                        </>
                    )}
                    <div className="status-filters mb-2">
                        <VehicleFilterByDelay titleClassName="sub-title font-weight-bolder" className="d-flex flex-row align-items-center py-1 m-0" />
                    </div>
                    <div className="occupancy-filters mb-2">
                        <h4 className="sub-title font-weight-bolder mb-2">Occupancy</h4>
                        {Object.values(VEHICLE_OCCUPANCY_STATUS_TYPE).map(level => (
                            <FormGroup key={ level } className="p-0" check>
                                <Label className="d-flex flex-row align-items-center py-1" check>
                                    <Input
                                        type="checkbox"
                                        name={ level }
                                        checked={ props.showingOccupancyLevels.includes(level) }
                                        onChange={ handleOccupancyLevel }
                                    />
                                    <span className="font-weight-light">
                                        <Icon className="icon d-inline-block ml-2" icon={ occupancyStatusToIconSvg(level) } />
                                    </span>
                                    <span className="pl-2">{VEHICLE_OCCUPANCY_STATUS_DESCRIPTIONS[level]}</span>
                                </Label>
                            </FormGroup>
                        ))}
                    </div>
                    <div className="tags-filters border-bottom mb-2 pb-3">
                        <VehicleFilterByTag titleClassName="sub-title font-weight-bolder" className="d-flex flex-row align-items-center py-1" />
                    </div>
                    <Button
                        color="link"
                        onClick={ clearVehicleFilters }
                        className="reset-filters-button font-weight-bold p-0"
                    >
                        <LuRotateCcw size={ 16 } />
                        {' '}
                        Reset filters
                    </Button>
                </div>
            </div>
        </Fade>
    );
};

VehicleFilters.propTypes = {
    routeType: PropTypes.number,
    mergeVehicleFilters: PropTypes.func.isRequired,
    showingOccupancyLevels: PropTypes.arrayOf(PropTypes.string).isRequired,
    isExpand: PropTypes.bool,
    isExpandHandler: PropTypes.func,
};

VehicleFilters.defaultProps = {
    routeType: null,
    isExpand: false,
    isExpandHandler: () => {},
};

export default connect(
    state => ({
        routeType: getVehiclesFilterRouteType(state),
        showingOccupancyLevels: getVehiclesFilterShowingOccupancyLevels(state),
    }),
    { mergeVehicleFilters },
)(VehicleFilters);
