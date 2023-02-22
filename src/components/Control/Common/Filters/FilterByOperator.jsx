import { isEmpty } from 'lodash-es';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { retrieveAgencies } from '../../../../redux/actions/control/agencies';
import { getAgencies } from '../../../../redux/selectors/control/agencies';
import ControlSearch from '../ControlSearch/ControlSearch';

const AgencyType = PropTypes.shape({
    agencyId: PropTypes.string.isRequired,
    agencyName: PropTypes.string.isRequired,
});

class FilterByOperator extends React.Component {
    static propTypes = {
        agencies: PropTypes.arrayOf(AgencyType).isRequired,
        selectedOption: PropTypes.string,
        retrieveAgencies: PropTypes.func.isRequired,
        onSelection: PropTypes.func.isRequired,
        className: PropTypes.string,
        id: PropTypes.string,
        placeholder: PropTypes.string,
        customData: PropTypes.array,
        isDisabled: PropTypes.bool,
    };

    static defaultProps = {
        className: '',
        id: 'operator-filter',
        selectedOption: '',
        placeholder: 'Select operator',
        customData: null,
        isDisabled: false,
    };

    componentDidMount() { if (isEmpty(this.props.agencies)) this.props.retrieveAgencies(); }

    onInputValueChange = (value) => { if (!value) this.props.onSelection({ value: '', label: '' }); };

    getOptions = () => this.props.agencies.map(agency => ({ value: agency.agencyId, label: agency.agencyName }));

    getSelectedOption = () => this.getOptions().filter(option => option.value === this.props.selectedOption)[0] || {};

    render() {
        return (
            <ControlSearch
                id={ this.props.id }
                inputId={ `${this.props.id}-input` }
                className={ this.props.className }
                label="Operators"
                data={ this.props.customData || this.getOptions() }
                pathToProperty="label"
                placeholder={ this.props.placeholder }
                onSelection={ selectedOption => this.props.onSelection(selectedOption) }
                onInputValueChange={ this.onInputValueChange }
                value={ this.getSelectedOption().label || '' }
                disabled={ this.props.isDisabled }
                updateOnPropsValueChange />
        );
    }
}

export default connect(
    state => ({
        agencies: getAgencies(state),
    }),
    { retrieveAgencies },
)(FilterByOperator);
