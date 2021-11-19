import React from 'react';
import { components } from 'react-select';
import PropTypes from 'prop-types';
import { capitalize } from 'lodash-es';

import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';

const { ROUTE, STOP, BUS, TRAIN, FERRY } = SEARCH_RESULT_TYPE;

const getLabelFromEntity = (entity) => {
    const vehicleLabelMap = vehicle => `${capitalize(vehicle.category.type)} ${vehicle.data.label}`;
    const entityLabelMap = {
        [ROUTE.type]: entity.data.route_short_name,
        [STOP.type]: `${capitalize(entity.category.type)} ${entity.data.stop_code} ${entity.data.stop_name}`,
        [BUS.type]: vehicleLabelMap(entity),
        [TRAIN.type]: vehicleLabelMap(entity),
        [FERRY.type]: vehicleLabelMap(entity),
    };
    return entityLabelMap[entity.category.type];
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
