import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Fade } from 'reactstrap';
import { IoIosArrowDown } from 'react-icons/io';
import { LuX } from 'react-icons/lu';
import { map } from 'lodash-es';

import { useSelector } from 'react-redux';
import { Category } from '../../../types/incidents';
import CustomizedSwitch from '../../Common/Switch/CustomizedSwitch';
import IncidentItem from './IncidentItem';

import './TrafficFilters.scss';
import { RoadworksFilterBlock } from './RoadworksFilterBlock';

import { useCarsRoadworksLayer, useStopBasedDisruptionsLayer } from '../../../redux/selectors/appSettings';
import RouteAlertsFilter from './RouteAlertsFilter';
import { CONGESTION_COLORS } from '../../../constants/traffic';
import { DisruptionFilter } from './DisruptionFilter';

const TrafficFilters = (props) => {
    const [selectedCongestionFilters, setSelectedCongestionFilters] = useState(props.selectedCongestionFilters);
    const [selectedIncidentFilters, setSelectedIncidentFilters] = useState(props.selectedIncidentFilters);
    const [isIncidentCategoryExpand, setIsIncidentCategoryExpand] = useState(false);
    const useCarsRoadworksLayerEnabled = useSelector(useCarsRoadworksLayer);
    const useStopBasedDisruptionsLayerEnabled = useSelector(useStopBasedDisruptionsLayer);

    const onTrafficFlowsCheckboxChange = (values) => {
        values.forEach((value) => {
            const index = selectedCongestionFilters.indexOf(value);
            if (index < 0) {
                selectedCongestionFilters.push(value);
            } else {
                selectedCongestionFilters.splice(index, 1);
            }
        });
        setSelectedCongestionFilters([...selectedCongestionFilters]);
        if (props.onCongestionFiltersChanged) {
            props.onCongestionFiltersChanged([...selectedCongestionFilters]);
        }
    };

    const onIncidentCheckboxChange = (values) => {
        values.forEach((value) => {
            const index = selectedIncidentFilters.indexOf(value);
            if (index < 0) {
                selectedIncidentFilters.push(value);
            } else {
                selectedIncidentFilters.splice(index, 1);
            }
        });
        setSelectedIncidentFilters([...selectedIncidentFilters]);
        if (props.onIncidentFiltersChanged) {
            props.onIncidentFiltersChanged([...selectedIncidentFilters]);
        }
    };

    const switchIncidentHandler = (value) => {
        if (value) {
            onIncidentCheckboxChange(map(Category, v => v));
        } else {
            setIsIncidentCategoryExpand(false);
            setSelectedIncidentFilters([]);
            if (props.onCongestionFiltersChanged) {
                props.onIncidentFiltersChanged([]);
            }
        }
    };

    const switchTrafficHandler = (value) => {
        if (value) {
            onTrafficFlowsCheckboxChange([CONGESTION_COLORS.BLUE, CONGESTION_COLORS.GREEN, CONGESTION_COLORS.DARK_ORANGE, CONGESTION_COLORS.MAROON, CONGESTION_COLORS.BLACK]);
        } else {
            setSelectedCongestionFilters([]);
            if (props.onCongestionFiltersChanged) {
                props.onCongestionFiltersChanged([]);
            }
        }
    };

    return (
        <Fade in={ props.isExpand }>
            <div className="traffic-filters-container bg-white border rounded p-3 mt-2">
                <div className="layers-title d-flex flex-row justify-content-between">
                    <h2 className="font-weight-bold">Layers</h2>
                    <LuX
                        id="close-traffic-filters"
                        color="#3f9db5"
                        size={ 28 }
                        onClick={ () => props.isExpandHandler(false) }
                    />
                </div>
                <div className="incident-filters-block">
                    <div className="layers-sub-title d-flex flex-row justify-content-between align-items-center my-2">
                        <h4 className="font-weight-bolder m-0">TomTom incidents</h4>
                        <CustomizedSwitch
                            id="incident-filters-switch"
                            checked={ selectedIncidentFilters?.length > 0 }
                            onChange={ switchIncidentHandler } />
                    </div>
                    {selectedIncidentFilters?.length > 0 && (
                        <div className={ `incident-items ${!isIncidentCategoryExpand ? 'contract-incident-items' : ''} ` }>
                            {map(Category, (category, key) => (
                                <IncidentItem
                                    id={ category }
                                    key={ key }
                                    title={ category }
                                    onChange={ () => onIncidentCheckboxChange([category]) }
                                    checked={ selectedIncidentFilters.includes(category) }
                                    useNewColors={ useStopBasedDisruptionsLayerEnabled }
                                />
                            ))}
                            {!isIncidentCategoryExpand && (
                                <div className="bottom-text d-flex justify-content-center align-items-end">
                                    <button
                                        type="button"
                                        onClick={ () => { setIsIncidentCategoryExpand(true); } }
                                        className="btn btn-link show-all-text font-weight-bold"
                                    >
                                        Show all
                                        {' '}
                                        <IoIosArrowDown size={ 18 } />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <div className="congestion-filters-block">
                    <div className="layers-sub-title d-flex flex-row justify-content-between align-items-center my-2">
                        <h4 className="font-weight-bolder m-0">TomTom live traffic</h4>
                        <CustomizedSwitch
                            id="congestion-filters-switch"
                            checked={ selectedCongestionFilters?.length > 0 }
                            onChange={ switchTrafficHandler }
                        />
                    </div>
                    {selectedCongestionFilters?.length > 0 && (
                        <div className="traffic-level-items">
                            <div className="d-flex flex-row justify-content-between">
                                <div className="d-flex flex-row align-items-center">
                                    <div className="traffic-card green-traffic-card" />
                                    <span htmlFor={ CONGESTION_COLORS.GREEN }>90% and above of free flow speed</span>
                                </div>
                                <div>
                                    <Input
                                        id={ CONGESTION_COLORS.GREEN }
                                        type="checkbox"
                                        className=""
                                        onChange={ () => onTrafficFlowsCheckboxChange([CONGESTION_COLORS.GREEN]) }
                                        size={ 20 }
                                        checked={ selectedCongestionFilters.includes(CONGESTION_COLORS.GREEN) } />
                                </div>
                            </div>
                            <div className="d-flex flex-row justify-content-between">
                                <div className="d-flex flex-row align-items-center">
                                    <div className="traffic-card yellow-traffic-card" />
                                    <span htmlFor={ CONGESTION_COLORS.YELLOW }>70% - 89% of free flow speed</span>
                                </div>
                                <div>
                                    <Input
                                        id={ CONGESTION_COLORS.YELLOW }
                                        type="checkbox"
                                        className=""
                                        onChange={ () => onTrafficFlowsCheckboxChange([CONGESTION_COLORS.YELLOW]) }
                                        size={ 20 }
                                        checked={ selectedCongestionFilters.includes(CONGESTION_COLORS.YELLOW) } />
                                </div>
                            </div>
                            <div className="d-flex flex-row justify-content-between">
                                <div className="d-flex flex-row align-items-center">
                                    <div className="traffic-card orange-traffic-card" />
                                    <span htmlFor={ CONGESTION_COLORS.ORANGE }>50% - 69% of free flow speed</span>
                                </div>
                                <div>
                                    <Input
                                        id={ CONGESTION_COLORS.ORANGE }
                                        type="checkbox"
                                        className=""
                                        onChange={ () => onTrafficFlowsCheckboxChange([CONGESTION_COLORS.ORANGE]) }
                                        size={ 20 }
                                        checked={ selectedCongestionFilters.includes(CONGESTION_COLORS.ORANGE) } />
                                </div>
                            </div>
                            <div className="d-flex flex-row justify-content-between">
                                <div className="d-flex flex-row align-items-center">
                                    <div className="traffic-card red-traffic-card" />
                                    <span htmlFor={ CONGESTION_COLORS.RED }>40% - 49% of free flow speed</span>
                                </div>
                                <div>
                                    <Input
                                        id={ CONGESTION_COLORS.RED }
                                        type="checkbox"
                                        className=""
                                        onChange={ () => onTrafficFlowsCheckboxChange([CONGESTION_COLORS.RED]) }
                                        size={ 20 }
                                        checked={ selectedCongestionFilters.includes(CONGESTION_COLORS.RED) } />
                                </div>
                            </div>
                            <div className="d-flex flex-row justify-content-between">
                                <div className="d-flex flex-row align-items-center">
                                    <div className="traffic-card maroon-traffic-card" />
                                    <span htmlFor={ CONGESTION_COLORS.MAROON }>39% and below of free flow speed</span>
                                </div>
                                <div>
                                    <Input
                                        id={ CONGESTION_COLORS.MAROON }
                                        type="checkbox"
                                        className=""
                                        onChange={ () => onTrafficFlowsCheckboxChange([CONGESTION_COLORS.MAROON]) }
                                        size={ 20 }
                                        checked={ selectedCongestionFilters.includes(CONGESTION_COLORS.MAROON) } />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                { useCarsRoadworksLayerEnabled && <RoadworksFilterBlock /> }
                { props.useRouteAlerts && (
                    <RouteAlertsFilter />
                ) }
                { useStopBasedDisruptionsLayerEnabled && (<DisruptionFilter />) }
            </div>
        </Fade>
    );
};

TrafficFilters.propTypes = {
    useRouteAlerts: PropTypes.bool,
    selectedCongestionFilters: PropTypes.array,
    onCongestionFiltersChanged: PropTypes.func,
    selectedIncidentFilters: PropTypes.array,
    onIncidentFiltersChanged: PropTypes.func,
    isExpand: PropTypes.bool,
    isExpandHandler: PropTypes.func,
};

TrafficFilters.defaultProps = {
    useRouteAlerts: false,
    selectedCongestionFilters: [],
    onCongestionFiltersChanged: undefined,
    selectedIncidentFilters: [],
    onIncidentFiltersChanged: undefined,
    isExpand: PropTypes.bool,
    isExpandHandler: () => {},
};

export default TrafficFilters;
