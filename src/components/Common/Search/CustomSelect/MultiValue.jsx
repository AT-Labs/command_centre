import React from 'react';
import { components } from 'react-select';

const MultiValue = React.forwardRef((props, ref) => (
    <div ref={ ref }>
        <components.MultiValue { ...props } />
    </div>
));

export default MultiValue;
