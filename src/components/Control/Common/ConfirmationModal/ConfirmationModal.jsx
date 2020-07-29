import React from 'react';
import PropTypes from 'prop-types';

import ConfirmationModalBody from './ConfirmationModalBody';
import CustomModal from '../../../Common/CustomModal/CustomModal';

const ConfirmationModal = props => (
    <CustomModal
        className={ props.className }
        title={ props.title }
        okButton={ {
            label: props.title,
            onClick: props.onAction,
            isDisabled: false,
            className: props.okButtonClassName,
        } }
        onClose={ props.onClose }
        isModalOpen={ props.isOpen }>
        <ConfirmationModalBody message={ props.message } />
    </CustomModal>
);

ConfirmationModal.propTypes = {
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onAction: PropTypes.func.isRequired,
    onClose: PropTypes.func.isRequired,
    className: PropTypes.string,
    okButtonClassName: PropTypes.string,
};

ConfirmationModal.defaultProps = {
    className: '',
    okButtonClassName: '',
};

export default ConfirmationModal;
