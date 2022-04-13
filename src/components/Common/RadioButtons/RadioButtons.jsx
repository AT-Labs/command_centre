import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';

const RadioButtons = (props) => {
    const radioButtons = () => props.keyValues.map(button => (
        <Label key={ button.key } className="ml-5 mb-0">
            <Input
                type="radio"
                className="ml-0"
                onChange={ (checked) => {
                    if (checked) props.onChange(button.key);
                } }
                checked={ props.checkedKey === button.key }
                disabled={ props.disabled }
            />
            <span className="pl-4">{button.value}</span>
        </Label>
    ));

    return (
        <FormGroup className={ props.formGroupClass }>
            <Label className="mb-0">
                <span className="font-size-md font-weight-bold">{props.title}</span>
            </Label>
            { radioButtons() }
        </FormGroup>
    );
};

RadioButtons.propTypes = {
    title: PropTypes.string.isRequired,
    checkedKey: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    keyValues: PropTypes.array.isRequired,
    formGroupClass: PropTypes.string,
    disabled: PropTypes.bool,
};

RadioButtons.defaultProps = {
    formGroupClass: '',
    disabled: true,
    onChange: null,
};

export default RadioButtons;
