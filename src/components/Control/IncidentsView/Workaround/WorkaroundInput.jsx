import PropTypes from 'prop-types';
import React from 'react';
import { isEmpty } from 'lodash-es';
import { FormGroup, Label } from 'reactstrap';
import { TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

import { WORKAROUND_TYPES } from '../../../../types/disruptions-types';

import './styles.scss';

const CustomTextField = styled(TextField)({
    '& .MuiFilledInput-root': {
        background: '#fff',
        '&:hover': {
            backgroundColor: 'transparent',
        },
        '&.Mui-focused': {
            backgroundColor: 'transparent',
        },
        '&.Mui-disabled': {
            backgroundColor: '#E9ECEF',
        },
    },
});

const WorkaroundInput = (props) => {
    const { label, workaroundText, helperText, workaroundKey, workaroundType, entities, disabled } = props;

    const handleWorkaroundUpdate = (event) => {
        const generatedWorkarounds = [];
        if (!isEmpty(event.target.value)) {
            if (workaroundType === WORKAROUND_TYPES.all.key) {
                generatedWorkarounds.push({ type: workaroundType, workaround: event.target.value });
            } else {
                entities.forEach(({ routeShortName, stopCode }) => {
                    generatedWorkarounds.push({ type: workaroundType, workaround: event.target.value, routeShortName, stopCode });
                });
            }
        }
        props.onWorkaroundUpdate({ key: workaroundKey, workarounds: generatedWorkarounds });
    };

    return (
        <FormGroup>
            <div className="row m-2 flex-column workaround-input">
                <div className="col">
                    <Label for={ `disruption-workaround-${workaroundKey}` } className="font-size-md align-self-center">
                        {label}
                    </Label>
                </div>
                <div className="col">
                    <CustomTextField
                        id={ `disruption-workaround-${workaroundKey}` }
                        value={ workaroundText }
                        onChange={ handleWorkaroundUpdate }
                        disabled={ disabled }
                        helperText={ helperText }
                        variant="filled"
                        size="small"
                        hiddenLabel
                        fullWidth
                        multiline
                        InputProps={ { disableUnderline: true } }
                    />
                </div>
            </div>
        </FormGroup>
    );
};

WorkaroundInput.propTypes = {
    onWorkaroundUpdate: PropTypes.func,
    label: PropTypes.string.isRequired,
    workaroundText: PropTypes.string.isRequired,
    workaroundType: PropTypes.string.isRequired,
    helperText: PropTypes.string.isRequired,
    workaroundKey: PropTypes.string.isRequired,
    entities: PropTypes.array,
    disabled: PropTypes.bool,
};

WorkaroundInput.defaultProps = {
    onWorkaroundUpdate: () => { /**/ },
    entities: [],
    disabled: false,
};

export default WorkaroundInput;
