import * as React from 'react';
import PropTypes from 'prop-types';
import { noop } from 'lodash-es';
import Box from '@mui/material/Box';
import { FormControl } from '@mui/material';
import OmniSearch from '../../../OmniSearch/OmniSearch';
import SearchTheme from '../search-theme';
import SEARCH_RESULT_TYPE from '../../../../types/search-result-types';

function OmniSearchInputValue(props) {
    const { item, applyValue, searchInCategory } = props;
    const selectionHandlers = () => {
        const handlers = {};
        searchInCategory.forEach((category) => {
            handlers[category] = entity => applyValue({ ...item, value: entity });
        });
        return handlers;
    };

    // do nothing, we use the clear call back
    const clearHandlers = () => {
        const handlers = {};
        searchInCategory.forEach((category) => {
            handlers[category] = noop;
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
                    value={ item.value?.text }
                    placeholder="Search for a stop"
                    searchInCategory={ props.searchInCategory }
                    selectionHandlers={ selectionHandlers() }
                    clearHandlers={ clearHandlers() }
                    onClearCallBack={ () => applyValue({ ...item, value: '' }) }
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
};

OmniSearchInputValue.defaultProps = {
    focusElementRef: {},
};

export const StopSearchDataGridOperators = [
    {
        label: 'Equals',
        value: '==',
        getApplyFilterFn: () => {},
        InputComponent: OmniSearchInputValue,
        InputComponentProps: {
            searchInCategory: [SEARCH_RESULT_TYPE.STOP.type],
        },
    },
];
