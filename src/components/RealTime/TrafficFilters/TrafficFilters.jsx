import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Input, Fade } from 'reactstrap';
import { IoIosArrowDown } from 'react-icons/io';
import { LuX } from 'react-icons/lu';
import { map } from 'lodash-es';

import { Category } from '../../../types/incidents';
import CustomizedSwitch from '../../Common/Switch/CustomizedSwitch';
import IncidentItem from './IncidentItem';

import './TrafficFilters.scss';

export const Filters = {
    High: 'High',
    Medium: 'Medium',
    Low: 'Low',
};

const TrafficFilters = (props) => {
    const [selectedCongestionFilters, setSelectedCongestionFilters] = useState(props.selectedCongestionFilters);
    const [selectedIncidentFilters, setSelectedIncidentFilters] = useState(props.selectedIncidentFilters);
    const [isIncidentCategoryExpand, setIsIncidentCategoryExpand] = useState(false);

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
            onTrafficFlowsCheckboxChange([Filters.Low, Filters.Medium, Filters.High]);
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
                        <h4 className="font-weight-bolder m-0">Incidents</h4>
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
                        <h4 className="font-weight-bolder m-0">Live traffic</h4>
                        <CustomizedSwitch
                            id="congestion-filters-switch"
                            checked={ selectedCongestionFilters?.length > 0 }
                            onChange={ switchTrafficHandler }
                        />
                    </div>
                    {selectedCongestionFilters?.length > 0 && (
                        <div className="taffic-level-items">
                            <div className="d-flex flex-row justify-content-between">
                                <div className="d-flex flex-row align-items-center">
                                    <div className="traffic-card low-traffic-card" />
                                    <span htmlFor={ Filters.Low }>Low traffic</span>
                                </div>
                                <div>
                                    <Input
                                        id={ Filters.Low }
                                        type="checkbox"
                                        className=""
                                        onChange={ () => onTrafficFlowsCheckboxChange([Filters.Low]) }
                                        size={ 20 }
                                        checked={ selectedCongestionFilters.includes(Filters.Low) } />
                                </div>
                            </div>
                            <div className="d-flex flex-row justify-content-between">
                                <div className="d-flex flex-row align-items-center">
                                    <div className="traffic-card medium-traffic-card" />
                                    <div className="font-weight-">Medium traffic</div>
                                </div>
                                <div>
                                    <Input
                                        id={ Filters.Medium }
                                        type="checkbox"
                                        className=""
                                        onChange={ () => onTrafficFlowsCheckboxChange([Filters.Medium]) }
                                        size={ 20 }
                                        checked={ selectedCongestionFilters.includes(Filters.Medium) } />
                                </div>
                            </div>
                            <div className="d-flex flex-row justify-content-between">
                                <div className="d-flex flex-row align-items-center">
                                    <div className="traffic-card high-traffic-card" />
                                    <span className="font-weight-">High traffic</span>
                                </div>
                                <div>
                                    <Input
                                        id={ Filters.High }
                                        type="checkbox"
                                        className=""
                                        onChange={ () => onTrafficFlowsCheckboxChange([Filters.High]) }
                                        size={ 20 }
                                        checked={ selectedCongestionFilters.includes(Filters.High) } />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Fade>
    );
};

TrafficFilters.propTypes = {
    selectedCongestionFilters: PropTypes.array,
    onCongestionFiltersChanged: PropTypes.func,
    selectedIncidentFilters: PropTypes.array,
    onIncidentFiltersChanged: PropTypes.func,
    isExpand: PropTypes.bool,
    isExpandHandler: PropTypes.func,
};

TrafficFilters.defaultProps = {
    selectedCongestionFilters: [],
    onCongestionFiltersChanged: undefined,
    selectedIncidentFilters: [],
    onIncidentFiltersChanged: undefined,
    isExpand: PropTypes.bool,
    isExpandHandler: () => {},
};

export default TrafficFilters;
