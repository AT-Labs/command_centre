import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash-es';

import { getAllRoutes } from '../../../../../redux/selectors/static/routes';
import ControlSearch from '../../ControlSearch/ControlSearch';

class FilterByRoute extends React.Component {
    static propTypes = {
        routes: PropTypes.object.isRequired,
        selectedOption: PropTypes.string.isRequired,
        onSelection: PropTypes.func.isRequired,
        className: PropTypes.string,
        id: PropTypes.string,
    }

    static defaultProps = {
        className: '',
        id: 'route-filter',
    }

    onInputValueChange = (value) => { if (!value) this.props.onSelection({ value: '', label: '' }); }

    getOptions = () => _.map(this.props.routes, route => ({ value: route.route_id, label: route.route_short_name }))

    getSelectedOption = () => this.getOptions().filter(option => option.label === this.props.selectedOption)[0] || {}

    render() {
        return (
            <ControlSearch
                id={ this.props.id }
                inputId={ `${this.props.id}-input` }
                className={ this.props.className }
                label="Routes"
                data={ this.getOptions() }
                pathToProperty="label"
                placeholder="Search route"
                shouldRenderSuggestions={ value => value.length > 0 }
                shouldShowArrow={ false }
                onSelection={ selectedOption => this.props.onSelection(selectedOption) }
                onInputValueChange={ this.onInputValueChange }
                value={ _.get(this.getSelectedOption(), 'label') } />
        );
    }
}

export default connect(state => ({
    routes: getAllRoutes(state),
}))(FilterByRoute);
