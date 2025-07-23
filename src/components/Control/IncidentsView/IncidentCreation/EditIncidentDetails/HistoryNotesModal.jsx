import { Table, Button } from 'reactstrap';
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { formatCreatedUpdatedTime } from '../../../../../utils/control/disruptions';
import CustomModal from '../../../../Common/CustomModal/CustomModal';

const HistoryNotesModal = (props) => {
    const generateModalFooter = () => (
        <>
            <Button onClick={ () => props.onClose() } className="cc-btn-primary">
                Close
            </Button>
        </>
    );
    return (
        <CustomModal
            className="cc-modal-standard-width disruption-summary"
            title={ `History notes for Disruption #${props.disruption.incidentNo}` }
            isModalOpen={ props.isModalOpen }
            onClose={ () => props.onClose() }
            customFooter={ generateModalFooter() }
        >
            {(Array.isArray(props.disruption.notes) && props.disruption.notes.length > 0) && (
                <Table className="table-layout-fixed">
                    <tbody className="notes-tbody">
                        {[...props.disruption.notes].reverse().map(note => (
                            <tr key={ note.id } className="row d-block">
                                <td className="col-3">{formatCreatedUpdatedTime(note.createdTime)}</td>
                                <td className="col-3">{note.createdBy}</td>
                                <td className="col-6">{note.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
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
