import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import moment from 'moment';
import { some, noop } from 'lodash-es';

import MESSAGING_MODAL_TYPE from '../../../types/messaging-modal-types';
import VIEW_TYPE from '../../../types/view-types';
import Stops from './Stops';
import StopMessagesModal from './StopMessagingModals/StopMessageModal';
import { formatGroupsForPresentation } from '../../../utils/helpers';
import ControlTable from '../Common/ControlTable/ControlTable';
import ConfirmationModal from '../Common/ConfirmationModal/ConfirmationModal';
import { getStopMessagesAndPermissions,
    updateStopMessage,
    getStopGroups,
    updateStopMessagesSortingParams,
} from '../../../redux/actions/control/stopMessaging';
import { getSortedStopMesssages,
    getStopMessagesPermissions,
    getStopMessagesLoadingState,
    getStopMessagesSortingParams,
} from '../../../redux/selectors/control/stopMessaging/stopMessages';
import { updateControlDetailView, updateMainView } from '../../../redux/actions/navigation';
import { isIndividualEditStopMessagesPermitted, isGlobalEditStopMessagesPermitted } from '../../../utils/user-permissions';
import { IS_LOGIN_NOT_REQUIRED } from '../../../auth';
import SearchFilter from '../Common/Filters/SearchFilter/SearchFilter';
import SEARCH_RESULT_TYPE from '../../../types/search-result-types';
import SortButton from '../Common/SortButton/SortButton';

const dateFormat = 'DD/MM/YY HH:mm';

export class StopMessagesView extends React.Component {
    static propTypes = {
        stopMessages: PropTypes.array,
        stopMessagesPermissions: PropTypes.array.isRequired,
        getStopMessagesAndPermissions: PropTypes.func.isRequired,
        updateStopMessage: PropTypes.func.isRequired,
        updateMainView: PropTypes.func.isRequired,
        updateControlDetailView: PropTypes.func.isRequired,
        isStopMessagesLoading: PropTypes.bool,
        getStopGroups: PropTypes.func.isRequired,
        updateStopMessagesSortingParams: PropTypes.func.isRequired,
        stopMessagesSortingParams: PropTypes.object.isRequired,
    }

    static defaultProps = {
        stopMessages: [],
        isStopMessagesLoading: false,
    }

    constructor(props) {
        super(props);

        this.state = {
            modalType: null,
            isModalOpen: false,
            activeStopMessage: null,
            messagesList: [],
            searchValue: '',
            selectedData: {},
        };

        this.MODALS = {
            create: {
                type: MESSAGING_MODAL_TYPE.CREATE,
                title: 'Create new message',
            },
            edit: {
                type: MESSAGING_MODAL_TYPE.EDIT,
                title: 'Edit message',
            },
            cancel: {
                type: MESSAGING_MODAL_TYPE.CANCEL,
                title: 'Cancel message',
                message: 'Are you sure you wish to cancel the message?',
            },
        };

        const activeOrder = (key) => {
            const { stopMessagesSortingParams } = this.props;
            return stopMessagesSortingParams && stopMessagesSortingParams.sortBy === key ? stopMessagesSortingParams.order : null;
        };

        this.MESSAGING_COLUMNS = [
            {
                label: () => (
                    <div className="d-flex align-content-center">
                        <SortButton
                            className="mr-1"
                            active={ activeOrder('startTime') }
                            onClick={ order => this.props.updateStopMessagesSortingParams({
                                sortBy: 'startTime',
                                order,
                            }) } />
                        <div>start</div>
                    </div>
                ),
                key: 'startTime',
                cols: 'col-2',
                getContent: (stopMessage, key) => moment(stopMessage[key]).format(dateFormat),
            },
            {
                label: () => (
                    <div className="d-flex align-content-center">
                        <SortButton
                            className="mr-1"
                            active={ activeOrder('endTime') }
                            onClick={ order => this.props.updateStopMessagesSortingParams({
                                sortBy: 'endTime',
                                order,
                            }) } />
                        <div>end</div>
                    </div>
                ),
                key: 'endTime',
                cols: 'col-2',
                getContent: (stopMessage, key) => moment(stopMessage[key]).format(dateFormat),
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
                cols: 'col-3 control-messaging-view__message',
            },
            {
                label: 'priority',
                key: 'priority',
                cols: 'col-1',
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
                getContent: stopMessage => this.renderActionsButtons(stopMessage),
            },
        ];
    }

    componentDidMount = () => {
        this.props.getStopMessagesAndPermissions();
        this.props.getStopGroups();
    }

    componentDidUpdate = (prevProps) => {
        if (this.props.stopMessages && this.props.stopMessages !== prevProps.stopMessages) {
            const { selectedData } = this.state;
            if (selectedData.message) {
                this.stopMessageSelected(selectedData);
            } else if (selectedData.stop_code) {
                this.stopSelected(selectedData);
            } else if (selectedData.title) {
                this.stopGroupSelected(selectedData);
            } else {
                this.resetStopMessagesList();
            }
        }
    }

    renderActionsButtons = (stopMessage) => {
        const isIndividualEditPermitted = IS_LOGIN_NOT_REQUIRED || isIndividualEditStopMessagesPermitted(stopMessage);
        return isIndividualEditPermitted ? (
            <div className="cc-table-actions-col">
                <Button
                    className="control-messaging-view__edit-btn"
                    onClick={ () => this.toggleModals(this.MODALS.edit.type, stopMessage) }>
                    <FiEdit size={ 20 } className="mr-1" />
                </Button>
                <Button
                    className="control-messaging-view__cancel-btn"
                    onClick={ () => this.toggleModals(this.MODALS.cancel.type, stopMessage) }>
                    <FiTrash2 size={ 20 } className="mr-1" />
                </Button>
            </div>
        ) : null;
    }

    toggleModals = (type, stopMessage) => this.setState(prevState => ({
        modalType: type,
        isModalOpen: !prevState.isModalOpen,
        activeStopMessage: stopMessage,
    }))

    updateStopMessage = (payload) => {
        const { edit, cancel } = this.MODALS;
        const { activeStopMessage, modalType } = this.state;
        const stopMessageId = (modalType === edit.type || modalType === cancel.type) && activeStopMessage ? activeStopMessage.id : null;
        return this.props.updateStopMessage(payload, stopMessageId);
    }

    mergeStopsAndGroupsInMessagesList = () => {
        const getFormattedGroups = message => (
            (message.stopGroups && message.stopGroups.length)
                ? formatGroupsForPresentation(message.stopGroups) : []
        );

        return this.props.stopMessages.map(message => ({
            ...message,
            stopsAndGroups: [...message.stops, ...getFormattedGroups(message)],
        }));
    }

    resetStopMessagesList = () => {
        this.setState({
            searchValue: '',
            selectedData: {},
            messagesList: this.mergeStopsAndGroupsInMessagesList(),
        });
    }

    stopSelected = (stop) => {
        this.setState({
            searchValue: `${stop.stop_code} - ${stop.stop_name}`,
            selectedData: stop,
            messagesList: this.mergeStopsAndGroupsInMessagesList().filter(message => some(message.stops, s => s.value === stop.stop_code)
            || some(message.stopGroups, stopGroup => some(stopGroup.stops, s => s.value === stop.stop_code))),
        });
    }

    stopGroupSelected = (stopGroup) => {
        this.setState({
            searchValue: stopGroup.title,
            selectedData: stopGroup,
            messagesList: this.mergeStopsAndGroupsInMessagesList().filter(message => some(message.stopGroups, g => g.id === stopGroup.id)),
        });
    }

    stopMessageSelected = (stopMessage) => {
        this.setState({
            searchValue: stopMessage.message,
            selectedData: stopMessage,
            messagesList: this.mergeStopsAndGroupsInMessagesList().filter(message => message.id === stopMessage.id),
        });
    }

    render() {
        const { modalType, isModalOpen, activeStopMessage, messagesList, searchValue } = this.state;
        const { STOP, STOP_GROUP_MERGED, STOP_MESSAGE } = SEARCH_RESULT_TYPE;
        const { create, edit, cancel } = this.MODALS;
        const isGlobalEditMessagesPermitted = IS_LOGIN_NOT_REQUIRED || isGlobalEditStopMessagesPermitted(this.props.stopMessagesPermissions);

        return (
            <div className="control-messaging-view">
                <h1>Messaging</h1>
                <div className="row py-2">
                    <div className="search-filters col-3">
                        <SearchFilter
                            value={ searchValue }
                            placeholder="Search for a stop or message"
                            searchInCategory={ [STOP.type, STOP_GROUP_MERGED.type, STOP_MESSAGE.type] }
                            selectionHandlers={ {
                                [STOP.type]: ({ data }) => this.stopSelected(data),
                                [STOP_GROUP_MERGED.type]: ({ data }) => this.stopGroupSelected(data),
                                [STOP_MESSAGE.type]: ({ data }) => this.stopMessageSelected(data),
                            } }
                            clearHandlers={ {
                                [STOP.type]: noop,
                                [STOP_GROUP_MERGED.type]: noop,
                                [STOP_MESSAGE.type]: noop,
                            } }
                            onClearCallBack={ this.resetStopMessagesList }
                        />
                    </div>
                    <div className="col-9">
                        { isGlobalEditMessagesPermitted && (
                            <div>
                                <Button
                                    className="control-messaging-view__create-btn cc-btn-primary"
                                    onClick={ () => this.toggleModals(create.type, null) }>
                                    { this.MODALS.create.title }
                                </Button>
                                <Button
                                    className="control-messaging-view__stop-groups-btn cc-btn-secondary ml-3"
                                    onClick={ () => {
                                        this.props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                        this.props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.STOP_GROUPS);
                                    } }>
                                    Manage stop groups
                                </Button>
                            </div>
                        )}
                        <StopMessagesModal
                            title={ modalType ? this.MODALS[modalType].title : '' }
                            isModalOpen={ (modalType === create.type || modalType === edit.type) && isModalOpen }
                            modalType={ modalType }
                            activeMessage={ activeStopMessage }
                            onAction={ this.updateStopMessage }
                            onClose={ () => this.toggleModals(null, null) } />
                        <ConfirmationModal
                            okButtonClassName="control-messaging-view__cancel-modal-ok-btn"
                            title={ this.MODALS.cancel.title }
                            message={ this.MODALS.cancel.message }
                            isOpen={ modalType === cancel.type && isModalOpen }
                            onAction={ () => this.updateStopMessage(null).then(() => this.toggleModals(null, null)).catch(() => {}) }
                            onClose={ () => this.toggleModals(null, null) } />
                    </div>
                </div>
                <ControlTable
                    columns={ this.MESSAGING_COLUMNS }
                    data={ messagesList }
                    isLoading={ this.props.isStopMessagesLoading }
                    isExpandable={ false } />
            </div>
        );
    }
}

export default connect(state => ({
    stopMessages: getSortedStopMesssages(state),
    isStopMessagesLoading: getStopMessagesLoadingState(state),
    stopMessagesPermissions: getStopMessagesPermissions(state),
    stopMessagesSortingParams: getStopMessagesSortingParams(state),
}),
{ getStopMessagesAndPermissions, updateStopMessage, updateMainView, updateControlDetailView, getStopGroups, updateStopMessagesSortingParams })(StopMessagesView);
