import React from 'react';
import { components } from 'react-select';
import { CgClose } from 'react-icons/cg';

const MultiValueRemove = props => (
    <components.MultiValueRemove { ...props }>
        <CgClose />
    </components.MultiValueRemove>
);

export default MultiValueRemove;
