import PropTypes from 'prop-types';
import React from 'react';
import { FormGroup, Label } from 'reactstrap';

const DisruptionLabelAndText = props => (
    <FormGroup className={ props.className }>
        <Label for={ props.id }><span className="font-size-md font-weight-bold">{ props.label }</span></Label>
        <div id={ props.id } className="form-control-plaintext">{ props.text }</div>
    </FormGroup>
);

DisruptionLabelAndText.propTypes = {
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    className: PropTypes.string,
};

DisruptionLabelAndText.defaultProps = {
    className: 'mt-2',
};

export default DisruptionLabelAndText;
