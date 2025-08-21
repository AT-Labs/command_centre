import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { FormControl, Input, InputAdornment, InputLabel } from '@mui/material';

const prefixString = 'CCD';

const ParentSourceIdInputValue = (props) => {
    const { item, applyValue, focusElementRef } = props;
    const value = item.value ?? '';

    const controlRef = React.useRef(null);
    React.useImperativeHandle(focusElementRef, () => ({
        focus: () => {
            controlRef.current
                .querySelector(`input[value="${value || ''}"]`)
                .focus();
        },
    }));

    const handleFilterChange = (event) => {
        applyValue({ ...item, value: Number(event.target.value) });
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
                <InputLabel htmlFor="parentSourceId-input">Value</InputLabel>
                <Input
                    id="parentSourceId-input"
                    type="number"
                    value={ value }
                    onChange={ handleFilterChange }
                    startAdornment={ <InputAdornment position="start">{ prefixString }</InputAdornment> }
                    ref={ controlRef }
                />
            </FormControl>
        </Box>
    );
};

ParentSourceIdInputValue.propTypes = {
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

ParentSourceIdInputValue.defaultProps = {
    focusElementRef: {},
};

export const ParentSourceIdDataGridOperator = [
    {
        label: 'Equals',
        value: '==',
        getApplyFilterFn: (filterItem) => {
            if (!filterItem.columnField || !filterItem.value || !filterItem.operatorValue) {
                return null;
            }

            return params => params.row.disruptionId === parseInt(filterItem.value.id, 10);
        },
        InputComponent: ParentSourceIdInputValue,
        InputComponentProps: { type: 'number' },
    },
];
