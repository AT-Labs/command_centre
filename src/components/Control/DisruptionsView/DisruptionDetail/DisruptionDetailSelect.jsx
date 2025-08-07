import React from 'react';
import PropTypes from 'prop-types';

import { FormGroup, Input, Label, FormFeedback } from 'reactstrap';
import { IoIosArrowDropdown } from 'react-icons/io';
import '../../IncidentsView/style.scss';

export const DisruptionDetailSelect = (props) => {
    const { value, options, label, id, disabled, onChange, invalid, feedback, onBlur, disabledClassName } = props;
    const inputClassName = props.useParentChildIncident ? 'incident-creation__wizard-select-details__select'
        : 'disruption-creation__wizard-select-details__select';
    return (
        <FormGroup className={ `${props.className} position-relative` }>
            <Label for={ id }><span className="font-size-md font-weight-bold">{ label }</span></Label>
            <div className={ `${disabled ? disabledClassName : ''}` }>
                <Input type="select"
                    className={ `w-100 border border-dark ${inputClassName} position-relative` }
                    disabled={ disabled }
                    id={ id }
                    value={ value }
                    invalid={ invalid }
                    onBlur={ e => onBlur(e.currentTarget.value) }
                    onChange={ e => onChange(e.currentTarget.value) }>
                    {options.map((item) => {
                        if (item.label !== undefined) {
                            return <option key={ item.label } value={ item.value || '' }>{ item.label }</option>;
                        }
                        return (<option key={ item } value={ item }>{ item }</option>);
                    })}
                </Input>
            </div>
            { !invalid && (
                <IoIosArrowDropdown className="disruption-creation__wizard-select-details__icon position-absolute" size={ 22 } />
            )}
            <FormFeedback>{ feedback }</FormFeedback>
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
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    disabled: PropTypes.bool,
    className: PropTypes.string,
    invalid: PropTypes.bool,
    feedback: PropTypes.string,
    useParentChildIncident: PropTypes.bool,
    disabledClassName: PropTypes.string,
};

DisruptionDetailSelect.defaultProps = {
    value: null,
    className: 'mt-2',
    disabled: false,
    invalid: false,
    feedback: '',
    onBlur: () => {},
    onChange: () => {},
    useParentChildIncident: false,
    disabledClassName: '',
};
