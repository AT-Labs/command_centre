import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash-es';
import TokenMultiSelect from '../../../Common/TokenMultiSelect/TokenMultiSelect';
import SearchTheme from '../search-theme';
import { getAgencies } from '../../../../redux/selectors/control/agencies';
import { retrieveAgencies } from '../../../../redux/actions/control/agencies';
import { getAgencyDepotsOptions } from '../../../../utils/helpers';

const DepotType = PropTypes.shape({
    depotId: PropTypes.string.isRequired,
    depotName: PropTypes.string.isRequired,
});

const AgencyType = PropTypes.shape({
    agencyId: PropTypes.string.isRequired,
    agencyName: PropTypes.string.isRequired,
    depots: PropTypes.arrayOf(DepotType),
});

class FilterByDepot extends React.Component {
    static propTypes = {
        agencies: PropTypes.arrayOf(AgencyType).isRequired,
        retrieveAgencies: PropTypes.func.isRequired,
        selectedAgency: PropTypes.string,
        selectedOptions: PropTypes.array.isRequired,
        onSelection: PropTypes.func.isRequired,
        className: PropTypes.string,
        id: PropTypes.string,
    };

    static defaultProps = {
        className: '',
        id: 'depot-filter',
        selectedAgency: '',
    };

    componentDidMount() { if (isEmpty(this.props.agencies)) this.props.retrieveAgencies(); }

    getSelectedValues() {
        if (isEmpty(this.props.agencies)) {
            return [];
        }
        return getAgencyDepotsOptions(this.props.selectedAgency, this.props.agencies)
            .filter(({ value }) => this.props.selectedOptions.includes(value))
            .map(({ value }) => value);
    }

    render() {
        return (
            <section className={ `control-search ${this.props.className}` }>
                <label // eslint-disable-line
                    htmlFor={ `${this.props.id}-input` }
                    className="font-size-md font-weight-bold">
                    Depots
                </label>
                <TokenMultiSelect
                    id={ this.props.id }
                    theme={ SearchTheme }
                    options={ getAgencyDepotsOptions(this.props.selectedAgency, this.props.agencies) }
                    selectedValues={ this.getSelectedValues() }
                    onSelectionChange={ this.props.onSelection }
                    disabled={ !this.props.selectedAgency }
                    displayProps={ {
                        SELECT_ALL: 'All Depots',
                        ALL_OPTIONS_ARE_SELECTED: 'All Depots',
                        DEFAULT_PLACEHOLDER: 'Select Depots',
                    } }
                />
            </section>
        );
    }
}

export default connect(
    state => ({
        agencies: getAgencies(state),
    }),
    { retrieveAgencies },
)(FilterByDepot);
