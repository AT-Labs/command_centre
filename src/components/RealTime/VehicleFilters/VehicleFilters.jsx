import PropTypes from 'prop-types';
import React from 'react';
import { IconContext } from 'react-icons';
import { FaTimes } from 'react-icons/fa';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { mergeVehicleFilters } from '../../../redux/actions/realtime/vehicles';
import { getVehiclesFilterIsActive } from '../../../redux/selectors/realtime/vehicles';
import VehicleFilterByDirection from './VehicleFilterByDirection';
import VehicleFilterByNIS from './VehicleFilterByNIS';
import VehicleFilterByOperator from './VehicleFilterByOperator';
import VehicleFilterByRouteType from './VehicleFilterByRouteType';
import './VehicleFilters.scss';

class VehicleFilters extends React.PureComponent {
    static propTypes = {
        isActive: PropTypes.bool.isRequired,
        mergeVehicleFilters: PropTypes.func.isRequired,
    };

    render() {
        return (
            <section className={ `vehicle-filters ${this.props.isActive ? 'vehicle-filters--is-active' : ''}` }>
                <div><VehicleFilterByRouteType /></div>
                {this.props.isActive && (
                    <React.Fragment>
                        <VehicleFilterByOperator />
                        <div className="text-white mt-3 mb-1">Settings</div>
                        <VehicleFilterByDirection />
                        <VehicleFilterByNIS />
                        <hr className="vehicle-filters__separator mt-2 mb-2" />
                        <div className="text-right">
                            <Button
                                className="vehicle-filters__clear-button cc-btn-link text-white pr-0"
                                tabIndex="0"
                                aria-label="Vehicle filters clear button"
                                onClick={ () => this.props.mergeVehicleFilters({ routeType: null }) }>
                                Clear filters&nbsp;
                                <IconContext.Provider value={ { className: 'text-info' } }>
                                    <FaTimes size={ 16 } />
                                </IconContext.Provider>
                            </Button>
                        </div>
                    </React.Fragment>
                )}
            </section>
        );
    }
}

export default connect(state => ({
    isActive: getVehiclesFilterIsActive(state),
}), { mergeVehicleFilters })(VehicleFilters);
