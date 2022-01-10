import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es/lodash.default';
import TokenMultiSelect from '../../../Common/TokenMultiSelect/TokenMultiSelect';
import SearchTheme from '../search-theme';
import { getAgencies } from '../../../../redux/selectors/control/agencies';
import { retrieveAgencies } from '../../../../redux/actions/control/agencies';


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
    }

    static defaultProps = {
        className: '',
        id: 'depot-filter',
        selectedAgency: '',
    }

    componentDidMount() { if (_.isEmpty(this.props.agencies)) this.props.retrieveAgencies(); }

    getOptions() {
        if (this.props.selectedAgency) {
            const agency = this.props.agencies.find(a => a.agencyId === this.props.selectedAgency);
            return agency ? agency.depots.map(depot => ({ value: depot.depotId, label: depot.depotName })) : [];
        }
        return [];
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
                    options={ this.getOptions() }
                    selectedValues={ this.props.selectedOptions }
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

export default connect(state => ({
    agencies: getAgencies(state),
}),
{ retrieveAgencies })(FilterByDepot);
