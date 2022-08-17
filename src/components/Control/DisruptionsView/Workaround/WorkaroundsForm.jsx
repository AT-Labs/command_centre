import PropTypes from 'prop-types';
import React, { useState, useEffect } from 'react';
import RadioButtons from '../../../Common/RadioButtons/RadioButtons';
import { DISRUPTION_TYPE, WORKAROUND_TYPES } from '../../../../types/disruptions-types';
import { generateWorkaroundsUIOptions, mergeWorkarounds, updateWorkaroundsByAffectedEntities, isWorkaroundTypeDisable } from '../../../../utils/control/disruption-workarounds';
import WorkaroundInput from './WorkaroundInput';
import './styles.scss';

export const WorkaroundsForm = (props) => {
    const { disruptionType, workarounds } = props.disruption;
    const affectedEntities = props.disruption.affectedEntities || [];

    const defaultAllWorkaroundsValue = Object.keys(WORKAROUND_TYPES).map(type => ({ [type]: [] }));

    const [checkedWorkaroundType, setCheckedWorkaroundType] = useState(workarounds?.length ? workarounds[0].type : WORKAROUND_TYPES.all.key);
    const [allWorkarounds, setAllWorkarounds] = useState({ ...defaultAllWorkaroundsValue, [checkedWorkaroundType]: workarounds });

    const workaroundTypesRadioOptions = Object.keys(WORKAROUND_TYPES).map(type => ({
        key: WORKAROUND_TYPES[type].key,
        value: WORKAROUND_TYPES[type].key === WORKAROUND_TYPES.all.key ? `${WORKAROUND_TYPES[type].value} ${disruptionType}` : WORKAROUND_TYPES[type].value,
        disabled: WORKAROUND_TYPES[type].key === WORKAROUND_TYPES.all.key ? false : isWorkaroundTypeDisable(affectedEntities, disruptionType, WORKAROUND_TYPES[type].key),
    }));

    const updateWorkaroundsInDisruption = (workroundsForCheckedType) => {
        props.onDataUpdate('workarounds', workroundsForCheckedType);
    };

    useEffect(() => {
        updateWorkaroundsInDisruption(updateWorkaroundsByAffectedEntities(affectedEntities, workarounds, disruptionType, checkedWorkaroundType));
    }, [JSON.stringify(affectedEntities)]);

    const handleWorkaroundTypeChange = (workaroundType) => {
        setCheckedWorkaroundType(workaroundType);
        updateWorkaroundsInDisruption(allWorkarounds[workaroundType]);
    };

    const handleWorkaroundUpdate = (workaroundsInOneGroup) => {
        const workroundsForCheckedType = mergeWorkarounds(workarounds, workaroundsInOneGroup, disruptionType, checkedWorkaroundType);
        setAllWorkarounds({ ...allWorkarounds, [checkedWorkaroundType]: workroundsForCheckedType });
        updateWorkaroundsInDisruption(workroundsForCheckedType);
    };

    const renderWorkaroundItems = () => {
        const workaroundOptions = generateWorkaroundsUIOptions(affectedEntities, allWorkarounds[checkedWorkaroundType], disruptionType, checkedWorkaroundType);
        return workaroundOptions.map(workaroundOption => (
            <WorkaroundInput { ...workaroundOption } onWorkaroundUpdate={ handleWorkaroundUpdate } disabled={ props.readOnly } />
        ));
    };

    return (
        <div className="">
            <RadioButtons
                itemOptions={ workaroundTypesRadioOptions }
                checkedKey={ checkedWorkaroundType }
                formGroupClass="workaround-types"
                disabled={ props.readOnly }
                onChange={ handleWorkaroundTypeChange }
            />
            <div>
                { renderWorkaroundItems() }
            </div>
        </div>
    );
};

WorkaroundsForm.propTypes = {
    disruption: PropTypes.shape({
        disruptionType: PropTypes.string,
        affectedEntities: PropTypes.array,
        workarounds: PropTypes.array,
    }),
    onDataUpdate: PropTypes.func,
    readOnly: PropTypes.bool,
};

WorkaroundsForm.defaultProps = {
    disruption: {
        disruptionType: DISRUPTION_TYPE.ROUTES,
        affectedEntities: [],
        workarounds: [],
    },
    onDataUpdate: () => { /**/ },
    readOnly: false,
};

export default WorkaroundsForm;
