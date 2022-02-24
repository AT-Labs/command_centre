import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import { FiEdit, FiTrash2 } from 'react-icons/fi';
import moment from 'moment';
import { some, noop } from 'lodash-es';

import MESSAGING_MODAL_TYPE from '../../../types/messaging-modal-types';
import STOP_MESSAGE_TYPE from '../../../types/stop-messages-types';
import StopMessagesModal from './StopMessagingModals/StopMessageModal';
import { formatGroupsForPresentation } from '../../../utils/helpers';
import ConfirmationModal from '../Common/ConfirmationModal/ConfirmationModal';
import { getStopMessagesAndPermissions,
    updateStopMessage,
    toggleModals,
} from '../../../redux/actions/control/stopMessaging';
import { getStopGroups } from '../../../redux/actions/control/dataManagement';
import { getSortedStopMesssages,
    getStopMessagesPermissions,
    getStopMessagesLoadingState,
    getStopMessagesSortingParams,
    getModal,
} from '../../../redux/selectors/control/stopMessaging/stopMessages';
import { SYSTEM_STOP_GROUP_ID, SYSTEM_STOP_GROUP_STOP_START, SYSTEM_STOP_GROUP_STOP_END } from '../../../redux/selectors/control/dataManagement/stopGroups';
import { isIndividualEditStopMessagesPermitted, isGlobalEditStopMessagesPermitted } from '../../../utils/user-permissions';
import { IS_LOGIN_NOT_REQUIRED } from '../../../auth';
import SearchFilter from '../Common/Filters/SearchFilter/SearchFilter';
import SEARCH_RESULT_TYPE from '../../../types/search-result-types';
import StopMessagesTable from './StopMessagesTable';
import CustomButtonGroup from '../../Common/CustomButtonGroup/CustomButtonGroup';

export class StopMessagesView extends React.Component {
    static propTypes = {
        stopMessages: PropTypes.array,
        stopMessagesPermissions: PropTypes.array.isRequired,
        getStopMessagesAndPermissions: PropTypes.func.isRequired,
        updateStopMessage: PropTypes.func.isRequired,
        isStopMessagesLoading: PropTypes.bool,
        getStopGroups: PropTypes.func.isRequired,
        stopMessagesSortingParams: PropTypes.object.isRequired,
        modal: PropTypes.object.isRequired,
        toggleModals: PropTypes.func.isRequired,
    };

    static defaultProps = {
        stopMessages: [],
        isStopMessagesLoading: false,
    };

    constructor(props) {
        super(props);

        this.state = {
            messagesList: [],
            searchValue: '',
            disruptionSearchValue: '',
            selectedData: {},
            statusFilterValue: STOP_MESSAGE_TYPE.STATUS.ACTIVE,
            typeFilterValue: STOP_MESSAGE_TYPE.TYPE.CURRENT,
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
    }

    componentDidMount() {
        this.props.getStopMessagesAndPermissions();
        this.props.getStopGroups();
    }

    componentDidUpdate(prevProps) {
        if (this.props.stopMessages && this.props.stopMessages !== prevProps.stopMessages) {
            this.updateMessagesList(this.state.selectedData, this.state.statusFilterValue, this.state.typeFilterValue, this.state.disruptionSearchValue);
        }
    }

    renderActionsButtons = (stopMessage) => {
        const isIndividualEditPermitted = IS_LOGIN_NOT_REQUIRED || isIndividualEditStopMessagesPermitted(stopMessage);
        return isIndividualEditPermitted ? (
            <div className="cc-table-actions-col">
                <Button
                    className="control-messaging-view__edit-btn"
                    onClick={ () => this.props.toggleModals(this.MODALS.edit.type, stopMessage) }>
                    <FiEdit size={ 20 } className="mr-1" />
                </Button>
                <Button
                    className="control-messaging-view__cancel-btn"
                    onClick={ () => this.props.toggleModals(this.MODALS.cancel.type, stopMessage) }>
                    <FiTrash2 size={ 20 } className="mr-1" />
                </Button>
            </div>
        ) : null;
    };

    updateStopMessage = (payload, recurrence) => {
        const { edit, cancel } = this.MODALS;
        const { modal } = this.props;
        const stopMessageId = (modal.type === edit.type || modal.type === cancel.type) && modal.stopMessage ? modal.stopMessage.id : null;
        return this.props.updateStopMessage(payload, stopMessageId, recurrence);
    };

    mergeStopsAndGroupsInMessagesList = () => {
        const getFormattedGroups = message => (
            (message.stopGroups && message.stopGroups.length)
                ? formatGroupsForPresentation(message.stopGroups) : []
        );

        return this.props.stopMessages.map(message => ({
            ...message,
            stopsAndGroups: [...message.stops, ...getFormattedGroups(message)],
        }));
    };

    stopMessageSelected = selectedData => this.mergeStopsAndGroupsInMessagesList().filter(message => message.id === selectedData.id);

    messagesWithStop = (stops, selectedData) => some(stops, s => s.value === selectedData.stop_code);

    stopSelected = selectedData => this.mergeStopsAndGroupsInMessagesList().filter((message) => {
        if (message.stopGroups.length) {
            return some(message.stopGroups, (stopGroup) => {
                if (stopGroup.id === 0) {
                    return true;
                }
                if (stopGroup.id === SYSTEM_STOP_GROUP_ID) {
                    return +selectedData.stop_code >= SYSTEM_STOP_GROUP_STOP_START && +selectedData.stop_code <= SYSTEM_STOP_GROUP_STOP_END;
                }
                if (message.stops.length) {
                    return this.messagesWithStop(message.stops, selectedData);
                }
                return some(stopGroup.stops, s => s.value === selectedData.stop_code);
            });
        }
        return this.messagesWithStop(message.stops, selectedData);
    });

    stopGroupSelected = selectedData => this.mergeStopsAndGroupsInMessagesList().filter(message => some(message.stopGroups, g => g.id === selectedData.id));

    messageSelectedFromIncidentNo = (incidentNo, dataStore) => {
        if (dataStore) {
            return dataStore.filter(message => message.incidentNo && message.incidentNo === incidentNo);
        }
        return this.mergeStopsAndGroupsInMessagesList().filter(message => message.incidentNo && message.incidentNo === incidentNo);
    };

    updateMessagesList = (selectedData, statusFilterValue, typeFilterValue, incidentNo = null) => {
        let messagesList;
        let searchValue;
        let disruptionSearchValue;

        if (selectedData.message) {
            searchValue = selectedData.message;
            messagesList = this.stopMessageSelected(selectedData);
        } else if (selectedData.stop_code) {
            searchValue = `${selectedData.stop_code} - ${selectedData.stop_name}`;
            messagesList = this.stopSelected(selectedData);
        } else if (selectedData.title) {
            searchValue = selectedData.title;
            messagesList = this.stopGroupSelected(selectedData);
        } else {
            // No search result selected
            searchValue = '';
            messagesList = this.mergeStopsAndGroupsInMessagesList();
        }

        if (incidentNo) {
            disruptionSearchValue = incidentNo;
            messagesList = this.messageSelectedFromIncidentNo(disruptionSearchValue, messagesList);
        }

        messagesList = messagesList.map(message => ({
            ...message,
            isCurrent: !message.endTime || moment(message.endTime) >= moment(),
            isActive: message.status !== STOP_MESSAGE_TYPE.STATUS.DRAFT.toLowerCase(),
        }));

        if (statusFilterValue === STOP_MESSAGE_TYPE.STATUS.ACTIVE) {
            messagesList = messagesList.filter(message => message.isActive);
        } else if (statusFilterValue === STOP_MESSAGE_TYPE.STATUS.DRAFT) {
            messagesList = messagesList.filter(message => !message.isActive);
        }

        if (typeFilterValue === STOP_MESSAGE_TYPE.TYPE.CURRENT) {
            messagesList = messagesList.filter(message => message.isCurrent);
        } else if (typeFilterValue === STOP_MESSAGE_TYPE.TYPE.EXPIRED) {
            messagesList = messagesList.filter(message => !message.isCurrent);
        }

        this.setState({
            searchValue,
            disruptionSearchValue,
            selectedData,
            messagesList,
            statusFilterValue,
            typeFilterValue,
        });
    };

    render() {
        const { messagesList, searchValue, selectedData, statusFilterValue, typeFilterValue, disruptionSearchValue } = this.state;
        const { modal } = this.props;
        const { STOP, STOP_GROUP_MERGED, STOP_MESSAGE, STOP_DISRUPTION } = SEARCH_RESULT_TYPE;
        const { create, edit, cancel } = this.MODALS;
        const isGlobalEditMessagesPermitted = IS_LOGIN_NOT_REQUIRED || isGlobalEditStopMessagesPermitted(this.props.stopMessagesPermissions);

        const actionHandlers = {
            selection: {
                [STOP.type]: ({ data }) => this.updateMessagesList(data, statusFilterValue, typeFilterValue, disruptionSearchValue),
                [STOP_GROUP_MERGED.type]: ({ data }) => this.updateMessagesList(data, statusFilterValue, typeFilterValue, disruptionSearchValue),
                [STOP_MESSAGE.type]: ({ data }) => this.updateMessagesList(data, statusFilterValue, typeFilterValue, disruptionSearchValue),
            },
            clear: {
                [STOP.type]: noop,
                [STOP_GROUP_MERGED.type]: noop,
                [STOP_MESSAGE.type]: noop,
            },
        };

        const disruptionActionHandlers = {
            selection: {
                [STOP_DISRUPTION.type]: ({ data }) => this.updateMessagesList(selectedData, statusFilterValue, typeFilterValue, data),
            },
            clear: {
                [STOP_DISRUPTION.type]: noop,
            },
        };

        return (
            <div className="control-messaging-view">
                <h1>Messaging</h1>
                <div className="row py-2">
                    <div className="search-filters col-2">
                        <SearchFilter
                            value={ searchValue }
                            placeholder="Search for a stop or message"
                            searchInCategory={ [STOP.type, STOP_GROUP_MERGED.type, STOP_MESSAGE.type] }
                            selectionHandlers={ actionHandlers.selection }
                            clearHandlers={ actionHandlers.clear }
                            onClearCallBack={ () => this.updateMessagesList({}, statusFilterValue, typeFilterValue, disruptionSearchValue) }
                        />
                    </div>
                    <div className="search-filters col-2">
                        <SearchFilter
                            value={ disruptionSearchValue }
                            placeholder="Search by disruption number"
                            searchInCategory={ [STOP_DISRUPTION.type] }
                            selectionHandlers={ disruptionActionHandlers.selection }
                            clearHandlers={ disruptionActionHandlers.clear }
                            onClearCallBack={ () => this.updateMessagesList(selectedData, statusFilterValue, typeFilterValue, '') }
                        />
                    </div>
                    <div className="col-5">
                        { isGlobalEditMessagesPermitted && (
                            <div>
                                <Button
                                    className="control-messaging-view__create-btn cc-btn-primary"
                                    onClick={ () => this.props.toggleModals(create.type, null) }>
                                    { this.MODALS.create.title }
                                </Button>
                            </div>
                        )}
                        <StopMessagesModal
                            title={ modal.type ? this.MODALS[modal.type].title : '' }
                            isModalOpen={ (modal.type === create.type || modal.type === edit.type) && modal.isOpen }
                            modalType={ modal.type }
                            activeMessage={ modal.stopMessage }
                            onAction={ this.updateStopMessage }
                            onClose={ () => this.props.toggleModals(null, null) } />
                        <ConfirmationModal
                            okButtonClassName="control-messaging-view__cancel-modal-ok-btn"
                            title={ this.MODALS.cancel.title }
                            message={ this.MODALS.cancel.message }
                            isOpen={ modal.type === cancel.type && modal.isOpen }
                            onAction={ () => this.updateStopMessage(null).then(() => this.props.toggleModals(null, null)).catch(() => {}) }
                            onClose={ () => this.props.toggleModals(null, null) } />
                    </div>
                    <div className="col-3">
                        <CustomButtonGroup
                            buttons={ [{ type: STOP_MESSAGE_TYPE.TYPE.CURRENT }, { type: STOP_MESSAGE_TYPE.TYPE.EXPIRED }] }
                            selectedOptions={ [typeFilterValue] }
                            className="d-flex justify-content-end align-items-center float-right ml-3"
                            onSelection={ (selectedType) => {
                                this.props.getStopMessagesAndPermissions();
                                this.updateMessagesList(selectedData, statusFilterValue, selectedType, disruptionSearchValue);
                            } } />
                        <CustomButtonGroup
                            buttons={ [{ type: STOP_MESSAGE_TYPE.STATUS.ACTIVE }, { type: STOP_MESSAGE_TYPE.STATUS.DRAFT }] }
                            selectedOptions={ [statusFilterValue] }
                            className="d-flex justify-content-end align-items-center float-right"
                            onSelection={ (selectedStatus) => {
                                this.props.getStopMessagesAndPermissions();
                                this.updateMessagesList(selectedData, selectedStatus, typeFilterValue, disruptionSearchValue);
                            } } />
                    </div>
                </div>
                <StopMessagesTable
                    columns={ this.MESSAGING_COLUMNS }
                    messages={ messagesList }
                    isLoading={ this.props.isStopMessagesLoading }
                    stopMessagesSortingParams={ this.props.stopMessagesSortingParams }
                    renderActionsButtons={ stopMessage => this.renderActionsButtons(stopMessage) }
                />
            </div>
        );
    }
}

export default connect(
    state => ({
        stopMessages: getSortedStopMesssages(state),
        isStopMessagesLoading: getStopMessagesLoadingState(state),
        stopMessagesPermissions: getStopMessagesPermissions(state),
        stopMessagesSortingParams: getStopMessagesSortingParams(state),
        modal: getModal(state),
    }),
    { getStopMessagesAndPermissions, updateStopMessage, getStopGroups, toggleModals },
)(StopMessagesView);
