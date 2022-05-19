import React from 'react';
import PropTypes from 'prop-types';

export const NotificationsDetailView = props => (
    <div>
        Notifications detail will display here
        <div>{ props.notification.text }</div>
    </div>
);

NotificationsDetailView.propTypes = {
    notification: PropTypes.object.isRequired,
};

export default NotificationsDetailView;
