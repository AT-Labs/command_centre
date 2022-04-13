import PropTypes from 'prop-types';
import React from 'react';
import { includes, without } from 'lodash-es';
import classNames from 'classnames';
import { Button } from 'reactstrap';
import './WeekdayPicker.scss';

const WeekdayPicker = (props) => {
    const weekdaysLabel = {
        0: 'M',
        1: 'T',
        2: 'W',
        3: 'T',
        4: 'F',
        5: 'S',
        6: 'S',
    };

    const isWeekdaySelected = weekday => includes(props.selectedWeekdays, weekday);

    const toggleWeekday = (weekday) => {
        if (isWeekdaySelected(weekday)) {
            props.onUpdate(without(props.selectedWeekdays, weekday));
        } else {
            props.onUpdate([...props.selectedWeekdays, weekday].sort());
        }
    };

    return (
        <div className="weekday-picker pl-0 mb-2">
            {Object.keys(weekdaysLabel).map(weekday => (
                <Button
                    key={ weekday }
                    className={ classNames('weekday-picker__day', { selected: isWeekdaySelected(+weekday) }) }
                    onClick={ () => toggleWeekday(+weekday) }
                    disabled={ props.disabled }
                >
                    {weekdaysLabel[weekday]}
                </Button>
            ))}
        </div>
    );
};

WeekdayPicker.propTypes = {
    selectedWeekdays: PropTypes.array.isRequired,
    onUpdate: PropTypes.func,
    disabled: PropTypes.bool,
};

WeekdayPicker.defaultProps = {
    disabled: false,
    onUpdate: null,
};

export default WeekdayPicker;
