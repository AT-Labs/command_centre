import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import RadioButtons from '../../../Common/RadioButtons/RadioButtons';
import { DISRUPTION_TYPE, WORKAROUND_TYPES } from '../../../../types/disruptions-types';
import { generateWorkaroundsUIOptions, mergeWorkarounds, updateWorkaroundsByAffectedEntities, isWorkaroundTypeDisable } from '../../../../utils/control/disruption-workarounds';
import WorkaroundInput from './WorkaroundInput';
import './styles.scss';

export const WorkaroundsForm = (props) => {
    const { disruptionType, workarounds } = props.disruption;
    console.warn('WorkaroundsForm disruption', props.disruption);
    const affectedEntities = [...props.disruption.affectedEntities.affectedRoutes, ...props.disruption.affectedEntities.affectedStops] || [];

    const defaultAllWorkaroundsValue = Object.keys(WORKAROUND_TYPES).map(type => ({ [type]: [] }));

    const [checkedWorkaroundType, setCheckedWorkaroundType] = useState(workarounds?.length ? workarounds[0].type : WORKAROUND_TYPES.all.key);
    const [allWorkarounds, setAllWorkarounds] = useState({ ...defaultAllWorkaroundsValue, [checkedWorkaroundType]: workarounds });

    const workaroundTypesRadioOptions = Object.keys(WORKAROUND_TYPES).map(type => ({
        key: WORKAROUND_TYPES[type].key,
        value: WORKAROUND_TYPES[type].key === WORKAROUND_TYPES.all.key ? `${WORKAROUND_TYPES[type].value} ${disruptionType}` : WORKAROUND_TYPES[type].value,
        disabled: WORKAROUND_TYPES[type].key === WORKAROUND_TYPES.all.key ? false : isWorkaroundTypeDisable(affectedEntities, disruptionType, WORKAROUND_TYPES[type].key),
    }));

    const updateWorkaroundsInDisruption = (workaroundsForCheckedType) => {
        console.warn('updateWorkaroundsInDisruption', workaroundsForCheckedType);
        props.onWorkaroundUpdate(props.disruption.key, workaroundsForCheckedType);
        // props.onWorkaroundUpdate('workarounds', workaroundsForCheckedType);
    };

    useEffect(() => {
        updateWorkaroundsInDisruption(updateWorkaroundsByAffectedEntities(affectedEntities, workarounds, disruptionType, checkedWorkaroundType));
    }, [JSON.stringify(affectedEntities)]);

    const handleWorkaroundTypeChange = (workaroundType) => {
        setCheckedWorkaroundType(workaroundType);
        updateWorkaroundsInDisruption(allWorkarounds[workaroundType]);
    };

    const handleWorkaroundUpdate = (workaroundsInOneGroup) => {
        const workaroundsForCheckedType = mergeWorkarounds(workarounds, workaroundsInOneGroup, disruptionType, checkedWorkaroundType);
        setAllWorkarounds({ ...allWorkarounds, [checkedWorkaroundType]: workaroundsForCheckedType });
        updateWorkaroundsInDisruption(workaroundsForCheckedType);
    };

    const renderWorkaroundItems = () => {
        const workaroundOptions = generateWorkaroundsUIOptions(affectedEntities, allWorkarounds[checkedWorkaroundType], disruptionType, checkedWorkaroundType);
        return workaroundOptions.map(workaroundOption => (
            <WorkaroundInput { ...workaroundOption } disruptionKey={ props.disruption.key } onWorkaroundUpdate={ handleWorkaroundUpdate } disabled={ props.readOnly } />
        ));
    };

    return (
        <div>
            <RadioButtons
                itemOptions={ workaroundTypesRadioOptions }
                checkedKey={ checkedWorkaroundType }
                formGroupClass="workaround-types d-flex justify-content-center my-2"
                disabled={ props.readOnly }
                onChange={ handleWorkaroundTypeChange }
            />
            <div className="row">
                <div className="col">
                    { renderWorkaroundItems() }
                </div>
            </div>
        </div>
    );
};

WorkaroundsForm.propTypes = {
    disruption: PropTypes.shape({
        key: PropTypes.string,
        disruptionType: PropTypes.string,
        // affectedEntities: PropTypes.array,
        affectedEntities: PropTypes.object,
        workarounds: PropTypes.array,
    }),
    onWorkaroundUpdate: PropTypes.func,
    readOnly: PropTypes.bool,
};

WorkaroundsForm.defaultProps = {
    disruption: {
        disruptionType: DISRUPTION_TYPE.ROUTES,
        // affectedEntities: [],
        affectedEntities: {},
        workarounds: [],
    },
    onWorkaroundUpdate: () => { /**/ },
    readOnly: false,
};

export default WorkaroundsForm;
