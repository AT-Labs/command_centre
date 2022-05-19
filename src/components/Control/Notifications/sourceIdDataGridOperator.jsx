import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { FormControl, Input, InputAdornment, InputLabel } from '@mui/material';

function SourceIdInputValue(props) {
    const { item, applyValue, focusElementRef } = props;
    const value = item.value?.id ?? '';
    const prefixString = 'DISR';
    const controlRef = React.useRef(null);
    React.useImperativeHandle(focusElementRef, () => ({
        focus: () => {
            controlRef.current
                .querySelector(`input[value="${value || ''}"]`)
                .focus();
        },
    }));

    const handleFilterChange = (event) => {
        applyValue({ ...item, value: { id: event.target.value, source: 'DIS' } });
    };

    return (
        <Box
            sx={ {
                display: 'inline-flex',
                flexDirection: 'row',
                alignItems: 'center',
                height: 48,
                pl: '20px',
            } }
        >
            <FormControl fullWidth sx={ { m: 1 } } variant="standard">
                <InputLabel htmlFor="sourceid-input">Value</InputLabel>
                <Input
                    id="sourceid-input"
                    type="number"
                    value={ value }
                    onChange={ handleFilterChange }
                    startAdornment={ <InputAdornment position="start">{ prefixString }</InputAdornment> }
                    ref={ controlRef }
                />
            </FormControl>
        </Box>
    );
}

SourceIdInputValue.propTypes = {
    applyValue: PropTypes.func.isRequired,
    focusElementRef: PropTypes.shape({
        current: PropTypes.any,
    }),
    item: PropTypes.shape({
        columnField: PropTypes.string.isRequired,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        operatorValue: PropTypes.string,
        value: PropTypes.any,
    }).isRequired,
};

SourceIdInputValue.defaultProps = {
    focusElementRef: {},
};

export const sourceIdDataGridOperator = [
    {
        label: 'Equals',
        value: '==',
        getApplyFilterFn: () => {
            throw Error('sourceIdDataGridOperator is not implemented for client side');
        },
        InputComponent: SourceIdInputValue,
        InputComponentProps: { type: 'number' },
    },
];
