import React from 'react';
import PropTypes from 'prop-types';
import { delay, isEmpty } from 'lodash-es';
import { Alert } from 'reactstrap';

import MESSAGE_TYPES, { CONFIRMATION_MESSAGE_TYPE } from '../../../../types/message-types';

export default class Message extends React.Component {
    static propTypes = {
        autoDismiss: PropTypes.bool,
        isDismissible: PropTypes.bool,
        timeout: PropTypes.number,
        message: PropTypes.shape({
            id: PropTypes.string.isRequired,
            body: PropTypes.node.isRequired,
            type: PropTypes.oneOf(MESSAGE_TYPES),
            tripId: PropTypes.string,
        }),
        onClose: PropTypes.func,
        zIndex: PropTypes.number,
    };

    static defaultProps = {
        message: null,
        autoDismiss: true,
        isDismissible: true,
        timeout: 3150,
        onClose: () => {},
        zIndex: null,
    };

    constructor(props) {
        super(props);

        this.state = {
            isVisible: true,
        };

        this.dismissTimeoutId = null;
    }

    componentDidMount() {
        if (this.props.autoDismiss) {
            this.dismissTimeoutId = delay(this.handleDismiss, this.props.timeout);
        }
    }

    componentWillUnmount() {
        if (this.dismissTimeoutId) {
            window.clearTimeout(this.dismissTimeoutId);
        }
    }

    handleDismiss = () => this.setState({ isVisible: false });

    render() {
        if (isEmpty(this.props.message)) return null;

        const transitionOptions = {
            in: true,
            timeout: 150,
            onExited: () => this.props.onClose(),
        };

        return (
            <Alert
                className="mb-0"
                color={ this.props.message.type || CONFIRMATION_MESSAGE_TYPE }
                isOpen={ this.state.isVisible }
                toggle={ this.props.isDismissible ? this.handleDismiss : null }
                transition={ transitionOptions }
                style={ this.props.zIndex ? { zIndex: this.props.zIndex } : {} }>
                { this.props.message.body }
            </Alert>
        );
    }
}
