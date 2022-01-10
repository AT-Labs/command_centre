import PropTypes from 'prop-types';
import React from 'react';
import { IconContext } from 'react-icons';
import { FaTimes } from 'react-icons/fa';
import { BsArrowRight } from 'react-icons/bs';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { mergeVehicleFilters } from '../../../redux/actions/realtime/vehicles';
import { getVehiclesFilterRouteType } from '../../../redux/selectors/realtime/vehicles';
import VehicleFilterByDirection from './VehicleFilterByDirection';
import VehicleFilterByOperator from './VehicleFilterByOperator';
import VehicleFilterByRouteType from './VehicleFilterByRouteType';
import VehicleFilterByDelay from './VehicleFilterByDelay/VehicleFilterByDelay';
import VehicleFilterByOccupancy from './VehicleFilterByOccupancy';
import './VehicleFilters.scss';

class VehicleFilters extends React.PureComponent {
    static propTypes = {
        mergeVehicleFilters: PropTypes.func.isRequired,
        routeType: PropTypes.number,
    };

    static defaultProps = {
        routeType: null,
    };

    state = {
        isActive: false,
    };

    toggleActive = () => this.setState(prevState => ({ isActive: !prevState.isActive }));

    clearFilters = () => this.props.mergeVehicleFilters({
        routeType: null,
        isShowingNIS: false,
        showingDelay: {},
        showingOccupancyLevels: [],
    });

    render() {
        const { routeType } = this.props;
        return (
            <section className={ `vehicle-filters ${this.state.isActive ? 'vehicle-filters--is-active' : ''}` }>
                <Button className="vehicle-filters-handle border-0 rounded-0 cc-btn-secondary" onClick={ this.toggleActive }>
                    <span>
                        Filters
                        <BsArrowRight className="arrow-icon" size={ 16 } />
                    </span>
                </Button>
                <div className="vehicle-filters-content">
                    <div><VehicleFilterByRouteType /></div>
                    {!!routeType && (
                        <React.Fragment>
                            <VehicleFilterByOperator />
                            <div className="mt-3 mb-1">Settings</div>
                            <VehicleFilterByDirection />
                            <hr className="vehicle-filters__separator mt-2 mb-2" />
                        </React.Fragment>
                    )}
                    <VehicleFilterByDelay />
                    <hr className="vehicle-filters__separator mt-2 mb-2" />
                    <VehicleFilterByOccupancy />
                    <hr className="vehicle-filters__separator mt-2 mb-2" />
                    <div className="text-right">
                        <Button
                            className="vehicle-filters__clear-button cc-btn-link pr-0"
                            tabIndex="0"
                            aria-label="Vehicle filters clear button"
                            onClick={ this.clearFilters }>
                            Clear filters&nbsp;
                            <IconContext.Provider value={ { className: 'text-info' } }>
                                <FaTimes size={ 16 } />
                            </IconContext.Provider>
                        </Button>
                    </div>
                </div>
            </section>
        );
    }
}

export default connect(state => ({
    routeType: getVehiclesFilterRouteType(state),
}), { mergeVehicleFilters })(VehicleFilters);
