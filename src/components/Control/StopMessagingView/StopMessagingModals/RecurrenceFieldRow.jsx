import React from 'react';
import PropTypes from 'prop-types';
import { xor } from 'lodash-es';

import { getNumbersSequence } from '../../../../utils/helpers';
import StandardFilter from '../../Common/Filters/StandardFilter';
import CustomButtonGroup from '../../../Common/CustomButtonGroup/CustomButtonGroup';
import { DAYS_OF_THE_WEEK } from '../../../../utils/control/messages';

const RECURRENCE_MAX = 13;
const weekOptions = [
    ...getNumbersSequence(1, RECURRENCE_MAX).map(String),
];
// CustomButtonGroup only allows Strings as options so we parse day.value to string.
const daysOfTheWeekButtons = DAYS_OF_THE_WEEK.map(day => ({ type: day.value.toString(), label: day.label[0] }));

export default class RecurrenceFieldRow extends React.PureComponent {
    static propTypes = {
        recurrence: PropTypes.object.isRequired,
        onUpdate: PropTypes.func.isRequired,
    };

    toggleModal = () => this.setState(prevState => ({ isModalOpen: !prevState.isModalOpen }));

    updateDay = (dayString) => {
        // CustomButtonGroup only allows Strings as options so we need to cast it back to Number now
        const day = Number(dayString);
        const days = xor(this.props.recurrence.days || [], [day]);
        this.updateRecurrence({ days });
    };

    updateWeeks = (weeks) => {
        this.updateRecurrence({ weeks: Number(weeks) });
    };

    updateRecurrence = (recurrence) => {
        this.props.onUpdate({
            ...this.props.recurrence,
            ...recurrence,
        });
    };

    render() {
        const { recurrence } = this.props;

        return (
            <div className="row">
                <div className="col-3">
                    <StandardFilter
                        id="messaging-recurrence"
                        className="message-modal__recurrence"
                        title="Recurrence (in weeks):"
                        placeholder="Never"
                        selectedOption={ String(recurrence.weeks) }
                        options={ weekOptions }
                        onSelection={ selectedOption => this.updateWeeks(selectedOption.value) }
                    />
                </div>
                {!!recurrence.weeks && (
                    <div className="col-9">
                        { /* eslint-disable-next-line jsx-a11y/label-has-associated-control, jsx-a11y/label-has-for */ }
                        <label>Days</label>
                        {/* CustomButtonGroup only allows Strings as selectedOptions so we parse recurrence.days to string. */}
                        <CustomButtonGroup
                            buttons={ daysOfTheWeekButtons }
                            selectedOptions={ recurrence.days.map(String) || [] }
                            className="d-block"
                            onSelection={ toggleDay => this.updateDay(toggleDay) } />
                    </div>
                )}
            </div>
        );
    }
}
