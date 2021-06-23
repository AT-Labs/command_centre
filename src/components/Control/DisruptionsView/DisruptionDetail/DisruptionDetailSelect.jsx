import React from 'react';
import PropTypes from 'prop-types';

import { FormGroup, Input, Label } from 'reactstrap';
import { IoIosArrowDropdown } from 'react-icons/io';

export const DisruptionDetailSelect = (props) => {
    const { value, options, label, id, disabled, onChange } = props;
    return (
        <FormGroup className={ `${props.className}` }>
            <Label for={ id }><span className="font-size-md font-weight-bold">{ label }</span></Label>
            <Input type="select"
                className="w-100 border border-dark disruption-creation__wizard-select-details__select position-relative"
                disabled={ disabled }
                id={ id }
                value={ value }
                onChange={ e => onChange(e.currentTarget.value) }>
                {options.map((item) => {
                    if (item.label !== undefined) {
                        return <option key={ item.label } value={ item.value || '' }>{ item.label }</option>;
                    }
                    return (<option key={ item } value={ item }>{ item }</option>);
                })}
            </Input>
            <IoIosArrowDropdown className="disruption-creation__wizard-select-details__icon position-absolute" size={ 22 } />
        </FormGroup>
    );
};

DisruptionDetailSelect.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.node,
    ]).isRequired,
    value: PropTypes.any,
    options: PropTypes.array.isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
    className: PropTypes.string,
};

DisruptionDetailSelect.defaultProps = {
    value: null,
    className: 'mt-2',
    disabled: false,
};
