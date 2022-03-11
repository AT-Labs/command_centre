import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { FormGroup, Input, Label } from 'reactstrap';
import { mergeVehicleFilters } from '../../../redux/actions/realtime/vehicles';
import { getVehiclesFilterShowingTags } from '../../../redux/selectors/realtime/vehicles';

export const VehicleTag = {
    SMARTRAK: 'Smartrak',
    TORUTEK: 'Torutek',
};

export const VehicleFilterByTag = (props) => {
    const handleShowingTagChange = (e) => {
        const { name, checked } = e.target;
        const tags = checked ? props.showingTags.concat(name) : props.showingTags.filter(tag => tag !== name);
        props.mergeVehicleFilters({ showingTags: tags });
    };

    return (
        <>
            <div className="mt-3 mb-1">Tags</div>
            {Object.values(VehicleTag).map(tag => (
                <FormGroup key={ tag } check>
                    <Label check>
                        <Input
                            type="checkbox"
                            name={ tag }
                            checked={ props.showingTags.includes(tag) }
                            onChange={ handleShowingTagChange }
                            className="vehicle-filter-by-tag__checkbox"
                        />
                        <span className="font-weight-light">{ tag }</span>
                    </Label>
                </FormGroup>
            ))}
        </>
    );
};

VehicleFilterByTag.propTypes = {
    mergeVehicleFilters: PropTypes.func.isRequired,
    showingTags: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default connect(
    state => ({
        showingTags: getVehiclesFilterShowingTags(state),
    }),
    { mergeVehicleFilters },
)(VehicleFilterByTag);
