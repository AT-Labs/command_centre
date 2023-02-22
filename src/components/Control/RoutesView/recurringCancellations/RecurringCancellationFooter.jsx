import React from 'react';
import { size } from 'lodash-es';
import PropTypes from 'prop-types';
import { Button } from 'reactstrap';
import { IoIosCloseCircle } from 'react-icons/io';
import './RecurringCancellationsView.scss';

const RecurringCancellationFooter = (props) => {
    const { selectedRow } = props;

    return (
        <div className="recurring-cancellation-selection-footer d-flex align-items-center ml-3 mr-3">
            <div>
                <span className="recurring-cancellation-selection-footer__trips-amount">
                    { `${size(selectedRow)} trips selected` }
                </span>
            </div>
            <div className="border-right">
                <Button
                    className="recurring-cancellation-selection-footer__btn-deselect cc-btn-link pb-2"
                    onClick={ props.deselectAllRecurringCancellations }>
                    Deselect all
                </Button>
            </div>
            <div className="align-item-center ml-3">
                <Button
                    size="sm"
                    className="recurring-cancellation-selection-footer__btn-cancel cc-btn-secondary d-flex align-items-center mr-3"
                    onClick={ props.onClick }>
                    <IoIosCloseCircle size={ 20 } />
                    Delete Recurring Cancellations
                </Button>
            </div>
        </div>
    );
};

RecurringCancellationFooter.propTypes = {
    selectedRow: PropTypes.array,
    deselectAllRecurringCancellations: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
};

RecurringCancellationFooter.defaultProps = {
    selectedRow: [],
};

export default RecurringCancellationFooter;
