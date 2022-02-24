import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import { FaPlus } from 'react-icons/fa';
import { some, noop } from 'lodash-es';
import MESSAGING_MODAL_TYPE from '../../../../types/messaging-modal-types';
import StopGroupsModal from './StopGroupsModal';
import ControlTable from '../../Common/ControlTable/ControlTable';
import Stops from '../../StopMessagingView/Stops';
import ConfirmationModal from '../../Common/ConfirmationModal/ConfirmationModal';
import { getAllStopGroups, getStopGroupsLoadingState } from '../../../../redux/selectors/control/dataManagement/stopGroups';
import { updateStopGroup, getStopGroups } from '../../../../redux/actions/control/dataManagement';
import { getStopMessagesAndPermissions } from '../../../../redux/actions/control/stopMessaging';
import SearchFilter from '../../Common/Filters/SearchFilter/SearchFilter';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';

export class StopGroupsView extends React.Component {
    static propTypes = {
        stopGroups: PropTypes.array,
        updateStopGroup: PropTypes.func.isRequired,
        isStopGroupsLoading: PropTypes.bool,
        getStopMessagesAndPermissions: PropTypes.func.isRequired,
        getStopGroups: PropTypes.func.isRequired,
        displayTitle: PropTypes.bool,
    };

    static defaultProps = {
        stopGroups: [],
        isStopGroupsLoading: false,
        displayTitle: true,
    };

    constructor(props) {
        super(props);

        this.state = {
            modalType: null,
            isModalOpen: false,
            activeStopGroup: null,
            stopGroupsList: [],
            searchValue: '',
            selectedData: {},
        };

        this.MODALS = {
            create: {
                type: MESSAGING_MODAL_TYPE.CREATE,
                title: 'Add new stop group',
            },
            edit: {
                type: MESSAGING_MODAL_TYPE.EDIT,
                title: 'Edit stop group',
            },
            cancel: {
                type: MESSAGING_MODAL_TYPE.CANCEL,
                title: 'Cancel stop group',
                message: 'Are you sure you wish to cancel this stop group?',
            },
        };

        this.STOP_GROUP_COLUMNS = [
            {
                label: 'group name',
                key: 'title',
                cols: 'col-3',
            },
            {
                label: 'stops',
                key: 'stops',
                cols: 'col-5',
                getContent: (stopGroup, key) => <Stops stopMessage={ stopGroup } messageKey={ key } />,
            },
            {
                label: 'created by',
                key: 'user',
                cols: 'col-2',
            },
            {
                label: '',
                key: '',
                cols: 'col-2',
                getContent: stopGroup => (
                    <div className="cc-table-actions-col">
                        <Button
                            className="messaging-stop-group-view__edit-btn"
                            onClick={ () => this.toggleModals(this.MODALS.edit.type, stopGroup) }>
                            <FiEdit size={ 20 } className="mr-1" />
                        </Button>
                        <Button
                            className="messaging-stop-group-view__cancel-btn"
                            onClick={ () => this.toggleModals(this.MODALS.cancel.type, stopGroup) }>
                            <FiTrash2 size={ 20 } className="mr-1" />
                        </Button>
                    </div>
                ),
            },
        ];
    }

    componentDidMount() {
        this.props.getStopMessagesAndPermissions();
        this.props.getStopGroups();
        this.resetStopGroupsList();
    }

    componentDidUpdate(prevProps) {
        if (this.props.stopGroups && this.props.stopGroups !== prevProps.stopGroups) {
            const { selectedData } = this.state;
            if (selectedData.label) {
                this.stopInGroupSelected(selectedData);
            } else if (selectedData.title) {
                this.stopGroupSelected(selectedData);
            } else {
                this.resetStopGroupsList();
            }
        }
    }

    toggleModals = (type, stopGroup) => this.setState(prevState => ({
        modalType: type,
        isModalOpen: !prevState.isModalOpen,
        activeStopGroup: stopGroup,
    }));

    updateStopGroup = (payload) => {
        const { edit, cancel } = this.MODALS;
        const { activeStopGroup, modalType } = this.state;

        const stopGroupId = (modalType === edit.type || modalType === cancel.type) && activeStopGroup ? activeStopGroup.id : null;
        return this.props.updateStopGroup(payload, stopGroupId);
    };

    resetStopGroupsList = () => {
        this.setState({
            searchValue: '',
            selectedData: {},
            stopGroupsList: this.props.stopGroups,
        });
    };

    stopInGroupSelected = (stop) => {
        this.setState({
            searchValue: stop.label,
            selectedData: stop,
            stopGroupsList: this.props.stopGroups.filter(group => some(group.stops, s => s.value === stop.value)),
        });
    };

    stopGroupSelected = (stopGroup) => {
        this.setState({
            searchValue: stopGroup.title,
            selectedData: stopGroup,
            stopGroupsList: this.props.stopGroups.filter(group => group.id === stopGroup.id),
        });
    };

    render() {
        const { modalType, isModalOpen, activeStopGroup, stopGroupsList, searchValue } = this.state;
        const { create, edit, cancel } = this.MODALS;
        const { STOP_IN_GROUP, STOP_GROUP } = SEARCH_RESULT_TYPE;
        const { displayTitle } = this.props;

        return (
            <div className="messaging-stop-group-view">
                { displayTitle && (
                    <h1>Manage stop groups</h1>
                )}
                <div className={ `row ${displayTitle ? 'py-2' : 'pb-2'}` }>
                    <div className="search-filters col-3">
                        <SearchFilter
                            value={ searchValue }
                            placeholder="Search for a stop or group name"
                            searchInCategory={ [STOP_IN_GROUP.type, STOP_GROUP.type] }
                            selectionHandlers={ {
                                [STOP_IN_GROUP.type]: ({ data }) => this.stopInGroupSelected(data),
                                [STOP_GROUP.type]: ({ data }) => this.stopGroupSelected(data),
                            } }
                            clearHandlers={ {
                                [STOP_IN_GROUP.type]: noop,
                                [STOP_GROUP.type]: noop,
                            } }
                            onClearCallBack={ this.resetStopGroupsList }
                        />
                    </div>
                    <div className="col-9 d-flex justify-content-between">
                        <Button
                            className="cc-btn-secondary"
                            onClick={ () => this.toggleModals(create.type, null) }>
                            <FaPlus size={ 20 } className="cc-btn-secondary__icon" />
                            { this.MODALS.create.title }
                        </Button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-12">
                        <StopGroupsModal
                            modalTitle={ modalType ? this.MODALS[modalType].title : '' }
                            isModalOpen={ (modalType === create.type || modalType === edit.type) && isModalOpen }
                            activeStopGroup={ activeStopGroup }
                            onAction={ this.updateStopGroup }
                            onClose={ () => this.toggleModals(null, null) } />
                        <ConfirmationModal
                            okButtonClassName="messaging-stop-group-view__cancel-modal-ok-btn"
                            title={ this.MODALS.cancel.title }
                            message={ this.MODALS.cancel.message }
                            isOpen={ modalType === cancel.type && isModalOpen }
                            onAction={ () => this.updateStopGroup(null).then(() => this.toggleModals(null, null)).catch(() => {}) }
                            onClose={ () => this.toggleModals(null, null) } />
                    </div>
                </div>
                <ControlTable
                    columns={ this.STOP_GROUP_COLUMNS }
                    data={ stopGroupsList }
                    isLoading={ this.props.isStopGroupsLoading }
                    isExpandable={ false } />
            </div>
        );
    }
}

export default connect(
    state => ({
        stopGroups: getAllStopGroups(state),
        isStopGroupsLoading: getStopGroupsLoadingState(state),
    }),
    { updateStopGroup, getStopMessagesAndPermissions, getStopGroups },
)(StopGroupsView);
