import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Label } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import Icon from '../../../Common/Icon/Icon';

const FilterByDate = (props) => {
    const refPickr = useRef(null);

    const clearDate = () => {
        refPickr.current.flatpickr.clear();
    };

    const datePickerOptions = {
        enableTime: false,
        dateFormat: 'j F Y',
    };

    return (
        <>
            {props.label && (<Label>{ props.label }</Label>)}
            <div className="position-relative">
                <Flatpickr
                    className="form-control cc-form-control"
                    value={ props.selectedDate }
                    options={ {
                        ...datePickerOptions,
                        minDate: props.minDate,
                        maxDate: props.maxDate,
                    } }
                    placeholder="Select date"
                    onChange={ date => props.onChange(date) }
                    ref={ refPickr } />
                { props.selectedDate && (
                    <button
                        type="button"
                        className="close filter-by-date__clear position-absolute bg-transparent border-0"
                        onClick={ () => {
                            clearDate();
                            props.onChange(null);
                        } }>
                        <Icon
                            aria-hidden="true"
                            icon="close" />
                    </button>
                ) }
            </div>
        </>
    );
};

FilterByDate.propTypes = {
    selectedDate: PropTypes.object,
    minDate: PropTypes.object,
    maxDate: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    label: PropTypes.string,
};

FilterByDate.defaultProps = {
    selectedDate: null,
    minDate: null,
    maxDate: null,
    label: '',
};

export default FilterByDate;
