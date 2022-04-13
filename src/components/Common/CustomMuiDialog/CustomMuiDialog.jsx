import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogTitle } from '@mui/material';

const CustomMuiDialog = props => (
    <Dialog open={ props.isOpen } fullWidth>
        <DialogTitle className="modal-header w-100">
            <span className="text-center flex-grow-1">{ props.title }</span>
            <button type="button" onClick={ props.onClose } className="close text-info ml-0 pl-0" aria-label="Close"><span aria-hidden="true">×</span></button>
        </DialogTitle>
        <div className="modal-body">
            { props.children }
        </div>
        <div className="modal-footer">
            <button type="button" onClick={ props.onClose } className="cc-btn-primary w-100 btn btn-secondary">Close</button>
        </div>
    </Dialog>

);

CustomMuiDialog.propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.oneOfType([PropTypes.element, PropTypes.array]).isRequired,
};

export default CustomMuiDialog;
