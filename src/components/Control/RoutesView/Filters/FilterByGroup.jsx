import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';

import { mergeRouteFilters } from '../../../../redux/actions/control/routes/filters';
import {
    getGroupedByRouteFilter,
    getGroupedByRouteVariantFilter,
} from '../../../../redux/selectors/control/routes/filters';


class FilterByGroup extends React.Component {
    static propTypes = {
        isGroupedByRouteVariant: PropTypes.bool.isRequired,
        isGroupedByRoute: PropTypes.bool.isRequired,
        mergeRouteFilters: PropTypes.func.isRequired,
    };

    handleRouteGroupingChange = (event) => {
        this.props.mergeRouteFilters({ isGroupedByRouteVariant: this.props.isGroupedByRouteVariant, isGroupedByRoute: event.target.checked });
    };

    handleRouteVariantGroupingChange = (event) => {
        this.props.mergeRouteFilters({ isGroupedByRouteVariant: event.target.checked, isGroupedByRoute: this.props.isGroupedByRoute });
    };

    render() {
        return (
            <div>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            checked={ this.props.isGroupedByRoute }
                            onChange={ this.handleRouteGroupingChange }
                            className="filter-group-by-route"
                        />
                        <span className="font-weight-light">Group by route</span>
                    </Label>
                </FormGroup>
                <FormGroup check>
                    <Label check>
                        <Input
                            type="checkbox"
                            checked={ this.props.isGroupedByRouteVariant }
                            onChange={ this.handleRouteVariantGroupingChange }
                            className="filter-group-by-route-variant"
                        />
                        <span className="font-weight-light">Group by route variant</span>
                    </Label>
                </FormGroup>
            </div>
        );
    }
}

export default connect(state => ({
    isGroupedByRouteVariant: getGroupedByRouteVariantFilter(state),
    isGroupedByRoute: getGroupedByRouteFilter(state),
}),
{ mergeRouteFilters })(FilterByGroup);
