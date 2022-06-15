import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Alert, Snackbar } from '@mui/material';
import MESSAGE_TYPES, { CONFIRMATION_MESSAGE_TYPE } from '../../../types/message-types';

const AlertMessage = (props) => {
    const [isVisible, setIsVisible] = useState(true);

    const handleDismiss = () => {
        setIsVisible(false);
        props.onClose();
    };

    return (!!props.message
        && (
            <Snackbar sx={ { mt: 6 } }
                anchorOrigin={ { vertical: 'top', horizontal: 'center' } }
                open={ isVisible }
                autoHideDuration={ props.autoDismiss ? props.dismissTimeout : null }
                onClose={ handleDismiss }>
                <Alert
                    className="mb-0"
                    severity={ props.message.type || CONFIRMATION_MESSAGE_TYPE }
                >
                    { props.message.body }
                </Alert>
            </Snackbar>
        ));
};

AlertMessage.propTypes = {
    autoDismiss: PropTypes.bool,
    dismissTimeout: PropTypes.number,
    message: PropTypes.shape({
        id: PropTypes.string.isRequired,
        body: PropTypes.node.isRequired,
        type: PropTypes.oneOf(MESSAGE_TYPES),
    }),
    onClose: PropTypes.func,
};

AlertMessage.defaultProps = {
    message: null,
    autoDismiss: true,
    dismissTimeout: 4000,
    onClose: () => null,
};

export default AlertMessage;
