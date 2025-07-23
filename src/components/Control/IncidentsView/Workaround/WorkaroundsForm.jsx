import PropTypes from 'prop-types';
import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import RadioButtons from '../../../Common/RadioButtons/RadioButtons';
import { DISRUPTION_TYPE, WORKAROUND_TYPES } from '../../../../types/disruptions-types';
import { generateWorkaroundsUIOptions, mergeWorkarounds, isWorkaroundTypeDisable } from '../../../../utils/control/disruption-workarounds';
import WorkaroundInput from './WorkaroundInput';
import './styles.scss';

export const WorkaroundsForm = forwardRef((props, ref) => {
    const { disruptionType } = props.disruption;
    const [workarounds, setWorkarounds] = useState(props.disruption.workarounds || []);
    const affectedEntities = [...(props.disruption.affectedEntities.affectedRoutes || []), ...(props.disruption.affectedEntities.affectedStops || [])];
    const defaultAllWorkaroundsValue = Object.keys(WORKAROUND_TYPES).map(type => ({ [type]: [] }));
    const [checkedWorkaroundType, setCheckedWorkaroundType] = useState(workarounds?.length ? workarounds[0].type : WORKAROUND_TYPES.all.key);
    const [allWorkarounds, setAllWorkarounds] = useState({ ...defaultAllWorkaroundsValue, [checkedWorkaroundType]: workarounds });

    const workaroundTypesRadioOptions = Object.keys(WORKAROUND_TYPES).map(type => ({
        key: WORKAROUND_TYPES[type].key,
        value: WORKAROUND_TYPES[type].key === WORKAROUND_TYPES.all.key ? `${WORKAROUND_TYPES[type].value} ${disruptionType}` : WORKAROUND_TYPES[type].value,
        disabled: WORKAROUND_TYPES[type].key === WORKAROUND_TYPES.all.key ? false : isWorkaroundTypeDisable(affectedEntities, disruptionType, WORKAROUND_TYPES[type].key),
    }));

    const updateWorkaroundsInDisruption = (workaroundsForCheckedType) => {
        setWorkarounds(workaroundsForCheckedType);
    };

    const cancelForm = () => {
        setWorkarounds([]);
    };

    const saveForm = () => {
        let filteredWorkarounds;
        if (workarounds) {
            filteredWorkarounds = workarounds.filter(w => w.type === WORKAROUND_TYPES.all.key || affectedEntities.some(entity => (w.stopCode && entity.stopCode === w.stopCode)
            || (w.routeShortName && entity.routeShortName === w.routeShortName)));
        }
        props.onWorkaroundUpdate(props.disruption.key, filteredWorkarounds || workarounds);
        setCheckedWorkaroundType(WORKAROUND_TYPES.all.key);
    };

    useEffect(() => {
        if (props.disruption) {
            const type = props.disruption.workarounds?.length ? props.disruption.workarounds[0].type : WORKAROUND_TYPES.all.key;
            setCheckedWorkaroundType(type);
            setWorkarounds(props.disruption.workarounds || []);
            setAllWorkarounds({ ...defaultAllWorkaroundsValue, [type]: props.disruption.workarounds });
        }
    }, [props.disruption.key, props.disruption]);

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
            <WorkaroundInput { ...workaroundOption } onWorkaroundUpdate={ handleWorkaroundUpdate } disabled={ props.readOnly } />
        ));
    };

    useImperativeHandle(ref, () => ({
        saveForm,
        cancelForm,
    }));

    return (
        <div className="pt-3">
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
});

WorkaroundsForm.propTypes = {
    disruption: PropTypes.shape({
        key: PropTypes.string,
        disruptionType: PropTypes.string,
        affectedEntities: PropTypes.object,
        workarounds: PropTypes.array,
    }),
    onWorkaroundUpdate: PropTypes.func,
    readOnly: PropTypes.bool,
};

WorkaroundsForm.defaultProps = {
    disruption: {
        disruptionType: DISRUPTION_TYPE.ROUTES,
        affectedEntities: {},
        workarounds: [],
    },
    onWorkaroundUpdate: () => { /**/ },
    readOnly: false,
};

export default WorkaroundsForm;
