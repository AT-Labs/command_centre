import React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import NativeSelect from '@mui/material/NativeSelect';

const DropdownInputValue = (props) => {
    const { item, applyValue, focusElementRef, optionList } = props;

    const ratingRef = React.useRef(null);

    React.useImperativeHandle(focusElementRef, () => ({
        focus: () => {
            ratingRef.current
                .querySelector('select')
                .focus();
        },
    }));

    const handleFilterChange = (event) => {
        applyValue({ ...item, value: event.target.value });
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
            <FormControl>
                <InputLabel variant="standard" htmlFor="uncontrolled-native">
                    Choice
                </InputLabel>

                <NativeSelect
                    placeholder="Select a value"
                    labelid="demo-simple-select-label"
                    id="demo-simple-select"
                    value={ Number(item.value) }
                    label="Choice"
                    onChange={ handleFilterChange }
                    ref={ ratingRef }
                >
                    <option value="">---</option>
                    {optionList.map(option => <option value={ option }>{option}</option>)}
                </NativeSelect>
            </FormControl>
        </Box>
    );
};

DropdownInputValue.propTypes = {
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
    optionList: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default DropdownInputValue;
