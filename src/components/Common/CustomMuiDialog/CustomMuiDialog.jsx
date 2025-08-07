import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

const CustomMuiDialog = props => (
    <Dialog open={ props.isOpen } fullWidth maxWidth={ props.maxWidth } scroll="body">
        <DialogTitle className="modal-header w-100">
            <span className="text-center flex-grow-1">{ props.title }</span>
            <button type="button" onClick={ props.onClose } className="close text-info ml-0 pl-0" aria-label="Close"><span aria-hidden="true">×</span></button>
        </DialogTitle>
        <DialogContent>
            { props.children }
        </DialogContent>
        <div className="modal-footer justify-content-center">
            {!props.footerContent && (
                <button type="button" onClick={ props.onClose } className="cc-btn-primary w-100 btn btn-secondary">Close</button>
            )}
            {props.footerContent}
        </div>
    </Dialog>

);

CustomMuiDialog.propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]).isRequired,
    maxWidth: PropTypes.oneOf(['lg', 'md', 'sm', 'xl', 'xs']),
    footerContent: PropTypes.element,
};

CustomMuiDialog.defaultProps = {
    maxWidth: 'sm',
    footerContent: null,
};

export default CustomMuiDialog;
