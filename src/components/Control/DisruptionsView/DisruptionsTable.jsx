import moment from 'moment';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { HiOutlineCheckCircle } from 'react-icons/hi';
import { GiAlarmClock } from 'react-icons/gi';
import { GoAlert } from 'react-icons/go';
import { FaPaperclip } from 'react-icons/fa';
import { updateActiveDisruptionId, updateCopyDisruptionState } from '../../../redux/actions/control/disruptions';
import { getActiveDisruptionId } from '../../../redux/selectors/control/disruptions';
import { PAGE_SIZE } from '../../../utils/control/disruptions';
import { STATUSES, CAUSES, IMPACTS, DEFAULT_IMPACT, DEFAULT_CAUSE } from '../../../types/disruptions-types';
import {
    DATE_FORMAT,
    LABEL_AFFECTED_ROUTES, LABEL_AFFECTED_STOPS,
    LABEL_CAUSE, LABEL_CUSTOMER_IMPACT, LABEL_DISRUPTION, LABEL_END_TIME,
    LABEL_MODE, LABEL_START_DATE,
    LABEL_START_TIME, LABEL_STATUS,
    TIME_FORMAT,
} from '../../../constants/disruptions';
import { LoadMore } from '../Common/LoadMore/LoadMore';
import ControlTable from '../Common/ControlTable/ControlTable';
import DisruptionDetail from './DisruptionDetail';
import './style.scss';

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

        this.state = {
            pageSize: PAGE_SIZE,
        };

        this.DISRUPTION_TABLE_COLUMNS = [
            {
                label: `${LABEL_DISRUPTION}#`,
                key: 'incidentNo',
                cols: 'col-1',
                getContent: disruption => this.getDisruptionLabel(disruption),
            },
            {
                label: LABEL_MODE,
                key: 'mode',
                cols: 'col-1',
            },
            {
                label: LABEL_AFFECTED_ROUTES,
                key: 'affectedEntities',
                cols: 'col-2',
                getContent: (disruption, key) => disruption[key].filter(entity => entity.routeId).map(({ routeShortName }) => routeShortName).join(', '),
            },
            {
                label: LABEL_AFFECTED_STOPS,
                key: 'affectedEntities',
                cols: 'col-2',
                getContent: (disruption, key) => disruption[key].filter(entity => entity.stopId).map(({ stopCode }) => stopCode).join(', '),
            },
            {
                label: LABEL_CUSTOMER_IMPACT,
                key: 'impact',
                cols: 'col-1',
                getContent: (disruption, key) => (IMPACTS.find(impact => impact.value === disruption[key]) || DEFAULT_IMPACT).label,
            },
            {
                label: LABEL_CAUSE,
                key: 'cause',
                cols: 'col-1',
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

    getDisruptionLabel = (disruption) => {
        const { uploadedFiles, incidentNo } = disruption;

        if (uploadedFiles && uploadedFiles.length > 0) {
            return (
                <span>{ incidentNo }<FaPaperclip size={ 12 } className="ml-1" /></span>
            );
        }

        return (
            <span>{ incidentNo }</span>
        );
    }

    getRowClassName = ({ status }) => (status === STATUSES.RESOLVED ? 'bg-at-ocean-tint-10 text-muted' : '');

    getDisruptionsToDisplay = () => {
        if (this.props.activeDisruptionId) {
            const activeDisruptionIndex = this.props.disruptions.findIndex(({ disruptionId }) => disruptionId === this.props.activeDisruptionId);
            if (this.state.pageSize < activeDisruptionIndex + 1) {
                this.setState(() => ({ pageSize: activeDisruptionIndex + 1 }));
            }
        }
        return this.props.disruptions.slice(0, Math.min(this.state.pageSize, this.props.disruptions.length));
    }

    renderRowBody = disruption => <DisruptionDetail disruption={ disruption } />

    isRowActive = ({ disruptionId }) => this.props.activeDisruptionId === disruptionId

    handleRowClick = ({ disruptionId }) => {
        const currentActiveId = this.props.activeDisruptionId;
        this.props.updateActiveDisruptionId((disruptionId === currentActiveId ? null : disruptionId));
        this.props.updateCopyDisruptionState(false);
    }

    renderIcon = (value) => {
        if (value === STATUSES.IN_PROGRESS) {
            return <GoAlert className="icon-in-progress mr-1" />;
        }
        if (value === STATUSES.NOT_STARTED) {
            return <GiAlarmClock className="icon-not-started mr-1" />;
        }
        return <HiOutlineCheckCircle className="mr-1" />;
    }

    render() {
        const disruptionsToLoad = this.getDisruptionsToDisplay();
        return (
            <div id="disruptions-control-table">
                <ControlTable
                    columns={ this.DISRUPTION_TABLE_COLUMNS }
                    data={ disruptionsToLoad }
                    getRowId={ row => `${row.disruptionId}` }
                    isExpandable
                    rowActive={ this.isRowActive }
                    rowBody={ this.renderRowBody }
                    rowClassName={ this.getRowClassName }
                    rowOnClick={ this.handleRowClick }
                    renderIcon={ this.renderIcon } />
                <LoadMore
                    limit={ this.state.pageSize }
                    total={ this.props.disruptions.length }
                    chunkSize={ PAGE_SIZE }
                    isLoading={ false }
                    message={ `We noticed you are loading a large number of disruptions.
                    This may affect performance and responsiveness of this system.` }
                    onClick={ () => this.setState(state => ({
                        pageSize: state.pageSize + PAGE_SIZE,
                    })) }
                />
            </div>
        );
    }
}

export default connect(state => ({
    activeDisruptionId: getActiveDisruptionId(state),
}), { updateActiveDisruptionId, updateCopyDisruptionState })(DisruptionsTable);
