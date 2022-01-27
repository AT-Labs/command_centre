import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment-timezone';
import { IoMdArrowDropleft, IoMdArrowDropright } from 'react-icons/io';

import { getServiceDate } from '../../../../redux/selectors/control/serviceDate';
import { updateServiceDate } from '../../../../redux/actions/control/serviceDate';
import DATE_TYPE from '../../../../types/date-types';

export class ServiceDatePicker extends React.Component {
    static propTypes = {
        serviceDate: PropTypes.string.isRequired,
        updateServiceDate: PropTypes.func.isRequired,
        isServiceDatePickerDisabled: PropTypes.bool,
    };

    static defaultProps = {
        isServiceDatePickerDisabled: false,
    };

    nameDate = date => moment.tz(date, DATE_TYPE.TIME_ZONE).calendar(null, {
        sameDay: `[${DATE_TYPE.TODAY}]`,
        nextDay: `[${DATE_TYPE.TOMORROW}]`,
        lastDay: `[${DATE_TYPE.YESTERDAY}]`,
    })
    || moment(date).format('DD MMM');

    addDay = date => moment(date).add(1, 'day').format();

    subtractDay = date => moment(date).subtract(1, 'day').format();

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
                        onClick={ () => this.props.updateServiceDate(this.subtractDay(serviceDate)) }>
                        <IoMdArrowDropleft size={ 18 } />
                    </button>
                    <button
                        className={ `${isServiceDateTomorrow ? 'text-secondary' : 'text-info'} bg-transparent border-0 px-1` }
                        type="button"
                        aria-label={ this.nameDate(this.addDay(serviceDate)) }
                        disabled={ isServiceDateTomorrow }
                        onClick={ () => this.props.updateServiceDate(this.addDay(serviceDate)) }>
                        <IoMdArrowDropright size={ 18 } />
                    </button>
                </div>
            </section>
        );
    }
}

export default connect(state => ({
    serviceDate: getServiceDate(state),
}), { updateServiceDate })(ServiceDatePicker);
