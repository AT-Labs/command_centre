import { useState, useEffect } from 'react';
import { getAlertCauses, getAlertEffects } from '../transmitters/command-centre-config-api';
import { DEFAULT_CAUSE, DEFAULT_IMPACT } from '../../types/disruption-cause-and-effect';
import { fetchFromLocalStorage, CAUSES_CACHE_KEY, EFFECTS_CACHE_KEY, CAUSES_EFFECTS_CACHE_EXPIRY } from '../common/local-storage-helper';

export const useAlertCauses = () => {
    const [causes, setCauses] = useState([DEFAULT_CAUSE]);

    useEffect(() => {
        const fetchCauses = async () => {
            const causesList = await fetchFromLocalStorage(CAUSES_CACHE_KEY, CAUSES_EFFECTS_CACHE_EXPIRY, getAlertCauses);
            if (causesList) {
                causesList.unshift(DEFAULT_CAUSE);
                setCauses(causesList);
            } else {
                setCauses([DEFAULT_CAUSE]);
            }
        };

        fetchCauses();
    }, []);

    return causes;
};

export const useAlertEffects = () => {
    const [effects, setEffects] = useState([DEFAULT_IMPACT]);

    useEffect(() => {
        const fetchEffects = async () => {
            const effectsList = await fetchFromLocalStorage(EFFECTS_CACHE_KEY, CAUSES_EFFECTS_CACHE_EXPIRY, getAlertEffects);
            if (effectsList) {
                effectsList.unshift(DEFAULT_IMPACT);
                setEffects(effectsList);
            } else {
                setEffects([DEFAULT_IMPACT]);
            }
        };

        fetchEffects();
    }, []);

    return effects;
};
