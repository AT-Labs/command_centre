import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import { IoMdArrowDropleft, IoMdArrowDropright } from 'react-icons/io';

import { getServiceDate } from '../../../../redux/selectors/control/serviceDate';
import { updateServiceDate } from '../../../../redux/actions/control/serviceDate';
import { deselectAllTrips } from '../../../../redux/actions/control/routes/trip-instances';
import DATE_TYPE from '../../../../types/date-types';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import { getSelectedTripsKeys } from '../../../../redux/selectors/control/routes/trip-instances';

export class ServiceDatePicker extends React.Component {
    static propTypes = {
        serviceDate: PropTypes.string.isRequired,
        updateServiceDate: PropTypes.func.isRequired,
        isServiceDatePickerDisabled: PropTypes.bool,
        deselectAllTrips: PropTypes.func.isRequired,
        selectedTrips: PropTypes.array.isRequired,
    };

    static defaultProps = {
        isServiceDatePickerDisabled: false,
    };

    constructor(props) {
        super(props);

        this.state = {
            isModalOpen: false,
        };
    }

    nameDate = date => moment.tz(date, DATE_TYPE.TIME_ZONE).calendar(null, {
        sameDay: `[${DATE_TYPE.TODAY}]`,
        nextDay: `[${DATE_TYPE.TOMORROW}]`,
        lastDay: `[${DATE_TYPE.YESTERDAY}]`,
    })
    || moment(date).format('DD MMM');

    addDay = date => moment(date).add(1, 'day').format();

    subtractDay = date => moment(date).subtract(1, 'day').format();

    serviceDateToUpdate = null;

    updateServiceDate = (date) => {
        this.serviceDateToUpdate = date;

        if (this.props.selectedTrips && this.props.selectedTrips.length > 0) {
            this.setState({ isModalOpen: true });
        } else {
            this.props.updateServiceDate(date);
        }
    };

    handleModalClose = () => {
        this.setState({ isModalOpen: false });
    };

    handleChangeDate = () => {
        this.props.updateServiceDate(this.serviceDateToUpdate);
        this.props.deselectAllTrips();
        this.handleModalClose();
    };

    render() {
        const { serviceDate, isServiceDatePickerDisabled } = this.props;
        const dateName = this.nameDate(serviceDate);
        const isServiceDateYesterday = dateName === DATE_TYPE.YESTERDAY || isServiceDatePickerDisabled;
        const isServiceDateTomorrow = dateName === DATE_TYPE.TOMORROW || isServiceDatePickerDisabled;

        return (
            <section className="service-date-picker d-flex flex-row">
                <h3 className="font-weight-light">
                    { this.nameDate(serviceDate) }
                    <small className="d-block">{ moment(serviceDate).format('DD-MM-YYYY') }</small>
                </h3>
                <div className="align-self-start">
                    <button
                        className={ `${isServiceDateYesterday ? 'text-secondary' : 'text-info'} bg-transparent border-0 px-1` }
                        type="button"
                        aria-label={ this.nameDate(this.subtractDay(serviceDate)) }
                        disabled={ isServiceDateYesterday }
                        onClick={ () => this.updateServiceDate(this.subtractDay(serviceDate)) }>
                        <IoMdArrowDropleft size={ 18 } />
                    </button>
                    <button
                        className={ `${isServiceDateTomorrow ? 'text-secondary' : 'text-info'} bg-transparent border-0 px-1` }
                        type="button"
                        aria-label={ this.nameDate(this.addDay(serviceDate)) }
                        disabled={ isServiceDateTomorrow }
                        onClick={ () => this.updateServiceDate(this.addDay(serviceDate)) }>
                        <IoMdArrowDropright size={ 18 } />
                    </button>
                </div>
                <ConfirmationModal
                    title="Change Service Date"
                    message="Trips have been selected in Routes and Trips, changing the service date will deselect these trips. Do you wish to continue?"
                    isOpen={ this.state.isModalOpen }
                    onClose={ this.handleModalClose }
                    onAction={ this.handleChangeDate } />
            </section>
        );
    }
}

export default connect(state => ({
    serviceDate: getServiceDate(state),
    selectedTrips: getSelectedTripsKeys(state),
}), { updateServiceDate, deselectAllTrips })(ServiceDatePicker);
