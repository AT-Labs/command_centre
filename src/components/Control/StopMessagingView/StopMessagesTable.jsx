import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';

import { updateStopMessagesSortingParams } from '../../../redux/actions/control/stopMessaging';
import Stops from './Stops';
import SortButton from '../Common/SortButton/SortButton';
import ControlTable from '../Common/ControlTable/ControlTable';
import { getExpiredMessageRowClassName } from '../../../utils/helpers';
import { goToDisruptionsView } from '../../../redux/actions/control/link';

const dateFormat = 'DD/MM/YY HH:mm';

export const StopMessagesTable = (props) => {
    const onClickHandler = (sortBy, order) => props.updateStopMessagesSortingParams({ sortBy, order });

    const activeOrder = (key) => {
        const { stopMessagesSortingParams } = props;
        return stopMessagesSortingParams && stopMessagesSortingParams.sortBy === key ? stopMessagesSortingParams.order : null;
    };

    const showDisruption = (stopMessage) => {
        if (!stopMessage.incidentNo) return null;
        return (
            <button type="button" className="btn btn-link text-info" onClick={ () => props.goToDisruptionsView(stopMessage, { setActiveDisruption: true }) }>
                {stopMessage.incidentNo}
            </button>
        );
    };

    const columns = [
        {
            label: () => (
                <div className="d-flex align-content-center">
                    <SortButton
                        className="mr-1"
                        active={ activeOrder('startTime') }
                        onClick={ order => onClickHandler('startTime', order) } />
                    <div>start</div>
                </div>
            ),
            key: 'startTime',
            cols: 'col-1',
            getContent: (stopMessage, key) => moment(stopMessage[key]).format(dateFormat),
        },
        {
            label: () => (
                <div className="d-flex align-content-center">
                    <SortButton
                        className="mr-1"
                        active={ activeOrder('endTime') }
                        onClick={ order => onClickHandler('endTime', order) } />
                    <div>end</div>
                </div>
            ),
            key: 'endTime',
            cols: 'col-1',
            getContent: ({ endTime }) => (endTime ? moment(endTime).format(dateFormat) : ''),
        },
        {
            label: 'DISRUPTION#',
            key: 'incidentNo',
            cols: 'col-1',
            getContent: stopMessage => showDisruption(stopMessage),
        },
        {
            label: 'displaying on',
            key: 'stopsAndGroups',
            cols: 'col-2',
            getContent: (stopMessage, key) => <Stops stopMessage={ stopMessage } messageKey={ key } />,
        },
        {
            label: 'message',
            key: 'message',
            cols: 'col-2 control-messaging-view__message',
        },
        {
            label: 'priority',
            key: 'priority',
            cols: 'col-1',
        },
        {
            label: 'status',
            key: 'status',
            cols: 'col-1',
        },
        {
            label: 'timestamp',
            key: 'timestamp',
            cols: 'col-1',
            getContent: (stopMessage, key) => moment(stopMessage[key]).format(dateFormat),
        },
        {
            label: 'creator',
            key: 'user',
            cols: 'col-1 text-truncate',
        },
        {
            label: '',
            key: '',
            cols: 'col-1',
            getContent: stopMessage => props.renderActionsButtons(stopMessage),
        },
    ];

    return (
        <ControlTable
            columns={ columns }
            data={ props.messages }
            isLoading={ props.isLoading }
            rowClassName={ getExpiredMessageRowClassName }
            isExpandable={ false } />
    );
};

StopMessagesTable.propTypes = {
    messages: PropTypes.array.isRequired,
    isLoading: PropTypes.bool.isRequired,
    stopMessagesSortingParams: PropTypes.object.isRequired,
    renderActionsButtons: PropTypes.func.isRequired,
    updateStopMessagesSortingParams: PropTypes.func.isRequired,
    goToDisruptionsView: PropTypes.func.isRequired,
};

export default connect(null, { updateStopMessagesSortingParams, goToDisruptionsView })(StopMessagesTable);
