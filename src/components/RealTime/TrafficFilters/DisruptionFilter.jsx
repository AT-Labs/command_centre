import React from 'react';
import { Input } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import CustomizedSwitch from '../../Common/Switch/CustomizedSwitch';
import { getLayersState } from '../../../redux/selectors/realtime/layers';
import {
    updateSelectedDisruptionFilters,
    updateShowDisruptions,
} from '../../../redux/actions/realtime/layers';
import './DisruptionFilter.scss';

export const DisruptionFilterCategories = ['Active', 'Planned'];

const filterToStatusMapping = {
    Active: 'in-progress',
    Planned: 'not-started',
};

export const updateUrlFromDisruptionsLayer = (selectedDisruptionFilters, searchParams) => {
    if (selectedDisruptionFilters.length > 0) {
        searchParams.set('disruptions', selectedDisruptionFilters.join(','));
    } else {
        searchParams.delete('disruptions');
    }
};

export const readUrlToDisruptionLayer = (searchParams, isDisruptionsQueryValid, updateShowDisruptionsDispatcher) => {
    const disruptionsQuery = searchParams.get('disruptions');
    if (isDisruptionsQueryValid(disruptionsQuery)) {
        const enabledDisruptions = disruptionsQuery.split(',');
        updateShowDisruptionsDispatcher({
            showDisruptions: true,
            selectedDisruptionFilters: enabledDisruptions,
        });
    }
};

export const mapFiltersToStatuses = filters => filters.reduce((statuses, filter) => {
    if (filterToStatusMapping[filter]) {
        statuses.push(filterToStatusMapping[filter]);
    }
    return statuses;
}, []);

export const DisruptionFilter = () => {
    const { showDisruptions, selectedDisruptionFilters } = useSelector(getLayersState);
    const dispatch = useDispatch();
    const switchDisruptionHandler = (value) => {
        dispatch(updateShowDisruptions({
            showDisruptions: value,
            selectedDisruptionFilters: value ? [...DisruptionFilterCategories] : [],
        }));
    };

    const onFilterChangeHandler = (filterItem) => {
        const updatedFilters = selectedDisruptionFilters.includes(filterItem)
            ? selectedDisruptionFilters.filter(filter => filter !== filterItem)
            : [...selectedDisruptionFilters, filterItem];

        dispatch(updateSelectedDisruptionFilters({ selectedDisruptionFilters: updatedFilters }));
    };

    return (
        <div className="disruption-filters-block">
            <div className="layers-sub-title d-flex flex-row justify-content-between align-items-center my-2">
                <h4 className="font-weight-bolder m-0">Disruptions</h4>
                <CustomizedSwitch
                    id="disruption-filters-switch"
                    checked={ showDisruptions }
                    onChange={ switchDisruptionHandler } />
            </div>
            {showDisruptions && DisruptionFilterCategories.map(filterItem => (
                <div className="disruption-items d-flex flex-row justify-content-between" key={ filterItem }>
                    <div className="d-flex flex-row align-items-center">
                        {filterItem}
                    </div>
                    <div className="mt-1">
                        <Input
                            id={ `${filterItem}-filter-item` }
                            type="checkbox"
                            onChange={ () => onFilterChangeHandler(filterItem) }
                            size={ 20 }
                            checked={ selectedDisruptionFilters.includes(filterItem) } />
                    </div>
                </div>
            ))}
        </div>
    );
};
