import React from 'react';
import { upperFirst, lowerCase, map, words, get } from 'lodash-es';

import PropTypes from 'prop-types';
import ControlSearch from '../ControlSearch/ControlSearch';

const StandardFilter = (props) => {
    StandardFilter.propTypes = {
        selectedOption: PropTypes.string.isRequired,
        onSelection: PropTypes.func.isRequired,
        options: PropTypes.array.isRequired,
        className: PropTypes.string,
        id: PropTypes.string,
        title: PropTypes.string,
        placeholder: PropTypes.string,
        updateOnPropsValueChange: PropTypes.bool,
    };

    StandardFilter.defaultProps = {
        className: '',
        id: 'standard-filter',
        title: '',
        placeholder: 'Select option',
        updateOnPropsValueChange: false,
    };

    const onInputValueChange = (value) => { if (!value) props.onSelection({ value: '', label: '' }); };

    const getOptions = () => map(props.options, value => ({
        value,
        label: words(lowerCase(value)).map(word => upperFirst(word)).join(' '),
    }));

    const getSelectedOption = () => getOptions().find(option => option.value === props.selectedOption);

    return (
        <ControlSearch
            id={ props.id }
            inputId={ `${props.id}-input` }
            className={ props.className }
            label={ props.title }
            data={ getOptions() }
            pathToProperty="label"
            placeholder={ props.placeholder }
            onSelection={ selectedOption => props.onSelection(selectedOption) }
            onInputValueChange={ onInputValueChange }
            value={ get(getSelectedOption(), 'label') }
            updateOnPropsValueChange={ props.updateOnPropsValueChange } />
    );
};

export default StandardFilter;
