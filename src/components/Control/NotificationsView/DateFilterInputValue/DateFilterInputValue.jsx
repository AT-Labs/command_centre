import React from 'react';
import PropTypes from 'prop-types';
import DateTimePicker from '@mui/lab/DateTimePicker';
import TextField from '@mui/material/TextField';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import Box from '@mui/material/Box';

const DateFilterInputValue = (props) => {
    const { item, applyValue, focusElementRef } = props;

    const dateRef = React.useRef(null);

    React.useImperativeHandle(focusElementRef, () => ({
        focus: () => {
            dateRef.current
                .querySelector('input')
                .focus();
        },
    }));

    const handleFilterChange = (newValue) => {
        applyValue({ ...item, value: newValue });
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
            <LocalizationProvider dateAdapter={ AdapterDateFns }>
                <DateTimePicker
                    label="Date&Time picker"
                    value={ item.value }
                    onChange={ handleFilterChange }
                    renderInput={ params => <TextField { ...params } /> }
                    ref={ dateRef }
                />
            </LocalizationProvider>
        </Box>
    );
};

DateFilterInputValue.propTypes = {
    applyValue: PropTypes.func.isRequired,
    focusElementRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({
            current: PropTypes.any.isRequired,
        }),
    ]).isRequired,
    item: PropTypes.shape({
        columnField: PropTypes.string.isRequired,
        id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        operatorValue: PropTypes.string,
        value: PropTypes.any,
    }).isRequired,
};

export default DateFilterInputValue;
