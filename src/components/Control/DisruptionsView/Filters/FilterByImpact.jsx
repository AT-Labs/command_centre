import React from 'react';
import { get } from 'lodash-es';

import PropTypes from 'prop-types';
import ControlSearch from '../../Common/ControlSearch/ControlSearch';
import { useAlertEffects } from '../../../../utils/control/alert-cause-effect';

const FilterByImpact = (props) => {
    const impacts = useAlertEffects();

    FilterByImpact.propTypes = {
        selectedOption: PropTypes.string,
        onSelection: PropTypes.func.isRequired,
        className: PropTypes.string,
        id: PropTypes.string,
        title: PropTypes.string,
        placeholder: PropTypes.string,
        updateOnPropsValueChange: PropTypes.bool,
    };

    FilterByImpact.defaultProps = {
        className: '',
        id: 'impact-filter',
        title: '',
        placeholder: 'Select option',
        selectedOption: null,
        updateOnPropsValueChange: false,
    };

    const onInputValueChange = (value) => { if (!value) props.onSelection({ value: '', label: '' }); };

    const getSelectedOption = () => impacts.find(option => option.value === props.selectedOption);

    return (
        <ControlSearch
            id={ props.id }
            inputId={ `${props.id}-input` }
            className={ props.className }
            label={ props.title }
            data={ impacts }
            pathToProperty="label"
            placeholder={ props.placeholder }
            onSelection={ selectedOption => props.onSelection(selectedOption) }
            onInputValueChange={ onInputValueChange }
            value={ get(getSelectedOption(), 'label') }
            updateOnPropsValueChange={ props.updateOnPropsValueChange } />
    );
};

export default FilterByImpact;
