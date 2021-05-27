import React from 'react';
import Select from 'react-select';

import SelectContainer from './SelectContainer';
import GroupHeading from './GroupHeading';
import Option from './Option';
import Control from './Control';
import MultiValue from './MultiValue';
import MultiValueLabel from './MultiValueLabel';
import MultiValueRemove from './MultiValueRemove';
import ValueContainer from './ValueContainer';

const CustomSelect = props => (
    <Select { ...props }
        components={ {
            SelectContainer,
            Control,
            MultiValue,
            MultiValueLabel,
            MultiValueRemove,
            ValueContainer,
            GroupHeading,
            Option,
            DropdownIndicator: null,
        } }
    />
);

export default CustomSelect;
