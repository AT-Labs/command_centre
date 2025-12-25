import PropTypes from 'prop-types';
import React from 'react';
import { Label } from 'reactstrap';
import { formatCreatedUpdatedTime } from '../../../../utils/control/disruptions';

const LastNoteView = (props) => {
    const { note, label, id } = props;
    return (
        <div className="row">
            <div className="col-3">
                <Label for={ id }><span className="font-size-md font-weight-bold">{ label }</span></Label>
            </div>
            <div className="col-9 text-right">
                {note && (
                    <>
                        <span>{note.lastUpdatedBy ?? note.createdBy}</span>
                        ,
                        {' '}
                        {formatCreatedUpdatedTime(note.lastUpdatedTime ?? note.createdTime)}
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
};

LastNoteView.defaultProps = {
    note: undefined,
};

export { LastNoteView };
