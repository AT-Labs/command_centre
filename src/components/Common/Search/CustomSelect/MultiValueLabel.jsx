import React from 'react';
import { components } from 'react-select';
import PropTypes from 'prop-types';
import { capitalize } from 'lodash-es';

import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';

const { ROUTE, STOP, BUS, TRAIN, FERRY } = SEARCH_RESULT_TYPE;

const getLabelFromEntity = (entity) => {
    const vehicleLabelMap = vehicle => `${capitalize(vehicle.searchResultType)} ${vehicle.label}`;
    const entityLabelMap = {
        [ROUTE.type]: entity.route_short_name,
        [STOP.type]: `${capitalize(entity.searchResultType)} ${entity.stop_id} ${entity.stop_name}`,
        [BUS.type]: vehicleLabelMap(entity),
        [TRAIN.type]: vehicleLabelMap(entity),
        [FERRY.type]: vehicleLabelMap(entity),
    };
    return entityLabelMap[entity.searchResultType];
};

const MultiValueLabel = props => (
    <components.MultiValueLabel { ...props }>
        { getLabelFromEntity(props.data) }
    </components.MultiValueLabel>
);

MultiValueLabel.propTypes = {
    data: PropTypes.object.isRequired,
};

export default MultiValueLabel;
