import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Label } from 'reactstrap';
import { formatCreatedUpdatedTime } from '../../../../utils/control/disruptions';
import { useEditDisruptionNotes } from '../../../../redux/selectors/appSettings';

const LastNoteView = (props) => {
    const { note, label, id, useEditDisruptionNotes } = props;
    return (
        <div className="row">
            <div className="col-3">
                <Label for={ id }><span className="font-size-md font-weight-bold">{ label }</span></Label>
            </div>
            <div className="col-9 text-right">
                {note && (
                    <>
                        <span>{(useEditDisruptionNotes && note.lastUpdatedBy) || note.createdBy}</span>
                        ,
                        {' '}
                        {formatCreatedUpdatedTime((useEditDisruptionNotes && note.lastUpdatedTime) || note.createdTime)}
                        ,
                        {' '}
                        {note.description}
                    </>
                )}
            </div>
        </div>
    );
};

LastNoteView.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    note: PropTypes.object,
    useEditDisruptionNotes: PropTypes.bool.isRequired,
};

LastNoteView.defaultProps = {
    note: undefined,
};

const ConnectedLastNoteView = connect(state => ({
    useEditDisruptionNotes: useEditDisruptionNotes(state),
}))(LastNoteView);

export { ConnectedLastNoteView as LastNoteView };
