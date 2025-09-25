import { Table, Button } from 'reactstrap';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { formatCreatedUpdatedTime } from '../../../../../utils/control/disruptions';
import CustomModal from '../../../../Common/CustomModal/CustomModal';

const HistoryNotesModal = (props) => {
    const generateModalFooter = () => (
        <Button onClick={ () => props.onClose() } className="cc-btn-primary">
            Close
        </Button>
    );
    return (
        <CustomModal
            className="cc-modal-standard-width disruption-summary"
            title={ `Disruption notes history #${props.disruption.incidentNo}` }
            isModalOpen={ props.isModalOpen }
            onClose={ () => props.onClose() }
            customFooter={ generateModalFooter() }
        >
            {(Array.isArray(props.disruption.notes) && props.disruption.notes.length > 0) && (
                <Table style={ { width: '100%', tableLayout: 'auto' } }>
                    <thead>
                        <tr>
                            <th style={ { width: '25%', borderTop: '2px solid #dee2e6', borderBottom: '2px solid #dee2e6' } }>Last updated time</th>
                            <th style={ { width: '25%', borderTop: '2px solid #dee2e6', borderBottom: '2px solid #dee2e6' } }>Last updated by</th>
                            <th style={ { width: '50%', borderTop: '2px solid #dee2e6', borderBottom: '2px solid #dee2e6' } }>Notes</th>
                        </tr>
                    </thead>
                    <tbody className="notes-tbody">
                        {[...props.disruption.notes].reverse().map(note => (
                            <tr key={ note.id }>
                                <td>
                                    {formatCreatedUpdatedTime(note.lastUpdatedTime ?? note.createdTime)}
                                </td>
                                <td style={ { overflowWrap: 'anywhere' } }>
                                    {note.lastUpdatedBy ?? note.createdBy}
                                </td>
                                <td style={ { overflowWrap: 'anywhere' } }>
                                    {note.description}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            {(!Array.isArray(props.disruption.notes) || props.disruption.notes.length === 0) && (
                <p className="col-3">No notes to display</p>
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
