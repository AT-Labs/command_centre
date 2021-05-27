/* eslint-disable react/no-unused-state */
/* eslint-disable react/no-did-update-set-state */

// TODO:
// It would be good whenever we have the time to see whether we can improve the code to avoid the eslint complains we are disabling above.
// react/no-unused-state: It's being used by shouldComponentUpdate and its value is being set in the children components.
// react/no-did-update-set-state: According to React documentation this can be done provided it is wrapped in a condition, which is the case here.
// However, it wouldn't do any harm to try a different approach.

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import inView from 'in-view';
import _ from 'lodash-es';
import moment from 'moment-timezone';

import { getBlocks, updateActiveBlock, updateBlocksSortingParams, clearActiveBlock, updateFocusedBlock } from '../../../redux/actions/control/blocks';
import {
    getActiveBlocksIds,
    getSortedBlocks,
    getBlocksLoadingState,
    getBlocksPermissions,
    getBlocksSortingParams,
    getFocusedBlock,
} from '../../../redux/selectors/control/blocks';
import { getServiceDate } from '../../../redux/selectors/control/serviceDate';
import SEARCH_RESULT_TYPE from '../../../types/search-result-types';
import TRIP_STATUS_TYPES from '../../../types/trip-status-types';
import DATE_TYPE from '../../../types/date-types';
import { getVehiclesFromBlockTrips } from '../../../utils/control/blocks';
import { getTripTimeDisplay } from '../../../utils/helpers';
import OmniSearch from '../../OmniSearch/OmniSearch';
import ControlTable from '../Common/ControlTable/ControlTable';
import TableTitle from '../Common/ControlTable/TableTitle';
import SearchTheme from '../Common/search-theme';
import SortButton from '../Common/SortButton/SortButton';
import AddNewBlockModal from './BlockModals/AddNewBlockModal';
import AllocateVehiclesModal from './BlockModals/AllocateVehiclesModal';
import EditVehiclesModal from './BlockModals/EditVehiclesModal';
import BlockTrips from './BlockTrips';
import { isIndividualEditBlockPermitted, isGlobalAddBlocksPermitted } from '../../../utils/user-permissions';
import { IS_LOGIN_NOT_REQUIRED } from '../../../auth';
import './BlocksView.scss';

export class BlocksView extends React.Component {
    static propTypes = {
        focusedBlock: PropTypes.object,
        activeBlocksIds: PropTypes.array,
        blocks: PropTypes.array.isRequired,
        blocksPermissions: PropTypes.array.isRequired,
        isLoading: PropTypes.bool.isRequired,
        getBlocks: PropTypes.func.isRequired,
        updateActiveBlock: PropTypes.func.isRequired,
        clearActiveBlock: PropTypes.func.isRequired,
        updateFocusedBlock: PropTypes.func.isRequired,
        updateBlocksSortingParams: PropTypes.func.isRequired,
        serviceDate: PropTypes.string.isRequired,
        blocksSortingParams: PropTypes.object.isRequired,
    }

    static defaultProps = {
        activeBlocksIds: [],
        focusedBlock: null,
    }

    constructor(props) {
        super(props);

        this.state = {
            shouldLoaderBeShown: true,
            isAnyModalOpen: false,
        };

        this.BLOCKS_COLUMNS = [
            {
                label: () => (
                    <div className="d-flex align-content-center">
                        <SortButton
                            className="mr-1"
                            active={
                                this.props.blocksSortingParams && this.props.blocksSortingParams.sortBy === 'operationalBlockId'
                                    ? this.props.blocksSortingParams.order
                                    : null
                            }
                            onClick={ order => this.props.updateBlocksSortingParams({
                                sortBy: 'operationalBlockId',
                                order,
                            }) } />
                        <div>block #</div>
                    </div>
                ),
                key: 'operationalBlockId',
                cols: 'col-3',
            },
            {
                label: () => (
                    <div className="d-flex align-content-center">
                        <SortButton
                            className="mr-1"
                            active={
                                this.props.blocksSortingParams && this.props.blocksSortingParams.sortBy === 'startTime'
                                    ? this.props.blocksSortingParams.order
                                    : null
                            }
                            onClick={ order => this.props.updateBlocksSortingParams({
                                sortBy: 'startTime',
                                order,
                            }) } />
                        <div>start time</div>
                    </div>
                ),
                key: 'startTime',
                cols: 'col-3',
                getContent: (trip, key) => getTripTimeDisplay(trip[key]),
            },
            {
                label: 'trips',
                key: 'trips',
                cols: 'col-2',
            },
            {
                label: 'vehicles',
                key: 'vehicles',
                cols: 'col-4',
                getContent: this.renderAllocationVehicleModal,
            },
        ];

        this.ref = React.createRef();
    }

    componentDidMount = () => this.props.getBlocks(true)
        .then(() => {
            this.setState({ shouldLoaderBeShown: false });
            this.interval = setInterval(() => this.props.getBlocks(true), 9000);
        })

    componentDidUpdate = (prevProps) => {
        const hasServiceDateChanged = !moment(this.props.serviceDate).isSame(moment(prevProps.serviceDate), 'day');
        if (hasServiceDateChanged) {
            this.setState({ shouldLoaderBeShown: true },
                () => {
                    this.props.getBlocks(true)
                        .then(() => this.setState({ shouldLoaderBeShown: false }));
                });
        }
    }

    componentWillUnmount = () => clearInterval(this.interval)

    shouldComponentUpdate = (nextProps, nextState) => !nextState.isAnyModalOpen

    renderAllocationVehicleModal = (block) => {
        const isEditPermitted = IS_LOGIN_NOT_REQUIRED || isIndividualEditBlockPermitted(block);
        const vehicles = getVehiclesFromBlockTrips(block);
        const vehiclesLength = vehicles.length > 0;

        if (isEditPermitted) {
            if (vehiclesLength) {
                return (
                    <EditVehiclesModal
                        block={ block }
                        setModalState={ isModalOpen => this.setState({ isAnyModalOpen: isModalOpen }) } />
                );
            }
            if (block.operationalTrips.length > 0) {
                return (
                    <AllocateVehiclesModal
                        block={ block }
                        setModalState={ isModalOpen => this.setState({ isAnyModalOpen: isModalOpen }) } />
                );
            }
            return null;
        }
        if (vehiclesLength) return <div>{ _.map(vehicles, 'buttonLabel').join(', ') }</div>;
        return null;
    }

    isToday = date => moment.tz(date, DATE_TYPE.TIME_ZONE).isSame(moment(), 'day')

    isRowActive = (block) => {
        const { activeBlocksIds } = this.props;
        return !!activeBlocksIds.find(activeBlock => activeBlock === block.operationalBlockId);
    }

    handleBlockOnClick = (block) => {
        if (this.isRowActive(block)) {
            this.props.clearActiveBlock(block);
            return;
        }
        this.props.updateActiveBlock(block);
        this.props.updateFocusedBlock(block);
    }

    renderRowBody = activeBlock => <BlockTrips activeBlock={ activeBlock } />;

    getRowId = block => block.operationalBlockId

    handleBlockSearchOnSelect = ({ data: block }) => {
        this.props.updateActiveBlock(block);
        const blockElement = this.ref.current.querySelector(`li[data-row-id="${this.getRowId(block)}"]`);
        if (!inView.is(blockElement)) _.delay(() => blockElement.scrollIntoView(), 0);
    }

    getRowClassName = (block) => {
        const { cancelled, completed } = TRIP_STATUS_TYPES;
        const tripsWithoutVehicles = block.operationalTrips.filter(trip => (!trip.vehicles || trip.vehicles.length === 0)
                                                                            && trip.status !== cancelled && trip.status !== completed);

        return (
            tripsWithoutVehicles.length !== 0
                ? 'bg-at-magenta-tint-5'
                : ''
        );
    }

    render() {
        const isGlobalAddBlockPermitted = IS_LOGIN_NOT_REQUIRED || isGlobalAddBlocksPermitted(this.props.blocksPermissions);

        return (
            <div className="control-block-view" ref={ this.ref }>
                <TableTitle
                    tableTitle="Blocks"
                    isServiceDatePickerDisabled={ this.props.isLoading } />
                <div className="row py-2">
                    <div className="col-3">
                        <OmniSearch
                            theme={ SearchTheme }
                            placeholder="Search for a block"
                            searchInCategory={ [SEARCH_RESULT_TYPE.BLOCK.type] }
                            selectionHandlers={ {
                                [SEARCH_RESULT_TYPE.BLOCK.type]: selected => this.handleBlockSearchOnSelect(selected),
                            } }
                            clearHandlers={ {
                                [SEARCH_RESULT_TYPE.BLOCK.type]: () => this.props.clearActiveBlock(null),
                            } } />
                    </div>
                    <div className="col-9 d-flex justify-content-end align-items-center">
                        { isGlobalAddBlockPermitted && this.isToday(this.props.serviceDate) && <AddNewBlockModal /> }
                    </div>
                </div>
                <ControlTable
                    columns={ this.BLOCKS_COLUMNS }
                    data={ this.props.blocks }
                    getRowId={ this.getRowId }
                    isLoading={ this.state.shouldLoaderBeShown && this.props.isLoading }
                    rowOnClick={ this.handleBlockOnClick }
                    rowActive={ this.isRowActive }
                    rowFocused={ block => this.props.focusedBlock && this.props.focusedBlock.operationalBlockId === block.operationalBlockId }
                    rowBody={ this.renderRowBody }
                    rowClassName={ this.getRowClassName } />
            </div>
        );
    }
}

export default connect(state => ({
    blocks: getSortedBlocks(state),
    blocksSortingParams: getBlocksSortingParams(state),
    activeBlocksIds: getActiveBlocksIds(state),
    isLoading: getBlocksLoadingState(state),
    serviceDate: getServiceDate(state),
    blocksPermissions: getBlocksPermissions(state),
    focusedBlock: getFocusedBlock(state),
}),
{ getBlocks, updateActiveBlock, updateBlocksSortingParams, clearActiveBlock, updateFocusedBlock })(BlocksView);
