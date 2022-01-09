import _ from 'lodash-es';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';

import './VehicleFilterByOperator.scss';
import {
    getVehiclesFilterAgencyIds,
    getVehiclesFilterAgencies,
    getVehiclesFilterRouteType,
} from '../../../redux/selectors/realtime/vehicles';
import { TRAIN_TYPE_ID, BUS_TYPE_ID, FERRY_TYPE_ID } from '../../../types/vehicle-types';
import { mergeVehicleFilters } from '../../../redux/actions/realtime/vehicles';
import FilterByOperator from '../../Control/Common/Filters/FilterByOperator';

export const DEFAULT_AGENCY_ID = null;

const getFilterByOperatorPlaceholder = (routeType) => {
    switch (routeType) {
    case BUS_TYPE_ID:
        return 'All bus operators';
    case TRAIN_TYPE_ID:
        return 'All train operators';
    case FERRY_TYPE_ID:
        return 'All ferry operators';
    default:
        return 'All operators';
    }
};

const getDefaultOption = routeType => ({ value: DEFAULT_AGENCY_ID, label: getFilterByOperatorPlaceholder(routeType) });

class VehicleFilterByOperator extends React.Component {
    static propTypes = {
        agencyOptions: PropTypes.array.isRequired,
        selectedAgencyIds: PropTypes.arrayOf(PropTypes.string),
        routeType: PropTypes.number.isRequired,
        mergeVehicleFilters: PropTypes.func.isRequired,
    };

    static defaultProps = {
        selectedAgencyIds: null,
    };

    updateVehicleFilters = agencyIds => this.props.mergeVehicleFilters({ agencyIds });

    handleFilterByOperatorSelection = selectedOption => this.updateVehicleFilters(selectedOption.value ? [selectedOption.value] : null);

    handleCheckboxValueChange = (event, agencyId) => {
        let newSelectedAgencyIds = this.props.selectedAgencyIds;
        if (this.props.selectedAgencyIds === null) {
            newSelectedAgencyIds = _.map(_.filter(this.props.agencyOptions, option => option.value), option => option.value);
        }
        if (event.target.checked === false) {
            this.updateVehicleFilters(_.filter(newSelectedAgencyIds, saId => saId !== agencyId));
        } else if (newSelectedAgencyIds.indexOf(agencyId) === -1) {
            this.updateVehicleFilters(newSelectedAgencyIds.concat([agencyId]));
        }
    };

    getSelectedOption = () => (!_.isNull(this.props.selectedAgencyIds)
        ? this.props.agencyOptions.filter(option => option.value === this.props.selectedAgencyIds[0])[0] || getDefaultOption(this.props.routeType)
        : getDefaultOption(this.props.routeType)).value;

    render() {
        return (
            <>
                {
                    this.props.routeType === BUS_TYPE_ID ? (
                        <FilterByOperator
                            id="operators-search"
                            className="vehicle-filter-by-operator mb-0"
                            customData={ this.props.agencyOptions }
                            placeholder={ getFilterByOperatorPlaceholder(this.props.routeType) }
                            selectedOption={ this.getSelectedOption() }
                            onSelection={ this.handleFilterByOperatorSelection } />
                    ) : (
                        <>
                            <h6 className="mt-3 mb-1">Operators</h6>
                            {
                                _.map(this.props.agencyOptions, (option, index) => (
                                    index > 0 && (
                                        <FormGroup check key={ option.value }>
                                            <Label check>
                                                <Input
                                                    type="checkbox"
                                                    checked={
                                                        this.props.selectedAgencyIds === null
                                                        || this.props.selectedAgencyIds.indexOf(option.value) > -1
                                                    }
                                                    onChange={ event => this.handleCheckboxValueChange(event, option.value) }
                                                    className="vehicle-filter-by-operator__checkbox" />
                                                <span className="font-weight-light">{ option.label }</span>
                                            </Label>
                                        </FormGroup>
                                    )
                                ))
                            }
                        </>
                    )
                }
            </>
        );
    }
}

export default connect(
    state => ({
        agencyOptions: ((s) => {
            const agencies = getVehiclesFilterAgencies(s);
            const routeType = getVehiclesFilterRouteType(s);
            return [getDefaultOption(routeType)].concat(agencies.map(agency => ({ value: agency.agency_id, label: agency.agency_name })));
        })(state),
        selectedAgencyIds: getVehiclesFilterAgencyIds(state),
        routeType: getVehiclesFilterRouteType(state),
    }),
    { mergeVehicleFilters },
)(VehicleFilterByOperator);
