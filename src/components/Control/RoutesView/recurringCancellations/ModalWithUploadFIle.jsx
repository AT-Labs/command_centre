import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Button from '@mui/material/Button';
import { FormGroup } from 'reactstrap';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { getRestrictedAgencies } from '../../../../redux/selectors/control/agencies';
import FilterByOperator from '../../Common/Filters/FilterByOperator';

const ModalWithUploadFile = (props) => {
    const { allowUpdate, restrictOperatorData } = props;
    const { operator } = props.setting;
    const [filename, setFilename] = useState('');

    useEffect(() => {
        if (restrictOperatorData.length === 1) {
            props.onChange({ operator: restrictOperatorData[0].value });
        }
    }, []);

    const handleFileUpload = (e) => {
        if (!e.target.files) {
            return;
        }
        const { name } = e.target.files[0];
        setFilename(name);
        props.onChange({ csvFile: e.target.files[0] });
    };

    return (
        <div className="file-upload">
            <FormGroup id="recurrent-file-upload__operator" className="position-relative">
                <FilterByOperator
                    disabled={ !allowUpdate }
                    id="control-filters-operators-search"
                    customData={ restrictOperatorData }
                    selectedOption={ operator }
                    onSelection={ selectedOption => props.onChange({ operator: selectedOption.value }) } />
            </FormGroup>
            <div className="row">
                <div id="recurrent-file-upload__file-upload-button" className="position-relative col-6">
                    <Button
                        component="label"
                        className="cc-btn-primary"
                        startIcon={ <UploadFileIcon /> }>
                        Upload CSV
                        <input id="recurrent-file-upload" type="file" accept=".csv" hidden onChange={ handleFileUpload } />
                    </Button>
                    <section>
                        <p className="mb-0">{filename}</p>
                    </section>
                </div>
            </div>
        </div>
    );
};

ModalWithUploadFile.propTypes = {
    allowUpdate: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    setting: PropTypes.shape({
        operator: PropTypes.string.isRequired,
    }).isRequired,
    restrictOperatorData: PropTypes.array.isRequired,
};

export default connect(
    state => ({
        restrictOperatorData: getRestrictedAgencies(state),
    }),
    { },
)(ModalWithUploadFile);
