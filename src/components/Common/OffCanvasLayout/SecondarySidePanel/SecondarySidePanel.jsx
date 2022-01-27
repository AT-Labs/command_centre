import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash-es';
import { Button, Alert } from 'reactstrap';

import VIEW_TYPE from '../../../../types/view-types';
import SidePanel from '../SidePanel/SidePanel';
import { updateSecondaryPanelView, updateMainView, updateControlDetailView } from '../../../../redux/actions/navigation';
import { getLatestActiveNotifications } from '../../../../redux/selectors/control/notifications';
import { getActiveSecondaryPanelView } from '../../../../redux/selectors/navigation';
import Notification from '../../Notification/Notification';
import './SecondarySidePanel.scss';

const PAGE_SIZE = 10;

export class SecondarySidePanel extends React.Component {
    static propTypes = {
        activeSecondaryPanelView: PropTypes.string.isRequired,
        updateSecondaryPanelView: PropTypes.func.isRequired,
        updateMainView: PropTypes.func.isRequired,
        updateControlDetailView: PropTypes.func.isRequired,
        notifications: PropTypes.array,
    };

    static defaultProps = {
        notifications: [],
    };

    renderNotifications = notifications => notifications.map(notification => (
        <Notification
            key={ notification.id }
            id={ notification.id }
            customTitle={ notification.customTitle }
            message={ notification.message }
            routeVariantId={ notification.routeVariantId }
            routeType={ notification.routeType }
            routeShortName={ notification.routeShortName }
            agencyId={ notification.agencyId }
            tripStartDate={ notification.tripStartDate }
            tripStartTime={ notification.tripStartTime }
            goToRoutesView={ notification.goToRoutesView }
            dismissNotification={ notification.dismissNotification }
            // eslint-disable-next-line no-underscore-dangle
            links={ notification._links } />
    ));

    render() {
        const { notifications, activeSecondaryPanelView } = this.props;
        const isSecondarySidePanelOpen = !_.isEmpty(activeSecondaryPanelView);
        const activeNotificationsLength = notifications.length;
        return (
            isSecondarySidePanelOpen && (
                <SidePanel
                    isActive
                    position="right"
                    toggleButton={ false }
                    className="secondary-side-panel bg-secondary border-0 pb-3"
                    isOpen={ isSecondarySidePanelOpen }>
                    <div className="secondary-side-panel__header">
                        <div className="row">
                            <div className="col-10">
                                <h4>{ `Notifications (${activeNotificationsLength})` }</h4>
                            </div>
                            <div className="col-2">
                                <Button
                                    className="secondary-side-panel__close close cc-btn-link border-0 p-0"
                                    onClick={ () => this.props.updateSecondaryPanelView('') }>
                                    <span aria-hidden="true">×</span>
                                </Button>
                            </div>
                        </div>
                        <div className="row py-2">
                            <div className="col-12">
                                <Button
                                    className="control-notifications-view__btn cc-btn-primary w-100"
                                    tabIndex="0"
                                    aria-label="View all notifications button"
                                    onClick={ () => {
                                        this.props.updateMainView(VIEW_TYPE.MAIN.CONTROL);
                                        this.props.updateControlDetailView(VIEW_TYPE.CONTROL_DETAIL.NOTIFICATIONS);
                                        this.props.updateSecondaryPanelView('');
                                    } }>
                                    View all notifications
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="secondary-side-panel__body">
                        { this.renderNotifications(notifications) }
                        { activeNotificationsLength > PAGE_SIZE && (<Alert color="" className="mt-1">Dismiss the alerts to view older notifications</Alert>) }
                    </div>
                </SidePanel>
            )
        );
    }
}

export default connect(
    state => ({
        activeSecondaryPanelView: getActiveSecondaryPanelView(state),
        notifications: getLatestActiveNotifications(state),
    }),
    { updateSecondaryPanelView, updateMainView, updateControlDetailView },
)(SecondarySidePanel);
