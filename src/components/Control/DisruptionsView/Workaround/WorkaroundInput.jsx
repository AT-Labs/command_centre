import PropTypes from 'prop-types';
import React from 'react';
import { isEmpty } from 'lodash-es';
import { FormGroup, Label, Input } from 'reactstrap';
import { WORKAROUND_TYPES } from '../../../../types/disruptions-types';

const WorkaroundInput = (props) => {
    const { label, workaroundText, helperText, workaroundKey, workaroundType, entities } = props;
    const handleWorkaroundUpdate = (event) => {
        const generatedWorkarounds = [];
        if (!isEmpty(event.target.value)) {
            if (workaroundType === WORKAROUND_TYPES.all.key) {
                generatedWorkarounds.push({ type: workaroundType, workaround: event.target.value });
            } else {
                entities.forEach(({ routeShortName, stopCode }) => {
                    generatedWorkarounds.push({ type: workaroundType, workaround: event.target.value, routeShortName, stopCode });
                });
            }
        }
        props.onWorkaroundUpdate({ key: workaroundKey, workarounds: generatedWorkarounds });
    };

    return (
        <FormGroup>
            <div className="row m-2">
                <Label for={ `disruption-workaround-${workaroundKey}` } className="col-3 text-center font-size-md align-self-center">
                    {label}
                </Label>
                <div className="col-9">
                    <Input
                        id={ `disruption-workaround-${workaroundKey}` }
                        className="border border-dark"
                        value={ workaroundText }
                        onChange={ handleWorkaroundUpdate }
                    />
                    <p className="text-muted"><small>{helperText}</small></p>
                </div>
            </div>
        </FormGroup>
    );
};

WorkaroundInput.propTypes = {
    onWorkaroundUpdate: PropTypes.func,
    label: PropTypes.string.isRequired,
    workaroundText: PropTypes.string.isRequired,
    workaroundType: PropTypes.string.isRequired,
    helperText: PropTypes.string.isRequired,
    workaroundKey: PropTypes.string.isRequired,
    entities: PropTypes.array,
};

WorkaroundInput.defaultProps = {
    onWorkaroundUpdate: () => { /**/ },
    entities: [],
};

export default WorkaroundInput;
