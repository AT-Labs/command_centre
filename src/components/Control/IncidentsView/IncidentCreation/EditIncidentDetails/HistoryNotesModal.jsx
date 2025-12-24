import { Table, Button, Input } from 'reactstrap';
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { BsPencilSquare } from 'react-icons/bs';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { IconButton } from '@mui/material';
import { formatCreatedUpdatedTime } from '../../../../../utils/control/disruptions';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import { DESCRIPTION_NOTE_MAX_LENGTH } from '../../../../../constants/disruptions';
import './HistoryNotesModal.scss';

const HistoryNotesModal = (props) => {
    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editedDescription, setEditedDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!props.isModalOpen) {
            setEditingNoteId(null);
            setEditedDescription('');
            setIsSaving(false);
        }
    }, [props.isModalOpen]);

    const handleEditClick = (note) => {
        if (editingNoteId !== null) {
            return;
        }
        setEditingNoteId(note.id);
        setEditedDescription(note.description);
    };

    const handleCancel = () => {
        setEditingNoteId(null);
        setEditedDescription('');
    };

    const handleSave = async () => {
        if (!editedDescription.trim() || isSaving) {
            return;
        }

        setIsSaving(true);
        try {
            const notes = props.disruption.notes || [];

            const updatedNotes = notes
                .map((note) => {
                    if (note.id === editingNoteId) {
                        return {
                            id: note.id,
                            description: editedDescription.trim(),
                        };
                    }
                    return {
                        ...(note.id && { id: note.id }),
                        description: note.description,
                    };
                })
                .filter(note => note.description);

            if (props.onNoteUpdate) {
                await props.onNoteUpdate({
                    ...props.disruption,
                    notes: updatedNotes,
                    affectedEntities: props.disruption.affectedEntities || { affectedRoutes: [], affectedStops: [] },
                });
            }

            setEditingNoteId(null);
            setEditedDescription('');
        } catch (error) {
            // Error is handled by parent component
        } finally {
            setIsSaving(false);
        }
    };

    const generateModalFooter = () => (
        <Button onClick={ () => props.onClose() } className="cc-btn-primary">
            Close
        </Button>
    );

    return (
        <CustomModal
            className="cc-modal-standard-width disruption-summary notes-history-modal"
            title={ `Disruption notes history #${props.disruption.incidentNo}` }
            isModalOpen={ props.isModalOpen }
            onClose={ () => props.onClose() }
            customFooter={ generateModalFooter() }
        >
            {(Array.isArray(props.disruption.notes) && props.disruption.notes.length > 0) && (
                <Table className="table-layout-auto w-100">
                    <thead className="notes-history-header">
                        <tr>
                            <th className="notes-table-header">Last updated time</th>
                            <th className="notes-table-header">Last updated by</th>
                            <th className="notes-table-header-notes">Notes</th>
                            <th className="notes-table-header-actions"></th>
                        </tr>
                    </thead>
                    <tbody className="notes-history-body">
                        {[...props.disruption.notes].reverse().map(note => (
                            <tr key={ note.id }>
                                <td>
                                    {formatCreatedUpdatedTime(note.lastUpdatedTime ?? note.createdTime)}
                                </td>
                                <td className="notes-table-cell">
                                    {note.lastUpdatedBy ?? note.createdBy}
                                </td>
                                <td className="notes-table-cell">
                                    {editingNoteId === note.id ? (
                                        <Input
                                            type="textarea"
                                            value={ editedDescription }
                                            onChange={ e => setEditedDescription(e.target.value) }
                                            maxLength={ DESCRIPTION_NOTE_MAX_LENGTH }
                                            rows={ 4 }
                                            className="notes-edit-textarea"
                                            style={ { resize: 'vertical', minHeight: '80px', maxHeight: '300px', overflowY: 'auto' } }
                                        />
                                    ) : (
                                        <div className="notes-description">{note.description}</div>
                                    )}
                                </td>
                                <td className="notes-table-cell notes-actions-cell">
                                    {editingNoteId === note.id ? (
                                        <div className="notes-edit-actions">
                                            <IconButton
                                                size="small"
                                                onClick={ handleSave }
                                                disabled={ isSaving || !editedDescription.trim() || editedDescription === note.description }
                                                color="primary"
                                                title="Save changes"
                                            >
                                                <CheckIcon />
                                            </IconButton>
                                            <IconButton
                                                size="small"
                                                onClick={ handleCancel }
                                                disabled={ isSaving }
                                                color="secondary"
                                                title="Cancel"
                                            >
                                                <CloseIcon />
                                            </IconButton>
                                        </div>
                                    ) : (
                                        <IconButton
                                            size="medium"
                                            onClick={ () => handleEditClick(note) }
                                            disabled={ editingNoteId !== null }
                                            title="Edit note"
                                        >
                                            <BsPencilSquare />
                                        </IconButton>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {(!Array.isArray(props.disruption.notes) || props.disruption.notes.length === 0) && (
                <p className="notes-empty-message">No notes to display</p>
            )}
        </CustomModal>
    );
};

HistoryNotesModal.propTypes = {
    isModalOpen: PropTypes.bool.isRequired,
    disruption: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onNoteUpdate: PropTypes.func,
};

HistoryNotesModal.defaultProps = {
    onNoteUpdate: undefined,
};

export default HistoryNotesModal;
