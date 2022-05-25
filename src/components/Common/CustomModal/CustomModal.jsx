import React from 'react';
import PropTypes from 'prop-types';
import {
    Button, Modal, ModalHeader, ModalBody, ModalFooter,
} from 'reactstrap';

const cssModuleModalHeader = {
    'modal-title': 'modal-title mx-auto font-weight-normal',
    close: 'close text-info ml-0 pl-0',
};

const CustomModal = ({
    children, className, isModalOpen, title, okButton, onClose, renderToggleButton, customFooter,
}) => (
    <>
        {renderToggleButton && renderToggleButton()}
        <Modal
            isOpen={ isModalOpen }
            backdrop="static"
            className={ className }
            contentClassName="rounded-0">
            <ModalHeader toggle={ onClose } className="w-100" cssModule={ cssModuleModalHeader } tag="h3">
                {title}
            </ModalHeader>
            <ModalBody>
                {children}
            </ModalBody>
            {okButton && (
                <ModalFooter>
                    <Button
                        className={ `${okButton.className} cc-btn-primary w-100` }
                        onClick={ okButton.onClick }
                        disabled={ okButton.isDisabled }>
                        {okButton.label}
                    </Button>
                </ModalFooter>
            )}
            {customFooter && (
                <ModalFooter>
                    {customFooter}
                </ModalFooter>
            )}
        </Modal>
    </>
);

CustomModal.propTypes = {
    renderToggleButton: PropTypes.func,
    className: PropTypes.string,
    title: PropTypes.string,
    okButton: PropTypes.shape({
        label: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
        onClick: PropTypes.func.isRequired,
        isDisabled: PropTypes.bool,
        className: PropTypes.string,
    }),
    onClose: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]).isRequired,
    isModalOpen: PropTypes.bool.isRequired,
    customFooter: PropTypes.oneOfType([PropTypes.element, PropTypes.array]),
};

CustomModal.defaultProps = {
    title: '',
    onClose: null,
    renderToggleButton: null,
    okButton: null,
    className: '',
    customFooter: null,
};

export default CustomModal;
