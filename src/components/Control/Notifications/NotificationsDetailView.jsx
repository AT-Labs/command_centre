import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { BsArrowRepeat } from 'react-icons/bs';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash-es';
import { LABEL_TITLE, LABEL_DESCRIPTION, LABEL_CAUSE, LABEL_EFFECT, LABEL_AFFECTED_ENTITIES } from '../../../constants/notifications';
import { getNotificationAction, isNotificationUpdateAllowed } from '../../../redux/selectors/control/notifications';
import { updateNotification, clearNotificationActionResult, deleteNotification, publishNotification } from '../../../redux/actions/control/notifications';
import { getNotification, getRenderedContent } from '../../../utils/transmitters/notifications-api';
import Loader from '../../Common/Loader/Loader';
import CustomMuiDialog from '../../Common/CustomMuiDialog/CustomMuiDialog';
import ActivePeriods from '../../Common/ActivePeriods/ActivePeriods';
import { getRecurrenceText, parseRecurrencePattern } from '../../../utils/recurrence';
import { getTitle, getDescription, getAndParseInformedEntities } from '../../../utils/control/notifications';
import { CAUSES, IMPACTS } from '../../../types/disruptions-types';
import AffectedEntities from '../DisruptionsView/AffectedEntities';
import AlertMessage from '../../Common/AlertMessage/AlertMessage';
import { NOTIFICATION_CONDITION, NOTIFICATION_STATUS } from '../../../types/notification-types';

export const NotificationsDetailView = (props) => {
    const { notification } = props;

    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [cause, setCause] = useState('');
    const [impact, setImpact] = useState('');
    const [informedEntities, setInformedEntities] = useState([]);
    const [recurrencePattern, setRecurrencePattern] = useState();
    const [activePeriods, setActivePeriods] = useState([]);
    const [currentId, setCurrentId] = useState('');

    const [recurrent, setRecurrent] = useState();

    const [fetchingNotification, setFetchingNotification] = useState(true);
    const [fetchFailed, setFetchFailed] = useState(false);
    const [activePeriodsModalOpen, setActivePeriodsModalOpen] = useState(false);

    const canEditField = () => isNotificationUpdateAllowed(props.notification);

    useEffect(() => {
        if (notification.notificationContentId !== currentId) {
            setFetchingNotification(true);

            const getNotificationPromise = () => getNotification(notification.notificationContentId)
                .then((data) => {
                    setCause(data.cause);
                    setImpact(data.impact);
                    setRecurrencePattern(data.recurrencePattern);
                    setRecurrent(data.recurrent);
                    setActivePeriods(data.activePeriods);
                    const entities = getAndParseInformedEntities(data.informedEntities);
                    setInformedEntities(entities);
                });

            const getRenderedContentPromise = () => getRenderedContent(notification.notificationContentId)
                .then((data) => {
                    const { items } = data;
                    setTitle(getTitle(items));
                    setDescription(getDescription(items));
                });

            Promise.all([getNotificationPromise(), getRenderedContentPromise()])
                .catch(() => setFetchFailed(true))
                .finally(() => setFetchingNotification(false));

            setCurrentId(notification.notificationContentId);
        }
    }, [notification]);

    const canEdit = props.notification.condition === NOTIFICATION_CONDITION.draft && props.notification.status === NOTIFICATION_STATUS.inProgress;
    const canSaveorPublish = canEdit && !isEmpty(description) && !isEmpty(title);

    const saveNotification = () => props.updateNotification({ notification: props.notification, name: title, content: description });

    return (
        <div className="p-3 h-100">
            { fetchingNotification && (
                <div className="d-flex justify-content-center align-items-center h-100">
                    <Loader />
                </div>
            )}
            { !fetchingNotification && fetchFailed && (
                <div className="d-flex justify-content-center align-items-center h-100">
                    <h3>Error occurred while retrieving the notification.</h3>
                </div>
            )}
            { !fetchingNotification && !fetchFailed && (
                <Form className="notification-detail">
                    <div className="row mt-3">
                        <section className="col-4">
                            <FormGroup className="mt-2">
                                <Label for="notification-detail__header">
                                    <span className="font-size-md font-weight-bold">{LABEL_CAUSE}</span>
                                </Label>
                                <Input id="notification-detail__header"
                                    className="border border-dark"
                                    value={ CAUSES.find(causeParam => causeParam.value === cause).label }
                                    disabled
                                />
                            </FormGroup>
                            <FormGroup className="mt-2">
                                <Label for="notification-detail__header">
                                    <span className="font-size-md font-weight-bold">{LABEL_EFFECT}</span>
                                </Label>
                                <Input id="notification-detail__header"
                                    className="border border-dark"
                                    value={ IMPACTS.find(impactParam => impactParam.value === impact).label }
                                    disabled
                                />
                            </FormGroup>
                            <FormGroup className="mt-2">
                                <Label for="notification-detail__header" className="w-100">
                                    <div className="d-flex justify-content-between">
                                        <span className="font-size-md font-weight-bold">{LABEL_AFFECTED_ENTITIES}</span>
                                    </div>
                                </Label>
                                <AffectedEntities
                                    className="border border-dark p-0 rounded w-100"
                                    affectedEntities={ informedEntities }
                                    isEditDisabled
                                    showHeader={ false }
                                    heightSmall
                                />
                            </FormGroup>
                        </section>
                        <section className="col-8">
                            <FormGroup className="mt-2">
                                <Label for="notification-detail__header">
                                    <span className="font-size-md font-weight-bold">{LABEL_TITLE}</span>
                                </Label>
                                <Input id="notification-detail__header"
                                    className="border border-dark"
                                    value={ title }
                                    disabled={ !canEditField() || !canEdit }
                                    onChange={ e => setTitle(e.currentTarget.value) }
                                />
                            </FormGroup>
                            <FormGroup>
                                <Label for="notification-detail__description">
                                    <span className="font-size-md font-weight-bold">{LABEL_DESCRIPTION}</span>
                                </Label>
                                <Input id="notification-detail__description"
                                    className="textarea-no-resize border border-dark"
                                    type="textarea"
                                    disabled={ !canEditField() || !canEdit }
                                    value={ description }
                                    onChange={ e => setDescription(e.currentTarget.value) }
                                    rows={ 5 }
                                />
                            </FormGroup>
                            { recurrent && (
                                <FormGroup>
                                    <BsArrowRepeat size={ 22 } />
                                    <span className="pl-1">{ getRecurrenceText(parseRecurrencePattern(recurrencePattern)) }</span>
                                </FormGroup>
                            )}

                            <section className="col-12">
                                <FormGroup className="d-flex align-items-end justify-content-end">
                                    { recurrent && (
                                        <Button
                                            id="view-active-periods"
                                            className="ml-3 mr-3"
                                            onClick={ () => { setActivePeriodsModalOpen(true); } }
                                        >
                                            View All Active Periods
                                        </Button>
                                    ) }
                                    { canEditField() && (
                                        <>
                                            <Button
                                                id="delete"
                                                className="ml-3 mr-3"
                                                disabled={ !canEdit || props.isRequesting }
                                                onClick={ () => props.deleteNotification(props.notification) }
                                            >
                                                Delete
                                            </Button>
                                            <Button
                                                id="save-changes"
                                                className="ml-3 mr-3"
                                                disabled={ !canSaveorPublish || props.isRequesting }
                                                onClick={ () => saveNotification() }
                                            >
                                                Save Changes
                                            </Button>
                                            <Button
                                                id="publish"
                                                className="cc-btn-primary ml-3"
                                                disabled={ !canSaveorPublish || props.isRequesting }
                                                onClick={ () => props.publishNotification(props.notification) }
                                            >
                                                Publish
                                            </Button>
                                        </>
                                    ) }
                                </FormGroup>
                            </section>
                        </section>
                    </div>
                    { props.resultStatus && props.resultNotificationId === props.notification.notificationContentId && (
                        <AlertMessage
                            message={ {
                                id: props.resultNotificationId,
                                type: props.resultStatus,
                                body: props.resultMessage,
                            } }
                            onClose={ () => props.clearNotificationActionResult() }
                        />
                    )}
                    <CustomMuiDialog
                        title="Disruption Active Periods"
                        onClose={ () => setActivePeriodsModalOpen(false) }
                        isOpen={ activePeriodsModalOpen }>
                        <ActivePeriods activePeriods={ activePeriods } />
                    </CustomMuiDialog>
                </Form>
            )}
        </div>
    );
};

NotificationsDetailView.propTypes = {
    notification: PropTypes.object.isRequired,
    resultStatus: PropTypes.string,
    resultMessage: PropTypes.string,
    resultNotificationId: PropTypes.string,
    isRequesting: PropTypes.bool,
    updateNotification: PropTypes.func.isRequired,
    deleteNotification: PropTypes.func.isRequired,
    publishNotification: PropTypes.func.isRequired,
    clearNotificationActionResult: PropTypes.func.isRequired,
};

NotificationsDetailView.defaultProps = {
    resultStatus: null,
    resultMessage: null,
    isRequesting: false,
    resultNotificationId: null,
};

export default connect(state => ({
    ...getNotificationAction(state),
}), {
    updateNotification,
    deleteNotification,
    publishNotification,
    clearNotificationActionResult,
})(NotificationsDetailView);
