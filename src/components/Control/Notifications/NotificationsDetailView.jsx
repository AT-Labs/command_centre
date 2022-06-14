import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, FormGroup, Input, Label } from 'reactstrap';
import { BsArrowRepeat } from 'react-icons/bs';

import { LABEL_TITLE, LABEL_DESCRIPTION, LABEL_CAUSE, LABEL_EFFECT, LABEL_AFFECTED_ENTITIES } from '../../../constants/notifications';
import { isNotificationUpdateAllowed } from '../../../redux/selectors/control/notifications';
import { getNotification, getRenderedContent } from '../../../utils/transmitters/notifications-api';
import Loader from '../../Common/Loader/Loader';
import CustomMuiDialog from '../../Common/CustomMuiDialog/CustomMuiDialog';
import ActivePeriods from '../../Common/ActivePeriods/ActivePeriods';
import { getRecurrenceText, parseRecurrencePattern } from '../../../utils/recurrence';
import { getTitle, getDescription, getAndParseInformedEntities } from '../../../utils/control/notifications';
import { CAUSES, IMPACTS } from '../../../types/disruptions-types';
import AffectedEntities from '../DisruptionsView/AffectedEntities';

export const NotificationsDetailView = (props) => {
    const { notification } = props;

    const [description, setDescription] = useState('');
    const [title, setTitle] = useState('');
    const [cause, setCause] = useState('');
    const [impact, setImpact] = useState('');
    const [informedEntities, setInformedEntities] = useState([]);
    const [recurrencePattern, setRecurrencePattern] = useState();
    const [activePeriods, setActivePeriods] = useState();
    const [currentId, setCurrentId] = useState('');

    const [recurrent, setRecurrent] = useState();

    const [fetchingNotification, setFetchingNotification] = useState(true);
    const [fetchFailed, setFetchFailed] = useState(false);
    const [activePeriodsModalOpen, setActivePeriodsModalOpen] = useState(false);

    const canEditField = () => isNotificationUpdateAllowed(props.notification);

    useEffect(() => {
        if (notification.notificationContentId !== currentId) {
            setFetchingNotification(true);
            getNotification(notification.notificationContentId)
                .then((data) => {
                    setCause(data.cause);
                    setImpact(data.impact);
                    setRecurrencePattern(data.recurrencePattern);
                    setRecurrent(data.recurrent);
                    setActivePeriods(data.activePeriods);
                })
                .catch(() => {
                    setFetchFailed(true);
                })
                .finally(() => setFetchingNotification(false));

            getRenderedContent(notification.notificationContentId)
                .then((data) => {
                    const { items } = data;
                    setTitle(getTitle(items));
                    setDescription(getDescription(items));
                    setInformedEntities(getAndParseInformedEntities(items));
                });
        }
        setCurrentId(notification.notificationContentId);
    }, [notification]);

    return (
        <div className="p-2 h-100" id="notification-view">
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
                <Form>
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
                                    disabled={ !canEditField() }
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
                                    disabled={ !canEditField() }
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
                        </section>
                        { canEditField() && (
                            <section className="col-12">
                                <FormGroup className="d-flex align-items-end justify-content-end">
                                    <Button
                                        id="view-active-periods"
                                        className="ml-3 mr-3"
                                        onClick={ () => { setActivePeriodsModalOpen(true); } }
                                    >
                                        View All Active Periods
                                    </Button>
                                    <Button
                                        id="delete"
                                        className="ml-3 mr-3"
                                        onClick={ () => {} }
                                    >
                                        Delete
                                    </Button>
                                    <Button
                                        id="save-changes"
                                        className="ml-3 mr-3"
                                        onClick={ () => {} }
                                    >
                                        Save Changes
                                    </Button>
                                    <Button
                                        id="publish"
                                        className="cc-btn-primary ml-3"
                                        onClick={ () => {} }
                                    >
                                        Publish
                                    </Button>
                                </FormGroup>
                            </section>
                        ) }
                    </div>
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
};

export default NotificationsDetailView;
