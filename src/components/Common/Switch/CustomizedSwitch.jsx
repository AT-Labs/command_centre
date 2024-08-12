import * as React from 'react';
import { styled } from '@mui/material/styles';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import PropTypes from 'prop-types';

export const StyledSwitch = styled(Switch)(({ onColor, offColor }) => ({
    padding: 0,
    opacity: 1,
    height: 26,
    width: 47,
    '& .MuiSwitch-track': {
        borderRadius: 20,
        backgroundColor: offColor,
        '&::before, &::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            width: 16,
            height: 16,
        },
    },
    '& .MuiSwitch-thumb': {
        backgroundColor: '#ffffff',
        boxShadow: 'none',
        width: 19,
        height: 19,
        margin: -6,
    },
    '& .MuiSwitch-checked .MuiSwitch-track': {
        opacity: 1,
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: onColor,
        opacity: 1,
    },
}));

const CustomizedSwitch = ({ title, checked, onChange, onColor, offColor, id, className }) => (
    <FormGroup>
        <FormControlLabel
            id={ id }
            control={ (<StyledSwitch onChange={ () => onChange(!checked) } onColor={ onColor } offColor={ offColor } checked={ checked } />) }
            label={ title }
            style={ { margin: 0 } }
            className={ className }
        />
    </FormGroup>
);

CustomizedSwitch.propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    title: PropTypes.string,
    onColor: PropTypes.string,
    offColor: PropTypes.string,
    checked: PropTypes.bool,
    onChange: PropTypes.func,
};

CustomizedSwitch.defaultProps = {
    id: '',
    className: '',
    title: '',
    onColor: '#2d7cae',
    offColor: '#a1a7b0',
    checked: false,
    onChange: () => {},
};

export default CustomizedSwitch;
