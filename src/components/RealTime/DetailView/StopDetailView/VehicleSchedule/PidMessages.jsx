import React from 'react';
import PropTypes from 'prop-types';
import { generateUniqueID } from '../../../../../utils/helpers';

const PidMessage = props => (
    <div>
        <div>
            [Severity -
            <strong>{props.message.priority.toUpperCase()}</strong>
            ]
        </div>
        {props.message.text}
    </div>
);

const PidMessages = (props) => {
    const { messages } = props;

    switch (true) {
    case messages.length === 1:
        return <PidMessage message={ messages[0] } />;
    case messages.length > 1:
        return (
            <ul>
                {messages.map(m => (
                    <li key={ generateUniqueID() }><PidMessage message={ m } /></li>
                ))}
            </ul>
        );
    default:
        return null;
    }
};

PidMessage.propTypes = {
    message: PropTypes.object,
};
PidMessage.defaultProps = {
    message: {},
};
PidMessages.propTypes = {
    messages: PropTypes.array,
};
PidMessages.defaultProps = {
    messages: [],
};

export default PidMessages;
