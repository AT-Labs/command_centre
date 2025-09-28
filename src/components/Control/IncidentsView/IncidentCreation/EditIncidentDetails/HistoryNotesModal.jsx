import { Table, Button } from 'reactstrap';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { formatCreatedUpdatedTime } from '../../../../../utils/control/disruptions';
import CustomModal from '../../../../Common/CustomModal/CustomModal';
import './HistoryNotesModal.scss';

const HistoryNotesModal = (props) => {
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
                                    {note.description}
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
};

export default connect()(HistoryNotesModal);
