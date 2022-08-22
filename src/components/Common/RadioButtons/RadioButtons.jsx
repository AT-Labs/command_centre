import React from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Label, Input } from 'reactstrap';

const RadioButtons = (props) => {
    const radioButtons = () => props.itemOptions.map(button => (
        <Label key={ button.key } className="ml-5 mb-0">
            <Input
                type="radio"
                className="ml-0"
                onChange={ (checked) => {
                    if (checked) props.onChange(button.key);
                } }
                checked={ props.checkedKey === button.key }
                disabled={ props.disabled || button.disabled }
            />
            <span className="pl-4">{button.value}</span>
        </Label>
    ));

    return (
        <FormGroup className={ props.formGroupClass }>
            {props.title && (
                <Label className="mb-0">
                    <span className="font-size-md font-weight-bold">{props.title}</span>
                </Label>
            )}
            { radioButtons() }
        </FormGroup>
    );
};

RadioButtons.propTypes = {
    title: PropTypes.string,
    checkedKey: PropTypes.string.isRequired,
    onChange: PropTypes.func,
    itemOptions: PropTypes.array.isRequired,
    formGroupClass: PropTypes.string,
    disabled: PropTypes.bool,
};

RadioButtons.defaultProps = {
    title: '',
    formGroupClass: '',
    disabled: true,
    onChange: null,
};

export default RadioButtons;
