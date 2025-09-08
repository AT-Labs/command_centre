import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Input } from 'reactstrap';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import './AddNoteModal.scss';
import { DESCRIPTION_NOTE_MAX_LENGTH } from '../../../../../constants/disruptions';

const AddNoteModal = (props) => {
    const [note, setNote] = useState(props.disruption.note || '');

    useEffect(() => {
        if (props.isModalOpen) {
            setNote(props.disruption.note || '');
        }
    }, [props.isModalOpen, props.disruption.note]);

    const generateFooter = () => (
        <div className="add-note-modal-footer">
            <Button onClick={ () => props.onSubmit(note) } className="cc-btn-primary">Add note</Button>
        </div>
    );

    const generateHeader = () => (
        <div className="add-note-modal-header">
            <div className="add-note-modal-header-close-container">
                <OpenInNewOutlinedIcon
                    className="add-note-modal-header-close-icon"
                    onClick={ () => props.onClose(note) }
                />
            </div>
            <div className="add-note-modal-title-container">
                <h3 className="add-note-modal-title">
                    {`Disruption Notes for Effect ${props.disruption.incidentNo}`}
                </h3>
            </div>
        </div>
    );

    return (
        <CustomModal
            className="cc-modal-standard-width add-note-modal"
            isModalOpen={ props.isModalOpen }
            customHeader={ generateHeader() }
            customFooter={ generateFooter() }
        >
            <Input
                type="textarea"
                className="add-note-modal-input"
                rows={ 8 }
                maxLength={ DESCRIPTION_NOTE_MAX_LENGTH }
                value={ note }
                onChange={ event => setNote(event.target.value) }
            />
        </CustomModal>
    );
};

AddNoteModal.propTypes = {
    isModalOpen: PropTypes.bool.isRequired,
    disruption: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
};

export default AddNoteModal;
