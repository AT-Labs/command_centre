import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { FormControl } from '@mui/material';
import OmniSearch from '../../../OmniSearch/OmniSearch';
import SearchTheme from '../search-theme';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';

function OmniSearchInputValue(props) {
    const { item, applyValue, searchInCategory, inputValue } = props;

    const selectionHandlers = () => {
        const handlers = {};
        searchInCategory.forEach((category) => {
            handlers[category] = entity => applyValue({ ...item, value: entity });
        });
        return handlers;
    };

    const clearHandlers = () => {
        const handlers = {};
        searchInCategory.forEach((category) => {
            handlers[category] = () => applyValue({ ...item, value: '' });
        });
        return handlers;
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
                <OmniSearch
                    theme={ SearchTheme }
                    value={ inputValue }
                    placeholder="Search for a stop"
                    searchInCategory={ props.searchInCategory }
                    selectionHandlers={ selectionHandlers() }
                    clearHandlers={ clearHandlers() }
                    isSelectedValueShown
                />
            </FormControl>
        </Box>
    );
}

OmniSearchInputValue.propTypes = {
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
    searchInCategory: PropTypes.array.isRequired,
    inputValue: PropTypes.string.isRequired,
};

OmniSearchInputValue.defaultProps = {
    focusElementRef: {},
};

export const omniSearchDataGridOperator = [
    {
        label: 'Equals',
        value: '==',
        getApplyFilterFn: () => {},
        InputComponent: OmniSearchInputValue,
        InputComponentProps: {
            searchInCategory: [SEARCH_RESULT_TYPE.STOP.type],
            inputValue: '',
        },
    },
];
