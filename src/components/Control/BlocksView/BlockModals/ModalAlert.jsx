import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'reactstrap';

const ModalAlert = ({
    color, toggle, isOpen, content,
}) => (
    <Alert
        color={ color }
        isOpen={ isOpen }
        toggle={ toggle }>
        { content }
    </Alert>
);

ModalAlert.propTypes = {
    color: PropTypes.string.isRequired,
    toggle: PropTypes.func,
    isOpen: PropTypes.bool.isRequired,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]).isRequired,
};

ModalAlert.defaultProps = {
    toggle: null,
};

export default ModalAlert;
