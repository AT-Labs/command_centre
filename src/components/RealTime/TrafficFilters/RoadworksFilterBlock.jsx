import React from 'react';
import { Input } from 'reactstrap';
import { useSelector, useDispatch } from 'react-redux';
import CustomizedSwitch from '../../Common/Switch/CustomizedSwitch';
import { updateShowRoadworks, updateSelectedRoadworksFilters } from '../../../redux/actions/realtime/layers';
import { getLayersState } from '../../../redux/selectors/realtime/layers';

export const RoadworksFilterCategories = [
    { id: 'Excavation', selected: true },
    { id: 'Non-Excavation', selected: true },
    { id: 'Event', selected: true },
];

export const readUrlToCarsRoadworksLayer = (searchParams, isRoadworksQueryValid, updateShowRoadworksDispatcher) => {
    const roadworksQuery = searchParams.get('roadworks');
    if (isRoadworksQueryValid(roadworksQuery)) {
        const enabledRoadworks = roadworksQuery.split(',');
        const roadworksFiltersFromUrlParam = RoadworksFilterCategories.map(category => ({
            ...category,
            selected: enabledRoadworks.includes(category.id),
        }));
        updateShowRoadworksDispatcher({
            showRoadworks: true,
            selectedRoadworksFilters: roadworksFiltersFromUrlParam,
        });
    }
};

export const updateUrlFromCarsRoadworksLayer = (selectedRoadworksFilters, searchParams) => {
    if (selectedRoadworksFilters.filter(f => f.selected).length > 0) {
        searchParams.set('roadworks', selectedRoadworksFilters
            .filter(f => f.selected)
            .map(f => f.id)
            .join(','));
    }
};

export const RoadworksFilterBlock = () => {
    const { showRoadworks, selectedRoadworksFilters } = useSelector(getLayersState);
    const dispatch = useDispatch();

    const onLayerChangeHandler = (showingLayer) => {
        dispatch(updateShowRoadworks({
            showRoadworks: showingLayer,
            selectedRoadworksFilters: showingLayer ? [...RoadworksFilterCategories] : [],
        }));
    };

    const onFilterChangeHandler = (category) => {
        const updatedFilters = selectedRoadworksFilters.map(
            filter => (filter.id === category.id ? { ...filter, selected: !filter.selected } : filter),
        );

        dispatch(updateSelectedRoadworksFilters({ selectedRoadworksFilters: [...updatedFilters] }));
    };

    return (
        <div className="roadworks-filters-block">
            <div className="layers-sub-title d-flex flex-row justify-content-between align-items-center my-2">
                <h4 className="font-weight-bolder m-0">Roadworks</h4>
                <CustomizedSwitch
                    id="roadworks-filters-switch"
                    checked={ showRoadworks }
                    onChange={ onLayerChangeHandler }
                />

            </div>

            {selectedRoadworksFilters.length > 0 && <h4 className="font-weight-bold m-0">Worksite Type</h4>}
            { showRoadworks && selectedRoadworksFilters.map(roadworkFilterItem => (
                <div className="roadworks-items d-flex flex-row justify-content-between" key={ roadworkFilterItem.id }>
                    <div className="d-flex flex-row align-items-center">
                        <div className="roadwork-type-card mt-1" />
                        <span htmlFor={ `${roadworkFilterItem.id}-filter-item` }>{roadworkFilterItem.id}</span>
                    </div>
                    <div className="mt-1">
                        <Input
                            id={ `${roadworkFilterItem.id}-filter-item` }
                            type="checkbox"
                            onChange={ () => onFilterChangeHandler(roadworkFilterItem) }
                            size={ 20 }
                            checked={ roadworkFilterItem.selected } />
                    </div>
                </div>
            ))}
        </div>
    );
};
