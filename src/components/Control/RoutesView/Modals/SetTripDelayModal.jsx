import React from 'react';
import PropTypes from 'prop-types';
import { toNumber, isFinite } from 'lodash-es';
import { Input } from 'reactstrap';

import { formatTripDelay, unformatTripDelay } from '../../../../utils/control/routes';
import { TripInstanceType } from '../Types';
import CustomModal from '../../../Common/CustomModal/CustomModal';

class SetTripDelayModal extends React.Component {
    static propTypes = {
        tripInstance: TripInstanceType.isRequired,
        isOpen: PropTypes.bool.isRequired,
        onAction: PropTypes.func.isRequired,
        onClose: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        const { delay } = this.props.tripInstance;

        this.state = {
            delay,
            formattedDelay: formatTripDelay(delay),
            isActionDisabled: !delay,
            isDelayInvalid: false,
        };
    }

    handleDelayChange = (event) => {
        const { value } = event.target;
        const delay = toNumber(value);
        // value.includes('.') is to detect float. The tricky case is when value is 5.00
        const isInvalid = !isFinite(delay) || value.includes('.');

        this.setState({
            formattedDelay: value,
            delay: unformatTripDelay(delay),
            isActionDisabled: !value || isInvalid,
            isDelayInvalid: isInvalid && value !== '-',
        });
    };

    render() {
        const { routeLongName, routeShortName, delay } = this.props.tripInstance;
        const label = `${delay ? 'Edit' : 'Set'} trip delay`;

        return (
            <CustomModal
                className=""
                title={ label }
                okButton={ {
                    label,
                    onClick: () => this.props.onAction(this.state.delay),
                    isDisabled: this.state.isActionDisabled,
                } }
                onClose={ this.props.onClose }
                isModalOpen={ this.props.isOpen }
            >
                <div className="row mb-3">
                    <div className="col-4 font-weight-bold">Trip:</div>
                    <div className="col-8">
                        {routeShortName}
                        {' '}
                        {routeLongName}
                    </div>
                </div>
                <div className="row">
                    <div className="col-4 font-weight-bold">Delay time (mins):</div>
                    <div className="col-8">
                        <Input
                            type="text"
                            name="trip-delay"
                            id="trip-delay"
                            placeholder="e.g. 10"
                            value={ this.state.formattedDelay || '' }
                            onChange={ this.handleDelayChange }
                            invalid={ this.state.isDelayInvalid }
                        />
                    </div>
                </div>
            </CustomModal>
        );
    }
}

export default SetTripDelayModal;
