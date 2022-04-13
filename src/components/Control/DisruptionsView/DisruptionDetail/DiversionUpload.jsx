import PropTypes from 'prop-types';
import React, { useState, useEffect, useRef } from 'react';
import { isEmpty, head } from 'lodash-es';
import { Button, Label } from 'reactstrap';
import { FaTimesCircle, FaPaperclip } from 'react-icons/fa';
import ConfirmationModal from '../../Common/ConfirmationModal/ConfirmationModal';
import DisruptionLabelAndText from './DisruptionLabelAndText';
import { formatCreatedUpdatedTime } from '../../../../utils/control/disruptions';
import { STATUSES } from '../../../../types/disruptions-types';

const DiversionUpload = (props) => {
    const { disruption, disabled, readonly } = props;
    const { status } = disruption;
    const [uploadedFile, setUploadedFile] = useState(head(disruption.uploadedFiles));
    const [isDeleteFileModalOpen, setIsDeleteFileModalOpen] = useState(false);
    const fileUploadRef = useRef(null);

    useEffect(() => {
        setUploadedFile(head(disruption.uploadedFiles));
    }, [
        disruption.uploadedFiles,
    ]);

    const isResolved = () => status === STATUSES.RESOLVED;

    const uploadFiles = (files) => {
        if (!isEmpty(files)) {
            props.uploadDisruptionFiles(disruption, files);
        }
    };

    const deleteFile = (fileId) => {
        if (!isEmpty(fileId)) {
            props.deleteDisruptionFile(disruption, fileId);
        }
    };

    if (!uploadedFile) {
        if (readonly) {
            return null;
        }

        return (
            <div className="form-group">
                <input
                    ref={ fileUploadRef }
                    type="file"
                    hidden
                    onChange={ (e) => { uploadFiles(e.target.files); } }
                />
                <Button
                    id="disruption-detail__btn-upload"
                    hidden={ isResolved() }
                    disabled={ disabled }
                    className="cc-btn-secondary mr-3"
                    onClick={ () => { fileUploadRef.current.click(); } }
                >
                    Upload diversion
                </Button>
            </div>
        );
    }

    const { fileName, storageUrl, id, uploadedBy, uploadedOn } = uploadedFile;

    return (
        <div className="form-group">
            <div className="row">
                <div className="col-3 text-truncate">
                    <Label for="disruption-detail__file">
                        <span className="font-size-md font-weight-bold">Diversion file</span>
                    </Label>
                    <a
                        className="form-control-plaintext text-truncate"
                        id="disruption-detail__file"
                        target="_blank"
                        rel="noreferrer"
                        download={ fileName }
                        href={ storageUrl }
                    >
                        <FaPaperclip />
                        <span className="align-middle ml-2">{ fileName }</span>
                    </a>
                </div>
            </div>
            <div className="row">
                <div className="col-5 disruption-detail__contributors">
                    <DisruptionLabelAndText
                        className="font-size-sm"
                        id="disruption-detail__file-uploaded-by"
                        label="Uploaded By"
                        text={ `${uploadedBy}, ${formatCreatedUpdatedTime(uploadedOn)}` }
                    />
                </div>
            </div>
            {
                !readonly && (
                    <div className="row">
                        <div className="col-5">
                            <Button
                                id="disruption-detail__btn-delete"
                                hidden={ isResolved() }
                                className="cc-btn-secondary mr-3"
                                disabled={ disabled }
                                onClick={ () => { setIsDeleteFileModalOpen(true); } }
                            >
                                <FaTimesCircle className="text-danger" />
                                <span className="align-middle ml-2">Delete diversion</span>
                            </Button>
                        </div>
                    </div>
                )
            }

            <ConfirmationModal
                title="Delete Diversion"
                message={ `Are you sure you wish to delete the uploaded diversion '${fileName}'?` }
                isOpen={ isDeleteFileModalOpen }
                onClose={ () => setIsDeleteFileModalOpen(false) }
                onAction={ () => {
                    deleteFile(id);
                    setIsDeleteFileModalOpen(false);
                } }
            />
        </div>
    );
};

DiversionUpload.propTypes = {
    disruption: PropTypes.object.isRequired,
    disabled: PropTypes.bool.isRequired,
    readonly: PropTypes.bool,
    uploadDisruptionFiles: PropTypes.func,
    deleteDisruptionFile: PropTypes.func,
};

DiversionUpload.defaultProps = {
    readonly: false,
    uploadDisruptionFiles: null,
    deleteDisruptionFile: null,
};

export default DiversionUpload;
