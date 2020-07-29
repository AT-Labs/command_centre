import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { updateActiveDisruptionId, updateCopyDisruptionState } from '../../../redux/actions/control/disruptions';
import { getActiveDisruptionId } from '../../../redux/selectors/control/disruptions';
import { STATUSES, CAUSES, IMPACTS, DEFAULT_IMPACT, DEFAULT_CAUSE } from '../../../types/disruptions-types';
import {
    DATE_FORMAT,
    LABEL_AFFECTED_ROUTES,
    LABEL_CAUSE, LABEL_CUSTOMER_IMPACT, LABEL_DISRUPTION, LABEL_END_TIME,
    LABEL_MODE, LABEL_START_DATE,
    LABEL_START_TIME, LABEL_STATUS,
    TIME_FORMAT,
} from '../../../constants/disruptions';
import ControlTable from '../Common/ControlTable/ControlTable';
import DisruptionDetail from './DisruptionDetail';

class DisruptionsTable extends React.Component {
    static propTypes = {
        disruptions: PropTypes.array,
        updateActiveDisruptionId: PropTypes.func.isRequired,
        activeDisruptionId: PropTypes.number,
        updateCopyDisruptionState: PropTypes.func.isRequired,
    }

    static defaultProps = {
        disruptions: [],
        activeDisruptionId: null,
    }

    constructor(props) {
        super(props);

        this.DISRUPTION_TABLE_COLUMNS = [
            {
                label: `${LABEL_DISRUPTION}#`,
                key: 'incidentNo',
                cols: 'col-1',
            },
            {
                label: LABEL_MODE,
                key: 'mode',
                cols: 'col-1',
            },
            {
                label: LABEL_AFFECTED_ROUTES,
                key: 'affectedRoutes',
                cols: 'col-2',
                getContent: (disruption, key) => disruption[key].map(({ routeShortName }) => routeShortName).join(', '),
            },
            {
                label: LABEL_CUSTOMER_IMPACT,
                key: 'impact',
                cols: 'col-2',
                getContent: (disruption, key) => (IMPACTS.find(impact => impact.value === disruption[key]) || DEFAULT_IMPACT).label,
            },
            {
                label: LABEL_CAUSE,
                key: 'cause',
                cols: 'col-2',
                getContent: (disruption, key) => (CAUSES.find(cause => cause.value === disruption[key]) || DEFAULT_CAUSE).label,
            },
            {
                label: LABEL_START_DATE,
                key: 'startDate',
                cols: 'col-1',
                getContent: disruption => moment(disruption.startTime).format(DATE_FORMAT),
            },
            {
                label: LABEL_START_TIME,
                key: 'startTime',
                cols: 'col-1',
                getContent: (disruption, key) => moment(disruption[key]).format(TIME_FORMAT),
            },
            {
                label: LABEL_END_TIME,
                key: 'endDateTime',
                cols: 'col-1',
                getContent: ({ endTime }) => (endTime ? moment(endTime).format(`${DATE_FORMAT} ${TIME_FORMAT}`) : ''),
            },
            {
                label: LABEL_STATUS,
                key: 'status',
                cols: 'col-1',
            },
        ];
    }

    getRowClassName = ({ status }) => (status === STATUSES.RESOLVED ? 'bg-at-ocean-tint-10 text-muted' : '');

    renderRowBody = disruption => <DisruptionDetail disruption={ disruption } />

    isRowActive = ({ disruptionId }) => this.props.activeDisruptionId === disruptionId

    handleRowClick = ({ disruptionId }) => {
        const currentActiveId = this.props.activeDisruptionId;
        this.props.updateActiveDisruptionId((disruptionId === currentActiveId ? null : disruptionId));
        this.props.updateCopyDisruptionState(false);
    }

    render() {
        const { disruptions } = this.props;
        return (
            <ControlTable
                columns={ this.DISRUPTION_TABLE_COLUMNS }
                data={ disruptions }
                getRowId={ row => `${row.disruptionId}` }
                isExpandable
                rowActive={ this.isRowActive }
                rowBody={ this.renderRowBody }
                rowClassName={ this.getRowClassName }
                rowOnClick={ this.handleRowClick } />
        );
    }
}

export default connect(state => ({
    activeDisruptionId: getActiveDisruptionId(state),
}),
{ updateActiveDisruptionId, updateCopyDisruptionState })(DisruptionsTable);
